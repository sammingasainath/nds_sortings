import { LLMConfig, LLMProviderInterface, LLMRequest, LLMResponse } from '../types';

// Helper function to list available models (for debugging)
const listGeminiModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models.map((model: any) => model.name);
  } catch (error) {
    console.error('Error listing Gemini models:', error);
    return [];
  }
};

export const getGeminiProvider = (config: LLMConfig): LLMProviderInterface => {
  // Use the model as provided, or default to a safe fallback
  const model = config.model || 'gemini-1.5-pro';
  const apiKey = config.apiKey;

  // REMOVE automatic model listing - only do this during explicit validation
  // listGeminiModels(apiKey).then(models => {
  //   console.log('Available Gemini models:', models);
  // }).catch(error => {
  //   console.error('Failed to list Gemini models:', error);
  // });

  return {
    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
      try {
        // Convert from OpenAI message format to Gemini format
        const geminiMessages = request.messages.map(msg => {
          if (msg.role === 'system') {
            // Gemini doesn't have system messages, so we'll prepend it to the first user message
            return null;
          }
          return {
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          };
        }).filter(Boolean);

        // Add system message to the first user message if it exists
        const systemMessage = request.messages.find(msg => msg.role === 'system');
        if (systemMessage && geminiMessages.length > 0 && geminiMessages[0].role === 'user') {
          geminiMessages[0].parts[0].text = `${systemMessage.content}\n\n${geminiMessages[0].parts[0].text}`;
        }

        // Ensure we have at least one message
        if (geminiMessages.length === 0) {
          throw new Error('No valid messages to send to Gemini API');
        }

        // Format the API URL correctly - prepend 'models/' if not already present
        const formattedModel = model.startsWith('models/') ? model : `models/${model}`;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${formattedModel}:generateContent?key=${apiKey}`;
        
        console.log(`Using Gemini model: ${model}`);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxTokens || 1000
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Gemini API error details:', errorData);
          throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        // Extract the response text
        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('No response from Gemini API');
        }
        
        const content = data.candidates[0].content.parts[0].text;
        
        return {
          content,
          // Gemini doesn't provide token usage information in the same way
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
          }
        };
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
      }
    },

    async validateApiKey(apiKey: string): Promise<boolean> {
      try {
        // List models during validation and log them for debugging
        const models = await listGeminiModels(apiKey);
        console.log('Available Gemini models:', models);
        
        // Check if the response contains models
        return Array.isArray(models) && models.length > 0;
      } catch (error) {
        console.error('Error validating Gemini API key:', error);
        return false;
      }
    }
  };
}; 
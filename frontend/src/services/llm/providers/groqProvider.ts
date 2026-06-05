import { LLMConfig, LLMProviderInterface, LLMRequest, LLMResponse } from '../types';

export const getGroqProvider = (config: LLMConfig): LLMProviderInterface => {
  const apiKey = config.apiKey;

  return {
    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
      try {
        console.log('Sending request to GROQ API:', {
          model: config.model || 'mixtral-8x7b-32768',
          messages: request.messages,
        });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: config.model || 'mixtral-8x7b-32768',
            messages: request.messages,
            temperature: request.temperature || 0.7,
            max_tokens: request.maxTokens || 1000
          })
        });

        console.log('GROQ API Response Status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`GROQ API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('Parsed GROQ API Response:', data);

        if (!data.choices?.[0]?.message?.content) {
          console.error('Unexpected GROQ API response format:', data);
          throw new Error('Invalid response format from GROQ API');
        }

        return {
          content: data.choices[0].message.content,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0
          }
        };
      } catch (error) {
        console.error('Error calling GROQ API:', error);
        if (error instanceof Error) {
          throw new Error(`GROQ API error: ${error.message}`);
        }
        throw new Error('Unknown error occurred while calling GROQ API');
      }
    },

    async validateApiKey(apiKey: string): Promise<boolean> {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        console.log('GROQ API Key Validation Response:', response.status, response.statusText);

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        return Array.isArray(data.data);
      } catch (error) {
        console.error('Error validating GROQ API key:', error);
        return false;
      }
    }
  };
}; 
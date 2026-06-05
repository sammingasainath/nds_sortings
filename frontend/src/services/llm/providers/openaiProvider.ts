import { LLMConfig, LLMProviderInterface, LLMRequest, LLMResponse } from '../types';

export const getOpenAIProvider = (config: LLMConfig): LLMProviderInterface => {
  const model = config.model || 'gpt-3.5-turbo';
  const apiKey = config.apiKey;

  return {
    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: request.messages,
            temperature: request.temperature || 0.7,
            max_tokens: request.maxTokens || 1000
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        return {
          content: data.choices[0].message.content,
          usage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens
          }
        };
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
      }
    },

    async validateApiKey(apiKey: string): Promise<boolean> {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        return response.ok;
      } catch (error) {
        console.error('Error validating OpenAI API key:', error);
        return false;
      }
    }
  };
}; 
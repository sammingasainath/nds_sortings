import { 
  LLMConfig, 
  LLMProvider, 
  LLMProviderInterface, 
  LLMRequest, 
  LLMResponse,
  CollegeInsightRequest,
  ParameterSuggestionRequest,
  ResultExplanationRequest
} from './types';
import { getOpenAIProvider } from './providers/openaiProvider';
import { getGeminiProvider } from './providers/geminiProvider';
import { getGroqProvider } from './providers/groqProvider';
import { getOnDeviceProvider } from './providers/onDeviceProvider';
import { getCollegeInsightPrompt } from './prompts/collegeInsights';
import { getParameterHelpPrompt } from './prompts/parameterHelp';
import { getResultExplanationPrompt } from './prompts/resultExplanation';

// Provider factory
const getProvider = (config: LLMConfig): LLMProviderInterface => {
  // If no API key is provided, use on-device provider
  if (!config.apiKey && config.provider !== 'on-device') {
    console.log('No API key provided, falling back to on-device model');
    return getOnDeviceProvider({ ...config, provider: 'on-device' });
  }

  switch (config.provider) {
    case 'openai':
      return getOpenAIProvider(config);
    case 'gemini':
      return getGeminiProvider(config);
    case 'groq':
      return getGroqProvider(config);
    case 'on-device':
      return getOnDeviceProvider(config);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
};

// Main LLM service
export class LLMService {
  private config: LLMConfig;
  private provider: LLMProviderInterface;

  constructor(config: LLMConfig) {
    this.config = config;
    this.provider = getProvider(config);
  }

  // Update configuration and provider
  updateConfig(config: LLMConfig): void {
    this.config = config;
    this.provider = getProvider(config);
  }

  // Generate a response from the LLM
  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    try {
      return await this.provider.generateResponse(request);
    } catch (error) {
      console.error('Error generating LLM response:', error);
      throw error;
    }
  }

  // Validate API key
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      return await this.provider.validateApiKey(apiKey);
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }

  // Get insights about colleges
  async getCollegeInsights(request: CollegeInsightRequest): Promise<string> {
    const prompt = getCollegeInsightPrompt(request);
    const llmRequest: LLMRequest = {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that provides insights about colleges based on their parameters and sorting results.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    };

    const response = await this.generateResponse(llmRequest);
    return response.content;
  }

  // Get parameter suggestions based on user goals
  async getParameterSuggestions(request: ParameterSuggestionRequest): Promise<string[]> {
    const prompt = getParameterHelpPrompt(request);
    const llmRequest: LLMRequest = {
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that suggests college parameters based on user goals. Return ONLY an array of parameter codes in JSON format.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    };

    const response = await this.generateResponse(llmRequest);
    
    try {
      // First try to parse as JSON
      const content = response.content.trim();
      if (content.startsWith('[') && content.endsWith(']')) {
        return JSON.parse(content);
      }

      // Look for array-like patterns in the text
      const arrayMatch = content.match(/\[(.*?)\]/);
      if (arrayMatch && arrayMatch[1]) {
        const parameters = arrayMatch[1]
          .split(',')
          .map(p => p.trim().replace(/['"]/g, ''))
          .filter(p => p.length > 0 && request.availableParameters.includes(p));
        if (parameters.length > 0) {
          return parameters;
        }
      }

      // Extract parameters from text using quotes or word boundaries
      const parameterMatches = content.match(/["']([A-Z]+)["']|\b([A-Z]{2,})\b/g);
      if (parameterMatches) {
        const parameters = parameterMatches
          .map(p => p.replace(/['"]/g, ''))
          .filter(p => request.availableParameters.includes(p));
        if (parameters.length > 0) {
          return parameters;
        }
      }

      // Fallback: split by common delimiters and filter
      const parameters = content
        .split(/[,\n]/)
        .map(p => p.trim().replace(/[^A-Z]/g, ''))
        .filter(p => p.length > 0 && request.availableParameters.includes(p));

      return parameters;
    } catch (error) {
      console.error('Error parsing parameter suggestions:', error);
      console.log('Raw response content:', response.content);
      
      // Last resort: try to extract any uppercase parameter codes
      const fallbackParameters = response.content
        .match(/\b[A-Z]{2,}\b/g)
        ?.filter(p => request.availableParameters.includes(p)) || [];
      
      return fallbackParameters;
    }
  }

  // Get explanation for sorting results
  async getResultExplanation(request: ResultExplanationRequest): Promise<string> {
    try {
      const prompt = getResultExplanationPrompt(request);
      const llmRequest: LLMRequest = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant that explains college sorting results.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5
      };

      console.log('Sending explanation request to LLM provider:', {
        provider: this.config.provider,
        model: this.config.model,
        college: request.college,
        frontNumber: request.frontNumber
      });

      const response = await this.generateResponse(llmRequest);
      return response.content;
    } catch (error) {
      console.error('Error in getResultExplanation:', error);
      throw error;
    }
  }

  // Process natural language query about colleges
  async processNaturalLanguageQuery(query: string, context: any): Promise<string> {
    const llmRequest: LLMRequest = {
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that answers questions about colleges and their parameters. Provide concise and informative responses.' 
        },
        { 
          role: 'user', 
          content: `Context about available colleges and parameters:\n${JSON.stringify(context)}\n\nUser query: ${query}` 
        }
      ],
      temperature: 0.7
    };

    const response = await this.generateResponse(llmRequest);
    return response.content;
  }
} 
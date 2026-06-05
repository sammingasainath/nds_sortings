export type LLMProvider = 'openai' | 'gemini' | 'groq' | 'on-device';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProviderInterface {
  generateResponse(request: LLMRequest): Promise<LLMResponse>;
  validateApiKey(apiKey: string): Promise<boolean>;
}

export interface CollegeInsightRequest {
  colleges: string[];
  parameters: string[];
  sortingResults?: any[];
}

export interface ParameterSuggestionRequest {
  userGoal: string;
  availableParameters: string[];
}

export interface ResultExplanationRequest {
  college: string;
  frontNumber: number;
  parameters: string[];
} 
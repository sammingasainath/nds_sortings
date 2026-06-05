import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LLMService } from '@/services/llm/llmService';
import { LLMConfig, LLMProvider } from '@/services/llm/types';
import { 
  getApiKey, 
  getSelectedProvider, 
  getSelectedModel,
  saveApiKey,
  saveSelectedProvider,
  saveSelectedModel
} from '@/services/keyManagement';
import { useSummarizationStore } from '@/utils/summarization';

interface LLMContextType {
  llmService: LLMService | null;
  provider: LLMProvider;
  model: string;
  apiKey: string;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  hasSkippedConfig: boolean;
  setProvider: (provider: LLMProvider) => void;
  setModel: (model: string) => void;
  setApiKey: (apiKey: string) => void;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  clearError: () => void;
  initializeLLMService: () => Promise<boolean>;
  skipConfiguration: () => void;
  resetSkippedStatus: () => void;
}

const LLMContext = createContext<LLMContextType | undefined>(undefined);

// Create a custom hook for using the LLM context
function useLLM(): LLMContextType {
  const context = useContext(LLMContext);
  if (context === undefined) {
    throw new Error('useLLM must be used within an LLMProviderContext');
  }
  return context;
}

// Create the provider component
function LLMProviderContext({ children }: { children: ReactNode }) {
  const [provider, setProviderState] = useState<LLMProvider>(getSelectedProvider());
  const [model, setModelState] = useState<string>(getSelectedModel(provider));
  const [apiKey, setApiKeyState] = useState<string>(getApiKey(provider));
  const [llmService, setLlmService] = useState<LLMService | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [hasSkippedConfig, setHasSkippedConfig] = useState<boolean>(true);

  // Initialize LLM service - but don't validate API key on mount
  useEffect(() => {
    // Set skipped config flag in localStorage
    localStorage.setItem('llm_config_skipped', 'true');
    
    // Only set up the basic service without validation
    const setupBasicService = () => {
      try {
        // For on-device provider, we'll assume it's not configured until explicitly validated
        if (provider === 'on-device') {
          setIsConfigured(false);
          return;
        }

        // For cloud providers, check if we have an API key
        if (!apiKey && provider !== 'on-device') {
          setIsConfigured(false);
          setLlmService(null);
          return;
        }

        // Create service but don't validate yet
        const config: LLMConfig = {
          provider,
          apiKey,
          model
        };

        const service = new LLMService(config);
        setLlmService(service);
        
        // If we have an API key, assume it might be valid until proven otherwise
        setIsConfigured(!!apiKey);
      } catch (error) {
        console.error('Error setting up LLM service:', error);
        setLlmService(null);
        setIsConfigured(false);
      }
    };

    if (!hasInitialized) {
      setupBasicService();
      setHasInitialized(true);
    }
  }, [provider, apiKey, model, hasInitialized]);

  // Function to initialize the LLM service with validation
  const initializeLLMService = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Handle on-device provider
      if (provider === 'on-device') {
        const config: LLMConfig = {
          provider: 'on-device',
          model: 'gemini-nano'
        };
        
        try {
          const service = new LLMService(config);
          const isAvailable = await service.validateApiKey('');
          
          if (isAvailable) {
            setLlmService(service);
            useSummarizationStore.getState().setLLMService(service);
            setIsConfigured(true);
            setError(null);
            return true;
          } else {
            setLlmService(null);
            useSummarizationStore.getState().setLLMService(null);
            setIsConfigured(false);
            setError(
              'Chrome Built-in AI is not ready. Please ensure:\n' +
              '1. You have enabled it in chrome://flags\n' +
              '2. You are using Chrome Canary 128.0.6545.0 or above\n' +
              '3. The browser has finished downloading the model\n' +
              '4. Try restarting your browser if the issue persists'
            );
            return false;
          }
        } catch (error) {
          console.error('Error initializing on-device model:', error);
          setLlmService(null);
          useSummarizationStore.getState().setLLMService(null);
          setIsConfigured(false);
          setError(
            'Failed to initialize Chrome Built-in AI. Please check the console for details ' +
            'and ensure you have properly set up Chrome Built-in AI.'
          );
          return false;
        }
      }

      // Handle cloud providers
      if (!apiKey && provider !== 'on-device') {
        setIsConfigured(false);
        setLlmService(null);
        useSummarizationStore.getState().setLLMService(null);
        return false;
      }

      const config: LLMConfig = {
        provider,
        apiKey,
        model
      };

      const service = new LLMService(config);
      const isValid = await service.validateApiKey(apiKey);
      
      if (isValid) {
        setLlmService(service);
        useSummarizationStore.getState().setLLMService(service);
        setIsConfigured(true);
        setError(null);
        return true;
      } else {
        setLlmService(null);
        useSummarizationStore.getState().setLLMService(null);
        setIsConfigured(false);
        setError('Invalid API key. Please check your key and try again.');
        return false;
      }
    } catch (error) {
      console.error('Error initializing LLM service:', error);
      setLlmService(null);
      useSummarizationStore.getState().setLLMService(null);
      setIsConfigured(false);
      if (provider === 'on-device') {
        setError(
          'Failed to initialize Chrome Built-in AI. Please ensure:\n' +
          '1. You have enabled it in chrome://flags\n' +
          '2. You are using Chrome Canary 128.0.6545.0 or above\n' +
          '3. The browser has finished downloading the model\n' +
          '4. Try restarting your browser if the issue persists'
        );
      } else {
        setError('Failed to initialize LLM service. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Set provider and save to storage
  const setProvider = (newProvider: LLMProvider) => {
    setProviderState(newProvider);
    saveSelectedProvider(newProvider);
    
    // Update model and API key for the new provider
    const savedModel = getSelectedModel(newProvider);
    const savedApiKey = getApiKey(newProvider);
    
    setModelState(savedModel);
    setApiKeyState(savedApiKey);
  };

  // Set model and save to storage
  const setModel = (newModel: string) => {
    setModelState(newModel);
    saveSelectedModel(provider, newModel);
  };

  // Set API key and save to storage
  const setApiKey = (newApiKey: string) => {
    setApiKeyState(newApiKey);
    saveApiKey(provider, newApiKey);
  };

  // Validate API key
  const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const config: LLMConfig = {
        provider,
        apiKey,
        model
      };

      const service = new LLMService(config);
      const isValid = await service.validateApiKey(apiKey);
      
      if (isValid) {
        setLlmService(service);
        useSummarizationStore.getState().setLLMService(service);
        setIsConfigured(true);
      } else {
        setError('Invalid API key. Please check your key and try again.');
        setLlmService(null);
        useSummarizationStore.getState().setLLMService(null);
        setIsConfigured(false);
      }
      
      return isValid;
    } catch (error) {
      console.error('Error validating API key:', error);
      setError('Failed to validate API key. Please try again.');
      setLlmService(null);
      useSummarizationStore.getState().setLLMService(null);
      setIsConfigured(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Skip configuration
  const skipConfiguration = () => {
    setHasSkippedConfig(true);
    localStorage.setItem('llm_config_skipped', 'true');
  };

  // Reset skipped status
  const resetSkippedStatus = () => {
    setHasSkippedConfig(false);
    localStorage.removeItem('llm_config_skipped');
  };

  const value = {
    llmService,
    provider,
    model,
    apiKey,
    isConfigured,
    isLoading,
    error,
    hasSkippedConfig,
    setProvider,
    setModel,
    setApiKey,
    validateApiKey,
    clearError,
    initializeLLMService,
    skipConfiguration,
    resetSkippedStatus
  };

  return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
}

export { LLMProviderContext, useLLM }; 
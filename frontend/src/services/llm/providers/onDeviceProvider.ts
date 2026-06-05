import { LLMConfig, LLMProviderInterface, LLMRequest, LLMResponse } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkModelStatus = async (): Promise<{ 
  isAvailable: boolean; 
  missingFlags: string[];
  isDownloading: boolean;
}> => {
  const ai = (window as any).ai;
  const missingFlags: string[] = [];
  let isDownloading = false;
  
  // Check if the base AI API is available
  if (!ai) {
    missingFlags.push('#optimization-guide-on-device-model (set to "Enabled BypassPerfRequirement")');
    return { isAvailable: false, missingFlags, isDownloading: false };
  }
  
  // Check if the language model is available
  if (!ai?.languageModel) {
    missingFlags.push('#prompt-api-for-gemini-nano');
    return { isAvailable: false, missingFlags, isDownloading: false };
  }

  try {
    // Try to check model status through the optimization guide
    const guide = await (window as any).chrome?.optimize?.guide;
    if (guide) {
      const status = await guide.getModelStatus?.();
      isDownloading = status?.state === 'downloading' || status?.state === 'pending';
    }
  } catch (error) {
    console.warn('Unable to check model download status:', error);
  }
  
  return {
    isAvailable: missingFlags.length === 0,
    missingFlags,
    isDownloading
  };
};

const createSession = async (systemPrompt: string, retryCount = 0): Promise<any> => {
  try {
    const { isAvailable, missingFlags, isDownloading } = await checkModelStatus();
    
    if (!isAvailable) {
      throw new Error(`Chrome Built-in AI is not available. Missing flags: ${missingFlags.join(', ')}`);
    }

    if (isDownloading) {
      throw new Error('Model is still downloading. Please wait a few minutes.');
    }

    const session = await (window as any).ai.languageModel.create({
      systemPrompt: systemPrompt || ''
    });

    if (!session) {
      throw new Error('Failed to create session. Model may still be initializing.');
    }

    return session;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying session creation (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      await wait(RETRY_DELAY);
      return createSession(systemPrompt, retryCount + 1);
    }
    throw error;
  }
};

export const getOnDeviceProvider = (_config: LLMConfig): LLMProviderInterface => {
  return {
    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
      try {
        const { isAvailable, missingFlags, isDownloading } = await checkModelStatus();
        
        if (!isAvailable) {
          throw new Error(
            'Chrome Built-in AI is not available. Please ensure:\n' +
            '1. You have enabled BOTH required flags in chrome://flags:\n' +
            missingFlags.map(flag => `   - ${flag}`).join('\n') + '\n' +
            '2. You have restarted the browser after enabling the flags'
          );
        }

        if (isDownloading) {
          throw new Error(
            'The Gemini Nano model is still downloading. Please wait a few minutes.\n' +
            'You can check the download status at chrome://discards'
          );
        }

        // Get the system prompt and user message
        const systemPrompt = request.messages[0]?.content || '';
        const userMessage = request.messages[request.messages.length - 1].content;

        // Create session with retry logic
        const session = await createSession(systemPrompt);

        // Generate response
        const response = await session.prompt(userMessage);

        return {
          content: response || 'No response generated',
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
          }
        };
      } catch (error) {
        console.error('Error using Chrome Built-in AI:', error);
        throw error;
      }
    },

    async validateApiKey(_apiKey: string): Promise<boolean> {
      try {
        const { isAvailable, missingFlags, isDownloading } = await checkModelStatus();
        
        if (!isAvailable) {
          console.warn(
            'Chrome Built-in AI is not available. Missing flags:\n' +
            missingFlags.map(flag => `- ${flag}`).join('\n')
          );
          return false;
        }

        if (isDownloading) {
          console.warn(
            'The Gemini Nano model is still downloading.\n' +
            'Please wait a few minutes and try again.\n' +
            'You can check the download status at chrome://discards'
          );
          return false;
        }

        // Try to create a test session
        const session = await createSession('Test session');
        return !!session;
      } catch (error) {
        console.error('Error checking Chrome Built-in AI availability:', error);
        return false;
      }
    }
  };
}; 
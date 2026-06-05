import { ReactNode, useEffect } from 'react';
import { useLLM } from '@/contexts/LLMContext';
import { useSummarizationStore } from '@/utils/summarization';

interface LLMProviderProps {
  children: ReactNode;
}

export const LLMProvider: React.FC<LLMProviderProps> = ({ children }) => {
  const { llmService, isConfigured } = useLLM();
  const setLLMService = useSummarizationStore(state => state.setLLMService);

  useEffect(() => {
    if (isConfigured && llmService) {
      setLLMService(llmService);
    }
  }, [isConfigured, llmService, setLLMService]);

  return <>{children}</>;
}; 
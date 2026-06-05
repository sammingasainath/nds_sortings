import React, { useState, useEffect } from 'react';
import { useLLM } from '@/contexts/LLMContext';
import { LLMProvider } from '@/services/llm/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { KeyInput } from './KeyInput';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper function to list available Gemini models
const fetchGeminiModels = async (apiKey: string): Promise<{ value: string; label: string }[]> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }

    const data = await response.json();
    // Filter models that are suitable for chat/text generation
    // This is a basic filter - you might want to refine it based on model capabilities
    const chatModels = data.models
      .filter((model: any) => 
        model.name.includes('gemini') && 
        !model.name.includes('embedding') && 
        !model.name.includes('vision')
      )
      .map((model: any) => {
        // Extract the model name without the prefix
        const modelName = model.name.replace('models/', '');
        // Create a more readable label
        const label = modelName
          .split('-')
          .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        
        return { 
          value: modelName, 
          label: label 
        };
      });
    
    return chatModels;
  } catch (error) {
    console.error('Error fetching Gemini models:', error);
    return [];
  }
};

const providerOptions: { value: LLMProvider; label: string; description: string }[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    description: 'GPT models from OpenAI (GPT-3.5, GPT-4)'
  },
  {
    value: 'gemini',
    label: 'Google Gemini',
    description: 'Gemini models from Google'
  },
  {
    value: 'groq',
    label: 'GROQ',
    description: 'High-performance inference for open-source models'
  },
  {
    value: 'on-device',
    label: 'Chrome Built-in AI',
    description: 'Gemini Nano model running locally in Chrome (no API key required)'
  }
];

// Default model options as fallback
const defaultModelOptions: Record<LLMProvider, { value: string; label: string }[]> = {
  'openai': [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
  ],
  'gemini': [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' }
  ],
  'groq': [
    { value: 'mixtral-8x7b-32768', label: 'Mixtral-8x7B' },
    { value: 'llama2-70b-4096', label: 'LLaMA2-70B' }
  ],
  'on-device': [
    { value: 'gemini-nano', label: 'Gemini Nano' }
  ]
};

interface ProviderSelectorProps {
  onConfigured?: () => void;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({ onConfigured }) => {
  const { provider, model, apiKey, setProvider, setModel, skipConfiguration } = useLLM();
  const [dynamicModelOptions, setDynamicModelOptions] = useState<Record<LLMProvider, { value: string; label: string }[]>>(defaultModelOptions);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  // Check if Chrome Built-in AI is available
  const [isOnDeviceAvailable, setIsOnDeviceAvailable] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkOnDeviceAvailability = async () => {
      try {
        const isAvailable = !!(window as any).ai?.languageModel;
        setIsOnDeviceAvailable(isAvailable);
      } catch (error) {
        console.error('Error checking Chrome Built-in AI availability:', error);
        setIsOnDeviceAvailable(false);
      }
    };

    checkOnDeviceAvailability();
  }, []);

  // Fetch available models when provider or API key changes
  useEffect(() => {
    const fetchModels = async () => {
      if (provider === 'gemini' && apiKey) {
        setIsLoadingModels(true);
        try {
          const geminiModels = await fetchGeminiModels(apiKey);
          if (geminiModels.length > 0) {
            setDynamicModelOptions(prev => ({
              ...prev,
              gemini: geminiModels
            }));
            
            // If current model is not in the list, select the first available model
            if (geminiModels.length > 0 && !geminiModels.some(m => m.value === model)) {
              setModel(geminiModels[0].value);
            }
          }
        } catch (error) {
          console.error('Failed to fetch Gemini models:', error);
        } finally {
          setIsLoadingModels(false);
        }
      }
    };

    fetchModels();
  }, [provider, apiKey, setModel, model]);

  const handleProviderChange = (value: string) => {
    setProvider(value as LLMProvider);
    
    // Set default model for the selected provider
    const defaultModel = dynamicModelOptions[value as LLMProvider]?.[0]?.value;
    if (defaultModel) {
      setModel(defaultModel);
    }
  };

  const handleModelChange = (value: string) => {
    setModel(value);
  };

  const handleSkip = () => {
    skipConfiguration();
    if (onConfigured) {
      onConfigured();
    }
  };

  const selectedProvider = providerOptions.find(p => p.value === provider);
  const currentModelOptions = dynamicModelOptions[provider] || defaultModelOptions[provider];

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Configuration</CardTitle>
        <CardDescription>
          Configure your preferred LLM provider and API key
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider">LLM Provider</Label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger id="provider">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providerOptions.map(option => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.value === 'on-device' && !isOnDeviceAvailable}
                >
                  {option.label}
                  {option.value === 'on-device' && !isOnDeviceAvailable && ' (Not available)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProvider && (
            <p className="text-sm text-muted-foreground">
              {selectedProvider.description}
              {selectedProvider.value === 'on-device' && !isOnDeviceAvailable && (
                <span className="text-yellow-500 ml-1">
                  Please enable Chrome Built-in AI in chrome://flags
                </span>
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={model} onValueChange={handleModelChange} disabled={isLoadingModels}>
            <SelectTrigger id="model">
              {isLoadingModels ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading models...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select model" />
              )}
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              {currentModelOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {provider === 'gemini' && apiKey && currentModelOptions.length === 0 && !isLoadingModels && (
            <p className="text-sm text-red-500">No models found. Please check your API key.</p>
          )}
        </div>

        {provider !== 'on-device' && (
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <KeyInput />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={handleSkip}
          className="gap-2"
        >
          Skip for Now
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}; 
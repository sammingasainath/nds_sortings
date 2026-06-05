import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLLM } from '@/contexts/LLMContext';
import { LLMProvider } from '@/services/llm/types';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight } from "lucide-react";

export function LLMConfig() {
  const {
    provider,
    model,
    apiKey,
    isConfigured,
    isLoading,
    error,
    setProvider,
    setModel,
    setApiKey,
    validateApiKey,
    clearError,
    skipConfiguration
  } = useLLM();

  const handleProviderChange = (value: string) => {
    setProvider(value as LLMProvider);
  };

  const handleModelChange = (value: string) => {
    setModel(value);
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const handleValidateKey = async () => {
    await validateApiKey(apiKey);
  };

  const handleSkip = () => {
    skipConfiguration();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>LLM Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="gemini">Google Gemini</SelectItem>
              <SelectItem value="groq">GROQ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Model</label>
          <Select value={model} onValueChange={handleModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {provider === 'openai' && (
                <>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </>
              )}
              {provider === 'gemini' && (
                <>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </>
              )}
              {provider === 'groq' && (
                <>
                  <SelectItem value="mixtral-8x7b-32768">Mixtral-8x7B</SelectItem>
                  <SelectItem value="llama2-70b-4096">LLaMA2-70B</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">API Key</label>
          <Input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your API key"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleValidateKey} disabled={isLoading || !apiKey}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate Key'
            )}
          </Button>
          {isConfigured && (
            <span className="text-sm text-green-500">✓ LLM service configured</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSkip}>
          Skip for now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 
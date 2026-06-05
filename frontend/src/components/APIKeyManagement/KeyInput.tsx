import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Save, X } from 'lucide-react';
import { useLLM } from '@/contexts/LLMContext';

export const KeyInput: React.FC = () => {
  const { apiKey, setApiKey, validateApiKey, error, clearError } = useLLM();
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!inputKey) {
      setValidationMessage('API key cannot be empty');
      return;
    }

    setIsValidating(true);
    setValidationMessage(null);
    clearError();

    try {
      const isValid = await validateApiKey(inputKey);
      
      if (isValid) {
        setApiKey(inputKey);
        setValidationMessage('API key saved successfully');
      } else {
        setValidationMessage('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setValidationMessage('Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setInputKey('');
    setValidationMessage(null);
    clearError();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? 'text' : 'password'}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Enter your API key"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleClear}
          disabled={isValidating}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isValidating || !inputKey}
        >
          {isValidating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>
      </div>
      
      {(validationMessage || error) && (
        <div className={`text-sm ${validationMessage?.includes('success') || false ? 'text-green-500' : 'text-red-500'}`}>
          {validationMessage || error}
        </div>
      )}
    </div>
  );
}; 
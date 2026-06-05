import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wand2, Sparkles, Info } from 'lucide-react';
import { useLLM } from '@/contexts/LLMContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ParameterSuggestionProps {
  availableParameters: string[];
  onParametersSelected: (parameters: string[]) => void;
}

export const ParameterSuggestion: React.FC<ParameterSuggestionProps> = ({
  availableParameters,
  onParametersSelected
}) => {
  const { llmService, isConfigured, isLoading: isLLMLoading, initializeLLMService, hasSkippedConfig } = useLLM();
  const [userGoal, setUserGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedParameters, setSuggestedParameters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const handleSuggestParameters = async () => {
    if (!userGoal.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setNeedsApiKey(false);

    try {
      // Initialize LLM service if needed
      if (!isConfigured) {
        const initialized = await initializeLLMService();
        if (!initialized) {
          setNeedsApiKey(true);
          setError('AI features are optional. You can manually select parameters below or in the selection panel.');
          setIsLoading(false);
          return;
        }
      }

      // Now we should have a valid llmService
      if (!llmService) {
        setError('AI features are optional. You can manually select parameters below or in the selection panel.');
        setIsLoading(false);
        return;
      }

      const suggestions = await llmService.getParameterSuggestions({
        userGoal: userGoal.trim(),
        availableParameters
      });

      setSuggestedParameters(suggestions);
      
      // If we got suggestions, automatically select them
      if (suggestions.length > 0) {
        onParametersSelected(suggestions);
      }
    } catch (error) {
      console.error('Error getting parameter suggestions:', error);
      setError('Failed to get parameter suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSuggestParameters();
    }
  };

  const exampleGoals = [
    "Find colleges with strong research programs",
    "Identify colleges with good faculty-student ratio",
    "Suggest parameters for colleges with good placement records",
    "Parameters for colleges with diverse student population"
  ];

  const isButtonDisabled = !userGoal.trim() || isLoading || isLLMLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={userGoal}
          onChange={(e) => setUserGoal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Find colleges with strong research programs"
          disabled={isLoading || isLLMLoading}
          className="border-purple-200 focus:border-purple-400 dark:border-purple-900 dark:focus:border-purple-700"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleSuggestParameters} 
                disabled={isButtonDisabled}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading || isLLMLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Suggest
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get AI-powered parameter suggestions based on your goals (optional)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {error && (
        <div className="text-sm text-amber-600 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md">
          {error}
          {needsApiKey && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mt-1">
                Note: AI features are optional. You can still use the sorting functionality without AI.
              </p>
            </div>
          )}
        </div>
      )}

      {!isLoading && !suggestedParameters.length && (
        <div className="space-y-2 p-3 bg-muted/20 rounded-md">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Example goals you can try:</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {exampleGoals.map((goal, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                className="justify-start text-left h-auto py-1.5 text-xs"
                onClick={() => setUserGoal(goal)}
              >
                {goal}
              </Button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
      ) : suggestedParameters.length > 0 ? (
        <div className="space-y-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md border border-purple-100 dark:border-purple-900">
          <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Recommended Parameters:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedParameters.map((param) => (
              <Badge key={param} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800">
                {param}
              </Badge>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
            onClick={() => onParametersSelected(suggestedParameters)}
          >
            Apply Suggestions
          </Button>
        </div>
      ) : null}
    </div>
  );
}; 
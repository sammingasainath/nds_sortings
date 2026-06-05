import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLLM } from '@/contexts/LLMContext';
import { ParameterInfoCard } from '@/components/ParameterInfoCard';
import { parameterInfo } from '@/lib/parameterInfo';

interface ImprovedParameterSuggestionProps {
  availableParameters: string[];
  onParametersSelected: (parameters: string[]) => void;
}

export const ImprovedParameterSuggestion: React.FC<ImprovedParameterSuggestionProps> = ({
  availableParameters,
  onParametersSelected
}) => {
  const [userGoal, setUserGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { llmService, isConfigured } = useLLM();

  const handleSuggest = async () => {
    if (!userGoal.trim()) {
      setError('Please enter your educational goals or preferences');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!llmService || !isConfigured) {
        // Simulate AI suggestion for demo purposes if no API key
        const mockSuggestions = simulateSuggestions(userGoal, availableParameters);
        setTimeout(() => {
          setSuggestions(mockSuggestions);
          setIsLoading(false);
        }, 1500);
        return;
      }

      // Use real LLM service
      const result = await llmService.getParameterSuggestions({
        userGoal,
        availableParameters
      });

      setSuggestions(result.suggestedParameters || []);
    } catch (err) {
      console.error('Error getting parameter suggestions:', err);
      setError('Failed to get suggestions. Please try again.');
      
      // Fallback to mock suggestions
      const mockSuggestions = simulateSuggestions(userGoal, availableParameters);
      setSuggestions(mockSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestions = () => {
    if (suggestions.length > 0) {
      onParametersSelected(suggestions);
    }
  };

  // Get example parameter options based on common educational goals
  const exampleGoals = [
    { text: "Find colleges with strong research programs", value: "I want to find colleges with strong research programs and publications" },
    { text: "Identify institutions with good faculty", value: "I want colleges with good faculty-student ratio and qualified professors" },
    { text: "Find colleges with high placement rates", value: "I need colleges with high placement rates and good median salary" },
    { text: "Colleges with diverse student population", value: "I want colleges with diverse student population and inclusive environment" }
  ];

  const simulateSuggestions = (goal: string, parameters: string[]): string[] => {
    // This is a simple simulation based on keywords
    const goalLower = goal.toLowerCase();
    let result: string[] = [];
    
    if (goalLower.includes('research')) {
      result = ['PU', 'QP', 'IPR', 'FPPP'];
    } else if (goalLower.includes('faculty') || goalLower.includes('professor')) {
      result = ['FSR', 'FQE', 'FRU'];
    } else if (goalLower.includes('placement') || goalLower.includes('salary')) {
      result = ['GPH', 'GUE', 'MS'];
    } else if (goalLower.includes('diverse') || goalLower.includes('inclusive')) {
      result = ['RD', 'WD', 'ESCS', 'PCS'];
    } else {
      // Default selection
      result = ['FSR', 'FQE', 'GPH', 'MS', 'PR'];
    }
    
    // Make sure we only return parameters that are actually available
    return result.filter(p => parameters.includes(p));
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <label htmlFor="userGoal" className="block text-sm font-medium">
          What are you looking for in a college?
        </label>
        <Textarea
          id="userGoal"
          placeholder="e.g., I'm interested in colleges with strong research programs and good placement records"
          value={userGoal}
          onChange={(e) => setUserGoal(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {exampleGoals.map((goal, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => setUserGoal(goal.value)}
          >
            {goal.text}
          </Badge>
        ))}
      </div>

      {error && (
        <div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-950/20 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleSuggest}
          disabled={isLoading || !userGoal.trim()}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Suggest Parameters
        </Button>
        
        {suggestions.length > 0 && (
          <Button
            variant="outline"
            onClick={handleApplySuggestions}
          >
            Apply Suggestions
          </Button>
        )}
      </div>

      {suggestions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map(param => {
                const info = parameterInfo[param];
                return (
                  <div 
                    key={param} 
                    className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted/30"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{info?.fullName || param}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {param}
                      </div>
                    </div>
                    <ParameterInfoCard
                      name={info?.fullName || param}
                      code={param}
                      description={info?.description || "No description available"}
                      examples={info?.examples}
                      importance={info?.importance}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
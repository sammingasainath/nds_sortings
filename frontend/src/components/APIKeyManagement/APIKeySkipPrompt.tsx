import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLLM } from '@/contexts/LLMContext';
import { ProviderSelector } from './ProviderSelector';
import { Sparkles, ArrowRight, XCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface APIKeySkipPromptProps {
  onConfigure?: () => void;
  onSkip?: () => void;
}

export const APIKeySkipPrompt: React.FC<APIKeySkipPromptProps> = ({
  onConfigure,
  onSkip
}) => {
  const { skipConfiguration } = useLLM();
  const [dontShowAgain, setDontShowAgain] = React.useState(true);

  // Automatically skip when component mounts
  React.useEffect(() => {
    handleSkip();
  }, []);

  const handleSkip = () => {
    skipConfiguration();
    
    // Always set these flags
    localStorage.setItem('llm_config_skipped', 'true');
    localStorage.setItem('has_visited_explore_page', 'true');
    
    if (onSkip) onSkip();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Features Available
        </CardTitle>
        <CardDescription>
          Configure an AI provider to enable AI-powered insights and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-sm rounded-md border border-amber-200 dark:border-amber-900">
          <p className="font-medium">This application offers AI-powered features:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>College selection recommendations</li>
            <li>Parameter suggestions based on your goals</li>
            <li>Insights about your optimal colleges</li>
            <li>AI assistant to answer your questions</li>
          </ul>
        </div>
        
        <div className="text-sm text-muted-foreground">
          You can configure an AI provider now or skip and do it later when you need these features.
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox 
            id="dontShowAgain" 
            checked={dontShowAgain} 
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <Label htmlFor="dontShowAgain" className="text-sm font-normal cursor-pointer">
            Don't show this dialog again
          </Label>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleSkip}
          className="gap-2"
        >
          Skip for Now
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button 
          onClick={onConfigure}
          className="gap-2"
        >
          Configure AI
          <Sparkles className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}; 
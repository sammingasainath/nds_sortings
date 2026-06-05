import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, Sparkles } from 'lucide-react';
import { ProviderSelector } from './ProviderSelector';
import { useLLM } from '@/contexts/LLMContext';

interface AISidebarConfigProps {
  children?: React.ReactNode;
}

export const AISidebarConfig: React.FC<AISidebarConfigProps> = ({ children }) => {
  const { isConfigured, skipConfiguration } = useLLM();

  const handleSkip = () => {
    skipConfiguration();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure AI
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Configuration
          </SheetTitle>
          <SheetDescription>
            Configure an AI provider to enable AI-powered insights and recommendations
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <div className="p-3 mb-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-sm rounded-md border border-amber-200 dark:border-amber-900">
            <p className="font-medium">This application offers AI-powered features:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>College selection recommendations</li>
              <li>Parameter suggestions based on your goals</li>
              <li>Insights about your optimal colleges</li>
              <li>AI assistant to answer your questions</li>
            </ul>
          </div>
          
          <ProviderSelector 
            onConfigured={() => {}} 
            skipConfiguration={handleSkip}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}; 
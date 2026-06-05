import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProviderSelector } from './ProviderSelector';
import { APIKeySkipPrompt } from './APIKeySkipPrompt';
import { useLLM } from '@/contexts/LLMContext';

interface APIKeyConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const APIKeyConfigDialog: React.FC<APIKeyConfigDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { hasSkippedConfig, skipConfiguration } = useLLM();
  const [showConfig, setShowConfig] = useState(false);

  // Reset state when dialog opens or closes
  useEffect(() => {
    // Always reset to show the skip prompt when the dialog opens
    if (open) {
      setShowConfig(false);
    }
  }, [open]);

  const handleSkip = () => {
    skipConfiguration();
    onOpenChange(false);
  };

  const handleConfigure = () => {
    setShowConfig(true);
  };

  // If the dialog is open, immediately close it and skip configuration
  useEffect(() => {
    if (open) {
      handleSkip();
    }
  }, [open]);

  return (
    <Dialog open={false} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <APIKeySkipPrompt 
          onConfigure={handleConfigure} 
          onSkip={handleSkip} 
        />
      </DialogContent>
    </Dialog>
  );
}; 
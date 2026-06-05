import React from 'react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/contexts/ComparisonContext';
import { PlusCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddToComparisonButtonProps {
  collegeName: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showNavigate?: boolean;
}

export const AddToComparisonButton: React.FC<AddToComparisonButtonProps> = ({
  collegeName,
  variant = 'outline',
  size = 'sm',
  showNavigate = false
}) => {
  const { selectedForComparison, addToComparison, removeFromComparison } = useComparison();
  const navigate = useNavigate();
  
  const isSelected = selectedForComparison.includes(collegeName);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelected) {
      removeFromComparison(collegeName);
    } else {
      addToComparison(collegeName);
    }
  };
  
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/compare');
  };
  
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleClick}
              className={isSelected ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50" : ""}
            >
              {isSelected ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Compare
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSelected ? "Remove from comparison" : "Add to comparison"}
          </TooltipContent>
        </Tooltip>
        
        {showNavigate && selectedForComparison.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size={size}
                onClick={handleNavigate}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Go ({selectedForComparison.length})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Go to comparison page
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}; 
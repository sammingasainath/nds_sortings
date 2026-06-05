import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export interface ParameterInfoProps {
  name: string;
  code: string;
  description: string;
  examples?: string;
  importance?: string;
}

export const ParameterInfoCard: React.FC<
  ParameterInfoProps & { className?: string }
> = ({ name, code, description, examples, importance, className }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={cn("inline-flex items-center cursor-help", className)}>
          <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{name} ({code})</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          {examples && (
            <div className="pt-1">
              <h5 className="text-xs font-medium">Examples:</h5>
              <p className="text-xs text-muted-foreground">{examples}</p>
            </div>
          )}
          {importance && (
            <div className="pt-1">
              <h5 className="text-xs font-medium">Why this matters:</h5>
              <p className="text-xs text-muted-foreground">{importance}</p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}; 
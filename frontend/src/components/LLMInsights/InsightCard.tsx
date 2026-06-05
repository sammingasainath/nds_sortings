import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

interface InsightCardProps {
  title: string;
  description?: string;
  insight: string | null;
  isLoading?: boolean;
  needsApiKey?: boolean;
  onConfigureApiKey?: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  insight,
  isLoading = false,
  needsApiKey = false,
  onConfigureApiKey
}) => {
  const handleConfigureClick = () => {
    if (onConfigureApiKey) {
      onConfigureApiKey();
    } else {
      console.log("API key configuration is disabled");
    }
  };

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div className="mb-2">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[85%]" />
        </div>
      ) : insight ? (
        <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-primary" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 text-primary/90" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-2 mb-1 text-primary/80" {...props} />,
              h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-2 mb-1 text-primary/70" {...props} />,
              p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold text-primary" {...props} />,
              em: ({ node, ...props }) => <em className="italic text-primary/80" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-primary/30 pl-4 italic my-3 text-muted-foreground" {...props} />
              ),
              code: ({ node, className, children, ...props }: { node?: any, className?: string, children?: React.ReactNode, inline?: boolean }) => 
                props.inline 
                  ? <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                  : <code className="block bg-muted p-3 rounded text-sm my-3 overflow-x-auto font-mono" {...props}>{children}</code>
            }}
          >
            {insight}
          </ReactMarkdown>
        </div>
      ) : needsApiKey ? (
        <div className="p-4 bg-muted/20 rounded-md border border-muted space-y-3">
          <p className="text-sm text-amber-600">
            AI insights are optional. You can still use the sorting functionality without AI.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleConfigureClick}
            className="text-xs"
          >
            Continue Without AI
          </Button>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic p-4 bg-muted/20 rounded-md border border-muted">
          No insights available yet. AI insights are optional and not required for the sorting functionality.
        </div>
      )}
    </div>
  );
}; 
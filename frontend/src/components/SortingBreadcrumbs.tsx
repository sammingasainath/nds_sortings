import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SortingBreadcrumbsProps {
  iterations: {
    id: string;
    collegeCount: number;
    timestamp: number;
  }[];
  currentIterationId: string | null;
}

export const SortingBreadcrumbs: React.FC<SortingBreadcrumbsProps> = ({
  iterations,
  currentIterationId
}) => {
  if (iterations.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <div className="flex items-center">
        <span className="font-medium text-primary">Initial Sort</span>
      </div>
      {iterations.slice(1).map((iteration, index) => (
        <React.Fragment key={iteration.id}>
          <ChevronRight className="h-4 w-4" />
          <div className="flex items-center">
            <span className={iteration.id === currentIterationId ? "font-medium text-primary" : ""}>
              Iteration {index + 1}
              <span className="ml-1 text-xs">
                ({iteration.collegeCount} colleges)
              </span>
            </span>
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
}; 
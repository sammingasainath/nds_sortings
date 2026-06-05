import React from 'react';
import { useRouteError } from 'react-router-dom';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

export function ErrorBoundary() {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-2xl font-bold">Oops! Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
} 
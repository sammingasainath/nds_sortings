import React, { createContext, useContext, useState, useCallback } from 'react';

interface ComparisonContextType {
  selectedForComparison: string[];
  addToComparison: (collegeName: string) => void;
  removeFromComparison: (collegeName: string) => void;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  const addToComparison = useCallback((collegeName: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(collegeName)) return prev;
      return [...prev, collegeName];
    });
  }, []);

  const removeFromComparison = useCallback((collegeName: string) => {
    setSelectedForComparison(prev => prev.filter(name => name !== collegeName));
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedForComparison([]);
  }, []);

  return (
    <ComparisonContext.Provider
      value={{
        selectedForComparison,
        addToComparison,
        removeFromComparison,
        clearComparison
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}; 
import { useCallback, useEffect } from 'react';
import { atom, useAtom } from 'jotai';

interface IterationHistory {
  [iterationId: string]: {
    selectedColleges: string[];
    timestamp: number;
    previousIterationId?: string; // Track the previous iteration
  };
}

// Atom to store whether we've had at least one iteration
const hasCompletedFirstIterationAtom = atom<boolean>(false);

// Load initial state from localStorage
const loadInitialState = (): IterationHistory => {
  try {
    const saved = localStorage.getItem('collegeIterationHistory');
    if (saved) {
      console.log('🔍 [useCollegeHistory] Loaded history from localStorage:', saved);
      return JSON.parse(saved);
    }
    return {};
  } catch (error) {
    console.error('Failed to load iteration history from localStorage:', error);
    return {};
  }
};

// Atom to store iteration history
const iterationHistoryAtom = atom<IterationHistory>(loadInitialState());

export const useCollegeHistory = () => {
  const [history, setHistory] = useAtom(iterationHistoryAtom);
  const [hasCompletedFirstIteration, setHasCompletedFirstIteration] = useAtom(hasCompletedFirstIterationAtom);

  // Load initial state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('collegeIterationHistory');
      const hasCompleted = localStorage.getItem('hasCompletedFirstIteration');
      
      console.log('🔍 [useCollegeHistory] Initial load:', { 
        saved: !!saved, 
        hasCompleted: !!hasCompleted 
      });
      
      if (saved) {
        const parsedHistory = JSON.parse(saved);
        if (Object.keys(parsedHistory).length > 0) {
          setHasCompletedFirstIteration(true);
        }
      }
      
      if (hasCompleted === 'true') {
        setHasCompletedFirstIteration(true);
      }
    } catch (error) {
      console.error('Failed to load iteration history from localStorage:', error);
    }
  }, [setHasCompletedFirstIteration]);

  const saveIteration = useCallback((iterationId: string, selectedColleges: string[]) => {
    console.log('🔄 [useCollegeHistory] Saving iteration:', iterationId, 'with colleges:', selectedColleges);
    
    // Find the most recent iteration to set as previous
    const iterations = Object.entries(history);
    let previousIterationId: string | undefined = undefined;
    
    if (iterations.length > 0) {
      const mostRecent = iterations.sort((a, b) => b[1].timestamp - a[1].timestamp)[0];
      previousIterationId = mostRecent[0];
    }
    
    setHistory(prev => {
      // Create new history object that INCLUDES previous iterations
      const newHistory = {
        ...prev, // Keep previous iterations
        [iterationId]: {
          selectedColleges,
          timestamp: Date.now(),
          previousIterationId
        }
      };
      
      console.log('✅ [useCollegeHistory] New history:', newHistory);

      // Save to localStorage
      try {
        const historyString = JSON.stringify(newHistory);
        localStorage.setItem('collegeIterationHistory', historyString);
        console.log('✅ [useCollegeHistory] Saved to localStorage:', historyString);
      } catch (error) {
        console.error('Failed to save iteration history to localStorage:', error);
      }

      return newHistory;
    });
    
    // Mark that we've completed at least one iteration
    setHasCompletedFirstIteration(true);
    localStorage.setItem('hasCompletedFirstIteration', 'true');
    
  }, [setHistory, history, setHasCompletedFirstIteration]);

  const getPreviouslySelectedColleges = useCallback((currentIterationId: string) => {
    // Get all iterations
    const iterations = Object.entries(history);
    
    console.log('🔍 [useCollegeHistory] Getting previous colleges for:', currentIterationId);
    console.log('🔍 [useCollegeHistory] Current history:', history);
    console.log('🔍 [useCollegeHistory] hasCompletedFirstIteration:', hasCompletedFirstIteration);
    
    // Check localStorage directly as a backup
    const hasCompleted = localStorage.getItem('hasCompletedFirstIteration') === 'true';
    
    // If no history or this is the first iteration ever, return null
    if (iterations.length === 0 || (!hasCompletedFirstIteration && !hasCompleted)) {
      console.log('🔍 [useCollegeHistory] No history or first iteration ever');
      return null;
    }

    // If this iteration has a previous iteration ID, use that
    const currentIteration = history[currentIterationId];
    if (currentIteration?.previousIterationId) {
      const previousIteration = history[currentIteration.previousIterationId];
      if (previousIteration) {
        console.log('✅ [useCollegeHistory] Found previous iteration:', previousIteration);
        return previousIteration.selectedColleges;
      }
    }

    // Otherwise get the most recent iteration's selected colleges
    const mostRecent = iterations
      .sort((a, b) => b[1].timestamp - a[1].timestamp)[0];
    
    // If this is a new iteration, return the colleges from the most recent iteration
    if (mostRecent && mostRecent[0] !== currentIterationId) {
      console.log('✅ [useCollegeHistory] Using most recent iteration:', mostRecent[1].selectedColleges);
      return mostRecent[1].selectedColleges;
    }

    return null;
  }, [history, hasCompletedFirstIteration]);

  const clearHistory = useCallback(() => {
    setHistory({});
    setHasCompletedFirstIteration(false);
    try {
      localStorage.removeItem('collegeIterationHistory');
      localStorage.removeItem('hasCompletedFirstIteration');
    } catch (error) {
      console.error('Failed to clear iteration history from localStorage:', error);
    }
  }, [setHistory, setHasCompletedFirstIteration]);

  const isFirstIteration = useCallback((iterationId: string) => {
    // Check localStorage directly as a backup
    const hasCompleted = localStorage.getItem('hasCompletedFirstIteration') === 'true';
    
    // If we've never completed an iteration, this is the first
    if (!hasCompletedFirstIteration && !hasCompleted) {
      console.log('🔍 [useCollegeHistory] First iteration ever (no completed iterations)');
      return true;
    }
    
    // If this iteration doesn't have a previous iteration, it's the first
    const currentIteration = history[iterationId];
    const result = !currentIteration?.previousIterationId;
    
    console.log('🔍 [useCollegeHistory] isFirstIteration check for', iterationId, '=', result, 'hasCompleted =', hasCompleted);
    return result;
  }, [history, hasCompletedFirstIteration]);

  return {
    saveIteration,
    getPreviouslySelectedColleges,
    clearHistory,
    isFirstIteration,
    hasCompletedFirstIteration
  };
}; 
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { NonDominatedSortingResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SortingHistoryEntry {
    id: string;
    parentId: string | null;
    selectedColleges: string[];
    selectedParameters: string[];
    sortingResults: NonDominatedSortingResult[];
    timestamp: number;
}

interface SortingHistoryState {
    entries: Record<string, SortingHistoryEntry>;
    currentEntryId: string | null;
}

type SortingHistoryAction =
    | { type: 'ADD_ENTRY'; payload: Omit<SortingHistoryEntry, 'id' | 'timestamp'> }
    | { type: 'RESTORE_ENTRY'; payload: { entryId: string } }
    | { type: 'LOAD_HISTORY'; payload: SortingHistoryState };

// Load initial state from localStorage
const loadInitialState = (): SortingHistoryState => {
    try {
        const savedHistory = localStorage.getItem('sortingHistory');
        if (savedHistory) {
            console.log('Loading sorting history from localStorage:', savedHistory);
            return JSON.parse(savedHistory);
        }
    } catch (error) {
        console.error('Failed to load sorting history from localStorage:', error);
    }
    return {
        entries: {},
        currentEntryId: null,
    };
};

const initialState: SortingHistoryState = loadInitialState();

function sortingHistoryReducer(
    state: SortingHistoryState,
    action: SortingHistoryAction
): SortingHistoryState {
    let newState: SortingHistoryState;
    
    switch (action.type) {
        case 'ADD_ENTRY': {
            const id = uuidv4();
            newState = {
                ...state,
                entries: {
                    ...state.entries,
                    [id]: {
                        ...action.payload,
                        id,
                        timestamp: Date.now(),
                    },
                },
                currentEntryId: id,
            };
            break;
        }
        case 'RESTORE_ENTRY': {
            newState = {
                ...state,
                currentEntryId: action.payload.entryId,
            };
            break;
        }
        case 'LOAD_HISTORY': {
            newState = action.payload;
            break;
        }
        default:
            return state;
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('sortingHistory', JSON.stringify(newState));
        console.log('Saved sorting history to localStorage:', newState);
    } catch (error) {
        console.error('Failed to save sorting history to localStorage:', error);
    }
    
    return newState;
}

interface SortingHistoryContextType {
    state: SortingHistoryState;
    addSorting: (entry: Omit<SortingHistoryEntry, 'id' | 'timestamp'>) => void;
    restoreEntry: (entryId: string) => void;
}

const SortingHistoryContext = createContext<SortingHistoryContextType | null>(null);

export function SortingHistoryProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(sortingHistoryReducer, initialState);

    // Load history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('sortingHistory');
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory);
                dispatch({ type: 'LOAD_HISTORY', payload: parsedHistory });
                console.log('Loaded sorting history from localStorage on mount:', parsedHistory);
            } catch (error) {
                console.error('Failed to parse sorting history from localStorage:', error);
            }
        }
    }, []);

    const addSorting = useCallback((entry: Omit<SortingHistoryEntry, 'id' | 'timestamp'>) => {
        console.log('Adding sorting to history:', entry);
        dispatch({ type: 'ADD_ENTRY', payload: entry });
    }, []);

    const restoreEntry = useCallback((entryId: string) => {
        console.log('Restoring entry from history:', entryId);
        dispatch({ type: 'RESTORE_ENTRY', payload: { entryId } });
    }, []);

    return (
        <SortingHistoryContext.Provider value={{ state, addSorting, restoreEntry }}>
            {children}
        </SortingHistoryContext.Provider>
    );
}

export function useSortingHistory() {
    const context = useContext(SortingHistoryContext);
    if (!context) {
        throw new Error('useSortingHistory must be used within a SortingHistoryProvider');
    }
    return context;
} 
export interface College {
    'Unnamed: 0': string;  // This is the actual ID field from the CSV
    Name: string;
    [key: string]: string | number; // For dynamic parameters
}

export interface ParetoFront {
    front: number;
    colleges: College[];
}

export interface NonDominatedSortingResult {
    frontNumber: number;
    college: College;
}

export interface SortingHistoryEntry {
    id: string;
    timestamp: number;
    selectedColleges: string[];
    selectedParameters: string[];
    sortingResults: NonDominatedSortingResult[];
    parentId?: string; // Reference to the previous sorting in the chain
}

export interface SortingHistoryState {
    entries: SortingHistoryEntry[];
    currentEntryId: string | null;
} 
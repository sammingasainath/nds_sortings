export interface College {
    'Unnamed: 0': string;
    Name: string;
    SS: number;
    FSR: number;
    FQE: number;
    FRU: number;
    PU: number;
    WE: number;
    IPR: number;
    FPPP: number;
    GPH: number;
    [key: string]: string | number; // Allow for additional numeric parameters
}

export interface NonDominatedSortingResult {
    college: College;
    frontNumber: number;
}

export interface SortingHistoryEntry {
    id: string;
    parentId: string | null;
    selectedColleges: string[];
    selectedParameters: string[];
    sortingResults: NonDominatedSortingResult[];
    timestamp: number;
} 
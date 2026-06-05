export type SortOption = 'original' | 'alphabetical' | 'parameter' | 'nirf' | 'singleParameter';
export type FilterOption = 'all' | 'selected' | 'unselected';

export interface SortingOptions {
    sortBy: SortOption;
    sortParameter?: string;
    filterBy: FilterOption;
    searchQuery: string;
}

export interface SelectionState {
    options: SortingOptions;
    setOptions: (options: SortingOptions) => void;
} 
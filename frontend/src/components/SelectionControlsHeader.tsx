import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SortingOptions, SortOption, FilterOption } from '@/types/selection';
import { Search, SortAsc, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectionControlsHeaderProps {
    title: string;
    totalCount: number;
    selectedCount: number;
    options: SortingOptions;
    setOptions: (options: SortingOptions) => void;
    onSelectAll: () => void;
    areAllSelected: boolean;
    parameters?: string[];
    isSubsequentIteration?: boolean;
}

export const SelectionControlsHeader: React.FC<SelectionControlsHeaderProps> = ({
    title,
    totalCount,
    selectedCount,
    options,
    setOptions,
    onSelectAll,
    areAllSelected,
    parameters,
    isSubsequentIteration = false,
}) => {
    // Log component mount and props
    console.log('🔄 [SelectionControlsHeader] Component mounted/updated with props:', {
        title,
        isSubsequentIteration,
        currentFilter: options.filterBy
    });

    // Force filter to 'selected' in subsequent iterations
    useEffect(() => {
        if (isSubsequentIteration) {
            console.log('🔧 [SelectionControlsHeader] Forcing filter to SELECTED');
            
            // Use setTimeout to ensure this runs after React's rendering cycle
            setTimeout(() => {
                setOptions({
                    ...options,
                    filterBy: 'selected'
                });
            }, 0);
        }
    }, [isSubsequentIteration]); // Only depend on isSubsequentIteration to prevent loops

    // Check localStorage directly as a backup
    useEffect(() => {
        const hasCompleted = localStorage.getItem('hasCompletedFirstIteration') === 'true';
        if (hasCompleted && !isSubsequentIteration && title === 'Colleges') {
            console.log('🔧 [SelectionControlsHeader] Detected subsequent iteration from localStorage');
            
            // Use setTimeout to ensure this runs after React's rendering cycle
            setTimeout(() => {
                setOptions({
                    ...options,
                    filterBy: 'selected'
                });
            }, 0);
        }
    }, []);

    const handleSortChange = (value: string) => {
        setOptions({
            ...options,
            sortBy: value as SortOption,
            // Clear parameter if switching away from parameter sort
            sortParameter: value !== 'parameter' ? undefined : options.sortParameter
        });
    };

    const handleParameterChange = (value: string) => {
        setOptions({
            ...options,
            sortParameter: value
        });
    };

    const handleFilterChange = (value: string) => {
        // Allow changing the filter in all cases
        setOptions({
            ...options,
            filterBy: value as FilterOption
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOptions({
            ...options,
            searchQuery: e.target.value
        });
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    {selectedCount} of {totalCount} selected
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAll}
                    className="text-sm"
                >
                    {areAllSelected ? "Deselect All" : "Select All"}
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={options.searchQuery}
                            onChange={handleSearchChange}
                            className="pl-9 bg-background/50 backdrop-blur-sm"
                        />
                    </div>
                </div>

                <Select
                    value={options.sortBy}
                    onValueChange={handleSortChange}
                >
                    <SelectTrigger className="w-[160px] bg-background/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <SortAsc className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Sort by" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="original">Original Order</SelectItem>
                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                        {parameters && (
                            <SelectItem value="parameter">By Parameter</SelectItem>
                        )}
                    </SelectContent>
                </Select>

                {options.sortBy === 'parameter' && parameters && (
                    <Select
                        value={options.sortParameter}
                        onValueChange={handleParameterChange}
                    >
                        <SelectTrigger className="w-[160px] bg-background/50 backdrop-blur-sm">
                            <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent>
                            {parameters.map(param => (
                                <SelectItem key={param} value={param}>
                                    {param}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Select
                    value={options.filterBy}
                    onValueChange={handleFilterChange}
                >
                    <SelectTrigger className="w-[160px] bg-background/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filter by" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="selected">Selected</SelectItem>
                        <SelectItem value="unselected">Unselected</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}; 
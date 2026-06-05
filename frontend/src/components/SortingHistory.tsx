import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { NonDominatedSortingResult } from '@/types';
import { cn } from '@/lib/utils';
import { useSortingHistory } from '@/contexts/SortingHistoryContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Component for the Pareto front results in the main sorting page
interface SortingHistoryProps {
  results: NonDominatedSortingResult[];
  onSelect: (collegeIds: string[]) => void;
  selectedIds: string[];
}

export const SortingHistory: React.FC<SortingHistoryProps> = ({
  results,
  onSelect,
  selectedIds
}) => {
  // Group results by front number
  const frontGroups = React.useMemo(() => {
    const groups: Record<number, NonDominatedSortingResult[]> = {};
    
    if (!results || results.length === 0) {
      return [];
    }
    
    results.forEach(result => {
      const frontNumber = result.frontNumber;
      if (!groups[frontNumber]) {
        groups[frontNumber] = [];
      }
      groups[frontNumber].push(result);
    });
    
    return Object.entries(groups)
      .map(([front, colleges]) => ({
        front: parseInt(front),
        colleges
      }))
      .sort((a, b) => a.front - b.front);
  }, [results]);

  const handleCollegeSelect = (collegeId: string) => {
    const newSelection = selectedIds.includes(collegeId)
      ? selectedIds.filter(id => id !== collegeId)
      : [...selectedIds, collegeId];
    
    onSelect(newSelection);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Pareto Front Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {frontGroups.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No sorting results available.
          </div>
        ) : (
          <div className="space-y-6">
            {frontGroups.map(group => (
              <div key={`front-${group.front}`} className="space-y-2">
                <h3 className="text-lg font-semibold">Front {group.front}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.colleges.map(result => {
                    const collegeId = result.college['Unnamed: 0'];
                    const isSelected = selectedIds.includes(collegeId);
                    
                    return (
                      <div 
                        key={collegeId}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded border cursor-pointer",
                          isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent"
                        )}
                        onClick={() => handleCollegeSelect(collegeId)}
                      >
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => handleCollegeSelect(collegeId)}
                          className="pointer-events-none"
                        />
                        <div className="flex-1">
                          <span className="font-medium block">{result.college.Name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component for the history page
export const SortingHistoryView: React.FC = () => {
  const { state, restoreEntry } = useSortingHistory();
  const navigate = useNavigate();

  const sortedEntries = React.useMemo(() => {
    return Object.values(state.entries)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [state.entries]);

  const handleRestore = (entryId: string) => {
    console.log('Restoring entry and navigating to explore page:', entryId);
    restoreEntry(entryId);
    // Navigate to the explore page
    navigate('/explore');
  };

  if (sortedEntries.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Sorting History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No sorting history yet. Start by selecting colleges and parameters.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Sorting History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sortedEntries.map((entry) => (
              <Card 
                key={entry.id}
                className={`border ${
                  entry.id === state.currentEntryId
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Sorting #{sortedEntries.length - sortedEntries.indexOf(entry)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    {entry.id !== state.currentEntryId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => handleRestore(entry.id)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Restore
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Colleges: {entry.selectedColleges.length}</p>
                    <p>Parameters: {entry.selectedParameters.length}</p>
                    <p>Fronts: {Math.max(...entry.sortingResults.map(r => r.frontNumber))}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 
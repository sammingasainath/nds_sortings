import React, { useState, useCallback, useEffect } from 'react';
import { SelectionControls } from '@/components/SelectionControls';
import { CollegeComparison } from '@/components/CollegeComparison';
import { useCollegeData } from '@/hooks/useCollegeData';
import { useCollegeHistory } from '@/hooks/useCollegeHistory';
import { useComparison } from '@/contexts/ComparisonContext';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParameterSelector } from '@/components/ParameterSelector';
import { parameterInfo } from '@/lib/parameterInfo';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortAsc } from "lucide-react";

export const ComparisonPage: React.FC = () => {
  const {
    colleges,
    parameters,
    selectedColleges,
    setSelectedColleges,
    selectedParameters,
    setSelectedParameters,
    loading
  } = useCollegeData();
  
  const location = useLocation();
  const { selectedForComparison, clearComparison } = useComparison();

  // Add iteration state
  const [currentIterationId, setCurrentIterationId] = useState<string>(() => 
    `iteration-${Date.now()}`
  );
  const { saveIteration, getPreviouslySelectedColleges, isFirstIteration } = useCollegeHistory();

  // Calculate available colleges for display
  const availableColleges = React.useMemo(() => {
    if (isFirstIteration(currentIterationId)) {
      return colleges;
    }
    
    const previouslySelected = getPreviouslySelectedColleges(currentIterationId);
    if (previouslySelected) {
      return colleges.filter(college => previouslySelected.includes(college.Name));
    }
    
    return [];
  }, [colleges, currentIterationId, getPreviouslySelectedColleges, isFirstIteration]);

  // Effect to clear invalid selections when iteration changes
  useEffect(() => {
    if (!isFirstIteration(currentIterationId)) {
      const previouslySelected = getPreviouslySelectedColleges(currentIterationId);
      if (previouslySelected) {
        // Clear any selected colleges that weren't in the previous iteration
        const validSelections = selectedColleges.filter(
          college => previouslySelected.includes(college)
        );
        if (validSelections.length !== selectedColleges.length) {
          setSelectedColleges(validSelections);
        }
      }
    }
  }, [currentIterationId, selectedColleges, getPreviouslySelectedColleges, setSelectedColleges, isFirstIteration]);

  // Effect to set selected colleges from context or location state
  useEffect(() => {
    // Check if we have colleges from location state (direct navigation)
    const stateColleges = location.state?.selectedColleges;
    if (stateColleges && stateColleges.length > 0) {
      setSelectedColleges(stateColleges);
      // Clear the location state to avoid reapplying on navigation
      window.history.replaceState({}, document.title);
    } 
    // Otherwise check if we have colleges from the comparison context
    else if (selectedForComparison.length > 0 && selectedColleges.length === 0) {
      setSelectedColleges(selectedForComparison);
      // Clear the comparison context after applying
      clearComparison();
    }
  }, [location.state, selectedForComparison, selectedColleges.length, setSelectedColleges, clearComparison]);

  // Track if we're in a subsequent iteration (not the first one)
  const [isSubsequentIteration, setIsSubsequentIteration] = useState(() => {
    // Check localStorage directly
    try {
      const hasHistory = localStorage.getItem('collegeIterationHistory');
      const parsedHistory = hasHistory ? JSON.parse(hasHistory) : {};
      return Object.keys(parsedHistory).length > 0;
    } catch (e) {
      return false;
    }
  });

  // Update isSubsequentIteration when iterationId changes
  useEffect(() => {
    const isFirst = isFirstIteration(currentIterationId);
    setIsSubsequentIteration(!isFirst);
    
    console.log('🔄 [ComparisonPage] Updated isSubsequentIteration:', !isFirst);
  }, [currentIterationId, isFirstIteration]);

  // Log the current iteration state
  useEffect(() => {
    console.log('🔍 [ComparisonPage] Iteration state updated:', {
      iterationId: currentIterationId,
      isFirst: isFirstIteration(currentIterationId),
      isSubsequent: isSubsequentIteration,
      availableColleges: availableColleges.length,
      selectedColleges: selectedColleges.length,
      hasCompletedFirstIteration: localStorage.getItem('hasCompletedFirstIteration') === 'true'
    });
  }, [currentIterationId, isFirstIteration, isSubsequentIteration, availableColleges.length, selectedColleges.length]);

  // Handle starting a new iteration
  const handleNewIteration = useCallback(() => {
    if (selectedColleges.length === 0) return;
    
    console.log('🔄 [ComparisonPage] Starting new iteration with selected colleges:', selectedColleges);
    
    // Save current selection to history
    saveIteration(currentIterationId, selectedColleges);
    
    // Set flag in localStorage to indicate we're in a subsequent iteration
    localStorage.setItem('hasCompletedFirstIteration', 'true');
    
    // Generate new iteration ID
    const newIterationId = `iteration-${Date.now()}`;
    console.log('🆕 [ComparisonPage] Generated new iteration ID:', newIterationId);
    
    // Force isSubsequentIteration to true for the next render
    setIsSubsequentIteration(true);
    
    // Clear current selection since we're starting a new iteration
    setSelectedColleges([]);
    setSelectedParameters([]);
    
    // Set the new iteration ID last to trigger re-renders with cleared selections
    setCurrentIterationId(newIterationId);
    
    console.log('✅ [ComparisonPage] New iteration ID set:', newIterationId);
    
    // Force a re-render by updating a state variable
    setForceUpdate(prev => prev + 1);
    console.log('🔄 [ComparisonPage] Force update triggered:', forceUpdate + 1);
  }, [currentIterationId, selectedColleges, saveIteration, setSelectedColleges, setSelectedParameters]);

  // Add a state variable to force re-renders
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force a complete remount of SelectionControls when iteration changes
  const selectionControlsKey = `selection-controls-${currentIterationId}-${forceUpdate}`;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');

  const handleSelectAll = () => {
    if (selectedColleges.length === colleges.length) {
      setSelectedColleges([]);
    } else {
      setSelectedColleges(colleges);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">College Comparison</h1>
        <div className="flex items-center gap-4">
          {isSubsequentIteration && (
            <div className="text-sm text-muted-foreground">
              Iteration: {isFirstIteration(currentIterationId) ? 'First' : 'Subsequent'} 
              ({availableColleges.length} colleges available)
            </div>
          )}
        </div>
      </div>

      {/* Single column layout for college selection with parameter dropdown at top */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Colleges</CardTitle>
            <CardDescription>Choose the colleges you want to compare</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Parameter selection dropdown styled like in the explore page */}
            <div className="mb-4 w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">Select Parameters</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedParameters.length === 0 ? 'No parameters selected' : `${selectedParameters.length} selected`}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-0 w-full max-w-screen-md scrollable-dropdown-content" align="start" sideOffset={4}>
                  <ParameterSelector
                    parameters={parameters}
                    selectedParameters={selectedParameters}
                    parameterInfo={parameterInfo}
                    onParametersChange={setSelectedParameters}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <SelectionControls
              colleges={colleges}
              parameters={parameters}
              selectedColleges={selectedColleges}
              selectedParameters={selectedParameters}
              onCollegesChange={setSelectedColleges}
              onParametersChange={setSelectedParameters}
              isLoading={loading}
              key={selectionControlsKey}
            />
          </CardContent>
        </Card>
      </div>
      
      {selectedColleges.length > 0 && selectedParameters.length > 0 && (
        <CollegeComparison
          colleges={colleges}
          selectedColleges={selectedColleges}
          selectedParameters={selectedParameters}
          iterationId={currentIterationId}
        />
      )}

      {/* Show helpful message if either colleges or parameters are not selected */}
      {(selectedColleges.length === 0 || selectedParameters.length === 0) && (
        <Card className="bg-muted/40">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              {selectedColleges.length === 0 && (
                <p>Please select colleges to compare</p>
              )}
              {selectedColleges.length > 0 && selectedParameters.length === 0 && (
                <p>Please select parameters for comparison</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
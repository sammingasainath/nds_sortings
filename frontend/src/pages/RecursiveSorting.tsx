import React, { useState, useEffect } from 'react';
import { useCollegeData } from '@/hooks/useCollegeData';
import { SelectionControls } from '@/components/SelectionControls';
import { ParetoVisualization } from '@/components/ParetoVisualization';
import { Button } from '@/components/ui/button';
import { Play, Settings, Sparkles, MessageSquare, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatInterface } from '@/components/LLMChat/ChatInterface';
import { InsightCard } from '@/components/LLMInsights/InsightCard';
import { ParameterSuggestion } from '@/components/LLMInsights/ParameterSuggestion';
import { ProviderSelector } from '@/components/APIKeyManagement/ProviderSelector';
import { AISidebarConfig } from '@/components/APIKeyManagement/AISidebarConfig';
import { useLLM } from '@/contexts/LLMContext';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useCollegeHistory } from '@/hooks/useCollegeHistory';
import { useSortingHistory } from '@/contexts/SortingHistoryContext';
import { SortingBreadcrumbs } from '@/components/SortingBreadcrumbs';
import { ParameterSelector } from '@/components/ParameterSelector';
import { parameterInfo } from '@/lib/parameterInfo';
import { AdvancedParameterDropdown } from '@/components/AdvancedParameterDropdown';
import { ImprovedParameterSuggestion } from '@/components/ImprovedParameterSuggestion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const RecursiveSorting: React.FC = () => {
    const {
        colleges,
        parameters,
        selectedColleges,
        setSelectedColleges,
        selectedParameters,
        setSelectedParameters,
        sortingResults,
        setSortingResults,
        loading,
        error,
        runSorting,
        resetState
    } = useCollegeData();

    // Add college history hook
    const { saveIteration, isFirstIteration } = useCollegeHistory();
    
    // Add sorting history context
    const { addSorting, state: sortingHistoryState } = useSortingHistory();

    // Add iteration state
    const [currentIterationId, setCurrentIterationId] = useState<string>(() => 
        `iteration-${Date.now()}`
    );

    // Track if we're in a subsequent iteration
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

    const [selectedForNextIteration, setSelectedForNextIteration] = useState<string[]>([]);
    const navigate = useNavigate();
    const { llmService, isConfigured, initializeLLMService, hasSkippedConfig } = useLLM();
    const [collegeInsight, setCollegeInsight] = useState<string | null>(null);
    const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("selection");
    const [showAIInsights, setShowAIInsights] = useState<boolean>(false);
    const [needsApiKey, setNeedsApiKey] = useState(false);

    // Track iteration history
    const [iterationHistory, setIterationHistory] = useState<{
        id: string;
        collegeCount: number;
        timestamp: number;
    }[]>([]);

    // Debug current tab
    useEffect(() => {
        console.log("Current active tab:", activeTab);
    }, [activeTab]);

    // Function to directly switch tabs - completely rewritten
    const switchTab = (tab: string) => {
        console.log(`ATTEMPTING TO SWITCH TAB TO: ${tab}`);
        // Force immediate state update
        setActiveTab(tab);
        
        // Log the state update
        console.log(`Tab state updated to: ${tab}`);
        
        // Force a re-render and DOM update
        requestAnimationFrame(() => {
            console.log(`Animation frame executed, tab should be: ${tab}`);
            // Dispatch an event to ensure any listeners update
            window.dispatchEvent(new Event('resize'));
        });
    };

    const handleStartSort = React.useCallback(() => {
        if (selectedColleges.length === 0 || selectedParameters.length === 0) {
            console.log('[handleStartSort] Cannot start - missing selections:', {
                collegesSelected: selectedColleges.length,
                parametersSelected: selectedParameters.length
            });
            return;
        }
        console.log('[handleStartSort] Starting sort with:', {
            selectedColleges,
            selectedParameters
        });
        
        // Log the actual college objects that match the selected IDs or names
        const matchingColleges = colleges.filter(college => 
            selectedColleges.includes(college.Name) || selectedColleges.includes(college['Unnamed: 0'])
        );
        console.log('[handleStartSort] Found matching colleges:', matchingColleges.length);
        console.log('[handleStartSort] College details:', matchingColleges.map(c => ({ 
            id: c['Unnamed: 0'], 
            name: c.Name,
            matchedById: selectedColleges.includes(c['Unnamed: 0']),
            matchedByName: selectedColleges.includes(c.Name)
        })));
        
        setSelectedForNextIteration([]); // Clear any previous selections
        runSorting();
    }, [selectedColleges, selectedParameters, runSorting, colleges]);

    // Effect to switch to Results tab after sorting is complete
    React.useEffect(() => {
        if (sortingResults.length > 0) {
            console.log('SORTING RESULTS DETECTED - SWITCHING TO RESULTS TAB');
            setActiveTab("results");
            
            // Save sorting results to history context
            console.log('Saving sorting results to history:', {
                selectedColleges,
                selectedParameters,
                sortingResults
            });
            
            addSorting({
                parentId: null,
                selectedColleges,
                selectedParameters,
                sortingResults
            });
        }
    }, [sortingResults, selectedColleges, selectedParameters, addSorting]);

    // Generate insights only when explicitly requested
    const generateInsights = async () => {
        setIsGeneratingInsight(true);
        setNeedsApiKey(false);

        try {
            // Initialize LLM service if needed
            if (!isConfigured) {
                const initialized = await initializeLLMService();
                if (!initialized) {
                    setNeedsApiKey(true);
                    setCollegeInsight('Please configure your API key in the settings to use AI features.');
                    setIsGeneratingInsight(false);
                    return;
                }
            }

            // Now we should have a valid llmService
            if (!llmService || sortingResults.length === 0) {
                setCollegeInsight('LLM service is not available or no sorting results to analyze.');
                setIsGeneratingInsight(false);
                return;
            }

            // Get the top colleges from the first front
            const topColleges = sortingResults
                .filter(result => result.frontNumber === 1)
                .map(result => result.college);

            // Generate insights
            const insight = await llmService.getCollegeInsights({
                colleges: topColleges,
                parameters: selectedParameters
            });

            setCollegeInsight(insight);
        } catch (error) {
            console.error('Error generating insights:', error);
            setCollegeInsight('Failed to generate insights. Please try again.');
        } finally {
            setIsGeneratingInsight(false);
        }
    };

    // Handle starting a new iteration with selected colleges
    const handleStartNewIterationClick = () => {
        if (selectedForNextIteration.length === 0) {
            console.log('No colleges selected for next iteration');
            return;
        }

        console.log('🔄 [RecursiveSorting] Starting new iteration with selected colleges:', selectedForNextIteration);
        
        // Convert college IDs to college names
        const selectedCollegeNames = colleges
            .filter(college => selectedForNextIteration.includes(college['Unnamed: 0']))
            .map(college => college.Name);
        
        console.log('🔄 [RecursiveSorting] Converted to college names:', selectedCollegeNames);
        
        // Save current selection to history
        saveIteration(currentIterationId, selectedCollegeNames);
        
        // Set flag in localStorage to indicate we're in a subsequent iteration
        localStorage.setItem('hasCompletedFirstIteration', 'true');
        
        // Generate new iteration ID
        const newIterationId = `iteration-${Date.now()}`;
        console.log('🆕 [RecursiveSorting] Generated new iteration ID:', newIterationId);
        
        // Force isSubsequentIteration to true for the next render
        setIsSubsequentIteration(true);
        
        // Set the selected colleges to those chosen for the next iteration
        setSelectedColleges(selectedCollegeNames);
        
        // Reset the sorting results
        setSortingResults([]);
        
        // Clear the selection for next iteration
        setSelectedForNextIteration([]);
        
        // Set the new iteration ID
        setCurrentIterationId(newIterationId);
        
        // Switch back to the selection tab
        switchTab("selection");
        
        // Log the state for debugging
        console.log('🔄 [RecursiveSorting] New iteration started with:', {
            newIterationId,
            selectedColleges: selectedCollegeNames,
            isSubsequentIteration: true
        });
    };

    const canStartSort = selectedColleges.length > 0 && selectedParameters.length > 0;

    // Load restored entry data when component mounts or when current entry ID changes
    React.useEffect(() => {
        const currentEntryId = sortingHistoryState.currentEntryId;
        if (currentEntryId && sortingHistoryState.entries[currentEntryId]) {
            console.log('Loading restored entry data:', currentEntryId);
            const entry = sortingHistoryState.entries[currentEntryId];
            
            // Set selected colleges and parameters
            setSelectedColleges(entry.selectedColleges);
            setSelectedParameters(entry.selectedParameters);
            
            // Set sorting results
            setSortingResults(entry.sortingResults);
            
            // Switch to results tab if there are sorting results
            if (entry.sortingResults.length > 0) {
                console.log('Switching to results tab due to restored entry');
                setActiveTab("results");
            } else {
                console.log('Switching to selection tab due to restored entry');
                setActiveTab("selection");
            }
        }
    }, [sortingHistoryState.currentEntryId, sortingHistoryState.entries, setSelectedColleges, setSelectedParameters, setSortingResults]);

    // Add iteration to history when starting new iteration
    useEffect(() => {
        if (currentIterationId && selectedColleges.length > 0) {
            setIterationHistory(prev => {
                // Check if this iteration is already in history
                if (prev.some(it => it.id === currentIterationId)) {
                    return prev;
                }
                return [...prev, {
                    id: currentIterationId,
                    collegeCount: selectedColleges.length,
                    timestamp: Date.now()
                }];
            });
        }
    }, [currentIterationId, selectedColleges]);

    // Handle reset/new sort
    const handleReset = () => {
        // Clear selections
        setSelectedColleges([]);
        setSelectedParameters([]);
        setSortingResults([]);
        
        // Reset iteration state
        setCurrentIterationId(`iteration-${Date.now()}`);
        setIsSubsequentIteration(false);
        
        // Clear history
        setIterationHistory([]);
        
        // Clear localStorage flags
        localStorage.removeItem('hasCompletedFirstIteration');
        
        // Switch to selection tab
        setActiveTab("selection");
    };

    if (loading) {
        return (
            <Layout>
                <motion.div 
                    className="flex h-screen items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div 
                        className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                </motion.div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <SortingBreadcrumbs 
                        iterations={iterationHistory}
                        currentIterationId={currentIterationId}
                    />
                    {(iterationHistory.length > 0 || selectedColleges.length > 0) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            New Sort
                        </Button>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between items-center mb-6">
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="selection">Selection</TabsTrigger>
                            <TabsTrigger value="results" disabled={sortingResults.length === 0}>Results</TabsTrigger>
                            <TabsTrigger value="insights" disabled={sortingResults.length === 0}>AI Insights</TabsTrigger>
                        </TabsList>
                        
                        <div className="flex gap-2">
                            <AISidebarConfig>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    Configure AI
                                </Button>
                            </AISidebarConfig>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Chat
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle>AI Assistant</SheetTitle>
                                        <SheetDescription>
                                            Ask questions about colleges, parameters, or the sorting process
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-4">
                                        <ChatInterface />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    <TabsContent value="selection" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Parameters</CardTitle>
                                    <CardDescription>
                                        Choose the parameters for college comparison
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AdvancedParameterDropdown
                                        parameters={parameters}
                                        selectedParameters={selectedParameters}
                                        onParametersChange={setSelectedParameters}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle>AI Parameter Recommendations</CardTitle>
                                        <CardDescription>
                                            Get AI-powered parameter suggestions based on your goals
                                        </CardDescription>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Sparkles className="h-4 w-4" />
                                                AI Suggestions
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0" side="bottom" align="start" sideOffset={5} style={{ maxWidth: '100%', width: '100%' }}>
                                            <ImprovedParameterSuggestion 
                                                availableParameters={parameters}
                                                onParametersSelected={setSelectedParameters}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </CardHeader>
                            </Card>

                            <div className="w-full">
                                <SelectionControls
                                    colleges={colleges}
                                    parameters={parameters}
                                    selectedColleges={selectedColleges}
                                    selectedParameters={selectedParameters}
                                    onCollegesChange={setSelectedColleges}
                                    onParametersChange={setSelectedParameters}
                                    isLoading={loading}
                                    iterationId={currentIterationId}
                                    isSubsequentIteration={isSubsequentIteration}
                                    key={`selection-controls-${currentIterationId}`}
                                />
                            </div>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Run Sorting</CardTitle>
                                    <CardDescription>
                                        Start the college sorting process with your selected parameters
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-sm">
                                                    Selected: <span className="font-medium">{selectedColleges.length}</span> colleges, 
                                                    <span className="font-medium ml-1">{selectedParameters.length}</span> parameters
                                                </div>
                                                {!canStartSort && (
                                                    <div className="text-xs text-amber-600 mt-1">
                                                        Please select at least one college and one parameter to proceed
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleStartSort}
                                                    disabled={!canStartSort || loading}
                                                    className="gap-2"
                                                    size="lg"
                                                >
                                                    {loading ? (
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <Play className="h-4 w-4" />
                                                    )}
                                                    Start Sorting
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        {error && (
                                            <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="results" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <ParetoVisualization 
                                data={sortingResults}
                                onSelectionChange={setSelectedForNextIteration}
                                selectedIds={selectedForNextIteration}
                            />
                            
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Selected for next iteration:</span>
                                    <span className="font-medium">{selectedForNextIteration.length}</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        onClick={handleStartNewIterationClick}
                                        disabled={selectedForNextIteration.length === 0}
                                        className="gap-2"
                                    >
                                        <Play className="h-4 w-4" />
                                        Start New Iteration
                                    </Button>
                                    
                                    <Button
                                        variant="outline"
                                        onClick={resetState}
                                        className="gap-2"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Reset All
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>AI Insights</CardTitle>
                                <CardDescription>
                                    Analysis of your optimal colleges
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-sm rounded-md border border-amber-200 dark:border-amber-900">
                                    <p className="font-medium mb-2">Disclaimer:</p>
                                    <p>The insights provided are generated by AI and may not always be accurate or complete. They are based on the available data and should be used as a supplementary tool, not as the sole basis for decision-making.</p>
                                    <p className="mt-2">Always verify important information from official sources.</p>
                                </div>
                                
                                {!collegeInsight && !isGeneratingInsight ? (
                                    <div className="text-center p-8">
                                        <p className="text-muted-foreground mb-4">
                                            Click the button below to generate AI insights about your optimal colleges.
                                        </p>
                                        <Button 
                                            onClick={generateInsights}
                                            disabled={sortingResults.length === 0 || isGeneratingInsight}
                                            className="gap-2"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            Generate Insights
                                        </Button>
                                        
                                        {needsApiKey && (
                                            <div className="mt-4">
                                                <p className="text-sm text-amber-600 mb-2">
                                                    AI insights are optional. You can still use the sorting functionality without AI.
                                                </p>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="text-xs"
                                                    onClick={() => {
                                                        // Do nothing or handle differently
                                                        console.log("API key configuration is disabled");
                                                    }}
                                                >
                                                    Continue Without AI
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <InsightCard
                                        title="College Analysis"
                                        description="Detailed analysis of your optimal colleges"
                                        insight={collegeInsight}
                                        isLoading={isGeneratingInsight}
                                        needsApiKey={needsApiKey}
                                        onConfigureApiKey={() => {
                                            // Do nothing or handle differently
                                            console.log("API key configuration is disabled");
                                        }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}; 
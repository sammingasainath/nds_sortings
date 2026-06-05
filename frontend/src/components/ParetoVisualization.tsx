import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, CheckSquare, ArrowUpDown, ArrowUp, ArrowDown, SortAsc, AlertCircle, Info, X, Settings, Filter } from "lucide-react";
import { NonDominatedSortingResult } from '@/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parameterInfo } from '@/lib/parameterInfo';
import { Portal } from '@/components/ui/portal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Types
interface CollegeDetails {
    'Unnamed: 0': string;
    Name: string;
    [key: string]: string | number;
}

interface FrontGroup {
    front: number;
    colleges: CollegeDetails[];
}

interface ParetoVisualizationProps {
    data: NonDominatedSortingResult[];
    onSelectionChange: (collegeIds: string[]) => void;
    selectedIds: string[];
}

interface ScrollControlsProps {
    onScroll: (direction: 'left' | 'right') => void;
    canScrollLeft: boolean;
    canScrollRight: boolean;
}

// Add interface for outliers
interface OutlierInfo {
    collegeId: string;
    parameter: string;
    value: number;
    threshold: number;
    percentageBelowMean: number;
}

// Add context for global settings
interface GlobalSettingsContextType {
  globalSortBy: SortOption;
  setGlobalSortBy: (option: SortOption) => void;
  globalSelectedParameter: string;
  setGlobalSelectedParameter: (param: string) => void;
  globalShowOutliers: boolean;
  setGlobalShowOutliers: (show: boolean) => void;
  globalTopN: number;
  setGlobalTopN: (n: number) => void;
  globalSelectedParameters: string[];
  setGlobalSelectedParameters: (params: string[]) => void;
}

const GlobalSettingsContext = React.createContext<GlobalSettingsContextType | undefined>(undefined);

// Hook to use settings context
const useGlobalSettings = () => {
  const context = React.useContext(GlobalSettingsContext);
  if (context === undefined) {
    throw new Error('useGlobalSettings must be used within a GlobalSettingsProvider');
  }
  return context;
};

// Helper function to get parameter information with fallback
const getParameterInfo = (paramCode: string) => {
    // Try to get the parameter info
    const info = parameterInfo[paramCode];
    
    // If not found, return a default object
    if (!info) {
        return {
            fullName: paramCode,
            description: `Parameter ${paramCode}`,
            category: 'Unknown'
        };
    }
    
    return info;
};

// Function to detect outliers in the front
const detectOutliers = (colleges, availableParameters): OutlierInfo[] => {
    const outliers: OutlierInfo[] = [];
    
    if (colleges.length < 3) return outliers; // Need at least 3 colleges to detect outliers
    
    availableParameters.forEach(param => {
        // Extract values for this parameter
        const values = colleges.map(c => parseFloat(c.college[param] as string) || 0);
        if (values.every(v => v === 0)) return; // Skip if all values are 0
        
        // Calculate statistics
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const stdDev = Math.sqrt(
            values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
        );
        
        // Define threshold for outliers (1.5 standard deviations below mean)
        const threshold = mean - 1.5 * stdDev;
        
        // Find outliers
        colleges.forEach(college => {
            const value = parseFloat(college.college[param] as string) || 0;
            if (value < threshold && value > 0) { // Only consider non-zero values
                // Calculate percentage below mean
                const percentageBelowMean = mean > 0 ? ((mean - value) / mean) * 100 : 0;
                
                outliers.push({
                    collegeId: college.college['Unnamed: 0'] as string,
                    parameter: param,
                    value,
                    threshold,
                    percentageBelowMean
                });
            }
        });
    });
    
    return outliers;
};

// Helper Components
const ScrollControls: React.FC<ScrollControlsProps> = ({
    onScroll,
    canScrollLeft,
    canScrollRight,
}) => (
    <div className="flex justify-end gap-2 mb-4">
        <Button
            variant="outline"
            size="icon"
            onClick={() => onScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
            variant="outline"
            size="icon"
            onClick={() => onScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
    </div>
);

const ParameterValue: React.FC<{
    param: string;
    value: string | number;
}> = ({ param, value }) => (
    <div className="grid grid-cols-2 gap-2 text-xs">
        <span className="text-muted-foreground truncate">{param}:</span>
        <span className="truncate">{value}</span>
    </div>
);

const CollegeCard: React.FC<{
    college: CollegeDetails;
    parameters: string[];
    isSelected?: boolean;
    onSelect?: (collegeId: string) => void;
}> = ({ college, parameters, isSelected, onSelect }) => {
    return (
        <div 
            className={cn(
                "p-4 hover:bg-accent/5 transition-colors cursor-pointer",
                isSelected && "bg-primary/10 hover:bg-primary/20"
            )}
            onClick={() => onSelect?.(college['Unnamed: 0'])}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-medium">{college.Name}</h4>
                    <div className="mt-2 space-y-1">
                        {parameters.map(param => (
                            <p key={param} className="text-sm">
                                <span className="font-medium">{param}:</span>{' '}
                                {college[param]}
                            </p>
                        ))}
                    </div>
                </div>
                {isSelected && (
                    <div className="text-primary">
                        <Check className="h-5 w-5" />
                    </div>
                )}
            </div>
        </div>
    );
};

interface FrontBoxProps {
    frontNumber: number;
    colleges: NonDominatedSortingResult[];
    onCollegeSelect: (collegeIds: string[]) => void;
    selectedCollegeIds: string[];
    csvRankMap: Map<string, number>;
}

// Add sort options type
type SortOption = 'nirf' | 'alphabetical' | 'parameter' | 'balanced';

const FrontBox: React.FC<FrontBoxProps> = ({
    frontNumber,
    colleges,
    onCollegeSelect,
    selectedCollegeIds,
    csvRankMap
}) => {
    // Get global settings instead of local state
    const {
      globalSortBy: sortBy,
      globalSelectedParameter: selectedParameter,
      globalShowOutliers: showOutliers,
      globalTopN: topN,
      globalSelectedParameters: selectedParameters,
    } = useGlobalSettings();

    // Only keep local state for dialog
    const [parametersDialogOpen, setParametersDialogOpen] = useState<boolean>(false);
    
    // Get available parameters
    const availableParameters = useMemo(() => {
        const allParams = new Set<string>();
        colleges.forEach(result => {
            Object.keys(result.college).forEach(key => {
                // Filter out non-parameter fields
                if (
                    key !== 'Name' && 
                    key !== 'Unnamed: 0' && 
                    key !== 'NIRF 2022 Rank' &&
                    !key.includes('Rank')
                ) {
                    allParams.add(key);
                }
            });
        });
        return Array.from(allParams);
    }, [colleges]);
    
    // Get outliers
    const outliers = showOutliers ? detectOutliers(colleges, availableParameters) : [];
    
    // Check if a college has outliers
    const getCollegeOutliers = (collegeId: string) => {
        return outliers.filter(o => o.collegeId === collegeId);
    };

    const handleCollegeSelect = (collegeId: string) => {
        const newSelection = selectedCollegeIds.includes(collegeId)
            ? selectedCollegeIds.filter(id => id !== collegeId)
            : [...selectedCollegeIds, collegeId];
        onCollegeSelect(newSelection);
    };

    const handleSelectAll = () => {
        // Check if all colleges are already selected
        const allSelected = colleges.every(result => 
            selectedCollegeIds.includes(result.college['Unnamed: 0'] as string)
        );
        
        if (allSelected) {
            // Deselect all colleges in this front
            colleges.forEach(result => {
                const id = result.college['Unnamed: 0'] as string;
                if (selectedCollegeIds.includes(id)) {
                    onCollegeSelect(id);
                }
            });
        } else {
            // Select all colleges in this front
            colleges.forEach(result => {
                const id = result.college['Unnamed: 0'] as string;
                if (!selectedCollegeIds.includes(id)) {
                    onCollegeSelect(id);
                }
            });
        }
    };

    const isSelected = (collegeId: string) => selectedCollegeIds.includes(collegeId);

    // Sort colleges
    const sortedColleges = useMemo(() => {
        let sorted = [...colleges];
        
        // Apply topN filter first if set
        if (topN > 0 && topN < sorted.length) {
            // We need to sort first to know which are the top N
            let topSorted = [...sorted].sort((a, b) => {
                // Use the actual CSV rank for sorting
                const rankA = csvRankMap.get(a.college['Unnamed: 0'] as string) || 9999;
                const rankB = csvRankMap.get(b.college['Unnamed: 0'] as string) || 9999;
                return rankA - rankB;
            });
            
            // Get the IDs of the top N colleges
            const topNIds = topSorted.slice(0, topN).map(c => c.college['Unnamed: 0'] as string);
            
            // Filter the original list to only include these IDs
            sorted = sorted.filter(c => topNIds.includes(c.college['Unnamed: 0'] as string));
        }
        
        // Then sort by the selected criteria
        return sorted.sort((a, b) => {
            switch (sortBy) {
                case 'nirf':
                    // Use the actual CSV rank for sorting
                    const rankA = csvRankMap.get(a.college['Unnamed: 0'] as string) || 9999;
                    const rankB = csvRankMap.get(b.college['Unnamed: 0'] as string) || 9999;
                    return rankA - rankB;
                
                case 'alphabetical':
                    return (a.college.Name as string).localeCompare(b.college.Name as string);
                
                case 'parameter':
                    if (selectedParameter) {
                        const valueA = parseFloat(a.college[selectedParameter] as string) || 0;
                        const valueB = parseFloat(b.college[selectedParameter] as string) || 0;
                        return valueB - valueA; // Higher values first
                    }
                    return 0;
                
                case 'balanced':
                    // Calculate average normalized score across selected parameters
                    const paramsToConsider = selectedParameters.length > 0 
                        ? selectedParameters.filter(p => 
                            // Filter out non-numeric parameters
                            !isNaN(parseFloat(a.college[p] as string)) && 
                            !isNaN(parseFloat(b.college[p] as string))
                        ) 
                        : availableParameters.filter(p => 
                            // Filter out non-numeric parameters
                            !isNaN(parseFloat(a.college[p] as string)) && 
                            !isNaN(parseFloat(b.college[p] as string))
                        );
                    
                    if (paramsToConsider.length === 0) return 0;
                    
                    // Find max values for each parameter to normalize
                    const maxValues = {};
                    paramsToConsider.forEach(param => {
                        maxValues[param] = Math.max(
                            ...colleges.map(c => parseFloat(c.college[param] as string) || 0)
                        );
                    });
                    
                    // Calculate normalized score for each college
                    const scoreA = paramsToConsider.reduce((sum, param) => {
                        const value = parseFloat(a.college[param] as string) || 0;
                        const normalizedValue = maxValues[param] > 0 ? value / maxValues[param] : 0;
                        return sum + normalizedValue;
                    }, 0) / paramsToConsider.length;
                    
                    const scoreB = paramsToConsider.reduce((sum, param) => {
                        const value = parseFloat(b.college[param] as string) || 0;
                        const normalizedValue = maxValues[param] > 0 ? value / maxValues[param] : 0;
                        return sum + normalizedValue;
                    }, 0) / paramsToConsider.length;
                    
                    return scoreB - scoreA; // Higher average score first
                
                default:
                    return 0;
            }
        });
    }, [colleges, sortBy, selectedParameter, topN, selectedParameters, availableParameters, csvRankMap]);

    return (
        <div className="min-w-[320px] flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-medium">Optimal Group {frontNumber}</h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSelectAll}
                    className="text-xs h-7 px-2.5"
                >
                    Select All
                </Button>
            </div>
            
            <div className="border rounded-lg dark:border-gray-800 overflow-hidden">
                <div className="bg-muted/50 p-2 border-b dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-medium">{colleges.length} colleges in this group</span>
                    {sortBy === 'balanced' && selectedParameters.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                            Using {selectedParameters.length} parameters for equal weightage
                        </div>
                    )}
                </div>
                <ScrollArea className="h-[300px] p-4">
                    <div className="space-y-2.5 pr-4">
                        {sortedColleges.map((result, index) => {
                            const collegeId = result.college['Unnamed: 0'] as string;
                            const collegeOutliers = getCollegeOutliers(collegeId);
                            
                            return (
                                <div
                                    key={collegeId}
                                    className={cn(
                                        "p-3 rounded-md border transition-colors",
                                        isSelected(collegeId)
                                            ? "bg-primary/10 border-primary/30"
                                            : "bg-background hover:bg-accent/5 border-border",
                                        collegeOutliers.length > 0 && showOutliers 
                                            ? "border-yellow-500 bg-yellow-500/5 shadow-sm" 
                                            : ""
                                    )}
                                    onClick={() => handleCollegeSelect(collegeId)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={isSelected(collegeId)}
                                                    onCheckedChange={() => handleCollegeSelect(collegeId)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <div>
                                                    <div className="font-medium text-sm flex items-center flex-wrap gap-1.5">
                                                        {sortBy === 'balanced' && (
                                                            <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                                                                #{index + 1}
                                                            </span>
                                                        )}
                                                        <span>{result.college.Name as string}</span>
                                                        
                                                        {/* NIRF Rank badge - use the correct CSV position */}
                                                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                                            NIRF: {csvRankMap.get(collegeId) || 'N/A'}
                                                        </span>
                                                        
                                                        {/* Parameter value when sorting by parameter */}
                                                        {sortBy === 'parameter' && selectedParameter && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                                                {parameterInfo[selectedParameter]?.fullName || selectedParameter}: {result.college[selectedParameter] || 'N/A'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Outlier indicator with better layout */}
                                                    {collegeOutliers.length > 0 && showOutliers && (
                                                        <div className="mt-2 flex items-center">
                                                            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2" title="Has outliers"></span>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Create a fixed position dialog at the center of the screen
                                                                    const dialog = document.createElement('div');
                                                                    
                                                                    // Properly detect dark mode by checking for both 'dark' class and 'data-theme="dark"' attribute
                                                                    const isDarkMode = document.documentElement.classList.contains('dark') || 
                                                                              document.documentElement.getAttribute('data-theme') === 'dark' ||
                                                                              document.body.classList.contains('dark');
                                                                    
                                                                    // Use CSS variables from the site's theme for better consistency
                                                                    dialog.style.position = 'fixed';
                                                                    dialog.style.top = '50%';
                                                                    dialog.style.left = '50%';
                                                                    dialog.style.transform = 'translate(-50%, -50%)';
                                                                    dialog.style.backgroundColor = isDarkMode ? '#1e1e2e' : '#ffffff';
                                                                    dialog.style.color = isDarkMode ? '#e1e1e6' : '#1e1e2e';
                                                                    dialog.style.padding = '24px';
                                                                    dialog.style.borderRadius = '12px';
                                                                    dialog.style.border = `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`;
                                                                    dialog.style.boxShadow = isDarkMode 
                                                                        ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
                                                                        : '0 10px 25px rgba(0, 0, 0, 0.2)';
                                                                    dialog.style.maxWidth = '550px';
                                                                    dialog.style.width = '90%';
                                                                    dialog.style.maxHeight = '80vh';
                                                                    dialog.style.overflow = 'auto';
                                                                    dialog.style.zIndex = '9999';
                                                                    
                                                                    // Set dialog title for accessibility
                                                                    dialog.setAttribute('role', 'dialog');
                                                                    dialog.setAttribute('aria-modal', 'true');
                                                                    dialog.setAttribute('aria-labelledby', 'outlier-dialog-title');
                                                                    
                                                                    // Apply theme class to inherit styles
                                                                    if (isDarkMode) {
                                                                        dialog.classList.add('dark');
                                                                    }
                                                                    
                                                                    // Create close button
                                                                    const closeBtn = document.createElement('button');
                                                                    closeBtn.innerHTML = '&times;';
                                                                    closeBtn.style.position = 'absolute';
                                                                    closeBtn.style.top = '16px';
                                                                    closeBtn.style.right = '16px';
                                                                    closeBtn.style.border = 'none';
                                                                    closeBtn.style.background = 'none';
                                                                    closeBtn.style.fontSize = '28px';
                                                                    closeBtn.style.cursor = 'pointer';
                                                                    closeBtn.style.color = isDarkMode ? 'var(--foreground, #e1e1e6)' : 'var(--foreground, #1e1e2e)';
                                                                    closeBtn.style.opacity = '0.7';
                                                                    closeBtn.style.transition = 'opacity 0.2s';
                                                                    closeBtn.onmouseover = () => { closeBtn.style.opacity = '1'; };
                                                                    closeBtn.onmouseout = () => { closeBtn.style.opacity = '0.7'; };
                                                                    closeBtn.onclick = () => {
                                                                        document.body.removeChild(backdrop);
                                                                        document.body.removeChild(dialog);
                                                                    };
                                                                    dialog.appendChild(closeBtn);
                                                                    
                                                                    // Create content
                                                                    const content = document.createElement('div');
                                                                    content.innerHTML = `
                                                                        <h3 id="outlier-dialog-title" style="margin-top:0;font-size:16px;font-weight:600;margin-bottom:16px;padding-right:20px;color:${isDarkMode ? '#e1e1e6' : '#1e1e2e'}">
                                                                            Parameter Values Below Group Average
                                                                        </h3>
                                                                        <p style="font-size:14px;color:${isDarkMode ? '#a1a1aa' : '#666666'};margin-bottom:16px;">
                                                                            The following parameters have values significantly lower than other colleges in this group.
                                                                            This is a statistical observation and doesn't necessarily indicate quality issues.
                                                                        </p>
                                                                        <div style="margin-top:16px;">
                                                                            ${collegeOutliers.map(o => {
                                                                                const paramInfo = getParameterInfo(o.parameter);
                                                                                return `
                                                                                    <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};">
                                                                                        <div style="display:flex;justify-content:space-between;align-items:start;">
                                                                                            <div style="font-weight:500;color:${isDarkMode ? '#e1e1e6' : '#1e1e2e'}">${paramInfo.fullName || o.parameter}</div>
                                                                                            <div style="font-size:12px;padding:2px 6px;border-radius:4px;background:${isDarkMode ? '#443b07' : '#FEF9C3'};color:${isDarkMode ? '#f7de3f' : '#854D0E'};">
                                                                                                ${o.percentageBelowMean.toFixed(0)}% below average
                                                                                            </div>
                                                                                        </div>
                                                                                        <div style="font-size:12px;color:${isDarkMode ? '#a1a1aa' : '#666666'};margin-top:4px;">
                                                                                            <span>${paramInfo.category}</span>
                                                                                            ${paramInfo.weight ? `<span style="margin-left:6px;background:${isDarkMode ? '#082f49' : '#E0F2FE'};color:${isDarkMode ? '#7dd3fc' : '#075985'};padding:1px 4px;border-radius:4px;">Weight: ${paramInfo.weight}%</span>` : ''}
                                                                                        </div>
                                                                                        <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:8px;color:${isDarkMode ? '#a1a1aa' : '#666666'};">
                                                                                            <span>College value: <strong style="color:${isDarkMode ? '#e1e1e6' : '#1e1e2e'}">${o.value.toFixed(2)}</strong></span>
                                                                                            <span>Group average: <strong style="color:${isDarkMode ? '#e1e1e6' : '#1e1e2e'}">${(o.value + o.percentageBelowMean * o.value / 100).toFixed(2)}</strong></span>
                                                                                        </div>
                                                                                        <div style="font-size:12px;margin-top:8px;color:${isDarkMode ? '#a1a1aa' : '#666666'}">${paramInfo.description}</div>
                                                                                    </div>
                                                                                `;
                                                                            }).join('')}
                                                                        </div>
                                                                        <div style="font-size:12px;color:${isDarkMode ? '#a1a1aa' : '#666666'};margin-top:16px;padding-top:8px;border-top:1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};">
                                                                            These parameters may require attention if they align with your priorities, or may be less relevant depending on your specific interests.
                                                                        </div>
                                                                    `;
                                                                    dialog.appendChild(content);
                                                                    
                                                                    // Add backdrop
                                                                    const backdrop = document.createElement('div');
                                                                    backdrop.style.position = 'fixed';
                                                                    backdrop.style.top = '0';
                                                                    backdrop.style.left = '0';
                                                                    backdrop.style.width = '100%';
                                                                    backdrop.style.height = '100%';
                                                                    backdrop.style.backgroundColor = isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';
                                                                    backdrop.style.zIndex = '9998';
                                                                    backdrop.onclick = () => {
                                                                        document.body.removeChild(backdrop);
                                                                        document.body.removeChild(dialog);
                                                                    };
                                                                    
                                                                    // Add to body
                                                                    document.body.appendChild(backdrop);
                                                                    document.body.appendChild(dialog);
                                                                    
                                                                    // Add a mutation observer to watch for theme changes
                                                                    const themeObserver = new MutationObserver((mutations) => {
                                                                        mutations.forEach((mutation) => {
                                                                            if (mutation.type === 'attributes' && 
                                                                                (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
                                                                                
                                                                                // Re-check if dark mode is active
                                                                                const newIsDarkMode = document.documentElement.classList.contains('dark') || 
                                                                                                 document.documentElement.getAttribute('data-theme') === 'dark' ||
                                                                                                 document.body.classList.contains('dark');
                                                                                
                                                                                // Update dialog theme if it changed
                                                                                if (newIsDarkMode !== isDarkMode) {
                                                                                    // Update dialog styles
                                                                                    dialog.style.backgroundColor = newIsDarkMode ? '#1e1e2e' : '#ffffff';
                                                                                    dialog.style.color = newIsDarkMode ? '#e1e1e6' : '#1e1e2e';
                                                                                    dialog.style.border = `1px solid ${newIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`;
                                                                                    backdrop.style.backgroundColor = newIsDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';
                                                                                    
                                                                                    // Update classes
                                                                                    if (newIsDarkMode) {
                                                                                        dialog.classList.add('dark');
                                                                                    } else {
                                                                                        dialog.classList.remove('dark');
                                                                                    }
                                                                                    
                                                                                    // We would need to recreate the content for perfect dark mode support
                                                                                    // but for simplicity, we'll just update main styles
                                                                                }
                                                                            }
                                                                        });
                                                                    });
                                                                    
                                                                    // Start observing theme changes
                                                                    themeObserver.observe(document.documentElement, { attributes: true });
                                                                    themeObserver.observe(document.body, { attributes: true });
                                                                    
                                                                    // Clean up the observer when dialog is closed
                                                                    const originalCloseClick = closeBtn.onclick;
                                                                    closeBtn.onclick = () => {
                                                                        themeObserver.disconnect();
                                                                        if (originalCloseClick) originalCloseClick();
                                                                    };
                                                                    
                                                                    const originalBackdropClick = backdrop.onclick;
                                                                    backdrop.onclick = () => {
                                                                        themeObserver.disconnect();
                                                                        if (originalBackdropClick) originalBackdropClick();
                                                                    };
                                                                }}
                                                                className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs"
                                                            >
                                                                <AlertCircle className="h-3 w-3" />
                                                                <span>Outlier in:</span>
                                                                <span className="font-medium">{collegeOutliers.map(o => o.parameter).join(', ')}</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

// Add Global Controls Component
const GlobalControls: React.FC<{ availableParameters: string[] }> = ({ availableParameters }) => {
    const {
        globalSortBy,
        setGlobalSortBy,
        globalSelectedParameter,
        setGlobalSelectedParameter,
        globalShowOutliers,
        setGlobalShowOutliers,
        globalTopN,
        setGlobalTopN,
        globalSelectedParameters,
        setGlobalSelectedParameters
    } = useGlobalSettings();

    const [parametersDialogOpen, setParametersDialogOpen] = useState<boolean>(false);

    return (
        <div className="flex flex-wrap gap-3 mb-4 p-3 border rounded-lg bg-muted/30">
            {/* Sorting controls */}
            <div className="flex items-center gap-3 border-r pr-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">Sort:</label>
                    <Select
                        value={globalSortBy}
                        onValueChange={(value: SortOption) => setGlobalSortBy(value)}
                    >
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nirf">NIRF Rank</SelectItem>
                            <SelectItem value="alphabetical">Alphabetical</SelectItem>
                            <SelectItem value="parameter">By Parameter</SelectItem>
                            <SelectItem value="balanced">Equal Weightage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {globalSortBy === 'parameter' && (
                    <div className="flex items-center gap-2">
                        <Select
                            value={globalSelectedParameter}
                            onValueChange={setGlobalSelectedParameter}
                        >
                            <SelectTrigger className="h-8 w-[140px] text-xs">
                                <SelectValue placeholder="Select parameter" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableParameters.map(param => {
                                    const paramInfo = parameterInfo[param] || { fullName: param };
                                    return (
                                        <SelectItem key={param} value={param}>
                                            {paramInfo.fullName || param}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                
                {globalSortBy === 'balanced' && (
                    <Dialog open={parametersDialogOpen} onOpenChange={setParametersDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1.5">
                                <Settings className="h-3.5 w-3.5" />
                                Configure
                                <span className="sr-only">Configure parameters</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Select Parameters for Equal Weightage</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 max-h-[50vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-muted-foreground">
                                        Select the parameters to include in equal weightage calculation
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setGlobalSelectedParameters(
                                            globalSelectedParameters.length === availableParameters.length 
                                                ? [] 
                                                : [...availableParameters]
                                        )}
                                    >
                                        {globalSelectedParameters.length === availableParameters.length ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {availableParameters.map(param => {
                                        const paramInfo = parameterInfo[param] || { fullName: param };
                                        return (
                                            <div key={param} className="flex items-start">
                                                <Checkbox 
                                                    id={`global-param-${param}`}
                                                    checked={globalSelectedParameters.includes(param)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setGlobalSelectedParameters([...globalSelectedParameters, param]);
                                                        } else {
                                                            setGlobalSelectedParameters(globalSelectedParameters.filter(p => p !== param));
                                                        }
                                                    }}
                                                    className="mt-1"
                                                />
                                                <div className="ml-2">
                                                    <label 
                                                        htmlFor={`global-param-${param}`} 
                                                        className="text-sm font-medium leading-none cursor-pointer"
                                                    >
                                                        {paramInfo.fullName || param}
                                                    </label>
                                                    {paramInfo.category && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {paramInfo.category}
                                                            {paramInfo.weight && ` • Weight: ${paramInfo.weight}%`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="submit">Apply</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            
            {/* Filtering controls */}
            <div className="flex items-center gap-2 border-r pr-3 dark:border-gray-700">
                <label className="text-xs text-muted-foreground whitespace-nowrap">Filter:</label>
                <div className="flex items-center gap-1.5">
                    <Label htmlFor="global-topn" className="text-xs whitespace-nowrap">Top</Label>
                    <Input 
                        id="global-topn"
                        type="number" 
                        min="0" 
                        value={globalTopN || ''} 
                        onChange={e => setGlobalTopN(parseInt(e.target.value) || 0)}
                        className="h-8 w-16 text-xs" 
                        placeholder="All"
                    />
                </div>
            </div>
            
            {/* Outlier toggle */}
            <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Highlight:</label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant={globalShowOutliers ? "default" : "outline"} 
                                size="sm" 
                                className={cn(
                                    "h-8 text-xs",
                                    globalShowOutliers && "bg-yellow-500 hover:bg-yellow-600 text-black"
                                )}
                                onClick={() => setGlobalShowOutliers(!globalShowOutliers)}
                            >
                                {globalShowOutliers ? 'Outliers' : 'Outliers'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent 
                            className="max-w-[300px] p-3"
                            side="bottom"
                            align="center"
                            sideOffset={5}
                            avoidCollisions={true}
                        >
                            <p className="text-sm">Shows colleges with unusually low parameter values (1.5 standard deviations below group average)</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

// Main Component
export const ParetoVisualization: React.FC<ParetoVisualizationProps> = ({
    data,
    onSelectionChange,
    selectedIds,
}) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);

    // Global state
    const [globalSortBy, setGlobalSortBy] = useState<SortOption>('nirf');
    const [globalSelectedParameter, setGlobalSelectedParameter] = useState<string>('');
    const [globalShowOutliers, setGlobalShowOutliers] = useState<boolean>(true);
    const [globalTopN, setGlobalTopN] = useState<number>(0);
    const [globalSelectedParameters, setGlobalSelectedParameters] = useState<string[]>([]);
    
    // Create a map of college IDs to their CSV ranks (create a mapping of ID to their correct NIRF rank)
    // We can identify colleges by their 'Unnamed: 0' field which contains IDs like 'IR-E-U-0456'
    const csvRankMap = React.useMemo(() => {
        const rankMap = new Map<string, number>();
        
        // Map of known colleges IDs to their positions in the CSV file
        // This is based on the "Scores with Names.csv" file the user shared
        const knownColleges = [
            "IR-E-U-0456", // IIT Madras (1)
            "IR-E-U-0249", // Visvesvaraya Technological University (2)
            "IR-E-U-0619", // NIT Meghalaya (3)
            "IR-E-C-37013", // PSG College of Technology (4)
            "IR-E-U-0474", // Sathyabama Institute of Science and Technology (5)
            "IR-E-U-0749", // Manipal University, Jaipur (6)
            "IR-E-U-0878", // IIT Palakkad (7)
            "IR-E-U-0297", // Defence Institute of Advanced Technology (8)
            "IR-E-U-0906", // IIT Jammu (9)
            "IR-E-U-0844", // IIT Tirupati (10)
        ];
        
        // Add all known colleges with their CSV position (add 1 to make it 1-indexed)
        knownColleges.forEach((collegeId, index) => {
            rankMap.set(collegeId, index + 1);
        });
        
        // As a fallback for any colleges not in our known list,
        // use the original position in the dataset
        data.forEach((result, index) => {
            const collegeId = result.college['Unnamed: 0'] as string;
            if (!rankMap.has(collegeId)) {
                rankMap.set(collegeId, index + 1);
            }
        });
        
        return rankMap;
    }, [data]);

    // Get all available parameters across all colleges
    const allAvailableParameters = React.useMemo(() => {
        const allParams = new Set<string>();
        data.forEach(result => {
            Object.keys(result.college).forEach(key => {
                if (
                    key !== 'Name' && 
                    key !== 'Unnamed: 0' && 
                    key !== 'NIRF 2022 Rank' &&
                    !key.includes('Rank')
                ) {
                    allParams.add(key);
                }
            });
        });
        return Array.from(allParams);
    }, [data]);

    // Define updateScrollButtons first
    const updateScrollButtons = React.useCallback(() => {
        if (!scrollAreaRef.current) return;
        
        const container = scrollAreaRef.current;
        const scrollContainer = container.querySelector('[data-radix-scroll-area-viewport]');
        
        if (!scrollContainer) return;
        
        setCanScrollLeft(scrollContainer.scrollLeft > 0);
        setCanScrollRight(
            scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth - 1
        );
    }, []);

    // Define handleScrollEvent next
    const handleScrollEvent = React.useCallback(() => {
        updateScrollButtons();
    }, [updateScrollButtons]);

    // Group results by front
    const frontGroups = React.useMemo(() => {
        const groups = new Map<number, NonDominatedSortingResult[]>();
        data.forEach(result => {
            const frontNumber = result.frontNumber;
            if (!groups.has(frontNumber)) {
                groups.set(frontNumber, []);
            }
            groups.get(frontNumber)?.push(result);
        });
        return Array.from(groups.entries())
            .sort(([a], [b]) => a - b)
            .map(([front, colleges]) => ({ front, colleges }));
    }, [data]);

    // Define handleScroll after updateScrollButtons
    const handleScroll = React.useCallback((direction: 'left' | 'right') => {
        if (!scrollAreaRef.current) return;
        
        const container = scrollAreaRef.current;
        const scrollContainer = container.querySelector('[data-radix-scroll-area-viewport]');
        
        if (!scrollContainer) return;
        
        const scrollAmount = 320; // Width of a card + gap
        
        if (direction === 'left') {
            scrollContainer.scrollLeft -= scrollAmount;
        } else {
            scrollContainer.scrollLeft += scrollAmount;
        }
        
        // Update scroll buttons after scrolling
        setTimeout(updateScrollButtons, 100);
    }, [updateScrollButtons]);

    React.useEffect(() => {
        const container = scrollAreaRef.current;
        if (!container) return;

        const scrollContainer = container.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollContainer) return;

        // Add event listeners
        scrollContainer.addEventListener('scroll', handleScrollEvent);
        window.addEventListener('resize', handleScrollEvent);

        // Initial check
        updateScrollButtons();

        return () => {
            // Clean up event listeners
            scrollContainer.removeEventListener('scroll', handleScrollEvent);
            window.removeEventListener('resize', handleScrollEvent);
        };
    }, [updateScrollButtons, handleScrollEvent]);

    // Additional effect to update scroll buttons when data changes
    React.useEffect(() => {
        // Update scroll buttons when data changes
        if (data.length > 0) {
            // Small delay to ensure DOM is updated
            setTimeout(updateScrollButtons, 100);
        }
    }, [data, updateScrollButtons]);

    if (frontGroups.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        No results available. Start sorting to see the Pareto fronts.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <GlobalSettingsContext.Provider value={{
            globalSortBy,
            setGlobalSortBy,
            globalSelectedParameter,
            setGlobalSelectedParameter,
            globalShowOutliers,
            setGlobalShowOutliers, 
            globalTopN,
            setGlobalTopN,
            globalSelectedParameters,
            setGlobalSelectedParameters
        }}>
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <CardTitle>Optimal Groups</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center">
                            <p className="text-muted-foreground">
                                No sorting results available. Select colleges and parameters, then run the sorting algorithm.
                            </p>
                        </div>
                    ) : (
                        <>
                            <GlobalControls availableParameters={allAvailableParameters} />
                            <ScrollControls
                                onScroll={handleScroll}
                                canScrollLeft={canScrollLeft}
                                canScrollRight={canScrollRight}
                            />
                            <div ref={scrollAreaRef}>
                                <ScrollArea className="w-full">
                                    <div className="flex gap-4 pb-4">
                                        {frontGroups.map((group) => (
                                            <FrontBox
                                                key={group.front}
                                                frontNumber={group.front}
                                                colleges={data.filter(item => item.frontNumber === group.front)}
                                                onCollegeSelect={onSelectionChange}
                                                selectedCollegeIds={selectedIds}
                                                csvRankMap={csvRankMap}
                                            />
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </GlobalSettingsContext.Provider>
    );
}; 
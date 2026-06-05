import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Filter, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ParameterInfoCard } from '@/components/ParameterInfoCard';
import { parameterInfo } from '@/lib/parameterInfo';

// Parameter category colors
const categoryColors: Record<string, string> = {
  "Teaching, Learning & Resources (TLR)": "bg-blue-500",
  "Research and Professional Practice (RP)": "bg-purple-500",
  "Graduation Outcomes (GO)": "bg-green-500",
  "Outreach and Inclusivity (OI)": "bg-amber-500",
  "Perception (PR)": "bg-red-500",
  "Other": "bg-gray-400"
};

interface AdvancedParameterDropdownProps {
  parameters: string[];
  selectedParameters: string[];
  onParametersChange: (parameters: string[]) => void;
}

export const AdvancedParameterDropdown: React.FC<AdvancedParameterDropdownProps> = ({
  parameters,
  selectedParameters,
  onParametersChange
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Group parameters by category
  const parametersByCategory = React.useMemo(() => {
    const categories: Record<string, string[]> = {};
    
    parameters.forEach(param => {
      const category = parameterInfo[param]?.category || "Other";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(param);
    });
    
    return categories;
  }, [parameters]);

  // Filter parameters based on search and category
  const filteredParameters = React.useMemo(() => {
    let result: string[] = [];
    
    Object.entries(parametersByCategory).forEach(([category, params]) => {
      if (activeCategory && category !== activeCategory) return;
      
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const filtered = params.filter(param => {
          const info = parameterInfo[param];
          return param.toLowerCase().includes(searchLower) || 
                (info?.fullName || '').toLowerCase().includes(searchLower) ||
                (info?.description || '').toLowerCase().includes(searchLower);
        });
        result = [...result, ...filtered];
      } else {
        result = [...result, ...params];
      }
    });
    
    return result;
  }, [parametersByCategory, searchValue, activeCategory]);

  // Toggle parameter selection
  const toggleParameter = (param: string) => {
    if (selectedParameters.includes(param)) {
      onParametersChange(selectedParameters.filter(p => p !== param));
    } else {
      onParametersChange([...selectedParameters, param]);
    }
  };

  // Toggle all parameters in a category
  const toggleCategory = (category: string) => {
    const categoryParams = parametersByCategory[category] || [];
    const allSelected = categoryParams.every(param => selectedParameters.includes(param));
    
    if (allSelected) {
      // Deselect all in category
      onParametersChange(selectedParameters.filter(param => !categoryParams.includes(param)));
    } else {
      // Select all in category
      const newSelected = [...selectedParameters];
      categoryParams.forEach(param => {
        if (!newSelected.includes(param)) {
          newSelected.push(param);
        }
      });
      onParametersChange(newSelected);
    }
  };

  // Get the count of selected parameters in each category
  const getSelectedCountByCategory = (category: string) => {
    const categoryParams = parametersByCategory[category] || [];
    return categoryParams.filter(param => selectedParameters.includes(param)).length;
  };

  // Calculate category selection state
  const getCategorySelectionState = (category: string) => {
    const categoryParams = parametersByCategory[category] || [];
    const selectedCount = getSelectedCountByCategory(category);
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === categoryParams.length) return 'all';
    return 'some';
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    return categoryColors[category] || "bg-gray-400";
  };

  // Clear all selections
  const clearAll = () => {
    onParametersChange([]);
  };

  return (
    <div className="w-full relative">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto py-3 text-left"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">Select Parameters</span>
              <span className="text-xs text-muted-foreground">
                {selectedParameters.length === 0 
                  ? 'No parameters selected' 
                  : `${selectedParameters.length} parameter${selectedParameters.length === 1 ? '' : 's'} selected`}
              </span>
            </div>
            <div className="flex items-center">
              {selectedParameters.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  className="mr-1 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="start" sideOffset={5} style={{ width: 'calc(100vw - 40px)', maxWidth: 'calc(100vw - 40px)' }}>
          <Command className="w-full" style={{ width: '100%' }}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search parameters..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="flex-1 border-0 focus:ring-0"
              />
            </div>
            
            <div className="flex border-b">
              <ScrollArea className="py-1" orientation="horizontal">
                <div className="flex px-2 gap-1">
                  <Badge
                    variant={activeCategory === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveCategory(null)}
                  >
                    All
                  </Badge>
                  {Object.keys(parametersByCategory).map(category => (
                    <Badge
                      key={category}
                      variant={activeCategory === category ? "default" : "outline"}
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                    >
                      <div className={`mr-1.5 h-2 w-2 rounded-full ${getCategoryColor(category)}`} />
                      {category.split(' ')[0]} ({getSelectedCountByCategory(category)}/{parametersByCategory[category].length})
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <CommandEmpty>No parameters found.</CommandEmpty>
            <CommandList>
              <ScrollArea className="h-[400px]">
                {Object.entries(parametersByCategory).map(([category, params]) => {
                  // Skip if this category should be filtered out
                  if (activeCategory && category !== activeCategory) return null;
                  
                  // Filter parameters in this category
                  const visibleParams = params.filter(param => filteredParameters.includes(param));
                  if (visibleParams.length === 0) return null;
                  
                  const categoryState = getCategorySelectionState(category);
                  
                  return (
                    <div key={category}>
                      <div 
                        className="flex items-center px-3 py-2 hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className={cn(
                          "h-4 w-4 mr-2 border rounded-sm flex items-center justify-center",
                          categoryState === 'all'
                            ? "bg-primary border-primary text-primary-foreground"
                            : categoryState === 'some'
                              ? "bg-primary/30 border-primary/30"
                              : "border-muted-foreground"
                        )}>
                          {categoryState === 'all' && <Check className="h-3 w-3" />}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-1">
                          <div className={`h-2 w-2 rounded-full ${getCategoryColor(category)}`} />
                          <span className="font-medium">{category}</span>
                        </div>
                        
                        <span className="text-xs text-muted-foreground">
                          {getSelectedCountByCategory(category)}/{params.length}
                        </span>
                      </div>
                      
                      <CommandGroup>
                        {visibleParams.map(param => {
                          const info = parameterInfo[param];
                          const isSelected = selectedParameters.includes(param);
                          
                          return (
                            <CommandItem
                              key={param}
                              onSelect={() => toggleParameter(param)}
                              className="px-6 py-2"
                            >
                              <div className={cn(
                                "h-4 w-4 mr-2 border rounded-sm flex items-center justify-center",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground"
                              )}>
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              
                              <div className="flex flex-col flex-1">
                                <span className="font-medium">{info?.fullName || param}</span>
                                {info?.description && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {info.description}
                                  </span>
                                )}
                              </div>
                              
                              <ParameterInfoCard
                                name={info?.fullName || param}
                                code={param}
                                description={info?.description || "No description available"}
                                examples={info?.examples}
                                importance={info?.importance}
                              />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      <Separator />
                    </div>
                  );
                })}
              </ScrollArea>
            </CommandList>
            
            <div className="flex items-center justify-between p-2 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedParameters.length} selected
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => clearAll()}
                >
                  Clear All
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}; 
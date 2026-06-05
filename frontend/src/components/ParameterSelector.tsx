import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Info, Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ParameterInfo {
  fullName?: string;
  description?: string;
  category?: string;
  weight?: string;
  formula?: string;
}

// Parameter category colors
const categoryColors: Record<string, string> = {
  "Teaching, Learning & Resources (TLR)": "bg-blue-500",
  "Research and Professional Practice (RP)": "bg-purple-500",
  "Graduation Outcomes (GO)": "bg-green-500",
  "Outreach and Inclusivity (OI)": "bg-amber-500",
  "Perception (PR)": "bg-red-500",
  "Other": "bg-gray-400"
};

interface ParameterSelectorProps {
  parameters: string[];
  selectedParameters: string[];
  parameterInfo: Record<string, ParameterInfo>;
  onParametersChange: (params: string[]) => void;
}

export const ParameterSelector: React.FC<ParameterSelectorProps> = ({
  parameters,
  selectedParameters,
  parameterInfo,
  onParametersChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

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
  }, [parameters, parameterInfo]);

  const filteredParameters = React.useMemo(() => {
    let result = [...parameters];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(param => {
        const info = parameterInfo[param];
        return param.toLowerCase().includes(query) || 
               (info?.fullName || '').toLowerCase().includes(query) ||
               (info?.description || '').toLowerCase().includes(query);
      });
    }
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(param => {
        return parameterInfo[param]?.category === categoryFilter;
      });
    }
    
    return result;
  }, [parameters, searchQuery, categoryFilter, parameterInfo]);

  const toggleParameter = (param: string) => {
    if (selectedParameters.includes(param)) {
      onParametersChange(selectedParameters.filter(p => p !== param));
    } else {
      onParametersChange([...selectedParameters, param]);
    }
  };

  const toggleAllInCategory = (category: string) => {
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

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || "bg-gray-400";
  };

  return (
    <TooltipProvider>
      <Card className="w-full bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold flex items-center justify-between">
            <span>Parameters</span>
            <Badge variant="outline" className="ml-2">
              {selectedParameters.length} selected
            </Badge>
          </CardTitle>
          <CardDescription>
            Choose the parameters for college comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search parameters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={categoryFilter ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCategoryFilter(null)}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear category filter</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Category chips */}
            <ScrollArea className="whitespace-nowrap pb-2">
              <div className="flex gap-2">
                {Object.keys(parametersByCategory).map(category => (
                  <Badge
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}
                  >
                    <div className={`mr-1.5 h-2 w-2 rounded-full ${getCategoryColor(category)}`} />
                    {category.split(' ')[0]}
                  </Badge>
                ))}
              </div>
            </ScrollArea>

            {/* Parameters list */}
            <ScrollArea className="h-[350px]">
              <Accordion type="multiple" className="w-full">
                {Object.entries(parametersByCategory).map(([category, params]) => {
                  // Filter parameters in this category
                  const visibleParams = params.filter(param => filteredParameters.includes(param));
                  if (visibleParams.length === 0) return null;
                  
                  const allSelected = visibleParams.every(param => selectedParameters.includes(param));
                  const someSelected = visibleParams.some(param => selectedParameters.includes(param));
                  
                  return (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="hover:bg-muted/50 px-3 rounded-md">
                        <div className="flex items-center gap-3 w-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAllInCategory(category);
                            }}
                          >
                            <div className={cn(
                              "h-4 w-4 border rounded-sm flex items-center justify-center",
                              allSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : someSelected
                                  ? "bg-primary/30 border-primary/30"
                                  : "border-muted-foreground"
                            )}>
                              {allSelected && <Check className="h-3 w-3" />}
                            </div>
                          </Button>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getCategoryColor(category)}`} />
                            <span>{category}</span>
                          </div>
                          <Badge variant="outline" className="ml-auto">
                            {visibleParams.filter(p => selectedParameters.includes(p)).length}/{visibleParams.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2">
                        <div className="space-y-1 py-1">
                          {visibleParams.map(param => {
                            const info = parameterInfo[param];
                            return (
                              <div
                                key={param}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted/50 cursor-pointer",
                                  selectedParameters.includes(param) && "bg-muted/30"
                                )}
                                onClick={() => toggleParameter(param)}
                              >
                                <div className={cn(
                                  "h-4 w-4 border rounded-sm flex items-center justify-center",
                                  selectedParameters.includes(param)
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground"
                                )}>
                                  {selectedParameters.includes(param) && <Check className="h-3 w-3 text-primary-foreground" />}
                                </div>
                                <div className="flex flex-col flex-1">
                                  <div className="font-medium">{info?.fullName || param}</div>
                                  {info?.description && (
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                      {info.description}
                                    </div>
                                  )}
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-md p-4" side="right">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">{info?.fullName || param}</h4>
                                      {info?.description && <p>{info.description}</p>}
                                      {info?.weight && <p><strong>Weight:</strong> {info.weight}</p>}
                                      {info?.formula && <p><strong>Formula:</strong> {info.formula}</p>}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}; 
import React from 'react';
import { SelectionControls } from '@/components/SelectionControls';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollegeData } from '@/hooks/useCollegeData';
import { parameterInfo } from '@/lib/parameterInfo';
import { ParameterSelector } from '@/components/ParameterSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { colleges, parameters, loading } = useCollegeData();
  const [selectedParameters, setSelectedParameters] = React.useState<string[]>([]);
  const [selectedColleges, setSelectedColleges] = React.useState<string[]>([]);
  const { toast } = useToast();

  const handleStartSort = () => {
    if (selectedParameters.length === 0) {
      toast({
        title: "Please select parameters",
        description: "Choose at least one parameter to compare colleges",
        variant: "destructive"
      });
      return;
    }

    if (selectedColleges.length === 0) {
      toast({
        title: "Please select colleges",
        description: "Select the colleges you want to compare",
        variant: "destructive"
      });
      return;
    }

    // Handle starting the sort process
    // Add your sort logic here
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header and sort button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">College Explorer</h1>
          <p className="text-muted-foreground">
            Find and compare colleges based on what matters to you
          </p>
        </div>
        
        <Button 
          size="lg" 
          className="gap-2"
          disabled={selectedParameters.length === 0 || selectedColleges.length === 0}
          onClick={handleStartSort}
        >
          <PlayCircle className="h-5 w-5" />
          Start Sorting
        </Button>
      </div>

      {/* Selection counts */}
      <div className="flex gap-4 flex-wrap">
        <Card className="bg-muted/50">
          <CardContent className="p-3 flex gap-2 items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {selectedParameters.length}
            </div>
            <div className="text-sm">
              <div className="font-medium">Parameters</div>
              <div className="text-muted-foreground">selected</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/50">
          <CardContent className="p-3 flex gap-2 items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {selectedColleges.length}
            </div>
            <div className="text-sm">
              <div className="font-medium">Colleges</div>
              <div className="text-muted-foreground">selected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content with tabs */}
      <Tabs defaultValue="parameters" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parameters" className="pt-6">
          <ParameterSelector
            parameters={parameters}
            selectedParameters={selectedParameters}
            parameterInfo={parameterInfo}
            onParametersChange={setSelectedParameters}
          />
        </TabsContent>
        
        <TabsContent value="colleges" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Colleges</CardTitle>
              <CardDescription>
                Choose the colleges you want to compare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SelectionControls
                colleges={colleges}
                parameters={parameters}
                selectedColleges={selectedColleges}
                selectedParameters={selectedParameters}
                onCollegesChange={setSelectedColleges}
                onParametersChange={setSelectedParameters}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 
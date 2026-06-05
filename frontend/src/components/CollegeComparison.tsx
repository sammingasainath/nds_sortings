import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { College } from '@/types';
import { parameterInfo } from '@/lib/parameterInfo';
import { Badge } from "@/components/ui/badge";
import { useCollegeHistory } from '@/hooks/useCollegeHistory';

interface CollegeComparisonProps {
  colleges: College[];
  selectedColleges: string[];
  selectedParameters: string[];
  iterationId?: string; // Optional ID to track iterations
}

export const CollegeComparison: React.FC<CollegeComparisonProps> = ({
  colleges,
  selectedColleges,
  selectedParameters,
  iterationId
}) => {
  // Get iteration history
  const { getPreviouslySelectedColleges } = useCollegeHistory();

  // Filter colleges based on selection and iteration history
  const selectedCollegeData = useMemo(() => {
    // First, find colleges by name or ID
    return colleges.filter(college => 
      // Check if the college name is in the selectedColleges array
      selectedColleges.includes(college.Name) || 
      // Also check if the college ID is in the selectedColleges array (for backward compatibility)
      selectedColleges.includes(college['Unnamed: 0'])
    );
  }, [colleges, selectedColleges]);

  // Prepare data for radar chart
  const radarData = selectedParameters.map(param => {
    const dataPoint: any = { parameter: parameterInfo[param]?.fullName || param };
    selectedCollegeData.forEach(college => {
      const value = parseFloat(college[param]);
      dataPoint[college.Name] = isNaN(value) ? 0 : value; // Default to 0 if NaN
    });
    return dataPoint;
  });

  // Prepare data for bar chart
  const barData = selectedParameters.map(param => {
    const dataPoint: any = {
      parameter: parameterInfo[param]?.fullName || param,
      ...selectedCollegeData.reduce((acc, college) => {
        const value = parseFloat(college[param]);
        return {
          ...acc,
          [college.Name]: isNaN(value) ? 0 : value // Default to 0 if NaN
        };
      }, {})
    };
    return dataPoint;
  });

  // Calculate bar chart height based on number of parameters
  const barChartHeight = Math.max(600, selectedParameters.length * 60);

  // Generate unique colors for each college
  const collegeColors = [
    "#2563eb", // blue-600
    "#dc2626", // red-600
    "#16a34a", // green-600
    "#9333ea", // purple-600
    "#ea580c", // orange-600
    "#0891b2", // cyan-600
  ];

  // Calculate strengths analysis
  const strengthsAnalysis = selectedCollegeData.map(college => {
    const strengths = selectedParameters.filter(param => {
      const collegeValue = parseFloat(college[param]);
      if (isNaN(collegeValue)) return false; // Skip if NaN
      
      const otherCollegesValues = selectedCollegeData
        .filter(c => c.Name !== college.Name)
        .map(c => {
          const value = parseFloat(c[param]);
          return isNaN(value) ? 0 : value; // Default to 0 if NaN
        });
      
      const otherCollegesAvg = otherCollegesValues.length > 0 
        ? otherCollegesValues.reduce((sum, val) => sum + val, 0) / otherCollegesValues.length
        : 0;
        
      return collegeValue > otherCollegesAvg;
    });

    const topStrengths = strengths
      .sort((a, b) => {
        const aValue = parseFloat(college[a]);
        const bValue = parseFloat(college[b]);
        // Handle NaN values in sorting
        if (isNaN(aValue) && isNaN(bValue)) return 0;
        if (isNaN(aValue)) return 1;
        if (isNaN(bValue)) return -1;
        return bValue - aValue;
      })
      .slice(0, 5);

    return {
      college: college.Name,
      strengths: topStrengths,
      color: collegeColors[selectedCollegeData.indexOf(college) % collegeColors.length]
    };
  });

  // Calculate head-to-head matrix data
  const matrixData = selectedCollegeData.map(college1 => {
    const row = selectedCollegeData.map(college2 => {
      if (college1.Name === college2.Name) return null;

      const wins = selectedParameters.filter(param => {
        const value1 = parseFloat(college1[param]);
        const value2 = parseFloat(college2[param]);
        
        // Skip comparison if either value is NaN
        if (isNaN(value1) || isNaN(value2)) return false;
        
        return value1 > value2;
      }).length;

      const validComparisons = selectedParameters.filter(param => {
        const value1 = parseFloat(college1[param]);
        const value2 = parseFloat(college2[param]);
        return !isNaN(value1) && !isNaN(value2);
      }).length;
      
      const total = validComparisons || 1; // Avoid division by zero
      const winPercentage = (wins / total) * 100;

      return {
        opponent: college2.Name,
        wins,
        total,
        percentage: winPercentage
      };
    });

    return {
      college: college1.Name,
      color: collegeColors[selectedCollegeData.indexOf(college1) % collegeColors.length],
      comparisons: row
    };
  });

  return (
    <Card className="w-full border-2 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-2xl font-bold tracking-tight">College Comparison</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Compare selected colleges across different parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="radar" className="space-y-6">
          <TabsList className="w-full grid grid-cols-5 mb-6 p-1 bg-card/50 border border-border rounded-lg">
            <TabsTrigger value="radar" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">Radar Chart</TabsTrigger>
            <TabsTrigger value="bar" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">Bar Chart</TabsTrigger>
            <TabsTrigger value="strengths" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">Strengths Analysis</TabsTrigger>
            <TabsTrigger value="matrix" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">Head-to-Head Matrix</TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">Detailed Table</TabsTrigger>
          </TabsList>

          <TabsContent value="radar" className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Radar Chart Comparison</h3>
              <p className="text-sm text-muted-foreground">Visualize how colleges compare across all parameters in a radar format</p>
            </div>
            <div className="h-[600px] w-full p-4 rounded-lg bg-card/30 border border-border">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                  <defs>
                    {selectedCollegeData.map((college, index) => (
                      <linearGradient key={`gradient-${college.Name}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={collegeColors[index % collegeColors.length]} stopOpacity={0.7} />
                        <stop offset="100%" stopColor={collegeColors[index % collegeColors.length]} stopOpacity={0.1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                  <PolarAngleAxis
                    dataKey="parameter"
                    tick={{ fill: 'currentColor', fontSize: 13, fontWeight: 500 }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    stroke="currentColor" 
                    tick={{ fill: 'currentColor' }} 
                    tickCount={5}
                    tickFormatter={(value) => `${value}%`}
                  />
                  {selectedCollegeData.map((college, index) => (
                    <Radar
                      key={college.Name}
                      name={college.Name}
                      dataKey={college.Name}
                      stroke={collegeColors[index % collegeColors.length]}
                      fill={`url(#gradient-${index})`}
                      strokeWidth={2}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  ))}
                  <Legend 
                    formatter={(value) => <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{value}</span>} 
                    wrapperStyle={{ paddingTop: 20 }}
                    iconSize={10}
                    iconType="circle"
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Score']}
                    labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--foreground)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="bar" className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Bar Chart Comparison</h3>
              <p className="text-sm text-muted-foreground">Compare college performance parameter by parameter with easy-to-read bars</p>
            </div>
            <ScrollArea className="h-[600px] rounded-lg border border-border">
              <div style={{ height: barChartHeight, width: '100%' }} className="p-4 bg-card/30">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 200, bottom: 5 }}
                    barGap={4}
                    barSize={16}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      stroke="currentColor"
                      tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="parameter"
                      type="category"
                      width={190}
                      tick={{ fontSize: 13, fill: 'currentColor', fontWeight: 500 }}
                      stroke="currentColor"
                      tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Score']}
                      labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--foreground)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                      }}
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    />
                    <Legend 
                      formatter={(value) => <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{value}</span>}
                      wrapperStyle={{ paddingTop: 10 }}
                      iconSize={10}
                      iconType="circle"
                    />
                    {selectedCollegeData.map((college, index) => (
                      <Bar
                        key={college.Name}
                        dataKey={college.Name}
                        fill={collegeColors[index % collegeColors.length]}
                        radius={[4, 4, 4, 4]}
                        background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="strengths" className="space-y-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">College Strengths Analysis</h3>
              <p className="text-sm text-muted-foreground">Identify each college's top performing parameters compared to others</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strengthsAnalysis.map(({ college, strengths, color }) => (
                <Card key={college} className="border-2 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl" style={{ color }}>
                      {college}
                    </CardTitle>
                    <CardDescription>
                      Top performing parameters compared to other selected colleges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {strengths.map(param => {
                        const collegeObj = selectedCollegeData.find(c => c.Name === college);
                        const rawValue = collegeObj ? parseFloat(collegeObj[param]) : 0;
                        const value = isNaN(rawValue) ? 0 : rawValue;
                        
                        const otherCollegesValues = selectedCollegeData
                          .filter(c => c.Name !== college)
                          .map(c => {
                            const val = parseFloat(c[param]);
                            return isNaN(val) ? 0 : val;
                          });
                        
                        const otherCollegesAvg = otherCollegesValues.length > 0
                          ? otherCollegesValues.reduce((sum, val) => sum + val, 0) / otherCollegesValues.length
                          : 0;
                        
                        const difference = (value - otherCollegesAvg).toFixed(2);
                        
                        return (
                          <div key={param} className="flex items-center justify-between gap-4 p-2 rounded-md bg-card/30">
                            <div className="flex-1">
                              <div className="font-medium">{parameterInfo[param]?.fullName || param}</div>
                              <div className="text-sm text-muted-foreground">Score: {value.toFixed(2)}%</div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="shrink-0 font-medium"
                              style={{ borderColor: color, color, backgroundColor: `${color}15` }}
                            >
                              +{difference}% above avg
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Head-to-Head Performance Matrix</h3>
              <p className="text-sm text-muted-foreground">See how each college performs against others in direct comparisons</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {matrixData.map(({ college, color, comparisons }) => (
                <Card key={college} className="border-2 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl" style={{ color }}>
                      {college}'s Head-to-Head Performance
                    </CardTitle>
                    <CardDescription>
                      Percentage of parameters where this college outperforms others
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comparisons.map((comparison, index) => {
                        if (!comparison) return null;
                        const opponentColor = collegeColors[index % collegeColors.length];
                        
                        return (
                          <div key={comparison.opponent} className="flex items-center gap-4 p-3 rounded-md bg-card/30">
                            <div className="flex-1">
                              <div className="font-medium" style={{ color: opponentColor }}>
                                vs. {comparison.opponent}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Wins in {comparison.wins} out of {comparison.total} parameters
                              </div>
                            </div>
                            <div className="w-48 h-3 bg-secondary/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full"
                                style={{ 
                                  width: `${comparison.percentage}%`,
                                  backgroundColor: color,
                                  opacity: 0.8
                                }}
                              />
                            </div>
                            <Badge 
                              variant="outline" 
                              className="shrink-0 w-20 text-center font-medium"
                              style={{ borderColor: color, color, backgroundColor: `${color}15` }}
                            >
                              {comparison.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Detailed Parameter Table</h3>
              <p className="text-sm text-muted-foreground">View all parameter values in a comprehensive table format</p>
            </div>
            <ScrollArea className="h-[600px]">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-background/80 backdrop-blur-sm">
                  <tr>
                    <th className="border border-border px-4 py-2 text-left">Parameter</th>
                    {selectedCollegeData.map((college, index) => (
                      <th 
                        key={college.Name} 
                        className="border border-border px-4 py-2 text-left"
                        style={{ borderBottom: `2px solid ${collegeColors[index % collegeColors.length]}` }}
                      >
                        {college.Name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedParameters.map((param, paramIndex) => (
                    <tr key={param} className={paramIndex % 2 === 0 ? "bg-card/30" : ""}>
                      <td className="border border-border px-4 py-2">
                        <div className="font-medium">{parameterInfo[param]?.fullName || param}</div>
                        <div className="text-sm text-muted-foreground">{param}</div>
                      </td>
                      {selectedCollegeData.map((college, collegeIndex) => {
                        const value = parseFloat(college[param]);
                        const formattedValue = isNaN(value) ? 'N/A' : value.toFixed(2);
                        
                        // Find the highest value for this parameter
                        const values = selectedCollegeData.map(c => parseFloat(c[param])).filter(v => !isNaN(v));
                        const maxValue = Math.max(...values);
                        const isHighest = value === maxValue && !isNaN(value);
                        
                        return (
                          <td 
                            key={`${college.Name}-${param}`} 
                            className="border border-border px-4 py-2"
                          >
                            <span 
                              className={isHighest ? "font-bold" : ""}
                              style={isHighest ? { color: collegeColors[collegeIndex % collegeColors.length] } : {}}
                            >
                              {formattedValue}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 
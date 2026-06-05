import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { College } from '@/types';
import { Loader2, ArrowUpRight, ExternalLink, Globe, Linkedin, Youtube, MessageCircle, School } from "lucide-react";
import { extractStructuredInformation, categorizeYouTubeVideos } from '@/utils/summarization';
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToComparisonButton } from './AddToComparisonButton';

interface WebSearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

interface CollegeDetailsProps {
  college: College;
  onClose: () => void;
}

interface StructuredInfo {
  overview: string;
  location: string;
  rankings: string;
  admissions: string;
  facilities: string;
  images?: string[];
}

interface YouTubeCategories {
  freshers: WebSearchResult[];
  campusTour: WebSearchResult[];
  fest: WebSearchResult[];
  reviews: WebSearchResult[];
  other: WebSearchResult[];
}

// Update the parameter descriptions with accurate information and categories
const parameterDescriptions: Record<string, { 
  description: string; 
  category: string; 
  color: string;
  maxScore: number; // Adding max score based on the image
  fullName: string; // Adding full parameter name
  categoryCode: string; // Adding category code (TLR, RP, GO, OI, PR)
}> = {
  // Teaching, Learning & Resources (TLR)
  SS: { 
    description: "Total number of students enrolled in the institution including undergraduate, postgraduate, and doctoral students", 
    category: "Teaching, Learning & Resources", 
    color: "bg-blue-600",
    maxScore: 20,
    fullName: "Student Strength",
    categoryCode: "TLR"
  },
  FSR: { 
    description: "Ratio of full-time faculty to students, with emphasis on permanent faculty members", 
    category: "Teaching, Learning & Resources", 
    color: "bg-blue-600",
    maxScore: 30,
    fullName: "Faculty-Student Ratio",
    categoryCode: "TLR"
  },
  FQE: { 
    description: "Combined metric for faculty qualification (PhD or equivalent) and experience across different experience levels", 
    category: "Teaching, Learning & Resources", 
    color: "bg-blue-600",
    maxScore: 20,
    fullName: "Faculty Qualification & Experience",
    categoryCode: "TLR"
  },
  FRU: { 
    description: "Financial resources and their utilization for academic activities, infrastructure, and operational expenses", 
    category: "Teaching, Learning & Resources", 
    color: "bg-blue-600",
    maxScore: 30,
    fullName: "Financial Resources Utilization",
    categoryCode: "TLR"
  },
  
  // Research and Professional Practice (RP)
  PU: { 
    description: "Combined metric for number of research publications in reputed journals and databases like Scopus, Web of Science", 
    category: "Research and Professional Practice", 
    color: "bg-purple-600",
    maxScore: 35,
    fullName: "Publications",
    categoryCode: "RP"
  },
  QP: { 
    description: "Quality of publications measured by citation impact, normalized citation index, and top percentile citations", 
    category: "Research and Professional Practice", 
    color: "bg-purple-600",
    maxScore: 40,
    fullName: "Quality of Publications",
    categoryCode: "RP"
  },
  IPR: { 
    description: "Intellectual property rights, including patents filed, published, granted, and licensed over the previous three years", 
    category: "Research and Professional Practice", 
    color: "bg-purple-600",
    maxScore: 15,
    fullName: "Intellectual Property Rights",
    categoryCode: "RP"
  },
  FPPP: { 
    description: "Footprint of projects, professional practice, and executive development programs including research funding and consultancy", 
    category: "Research and Professional Practice", 
    color: "bg-purple-600",
    maxScore: 10,
    fullName: "Footprint of Projects & Professional Practice",
    categoryCode: "RP"
  },
  
  // Graduation Outcomes (GO)
  GPH: { 
    description: "Combined metric for placement, higher studies, and entrepreneurship outcomes of graduating students", 
    category: "Graduation Outcomes", 
    color: "bg-green-600",
    maxScore: 40,
    fullName: "Graduation Placement & Higher Studies",
    categoryCode: "GO"
  },
  GUE: { 
    description: "Percentage of students graduating in stipulated time for their respective programs", 
    category: "Graduation Outcomes", 
    color: "bg-green-600",
    maxScore: 15,
    fullName: "Graduation University Examinations",
    categoryCode: "GO"
  },
  MS: { 
    description: "Median salary of graduated students based on campus placement records", 
    category: "Graduation Outcomes", 
    color: "bg-green-600",
    maxScore: 25,
    fullName: "Median Salary",
    categoryCode: "GO"
  },
  GPHD: { 
    description: "Number of PhD students graduated over the last three years, indicating research output", 
    category: "Graduation Outcomes", 
    color: "bg-green-600",
    maxScore: 20,
    fullName: "Graduating PhD Students",
    categoryCode: "GO"
  },
  
  // Outreach and Inclusivity (OI)
  RD: { 
    description: "Percentage of students from other states and countries, measuring geographical diversity", 
    category: "Outreach and Inclusivity", 
    color: "bg-amber-600",
    maxScore: 30,
    fullName: "Regional Diversity",
    categoryCode: "OI"
  },
  WD: { 
    description: "Percentage of women students, faculty, and in administrative positions, measuring gender diversity", 
    category: "Outreach and Inclusivity", 
    color: "bg-amber-600",
    maxScore: 30,
    fullName: "Women Diversity",
    categoryCode: "OI"
  },
  ESCS: { 
    description: "Percentage of economically and socially challenged students admitted, measuring socioeconomic inclusivity", 
    category: "Outreach and Inclusivity", 
    color: "bg-amber-600",
    maxScore: 20,
    fullName: "Economically & Socially Challenged Students",
    categoryCode: "OI"
  },
  PCS: { 
    description: "Facilities provided for physically challenged students, measuring accessibility and inclusivity", 
    category: "Outreach and Inclusivity", 
    color: "bg-amber-600",
    maxScore: 20,
    fullName: "Physically Challenged Students",
    categoryCode: "OI"
  },
  
  // Perception (PR)
  PR: { 
    description: "Perception ranking based on surveys of employers, academics, and public about the institution's reputation", 
    category: "Perception", 
    color: "bg-red-600",
    maxScore: 100,
    fullName: "Perception Ranking",
    categoryCode: "PR"
  }
};

// Update the helper function to get a readable parameter name
const getReadableParameterName = (key: string): string => {
  return parameterDescriptions[key]?.fullName || key;
};

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: "easeInOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardHover = {
  rest: { scale: 1, transition: { duration: 0.2, ease: "easeInOut" } },
  hover: { scale: 1.02, transition: { duration: 0.2, ease: "easeInOut" } }
};

const imageHover = {
  rest: { scale: 1 },
  hover: { scale: 1.1, transition: { duration: 0.4, ease: "easeInOut" } }
};

export const CollegeDetails: React.FC<CollegeDetailsProps> = ({
  college,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [searchResults, setSearchResults] = useState<Record<string, WebSearchResult[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({
    general: true  // Set initial loading state for general tab
  });
  const [structuredInfo, setStructuredInfo] = useState<StructuredInfo>({
    overview: '',
    location: '',
    rankings: '',
    admissions: '',
    facilities: '',
    images: []
  });
  const [youtubeCategories, setYoutubeCategories] = useState<YouTubeCategories>({
    freshers: [],
    campusTour: [],
    fest: [],
    reviews: [],
    other: []
  });

  // Cache for storing fetched data
  const dataCache = useRef<Record<string, any>>({});
  const fetchingRef = useRef<Record<string, boolean>>({});

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  const searchQueries = {
    general: `${college.Name} college university general information`,
    campus: `${college.Name} college university campus tour facilities`,
    reddit: `${college.Name} college university site:reddit.com`,
    youtube: `${college.Name} college university site:youtube.com`,
    linkedin: `${college.Name} college university site:linkedin.com`,
    quora: `${college.Name} college university site:quora.com`
  };

  const fetchTabData = async (category: string) => {
    // Prevent duplicate fetches
    if (fetchingRef.current[category]) {
      return;
    }

    // If data is already in cache, use it
    if (dataCache.current[category]) {
      setSearchResults(prev => ({ ...prev, [category]: dataCache.current[category].results }));
      if (category === 'general') {
        setStructuredInfo(dataCache.current[category].structuredInfo);
      }
      if (category === 'youtube') {
        setYoutubeCategories(dataCache.current[category].categories);
      }
      return;
    }

    fetchingRef.current[category] = true;
    setLoading(prev => ({ ...prev, [category]: true }));

    try {
      const response = await fetch(`${apiBaseUrl}/search?q=${encodeURIComponent(searchQueries[category])}`);
      const data = await response.json();
      const results = data.results || [];
      
      // Store results
      setSearchResults(prev => ({ ...prev, [category]: results }));

      // For general information, extract structured information
      if (category === 'general') {
        const info = await extractStructuredInformation(results);
        setStructuredInfo(info);
        
        // Cache the data
        dataCache.current[category] = {
          results,
          structuredInfo: info
        };
      }
      // For YouTube videos, categorize them
      else if (category === 'youtube') {
        const categorized = await categorizeYouTubeVideos(results);
        setYoutubeCategories(categorized);
        
        // Cache the data
        dataCache.current[category] = {
          results,
          categories: categorized
        };
      }
      else {
        // Cache the data for other categories
        dataCache.current[category] = {
          results
        };
      }
    } catch (error) {
      console.error(`Error fetching ${category} results:`, error);
      setSearchResults(prev => ({ ...prev, [category]: [] }));
    }

    setLoading(prev => ({ ...prev, [category]: false }));
    fetchingRef.current[category] = false;
  };

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab && !dataCache.current[activeTab]) {
      fetchTabData(activeTab);
    }
  }, [activeTab]);

  // Initial fetch for general tab
  useEffect(() => {
      fetchTabData('general');
  }, []);

  const renderYouTubeSection = (title: string, videos: WebSearchResult[]) => {
    if (videos.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="font-medium text-lg">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, index) => (
              <motion.div
                key={index}
              className="rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
              whileHover="hover"
              initial="rest"
              animate="rest"
                variants={cardHover}
            >
                    <a
                      href={video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                className="block"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {/* Extract video ID from YouTube URL and create thumbnail URL */}
                  {video.link.includes('youtube.com') && (
                    <motion.img 
                      src={`https://img.youtube.com/vi/${video.link.split('v=')[1]?.split('&')[0]}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      variants={imageHover}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-red-600 border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.snippet}</p>
                </div>
              </a>
              </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderGeneralInfo = () => {
    if (loading.general) {
      return (
        <div className="space-y-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      );
    }

    const generalResults = searchResults.general || [];
    const officialWebsite = generalResults.find(result => 
      result.title.toLowerCase().includes('official') && 
      result.title.toLowerCase().includes('website')
    )?.link || `https://www.google.com/search?q=${encodeURIComponent(college.Name + " official website")}`;
    
    const linkedinPage = generalResults.find(result => 
      result.link.includes('linkedin.com')
    )?.link || `https://www.linkedin.com/school/${encodeURIComponent(college.Name.replace(/\s+/g, '-').toLowerCase())}`;
    
    const youtubeChannel = generalResults.find(result => 
      result.link.includes('youtube.com/channel') || result.link.includes('youtube.com/c/')
    )?.link || `https://www.youtube.com/results?search_query=${encodeURIComponent(college.Name)}`;
    
    // Group parameters by category
    const parametersByCategory: Record<string, Array<[string, string | number]>> = {};
    
    Object.entries(college)
      .filter(([key]) => key !== 'Unnamed: 0' && key !== 'Name')
      .forEach(([key, value]) => {
        const category = parameterDescriptions[key]?.category || "Other Metrics";
        if (!parametersByCategory[category]) {
          parametersByCategory[category] = [];
        }
        parametersByCategory[category].push([key, value]);
      });

    return (
      <div className="space-y-6">
        {/* Official Links */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Official Links</CardTitle>
            <CardDescription>Connect with {college.Name} on official channels</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto py-4"
                asChild
              >
                <a href={officialWebsite} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Official Website</span>
                    <span className="text-xs text-muted-foreground">Visit the college website</span>
                  </div>
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto py-4"
                asChild
              >
                <a href={linkedinPage} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">LinkedIn</span>
                    <span className="text-xs text-muted-foreground">Professional network</span>
                  </div>
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto py-4"
                asChild
              >
                <a href={youtubeChannel} target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-5 w-5 text-red-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">YouTube</span>
                    <span className="text-xs text-muted-foreground">Videos and lectures</span>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* College Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">College Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                {generalResults.slice(0, 3).map((result, index) => (
                  <div key={index} className="space-y-1">
                    <a 
                      href={result.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium flex items-center"
                    >
                      {result.title} <ArrowUpRight className="ml-1 h-3 w-3" />
                    </a>
                    <p className="text-sm text-muted-foreground">{result.snippet}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Academic Resources</h3>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(college.Name + " admission")}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Admission Information
                      </a>
                    </li>
                    <li>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(college.Name + " courses")}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Courses Offered
                      </a>
                    </li>
                    <li>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(college.Name + " faculty")}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Faculty Information
                      </a>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Rankings & Reviews</h3>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(college.Name + " NIRF ranking")}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        NIRF Rankings
                      </a>
                    </li>
                    <li>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(college.Name + " student reviews")}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Student Reviews
                      </a>
                    </li>
                    <li>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(college.Name + " placements")}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Placement Statistics
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Parameter Details - Updated Section */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">NIRF Performance Metrics</CardTitle>
            <CardDescription>Key ranking parameters and scores for {college.Name}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-8">
              {/* Group parameters by main NIRF categories */}
              {["TLR", "RP", "GO", "OI", "PR"].map((categoryCode) => {
                // Filter parameters by category code
                const parameters = Object.entries(college)
                  .filter(([key]) => 
                    key !== 'Unnamed: 0' && 
                    key !== 'Name' && 
                    parameterDescriptions[key]?.categoryCode === categoryCode
                  );
                
                if (parameters.length === 0) return null;
                
                // Get the category name from the first parameter
                const categoryName = parameters.length > 0 
                  ? parameterDescriptions[parameters[0][0]]?.category 
                  : "";
                
                // Get the category color from the first parameter
                const categoryColor = parameters.length > 0 
                  ? parameterDescriptions[parameters[0][0]]?.color 
                  : "bg-gray-600";
                
                return (
                  <div key={categoryCode} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-8 rounded-full ${categoryColor}`}></div>
                      <h3 className="font-semibold text-lg">{categoryName} ({categoryCode})</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {parameters.map(([key, value]) => {
                        const paramInfo = parameterDescriptions[key];
                        if (!paramInfo) return null;
                        
                        // Calculate percentage of max score
                        const scorePercent = typeof value === 'number' 
                          ? (value / paramInfo.maxScore) * 100 
                          : 0;
                        
                        // Determine performance level based on percentage
                        let performanceIndicator = "";
                        let indicatorColor = "";
                        
                        if (scorePercent >= 80) {
                          performanceIndicator = "Excellent";
                          indicatorColor = "text-green-600";
                        } else if (scorePercent >= 60) {
                          performanceIndicator = "Good";
                          indicatorColor = "text-blue-600";
                        } else if (scorePercent >= 40) {
                          performanceIndicator = "Average";
                          indicatorColor = "text-amber-600";
                        } else {
                          performanceIndicator = "Needs Improvement";
                          indicatorColor = "text-red-600";
                        }
                        
                        return (
                          <div 
                key={key}
                            className="p-4 border rounded-md bg-card hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">{key}</div>
                                <Badge variant="outline" className={`${indicatorColor} border-current`}>
                                  {performanceIndicator}
                                </Badge>
                              </div>
                              <div className="font-semibold mt-1">{paramInfo.fullName}</div>
                              <div className="flex items-end justify-between mt-3">
                                <div className="text-3xl font-bold">{value}</div>
                                <div className="text-sm text-muted-foreground">
                                  / {paramInfo.maxScore}
                                </div>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                                <div 
                                  className={`h-full ${paramInfo.color}`} 
                                  style={{ width: `${Math.min(scorePercent, 100)}%` }}
                                ></div>
                              </div>
                              
                              <div className="text-xs text-muted-foreground mt-3">
                                {paramInfo.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {/* Overall Score Summary */}
              <Card className="mt-6 bg-slate-800 dark:bg-slate-900 text-white">
                <CardHeader className="p-4">
                  <CardTitle className="text-base text-white">Overall NIRF Score Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {["TLR", "RP", "GO", "OI", "PR"].map((category) => {
                      // Calculate total score for this category
                      const parameters = Object.entries(college)
                        .filter(([key]) => 
                          key !== 'Unnamed: 0' && 
                          key !== 'Name' && 
                          parameterDescriptions[key]?.categoryCode === category
                        );
                      
                      const totalScore = parameters.reduce((sum, [key, value]) => 
                        sum + (typeof value === 'number' ? value : 0), 0);
                      
                      // Calculate max possible score for this category
                      const maxPossibleScore = parameters.reduce((sum, [key]) => 
                        sum + (parameterDescriptions[key]?.maxScore || 0), 0);
                      
                      // Get category color
                      let categoryColor = "bg-gray-600";
                      switch(category) {
                        case "TLR": categoryColor = "bg-blue-600"; break;
                        case "RP": categoryColor = "bg-purple-600"; break;
                        case "GO": categoryColor = "bg-green-600"; break;
                        case "OI": categoryColor = "bg-amber-600"; break;
                        case "PR": categoryColor = "bg-red-600"; break;
                      }
                      
                      // Calculate percentage for width
                      const percentWidth = maxPossibleScore > 0 
                        ? (totalScore / maxPossibleScore) * 100 
                        : 0;
                      
                      return (
                        <div key={category} className="flex flex-col items-center p-4 border border-slate-700 rounded-md bg-slate-800">
                          <div className="text-sm font-medium text-white">{category}</div>
                          <div className="text-3xl font-bold mt-2 text-white">{totalScore.toFixed(1)}</div>
                          <div className="text-xs text-slate-400">/ {maxPossibleScore}</div>
                          <div className="w-full h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
                            <div 
                              className={`h-full ${categoryColor}`} 
                              style={{ width: `${percentWidth}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSearchResults = (category: string) => {
    if (loading[category]) {
      return (
        <div className="space-y-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      );
    }

    const results = searchResults[category] || [];

    if (category === 'youtube') {
      return (
        <div className="space-y-8">
          {renderYouTubeSection('Campus Tours', youtubeCategories.campusTour)}
          {renderYouTubeSection('Freshers & Orientation', youtubeCategories.freshers)}
          {renderYouTubeSection('College Fests & Events', youtubeCategories.fest)}
          {renderYouTubeSection('Student Reviews', youtubeCategories.reviews)}
          {renderYouTubeSection('Other Videos', youtubeCategories.other)}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <motion.div 
          className="grid grid-cols-1 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {results.map((result, index) => (
            <motion.div
              key={index}
              className="border rounded-lg p-4 hover:bg-muted/5 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <a 
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                className="text-primary hover:underline font-medium flex items-center"
              >
                {result.title} <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <p className="text-sm text-muted-foreground mt-1">{result.snippet}</p>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="text-xs">
                  {result.source || 'Web'}
                </Badge>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div 
      className="h-full"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <motion.div 
        className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <CardTitle className="text-2xl mb-1">{college.Name}</CardTitle>
              <CardDescription className="text-sm">
                Detailed information about {college.Name}
              </CardDescription>
            </div>
            <AddToComparisonButton 
              collegeName={college.Name} 
              showNavigate={true}
            />
          </div>
        </CardHeader>
      </motion.div>
      <CardContent className="px-6 pb-6">
        <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
          <motion.div 
            className="sticky top-[85px] z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="campus">Campus</TabsTrigger>
              <TabsTrigger value="reddit">Reddit</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="quora">Quora</TabsTrigger>
            </TabsList>
          </motion.div>

          <div className="mt-6">
          <AnimatePresence mode="sync" initial={false}>
            {activeTab === 'general' && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="general" className="m-0">
                  {renderGeneralInfo()}
                </TabsContent>
              </motion.div>
            )}
            {activeTab === 'campus' && (
              <motion.div 
                key="campus"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="campus" className="m-0">
                  {renderSearchResults('campus')}
                </TabsContent>
              </motion.div>
            )}
            {activeTab === 'reddit' && (
              <motion.div 
                key="reddit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="reddit" className="m-0">
                  {renderSearchResults('reddit')}
                </TabsContent>
              </motion.div>
            )}
            {activeTab === 'youtube' && (
              <motion.div 
                key="youtube"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="youtube" className="m-0">
                  {renderSearchResults('youtube')}
                </TabsContent>
              </motion.div>
            )}
            {activeTab === 'linkedin' && (
              <motion.div 
                key="linkedin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="linkedin" className="m-0">
                  {renderSearchResults('linkedin')}
                </TabsContent>
              </motion.div>
            )}
            {activeTab === 'quora' && (
              <motion.div 
                key="quora"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="quora" className="m-0">
                  {renderSearchResults('quora')}
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </Tabs>
      </CardContent>
    </motion.div>
  );
}; 
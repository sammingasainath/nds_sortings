import { motion } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';
import { GraduationCap, Brain, Sparkles, Target, Users, Shield, SortAsc, Filter, MousePointer, Info, Layers } from 'lucide-react';
import Image from 'next/image';

export const AboutPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Personalized Matching",
      description: "Our advanced algorithms consider your preferences, academic performance, and career goals to find the best college matches."
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Leverage cutting-edge AI technology to get deep insights into colleges and make data-driven decisions."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Student-Centric Approach",
      description: "Built with students in mind, focusing on what matters most in your college search journey."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Trusted Information",
      description: "Access reliable and up-to-date information about colleges, verified from multiple authoritative sources."
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-16">
        <motion.div
          className="container mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-relaxed py-2"
            variants={itemVariants}
          >
            About U.C.H.I.T. (<span className="inline-block leading-relaxed">उचित</span>)
          </motion.h1>

          <div className="grid gap-8 md:gap-12">
            <motion.section className="bg-card rounded-lg p-8" variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                UCHIT (<span className="inline-block leading-relaxed">उचित</span>) means "appropriate" or "right" in Hindi, reflecting our mission to help students 
                find the right college that aligns with their aspirations and potential. We combine advanced AI 
                technology with comprehensive college data to make the college selection process more 
                informed, personalized, and efficient.
              </p>
            </motion.section>

            <motion.section className="bg-card rounded-lg p-8" variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="text-primary mt-1">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section className="bg-card rounded-lg p-8" variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  1. <span className="font-medium">Select Your Preferences</span>: Choose colleges and parameters that matter to you.
                </p>
                <p>
                  2. <span className="font-medium">AI Analysis</span>: Our AI analyzes your selections and provides comprehensive insights.
                </p>
                <p>
                  3. <span className="font-medium">Compare & Explore</span>: Compare colleges using multiple visualization tools:
                </p>
                <div className="ml-6 space-y-2">
                  <p>• <span className="font-medium">Radar Chart</span>: Get a holistic view of how colleges compare across all parameters</p>
                  <p>• <span className="font-medium">Bar Chart</span>: See detailed parameter-by-parameter comparisons</p>
                  <p>• <span className="font-medium">Strengths Analysis</span>: Discover where each college excels compared to others</p>
                  <p>• <span className="font-medium">Detailed Table</span>: View exact numerical values for precise comparison</p>
                </div>
                <p>
                  4. <span className="font-medium">Make Informed Decisions</span>: Use data-driven insights to choose the best college for your future.
                </p>
              </div>
            </motion.section>

            <motion.section className="bg-card rounded-lg p-8" variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Advanced Comparison Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Strengths Analysis
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Our intelligent comparison tool identifies where each college excels:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Automatically detects parameters where colleges outperform others</li>
                    <li>• Shows percentage differences above average for each strength</li>
                    <li>• Highlights top 5 strongest parameters for each college</li>
                    <li>• Color-coded for easy identification</li>
                  </ul>
                </div>
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Visual Insights
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Multiple visualization options help you understand the data better:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Radar charts for overall performance patterns</li>
                    <li>• Interactive bar charts with percentage values</li>
                    <li>• Detailed tables for precise numerical comparison</li>
                    <li>• Tooltips with additional context and information</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            <motion.section className="bg-card rounded-lg p-8" variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Understanding Sorting and Grouping</h2>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <SortAsc className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-medium">Sorting</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Sorting helps you organize colleges or parameters in a way that makes them easier to find and compare:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Alphabetical Sorting</h4>
                    <p className="text-muted-foreground text-sm">
                      Arranges colleges from A to Z or Z to A, making it easy to find a specific college by name.
                    </p>
                    <div className="mt-3 bg-background/80 p-3 rounded text-xs">
                      <p>• IIT Bombay</p>
                      <p>• IIT Delhi</p>
                      <p>• IIT Kanpur</p>
                      <p>• IIT Madras</p>
                    </div>
                  </div>
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Parameter-based Sorting</h4>
                    <p className="text-muted-foreground text-sm">
                      Orders colleges based on their performance in a specific parameter (like Student Strength or Faculty Ratio).
                    </p>
                    <div className="mt-3 bg-background/80 p-3 rounded text-xs">
                      <p>• IIT Madras (SS: 95)</p>
                      <p>• IIT Bombay (SS: 92)</p>
                      <p>• IIT Delhi (SS: 88)</p>
                      <p>• IIT Kanpur (SS: 85)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-medium">Grouping</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Grouping organizes parameters or colleges into meaningful categories to help you understand related items:
                </p>
                <div className="bg-secondary/20 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Parameter Categories</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    Parameters are grouped by their NIRF categories, each represented by a different color:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <p className="font-medium text-sm">Teaching, Learning & Resources</p>
                      </div>
                      <p className="text-muted-foreground text-xs ml-5 mb-2">Student Strength, Faculty-Student Ratio, etc.</p>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <p className="font-medium text-sm">Research and Professional Practice</p>
                      </div>
                      <p className="text-muted-foreground text-xs ml-5 mb-2">Publications, Patents, Research Projects, etc.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <p className="font-medium text-sm">Graduation Outcomes</p>
                      </div>
                      <p className="text-muted-foreground text-xs ml-5 mb-2">Placements, Median Salary, etc.</p>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <p className="font-medium text-sm">Outreach and Inclusivity</p>
                      </div>
                      <p className="text-muted-foreground text-xs ml-5 mb-2">Regional Diversity, Women Diversity, etc.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Filter className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-medium">Filtering</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Filtering helps you focus on specific subsets of colleges or parameters:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Selected/Unselected</h4>
                    <p className="text-muted-foreground text-sm">
                      View only the colleges or parameters you've already selected, or those you haven't selected yet.
                    </p>
                  </div>
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Search</h4>
                    <p className="text-muted-foreground text-sm">
                      Find specific colleges or parameters by typing part of their name in the search box.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section className="bg-card rounded-lg p-8" variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Parameter Information</h2>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <MousePointer className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-medium">Hover for Details</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Our interface provides detailed information about each parameter to help you understand what you're comparing:
                </p>
                
                <div className="bg-secondary/20 p-4 rounded-lg mb-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-card p-3 rounded-lg shadow-sm flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium">Student Strength</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4">SS</span>
                      
                      <div className="mt-4 border border-dashed border-primary/40 p-3 rounded-lg bg-background/80">
                        <div className="flex justify-between items-center mb-1">
                          <Info className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Hover tooltip</span>
                        </div>
                        <h4 className="text-sm font-medium mb-1">SS - Full Form</h4>
                        <p className="text-xs text-muted-foreground mb-1">Student Strength including Doctoral Students: Evaluates the total number of students at different levels.</p>
                        <p className="text-xs"><strong>Weight:</strong> 20</p>
                        <p className="text-xs"><strong>Category:</strong> Teaching, Learning & Resources (TLR)</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Color Coding:</span> Each parameter is color-coded by its category
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Full Name:</span> The complete name is displayed prominently
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Parameter Code:</span> The NIRF code (e.g., SS, FSR) is shown below
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Hover for Details:</span> Hover over any parameter to see its full description, weight, and category
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}; 
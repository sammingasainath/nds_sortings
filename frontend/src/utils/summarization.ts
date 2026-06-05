import { WebSearchResult } from '@/types';
import { create } from 'zustand';
import { LLMService } from '@/services/llm/llmService';

interface SummarizationStore {
  llmService: LLMService | null;
  setLLMService: (service: LLMService | null) => void;
}

// Create a store to hold the LLM service
export const useSummarizationStore = create<SummarizationStore>((set) => ({
  llmService: null,
  setLLMService: (service) => set({ llmService: service }),
}));

export async function categorizeYouTubeVideos(results: WebSearchResult[]): Promise<{
  freshers: WebSearchResult[];
  campusTour: WebSearchResult[];
  fest: WebSearchResult[];
  reviews: WebSearchResult[];
  other: WebSearchResult[];
}> {
  try {
    // If no results, return early
    if (results.length === 0) {
      return {
        freshers: [],
        campusTour: [],
        fest: [],
        reviews: [],
        other: []
      };
    }

    const { llmService } = useSummarizationStore.getState();

    if (llmService) {
      try {
        const context = results.map(result => `Title: ${result.title}\nSnippet: ${result.snippet}\nLink: ${result.link}`).join('\n\n');
        
        const response = await llmService.processNaturalLanguageQuery(
          'Please categorize the following YouTube videos into these categories: "freshers" (for freshers introduction, orientation), "campusTour" (for campus tours, facilities), "fest" (for college fests, events), "reviews" (for student reviews, experiences), and "other" (for anything else). Return the result as a JSON object with these category names as keys and arrays of indices (0-based) of the videos that belong to each category.\n\n' + context,
          { temperature: 0.2, max_tokens: 1000 }
        );

        try {
          // Parse the response to get the categorization
          const categorization = JSON.parse(response);
          
          // Create the categorized results
          return {
            freshers: (categorization.freshers || []).map((index: number) => results[index] || null).filter(Boolean),
            campusTour: (categorization.campusTour || []).map((index: number) => results[index] || null).filter(Boolean),
            fest: (categorization.fest || []).map((index: number) => results[index] || null).filter(Boolean),
            reviews: (categorization.reviews || []).map((index: number) => results[index] || null).filter(Boolean),
            other: (categorization.other || []).map((index: number) => results[index] || null).filter(Boolean)
          };
        } catch (error) {
          console.error('Error parsing categorization response:', error);
          return keywordBasedCategorization(results);
        }
      } catch (error) {
        console.error('Error categorizing videos with LLM:', error);
        return keywordBasedCategorization(results);
      }
    } else {
      return keywordBasedCategorization(results);
    }
  } catch (error) {
    console.error('Error in categorizeYouTubeVideos:', error);
    return keywordBasedCategorization(results);
  }
}

function keywordBasedCategorization(results: WebSearchResult[]) {
  const freshers: WebSearchResult[] = [];
  const campusTour: WebSearchResult[] = [];
  const fest: WebSearchResult[] = [];
  const reviews: WebSearchResult[] = [];
  const other: WebSearchResult[] = [];

  results.forEach(result => {
    const title = result.title.toLowerCase();
    const snippet = result.snippet.toLowerCase();
    
    if (title.includes('fresher') || title.includes('orientation') || title.includes('first day') || 
        snippet.includes('fresher') || snippet.includes('orientation') || snippet.includes('first day')) {
      freshers.push(result);
    } else if (title.includes('campus') || title.includes('tour') || title.includes('facilities') || 
               snippet.includes('campus') || snippet.includes('tour') || snippet.includes('facilities')) {
      campusTour.push(result);
    } else if (title.includes('fest') || title.includes('event') || title.includes('celebration') || 
               snippet.includes('fest') || snippet.includes('event') || snippet.includes('celebration')) {
      fest.push(result);
    } else if (title.includes('review') || title.includes('experience') || title.includes('student life') || 
               snippet.includes('review') || snippet.includes('experience') || snippet.includes('student life')) {
      reviews.push(result);
    } else {
      other.push(result);
    }
  });

  return { freshers, campusTour, fest, reviews, other };
}

export async function extractStructuredInformation(results: WebSearchResult[]): Promise<{
  overview: string;
  location: string;
  rankings: string;
  admissions: string;
  facilities: string;
  images: string[];
}> {
  try {
    // If no results, return early
    if (results.length === 0) {
      return {
        overview: 'No information available.',
        location: 'No location information available.',
        rankings: 'No ranking information available.',
        admissions: 'No admission information available.',
        facilities: 'No facility information available.',
        images: []
      };
    }

    const { llmService } = useSummarizationStore.getState();

    if (llmService) {
      try {
        const context = results.map(result => `${result.title}\n${result.snippet}`).join('\n\n');
        
        const response = await llmService.processNaturalLanguageQuery(
          'Please extract structured information from the following search results about a college/university. Return the result as a JSON object with these keys: "overview" (brief overview of the institution), "location" (where it is located), "rankings" (any ranking information), "admissions" (admission process and requirements), and "facilities" (campus facilities and amenities).\n\n' + context,
          { temperature: 0.2, max_tokens: 1000 }
        );

        try {
          // Parse the response to get the structured information
          const structuredInfo = JSON.parse(response);
          
          return {
            overview: structuredInfo.overview || 'No overview available.',
            location: structuredInfo.location || 'No location information available.',
            rankings: structuredInfo.rankings || 'No ranking information available.',
            admissions: structuredInfo.admissions || 'No admission information available.',
            facilities: structuredInfo.facilities || 'No facility information available.',
            images: []
          };
        } catch (error) {
          console.error('Error parsing structured information response:', error);
          return {
            ...keywordBasedExtraction(results),
            images: []
          };
        }
      } catch (error) {
        console.error('Error extracting structured information with LLM:', error);
        return {
          ...keywordBasedExtraction(results),
          images: []
        };
      }
    } else {
      return {
        ...keywordBasedExtraction(results),
        images: []
      };
    }
  } catch (error) {
    console.error('Error in extractStructuredInformation:', error);
    return {
      ...keywordBasedExtraction(results),
      images: []
    };
  }
}

function keywordBasedExtraction(results: WebSearchResult[]) {
  let overview = 'No overview available.';
  let location = 'No location information available.';
  let rankings = 'No ranking information available.';
  let admissions = 'No admission information available.';
  let facilities = 'No facility information available.';

  results.forEach(result => {
    const title = result.title.toLowerCase();
    const snippet = result.snippet.toLowerCase();
    
    // Extract overview
    if (title.includes('about') || title.includes('overview') || title.includes('history') || 
        snippet.includes('established') || snippet.includes('founded')) {
      overview = result.snippet;
    }
    
    // Extract location
    if (title.includes('location') || title.includes('address') || title.includes('where') || 
        snippet.includes('located in') || snippet.includes('situated in')) {
      location = result.snippet;
    }
    
    // Extract rankings
    if (title.includes('rank') || title.includes('rating') || title.includes('position') || 
        snippet.includes('ranked') || snippet.includes('rating') || snippet.includes('position')) {
      rankings = result.snippet;
    }
    
    // Extract admissions
    if (title.includes('admission') || title.includes('apply') || title.includes('entrance') || 
        snippet.includes('admission') || snippet.includes('application') || snippet.includes('entrance exam')) {
      admissions = result.snippet;
    }
    
    // Extract facilities
    if (title.includes('facilities') || title.includes('amenities') || title.includes('infrastructure') || 
        snippet.includes('facilities') || snippet.includes('amenities') || snippet.includes('infrastructure')) {
      facilities = result.snippet;
    }
  });

  return { overview, location, rankings, admissions, facilities };
} 
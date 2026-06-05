import { useState, useEffect } from 'react';
import { College } from '@/types';
import collegesData from '@/data/colleges.json';

export const useColleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [parameters, setParameters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use the imported data directly
    setColleges(collegesData);
    
    // Extract unique parameters from the first college
    if (collegesData.length > 0) {
      const params = Object.keys(collegesData[0]).filter(key => 
        key !== 'Name' && 
        key !== 'id' && 
        key !== 'Unnamed: 0' &&
        !key.startsWith('_')
      );
      setParameters(params);
    }
    
    setIsLoading(false);
  }, []);

  return {
    colleges,
    parameters,
    isLoading
  };
}; 
import { ResultExplanationRequest } from '../types';

export const getResultExplanationPrompt = (request: ResultExplanationRequest): string => {
  const { college, frontNumber, parameters } = request;
  
  return `
I need an explanation for why a college appears in a specific Pareto front in our non-dominated sorting results.

College: ${college}
Pareto Front: ${frontNumber}
Parameters considered: ${parameters.join(', ')}

In non-dominated sorting:
- Front 1 contains colleges that are not dominated by any other college
- Front 2 contains colleges that are only dominated by colleges in Front 1
- And so on...

A college dominates another if it's at least as good in all parameters and strictly better in at least one parameter.

Please explain:
1. What this front placement means for this college
2. What strengths and weaknesses this college likely has based on this placement
3. How this college might compare to others in higher or lower fronts
4. What types of students might prefer this college based on its placement

Keep your explanation concise (3-4 sentences) and focused on practical implications.
`;
}; 
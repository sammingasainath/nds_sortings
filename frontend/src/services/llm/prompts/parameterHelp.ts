import { ParameterSuggestionRequest } from '../types';

export const getParameterHelpPrompt = (request: ParameterSuggestionRequest): string => {
  const { userGoal, availableParameters } = request;
  
  return `
Based on the following goal, suggest the most relevant parameters for evaluating colleges.

User's goal: ${userGoal}

Available parameters: ${availableParameters.join(', ')}

IMPORTANT: Return ONLY a JSON array containing the parameter codes, like this:
["PARAM1", "PARAM2", "PARAM3"]

Rules:
1. Only include parameters from the available list
2. Return the exact parameter codes as shown in the available list
3. Do not include any explanation or additional text
4. Format must be a valid JSON array
5. Select 3-6 most relevant parameters

Example response format:
["FSR", "FQE", "IPR"]
`;
}; 
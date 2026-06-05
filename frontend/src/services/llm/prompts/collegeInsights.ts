import { CollegeInsightRequest } from '../types';

export const getCollegeInsightPrompt = (request: CollegeInsightRequest): string => {
  const { colleges, parameters } = request;
  
  let prompt = `
I need comprehensive insights about the following colleges based on their parameters.

Colleges in the Optimal Group: ${colleges.map(college => college.Name).join(', ')}

Parameters considered: ${parameters.join(', ')}

For each parameter, here's what it represents:
${parameters.map(param => {
  switch(param) {
    case 'SS': return '- SS: Student Strength including Doctoral Students';
    case 'FSR': return '- FSR: Faculty-Student Ratio with emphasis on permanent faculty';
    case 'FQE': return '- FQE: Faculty Qualification and Experience';
    case 'FRU': return '- FRU: Financial Resources and their Utilisation';
    case 'PU': return '- PU: Combined metric for Publications';
    case 'QP': return '- QP: Combined metric for Quality of Publications';
    case 'IPR': return '- IPR: IPR and Patents';
    case 'FPPP': return '- FPPP: Footprint of Projects, Professional Practice and Executive Development Programs';
    case 'GPH': return '- GPH: Metric for Placement and Higher Studies';
    case 'GUE': return '- GUE: Metric for University Examinations';
    case 'MS': return '- MS: Median Salary';
    case 'GPHD': return '- GPHD: Metric for Number of PhD Students Graduated';
    case 'RD': return '- RD: Region Diversity';
    case 'WD': return '- WD: Women Diversity';
    case 'ESCS': return '- ESCS: Economically and Socially Challenged Students';
    case 'PCS': return '- PCS: Facilities for Physically Challenged Students';
    case 'PR': return '- PR: Perception Rating';
    default: return `- ${param}: Parameter related to college performance`;
  }
}).join('\n')}

Here's the detailed parameter data for each college:
${colleges.map(college => {
  return `${college.Name}:
${parameters.map(param => `  - ${param}: ${college[param]}`).join('\n')}`;
}).join('\n\n')}

Please provide the following insights:

1. STRENGTHS ANALYSIS:
   - Identify the key strengths of each college based on their parameter values
   - Highlight which colleges excel in which specific areas
   - Compare the relative strengths across the colleges

2. COMPARATIVE EVALUATION:
   - Analyze how these colleges compare to each other across the selected parameters
   - Identify any patterns or clusters of colleges with similar profiles
   - Highlight any colleges that stand out as particularly well-rounded

3. DECISION GUIDANCE:
   - Provide guidance on which colleges might be best suited for students with different priorities
   - Suggest factors that should be considered when choosing between these colleges
   - Identify any unique opportunities or specializations offered by specific colleges

4. PARAMETER INSIGHTS:
   - Analyze which parameters show the most variation across these colleges
   - Identify any correlations between different parameters
   - Suggest which parameters might be most important for different types of students

Format your response in a clear, structured way with headings and bullet points. Focus on providing actionable insights that would help a student make an informed decision. Be specific and reference actual parameter values where relevant.
`;

  return prompt;
}; 
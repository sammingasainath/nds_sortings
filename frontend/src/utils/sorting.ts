import { College, NonDominatedSortingResult } from '@/types';

/**
 * Checks if college A dominates college B based on selected parameters
 */
function dominates(a: College, b: College, parameters: string[]): boolean {
    let atLeastOneBetter = false;
    
    for (const param of parameters) {
        const aValue = Number(a[param]);
        const bValue = Number(b[param]);
        
        if (aValue < bValue) return false;
        if (aValue > bValue) atLeastOneBetter = true;
    }
    
    return atLeastOneBetter;
}

/**
 * Performs non-dominated sorting on a set of colleges
 */
export function nonDominatedSort(
    colleges: College[],
    parameters: string[]
): NonDominatedSortingResult[] {
    const results: NonDominatedSortingResult[] = [];
    let remainingColleges = [...colleges];
    let frontNumber = 1;

    while (remainingColleges.length > 0) {
        const front: College[] = [];
        
        // Find non-dominated colleges for current front
        for (const college of remainingColleges) {
            let isDominated = false;
            
            for (const other of remainingColleges) {
                if (college === other) continue;
                if (dominates(other, college, parameters)) {
                    isDominated = true;
                    break;
                }
            }
            
            if (!isDominated) {
                front.push(college);
            }
        }
        
        // Add current front to results
        front.forEach(college => {
            results.push({ college, frontNumber });
        });
        
        // Remove colleges in current front from remaining colleges
        remainingColleges = remainingColleges.filter(
            college => !front.includes(college)
        );
        
        frontNumber++;
    }
    
    return results;
} 
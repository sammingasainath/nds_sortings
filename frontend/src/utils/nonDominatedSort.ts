import { College, NonDominatedSortingResult } from '../types';

export const nonDominatedSort = (
    colleges: College[],
    objectives: string[]
): NonDominatedSortingResult[] => {
    const points = colleges.map(college => 
        objectives.map(obj => Number(college[obj]))
    );
    const numPoints = points.length;

    // Initialize dominance tracking structures
    const dominates: { [key: number]: number[] } = {};
    const dominatedBy: number[] = new Array(numPoints).fill(0);

    // Initialize dominates object
    for (let i = 0; i < numPoints; i++) {
        dominates[i] = [];
    }

    // Compare all college pairs for dominance
    for (let i = 0; i < numPoints; i++) {
        for (let j = 0; j < numPoints; j++) {
            if (i === j) continue;

            // Check if point i dominates point j
            if (objectives.every((_, idx) => points[i][idx] > points[j][idx])) {
                dominates[i].push(j);
                dominatedBy[j]++;
            }
        }
    }

    // Identify Pareto fronts iteratively
    const fronts: number[][] = [];
    let currentFront = Array.from({ length: numPoints })
        .map((_, idx) => idx)
        .filter(idx => dominatedBy[idx] === 0);

    while (currentFront.length > 0) {
        fronts.push(currentFront);
        const nextFront: number[] = [];

        // For each point in current front
        for (const i of currentFront) {
            // For each point dominated by i
            for (const j of dominates[i]) {
                dominatedBy[j]--;
                if (dominatedBy[j] === 0) {
                    nextFront.push(j);
                }
            }
        }

        currentFront = nextFront;
    }

    // Map indices to colleges and front numbers
    const results: NonDominatedSortingResult[] = [];
    fronts.forEach((front, frontIdx) => {
        front.forEach(collegeIdx => {
            results.push({
                college: colleges[collegeIdx],
                frontNumber: frontIdx + 1
            });
        });
    });

    return results;
}; 
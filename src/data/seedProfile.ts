import type { StudentProfile } from '../types';

/**
 * Demo BSIS student — 3 semesters completed, enrolled in 4th.
 * Interests: AI + music technology + creative industries.
 */
export const SEED_PROFILE: Omit<StudentProfile, 'id' | 'createdAt' | 'genEdChecks'> = {
  name: 'Alex',
  majors: ['BS Information Science'],
  interests: 'I want to work in AI and music technology. Interested in how data science can be applied to creative industries.',
  catalogYear: '2024-2025',
  planSemester: 'Summer 2026',
  selectedMinors: ['Music'],

  // ── 3 completed semesters ──
  completedCourses: [
    // Semester 1 — Fall 2024 (Freshman)
    { code: 'ENGL 101', name: 'First-Year Composition', units: 3, grade: 'A', semester: 'Fall 2024' },
    { code: 'UNIV 101', name: 'Wildcat Ready', units: 1, grade: 'A', semester: 'Fall 2024' },
    { code: 'ISTA 100', name: 'Great Ideas of the Information Age', units: 3, grade: 'A-', semester: 'Fall 2024' },
    { code: 'MATH 112', name: 'College Algebra', units: 3, grade: 'B+', semester: 'Fall 2024' },
    { code: 'SPAN 101', name: 'First Semester Spanish', units: 4, grade: 'B', semester: 'Fall 2024' },

    // Semester 2 — Spring 2025 (Freshman)
    { code: 'ENGL 102', name: 'First-Year Composition', units: 3, grade: 'A', semester: 'Spring 2025' },
    { code: 'ISTA 116', name: 'Statistical Foundations', units: 3, grade: 'B+', semester: 'Spring 2025' },
    { code: 'ISTA 130', name: 'Computational Thinking & Doing', units: 4, grade: 'A-', semester: 'Spring 2025' },
    { code: 'SPAN 102', name: 'Second Semester Spanish', units: 4, grade: 'B+', semester: 'Spring 2025' },

    // Semester 3 — Fall 2025 (Sophomore)
    { code: 'ISTA 131', name: 'Dealing with Data', units: 4, grade: 'A', semester: 'Fall 2025' },
    { code: 'ISTA 161', name: 'Ethics in a Digital World', units: 3, grade: 'A-', semester: 'Fall 2025' },
    { code: 'PSY 101', name: 'Intro to Psychology', units: 3, grade: 'B+', semester: 'Fall 2025' },
    { code: 'MUS 109', name: 'Intro to Music in Western Culture', units: 3, grade: 'A', semester: 'Fall 2025' },
    { code: 'MUS 119', name: 'Intro to Music Theory', units: 3, grade: 'B+', semester: 'Fall 2025' },
  ],

  // ── Currently enrolled — Spring 2026 (Sophomore) ──
  currentCourses: [
    { code: 'ISTA 230', name: 'Intro to Web Design', units: 3 },
    { code: 'PHIL 101', name: 'Intro to Philosophy', units: 3 },
    { code: 'GEOG 101', name: 'Intro to Physical Geography', units: 3 },
    { code: 'ESOC 302', name: 'Quant Methods for Digital Marketplace', units: 3 },
  ],
};

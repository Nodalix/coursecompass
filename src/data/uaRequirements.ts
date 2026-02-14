/**
 * Universal UA graduation requirements (pre-Fall 2026 catalog).
 * These apply to ALL undergrads matriculating Spring 2022 or later.
 */

export const UA_REQUIREMENTS = {
  totalUnits: 120,
  upperDivisionMin: 42,

  foundations: {
    composition: {
      label: 'First-Year Composition',
      courses: ['ENGL 101', 'ENGL 102'],
      units: 6,
    },
    math: {
      label: 'Mathematics',
      note: 'Varies by major (MATH 112 College Algebra is common minimum)',
      units: 3,
    },
  },

  secondLanguage: {
    label: 'Second Language',
    semesters: 2,
    units: 8,
    note: 'Two semesters or equivalent placement',
  },

  genEdEntryExit: {
    label: 'Gen Ed Entry/Exit',
    courses: ['UNIV 101', 'UNIV 301'],
    units: 2,
    note: 'Required for first-year admits',
  },

  exploringPerspectives: {
    label: 'Exploring Perspectives',
    totalUnits: 12,
    domains: [
      { key: 'A' as const, name: 'The Artist', tag: 'GEED - EPART' },
      { key: 'H' as const, name: 'The Humanist', tag: 'GEED - EPHUM' },
      { key: 'N' as const, name: 'The Natural Scientist', tag: 'GEED - EPNAT' },
      { key: 'S' as const, name: 'The Social Scientist', tag: 'GEED - EPSOC' },
    ],
    note: 'At least 1 course from each domain',
  },

  buildingConnections: {
    label: 'Building Connections',
    totalUnits: 9,
    coursesRequired: 3,
    tag: 'GEED - BC',
  },
} as const;

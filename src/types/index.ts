export interface StudentProfile {
  id: string;
  name: string;
  majors: string[];
  emphasis?: string;
  interests: string;
  catalogYear: string;
  completedCourses: CompletedCourse[];
  currentCourses?: CompletedCourse[];
  selectedMinors: string[];
  planSemester: string;
  createdAt: string;
  /** Checked-off gen ed items (foundations, language, etc.) */
  genEdChecks: GenEdChecks;
}

export interface CompletedCourse {
  code: string;
  name: string;
  units: number;
  grade?: string;
  semester?: string;
}

export interface GenEdChecks {
  engl101: boolean;
  engl102: boolean;
  math: boolean;
  lang1: boolean;
  lang2: boolean;
  univ101: boolean;
  univ301: boolean;
}

export const emptyGenEdChecks: GenEdChecks = {
  engl101: false,
  engl102: false,
  math: false,
  lang1: false,
  lang2: false,
  univ101: false,
  univ301: false,
};

export interface GenEdCourse {
  c: string;
  n: string;
  u: number;
  d: string;
  g: string[];
  at: string[] | null;
  desc: string;
  p: string | null;
}

export type GenEdDomainKey = 'A' | 'H' | 'N' | 'S' | 'B';

export interface GenEdDomain {
  key: GenEdDomainKey;
  name: string;
  label: string;
  minUnits: number;
  minCourses: number;
}

export const GEN_ED_DOMAINS: GenEdDomain[] = [
  { key: 'A', name: 'The Artist', label: 'Artist', minUnits: 3, minCourses: 1 },
  { key: 'H', name: 'The Humanist', label: 'Humanist', minUnits: 3, minCourses: 1 },
  { key: 'N', name: 'The Natural Scientist', label: 'Nat Sci', minUnits: 3, minCourses: 1 },
  { key: 'S', name: 'The Social Scientist', label: 'Soc Sci', minUnits: 3, minCourses: 1 },
];

export const BC_DOMAIN: GenEdDomain = {
  key: 'B',
  name: 'Building Connections',
  label: 'Build Conn',
  minUnits: 9,
  minCourses: 3,
};

import type { StudentProfile } from '../types';
import { BSIS_REQUIREMENTS } from '../data/bsisRequirements';
import { MUSIC_MINOR } from '../data/minors/music';
import { BUSINESS_MINOR } from '../data/minors/business';

export interface MajorProgress {
  name: string;
  completedCourses: number;
  totalCourses: number;
  percent: number;
  known: boolean;
}

export interface MinorProgress {
  name: string;
  completedUnits: number;
  totalUnits: number;
  percent: number;
  known: boolean;
}

export interface SuggestedMinor {
  name: string;
  reason: string;
  overlap: number; // courses already completed that count
}

const MINOR_DB: Record<string, { name: string; totalUnits: number; courses: string[] }> = {
  music: {
    name: 'Music',
    totalUnits: MUSIC_MINOR.totalUnits,
    courses: [MUSIC_MINOR.required[0].code, ...MUSIC_MINOR.doubleDipCourses.map((c) => c.code)],
  },
  'business administration': {
    name: 'Business Administration',
    totalUnits: BUSINESS_MINOR.totalUnits,
    courses: [
      ...BUSINESS_MINOR.lowerDivision.map((c) => c.code),
      ...BUSINESS_MINOR.upperDivision.map((c) => c.code),
    ],
  },
};

export function calculateMajorProgress(profile: StudentProfile, majorName: string): MajorProgress {
  const completedCodes = new Set(profile.completedCourses.map((c) => c.code));
  const normalizedMajor = majorName.toLowerCase();

  // BSIS
  if (normalizedMajor.includes('information science') || normalizedMajor.includes('bsis')) {
    const allRequired = [
      ...BSIS_REQUIREMENTS.core.map((c) => c.code),
      ...BSIS_REQUIREMENTS.additionalRequired.map((c) => c.code),
    ];
    // core + required + 3 electives + 5 emphasis courses = total
    const totalCourses = allRequired.length + 3 + 5;
    const completedReq = allRequired.filter((c) => completedCodes.has(c)).length;

    // Check emphasis courses
    let emphasisComplete = 0;
    for (const emp of Object.values(BSIS_REQUIREMENTS.emphases)) {
      const count = emp.courses.filter((c) => completedCodes.has(c)).length;
      emphasisComplete = Math.max(emphasisComplete, count);
    }

    const completedCourses = completedReq + Math.min(3, emphasisComplete);
    return {
      name: majorName,
      completedCourses,
      totalCourses,
      percent: Math.round((completedCourses / totalCourses) * 100),
      known: true,
    };
  }

  // Unknown major — estimate based on typical 40-course major
  const estimatedTotal = 15;
  return {
    name: majorName,
    completedCourses: Math.min(profile.completedCourses.length, estimatedTotal),
    totalCourses: estimatedTotal,
    percent: Math.min(100, Math.round((profile.completedCourses.length / estimatedTotal) * 100)),
    known: false,
  };
}

export function calculateMinorProgress(profile: StudentProfile, minorName: string): MinorProgress {
  const normalizedMinor = minorName.toLowerCase();

  const minorData = MINOR_DB[normalizedMinor];
  if (minorData) {
    const completedUnits = profile.completedCourses
      .filter((c) => minorData.courses.includes(c.code))
      .reduce((sum, c) => sum + c.units, 0);

    return {
      name: minorName,
      completedUnits,
      totalUnits: minorData.totalUnits,
      percent: Math.round((completedUnits / minorData.totalUnits) * 100),
      known: true,
    };
  }

  // Unknown minor — estimate 18 units
  return {
    name: minorName,
    completedUnits: 0,
    totalUnits: 18,
    percent: 0,
    known: false,
  };
}

// Suggested minors based on student profile
const MINOR_SUGGESTIONS: {
  name: string;
  keywords: string[];
  deptPrefixes: string[];
  majorKeywords: string[];
  description: string;
}[] = [
  {
    name: 'Music',
    keywords: ['music', 'audio', 'sound', 'creative', 'art', 'perform'],
    deptPrefixes: ['MUS'],
    majorKeywords: [],
    description: 'Explore music theory, performance, and technology',
  },
  {
    name: 'Business Administration',
    keywords: ['business', 'entrepreneur', 'startup', 'management', 'marketing', 'finance'],
    deptPrefixes: ['BNAD', 'ACCT', 'ECON', 'MIS', 'MGMT'],
    majorKeywords: [],
    description: 'Build business fundamentals for any career',
  },
  {
    name: 'Computer Science',
    keywords: ['programming', 'software', 'tech', 'coding', 'developer', 'ai', 'machine learning'],
    deptPrefixes: ['CSC'],
    majorKeywords: ['information science', 'data'],
    description: 'Strengthen programming and algorithm skills',
  },
  {
    name: 'Data Science',
    keywords: ['data', 'analytics', 'machine learning', 'ai', 'statistics'],
    deptPrefixes: ['ISTA', 'DATA'],
    majorKeywords: ['computer science', 'information', 'math'],
    description: 'Learn to extract insights from data at scale',
  },
  {
    name: 'Psychology',
    keywords: ['psychology', 'behavior', 'mental health', 'cognitive', 'ux', 'user experience'],
    deptPrefixes: ['PSY'],
    majorKeywords: [],
    description: 'Understand human behavior and cognition',
  },
  {
    name: 'Spanish',
    keywords: ['spanish', 'language', 'bilingual', 'latin america', 'translation'],
    deptPrefixes: ['SPAN'],
    majorKeywords: [],
    description: 'Valuable bilingual communication skills',
  },
  {
    name: 'Mathematics',
    keywords: ['math', 'quantitative', 'modeling', 'statistics'],
    deptPrefixes: ['MATH'],
    majorKeywords: ['engineering', 'physics', 'computer science'],
    description: 'Build a strong quantitative foundation',
  },
  {
    name: 'Communication',
    keywords: ['communication', 'media', 'public relations', 'journalism', 'writing'],
    deptPrefixes: ['COMM'],
    majorKeywords: ['political science', 'english', 'media'],
    description: 'Master persuasion, media, and public speaking',
  },
];

export function getSuggestedMinors(profile: StudentProfile): SuggestedMinor[] {
  const currentMinors = new Set(profile.selectedMinors.map((m) => m.toLowerCase()));
  const interests = (profile.interests ?? '').toLowerCase();
  const majors = profile.majors.map((m) => m.toLowerCase()).join(' ');
  const completedDepts = new Set(profile.completedCourses.map((c) => c.code.split(' ')[0]));

  const scored: (SuggestedMinor & { score: number })[] = [];

  for (const minor of MINOR_SUGGESTIONS) {
    if (currentMinors.has(minor.name.toLowerCase())) continue;

    let score = 0;
    const reasons: string[] = [];

    // Interest keyword match
    const interestMatches = minor.keywords.filter((k) => interests.includes(k));
    if (interestMatches.length > 0) {
      score += interestMatches.length * 3;
      reasons.push('Matches your interests');
    }

    // Major complement
    const majorMatches = minor.majorKeywords.filter((k) => majors.includes(k));
    if (majorMatches.length > 0) {
      score += majorMatches.length * 2;
      reasons.push('Complements your major');
    }

    // Already have courses in related departments
    const deptOverlap = minor.deptPrefixes.filter((d) => completedDepts.has(d));
    if (deptOverlap.length > 0) {
      score += deptOverlap.length * 2;
      reasons.push('You already have related courses');
    }

    if (score > 0) {
      scored.push({
        name: minor.name,
        reason: reasons[0] ?? minor.description,
        overlap: deptOverlap.length,
        score,
      });
    }
  }

  // Sort by score, take top 3
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(({ score: _s, ...rest }) => rest);
}

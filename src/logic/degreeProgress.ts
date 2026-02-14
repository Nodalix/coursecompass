import type { StudentProfile, GenEdCourse } from '../types';
import { GEN_ED_DOMAINS } from '../types';
import { BSIS_REQUIREMENTS } from '../data/bsisRequirements';
import { MUSIC_MINOR } from '../data/minors/music';
import { BUSINESS_MINOR } from '../data/minors/business';
import genEdCourses from '../data/genEdCourses.json';
import { isDomainSatisfied } from './genEdProgress';

const genEd = genEdCourses as GenEdCourse[];

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

export interface MajorBreakdownGroup {
  label: string;
  courses: { code: string; name: string; units: number; done: boolean }[];
}

export interface MajorBreakdown {
  name: string;
  known: boolean;
  groups: MajorBreakdownGroup[];
}

export function getMajorBreakdown(profile: StudentProfile, majorName: string): MajorBreakdown {
  const completedCodes = new Set(profile.completedCourses.map((c) => c.code));
  const normalizedMajor = majorName.toLowerCase();

  if (normalizedMajor.includes('information science') || normalizedMajor.includes('bsis')) {
    const groups: MajorBreakdownGroup[] = [
      {
        label: 'Core',
        courses: BSIS_REQUIREMENTS.core.map((c) => ({
          code: c.code,
          name: c.name,
          units: c.units,
          done: completedCodes.has(c.code),
        })),
      },
      {
        label: 'Required',
        courses: BSIS_REQUIREMENTS.additionalRequired.map((c) => ({
          code: c.code,
          name: c.name,
          units: c.units,
          done: completedCodes.has(c.code),
        })),
      },
    ];

    // Find best-matching emphasis
    let bestEmphasis = { name: '', courses: [] as string[], units: 0 };
    let bestCount = 0;
    for (const emp of Object.values(BSIS_REQUIREMENTS.emphases)) {
      const count = emp.courses.filter((c) => completedCodes.has(c)).length;
      if (count > bestCount) {
        bestCount = count;
        bestEmphasis = { name: emp.name, courses: [...emp.courses], units: emp.units };
      }
    }

    if (bestEmphasis.name) {
      groups.push({
        label: `Emphasis: ${bestEmphasis.name}`,
        courses: bestEmphasis.courses.map((code) => ({
          code,
          name: '',
          units: 3,
          done: completedCodes.has(code),
        })),
      });
    }

    return { name: majorName, known: true, groups };
  }

  return { name: majorName, known: false, groups: [] };
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

// ── Recommended courses for next semester ──

export interface RecommendedCourse {
  code: string;
  name: string;
  units: number;
  reason: string;
}

export function getRecommendedCourses(profile: StudentProfile, maxCourses = 5): RecommendedCourse[] {
  const allDone = new Set([
    ...profile.completedCourses.map((c) => c.code),
    ...(profile.currentCourses ?? []).map((c) => c.code),
  ]);
  const recs: (RecommendedCourse & { priority: number })[] = [];

  // 1. UNIV 301 if not done
  if (!allDone.has('UNIV 301') && !profile.genEdChecks.univ301) {
    recs.push({ code: 'UNIV 301', name: 'Gen Ed Capstone', units: 1, reason: 'Required — finish UNIV', priority: 10 });
  }

  // 2. Building Connections courses needed
  const bcCourses = genEd.filter((c) => c.g.includes('B'));
  const bcDone = bcCourses.filter((c) => allDone.has(c.c));
  const bcNeeded = 3 - bcDone.length;
  if (bcNeeded > 0) {
    const bcAvailable = bcCourses
      .filter((c) => !allDone.has(c.c))
      .sort((a, b) => {
        // Prefer courses that also count for interests
        const interests = (profile.interests ?? '').toLowerCase();
        const aMatch = interests.includes(a.d.toLowerCase()) ? 1 : 0;
        const bMatch = interests.includes(b.d.toLowerCase()) ? 1 : 0;
        return bMatch - aMatch;
      });

    for (let i = 0; i < Math.min(bcNeeded, 2); i++) {
      if (bcAvailable[i]) {
        recs.push({
          code: bcAvailable[i].c,
          name: bcAvailable[i].n,
          units: bcAvailable[i].u,
          reason: `Building Connections (${bcDone.length + i + 1}/3)`,
          priority: 8,
        });
      }
    }
  }

  // 3. Unsatisfied EP domains
  for (const domain of GEN_ED_DOMAINS) {
    if (!isDomainSatisfied(profile, domain.key)) {
      const available = genEd
        .filter((c) => c.g.includes(domain.key) && !allDone.has(c.c))
        .slice(0, 1);
      if (available[0]) {
        recs.push({
          code: available[0].c,
          name: available[0].n,
          units: available[0].u,
          reason: `EP: ${domain.name}`,
          priority: 7,
        });
      }
    }
  }

  // 4. Next major courses (BSIS emphasis)
  const normalizedMajor = profile.majors.map((m) => m.toLowerCase()).join(' ');
  if (normalizedMajor.includes('information science') || normalizedMajor.includes('bsis')) {
    // Find best emphasis
    let bestEmphasis = { name: '', courses: [] as string[] };
    let bestCount = 0;
    for (const emp of Object.values(BSIS_REQUIREMENTS.emphases)) {
      const count = emp.courses.filter((c) => allDone.has(c)).length;
      if (count > bestCount) {
        bestCount = count;
        bestEmphasis = { name: emp.name, courses: [...emp.courses] };
      }
    }
    if (!bestEmphasis.name) {
      // Default to Data Science if none started
      bestEmphasis = { name: BSIS_REQUIREMENTS.emphases.data_science.name, courses: [...BSIS_REQUIREMENTS.emphases.data_science.courses] };
    }
    const nextEmphasis = bestEmphasis.courses.filter((c) => !allDone.has(c)).slice(0, 2);
    for (const code of nextEmphasis) {
      recs.push({ code, name: '', units: 3, reason: `${bestEmphasis.name} emphasis`, priority: 6 });
    }

    // Required courses not done
    for (const c of BSIS_REQUIREMENTS.additionalRequired) {
      if (!allDone.has(c.code)) {
        recs.push({ code: c.code, name: c.name, units: c.units, reason: 'Major required', priority: 5 });
      }
    }
  }

  // 5. Minor courses
  for (const minorName of profile.selectedMinors) {
    const minorData = MINOR_DB[minorName.toLowerCase()];
    if (minorData) {
      const next = minorData.courses.filter((c) => !allDone.has(c)).slice(0, 1);
      if (next[0]) {
        const course = genEd.find((c) => c.c === next[0]);
        recs.push({
          code: next[0],
          name: course?.n ?? '',
          units: course?.u ?? 3,
          reason: `${minorName} minor`,
          priority: 4,
        });
      }
    }
  }

  // Dedupe and sort by priority
  const seen = new Set<string>();
  const unique = recs.filter((r) => {
    if (seen.has(r.code)) return false;
    seen.add(r.code);
    return true;
  });
  unique.sort((a, b) => b.priority - a.priority);
  return unique.slice(0, maxCourses).map(({ priority: _p, ...rest }) => rest);
}

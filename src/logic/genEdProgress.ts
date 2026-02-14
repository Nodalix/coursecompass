import type { StudentProfile, GenEdDomainKey } from '../types';
import { GEN_ED_DOMAINS, BC_DOMAIN } from '../types';
import genEdCourses from '../data/genEdCourses.json';
import type { GenEdCourse } from '../types';

const courses = genEdCourses as GenEdCourse[];

export function getCoursesForDomain(domain: GenEdDomainKey): GenEdCourse[] {
  return courses.filter((c) => c.g.includes(domain));
}

export function getCompletedForDomain(profile: StudentProfile, domain: GenEdDomainKey): string[] {
  const domainCodes = new Set(getCoursesForDomain(domain).map((c) => c.c));
  return profile.completedCourses.filter((c) => domainCodes.has(c.code)).map((c) => c.code);
}

export function getDomainUnitsCompleted(profile: StudentProfile, domain: GenEdDomainKey): number {
  const completedCodes = new Set(getCompletedForDomain(profile, domain));
  return courses
    .filter((c) => c.g.includes(domain) && completedCodes.has(c.c))
    .reduce((sum, c) => sum + c.u, 0);
}

export function isDomainSatisfied(profile: StudentProfile, domain: GenEdDomainKey): boolean {
  const info = domain === 'B' ? BC_DOMAIN : GEN_ED_DOMAINS.find((d) => d.key === domain);
  if (!info) return false;
  return getDomainUnitsCompleted(profile, domain) >= info.minUnits;
}

export interface GenEdProgress {
  foundationsComplete: number;
  foundationsTotal: number;
  languageComplete: number;
  languageTotal: number;
  univComplete: number;
  univTotal: number;
  epDomainsComplete: number;
  epDomainsTotal: number;
  bcUnitsComplete: number;
  bcUnitsTotal: number;
  overallPercent: number;
}

export function calculateGenEdProgress(profile: StudentProfile): GenEdProgress {
  const checks = profile.genEdChecks;

  // Foundations: ENGL 101, ENGL 102, Math = 3 items
  const foundationsComplete = [checks.engl101, checks.engl102, checks.math].filter(Boolean).length;
  const foundationsTotal = 3;

  // Language: 2 semesters
  const languageComplete = [checks.lang1, checks.lang2].filter(Boolean).length;
  const languageTotal = 2;

  // UNIV
  const univComplete = [checks.univ101, checks.univ301].filter(Boolean).length;
  const univTotal = 2;

  // EP domains: 4 domains, each needs at least 1 course
  const epDomainsComplete = GEN_ED_DOMAINS.filter((d) => isDomainSatisfied(profile, d.key)).length;
  const epDomainsTotal = 4;

  // Building Connections: 9 units (3 courses)
  const bcUnitsComplete = getDomainUnitsCompleted(profile, 'B');
  const bcUnitsTotal = 9;

  // Overall: weighted average
  const totalItems = foundationsTotal + languageTotal + univTotal + epDomainsTotal + 3; // 3 BC slots
  const completedItems =
    foundationsComplete +
    languageComplete +
    univComplete +
    epDomainsComplete +
    Math.min(3, Math.floor(bcUnitsComplete / 3));
  const overallPercent = Math.round((completedItems / totalItems) * 100);

  return {
    foundationsComplete,
    foundationsTotal,
    languageComplete,
    languageTotal,
    univComplete,
    univTotal,
    epDomainsComplete,
    epDomainsTotal,
    bcUnitsComplete,
    bcUnitsTotal,
    overallPercent,
  };
}

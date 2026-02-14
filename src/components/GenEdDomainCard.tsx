import { useState } from 'react';
import type { GenEdCourse, GenEdDomain } from '../types';
import { useProfile } from '../context/ProfileContext';
import { getCoursesForDomain, getDomainUnitsCompleted } from '../logic/genEdProgress';
import CourseCard from './CourseCard';

interface GenEdDomainCardProps {
  domain: GenEdDomain;
}

const DOMAIN_ICONS: Record<string, string> = {
  A: '🎨',
  H: '📚',
  N: '🔬',
  S: '🌍',
  B: '🔗',
};

export default function GenEdDomainCard({ domain }: GenEdDomainCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { currentProfile, addCompletedCourse, removeCompletedCourse } = useProfile();

  if (!currentProfile) return null;

  const courses = getCoursesForDomain(domain.key);
  const unitsCompleted = getDomainUnitsCompleted(currentProfile, domain.key);
  const satisfied = unitsCompleted >= domain.minUnits;
  const completedCodes = new Set(currentProfile.completedCourses.map((c) => c.code));

  const handleToggle = (course: GenEdCourse) => {
    if (completedCodes.has(course.c)) {
      removeCompletedCourse(course.c);
    } else {
      addCompletedCourse({ code: course.c, name: course.n, units: course.u });
    }
  };

  return (
    <div className="rounded-xl border border-navy-lighter bg-navy-light/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-navy-light"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{DOMAIN_ICONS[domain.key]}</span>
          <div>
            <h3 className="font-semibold text-white">{domain.name}</h3>
            <p className="text-xs text-gray-400">
              {courses.length} courses available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              satisfied
                ? 'bg-teal/15 text-teal'
                : 'bg-ua-red/15 text-ua-red'
            }`}
          >
            {satisfied ? 'Complete' : `${unitsCompleted}/${domain.minUnits}u`}
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-navy-lighter p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard
                key={course.c}
                course={course}
                isCompleted={completedCodes.has(course.c)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

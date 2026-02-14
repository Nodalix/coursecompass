import type { GenEdCourse } from '../types';

interface CourseCardProps {
  course: GenEdCourse;
  isCompleted: boolean;
  onToggle: (course: GenEdCourse) => void;
}

const DOMAIN_LABELS: Record<string, string> = {
  A: 'Artist',
  H: 'Humanist',
  N: 'Nat Sci',
  S: 'Soc Sci',
  B: 'Build Conn',
};

const ATTR_LABELS: Record<string, string> = {
  W: 'Writing',
  Q: 'Quant',
  C: 'World Cult',
};

export default function CourseCard({ course, isCompleted, onToggle }: CourseCardProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        isCompleted
          ? 'border-teal/30 bg-teal/5'
          : 'border-navy-lighter bg-navy-light hover:border-navy-lighter/80'
      }`}
    >
      <button
        onClick={() => onToggle(course)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          isCompleted
            ? 'border-teal bg-teal text-navy'
            : 'border-gray-500 hover:border-teal'
        }`}
      >
        {isCompleted && (
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold text-teal">{course.c}</span>
          <span className="text-xs text-gray-400">{course.u}u</span>
        </div>
        <p className="text-sm text-gray-200">{course.n}</p>
        <p className="mt-1 text-xs text-gray-500">{course.d}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {course.g.map((g) => (
            <span
              key={g}
              className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-medium text-teal"
            >
              {DOMAIN_LABELS[g] ?? g}
            </span>
          ))}
          {course.at?.map((a) => (
            <span
              key={a}
              className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold"
            >
              {ATTR_LABELS[a] ?? a}
            </span>
          ))}
        </div>
        {course.p && (
          <p className="mt-1 text-[11px] text-gray-500">
            Prereq: {course.p}
          </p>
        )}
      </div>
    </div>
  );
}

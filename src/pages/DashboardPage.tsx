import { useProfile } from '../context/ProfileContext';
import { calculateGenEdProgress } from '../logic/genEdProgress';
import { calculateMajorProgress, calculateMinorProgress, getSuggestedMinors } from '../logic/degreeProgress';
import { GEN_ED_DOMAINS } from '../types';
import { isDomainSatisfied, getDomainUnitsCompleted } from '../logic/genEdProgress';
import { ArtistIcon, HumanistIcon, NatSciIcon, SocSciIcon, ConnectionsIcon, PlusIcon } from '../components/Icons';
import Gauge from '../components/Gauge';
import { Link } from 'react-router-dom';

const DOMAIN_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  A: ArtistIcon,
  H: HumanistIcon,
  N: NatSciIcon,
  S: SocSciIcon,
};

function estimateGraduation(totalUnits: number, currentCourseUnits: number): { label: string; percent: number } {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const remaining = Math.max(0, 120 - totalUnits - currentCourseUnits);
  if (remaining === 0) {
    return { label: 'Ready!', percent: 100 };
  }

  const unitsPerSemester = 15;
  const semestersNeeded = Math.ceil(remaining / unitsPerSemester);

  let sem = currentMonth < 5 ? 'Spring' : currentMonth < 8 ? 'Fall' : 'Spring';
  let year = currentMonth < 5 ? currentYear : currentMonth < 8 ? currentYear : currentYear + 1;

  for (let i = 1; i < semestersNeeded; i++) {
    if (sem === 'Spring') {
      sem = 'Fall';
    } else {
      sem = 'Spring';
      year++;
    }
  }

  const gradMonth = sem === 'Spring' ? 'May' : 'Dec';
  const completionPercent = Math.min(100, Math.round(((120 - remaining) / 120) * 100));

  return { label: `${gradMonth} ${year}`, percent: completionPercent };
}

export default function DashboardPage() {
  const { currentProfile, updateProfile } = useProfile();

  if (!currentProfile) return null;

  const progress = calculateGenEdProgress(currentProfile);
  const majorProgressList = currentProfile.majors.map((m) => calculateMajorProgress(currentProfile, m));
  const minorProgressList = currentProfile.selectedMinors.map((m) => calculateMinorProgress(currentProfile, m));
  const suggestedMinors = getSuggestedMinors(currentProfile);

  const totalUnits = currentProfile.completedCourses.reduce((sum, c) => sum + c.units, 0);
  const currentCourseUnits = (currentProfile.currentCourses ?? []).reduce((sum, c) => sum + c.units, 0);
  const degreePercent = Math.min(100, Math.round(((totalUnits + currentCourseUnits) / 120) * 100));
  const grad = estimateGraduation(totalUnits, currentCourseUnits);

  const handleAddMinor = (name: string) => {
    if (!currentProfile.selectedMinors.includes(name)) {
      updateProfile(currentProfile.id, {
        selectedMinors: [...currentProfile.selectedMinors, name],
      });
    }
  };

  // Build the list of all gauges for the single row
  const gauges: { key: string; percent: number; value: string; label: string; sub?: string; color?: string }[] = [
    {
      key: 'degree',
      percent: degreePercent,
      value: `${degreePercent}%`,
      label: 'Degree',
      sub: `${totalUnits}/120u`,
    },
    ...majorProgressList.map((mp) => ({
      key: `major-${mp.name}`,
      percent: mp.percent,
      value: `${mp.percent}%`,
      label: mp.name.length > 14 ? mp.name.slice(0, 12) + '..' : mp.name,
      sub: mp.known ? `${mp.completedCourses}/${mp.totalCourses}` : undefined,
    })),
    {
      key: 'gened',
      percent: progress.overallPercent,
      value: `${progress.overallPercent}%`,
      label: 'Gen Ed',
      sub: `${progress.epDomainsComplete}/4`,
    },
    ...minorProgressList.map((mp) => ({
      key: `minor-${mp.name}`,
      percent: mp.percent,
      value: `${mp.percent}%`,
      label: mp.name.length > 14 ? mp.name.slice(0, 12) + '..' : mp.name,
      sub: mp.known ? `${mp.completedUnits}/${mp.totalUnits}u` : undefined,
    })),
    {
      key: 'grad',
      percent: grad.percent,
      value: grad.label,
      label: 'Graduation',
      sub: grad.percent >= 100 ? 'Complete' : `${120 - totalUnits - currentCourseUnits}u left`,
      color: '#378DBD',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">
          Hey, {currentProfile.name}
        </h1>
        <p className="mt-1 text-sm text-gray-400">{currentProfile.majors.join(' + ')}</p>
        {currentProfile.selectedMinors.length > 0 && (
          <p className="mt-0.5 text-xs text-gray-500">
            Minor{currentProfile.selectedMinors.length > 1 ? 's' : ''}: {currentProfile.selectedMinors.join(', ')}
          </p>
        )}
      </div>

      {/* ═══ INSTRUMENT CLUSTER — single row ═══ */}
      <div className="rounded-2xl border border-ua-blue-lighter bg-gradient-to-b from-ua-blue-light to-ua-blue p-3 sm:p-5">
        <div className="flex items-end justify-center gap-1 overflow-x-auto sm:gap-3">
          {gauges.map((g) => (
            <Gauge
              key={g.key}
              percent={g.percent}
              value={g.value}
              label={g.label}
              sub={g.sub}
              size={110}
              color={g.color}
            />
          ))}
        </div>

        {/* Quick stats bar */}
        <div className="mt-3 flex items-center justify-center gap-6 border-t border-ua-blue-lighter/50 pt-3 text-xs text-gray-500">
          <span><span className="font-medium text-gray-300">{currentProfile.completedCourses.length}</span> completed</span>
          <span><span className="font-medium text-ua-sky">{(currentProfile.currentCourses ?? []).length}</span> in progress</span>
          <span><span className="font-medium text-gray-300">{totalUnits + currentCourseUnits}</span>/120 units</span>
        </div>
      </div>

      {/* Below cluster: Gen Ed breakdown + Suggested Minors side-by-side */}
      <div className="flex gap-4">
        {/* Gen Ed Breakdown — takes most of the space */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">Gen Ed Breakdown</h2>
            <Link to="/gen-ed" className="text-xs text-ua-oasis hover:underline">
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <MiniStat
              label="ENGL"
              value={`${progress.foundationsComplete}/${progress.foundationsTotal}`}
              done={progress.foundationsComplete === progress.foundationsTotal}
            />
            <MiniStat
              label="Lang"
              value={`${progress.languageComplete}/${progress.languageTotal}`}
              done={progress.languageComplete === progress.languageTotal}
            />
            <MiniStat
              label="UNIV"
              value={`${progress.univComplete}/${progress.univTotal}`}
              done={progress.univComplete === progress.univTotal}
            />
            {GEN_ED_DOMAINS.map((domain) => {
              const satisfied = isDomainSatisfied(currentProfile, domain.key);
              const units = getDomainUnitsCompleted(currentProfile, domain.key);
              const Icon = DOMAIN_ICON_MAP[domain.key];
              return (
                <Link
                  key={domain.key}
                  to="/gen-ed"
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-colors ${
                    satisfied
                      ? 'border-ua-oasis/30 bg-ua-oasis/5'
                      : 'border-ua-blue-lighter bg-ua-blue-light hover:border-ua-blue-lighter/80'
                  }`}
                >
                  {Icon && <Icon className={`h-4 w-4 ${satisfied ? 'text-ua-oasis' : 'text-gray-500'}`} />}
                  <span className="text-[10px] text-gray-400">{domain.label}</span>
                  <span className={`text-xs font-bold ${satisfied ? 'text-ua-oasis' : 'text-gray-500'}`}>
                    {satisfied ? 'Done' : `${units}/${domain.minUnits}u`}
                  </span>
                </Link>
              );
            })}
            <Link
              to="/gen-ed"
              className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-colors ${
                progress.bcUnitsComplete >= 9
                  ? 'border-ua-oasis/30 bg-ua-oasis/5'
                  : 'border-ua-blue-lighter bg-ua-blue-light hover:border-ua-blue-lighter/80'
              }`}
            >
              <ConnectionsIcon className={`h-4 w-4 ${progress.bcUnitsComplete >= 9 ? 'text-ua-oasis' : 'text-gray-500'}`} />
              <span className="text-[10px] text-gray-400">Connect</span>
              <span className={`text-xs font-bold ${progress.bcUnitsComplete >= 9 ? 'text-ua-oasis' : 'text-gray-500'}`}>
                {progress.bcUnitsComplete >= 9 ? 'Done' : `${progress.bcUnitsComplete}/${progress.bcUnitsTotal}u`}
              </span>
            </Link>
          </div>
        </div>

        {/* Suggested Minors — compact sidebar */}
        {suggestedMinors.length > 0 && (
          <div className="hidden w-44 shrink-0 sm:block">
            <h3 className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Try a Minor</h3>
            <div className="space-y-1.5">
              {suggestedMinors.map((sm) => (
                <button
                  key={sm.name}
                  onClick={() => handleAddMinor(sm.name)}
                  className="flex w-full items-center gap-2 rounded-lg border border-ua-blue-lighter bg-ua-blue-light p-2 text-left transition-colors hover:border-ua-oasis/30"
                >
                  <PlusIcon className="h-3.5 w-3.5 shrink-0 text-ua-oasis" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-200">{sm.name}</p>
                    <p className="truncate text-[10px] text-gray-500">{sm.reason}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile-only suggested minors (below gen ed) */}
      {suggestedMinors.length > 0 && (
        <div className="sm:hidden">
          <h3 className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggested Minors</h3>
          <div className="flex gap-2 overflow-x-auto">
            {suggestedMinors.map((sm) => (
              <button
                key={sm.name}
                onClick={() => handleAddMinor(sm.name)}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-ua-blue-lighter bg-ua-blue-light px-3 py-2 text-left transition-colors hover:border-ua-oasis/30"
              >
                <PlusIcon className="h-3.5 w-3.5 shrink-0 text-ua-oasis" />
                <span className="text-xs font-medium text-gray-200 whitespace-nowrap">{sm.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, done }: { label: string; value: string; done: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 ${
      done ? 'border-ua-oasis/30 bg-ua-oasis/5' : 'border-ua-blue-lighter bg-ua-blue-light'
    }`}>
      <span className={`text-xs font-bold ${done ? 'text-ua-oasis' : 'text-gray-500'}`}>{value}</span>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

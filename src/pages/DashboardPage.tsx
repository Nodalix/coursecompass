import { useProfile } from '../context/ProfileContext';
import { calculateGenEdProgress } from '../logic/genEdProgress';
import { calculateMajorProgress, calculateMinorProgress, getSuggestedMinors } from '../logic/degreeProgress';
import { GEN_ED_DOMAINS } from '../types';
import { isDomainSatisfied, getDomainUnitsCompleted } from '../logic/genEdProgress';
import { ArtistIcon, HumanistIcon, NatSciIcon, SocSciIcon, ConnectionsIcon, GradCapIcon, PlusIcon } from '../components/Icons';
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
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear();

  const remaining = Math.max(0, 120 - totalUnits - currentCourseUnits);
  if (remaining === 0) {
    return { label: 'Ready!', percent: 100 };
  }

  const unitsPerSemester = 15;
  const semestersNeeded = Math.ceil(remaining / unitsPerSemester);

  // Figure out next semester start
  // Fall = Aug-Dec, Spring = Jan-May, Summer = Jun-Jul
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

      {/* ═══ INSTRUMENT CLUSTER ═══ */}
      <div className="rounded-2xl border border-ua-blue-lighter bg-gradient-to-b from-ua-blue-light to-ua-blue p-4 sm:p-6">

        {/* Primary gauges row: Degree + Graduation */}
        <div className="flex items-end justify-center gap-2 sm:gap-6">
          <Gauge
            percent={degreePercent}
            value={`${degreePercent}%`}
            label="Degree"
            sub={`${totalUnits}/120u`}
            size={150}
          />
          <Gauge
            percent={grad.percent}
            value={grad.label}
            label="Graduation"
            sub={grad.percent >= 100 ? 'Complete' : `${120 - totalUnits - currentCourseUnits}u left`}
            size={150}
            color="#378DBD"
          />
        </div>

        {/* Secondary gauges row: Major(s) + Gen Ed + Minor(s) */}
        <div className="mt-2 flex flex-wrap items-end justify-center gap-2 sm:gap-4">
          {majorProgressList.map((mp) => (
            <Gauge
              key={mp.name}
              percent={mp.percent}
              value={`${mp.percent}%`}
              label={mp.name.length > 18 ? mp.name.slice(0, 16) + '...' : mp.name}
              sub={mp.known ? `${mp.completedCourses}/${mp.totalCourses}` : undefined}
              size={110}
            />
          ))}

          <Gauge
            percent={progress.overallPercent}
            value={`${progress.overallPercent}%`}
            label="Gen Ed"
            sub={`${progress.epDomainsComplete}/4 domains`}
            size={110}
          />

          {minorProgressList.map((mp) => (
            <Gauge
              key={mp.name}
              percent={mp.percent}
              value={`${mp.percent}%`}
              label={mp.name}
              sub={mp.known ? `${mp.completedUnits}/${mp.totalUnits}u` : undefined}
              size={110}
            />
          ))}
        </div>

        {/* Quick stats bar */}
        <div className="mt-4 flex items-center justify-center gap-6 border-t border-ua-blue-lighter/50 pt-3 text-xs text-gray-500">
          <span><span className="font-medium text-gray-300">{currentProfile.completedCourses.length}</span> completed</span>
          <span><span className="font-medium text-ua-sky">{(currentProfile.currentCourses ?? []).length}</span> in progress</span>
          <span><span className="font-medium text-gray-300">{totalUnits + currentCourseUnits}</span>/120 units</span>
        </div>
      </div>

      {/* Suggested Minors */}
      {suggestedMinors.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold text-white">Suggested Minors</h2>
          <div className="space-y-2">
            {suggestedMinors.map((sm) => (
              <div
                key={sm.name}
                className="flex items-center justify-between rounded-xl border border-ua-blue-lighter bg-ua-blue-light p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ua-oasis/10">
                    <GradCapIcon className="h-5 w-5 text-ua-oasis" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{sm.name}</p>
                    <p className="text-xs text-gray-400">{sm.reason}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddMinor(sm.name)}
                  className="flex items-center gap-1 rounded-lg bg-ua-blue-lighter px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-ua-oasis/20 hover:text-ua-oasis"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gen Ed Breakdown */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-white">Gen Ed Breakdown</h2>
          <Link to="/gen-ed" className="text-xs text-ua-oasis hover:underline">
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
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
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
                  satisfied
                    ? 'border-ua-oasis/30 bg-ua-oasis/5'
                    : 'border-ua-blue-lighter bg-ua-blue-light hover:border-ua-blue-lighter/80'
                }`}
              >
                {Icon && <Icon className={`h-5 w-5 ${satisfied ? 'text-ua-oasis' : 'text-gray-500'}`} />}
                <span className="text-[10px] text-gray-400">{domain.label}</span>
                <span className={`text-xs font-bold ${satisfied ? 'text-ua-oasis' : 'text-gray-500'}`}>
                  {satisfied ? 'Done' : `${units}/${domain.minUnits}u`}
                </span>
              </Link>
            );
          })}
          <Link
            to="/gen-ed"
            className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
              progress.bcUnitsComplete >= 9
                ? 'border-ua-oasis/30 bg-ua-oasis/5'
                : 'border-ua-blue-lighter bg-ua-blue-light hover:border-ua-blue-lighter/80'
            }`}
          >
            <ConnectionsIcon className={`h-5 w-5 ${progress.bcUnitsComplete >= 9 ? 'text-ua-oasis' : 'text-gray-500'}`} />
            <span className="text-[10px] text-gray-400">Connect</span>
            <span className={`text-xs font-bold ${progress.bcUnitsComplete >= 9 ? 'text-ua-oasis' : 'text-gray-500'}`}>
              {progress.bcUnitsComplete >= 9 ? 'Done' : `${progress.bcUnitsComplete}/${progress.bcUnitsTotal}u`}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, done }: { label: string; value: string; done: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl border p-3 ${
      done ? 'border-ua-oasis/30 bg-ua-oasis/5' : 'border-ua-blue-lighter bg-ua-blue-light'
    }`}>
      <span className={`text-xs font-bold ${done ? 'text-ua-oasis' : 'text-gray-500'}`}>{value}</span>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

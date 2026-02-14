import { useProfile } from '../context/ProfileContext';
import { calculateGenEdProgress } from '../logic/genEdProgress';
import { calculateMajorProgress, calculateMinorProgress, getSuggestedMinors } from '../logic/degreeProgress';
import { GEN_ED_DOMAINS } from '../types';
import { isDomainSatisfied, getDomainUnitsCompleted } from '../logic/genEdProgress';
import { ArtistIcon, HumanistIcon, NatSciIcon, SocSciIcon, ConnectionsIcon, GradCapIcon, PlusIcon } from '../components/Icons';
import ProgressRing from '../components/ProgressRing';
import { Link } from 'react-router-dom';

const DOMAIN_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  A: ArtistIcon,
  H: HumanistIcon,
  N: NatSciIcon,
  S: SocSciIcon,
};

export default function DashboardPage() {
  const { currentProfile, updateProfile } = useProfile();

  if (!currentProfile) return null;

  const progress = calculateGenEdProgress(currentProfile);
  const majorProgressList = currentProfile.majors.map((m) => calculateMajorProgress(currentProfile, m));
  const minorProgressList = currentProfile.selectedMinors.map((m) => calculateMinorProgress(currentProfile, m));
  const suggestedMinors = getSuggestedMinors(currentProfile);

  // Overall degree progress: weighted combo of gen ed + major + total units
  const totalUnits = currentProfile.completedCourses.reduce((sum, c) => sum + c.units, 0);
  const unitPercent = Math.min(100, Math.round((totalUnits / 120) * 100));
  const degreePercent = Math.round(
    (progress.overallPercent * 0.4 + (majorProgressList[0]?.percent ?? 0) * 0.3 + unitPercent * 0.3)
  );

  const handleAddMinor = (name: string) => {
    if (!currentProfile.selectedMinors.includes(name)) {
      updateProfile(currentProfile.id, {
        selectedMinors: [...currentProfile.selectedMinors, name],
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Welcome + Degree Progress */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-ua-blue-lighter bg-ua-blue-light p-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-white">
            Hey, {currentProfile.name}
          </h1>
          <p className="mt-1 text-sm text-gray-400">{currentProfile.majors.join(' + ')}</p>
          {currentProfile.selectedMinors.length > 0 && (
            <p className="mt-0.5 text-xs text-gray-500">
              Minor{currentProfile.selectedMinors.length > 1 ? 's' : ''}: {currentProfile.selectedMinors.join(', ')}
            </p>
          )}
          {currentProfile.interests && (
            <p className="mt-2 max-w-sm text-xs text-gray-500 italic truncate">
              "{currentProfile.interests.slice(0, 80)}{currentProfile.interests.length > 80 ? '...' : ''}"
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>{totalUnits}/120 units</span>
            <span>{currentProfile.completedCourses.length} courses logged</span>
          </div>
        </div>
        <div className="relative shrink-0">
          <ProgressRing percent={degreePercent} size={100} strokeWidth={7} label="Degree" />
        </div>
      </div>

      {/* Major Progress */}
      <div>
        <h2 className="mb-3 font-semibold text-white">Major Progress</h2>
        <div className={`grid gap-3 ${majorProgressList.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
          {majorProgressList.map((mp) => (
            <div
              key={mp.name}
              className="flex items-center gap-4 rounded-xl border border-ua-blue-lighter bg-ua-blue-light p-4"
            >
              <div className="relative shrink-0">
                <ProgressRing percent={mp.percent} size={72} strokeWidth={5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{mp.name}</p>
                {mp.known ? (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {mp.completedCourses}/{mp.totalCourses} courses completed
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-gray-500">
                    Tracking based on total courses
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Minor Progress */}
      {minorProgressList.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold text-white">Minor Progress</h2>
          <div className={`grid gap-3 ${minorProgressList.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
            {minorProgressList.map((mp) => (
              <div
                key={mp.name}
                className="flex items-center gap-4 rounded-xl border border-ua-blue-lighter bg-ua-blue-light p-4"
              >
                <div className="relative shrink-0">
                  <ProgressRing percent={mp.percent} size={72} strokeWidth={5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{mp.name}</p>
                  {mp.known ? (
                    <p className="mt-0.5 text-xs text-gray-400">
                      {mp.completedUnits}/{mp.totalUnits} units
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-gray-500">
                      Requirements not yet mapped
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                    <GradCapIcon className="h-4.5 w-4.5 text-ua-oasis" />
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

      {/* Gen Ed Quick Stats */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-white">Gen Ed Progress</h2>
          <Link to="/gen-ed" className="text-xs text-ua-oasis hover:underline">
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Foundations"
            value={`${progress.foundationsComplete}/${progress.foundationsTotal}`}
            color={progress.foundationsComplete === progress.foundationsTotal ? 'text-ua-oasis' : 'text-gold'}
          />
          <StatCard
            label="Language"
            value={`${progress.languageComplete}/${progress.languageTotal}`}
            color={progress.languageComplete === progress.languageTotal ? 'text-ua-oasis' : 'text-gold'}
          />
          <StatCard
            label="UNIV"
            value={`${progress.univComplete}/${progress.univTotal}`}
            color={progress.univComplete === progress.univTotal ? 'text-ua-oasis' : 'text-gold'}
          />
          <StatCard
            label="Gen Ed"
            value={`${progress.overallPercent}%`}
            color={progress.overallPercent >= 100 ? 'text-ua-oasis' : 'text-gold'}
          />
        </div>
      </div>

      {/* EP Domains */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-white">Exploring Perspectives</h2>
          <Link to="/gen-ed" className="text-xs text-ua-oasis hover:underline">
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GEN_ED_DOMAINS.map((domain) => {
            const satisfied = isDomainSatisfied(currentProfile, domain.key);
            const units = getDomainUnitsCompleted(currentProfile, domain.key);
            const Icon = DOMAIN_ICON_MAP[domain.key];
            return (
              <Link
                key={domain.key}
                to="/gen-ed"
                className={`rounded-xl border p-4 text-center transition-colors ${
                  satisfied
                    ? 'border-ua-oasis/30 bg-ua-oasis/5'
                    : 'border-ua-blue-lighter bg-ua-blue-light hover:border-ua-blue-lighter/80'
                }`}
              >
                <div className="flex justify-center">
                  {Icon && <Icon className={`h-6 w-6 ${satisfied ? 'text-ua-oasis' : 'text-gray-400'}`} />}
                </div>
                <p className="mt-2 text-xs font-medium text-gray-300">{domain.label}</p>
                <p className={`mt-1 text-sm font-bold ${satisfied ? 'text-ua-oasis' : 'text-gray-500'}`}>
                  {satisfied ? 'Done' : `${units}/${domain.minUnits}u`}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Building Connections */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-white">Building Connections</h2>
          <Link to="/gen-ed" className="text-xs text-ua-oasis hover:underline">
            View All &rarr;
          </Link>
        </div>
        <div className="rounded-xl border border-ua-blue-lighter bg-ua-blue-light p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ua-blue">
                <ConnectionsIcon className="h-5 w-5 text-ua-oasis" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">Interdisciplinary Courses</p>
                <p className="text-xs text-gray-500">3 courses required (9 units)</p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                progress.bcUnitsComplete >= 9
                  ? 'bg-ua-oasis/15 text-ua-oasis'
                  : 'bg-ua-blue px-3 py-1 text-gray-400'
              }`}
            >
              {progress.bcUnitsComplete}/{progress.bcUnitsTotal}u
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-ua-blue-lighter bg-ua-blue-light p-4 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

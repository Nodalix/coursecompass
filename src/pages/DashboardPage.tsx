import { useProfile } from '../context/ProfileContext';
import { calculateGenEdProgress } from '../logic/genEdProgress';
import { GEN_ED_DOMAINS } from '../types';
import { isDomainSatisfied, getDomainUnitsCompleted } from '../logic/genEdProgress';
import { ArtistIcon, HumanistIcon, NatSciIcon, SocSciIcon, ConnectionsIcon } from '../components/Icons';
import ProgressRing from '../components/ProgressRing';
import { Link } from 'react-router-dom';

const DOMAIN_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  A: ArtistIcon,
  H: HumanistIcon,
  N: NatSciIcon,
  S: SocSciIcon,
};

export default function DashboardPage() {
  const { currentProfile } = useProfile();

  if (!currentProfile) return null;

  const progress = calculateGenEdProgress(currentProfile);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
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
        {currentProfile.interests && (
          <p className="mx-auto mt-2 max-w-md text-xs text-gray-500 italic">
            "{currentProfile.interests.slice(0, 100)}{currentProfile.interests.length > 100 ? '...' : ''}"
          </p>
        )}
      </div>

      {/* Main Progress Ring */}
      <div className="flex justify-center">
        <div className="relative">
          <ProgressRing percent={progress.overallPercent} size={160} strokeWidth={10} label="Gen Ed Progress" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Courses Logged"
          value={currentProfile.completedCourses.length.toString()}
          color="text-ua-oasis"
        />
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

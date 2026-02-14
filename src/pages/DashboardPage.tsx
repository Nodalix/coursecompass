import { useProfile } from '../context/ProfileContext';
import { calculateGenEdProgress } from '../logic/genEdProgress';
import { GEN_ED_DOMAINS } from '../types';
import { isDomainSatisfied, getDomainUnitsCompleted } from '../logic/genEdProgress';
import ProgressRing from '../components/ProgressRing';
import { Link } from 'react-router-dom';

const DOMAIN_ICONS: Record<string, string> = {
  A: '🎨',
  H: '📚',
  N: '🔬',
  S: '🌍',
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
          Hey, {currentProfile.name} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-400">{currentProfile.major}</p>
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
          color="text-teal"
        />
        <StatCard
          label="Foundations"
          value={`${progress.foundationsComplete}/${progress.foundationsTotal}`}
          color={progress.foundationsComplete === progress.foundationsTotal ? 'text-teal' : 'text-gold'}
        />
        <StatCard
          label="Language"
          value={`${progress.languageComplete}/${progress.languageTotal}`}
          color={progress.languageComplete === progress.languageTotal ? 'text-teal' : 'text-gold'}
        />
        <StatCard
          label="UNIV"
          value={`${progress.univComplete}/${progress.univTotal}`}
          color={progress.univComplete === progress.univTotal ? 'text-teal' : 'text-gold'}
        />
      </div>

      {/* EP Domains */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-white">Exploring Perspectives</h2>
          <Link to="/gen-ed" className="text-xs text-teal hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GEN_ED_DOMAINS.map((domain) => {
            const satisfied = isDomainSatisfied(currentProfile, domain.key);
            const units = getDomainUnitsCompleted(currentProfile, domain.key);
            return (
              <Link
                key={domain.key}
                to="/gen-ed"
                className={`rounded-xl border p-4 text-center transition-colors ${
                  satisfied
                    ? 'border-teal/30 bg-teal/5'
                    : 'border-navy-lighter bg-navy-light hover:border-navy-lighter/80'
                }`}
              >
                <div className="text-2xl">{DOMAIN_ICONS[domain.key]}</div>
                <p className="mt-2 text-xs font-medium text-gray-300">{domain.label}</p>
                <p className={`mt-1 text-sm font-bold ${satisfied ? 'text-teal' : 'text-gray-500'}`}>
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
          <Link to="/gen-ed" className="text-xs text-teal hover:underline">
            View All →
          </Link>
        </div>
        <div className="rounded-xl border border-navy-lighter bg-navy-light p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <p className="text-sm font-medium text-gray-200">Interdisciplinary Courses</p>
                <p className="text-xs text-gray-500">3 courses required (9 units)</p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                progress.bcUnitsComplete >= 9
                  ? 'bg-teal/15 text-teal'
                  : 'bg-navy px-3 py-1 text-gray-400'
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
    <div className="rounded-xl border border-navy-lighter bg-navy-light p-4 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

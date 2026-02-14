import { useProfile } from '../context/ProfileContext';
import { calculateGenEdProgress } from '../logic/genEdProgress';
import { GEN_ED_DOMAINS, BC_DOMAIN } from '../types';
import ProgressRing from '../components/ProgressRing';
import GenEdChecklist from '../components/GenEdChecklist';
import GenEdDomainCard from '../components/GenEdDomainCard';

export default function GenEdPage() {
  const { currentProfile } = useProfile();

  if (!currentProfile) return null;

  const progress = calculateGenEdProgress(currentProfile);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header with Progress Ring */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <ProgressRing percent={progress.overallPercent} size={100} label="Gen Ed" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">General Education</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track your progress toward UA's universal gen ed requirements
          </p>
          <div className="mt-2 flex gap-3 text-xs">
            <span className="text-teal">
              {progress.epDomainsComplete}/4 EP Domains
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-teal">
              {progress.bcUnitsComplete}/{progress.bcUnitsTotal}u Building Connections
            </span>
          </div>
        </div>
      </div>

      {/* Checklist Items (Foundations, Language, UNIV) */}
      <GenEdChecklist />

      {/* Exploring Perspectives */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Exploring Perspectives</h2>
        <p className="mb-4 text-xs text-gray-400">
          Complete at least 1 course from each domain (12 units minimum total)
        </p>
        <div className="space-y-3">
          {GEN_ED_DOMAINS.map((domain) => (
            <GenEdDomainCard key={domain.key} domain={domain} />
          ))}
        </div>
      </div>

      {/* Building Connections */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Building Connections</h2>
        <p className="mb-4 text-xs text-gray-400">
          Complete 3 interdisciplinary courses (9 units minimum)
        </p>
        <GenEdDomainCard domain={BC_DOMAIN} />
      </div>
    </div>
  );
}

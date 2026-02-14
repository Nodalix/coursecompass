import { useProfile } from '../context/ProfileContext';
import type { GenEdChecks } from '../types';

interface CheckItemProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckItem({ label, sublabel, checked, onChange }: CheckItemProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-ua-blue-lighter bg-ua-blue-light/50 p-3 transition-colors hover:border-ua-blue-lighter/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-500 accent-ua-oasis"
      />
      <div>
        <span className={`text-sm ${checked ? 'text-ua-oasis line-through' : 'text-gray-200'}`}>
          {label}
        </span>
        {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
      </div>
    </label>
  );
}

export default function GenEdChecklist() {
  const { currentProfile, updateGenEdChecks } = useProfile();

  if (!currentProfile) return null;

  const checks = currentProfile.genEdChecks;
  const update = (key: keyof GenEdChecks, value: boolean) => {
    updateGenEdChecks({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Foundations */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Foundations
        </h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <CheckItem
            label="ENGL 101"
            sublabel="First-Year Composition I"
            checked={checks.engl101}
            onChange={(v) => update('engl101', v)}
          />
          <CheckItem
            label="ENGL 102"
            sublabel="First-Year Composition II"
            checked={checks.engl102}
            onChange={(v) => update('engl102', v)}
          />
          <CheckItem
            label="Math Requirement"
            sublabel="Varies by major"
            checked={checks.math}
            onChange={(v) => update('math', v)}
          />
        </div>
      </div>

      {/* Second Language */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Second Language
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <CheckItem
            label="Semester 1"
            sublabel="Or equivalent placement"
            checked={checks.lang1}
            onChange={(v) => update('lang1', v)}
          />
          <CheckItem
            label="Semester 2"
            sublabel="Or equivalent placement"
            checked={checks.lang2}
            onChange={(v) => update('lang2', v)}
          />
        </div>
      </div>

      {/* UNIV */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Gen Ed Entry / Exit
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <CheckItem
            label="UNIV 101"
            sublabel="Intro to General Education"
            checked={checks.univ101}
            onChange={(v) => update('univ101', v)}
          />
          <CheckItem
            label="UNIV 301"
            sublabel="GE Capstone Portfolio"
            checked={checks.univ301}
            onChange={(v) => update('univ301', v)}
          />
        </div>
      </div>
    </div>
  );
}

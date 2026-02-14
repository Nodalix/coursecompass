import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

const COMMON_MAJORS = [
  'BS Information Science',
  'BS Computer Science',
  'BA Psychology',
  'BS Biology',
  'BA Communication',
  'BS Nursing',
  'BA Political Science',
  'BS Mechanical Engineering',
  'BA English',
  'BS Biochemistry',
  'BA Sociology',
  'BS Electrical Engineering',
  'BA Economics',
  'BS Public Health',
  'BA Media Arts',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { createProfile } = useProfile();

  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [interests, setInterests] = useState('');
  const [transcript, setTranscript] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredMajors = major
    ? COMMON_MAJORS.filter((m) => m.toLowerCase().includes(major.toLowerCase()))
    : COMMON_MAJORS;

  const canSubmit = name.trim().length > 0 && major.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const parsedCourses = parseTranscript(transcript);

    createProfile({
      name: name.trim(),
      major: major.trim(),
      interests: interests.trim(),
      catalogYear: '2024-2025',
      completedCourses: parsedCourses,
      selectedMinors: [],
      planSemester: 'Summer 2026',
    });
    void navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-ua-blue p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-ua-red text-white font-bold text-xl">
            CC
          </div>
          <h1 className="text-3xl font-bold text-white">
            Course<span className="text-ua-oasis">Compass</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">Set up your profile to start planning smarter</p>
        </div>

        {/* Single Form */}
        <div className="space-y-6 rounded-2xl border border-ua-blue-lighter bg-ua-blue-light p-6 sm:p-8">

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-ua-cool-gray">
              Your Name <span className="text-ua-red">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              className="w-full rounded-lg border border-ua-blue-lighter bg-ua-blue px-4 py-3 text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
              autoFocus
            />
          </div>

          {/* Major */}
          <div>
            <label className="mb-2 block text-sm font-medium text-ua-cool-gray">
              Major <span className="text-ua-red">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={major}
                onChange={(e) => {
                  setMajor(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="e.g. BS Information Science"
                className="w-full rounded-lg border border-ua-blue-lighter bg-ua-blue px-4 py-3 text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
              />
              {showSuggestions && filteredMajors.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-ua-blue-lighter bg-ua-blue-light shadow-xl">
                  {filteredMajors.map((m) => (
                    <button
                      key={m}
                      onMouseDown={() => {
                        setMajor(m);
                        setShowSuggestions(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-ua-blue-lighter hover:text-white"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="mb-2 block text-sm font-medium text-ua-cool-gray">
              Interests & Career Goals
            </label>
            <p className="mb-2 text-xs text-gray-500">
              This helps us recommend courses that build toward YOUR career story, not just check boxes.
            </p>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. I want to work in AI and music technology. I'm interested in how data science can be applied to creative industries."
              className="h-24 w-full resize-none rounded-lg border border-ua-blue-lighter bg-ua-blue px-4 py-3 text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
            />
          </div>

          {/* Transcript Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-ua-cool-gray">
              Import Completed Courses
            </label>
            <p className="mb-2 text-xs text-gray-500">
              Paste your transcript or course list from UAccess / DegreeWorks. We'll extract the course codes automatically. You can also skip this and add courses later.
            </p>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={"Paste your transcript here, e.g.:\n\nENGL 101  First-Year Composition  3.00  A\nMATH 112  College Algebra  3.00  B+\nISTA 130  Computational Thinking  4.00  B+\nSPAN 101  Elementary Spanish I  4.00  A-"}
              className="h-36 w-full resize-none rounded-lg border border-ua-blue-lighter bg-ua-blue px-4 py-3 font-mono text-sm text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
            />
            {transcript.trim() && (
              <div className="mt-2 rounded-lg bg-ua-blue/80 p-3">
                <p className="text-xs font-medium text-ua-oasis">
                  Found {parseTranscript(transcript).length} course(s)
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {parseTranscript(transcript).map((c) => (
                    <span key={c.code} className="rounded bg-ua-oasis/15 px-2 py-0.5 font-mono text-xs text-ua-oasis">
                      {c.code}{c.grade ? ` (${c.grade})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full rounded-lg bg-ua-red px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-ua-red-dim disabled:cursor-not-allowed disabled:opacity-40"
          >
            Get Started
          </button>

          <p className="text-center text-xs text-gray-500">
            You can update everything later from your profile.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Parse pasted transcript text into completed courses */
function parseTranscript(text: string): { code: string; name: string; units: number; grade?: string }[] {
  if (!text.trim()) return [];

  const courses: { code: string; name: string; units: number; grade?: string }[] = [];
  const seen = new Set<string>();

  const codePattern = /\b([A-Z]{2,5})\s+(\d{3}[A-Z]?\d?)\b/g;
  const gradePattern = /\b([ABCDF][+-]?)\b/;
  const unitsPattern = /(\d+\.?\d*)\s*(units?|credits?|cr|\.00)/i;

  const lines = text.split('\n');
  for (const line of lines) {
    const matches = [...line.matchAll(codePattern)];
    for (const match of matches) {
      const code = `${match[1]} ${match[2]}`;
      if (seen.has(code)) continue;
      seen.add(code);

      const afterCode = line.slice((match.index ?? 0) + match[0].length);
      const gradeMatch = afterCode.match(gradePattern);
      const unitsMatch = afterCode.match(unitsPattern);

      courses.push({
        code,
        name: '',
        units: unitsMatch ? parseFloat(unitsMatch[1]) : 3,
        grade: gradeMatch ? gradeMatch[1] : undefined,
      });
    }
  }

  return courses;
}

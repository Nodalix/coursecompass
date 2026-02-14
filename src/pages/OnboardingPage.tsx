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
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredMajors = major
    ? COMMON_MAJORS.filter((m) => m.toLowerCase().includes(major.toLowerCase()))
    : COMMON_MAJORS;

  const canSubmit = name.trim().length > 0 && major.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    createProfile({
      name: name.trim(),
      major: major.trim(),
      interests: interests.trim(),
      catalogYear: '2024-2025',
      completedCourses: [],
      selectedMinors: [],
      planSemester: 'Summer 2026',
    });
    void navigate('/courses');
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
          <p className="mt-2 text-sm text-gray-400">Set up your profile, then add your courses</p>
        </div>

        {/* Form */}
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full rounded-lg bg-ua-red px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-ua-red-dim disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next: Add Your Courses
          </button>
        </div>
      </div>
    </div>
  );
}

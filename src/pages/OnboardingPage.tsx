import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { PlusIcon, XIcon } from '../components/Icons';

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

const COMMON_MINORS = [
  'Business Administration',
  'Computer Science',
  'Data Science',
  'Music',
  'Psychology',
  'Spanish',
  'Mathematics',
  'Sociology',
  'English',
  'Communication',
  'Economics',
  'Art History',
  'Philosophy',
  'Statistics',
  'Public Health',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { createProfile } = useProfile();

  const [name, setName] = useState('');
  const [majors, setMajors] = useState<string[]>(['']);
  const [minors, setMinors] = useState<string[]>([]);
  const [minorInput, setMinorInput] = useState('');
  const [interests, setInterests] = useState('');
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const [showMinorSuggestions, setShowMinorSuggestions] = useState(false);

  const canSubmit = name.trim().length > 0 && majors[0].trim().length > 0;

  const filteredMajors = (query: string) =>
    query
      ? COMMON_MAJORS.filter((m) => m.toLowerCase().includes(query.toLowerCase()))
      : COMMON_MAJORS;

  const filteredMinors = minorInput
    ? COMMON_MINORS.filter(
        (m) => m.toLowerCase().includes(minorInput.toLowerCase()) && !minors.includes(m)
      )
    : COMMON_MINORS.filter((m) => !minors.includes(m));

  const handleSubmit = () => {
    if (!canSubmit) return;

    createProfile({
      name: name.trim(),
      majors: majors.filter((m) => m.trim().length > 0).map((m) => m.trim()),
      interests: interests.trim(),
      catalogYear: '2024-2025',
      completedCourses: [],
      selectedMinors: minors,
      planSemester: 'Summer 2026',
    });
    void navigate('/courses');
  };

  const updateMajor = (index: number, value: string) => {
    const updated = [...majors];
    updated[index] = value;
    setMajors(updated);
  };

  const addMajor = () => {
    if (majors.length < 3) {
      setMajors([...majors, '']);
    }
  };

  const removeMajor = (index: number) => {
    if (majors.length > 1) {
      setMajors(majors.filter((_, i) => i !== index));
    }
  };

  const addMinor = (minor: string) => {
    if (minor.trim() && !minors.includes(minor.trim())) {
      setMinors([...minors, minor.trim()]);
    }
    setMinorInput('');
    setShowMinorSuggestions(false);
  };

  const removeMinor = (minor: string) => {
    setMinors(minors.filter((m) => m !== minor));
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

          {/* Majors */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-ua-cool-gray">
                Major(s) <span className="text-ua-red">*</span>
              </label>
              {majors.length < 3 && (
                <button
                  onClick={addMajor}
                  className="flex items-center gap-1 text-xs text-ua-oasis hover:text-ua-sky"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add Major
                </button>
              )}
            </div>
            <div className="space-y-3">
              {majors.map((major, index) => (
                <div key={index} className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => {
                        updateMajor(index, e.target.value);
                        setShowSuggestions(index);
                      }}
                      onFocus={() => setShowSuggestions(index)}
                      onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                      placeholder={index === 0 ? 'e.g. BS Information Science' : 'Second major'}
                      className="w-full rounded-lg border border-ua-blue-lighter bg-ua-blue px-4 py-3 text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
                    />
                    {majors.length > 1 && (
                      <button
                        onClick={() => removeMajor(index)}
                        className="rounded-lg px-2 text-gray-500 transition-colors hover:text-ua-red"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {showSuggestions === index && filteredMajors(major).length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-ua-blue-lighter bg-ua-blue-light shadow-xl">
                      {filteredMajors(major).map((m) => (
                        <button
                          key={m}
                          onMouseDown={() => {
                            updateMajor(index, m);
                            setShowSuggestions(null);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-ua-blue-lighter hover:text-white"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Minors */}
          <div>
            <label className="mb-2 block text-sm font-medium text-ua-cool-gray">
              Minor(s)
            </label>
            {minors.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {minors.map((minor) => (
                  <span
                    key={minor}
                    className="flex items-center gap-1.5 rounded-full bg-ua-oasis/15 px-3 py-1 text-xs font-medium text-ua-oasis"
                  >
                    {minor}
                    <button onClick={() => removeMinor(minor)} className="hover:text-white">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                value={minorInput}
                onChange={(e) => {
                  setMinorInput(e.target.value);
                  setShowMinorSuggestions(true);
                }}
                onFocus={() => setShowMinorSuggestions(true)}
                onBlur={() => setTimeout(() => setShowMinorSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && minorInput.trim()) {
                    e.preventDefault();
                    addMinor(minorInput);
                  }
                }}
                placeholder="Type a minor or select from suggestions"
                className="w-full rounded-lg border border-ua-blue-lighter bg-ua-blue px-4 py-3 text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
              />
              {showMinorSuggestions && filteredMinors.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-ua-blue-lighter bg-ua-blue-light shadow-xl">
                  {filteredMinors.map((m) => (
                    <button
                      key={m}
                      onMouseDown={() => addMinor(m)}
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

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

const STEPS = ['Name', 'Major', 'Interests', 'Review'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { createProfile } = useProfile();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [interests, setInterests] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredMajors = major
    ? COMMON_MAJORS.filter((m) => m.toLowerCase().includes(major.toLowerCase()))
    : COMMON_MAJORS;

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return major.trim().length > 0;
    if (step === 2) return true; // interests optional
    return true;
  };

  const handleFinish = () => {
    createProfile({
      name: name.trim(),
      major: major.trim(),
      interests: interests.trim(),
      catalogYear: '2024-2025',
      completedCourses: [],
      selectedMinors: [],
      planSemester: 'Summer 2026',
    });
    void navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal text-navy font-bold text-lg">
            CC
          </div>
          <h1 className="text-2xl font-bold text-white">
            Course<span className="text-teal">Compass</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">Let's set up your profile</p>
        </div>

        {/* Progress Dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i === step
                    ? 'bg-teal text-navy'
                    : i < step
                      ? 'bg-teal/20 text-teal'
                      : 'bg-navy-lighter text-gray-500'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 ${i < step ? 'bg-teal/30' : 'bg-navy-lighter'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-navy-lighter bg-navy-light p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">What should we call you?</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                className="w-full rounded-lg border border-navy-lighter bg-navy px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal focus:outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && canProceed() && setStep(1)}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">What's your major?</h2>
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
                  className="w-full rounded-lg border border-navy-lighter bg-navy px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal focus:outline-none"
                  autoFocus
                />
                {showSuggestions && filteredMajors.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-navy-lighter bg-navy-light shadow-xl">
                    {filteredMajors.map((m) => (
                      <button
                        key={m}
                        onMouseDown={() => {
                          setMajor(m);
                          setShowSuggestions(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-navy-lighter hover:text-white"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Tell us about your interests</h2>
              <p className="text-sm text-gray-400">
                What are your career interests, what excites you, or what do you want to be known for
                when you graduate? This helps us recommend courses that build toward YOUR story.
              </p>
              <textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. I want to work in AI and music technology. I'm interested in how data science can be applied to creative industries."
                className="h-32 w-full resize-none rounded-lg border border-navy-lighter bg-navy px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Ready to go, {name}!</h2>
              <div className="space-y-3 rounded-lg bg-navy p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Name</span>
                  <span className="text-sm text-white">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Major</span>
                  <span className="text-sm text-white">{major}</span>
                </div>
                {interests && (
                  <div>
                    <span className="text-sm text-gray-400">Interests</span>
                    <p className="mt-1 text-sm text-gray-300">{interests}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                You can always update this later. We'll start tracking your gen ed progress right away.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="rounded-lg bg-teal px-6 py-2 text-sm font-medium text-navy transition-colors hover:bg-teal-dim disabled:cursor-not-allowed disabled:opacity-40"
              >
                {step === 2 ? (interests.trim() ? 'Next' : 'Skip') : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="rounded-lg bg-teal px-6 py-2 text-sm font-medium text-navy transition-colors hover:bg-teal-dim"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

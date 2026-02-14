import { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { UploadIcon, PlusIcon, XIcon } from '../components/Icons';
import allUndergrad from '../data/allUndergrad.json';

interface UndergradCourse {
  c: string;
  n: string;
  u: number;
  d: string;
}

const catalog = allUndergrad as UndergradCourse[];

type InputTab = 'paste' | 'search';

export default function CoursesPage() {
  const { currentProfile, addCompletedCourse, removeCompletedCourse, updateProfile } = useProfile();
  const [tab, setTab] = useState<InputTab>('paste');
  const [transcript, setTranscript] = useState('');
  const [search, setSearch] = useState('');
  const [showCurrentInput, setShowCurrentInput] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');

  if (!currentProfile) return null;

  const completed = currentProfile.completedCourses;
  const currentCourses = currentProfile.currentCourses ?? [];

  // Search catalog
  const searchResults = search.length >= 2
    ? catalog.filter((c) =>
        c.c.toLowerCase().includes(search.toLowerCase()) ||
        c.n.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 12)
    : [];

  const currentSearchResults = currentSearch.length >= 2
    ? catalog.filter((c) =>
        c.c.toLowerCase().includes(currentSearch.toLowerCase()) ||
        c.n.toLowerCase().includes(currentSearch.toLowerCase())
      ).slice(0, 12)
    : [];

  // Parse transcript
  const parsedCourses = parseTranscript(transcript);

  const handleImportAll = () => {
    for (const c of parsedCourses) {
      if (!completed.some((ex) => ex.code === c.code)) {
        addCompletedCourse(c);
      }
    }
    setTranscript('');
  };

  const handleAddCurrent = (course: UndergradCourse) => {
    const already = currentCourses.some((c) => c.code === course.c);
    if (already) return;
    updateProfile(currentProfile.id, {
      currentCourses: [...currentCourses, { code: course.c, name: course.n, units: course.u }],
    });
    setCurrentSearch('');
  };

  const handleRemoveCurrent = (code: string) => {
    updateProfile(currentProfile.id, {
      currentCourses: currentCourses.filter((c) => c.code !== code),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Courses</h1>
        <p className="mt-1 text-sm text-gray-400">
          Add your completed and current courses so we can track your progress
        </p>
      </div>

      {/* Add Courses Section */}
      <div className="rounded-2xl border border-ua-blue-lighter bg-ua-blue-light overflow-hidden">
        <div className="border-b border-ua-blue-lighter p-4">
          <h2 className="font-semibold text-white">Add Completed Courses</h2>
          <p className="mt-1 text-xs text-gray-400">Choose the easiest way for you</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-ua-blue-lighter">
          <button
            onClick={() => setTab('paste')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === 'paste' ? 'border-b-2 border-ua-oasis text-ua-oasis' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <UploadIcon className="h-4 w-4" />
            Paste Transcript
          </button>
          <button
            onClick={() => setTab('search')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === 'search' ? 'border-b-2 border-ua-oasis text-ua-oasis' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <PlusIcon className="h-4 w-4" />
            Search & Add
          </button>
        </div>

        <div className="p-4">
          {tab === 'paste' && (
            <div className="space-y-3">
              <div className="rounded-lg bg-ua-blue/50 p-3">
                <p className="text-xs font-medium text-ua-oasis">How to get your transcript:</p>
                <ol className="mt-1.5 space-y-1 text-xs text-gray-400">
                  <li>1. Go to <span className="text-gray-200">UAccess</span> &rarr; Student Center &rarr; Academic History</li>
                  <li>2. Select all the text on the page (<span className="text-gray-200">Ctrl+A</span> or <span className="text-gray-200">Cmd+A</span>)</li>
                  <li>3. Copy (<span className="text-gray-200">Ctrl+C</span> or <span className="text-gray-200">Cmd+C</span>) and paste it below</li>
                </ol>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={"Paste your transcript or type courses like:\n\nENGL 101  First-Year Composition  3.00  A\nMATH 112  College Algebra  3.00  B+\nISTA 130  Computational Thinking  4.00  B+"}
                className="h-40 w-full resize-none rounded-lg border border-ua-blue-lighter bg-ua-blue px-4 py-3 font-mono text-sm text-white placeholder:text-gray-600 focus:border-ua-oasis focus:outline-none"
              />
              {parsedCourses.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ua-oasis">
                      Found {parsedCourses.length} course{parsedCourses.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={handleImportAll}
                      className="rounded-lg bg-ua-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ua-red-dim"
                    >
                      Import All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedCourses.map((c) => (
                      <span key={c.code} className="rounded-lg bg-ua-oasis/10 px-2.5 py-1 font-mono text-xs text-ua-oasis">
                        {c.code}{c.grade ? ` (${c.grade})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'search' && (
            <div className="space-y-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by course code or name (e.g. ENGL 101, Psychology)"
                className="w-full rounded-lg border border-ua-blue-lighter bg-ua-blue px-4 py-3 text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
                autoFocus
              />
              {searchResults.length > 0 && (
                <div className="space-y-1">
                  {searchResults.map((course) => {
                    const alreadyAdded = completed.some((c) => c.code === course.c);
                    return (
                      <div
                        key={course.c}
                        className="flex items-center justify-between rounded-lg border border-ua-blue-lighter bg-ua-blue/50 p-3"
                      >
                        <div>
                          <span className="font-mono text-sm font-medium text-ua-oasis">{course.c}</span>
                          <span className="ml-2 text-sm text-gray-300">{course.n}</span>
                          <span className="ml-2 text-xs text-gray-500">{course.u}u</span>
                        </div>
                        <button
                          onClick={() => {
                            if (!alreadyAdded) {
                              addCompletedCourse({ code: course.c, name: course.n, units: course.u });
                            }
                          }}
                          disabled={alreadyAdded}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            alreadyAdded
                              ? 'bg-ua-oasis/10 text-ua-oasis'
                              : 'bg-ua-red text-white hover:bg-ua-red-dim'
                          }`}
                        >
                          {alreadyAdded ? 'Added' : 'Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {search.length >= 2 && searchResults.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">No courses found for "{search}"</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Currently Taking */}
      <div className="rounded-2xl border border-ua-blue-lighter bg-ua-blue-light overflow-hidden">
        <div className="flex items-center justify-between border-b border-ua-blue-lighter p-4">
          <div>
            <h2 className="font-semibold text-white">Currently Taking</h2>
            <p className="text-xs text-gray-400">{currentCourses.length} course{currentCourses.length !== 1 ? 's' : ''} this semester</p>
          </div>
          <button
            onClick={() => setShowCurrentInput(!showCurrentInput)}
            className="flex items-center gap-1.5 rounded-lg bg-ua-blue-lighter px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:text-white"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
        {showCurrentInput && (
          <div className="border-b border-ua-blue-lighter p-4">
            <input
              type="text"
              value={currentSearch}
              onChange={(e) => setCurrentSearch(e.target.value)}
              placeholder="Search for a course..."
              className="w-full rounded-lg border border-ua-blue-lighter bg-ua-blue px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
              autoFocus
            />
            {currentSearchResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {currentSearchResults.map((course) => (
                  <button
                    key={course.c}
                    onClick={() => handleAddCurrent(course)}
                    className="flex w-full items-center justify-between rounded-lg bg-ua-blue/50 p-2.5 text-left hover:bg-ua-blue"
                  >
                    <div>
                      <span className="font-mono text-xs font-medium text-ua-oasis">{course.c}</span>
                      <span className="ml-2 text-xs text-gray-300">{course.n}</span>
                    </div>
                    <PlusIcon className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="p-4">
          {currentCourses.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No current courses added yet</p>
          ) : (
            <div className="space-y-2">
              {currentCourses.map((c) => (
                <div key={c.code} className="flex items-center justify-between rounded-lg bg-ua-blue/50 p-3">
                  <div>
                    <span className="font-mono text-sm font-medium text-ua-sky">{c.code}</span>
                    <span className="ml-2 text-sm text-gray-300">{c.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{c.units}u</span>
                  </div>
                  <button onClick={() => handleRemoveCurrent(c.code)} className="text-gray-500 hover:text-ua-red">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completed Courses List */}
      <div className="rounded-2xl border border-ua-blue-lighter bg-ua-blue-light overflow-hidden">
        <div className="border-b border-ua-blue-lighter p-4">
          <h2 className="font-semibold text-white">Completed Courses</h2>
          <p className="text-xs text-gray-400">{completed.length} course{completed.length !== 1 ? 's' : ''} logged</p>
        </div>
        <div className="p-4">
          {completed.length === 0 ? (
            <div className="py-8 text-center">
              <UploadIcon className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-3 text-sm text-gray-400">No courses yet</p>
              <p className="mt-1 text-xs text-gray-500">Paste your transcript above or search to add courses one by one</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {completed.map((c) => (
                <div key={c.code} className="flex items-center justify-between rounded-lg bg-ua-blue/50 p-3">
                  <div>
                    <span className="font-mono text-sm font-medium text-ua-oasis">{c.code}</span>
                    {c.name && <span className="ml-2 text-sm text-gray-300">{c.name}</span>}
                    <span className="ml-2 text-xs text-gray-500">{c.units}u</span>
                    {c.grade && <span className="ml-2 rounded bg-ua-oasis/10 px-1.5 py-0.5 text-xs text-ua-oasis">{c.grade}</span>}
                  </div>
                  <button onClick={() => removeCompletedCourse(c.code)} className="text-gray-500 hover:text-ua-red">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

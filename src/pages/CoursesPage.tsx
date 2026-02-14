import { useState, useRef } from 'react';
import { useProfile } from '../context/ProfileContext';
import { UploadIcon, PlusIcon, XIcon, CameraIcon } from '../components/Icons';
import allUndergrad from '../data/allUndergrad.json';

interface UndergradCourse {
  c: string;
  n: string;
  u: number;
  d: string;
}

const catalog = allUndergrad as UndergradCourse[];

type InputTab = 'paste' | 'search' | 'screenshot';

export default function CoursesPage() {
  const { currentProfile, addCompletedCourse, removeCompletedCourse, updateProfile } = useProfile();
  const [tab, setTab] = useState<InputTab>('paste');
  const [transcript, setTranscript] = useState('');
  const [search, setSearch] = useState('');
  const [showCurrentInput, setShowCurrentInput] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');

  // Screenshot state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<{ code: string; name: string; units: number; grade?: string }[]>([]);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportScreenshot = () => {
    for (const c of parseResult) {
      if (!completed.some((ex) => ex.code === c.code)) {
        addCompletedCourse(c);
      }
    }
    setParseResult([]);
    setImagePreview(null);
    setImageFile(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setParseResult([]);
    setParseError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleParseScreenshot = async () => {
    if (!imageFile) return;

    const apiKey = localStorage.getItem('cc-api-key');
    if (!apiKey) {
      setParseError('API key required. Go to the Advisor tab and add your Anthropic API key first.');
      return;
    }

    setParsing(true);
    setParseError('');

    try {
      const base64 = await fileToBase64(imageFile);
      const mediaType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: { type: 'base64', media_type: mediaType, data: base64 },
                },
                {
                  type: 'text',
                  text: `Extract all university courses from this transcript/schedule image. Return ONLY a JSON array with objects like: [{"code":"ENGL 101","name":"First-Year Composition","units":3,"grade":"A"}]. Use the exact course code format "DEPT NUM" (e.g. "ENGL 101", "MATH 112"). If no grade is visible, omit the grade field. If units aren't visible, default to 3. Return ONLY the JSON array, no other text.`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text ?? '';

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Could not find course data in the response. Try a clearer image.');
      }

      const courses = JSON.parse(jsonMatch[0]) as { code: string; name: string; units: number; grade?: string }[];
      setParseResult(courses);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to parse image';
      setParseError(msg);
    } finally {
      setParsing(false);
    }
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
            Paste
          </button>
          <button
            onClick={() => setTab('screenshot')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === 'screenshot' ? 'border-b-2 border-ua-oasis text-ua-oasis' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CameraIcon className="h-4 w-4" />
            Screenshot
          </button>
          <button
            onClick={() => setTab('search')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === 'search' ? 'border-b-2 border-ua-oasis text-ua-oasis' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <PlusIcon className="h-4 w-4" />
            Search
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

          {tab === 'screenshot' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-ua-blue/50 p-3">
                <p className="text-xs font-medium text-ua-oasis">Upload a screenshot of your transcript or schedule</p>
                <p className="mt-1 text-xs text-gray-400">
                  Take a screenshot from UAccess, DegreeWorks, or any class schedule and we'll extract your courses using AI.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {!imagePreview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-ua-blue-lighter py-10 text-gray-400 transition-colors hover:border-ua-oasis/40 hover:text-gray-300"
                >
                  <CameraIcon className="h-10 w-10" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload a screenshot</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, or WEBP</p>
                  </div>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Transcript screenshot"
                      className="max-h-64 w-full rounded-lg border border-ua-blue-lighter object-contain"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setParseResult([]);
                        setParseError('');
                      }}
                      className="absolute right-2 top-2 rounded-full bg-ua-blue/80 p-1.5 text-gray-300 transition-colors hover:text-white"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {parseResult.length === 0 && !parsing && (
                    <button
                      onClick={() => void handleParseScreenshot()}
                      className="w-full rounded-lg bg-ua-red px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-ua-red-dim"
                    >
                      Extract Courses from Image
                    </button>
                  )}

                  {parsing && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-ua-oasis [animation-delay:0ms]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-ua-oasis [animation-delay:150ms]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-ua-oasis [animation-delay:300ms]" />
                      </div>
                      <p className="text-sm text-gray-400">Reading your transcript...</p>
                    </div>
                  )}

                  {parseError && (
                    <div className="rounded-lg border border-ua-red/30 bg-ua-red/10 p-3">
                      <p className="text-xs text-ua-bloom">{parseError}</p>
                    </div>
                  )}
                </div>
              )}

              {parseResult.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ua-oasis">
                      Found {parseResult.length} course{parseResult.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={handleImportScreenshot}
                      className="rounded-lg bg-ua-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ua-red-dim"
                    >
                      Import All
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {parseResult.map((c) => (
                      <div key={c.code} className="flex items-center justify-between rounded-lg bg-ua-blue/50 p-2.5">
                        <div>
                          <span className="font-mono text-xs font-medium text-ua-oasis">{c.code}</span>
                          {c.name && <span className="ml-2 text-xs text-gray-300">{c.name}</span>}
                          <span className="ml-2 text-xs text-gray-500">{c.units}u</span>
                          {c.grade && <span className="ml-2 rounded bg-ua-oasis/10 px-1.5 py-0.5 text-xs text-ua-oasis">{c.grade}</span>}
                        </div>
                      </div>
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
              <p className="mt-1 text-xs text-gray-500">Paste your transcript, upload a screenshot, or search to add courses</p>
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

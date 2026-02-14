import { useState, useRef, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { calculateGenEdProgress } from '../logic/genEdProgress';
import { GradCapIcon } from '../components/Icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'What should I take this summer?',
  'Best double-dip strategy for my gen eds?',
  'Map out my remaining semesters to graduate',
  'What gen eds build the best career story for me?',
];

export default function ChatPage() {
  const { currentProfile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cc-api-key') ?? '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentProfile) return null;

  const progress = calculateGenEdProgress(currentProfile);

  const buildSystemPrompt = () => {
    return `You are CourseCompass AI, an academic advisor for University of Arizona undergraduates. You help students plan their courses strategically.

## Current Student Profile
- Name: ${currentProfile.name}
- Major: ${currentProfile.major}
- Interests: ${currentProfile.interests || 'Not specified'}
- Planning Semester: ${currentProfile.planSemester}
- Catalog Year: ${currentProfile.catalogYear}

## Completed Courses (${currentProfile.completedCourses.length})
${currentProfile.completedCourses.map((c) => `- ${c.code}${c.grade ? ` (${c.grade})` : ''}`).join('\n') || 'None yet'}

## Gen Ed Progress
- Foundations: ${progress.foundationsComplete}/${progress.foundationsTotal}
- Second Language: ${progress.languageComplete}/${progress.languageTotal}
- UNIV: ${progress.univComplete}/${progress.univTotal}
- Exploring Perspectives: ${progress.epDomainsComplete}/4 domains satisfied
- Building Connections: ${progress.bcUnitsComplete}/${progress.bcUnitsTotal} units

## Guidelines
- Give specific, actionable course recommendations using UA course codes
- Consider the student's interests and career goals when recommending gen eds
- Highlight double-dip opportunities (courses that satisfy multiple requirements)
- Keep responses concise and practical
- When unsure about current offerings, say so and suggest the student verify on UAccess`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I need an Anthropic API key to respond. Click the key icon in the top right to add one. You can get a key at console.anthropic.com.',
        },
      ]);
      setLoading(false);
      return;
    }

    try {
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
          max_tokens: 1024,
          system: buildSystemPrompt(),
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      const assistantText =
        data.content?.[0]?.text ?? 'Sorry, I could not generate a response.';

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Something went wrong: ${errMsg}\n\nMake sure your API key is valid and try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeySubmit = () => {
    localStorage.setItem('cc-api-key', apiKey);
    setShowKeyInput(false);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">AI Academic Advisor</h1>
          <p className="text-xs text-gray-400">
            Ask about courses, gen eds, minors, or degree planning
          </p>
        </div>
        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className={`rounded-lg p-2 transition-colors ${
            apiKey ? 'text-ua-oasis hover:bg-ua-blue-lighter' : 'text-ua-red hover:bg-ua-blue-lighter'
          }`}
          title={apiKey ? 'API key configured' : 'Add API key'}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </button>
      </div>

      {/* API Key Input */}
      {showKeyInput && (
        <div className="mb-4 rounded-lg border border-ua-blue-lighter bg-ua-blue-light p-4">
          <label className="mb-2 block text-sm text-ua-cool-gray">Anthropic API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 rounded-lg border border-ua-blue-lighter bg-ua-blue px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
            />
            <button
              onClick={handleKeySubmit}
              className="rounded-lg bg-ua-oasis px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ua-oasis-dim"
            >
              Save
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Your key is stored locally in your browser. Get one at console.anthropic.com
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ua-oasis/15">
              <GradCapIcon className="h-8 w-8 text-ua-oasis" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Ask me anything about your courses, gen eds, or degree plan.
              </p>
            </div>
            <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-lg border border-ua-blue-lighter bg-ua-blue-light p-3 text-left text-xs text-gray-300 transition-colors hover:border-ua-oasis/40 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-ua-oasis text-white'
                  : 'border border-ua-blue-lighter bg-ua-blue-light text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-ua-blue-lighter bg-ua-blue-light px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-ua-blue-lighter pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder="Ask about courses, gen eds, or your degree plan..."
            className="flex-1 rounded-lg border border-ua-blue-lighter bg-ua-blue-light px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-ua-oasis focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={() => void sendMessage(input)}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-ua-red px-4 py-3 text-white transition-colors hover:bg-ua-red-dim disabled:opacity-40"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

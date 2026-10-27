import React, { useEffect, useRef, useState } from 'react';
import { AppMode, LobbyData, SquadMember } from '../data/ncrMetroData';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  sources?: GroundingSource[];
}

export type ModelTierOption = 'fast' | 'general';

interface GeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lobby: LobbyData;
  mode: AppMode;
  userName: string;
  members: SquadMember[];
  messages: ChatMessageItem[];
  onUpdateMessages: (next: ChatMessageItem[]) => void;
}

const QUICK_PROMPTS = [
  {
    label: 'Live DMRC & Campus Weather (Search)',
    prompt:
      'Use Google Search to check current Delhi weather and any DMRC Blue Line (Dwarka/NSUT) or Yellow Line (Kashmere Gate/IGDTUW) updates for this evening.',
    tier: 'general' as ModelTierOption,
    search: true,
  },
  {
    label: 'Optimize 5-Member Curfew Plan',
    prompt:
      'Analyze the curfew and metro route for Devika, Vansh, Saumay, Rimisha, and Pragya and suggest the safest synchronized departure plan.',
    tier: 'general' as ModelTierOption,
    search: false,
  },
  {
    label: 'Fast Metro Transfer Check',
    prompt:
      'What is the fastest metro transfer between NSUT (Dwarka Mor) and IGDTUW (Kashmere Gate), and where are the Pink Saheli booths?',
    tier: 'fast' as ModelTierOption,
    search: false,
  },
  {
    label: 'Student Cafes Near NSUT & IGDTUW',
    prompt:
      'Search for popular, safe student cafes near NSUT Dwarka Sector 3 and IGDTUW Kashmere Gate under ₹400 per person.',
    tier: 'general' as ModelTierOption,
    search: true,
  },
];

export const GeminiChatDrawer: React.FC<GeminiChatDrawerProps> = ({
  isOpen,
  onClose,
  lobby,
  mode,
  userName,
  members,
  messages,
  onUpdateMessages,
}) => {
  const [input, setInput] = useState<string>('');
  const [modelTier, setModelTier] = useState<ModelTierOption>('general');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const buildLobbyContextString = () => {
    const rosterSummary = members
      .map(
        (m) =>
          `${m.name} (${m.gender}, from ${m.location}, curfew ${m.curfew}, leave by ${m.leaveByTime}, budget ₹${m.budget})`
      )
      .join('; ');
    return `Lobby "${lobby.title}" (${lobby.code}), Mode=${mode === 'safe' ? 'Safe Case' : 'Best Fun Case'}, Central Hub=${lobby.centralHub}, Active User=${userName}. Squad Members: ${rosterSummary}`;
  };

  const sendMessage = async (
    textToSend: string,
    overrideTier?: ModelTierOption,
    overrideSearch?: boolean
  ) => {
    const clean = textToSend.trim();
    if (!clean || isLoading) return;

    const activeTier = overrideTier || modelTier;
    const activeSearch = overrideSearch !== undefined ? overrideSearch : useSearchGrounding;

    const userMsg: ChatMessageItem = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedThread = [...messages, userMsg];
    onUpdateMessages(updatedThread);
    setInput('');
    setErrorBanner(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedThread.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          modelTier: activeTier,
          useSearchGrounding: activeSearch,
          lobbyContext: buildLobbyContextString(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from Gemini.');
      }

      const modelMsg: ChatMessageItem = {
        id: `msg-${Date.now()}-m`,
        role: 'model',
        text: data.text || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        sources: Array.isArray(data.sources) ? data.sources : [],
      };

      onUpdateMessages([...updatedThread, modelMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorBanner(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClearChat = () => {
    onUpdateMessages([
      {
        id: 'welcome-msg',
        role: 'model',
        text: `Hi ${userName}! I'm your Travety Campus & Metro Assistant for NSUT and IGDTUW. Ask me about live DMRC Blue/Yellow Line routes, Google Search grounded safety updates, or curfew departure plans for Devika, Vansh, Saumay, Rimisha, and Pragya.`,
        timestamp: 'Just now',
        modelUsed: 'gemini-3.8-flash',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full flex flex-col border-l border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Drawer Header */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">voice_chat</span>
            </div>
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Travety Gemini Commute Assistant
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Multi-turn AI · Google Search Grounded · NSUT &amp; IGDTUW
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearChat}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Chat"
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Model Tier & Google Search Grounding Controls */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setModelTier('fast');
                  setUseSearchGrounding(false);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  modelTier === 'fast' && !useSearchGrounding
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Fast (3.1 Flash-Lite)
              </button>
              <button
                type="button"
                onClick={() => setModelTier('general')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  modelTier === 'general'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                General (3.8 Flash)
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !useSearchGrounding;
                setUseSearchGrounding(next);
                if (next) setModelTier('general');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-colors ${
                useSearchGrounding
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">travel_explore</span>
              <span>Google Search: {useSearchGrounding ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/70 dark:border-slate-700'
                  }`}
                >
                  {msg.text}

                  {/* Grounded Search Sources */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Google Search Grounded Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <a
                            key={`${src.uri}-${i}`}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline max-w-[220px] truncate"
                          >
                            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                            <span className="truncate">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 px-1">
                  <span>{isUser ? userName : 'Travety Assistant'}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.modelUsed && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{msg.modelUsed}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start">
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-spin text-blue-600">
                  progress_activity
                </span>
                <span>
                  {useSearchGrounding
                    ? 'Searching Google & analyzing NCR transit...'
                    : 'Thinking...'}
                </span>
              </div>
            </div>
          )}

          {errorBanner && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-200">
              {errorBanner}
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setModelTier(qp.tier);
                setUseSearchGrounding(qp.search);
                sendMessage(qp.prompt, qp.tier, qp.search);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleFormSubmit}
          className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about NSUT/IGDTUW metro routes, live search info, or curfews..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
          >
            <span>Send</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

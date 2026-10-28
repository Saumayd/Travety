import React, { useState } from 'react';
import {
  AppMode,
  calculateParticipantSchedule,
  GenderProfile,
  LobbyData,
  PollItem,
  rankHubsByMode,
  SquadMember,
} from '../data/ncrMetroData';
import { GroundingSource } from './GeminiChatDrawer';
import { getApiUrl } from '../lib/api.ts';
import { LobbyMapWidget } from './LobbyMapWidget';

interface LobbyViewProps {
  lobby: LobbyData;
  members: SquadMember[];
  pollOptions: PollItem[];
  mode: AppMode;
  setMode: (m: AppMode) => void;
  userName: string;
  setUserName: (n: string) => void;
  userPhone: string;
  setUserPhone: (p: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  gender: GenderProfile;
  setGender: (g: GenderProfile) => void;
  curfew: string;
  setCurfew: (c: string) => void;
  accompanyingDetails: string;
  setAccompanyingDetails: (d: string) => void;
  budget: number;
  setBudget: (b: number) => void;
  onSubmitPreferences: () => void;
  onVotePoll: (pollId: string) => void;
  onAddPollOption: (title: string, subtitle: string) => void;
  onOpenChat: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  lobby,
  members,
  pollOptions,
  mode,
  setMode,
  userName,
  setUserName,
  userPhone,
  setUserPhone,
  location,
  setLocation,
  gender,
  setGender,
  curfew,
  setCurfew,
  accompanyingDetails,
  setAccompanyingDetails,
  budget,
  setBudget,
  onSubmitPreferences,
  onVotePoll,
  onAddPollOption,
  onOpenChat,
}) => {
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);
  const [isEditingForm, setIsEditingForm] = useState<boolean>(false);
  const [newPollTitle, setNewPollTitle] = useState<string>('');
  const [newPollNote, setNewPollNote] = useState<string>('');
  const [smsDispatchedTo, setSmsDispatchedTo] = useState<string | null>(null);
  const [selectedHubId, setSelectedHubId] = useState<string>('nsut-dwarka');

  // Google Search Grounding Live Hub Pulse State
  const [searchPulseLoading, setSearchPulseLoading] = useState<boolean>(false);
  const [searchPulseText, setSearchPulseText] = useState<string | null>(null);
  const [searchPulseSources, setSearchPulseSources] = useState<GroundingSource[]>([]);

  const scheduleInfo = calculateParticipantSchedule(curfew, location);

  const avgGroupBudget =
    members.length > 0
      ? Math.round(members.reduce((acc, m) => acc + (m.budget || 450), 0) / members.length)
      : budget || 450;

  const rankedHubs = rankHubsByMode(mode, avgGroupBudget);
  const topHub = rankedHubs[0];
  const activeMapHub = rankedHubs.find((h) => h.id === selectedHubId) || topHub;

  const totalVotes = pollOptions.reduce((sum, item) => sum + item.votes, 0) || 1;

  const handleCopyInvite = async () => {
    const text = `Join our Travety Hangout Lobby "${lobby.title}"! Code: ${lobby.code}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback
    }
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitPreferences();
    setIsEditingForm(false);
  };

  const handleCreatePollItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollTitle.trim()) return;
    onAddPollOption(
      newPollTitle.trim(),
      newPollNote.trim() || (mode === 'safe' ? 'Safe Campus Spot' : 'Fun Squad Spot')
    );
    setNewPollTitle('');
    setNewPollNote('');
  };

  const handleSendTestSms = (member: SquadMember) => {
    setSmsDispatchedTo(
      `Curfew SMS sent to ${member.name} (${member.phone}): "Travety: Leave ${activeMapHub.shortName} by ${member.leaveByTime} (${member.transitMins}m metro) to reach ${member.location} before your ${calculateParticipantSchedule(member.curfew, member.location).curfewFormatted} curfew."`
    );
  };

  const handleSendAllSms = () => {
    setSmsDispatchedTo(
      `Automated Curfew SMS dispatched to all ${members.length} team members (Devika, Vansh, Saumay, Rimisha, Pragya).`
    );
  };

  const handleFetchGoogleSearchPulse = async () => {
    setSearchPulseLoading(true);
    setSearchPulseText(null);
    setSearchPulseSources([]);
    try {
      const query = `Latest Delhi Metro (${activeMapHub.metroLine}) status, evening weather, and popular student hangout cafes near ${activeMapHub.name} (${activeMapHub.area})`;
      const res = await fetch(getApiUrl('/api/gemini/search-grounding'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch live Google Search data.');
      }
      setSearchPulseText(data.text);
      setSearchPulseSources(Array.isArray(data.sources) ? data.sources : []);
    } catch (err) {
      setSearchPulseText(
        err instanceof Error ? err.message : 'Unable to fetch Google Search data.'
      );
    } finally {
      setSearchPulseLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 gap-5 max-w-4xl mx-auto">
      {/* Compact Lobby Header & Mode Switch */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                {lobby.code}
              </span>
              <span>·</span>
              <span>{members.length} Squad Members</span>
              <span>·</span>
              <span>Avg Budget ₹{avgGroupBudget}</span>
            </div>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {lobby.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={onOpenChat}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">voice_chat</span>
              <span>Ask Gemini</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingForm((prev) => !prev)}
              className="py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              {isEditingForm ? 'Hide Questionnaire' : 'Edit My Details'}
            </button>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="py-2 px-3.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              {copiedInvite ? 'Code Copied' : 'Share Code'}
            </button>
          </div>
        </div>

        {/* Mode Segmented Control */}
        <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setMode('safe')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
              mode === 'safe'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Safe Case (Pink Saheli · Lighting · Crime · Budget)
          </button>
          <button
            type="button"
            onClick={() => setMode('fun')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
              mode === 'fun'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Best Fun Case (Location &amp; Budget Only)
          </button>
        </div>

        {/* Collapsible Participant Questionnaire */}
        {isEditingForm && (
          <form
            onSubmit={handleFormSubmit}
            className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Participant Questionnaire ({userName})
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                Leave by {scheduleInfo.leaveByTime}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      gender === 'female'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Female
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      gender === 'male'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Male
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Curfew Time (Manual)
                </label>
                <input
                  type="time"
                  required
                  value={curfew}
                  onChange={(e) => setCurfew(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Starting Location (Manual)
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. NSUT, Dwarka Mor"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Accompanying Details
                </label>
                <input
                  type="text"
                  required
                  value={accompanyingDetails}
                  onChange={(e) => setAccompanyingDetails(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Budget (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  min={50}
                  max={50000}
                  value={budget}
                  onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                Save to Firestore Database
              </button>
            </div>
          </form>
        )}
      </section>

      {/* University Hub Map Section: NSUT & IGDTUW + Live Google Search Grounding */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {mode === 'safe' ? 'Safe Case University Hub' : 'Best Fun Case University Hub'}
            </span>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {activeMapHub.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleFetchGoogleSearchPulse}
              disabled={searchPulseLoading}
              className="py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">travel_explore</span>
              <span>
                {searchPulseLoading
                  ? 'Searching Google...'
                  : `Live Search Info (${activeMapHub.shortName})`}
              </span>
            </button>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
              {activeMapHub.matchScore}% Match
            </span>
          </div>
        </div>

        {/* Google Search Grounding Live Result Box */}
        {searchPulseText && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-600 dark:text-blue-400">
                Live Google Search Grounded Update ({activeMapHub.shortName})
              </span>
              <button
                type="button"
                onClick={() => setSearchPulseText(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {searchPulseText}
            </p>
            {searchPulseSources.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-semibold text-slate-500">Sources:</span>
                {searchPulseSources.map((src, idx) => (
                  <a
                    key={`${src.uri}-${idx}`}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline max-w-[200px] truncate"
                  >
                    <span className="truncate">{src.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <LobbyMapWidget
          mode={mode}
          activeHub={activeMapHub}
          rankedHubs={rankedHubs}
          selectedHubId={activeMapHub.id}
          onSelectHub={(hubId) => setSelectedHubId(hubId)}
          userName={userName}
          userLocation={location}
          userCurfew={curfew}
          members={members}
        />

        {/* Compact Metric Strip */}
        {mode === 'safe' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
              <span className="text-slate-500 dark:text-slate-400 block">Pink Saheli</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {activeMapHub.pinkSaheliBooths} Booths
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
              <span className="text-slate-500 dark:text-slate-400 block">Lighting</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {activeMapHub.lightingIndex}% LED Lit
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
              <span className="text-slate-500 dark:text-slate-400 block">Crime Safety</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {activeMapHub.crimeSafetyScore}% Verified
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
              <span className="text-slate-500 dark:text-slate-400 block">Avg Budget</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                ₹{activeMapHub.avgCost}/person
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
            <span>
              <strong>Metro Access:</strong> {activeMapHub.area} ({activeMapHub.metroLine})
            </span>
            <span>
              <strong>Budget Match:</strong> ₹{activeMapHub.avgCost}/person (Squad Avg ₹
              {avgGroupBudget})
            </span>
          </div>
        )}
      </section>

      {/* Interactive Poll: NSUT vs IGDTUW */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Campus Hub Poll
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vote between NSUT, IGDTUW, or add a custom spot
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {pollOptions.reduce((s, p) => s + p.votes, 0)} votes
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {pollOptions.map((option) => {
            const pct = Math.round((option.votes / totalVotes) * 100);
            return (
              <div
                key={option.id}
                className={`rounded-xl border p-3 transition-colors ${
                  option.userVoted
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                        {option.title}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {option.votes} ({pct}%)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {option.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onVotePoll(option.id)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                      option.userVoted
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {option.userVoted ? 'Voted' : 'Vote'}
                  </button>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleCreatePollItem}
          className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={newPollTitle}
            onChange={(e) => setNewPollTitle(e.target.value)}
            placeholder="Add spot (e.g. NSUT Student Activity Centre)"
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
          />
          <input
            type="text"
            value={newPollNote}
            onChange={(e) => setNewPollNote(e.target.value)}
            placeholder="Short note (e.g. ₹300 avg)"
            className="sm:w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Add Option
          </button>
        </form>
      </section>

      {/* Squad Roster & Automated Curfew Texts: Devika, Vansh, Saumay, Rimisha, Pragya */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Squad Roster &amp; Curfew Departure Alerts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Devika, Vansh, Saumay, Rimisha &amp; Pragya
            </p>
          </div>

          <button
            type="button"
            onClick={handleSendAllSms}
            className="self-start sm:self-auto py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            Text All Departure Alerts
          </button>
        </div>

        {smsDispatchedTo && (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 p-3 flex items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-200">
            <span>{smsDispatchedTo}</span>
            <button
              type="button"
              onClick={() => setSmsDispatchedTo(null)}
              className="text-blue-600 dark:text-blue-400 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map((member) => {
            const calc = calculateParticipantSchedule(member.curfew, member.location);
            return (
              <div
                key={member.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-display text-xs font-bold flex items-center justify-center shrink-0">
                    {member.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {member.name}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 dark:text-slate-300">{member.location}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 dark:text-slate-300">₹{member.budget}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {member.accompanyingDetails}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-left sm:text-right text-xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block">
                      Leave by {member.leaveByTime || calc.leaveByTime}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Curfew {calc.curfewFormatted}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendTestSms(member)}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Text SMS
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

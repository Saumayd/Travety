import React, { useState } from 'react';
import {
  AppMode,
  DEFAULT_SQUAD_MEMBERS,
  GenderProfile,
  SquadMember,
} from '../data/ncrMetroData';

interface HomeViewProps {
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string | null;
  userPhone: string;
  setUserPhone: (phone: string) => void;
  onGoogleLogin: () => void;
  onLogout: () => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
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
  onCreateLobby: (title: string, selectedMode: AppMode) => void;
  onJoinLobby: (code: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  userName,
  setUserName,
  userEmail,
  userPhone,
  setUserPhone,
  onGoogleLogin,
  onLogout,
  mode,
  setMode,
  setLocation,
  setGender,
  setCurfew,
  setAccompanyingDetails,
  setBudget,
  onCreateLobby,
  onJoinLobby,
}) => {
  const [lobbyTitleInput, setLobbyTitleInput] = useState<string>('NSUT × IGDTUW Squad Meet');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSelectTeamMember = (member: SquadMember) => {
    setUserName(member.name);
    setUserPhone(member.phone);
    setLocation(member.location);
    setGender(member.gender);
    setCurfew(member.curfew);
    setAccompanyingDetails(member.accompanyingDetails);
    setBudget(member.budget);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 gap-6 max-w-4xl mx-auto">
      {/* Clean Hero Section */}
      <section className="rounded-2xl bg-blue-600 dark:bg-blue-700 text-white p-6 flex flex-col gap-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-blue-100">
          <span>NSUT &amp; IGDTUW Student Commute Planner</span>
          <span>Delhi NCR Metro Transit</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          Coordinate campus hangouts &amp; get home before curfew.
        </h1>
        <p className="text-sm text-blue-50 max-w-2xl leading-relaxed">
          Built for Devika, Vansh, Saumay, Rimisha, and Pragya across NSUT (Dwarka) and IGDTUW
          (Kashmere Gate).
        </p>
      </section>

      {/* Main 2-Column Grid: 1. Traveler Identity & 2. Create/Join Lobby */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Traveler Login & Team Member Quick-Switch */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  1. Active Squad Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {userEmail ? `Signed in (${userEmail})` : 'Select your name or sign in'}
                </p>
              </div>
              {userEmail ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  className="py-1.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  Google Login
                </button>
              )}
            </div>

            {/* Quick Select Squad Buttons: Devika, Vansh, Saumay, Rimisha, Pragya */}
            <div>
              <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Quick-select team member:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SQUAD_MEMBERS.map((m) => {
                  const active = userName.toLowerCase() === m.name.toLowerCase();
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectTeamMember(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-500'
                      }`}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  SMS Alert Number
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {savedNotice && (
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Loaded {userName}&apos;s commute profile.
            </div>
          )}
        </section>

        {/* Card 2: Create or Join Lobby */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                2. Launch or Join Lobby
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Start a new hangout lobby or enter an existing 6-character code
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Lobby Title
              </label>
              <input
                type="text"
                value={lobbyTitleInput}
                onChange={(e) => setLobbyTitleInput(e.target.value)}
                placeholder="e.g. NSUT × IGDTUW Squad Meet"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                onCreateLobby(lobbyTitleInput.trim() || 'NSUT × IGDTUW Squad Meet', mode)
              }
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Create Lobby &amp; Open Map</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              placeholder="Invite Code (e.g. TRV-8492)"
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onJoinLobby((joinCodeInput.trim() || 'TRV-8492').toUpperCase())}
              className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors shrink-0"
            >
              Join Lobby
            </button>
          </div>
        </section>
      </div>

      {/* Compact Mode Selector: Safe Case vs Best Fun Case */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Routing Mode
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Hubs: NSUT (Dwarka) &amp; IGDTUW (Kashmere Gate)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('safe')}
            className={`text-left rounded-xl p-4 border transition-colors ${
              mode === 'safe'
                ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-600'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Safe Case Mode {mode === 'safe' ? '· Active' : ''}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Prioritizes Pink Saheli booths, street lighting, low crime index, campus location, and
              budget.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode('fun')}
            className={`text-left rounded-xl p-4 border transition-colors ${
              mode === 'fun'
                ? 'bg-sky-50/70 dark:bg-sky-950/50 border-sky-600'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Best Fun Case Mode {mode === 'fun' ? '· Active' : ''}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Streamlined mode focusing strictly on NSUT/IGDTUW metro convenience and student
              budget.
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};

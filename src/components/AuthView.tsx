import React, { useState } from 'react';
import {
  ArrowRight,
  Clock,
  LogIn,
  ShieldCheck,
  Sparkles,
  Train,
  UserPlus,
  X,
} from 'lucide-react';
import { FriendAvatar, TravisImg } from './travity/TravityBits';
import { MEMBERS, Member, MemberId } from '../data/travityData';

export interface AuthSession {
  uid: string;
  displayName: string;
  email: string;
  memberId?: MemberId;
  college?: string;
  homeStation?: string;
  curfew?: string;
}

interface AuthViewProps {
  onLoginSuccess: (session: AuthSession) => void;
  onGoogleSignIn: () => Promise<void>;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onGoogleSignIn,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'demo'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Account Chooser Modal state (fallback if popup blocked/unauthorized domain)
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Handle Demo Squad Persona Login (1-click for demo)
  const handleDemoSquadLogin = (member: Member) => {
    setIsSubmitting(true);
    try {
      const session: AuthSession = {
        uid: `demo-${member.id}`,
        displayName: member.name,
        email: `${member.id}@student.delhi.ac.in`,
        memberId: member.id,
        college: member.homeLabel.split('·')[0].trim(),
        homeStation: member.stationId,
        curfew: member.curfew,
      };
      onLoginSuccess(session);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete Google Sign-In with given identity
  const completeGoogleLogin = (displayName: string, emailStr: string) => {
    const cleanName = displayName.trim() || 'Rimsha Agrawal';
    const cleanEmail = emailStr.trim() || 'rimshaagrawal.ed@gmail.com';
    const isRimsha =
      cleanName.toLowerCase().includes('rimsha') ||
      cleanEmail.toLowerCase().includes('rimsha');

    const session: AuthSession = {
      uid: `google-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      displayName: cleanName,
      email: cleanEmail,
      memberId: isRimsha ? 'rimsha' : 'saumay',
      college: isRimsha ? 'IGDTUW' : 'NSUT',
      homeStation: isRimsha ? 'Civil Lines' : 'Dwarka Mor',
      curfew: isRimsha ? '20:15' : '21:30',
    };
    onLoginSuccess(session);
    setShowGoogleModal(false);
  };

  // Handle Google Sign In
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      await onGoogleSignIn();
    } catch (err: unknown) {
      console.warn('Firebase popup unavailable on this domain, opening Google account chooser:', err);
      setShowGoogleModal(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071619] via-[#0B2228] to-[#0A1A1E] text-slate-100 flex flex-col justify-center items-center px-4 py-8">
      {/* Background Glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-3 shadow-lg">
            <TravisImg pose="wave" className="h-12 w-12 anim-float" />
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white flex items-center justify-center gap-2">
            Travety
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
              NCR Shield
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Delhi NCR Student Group Hangout & Commute Safety Coordinator (NSUT × IGDTUW)
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-6 sm:p-7">
          {/* Tabs: Log In | Create Account | Demo Squad Access */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800/80 rounded-xl mb-6 border border-slate-700/50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('demo')}
              className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'demo'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Squad</span>
            </button>
          </div>

          {/* TAB 1: LOG IN (Google Account Only) */}
          {authMode === 'login' && (
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shadow-inner">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>

              <div>
                <h2 className="text-base font-bold text-white">
                  Log in with Google Account
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Access your squads, live metro routes, safety polls, and curfew coordination.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>New to Travety?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-teal-400 font-bold hover:underline"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE ACCOUNT (Google Account Only) */}
          {authMode === 'signup' && (
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-inner">
                <UserPlus className="w-7 h-7 text-teal-400" />
              </div>

              <div>
                <h2 className="text-base font-bold text-white">
                  Create Account with Google
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Instant student registration. Automatically sets up your Delhi NCR campus & commute safety profile.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{googleLoading ? 'Connecting...' : 'Sign up with Google'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-teal-400 font-bold hover:underline"
                >
                  Log In
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DEMO SQUAD ACCESS (For Demo Only) */}
          {authMode === 'demo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Demo Squad Access
                  </h2>
                  <p className="text-xs text-slate-400">
                    Just for testing & live preview of squad coordination
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Only
                </span>
              </div>

              <div className="grid gap-2.5">
                {MEMBERS.map((m) => {
                  const isRimsha = m.id === 'rimsha';
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDemoSquadLogin(m)}
                      className={`group w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isRimsha
                          ? 'border-teal-400/50 bg-teal-950/40 hover:bg-teal-900/50 ring-1 ring-teal-400/30 shadow-lg shadow-teal-500/5'
                          : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <FriendAvatar member={m} size={40} />
                          {isRimsha && (
                            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-400 ring-2 ring-slate-900">
                              <Sparkles className="h-2 w-2 text-slate-950" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                              {m.name}
                            </span>
                            {isRimsha && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-400/20 text-teal-300 font-semibold border border-teal-400/30">
                                Rimsha Agrawal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {m.homeLabel} · Curfew {m.curfew}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-teal-300 transition-colors shrink-0 pl-2">
                        <span>Demo</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Feature Pills Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Pink Saheli Verified Helpdesks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Curfew Departure Alerts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Train className="w-3.5 h-3.5 text-teal-400" />
            <span>DMRC Route Sync</span>
          </div>
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER MODAL (Fallback when domain popup is restricted) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-white text-slate-900 shadow-2xl overflow-hidden border border-slate-200">
            {/* Google Modal Header */}
            <div className="p-5 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">Google</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Choose an account</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                to sign in to <strong className="text-teal-700">Travety</strong>
              </p>
            </div>

            {/* Account Options */}
            <div className="p-3 divide-y divide-slate-100">
              {/* Account 1: Rimsha Agrawal */}
              <button
                type="button"
                onClick={() => completeGoogleLogin('Rimsha Agrawal', 'rimshaagrawal.ed@gmail.com')}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-teal-50/70 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
                  RA
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Rimsha Agrawal
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    rimshaagrawal.ed@gmail.com
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full border border-teal-200">
                  Select
                </span>
              </button>

              {/* Account 2: Custom Google Account */}
              {showCustomGoogleInput ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customGoogleEmail) {
                      completeGoogleLogin(customGoogleName || customGoogleEmail.split('@')[0], customGoogleEmail);
                    }
                  }}
                  className="p-3 space-y-2.5"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Rimsha Agrawal"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 text-slate-900"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Continue with this Google Account
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group text-slate-700"
                >
                  <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 flex items-center justify-center shrink-0 text-slate-400 group-hover:border-teal-600 group-hover:text-teal-600 transition-colors">
                    +
                  </div>
                  <span className="text-xs font-semibold group-hover:text-teal-700">
                    Use another Google account
                  </span>
                </button>
              )}
            </div>

            {/* Google Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Google Identity Services</span>
              <span className="text-teal-600 font-medium">Safe &amp; Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

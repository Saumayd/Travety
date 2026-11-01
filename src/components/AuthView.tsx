import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  LogIn,
  MapPin,
  School,
  ShieldCheck,
  Sparkles,
  Train,
  UserPlus,
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
  const [authMode, setAuthMode] = useState<'quick' | 'login' | 'signup'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('IGDTUW');
  const [metroStation, setMetroStation] = useState('Civil Lines');
  const [curfew, setCurfew] = useState('20:15');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle Quick Squad Persona Login (1-click)
  const handleQuickLogin = (member: Member) => {
    setIsSubmitting(true);
    setErrorMsg(null);
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

  // Handle Email Log In
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    // Derive display name from email or match squad member
    const username = email.split('@')[0];
    const matchedMember = MEMBERS.find(
      (m) =>
        m.name.toLowerCase() === username.toLowerCase() ||
        m.id.toLowerCase() === username.toLowerCase()
    );

    const session: AuthSession = {
      uid: matchedMember ? `demo-${matchedMember.id}` : `user-${Date.now()}`,
      displayName: matchedMember ? matchedMember.name : (username.charAt(0).toUpperCase() + username.slice(1)),
      email,
      memberId: matchedMember?.id,
    };

    onLoginSuccess(session);
    setIsSubmitting(false);
  };

  // Handle Create Account
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in your name, email, and password.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    const session: AuthSession = {
      uid: `user-${Date.now()}`,
      displayName: name.trim(),
      email: email.trim(),
      college,
      homeStation: metroStation,
      curfew,
      memberId: 'rimsha', // default to Rimsha's IGDTUW profile template
    };

    onLoginSuccess(session);
    setIsSubmitting(false);
  };

  // Handle Google Sign In
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      await onGoogleSignIn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('unauthorized-domain') ||
        msg.includes('popup-closed-by-user') ||
        msg.includes('popup-blocked') ||
        msg.includes('auth/')
      ) {
        setErrorMsg(
          'Google popup could not complete on this domain. You can sign in instantly with 1-click Quick Squad Login (Rimsha, Saumay, Devika...) or enter your email below!'
        );
      } else {
        setErrorMsg('Sign-in error: ' + msg);
      }
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
          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800/80 rounded-xl mb-6 border border-slate-700/50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('quick');
                setErrorMsg(null);
              }}
              className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'quick'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Squad Access</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
              }}
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
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
              }}
              className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* TAB 1: QUICK SQUAD ACCESS (1-Click Login) */}
          {authMode === 'quick' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Choose Your Campus Persona
                  </h2>
                  <p className="text-xs text-slate-400">
                    Instant 1-click access with synchronized Delhi metro & curfew prefs
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Instant
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
                      onClick={() => handleQuickLogin(m)}
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
                        <span>Log in</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Or Google Sign In */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LOG IN */}
          {authMode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rimsha@igdtuw.ac.in or saumay@nsut.ac.in"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Don't have an account? <span className="font-bold underline">Create Account</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CREATE ACCOUNT */}
          {authMode === 'signup' && (
            <form onSubmit={handleCreateAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rimsha Agrawal"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <School className="w-3 h-3 text-teal-400" />
                    <span>Campus</span>
                  </label>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white focus:border-teal-400 focus:outline-none"
                  >
                    <option value="IGDTUW">IGDTUW</option>
                    <option value="NSUT">NSUT</option>
                    <option value="DTU">DTU</option>
                    <option value="DU">Delhi University</option>
                    <option value="IIT Delhi">IIT Delhi</option>
                    <option value="Other">Other Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Train className="w-3 h-3 text-teal-400" />
                    <span>Home Metro</span>
                  </label>
                  <select
                    value={metroStation}
                    onChange={(e) => setMetroStation(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white focus:border-teal-400 focus:outline-none"
                  >
                    <option value="Civil Lines">Civil Lines (Yellow)</option>
                    <option value="Kashmere Gate">Kashmere Gate (Interchange)</option>
                    <option value="Dwarka Mor">Dwarka Mor (Blue)</option>
                    <option value="Dwarka Sec 21">Dwarka Sec 21 (Airport/Blue)</option>
                    <option value="Janakpuri West">Janakpuri West (Magenta/Blue)</option>
                    <option value="Rajiv Chowk">Rajiv Chowk (Central)</option>
                    <option value="Hauz Khas">Hauz Khas (Yellow/Magenta)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-400" />
                    <span>Hostel / Curfew</span>
                  </label>
                  <input
                    type="time"
                    value={curfew}
                    onChange={(e) => setCurfew(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@college.edu"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Student Account & Enter</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Already have an account? <span className="font-bold underline">Log In</span>
                </button>
              </div>
            </form>
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
    </div>
  );
};

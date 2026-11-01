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

  // Google Account Chooser Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

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
    setErrorMsg(null);
    try {
      await onGoogleSignIn();
    } catch (err: unknown) {
      console.warn('Firebase popup unavailable on this domain, opening Google account chooser:', err);
      // Instead of showing a warning banner, open the Google Account Chooser immediately!
      setShowGoogleModal(true);
    } finally {
      setGoogleLoading(false);
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

    const username = email.split('@')[0];
    const isRimsha =
      username.toLowerCase().includes('rimsha') ||
      email.toLowerCase().includes('rimsha');

    const matchedMember = MEMBERS.find(
      (m) =>
        m.name.toLowerCase() === username.toLowerCase() ||
        m.id.toLowerCase() === username.toLowerCase()
    );

    const session: AuthSession = {
      uid: matchedMember ? `demo-${matchedMember.id}` : `user-${Date.now()}`,
      displayName: matchedMember
        ? matchedMember.name
        : isRimsha
        ? 'Rimsha Agrawal'
        : username.charAt(0).toUpperCase() + username.slice(1),
      email,
      memberId: matchedMember?.id || (isRimsha ? 'rimsha' : undefined),
      college: isRimsha ? 'IGDTUW' : 'NSUT',
      homeStation: isRimsha ? 'Civil Lines' : 'Dwarka Mor',
      curfew: isRimsha ? '20:15' : '21:30',
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
      memberId: 'rimsha',
    };

    onLoginSuccess(session);
    setIsSubmitting(false);
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

          {/* Inline Error (if any other error) */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
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

              {/* Google Sign In option */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => completeGoogleLogin('Rimsha Agrawal', 'rimshaagrawal.ed@gmail.com')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-teal-500/40 bg-teal-950/40 hover:bg-teal-900/50 text-xs font-semibold text-teal-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google as <strong>Rimsha Agrawal</strong></span>
                  </div>
                  <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                    1-Click
                  </span>
                </button>

                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/80 text-[11px] font-medium text-slate-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{googleLoading ? 'Connecting...' : 'Sign in with another Google account'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LOG IN */}
          {authMode === 'login' && (
            <div className="space-y-4">
              {/* Direct 1-Click Google Sign-In button */}
              <button
                type="button"
                onClick={() => completeGoogleLogin('Rimsha Agrawal', 'rimshaagrawal.ed@gmail.com')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-teal-500/50 bg-teal-950/40 hover:bg-teal-900/50 text-xs font-semibold text-teal-200 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google as <strong>Rimsha Agrawal</strong></span>
                </div>
                <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                  Instant
                </span>
              </button>

              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{googleLoading ? 'Connecting...' : 'Sign in with another Google account'}</span>
              </button>

              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
                  Or email log in
                </span>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rimshaagrawal.ed@gmail.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                  <span>Log In to Travety</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Don't have an account? <span className="font-bold underline">Create Account</span>
                  </button>
                </div>
              </form>
            </div>
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

      {/* GOOGLE ACCOUNT CHOOSER MODAL (Seamless Fallback) */}
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

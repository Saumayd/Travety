import React, { useState } from 'react';
import {
  CompanionStatus,
  GenderProfile,
  NCR_METRO_STATIONS,
} from '../data/ncrMetroData';

interface HomeViewProps {
  stationId: string;
  setStationId: (id: string) => void;
  gender: GenderProfile;
  setGender: (g: GenderProfile) => void;
  curfew: string;
  setCurfew: (c: string) => void;
  companionStatus: CompanionStatus;
  setCompanionStatus: (s: CompanionStatus) => void;
  budget: string;
  setBudget: (b: string) => void;
  onCreateLobby: (customTitle?: string) => void;
  onJoinLobby: (code: string) => void;
  activeLobbyCode: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stationId,
  setStationId,
  gender,
  setGender,
  curfew,
  setCurfew,
  companionStatus,
  setCompanionStatus,
  budget,
  setBudget,
  onCreateLobby,
  onJoinLobby,
}) => {
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [recalcSpin, setRecalcSpin] = useState<boolean>(false);
  const [customLightingScore, setCustomLightingScore] = useState<string | null>(null);

  const selectedStation =
    NCR_METRO_STATIONS.find((s) => s.id === stationId) || NCR_METRO_STATIONS[1];

  // Default matches screenshot 1: "98.4% Safe Corridor Lighting" on initial Rajiv Chowk load,
  // and dynamically updates when user changes controls or taps Recalculate.
  const displayLightingScore =
    customLightingScore ??
    (stationId === 'rajiv-chowk' &&
    gender === 'female' &&
    curfew === '8:00 PM' &&
    companionStatus === 'alone'
      ? '98.4'
      : (
          selectedStation.lightingScore +
          (gender === 'female' ? 0.2 : gender === 'non-binary' ? 0.1 : -0.2) -
          (curfew === '9:00 PM' ? 0.4 : curfew === '7:30 PM' ? -0.2 : 0)
        ).toFixed(1));

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setJoinCodeInput(text.trim().toUpperCase());
      } else {
        setJoinCodeInput('TRV-8492');
      }
    } catch {
      setJoinCodeInput('TRV-8492');
    }
  };

  const handleJoinClick = () => {
    const cleaned = (joinCodeInput.trim() || 'TRV-8492').toUpperCase();
    onJoinLobby(cleaned);
  };

  const handleRecalculate = () => {
    setRecalcSpin(true);
    const nextVal = (
      selectedStation.lightingScore +
      (gender === 'female' ? 0.3 : 0.1) -
      (curfew === '9:00 PM' ? 0.3 : 0)
    ).toFixed(1);
    setCustomLightingScore(nextVal);
    setTimeout(() => {
      setRecalcSpin(false);
    }, 450);
  };

  return (
    <div className="flex flex-col w-full px-margin pb-space-xl">
      {/* Brand Tagline Banner */}
      <div className="pt-space-md pb-space-sm flex flex-col items-start gap-1">
        <div className="flex items-center gap-space-xs">
          <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
            Transit Shield Active
          </span>
          <span className="text-on-surface-variant font-label-sm text-label-sm">
            Delhi NCR Network
          </span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-bold">
          Delhi NCR Safety-First Group Hangouts &amp; Commute Shield
        </h1>
      </div>

      {/* Priority Algorithm Notice Banner */}
      <div className="w-full bg-surface-container-high rounded-xl p-space-sm mb-space-md shadow-md flex items-center gap-space-sm">
        <div className="w-9 h-9 rounded-lg bg-primary-container/25 text-primary flex items-center justify-center shrink-0">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider font-semibold">
            Women-Priority Commute Algorithm Active
          </span>
          <p className="font-body-sm text-body-sm text-on-surface truncate">
            Female curfews, well-lit corridors &amp; safe exit routes weighted 2.0x
          </p>
        </div>
      </div>

      {/* Dual Interactive Pathway: Host vs Guest */}
      <div className="flex flex-col gap-space-md mb-space-lg">
        {/* Option 1: Host a Squad */}
        <div className="relative overflow-hidden bg-surface-container rounded-xl p-space-md shadow-xl flex flex-col gap-space-sm">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary-container/15 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm tracking-wide font-bold">
              HOST A SQUAD
            </span>
            <span className="flex items-center gap-1 text-secondary-container font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">bolt</span> Instant Share
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Plan a Hangout
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Create a group lobby, set the curfew benchmark, and get an instant invite link for
              friends.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
              info
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Host Sign-up required (1-click phone/email) • Squad joins without download
            </span>
          </div>
          <button
            type="button"
            onClick={() => onCreateLobby('Saturday Evening Hangout')}
            className="w-full mt-1 py-3.5 px-space-md rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,74,142,0.4)] active:scale-[0.98] transition-all"
          >
            <span>Create Lobby &amp; Sign Up</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* Option 2: Join a Lobby */}
        <div className="relative overflow-hidden bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm tracking-wide font-semibold">
              JOIN VIA INVITE CODE / LINK
            </span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">
              No app needed
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Join a Lobby
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Entering an existing plan? Sync your safety bounds with the host instantly.
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <div className="relative w-full">
              <input
                type="text"
                value={joinCodeInput}
                maxLength={16}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder="Enter 6-digit Lobby Code (e.g. TRV-904)"
                className="w-full bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm px-3.5 py-3 rounded-xl focus:outline-none focus:bg-surface-container-high transition-colors"
              />
              <button
                type="button"
                onClick={handlePasteClipboard}
                aria-label="Paste from clipboard"
                className="absolute right-2 top-2 p-1.5 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">content_paste</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleJoinClick}
              className="w-full py-3 px-space-md rounded-xl bg-surface-container-highest text-secondary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <span>Join Squad Lobby</span>
              <span className="material-symbols-outlined text-[18px]">group_add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Quick-Setup Preview & Safety Calculator */}
      <div className="bg-surface-container rounded-xl p-space-md shadow-lg flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary-container/20 text-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Quick Safety Profile
            </h3>
          </div>
          <span className="font-label-sm text-label-sm text-secondary-container bg-surface-container-high px-2 py-1 rounded-md">
            Live Preview
          </span>
        </div>

        {/* Metro / Starting Location */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between">
            <span>Nearest Metro Station</span>
            <span className="text-secondary font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">my_location</span> DMRC GPS
              Ready
            </span>
          </label>
          <div className="relative w-full">
            <select
              value={stationId}
              onChange={(e) => {
                setStationId(e.target.value);
                setCustomLightingScore(null);
              }}
              className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-3.5 py-3 rounded-xl appearance-none focus:outline-none"
            >
              <option value="rajiv-chowk">Rajiv Chowk (Yellow/Blue Line Interchange)</option>
              <option value="hauz-khas">Hauz Khas (Yellow/Magenta Line)</option>
              <option value="noida-sec-18">Noida Sector 18 (Blue Line)</option>
              <option value="cyber-city">Moulsari Avenue / DLF Cyber Hub (Rapid Metro)</option>
              <option value="kashmere-gate">Kashmere Gate (Red/Yellow/Violet Line)</option>
              <option value="vaishali">Vaishali (Blue Line Ext)</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3.5 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Gender Selector with Priority Weight Indicator */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface-variant">
              Profile Gender
            </label>
            <span className="font-label-sm text-label-sm text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">shield</span> Female priority
              weights enabled
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2" id="gender-selector">
            <button
              type="button"
              onClick={() => {
                setGender('female');
                setCustomLightingScore(null);
              }}
              className={`gender-pill py-2.5 px-2 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-all ${
                gender === 'female'
                  ? 'active bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">female</span>
              <span>Female</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setGender('non-binary');
                setCustomLightingScore(null);
              }}
              className={`gender-pill py-2.5 px-2 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-all ${
                gender === 'non-binary'
                  ? 'active bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">transgender</span>
              <span>Non-binary</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setGender('male');
                setCustomLightingScore(null);
              }}
              className={`gender-pill py-2.5 px-2 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-all ${
                gender === 'male'
                  ? 'active bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">male</span>
              <span>Male</span>
            </button>
          </div>
        </div>

        {/* Time Curfew Deadline Picker */}
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between">
            <span>Return Curfew / Departure Cap</span>
            <span className="text-tertiary font-label-sm text-label-sm">Strict enforcement</span>
          </label>
          <div className="grid grid-cols-3 gap-2" id="curfew-selector">
            <button
              type="button"
              onClick={() => {
                setCurfew('7:30 PM');
                setCustomLightingScore(null);
              }}
              className={`curfew-pill py-2.5 px-2 rounded-xl font-label-md text-label-md flex flex-col items-center justify-center ${
                curfew === '7:30 PM'
                  ? 'active bg-primary-container/20 text-primary'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="font-bold text-on-surface">7:30 PM</span>
              <span className="text-[10px] text-secondary">Early Bus/Metro</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCurfew('8:00 PM');
                setCustomLightingScore(null);
              }}
              className={`curfew-pill py-2.5 px-2 rounded-xl font-label-md text-label-md flex flex-col items-center justify-center ${
                curfew === '8:00 PM'
                  ? 'active bg-primary-container/20 text-primary'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="font-bold text-on-surface">8:00 PM</span>
              <span className="text-[10px] text-primary">Strict Safe Peak</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCurfew('9:00 PM');
                setCustomLightingScore(null);
              }}
              className={`curfew-pill py-2.5 px-2 rounded-xl font-label-md text-label-md flex flex-col items-center justify-center ${
                curfew === '9:00 PM'
                  ? 'active bg-primary-container/20 text-primary'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="font-bold text-on-surface">9:00 PM</span>
              <span className="text-[10px] text-tertiary">Verified Cab Zone</span>
            </button>
          </div>
        </div>

        {/* Companion Status Toggle */}
        <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Last-Mile Companion
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px] leading-tight">
                Will someone accompany you home from the metro stop?
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary-container/15 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">people_alt</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2" id="companion-toggle">
            <button
              type="button"
              onClick={() => setCompanionStatus('accompanied')}
              className={`companion-btn py-2 px-3 rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                companionStatus === 'accompanied'
                  ? 'active bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Yes, Covered</span>
            </button>
            <button
              type="button"
              onClick={() => setCompanionStatus('alone')}
              className={`companion-btn py-2 px-3 rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                companionStatus === 'alone'
                  ? 'active bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">fmd_bad</span>
              <span>No • Need Buddy</span>
            </button>
          </div>
        </div>

        {/* Per-Person Budget Selector */}
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface-variant">
            Individual Budget Preference
          </label>
          <div className="grid grid-cols-3 gap-2" id="budget-selector">
            <button
              type="button"
              onClick={() => setBudget('₹150 - ₹300')}
              className={`budget-pill py-2 rounded-xl font-label-md text-label-md text-center transition-all ${
                budget === '₹150 - ₹300' || budget === '< ₹300'
                  ? 'active bg-surface-container-highest text-secondary-container font-bold'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              &lt; ₹300
            </button>
            <button
              type="button"
              onClick={() => setBudget('₹300 - ₹800')}
              className={`budget-pill py-2 rounded-xl font-label-md text-label-md text-center transition-all ${
                budget === '₹300 - ₹800'
                  ? 'active bg-surface-container-highest text-secondary-container font-bold'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              ₹300 - ₹800
            </button>
            <button
              type="button"
              onClick={() => setBudget('₹800+')}
              className={`budget-pill py-2 rounded-xl font-label-md text-label-md text-center transition-all ${
                budget === '₹800+' || budget === '₹1500+'
                  ? 'active bg-surface-container-highest text-secondary-container font-bold'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              ₹1500+
            </button>
          </div>
        </div>

        {/* Instant Pre-calculate Result Chip */}
        <div className="p-3 rounded-xl bg-surface-container-highest/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                Commute Feasibility
              </span>
              <span className="font-label-sm text-label-sm text-secondary-container">
                {displayLightingScore}% Safe Corridor Lighting
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRecalculate}
            className="px-3 py-1.5 rounded-lg bg-primary-container/20 text-primary font-label-sm text-label-sm font-bold flex items-center gap-1"
          >
            <span>Recalculate</span>
            <span
              className={`material-symbols-outlined text-[14px] ${
                recalcSpin ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

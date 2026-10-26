import React, { useState } from 'react';
import {
  calculateDepartureInfo,
  CompanionStatus,
  GenderProfile,
  LobbyData,
  NCR_METRO_STATIONS,
  SquadMember,
} from '../data/ncrMetroData';

interface LobbyViewProps {
  lobby: LobbyData;
  members: SquadMember[];
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
  onSubmitPreferences: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  lobby,
  members,
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
  onSubmitPreferences,
}) => {
  const [showStationDropdown, setShowStationDropdown] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const { departureTime12h, transitMins, station } = calculateDepartureInfo(curfew, stationId);

  const handleShareLobby = async () => {
    const shareText = `🛡️ Join our Travety Safety-First Hangout Lobby "${lobby.title}"! Use Invite Code: ${lobby.code} to sync your DMRC metro station & curfew in 10 seconds.`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: lobby.title,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      }
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitPreferences();
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-margin pt-space-md pb-space-lg flex flex-col gap-space-md">
        {/* Lobby Invite Context Card */}
        <section className="bg-surface-container-high rounded-xl p-space-md shadow-xl flex flex-col gap-space-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-primary-container/10 blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-label-sm text-label-sm text-secondary tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              Live Sync Lobby
            </span>
            <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-full">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                CODE:
              </span>
              <span className="font-label-sm text-label-sm text-primary font-mono tracking-wide font-bold">
                {lobby.code}
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col">
              <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                {lobby.title}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Organized by <span className="text-on-surface font-medium">{lobby.hostName}</span> •{' '}
                {members.length} joined
              </p>
            </div>
            <button
              type="button"
              onClick={handleShareLobby}
              aria-label="Share via WhatsApp"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary hover:bg-surface-bright transition-colors shadow-sm shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">
                {copiedCode ? 'check' : 'share'}
              </span>
            </button>
          </div>

          {/* Quick Explanation Banner */}
          <div className="bg-surface-container-lowest/80 rounded-lg p-space-sm flex items-start gap-space-xs">
            <span
              className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_with_heart
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
              No account needed for guests. Input your transit details in 10 seconds to calculate
              the safest central hub and companion routes.
            </p>
          </div>
        </section>

        {/* Onboarding Form Container */}
        <form className="flex flex-col gap-space-md" onSubmit={handleFormSubmit}>
          {/* 1. Nearest Metro / Location Input */}
          <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-xs shadow-md">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">subway</span>
                1. Nearest Metro Station / Departure Point
              </label>
              <span className="font-label-sm text-label-sm text-secondary">Step 1 of 5</span>
            </div>

            <div
              onClick={() => setShowStationDropdown((prev) => !prev)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setShowStationDropdown((prev) => !prev);
              }}
              className="cursor-pointer bg-surface-container-high rounded-lg p-space-sm flex items-center justify-between gap-space-xs shadow-inner"
            >
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0">
                  pin_drop
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight">
                    {station.name}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {station.gateInfo}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className="w-2.5 h-6 rounded-full bg-tertiary shadow-sm"
                  title="Yellow Line"
                ></span>
                <span
                  className="w-2.5 h-6 rounded-full bg-primary-container shadow-sm"
                  title="Magenta Line"
                ></span>
              </div>
            </div>

            {showStationDropdown && (
              <div className="bg-surface-container-low rounded-lg p-1.5 flex flex-col gap-1 max-h-56 overflow-y-auto">
                {NCR_METRO_STATIONS.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setStationId(st.id);
                      setShowStationDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between transition-colors ${
                      st.id === stationId
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : 'hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md">{st.name}</span>
                      <span className="text-[11px] opacity-80">{st.gateInfo}</span>
                    </div>
                    <span className="font-label-sm text-label-sm">{st.transitMinsToCP}m transit</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-secondary text-[14px]">verified</span>
              <span className="font-label-sm text-label-sm text-secondary">
                {station.cisfNote}
              </span>
            </div>
          </section>

          {/* 2. Gender Selection & Weighted Safety Profile */}
          <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-sm shadow-md">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">security</span>
                2. Safety Routing Priority
              </label>
              <span className="font-label-sm text-label-sm text-secondary-fixed-dim bg-secondary-fixed-dim/10 px-2 py-0.5 rounded-full font-bold">
                Dynamic Shield
              </span>
            </div>
            <div className="grid grid-cols-3 gap-space-xs">
              {/* Female */}
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 transition-all ${
                  gender === 'female'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(255,74,142,0.35)]'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: gender === 'female' ? "'FILL' 1" : "'FILL' 0" }}
                >
                  female
                </span>
                <span className="font-label-md text-label-md font-bold">Female</span>
                <span
                  className={`font-label-sm text-label-sm px-1.5 py-0.5 rounded text-[10px] leading-tight text-center ${
                    gender === 'female'
                      ? 'bg-on-primary-container/20 text-on-primary-container'
                      : 'text-primary'
                  }`}
                >
                  1.8x Weight
                </span>
              </button>

              {/* Male */}
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 transition-all ${
                  gender === 'male'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(255,74,142,0.35)]'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">male</span>
                <span className="font-label-md text-label-md">Male</span>
                <span
                  className={`font-label-sm text-label-sm text-[10px] leading-tight ${
                    gender === 'male' ? 'text-on-primary-container' : 'text-outline'
                  }`}
                >
                  Standard
                </span>
              </button>

              {/* Non-Binary */}
              <button
                type="button"
                onClick={() => setGender('non-binary')}
                className={`rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 transition-all ${
                  gender === 'non-binary'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(255,74,142,0.35)]'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">transgender</span>
                <span className="font-label-md text-label-md">Non-Binary</span>
                <span
                  className={`font-label-sm text-label-sm text-[10px] leading-tight ${
                    gender === 'non-binary' ? 'text-on-primary-container' : 'text-secondary'
                  }`}
                >
                  1.5x Weight
                </span>
              </button>
            </div>
            {/* Explanatory Microcopy */}
            <div className="bg-surface-container-low rounded-lg p-space-sm flex items-start gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                info
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Prioritizes well-lit routes, avoids shady liquor store alleys, and locks return time
                to earlier female member curfews automatically.
              </p>
            </div>
          </section>

          {/* 3. Curfew Deadline Selection */}
          <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-sm shadow-md">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  cloud_download
                </span>
                3. Home Arrival Curfew Deadline
              </label>
              <span className="font-label-sm text-label-sm text-tertiary">Critical Anchor</span>
            </div>
            <div className="grid grid-cols-3 gap-space-xs">
              <button
                type="button"
                onClick={() => setCurfew('8:00 PM')}
                className={`rounded-lg py-2 px-1 flex flex-col items-center justify-center ${
                  curfew === '8:00 PM' || curfew === '7:30 PM'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(255,74,142,0.3)]'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="font-label-lg text-label-lg font-bold">8:00 PM</span>
                <span className="font-label-sm text-label-sm opacity-90">Strict</span>
              </button>
              <button
                type="button"
                onClick={() => setCurfew('9:30 PM')}
                className={`rounded-lg py-2 px-1 flex flex-col items-center justify-center ${
                  curfew === '9:30 PM' || curfew === '9:00 PM'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(255,74,142,0.3)]'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="font-label-lg text-label-lg">9:30 PM</span>
                <span className="font-label-sm text-label-sm opacity-70">Flexible</span>
              </button>
              <button
                type="button"
                onClick={() => setCurfew('11:00 PM')}
                className={`rounded-lg py-2 px-1 flex flex-col items-center justify-center ${
                  curfew === '11:00 PM'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(255,74,142,0.3)]'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="font-label-lg text-label-lg">11:00 PM</span>
                <span className="font-label-sm text-label-sm opacity-70">Late</span>
              </button>
            </div>
            {/* Calculated Hub Departure Note */}
            <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-[18px]">timer</span>
                <span className="font-body-sm text-body-sm text-on-surface">
                  Requires leaving hub by{' '}
                  <strong className="text-tertiary">{departureTime12h}</strong>
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {transitMins}m transit
              </span>
            </div>
          </section>

          {/* 4. Companion Status Segmented Toggle */}
          <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-sm shadow-md">
            <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">
                supervisor_account
              </span>
              4. Companion Status
            </label>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Will somebody be accompanying you on your return transit?
            </p>
            <div className="bg-surface-container-high p-1 rounded-xl flex flex-col gap-1">
              {/* Active Segment */}
              <button
                type="button"
                onClick={() => setCompanionStatus('alone')}
                className={`w-full rounded-lg p-2.5 flex items-center justify-between text-left transition-colors ${
                  companionStatus === 'alone'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(255,74,142,0.25)]'
                    : 'bg-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{
                      fontVariationSettings: companionStatus === 'alone' ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    person_pin
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-bold">
                      No, traveling alone
                    </span>
                    <span className="font-label-sm text-label-sm opacity-90">
                      Auto-pairs with squad route for safe return
                    </span>
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    companionStatus === 'alone' ? '' : 'opacity-40'
                  }`}
                >
                  {companionStatus === 'alone' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>

              {/* Inactive Segment */}
              <button
                type="button"
                onClick={() => setCompanionStatus('accompanied')}
                className={`w-full rounded-lg p-2.5 flex items-center justify-between text-left transition-colors ${
                  companionStatus === 'accompanied'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(255,74,142,0.25)]'
                    : 'bg-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md">Yes, accompanied</span>
                    <span
                      className={`font-label-sm text-label-sm ${
                        companionStatus === 'accompanied' ? 'opacity-90' : 'text-outline'
                      }`}
                    >
                      Partner/family member escorting home
                    </span>
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    companionStatus === 'accompanied' ? '' : 'opacity-40'
                  }`}
                >
                  {companionStatus === 'accompanied' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>
            </div>
          </section>

          {/* 5. Per-Person Budget */}
          <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-sm shadow-md">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                5. Per-Person Outing Budget
              </label>
              <span className="font-label-sm text-label-sm text-secondary">Balanced Hub</span>
            </div>
            <div className="grid grid-cols-3 gap-space-xs">
              <button
                type="button"
                onClick={() => setBudget('₹150 - ₹300')}
                className={`rounded-lg py-2 px-1 text-center font-label-md text-label-md ${
                  budget === '₹150 - ₹300' || budget === '< ₹300'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-[0_0_12px_rgba(0,242,209,0.3)]'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                ₹150 - ₹300
              </button>
              <button
                type="button"
                onClick={() => setBudget('₹300 - ₹800')}
                className={`rounded-lg py-2 px-1 text-center font-label-md text-label-md ${
                  budget === '₹300 - ₹800'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-[0_0_12px_rgba(0,242,209,0.3)]'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                ₹300 - ₹800
              </button>
              <button
                type="button"
                onClick={() => setBudget('₹800+')}
                className={`rounded-lg py-2 px-1 text-center font-label-md text-label-md ${
                  budget === '₹800+' || budget === '₹1500+'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-[0_0_12px_rgba(0,242,209,0.3)]'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                ₹800+
              </button>
            </div>
          </section>

          {/* Synced Squad Roster Preview */}
          <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-sm shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">sync</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface text-base">
                  Synced Squad Roster
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold">
                {members.length} Confirmed
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Live corridor nodes matching your route telemetry:
            </p>
            <div className="flex flex-col gap-space-xs">
              {members.map((member, index) => {
                const isFemale = member.gender === 'female';
                const isAccompanied = member.companionStatus === 'accompanied';
                const avatarStyle =
                  member.initials === 'TK' || index % 4 === 3
                    ? 'bg-secondary-container text-on-secondary-container'
                    : isFemale
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container text-on-surface';

                return (
                  <div
                    key={member.id}
                    className="bg-surface-container-high rounded-lg p-space-sm flex items-center justify-between gap-space-xs"
                  >
                    <div className="flex items-center gap-space-xs min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shrink-0 ${avatarStyle}`}
                      >
                        {member.initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-label-lg text-label-lg text-on-surface truncate">
                            {member.name}
                          </span>
                          <span
                            className={`material-symbols-outlined text-[14px] ${
                              isFemale ? 'text-primary' : 'text-on-surface-variant'
                            }`}
                          >
                            {member.gender === 'female'
                              ? 'female'
                              : member.gender === 'male'
                              ? 'male'
                              : 'transgender'}
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          {member.stationName}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span
                        className={`font-label-md text-label-md ${
                          member.curfewType === 'Strict'
                            ? 'text-primary font-bold'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {member.curfew} {member.curfewType}
                      </span>
                      <span
                        className={`font-label-sm text-label-sm ${
                          isAccompanied ? 'text-outline' : 'text-secondary'
                        }`}
                      >
                        {member.pairingNote}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Action Button Area */}
          <div className="pt-space-xs pb-space-sm flex flex-col gap-space-xs">
            <button
              type="submit"
              className="w-full h-14 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,74,142,0.45)] hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Submit Preferences &amp; Sync Hub</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <p className="font-label-sm text-label-sm text-center text-on-surface-variant">
              Privacy guarantee: Real-time telemetry is only shared with verified squad members.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

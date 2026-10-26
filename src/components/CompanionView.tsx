import React, { useState } from 'react';
import { calculateSquadMetrics, LobbyData, SquadMember } from '../data/ncrMetroData';

interface CompanionViewProps {
  lobby: LobbyData;
  members: SquadMember[];
  onTriggerLivePing: () => void;
}

export const CompanionView: React.FC<CompanionViewProps> = ({
  lobby,
  members,
  onTriggerLivePing,
}) => {
  const [showPingFeedback, setShowPingFeedback] = useState<boolean>(false);
  const [waBroadcastToast, setWaBroadcastToast] = useState<string | null>(null);

  const metrics = calculateSquadMetrics(members);

  const handlePingClick = () => {
    onTriggerLivePing();
    setShowPingFeedback(true);
  };

  const handleWhatsAppBroadcast = async () => {
    const message = `🚨 Travety Safe Return Sync (${lobby.code}): Departed Central Hub (${lobby.centralHub}) at ${metrics.hubDeparture12h}. Yellow & Blue Cohorts fully active with verified female escorts before ${metrics.earliestCurfew} curfew.`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Travety Safe Return Sync',
          text: message,
        });
      } else {
        await navigator.clipboard.writeText(message);
        setWaBroadcastToast('Safe Return Sync broadcast copied for WhatsApp!');
        setTimeout(() => setWaBroadcastToast(null), 3500);
      }
    } catch {
      setWaBroadcastToast('Safe Return Sync broadcast ready to share!');
      setTimeout(() => setWaBroadcastToast(null), 3500);
    }
  };

  return (
    <div className="flex flex-col w-full px-margin pb-space-lg gap-space-md">
      {/* Status & Header Bar */}
      <div className="flex flex-col gap-space-xs mt-space-sm">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_rgba(0,242,209,0.9)] animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              Weight Algorithm: Female Curfew (2.0x)
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary-container">
              schedule
            </span>{' '}
            {metrics.hubDeparture24h} Departure
          </span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight mt-1">
          Squad Companion Routes • Return Sync
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Intelligent corridor mapping prioritizing female member checkpoints &amp; safe walking
          pairings across NCR.
        </p>
      </div>

      {/* Commute Synchronization & Priority Matrix Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-md">
        <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-primary-container/10 blur-2xl pointer-events-none"></div>
        <div className="flex items-start gap-space-sm relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,74,142,0.4)]">
            <span className="material-symbols-outlined text-[22px]">lock_clock</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-md text-label-md text-primary tracking-wide uppercase">
              Return Window Sync Locked
            </span>
            <p className="font-body-md text-body-md text-on-surface mt-0.5 leading-snug font-medium">
              Return journey locked to earliest curfew:{' '}
              <span className="text-secondary font-semibold">{metrics.hubDeparture12h}</span>{' '}
              departure from Central Hub ensures all {metrics.femaleCount} female members reach home
              gates before{' '}
              <span className="text-secondary font-semibold">{metrics.earliestCurfew}</span>.
            </p>
          </div>
        </div>

        {/* Escort Matrix Pill List */}
        <div className="mt-space-md pt-space-sm flex flex-col gap-space-xs bg-surface-container/60 rounded-lg p-space-sm">
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-[15px] text-secondary">
                verified_user
              </span>{' '}
              Transit Escort Pairing
            </span>
            <span className="text-secondary-fixed">100% Interlock</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Male members (<strong className="text-on-surface font-medium">Rohan</strong>,{' '}
            <strong className="text-on-surface font-medium">Kabir</strong>) accompanying female
            squad mates along common Yellow &amp; Blue lines till terminal gates.
          </p>
        </div>
      </div>

      {/* Mini Group Hub Map Visualizer */}
      <div
        className="relative rounded-xl overflow-hidden shadow-lg h-44 flex flex-col justify-between p-space-md bg-[#110c16]"
        data-location="Connaught Place Central Hub, New Delhi"
      >
        {/* Subtle Vector Metro Ring Background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
          viewBox="0 0 400 180"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle
            cx="200"
            cy="90"
            r="65"
            fill="none"
            stroke="#ffb1c5"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="200" cy="90" r="35" fill="none" stroke="#00f2d1" strokeWidth="1.5" />
          <line x1="20" y1="90" x2="380" y2="90" stroke="#00f2d1" strokeWidth="3" opacity="0.6" />
          <line x1="200" y1="0" x2="200" y2="180" stroke="#ffb86b" strokeWidth="3" opacity="0.6" />
          <circle cx="200" cy="90" r="7" fill="#ff4a8e" />
        </svg>

        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent z-10"></div>
        <div className="relative z-20 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest/80 backdrop-blur-md text-secondary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[14px]">share_location</span> Live
            Cohort Node
          </span>
          <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold shadow-sm">
            {lobby.activePings} Active Pings
          </span>
        </div>
        <div className="relative z-20 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Rendezvous Zone
            </p>
            <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              {lobby.centralHub}
            </p>
          </div>
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
              T
            </div>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-primary-container text-on-primary-container flex items-center justify-center font-label-sm text-label-sm font-bold">
              D
            </div>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-sm text-label-sm font-bold">
              P
            </div>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-surface-bright text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">
              +{Math.max(2, members.length - 2)}
            </div>
          </div>
        </div>
      </div>

      {/* Paired Common Routes & Transit Escort Groups */}
      <div className="flex flex-col gap-space-sm mt-space-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Escort Cohort Corridors
          </h2>
          <span className="font-label-sm text-label-sm text-secondary">2 Sub-Groups Synced</span>
        </div>

        {/* Cohort 1: Yellow Line */}
        <div className="rounded-xl bg-surface-container p-space-md shadow-md flex flex-col gap-space-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold font-label-md text-label-md">
                YL
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface font-semibold">
                  Yellow Line Cohort
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  3 Friends: Tanya, Diya, Kabir
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">shield</span> 7 Stops Sync
            </span>
          </div>

          {/* Segment Trail */}
          <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
            <div className="flex items-center gap-2 text-on-surface font-label-md text-label-md">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
              <span>Central Hub</span>
              <span className="material-symbols-outlined text-[14px] text-outline">
                arrow_forward
              </span>
              <span>Kashmere Gate</span>
              <span className="material-symbols-outlined text-[14px] text-outline">
                arrow_forward
              </span>
              <span className="text-primary font-semibold">GTB Nagar</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 pt-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                supervised_user_circle
              </span>
              Common travel distance: 7 metro stations shared together.
            </p>
          </div>

          {/* Accompaniment Detail Note */}
          <div className="rounded-lg bg-surface-container-highest/50 p-space-sm flex items-start gap-space-xs">
            <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">
              near_me
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold">
                Terminal Escort Action
              </span>
              <p className="font-body-sm text-body-sm text-on-surface leading-tight mt-0.5">
                Kabir &amp; Tanya walk together until Gate 3 auto stand. Pass by{' '}
                <strong className="text-secondary font-medium">Pink Saheli Booth #12</strong> with
                CCTV perimeter coverage.
              </p>
            </div>
          </div>
        </div>

        {/* Cohort 2: Blue Line */}
        <div className="rounded-xl bg-surface-container p-space-md shadow-md flex flex-col gap-space-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center font-bold font-label-md text-label-md">
                BL
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface font-semibold">
                  Blue Line Cohort
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  2 Friends: Priya &amp; Rohan
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> 100%
              Escorted
            </span>
          </div>

          {/* Segment Trail */}
          <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
            <div className="flex items-center gap-2 text-on-surface font-label-md text-label-md overflow-x-auto whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
              <span>Central Hub</span>
              <span className="material-symbols-outlined text-[14px] text-outline">
                arrow_forward
              </span>
              <span>Mandi House</span>
              <span className="material-symbols-outlined text-[14px] text-outline">
                arrow_forward
              </span>
              <span>Mayur Vihar</span>
              <span className="material-symbols-outlined text-[14px] text-outline">
                arrow_forward
              </span>
              <span className="text-primary font-semibold">Noida Sec 18</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 pt-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                transfer_within_a_station
              </span>
              Synchronized platform transition at Mandi House Interchange.
            </p>
          </div>

          {/* Accompaniment Detail Note */}
          <div className="rounded-lg bg-surface-container-highest/50 p-space-sm flex items-start gap-space-xs">
            <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">
              local_police
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold">
                Safe Arrival Protocol
              </span>
              <p className="font-body-sm text-body-sm text-on-surface leading-tight mt-0.5">
                Shared ride until Noida Sec 18; Priya is escorted to lit booth by{' '}
                <strong className="text-secondary font-medium">7:48 PM</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Safety Audit Module */}
      <div className="flex flex-col gap-space-xs mt-space-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Route Safety Audit</h2>
          <span className="font-label-sm text-label-sm text-secondary-fixed flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">wb_incandescent</span> 99% Lit
            Rating
          </span>
        </div>
        <div className="rounded-xl bg-surface-container-low p-space-md shadow-md flex flex-col gap-space-sm">
          <div className="flex items-start gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-tertiary/15 text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">alt_route</span>
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-label-md text-label-md text-tertiary font-semibold uppercase">
                Dynamic Hazard Avoidance Applied
              </span>
              <p className="font-body-sm text-body-sm text-on-surface mt-1 leading-snug">
                Avoiding Govindpuri wine shop bypass →{' '}
                <span className="text-secondary font-medium">Routed via lit CISF corridor</span> (+3
                mins, 99% safety rating).
              </p>
            </div>
          </div>

          {/* Comparative Metrics Bento */}
          <div className="grid grid-cols-2 gap-space-xs mt-1">
            <div className="rounded-lg bg-surface-container p-space-sm flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Luminosity
                </span>
                <span className="material-symbols-outlined text-secondary text-[16px]">
                  lightbulb
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                94 Lux
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                100% LED Active
              </span>
            </div>
            <div className="rounded-lg bg-surface-container p-space-sm flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Safe Havens
                </span>
                <span className="material-symbols-outlined text-primary-container text-[16px]">
                  storefront
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                6 Booths
              </span>
              <span className="font-label-sm text-label-sm text-primary font-medium">
                Every 220m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Curfew Visual Progress Bar */}
      <div className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              timelapse
            </span>
            Curfew Buffer Countdown
          </span>
          <span className="font-label-sm text-label-sm text-secondary font-bold">
            {metrics.bufferMins} Mins Remaining
          </span>
        </div>
        {/* Custom Multi-segment Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden flex my-1">
          <div
            className="h-full bg-secondary-container w-[65%]"
            title="Shared Transit (Hub to Interchanges)"
          ></div>
          <div className="h-full bg-primary-container w-[25%]" title="Last-Mile Escort"></div>
          <div className="h-full bg-surface-bright w-[10%]" title="Buffer Before Curfew"></div>
        </div>
        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span> Shared Metro
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span> Terminal Escort
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-surface-bright"></span> Buffer
          </span>
        </div>
      </div>

      {/* Bottom Action Bar / Squad Ping & WhatsApp Broadcast */}
      <div className="sticky bottom-2 z-30 pt-space-xs flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs">
          {/* Quick WhatsApp Broadcast Button */}
          <button
            type="button"
            id="whatsappSyncBtn"
            onClick={handleWhatsAppBroadcast}
            className="flex-1 min-h-[50px] rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface px-space-md flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-secondary text-[22px]">
              send_to_mobile
            </span>
            <span className="font-label-md text-label-md font-semibold">
              Broadcast via WhatsApp
            </span>
          </button>

          {/* Emergency Squad Ping Pill */}
          <button
            type="button"
            id="squadPingBtn"
            onClick={handlePingClick}
            className="min-h-[50px] px-space-md rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,74,142,0.45)] hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px] font-bold animate-ping">
              sensors
            </span>
            <span className="font-label-md text-label-md font-bold whitespace-nowrap">
              Live Ping
            </span>
          </button>
        </div>

        {/* Feedback Banner (Interactive Confirmation) */}
        {showPingFeedback && (
          <div
            id="pingFeedback"
            className="rounded-lg bg-surface-container-highest px-space-md py-2 flex items-center justify-between shadow-sm"
          >
            <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span> Live GPS
              ping shared with Tanya, Diya, Priya, Rohan &amp; Kabir.
            </span>
            <button
              type="button"
              id="dismissFeedback"
              onClick={() => setShowPingFeedback(false)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {waBroadcastToast && (
          <div className="rounded-lg bg-surface-container-highest px-space-md py-2 flex items-center justify-between shadow-sm">
            <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">share</span>{' '}
              {waBroadcastToast}
            </span>
            <button
              type="button"
              onClick={() => setWaBroadcastToast(null)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';

export const SafeMapView: React.FC = () => {
  const [avoidDimLit, setAvoidDimLit] = useState<boolean>(true);
  const [avoidLiquor, setAvoidLiquor] = useState<boolean>(true);
  const [showSaheli, setShowSaheli] = useState<boolean>(true);
  const [cisfOnly, setCisfOnly] = useState<boolean>(false);
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);

  // Dynamically compute route confidence based on active safety filters
  const confidenceScore =
    91 +
    (avoidDimLit ? 3 : -6) +
    (avoidLiquor ? 3 : -8) +
    (showSaheli ? 0 : -2) +
    (cisfOnly ? 2 : 0);

  return (
    <div className="flex flex-col w-full pb-6 space-y-4">
      {/* Dynamic Spatial Filter Strip */}
      <div className="px-margin flex flex-col space-y-2 pt-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container shadow-[0_0_10px_rgba(0,242,209,0.8)]"></span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Vigilance Radar: South-Central Delhi
            </h2>
          </div>
          <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-high text-secondary">
            DMRC LIVE SYNC
          </span>
        </div>

        {/* Scrollable Toggle Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar">
          <button
            type="button"
            id="toggle-dimlit"
            onClick={() => setAvoidDimLit((prev) => !prev)}
            className={`filter-pill flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-label-md text-label-md transition-all shrink-0 shadow-md ${
              avoidDimLit
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {avoidDimLit ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span>Avoid Dim-Lit Roads</span>
          </button>

          <button
            type="button"
            id="toggle-liquor"
            onClick={() => setAvoidLiquor((prev) => !prev)}
            className={`filter-pill flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-label-md text-label-md transition-all shrink-0 shadow-md ${
              avoidLiquor
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {avoidLiquor ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span>Avoid Liquor Clusters</span>
          </button>

          <button
            type="button"
            id="toggle-saheli"
            onClick={() => setShowSaheli((prev) => !prev)}
            className={`filter-pill flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-label-md text-label-md transition-all shrink-0 shadow-md ${
              showSaheli
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span>Pink Saheli Booths</span>
          </button>

          <button
            type="button"
            id="toggle-curfew"
            onClick={() => setCisfOnly((prev) => !prev)}
            className={`filter-pill flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-label-md text-label-md transition-all shrink-0 ${
              cisfOnly
                ? 'bg-primary-container text-on-primary-container shadow-md'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>CISF Corridors Only</span>
          </button>
        </div>
      </div>

      {/* Interactive Vector Map Surface Layer */}
      <div className="relative mx-margin rounded-xl bg-surface-container-lowest overflow-hidden shadow-xl min-h-[350px]">
        {/* Vector Metro & Safety Topology Map Component */}
        <div className="relative w-full h-[370px] bg-[#0c0813] select-none overflow-hidden">
          {/* Dark Grid Substrate */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 28 0 L 0 0 0 28"
                  fill="none"
                  stroke="#ffb1c5"
                  strokeDasharray="1 3"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>

          {/* SVG Corridors and Danger Patches */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 380 370"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="hazardHatch"
                width="8"
                height="8"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="8"
                  stroke="#ffb4ab"
                  strokeWidth="2.5"
                  opacity="0.35"
                />
              </pattern>
              <filter id="neonGlowMint" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="4"
                  floodColor="#00f2d1"
                  floodOpacity="0.8"
                />
              </filter>
              <filter id="neonGlowPink" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="5"
                  floodColor="#ff4a8e"
                  floodOpacity="0.85"
                />
              </filter>
            </defs>

            {/* Unsafe / High Density Crime Risk Zone Polygon (Karol Bagh / Outer Ring Road segment) */}
            <g
              id="hazard-zone-outer"
              className="transition-opacity duration-300"
              style={{ opacity: avoidLiquor ? 1 : 0.1 }}
            >
              <polygon points="12,185 105,170 120,245 40,270" fill="url(#hazardHatch)" />
              <polygon points="12,185 105,170 120,245 40,270" fill="#93000a" opacity="0.25" />
              <circle cx="65" cy="215" r="45" fill="#ffb4ab" opacity="0.08" />
            </g>

            {/* Dim-Lit Secondary Alleys Overlay */}
            <g
              id="dimlit-stretches"
              className="transition-opacity duration-300"
              style={{ opacity: avoidDimLit ? 1 : 0.2 }}
            >
              <path
                d="M 28 85 Q 90 98 128 135"
                fill="none"
                stroke="#ffb86b"
                strokeWidth="3"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              <path
                d="M 80 280 L 140 330"
                fill="none"
                stroke="#ffb86b"
                strokeWidth="3"
                strokeDasharray="3 3"
                opacity="0.8"
              />
            </g>

            {/* Verified CISF & Delhi Police Illuminated Blue/Violet Metro Arteries */}
            {/* Blue Line: Mandi House -> Rajiv Chowk */}
            <path
              d="M 60 70 L 190 120 L 320 180"
              fill="none"
              stroke="#00dfc1"
              strokeWidth={cisfOnly ? '6.5' : '5'}
              strokeLinecap="round"
              filter="url(#neonGlowMint)"
            />
            {/* Violet Line: Mandi House -> Central Secretariat */}
            <path
              d="M 190 120 L 220 220 L 260 310"
              fill="none"
              stroke="#ff4a8e"
              strokeWidth={cisfOnly ? '6.5' : '5'}
              strokeLinecap="round"
              filter="url(#neonGlowPink)"
            />
            {/* Intersecting Safe Corridor (Barakhamba corridor pedestrian link) */}
            <path
              d="M 190 120 L 310 95"
              fill="none"
              stroke="#c7fff0"
              strokeWidth="3.5"
              strokeDasharray="6 3"
              strokeLinecap="round"
            />

            {/* Metro Stations Nodes */}
            <circle
              cx="190"
              cy="120"
              r="7"
              fill="#eadfee"
              stroke="#17111c"
              strokeWidth="2.5"
              className="cursor-pointer"
              onClick={() =>
                setSelectedMapNode(
                  'Mandi House Interchange: Blue & Violet Line • 100% Lit Concourse • Pink Saheli #12 Active'
                )
              }
            />
            <circle
              cx="320"
              cy="180"
              r="5"
              fill="#eadfee"
              stroke="#17111c"
              strokeWidth="2"
              className="cursor-pointer"
              onClick={() =>
                setSelectedMapNode('Rajiv Chowk Central Hub: Gate 7 Rendezvous • CISF QRT Deployed')
              }
            />
            <circle
              cx="220"
              cy="220"
              r="5.5"
              fill="#eadfee"
              stroke="#17111c"
              strokeWidth="2"
              className="cursor-pointer"
              onClick={() =>
                setSelectedMapNode('Janpath Station: DMRC Helpdesk & Verified Cab Zone Active')
              }
            />
            <circle
              cx="260"
              cy="310"
              r="5"
              fill="#eadfee"
              stroke="#17111c"
              strokeWidth="2"
              className="cursor-pointer"
              onClick={() =>
                setSelectedMapNode('Central Secretariat: Violet/Yellow Interchange • 99% Lit')
              }
            />
            <circle
              cx="60"
              cy="70"
              r="5"
              fill="#ffb4ab"
              stroke="#17111c"
              strokeWidth="2"
              className="cursor-pointer"
              onClick={() =>
                setSelectedMapNode(
                  'Karol Bagh Link (Rejected): 3 unlit transfer alleys & liquor vend proximity'
                )
              }
            />
          </svg>

          {/* Absolute HUD Markers & Warning Tags */}
          {/* Avoided Dim-Lit Tag */}
          {avoidDimLit && (
            <div
              id="badge-dimlit"
              onClick={() =>
                setSelectedMapNode(
                  'Dim-Lit Stretch Bypassed: Rerouted squad via illuminated Barakhamba Road concourse'
                )
              }
              className="cursor-pointer absolute top-16 left-3 bg-surface-container-high rounded-lg px-2.5 py-1.5 shadow-md flex items-center space-x-1.5 pointer-events-auto"
            >
              <span className="material-symbols-outlined text-tertiary text-[16px]">
                report_problem
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-tertiary">Dim-Lit Stretch</span>
                <span className="text-[10px] text-on-surface-variant leading-tight">
                  Lane bypassed
                </span>
              </div>
            </div>
          )}

          {/* Wine/Beer Shop Red Cluster Badge */}
          {avoidLiquor && (
            <div
              id="badge-liquor"
              onClick={() =>
                setSelectedMapNode(
                  'Theka Cluster Blocked: Ring Rd late-night liquor vend zone excluded from female walking paths'
                )
              }
              className="cursor-pointer absolute bottom-28 left-4 bg-error-container text-on-error-container rounded-lg px-2.5 py-1.5 shadow-lg flex items-center space-x-1.5"
            >
              <span className="material-symbols-outlined text-error text-[18px]">block</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm font-bold">
                  Theka Cluster Blocked
                </span>
                <span className="text-[10px] text-on-error-container opacity-90 leading-tight">
                  Ring Rd Outlet avoided
                </span>
              </div>
            </div>
          )}

          {/* Safe Pink Saheli Hub Pulse 1 (Mandi House Interchange) */}
          {showSaheli && (
            <div
              onClick={() =>
                setSelectedMapNode(
                  'Pink Saheli Booth #12: Staffed by female Delhi Police personnel with direct CCTV feed'
                )
              }
              className="cursor-pointer absolute top-[88px] left-[175px] -translate-x-1/2 flex flex-col items-center"
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-primary-container opacity-75"></span>
                <div className="relative w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_14px_rgba(255,74,142,0.9)]">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_police
                  </span>
                </div>
              </div>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm shadow flex items-center space-x-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                <span>Pink Saheli #12</span>
              </div>
            </div>
          )}

          {/* Safe Pink Saheli Hub Pulse 2 (Janpath Corridor) */}
          {showSaheli && (
            <div
              onClick={() =>
                setSelectedMapNode('DMRC Helpdesk (Janpath): 24/7 verified escort & emergency phone')
              }
              className="cursor-pointer absolute top-[188px] left-[208px] flex items-center space-x-1 bg-surface-container-high px-2 py-1 rounded-full shadow-md"
            >
              <span
                className="material-symbols-outlined text-primary text-[15px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
              <span className="font-label-sm text-label-sm text-on-surface">DMRC Helpdesk</span>
            </div>
          )}

          {/* Verified Corridor Neon Badge */}
          <div className="absolute top-3 right-3 bg-surface-container/90 rounded-lg px-3 py-1.5 shadow-md flex items-center space-x-2">
            <span className="material-symbols-outlined text-secondary-container text-[18px]">
              verified
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">
                CISF Corridors
              </span>
              <span className="text-[10px] text-on-surface-variant">Gate 2 &amp; 4 Active</span>
            </div>
          </div>

          {/* Realtime Footfall Status Bar Overlay */}
          <div className="absolute bottom-2 inset-x-2 bg-surface-container-low/95 rounded-lg px-3 py-2 flex items-center justify-between text-on-surface">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-secondary-container text-[18px]">
                footprint
              </span>
              <span className="font-label-md text-label-md truncate">
                {selectedMapNode || 'Station Crowd: Verified Steady'}
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-mono shrink-0 ml-2">
              11:42 PM IST
            </span>
          </div>
        </div>
      </div>

      {/* Route Recommendation Engine Result Card */}
      <div className="px-margin flex flex-col space-y-3">
        {/* Primary Algorithmic Pick Card */}
        <div className="rounded-xl bg-surface-container p-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span
                  className="material-symbols-outlined text-secondary-container text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider">
                  Top Safety Recommendation
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                Mandi House • CP Safe Corridor
              </h3>
            </div>
            {/* Safety Confidence Meter */}
            <div className="flex flex-col items-end">
              <div className="flex items-baseline space-x-0.5">
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary-container font-bold">
                  {confidenceScore}
                </span>
                <span className="font-label-md text-label-md text-primary font-bold">%</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Confidence
              </span>
            </div>
          </div>

          {/* Quick Telemetry Points */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="rounded-lg bg-surface-container-low p-2.5 flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary-container">
                <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface">
                  100% Illumination
                </span>
                <span className="text-[11px] text-on-surface-variant leading-none">
                  No dark pockets
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-surface-container-low p-2.5 flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[16px]">local_police</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface">3 Pink Booths</span>
                <span className="text-[11px] text-on-surface-variant leading-none">
                  Station exits 1, 2, 4
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-surface-container-low p-2.5 flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary-container">
                <span className="material-symbols-outlined text-[16px]">
                  transfer_within_a_station
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface">0 Isolated Hubs</span>
                <span className="text-[11px] text-on-surface-variant leading-none">
                  Direct wide concourse
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-surface-container-low p-2.5 flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[16px]">no_drinks</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface">
                  Zero Theka Proximity
                </span>
                <span className="text-[11px] text-on-surface-variant leading-none">
                  No liquor vends &gt; 800m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Comparison Drawer: Rejected Alternative */}
        <div className="rounded-xl bg-surface-container-low p-3.5 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-error text-[18px]">cancel</span>
              <span className="font-label-md text-label-md text-on-surface">
                Rejected Alternative: Karol Bagh Link
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-error font-mono">Score 41%</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Filtered out automatically due to 3 unlit transfer alleys and an active late-night
            liquor vend cluster near Gate 3. Bypassing this hub adds 4 minutes transit but
            guarantees monitored transit corridors.
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-sm text-label-sm">
              ⚠️ 3 Unlit Alleys
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container text-error font-label-sm text-label-sm">
              🛑 High Liquor Density
            </span>
          </div>
        </div>

        {/* Delhi Police & Rapid Response Quick Link Banner */}
        <a
          href="tel:1091"
          className="rounded-xl bg-surface-container-high p-3 flex items-center justify-between hover:bg-surface-bright transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface">
                Pink Patrol Saheli Hotline
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Active DMRC Escort Desk • Connaught Place Sector
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-secondary font-label-md text-label-md">
            <span>Dial 1091</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </div>
        </a>
      </div>
    </div>
  );
};

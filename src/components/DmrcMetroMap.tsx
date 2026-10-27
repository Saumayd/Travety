import React, { useMemo, useState } from 'react';
import {
  AppMode,
  calculateParticipantSchedule,
  HubRecommendation,
  SquadMember,
} from '../data/ncrMetroData';

export type DmrcLineId = 'blue' | 'yellow' | 'red' | 'pink' | 'magenta';

export interface DmrcStation {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  lines: DmrcLineId[];
  isInterchange?: boolean;
  hubId?: string;
  pinkSaheliBooth?: boolean;
  labelPos?: 'top' | 'bottom' | 'left' | 'right';
}

export interface DmrcEdge {
  from: string;
  to: string;
  line: DmrcLineId;
  mins: number;
}

export const DMRC_LINE_META: Record<
  DmrcLineId,
  { name: string; color: string; darkColor: string; badgeBg: string }
> = {
  blue: {
    name: 'Blue Line',
    color: '#2563eb',
    darkColor: '#3b82f6',
    badgeBg: 'bg-blue-600 text-white',
  },
  yellow: {
    name: 'Yellow Line',
    color: '#eab308',
    darkColor: '#facc15',
    badgeBg: 'bg-amber-500 text-slate-950',
  },
  red: {
    name: 'Red Line',
    color: '#dc2626',
    darkColor: '#ef4444',
    badgeBg: 'bg-red-600 text-white',
  },
  pink: {
    name: 'Pink Line',
    color: '#db2777',
    darkColor: '#ec4899',
    badgeBg: 'bg-pink-600 text-white',
  },
  magenta: {
    name: 'Magenta Line',
    color: '#9333ea',
    darkColor: '#a855f7',
    badgeBg: 'bg-purple-600 text-white',
  },
};

export const DMRC_STATIONS: DmrcStation[] = [
  // Blue Line (West to East)
  {
    id: 'dwarka-sec-21',
    name: 'Dwarka Sector 21',
    shortName: 'Dwarka Sec 21',
    x: 55,
    y: 250,
    lines: ['blue'],
    labelPos: 'bottom',
  },
  {
    id: 'dwarka-mor',
    name: 'Dwarka Mor (NSUT Gate)',
    shortName: 'Dwarka Mor',
    x: 110,
    y: 230,
    lines: ['blue'],
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'nsut-nawada',
    name: 'NSUT / Nawada Campus Station',
    shortName: 'NSUT (Dwarka)',
    x: 165,
    y: 210,
    lines: ['blue'],
    hubId: 'nsut-dwarka',
    pinkSaheliBooth: true,
    labelPos: 'top',
  },
  {
    id: 'janakpuri-west',
    name: 'Janakpuri West',
    shortName: 'Janakpuri W',
    x: 225,
    y: 192,
    lines: ['blue', 'magenta'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'top',
  },
  {
    id: 'rajouri-garden',
    name: 'Rajouri Garden',
    shortName: 'Rajouri Garden',
    x: 290,
    y: 174,
    lines: ['blue', 'pink'],
    isInterchange: true,
    labelPos: 'top',
  },
  {
    id: 'karol-bagh',
    name: 'Karol Bagh',
    shortName: 'Karol Bagh',
    x: 365,
    y: 162,
    lines: ['blue'],
    labelPos: 'top',
  },
  {
    id: 'rajiv-chowk',
    name: 'Rajiv Chowk Central Interchange',
    shortName: 'Rajiv Chowk',
    x: 445,
    y: 162,
    lines: ['blue', 'yellow'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'mandi-house',
    name: 'Mandi House',
    shortName: 'Mandi House',
    x: 530,
    y: 162,
    lines: ['blue'],
    labelPos: 'top',
  },
  {
    id: 'noida-sec-18',
    name: 'Noida Sector 18',
    shortName: 'Noida Sec 18',
    x: 620,
    y: 178,
    lines: ['blue'],
    labelPos: 'bottom',
  },

  // Yellow Line (North to South)
  {
    id: 'vishwavidyalaya',
    name: 'Vishwavidyalaya (North Campus)',
    shortName: 'Vishwavidyalaya',
    x: 425,
    y: 34,
    lines: ['yellow'],
    pinkSaheliBooth: true,
    labelPos: 'right',
  },
  {
    id: 'civil-lines',
    name: 'Civil Lines',
    shortName: 'Civil Lines',
    x: 438,
    y: 62,
    lines: ['yellow'],
    labelPos: 'right',
  },
  {
    id: 'igdtuw-kashmere',
    name: 'Kashmere Gate (IGDTUW Campus)',
    shortName: 'IGDTUW (Kashmere Gate)',
    x: 452,
    y: 96,
    lines: ['yellow', 'red'],
    isInterchange: true,
    hubId: 'igdtuw-kashmere',
    pinkSaheliBooth: true,
    labelPos: 'right',
  },
  {
    id: 'chandni-chowk',
    name: 'Chandni Chowk',
    shortName: 'Chandni Chowk',
    x: 448,
    y: 128,
    lines: ['yellow'],
    labelPos: 'right',
  },
  {
    id: 'ina-market',
    name: 'Dilli Haat - INA',
    shortName: 'INA',
    x: 442,
    y: 222,
    lines: ['yellow', 'pink'],
    isInterchange: true,
    labelPos: 'right',
  },
  {
    id: 'hauz-khas',
    name: 'Hauz Khas',
    shortName: 'Hauz Khas',
    x: 438,
    y: 272,
    lines: ['yellow', 'magenta'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },

  // Red Line (North-West to Kashmere Gate)
  {
    id: 'rohini-sec-18',
    name: 'Rohini Sector 18',
    shortName: 'Rohini Sec 18',
    x: 205,
    y: 52,
    lines: ['red'],
    labelPos: 'top',
  },
  {
    id: 'nsp',
    name: 'Netaji Subhash Place',
    shortName: 'NSP',
    x: 295,
    y: 74,
    lines: ['red', 'pink'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'top',
  },
  {
    id: 'tis-hazari',
    name: 'Tis Hazari',
    shortName: 'Tis Hazari',
    x: 378,
    y: 86,
    lines: ['red'],
    labelPos: 'top',
  },

  // Magenta Line (Janakpuri West to Hauz Khas)
  {
    id: 'palam',
    name: 'Palam / IGI T1',
    shortName: 'Palam',
    x: 275,
    y: 252,
    lines: ['magenta'],
    labelPos: 'bottom',
  },
  {
    id: 'iit-delhi',
    name: 'IIT Delhi / Munirka',
    shortName: 'IIT Delhi',
    x: 358,
    y: 272,
    lines: ['magenta'],
    labelPos: 'bottom',
  },
];

export const DMRC_EDGES: DmrcEdge[] = [
  // Blue Line
  { from: 'dwarka-sec-21', to: 'dwarka-mor', line: 'blue', mins: 6 },
  { from: 'dwarka-mor', to: 'nsut-nawada', line: 'blue', mins: 4 },
  { from: 'nsut-nawada', to: 'janakpuri-west', line: 'blue', mins: 6 },
  { from: 'janakpuri-west', to: 'rajouri-garden', line: 'blue', mins: 7 },
  { from: 'rajouri-garden', to: 'karol-bagh', line: 'blue', mins: 9 },
  { from: 'karol-bagh', to: 'rajiv-chowk', line: 'blue', mins: 6 },
  { from: 'rajiv-chowk', to: 'mandi-house', line: 'blue', mins: 5 },
  { from: 'mandi-house', to: 'noida-sec-18', line: 'blue', mins: 16 },

  // Yellow Line
  { from: 'vishwavidyalaya', to: 'civil-lines', line: 'yellow', mins: 4 },
  { from: 'civil-lines', to: 'igdtuw-kashmere', line: 'yellow', mins: 4 },
  { from: 'igdtuw-kashmere', to: 'chandni-chowk', line: 'yellow', mins: 3 },
  { from: 'chandni-chowk', to: 'rajiv-chowk', line: 'yellow', mins: 6 },
  { from: 'rajiv-chowk', to: 'ina-market', line: 'yellow', mins: 10 },
  { from: 'ina-market', to: 'hauz-khas', line: 'yellow', mins: 7 },

  // Red Line
  { from: 'rohini-sec-18', to: 'nsp', line: 'red', mins: 8 },
  { from: 'nsp', to: 'tis-hazari', line: 'red', mins: 9 },
  { from: 'tis-hazari', to: 'igdtuw-kashmere', line: 'red', mins: 4 },

  // Pink Line
  { from: 'nsp', to: 'rajouri-garden', line: 'pink', mins: 9 },
  { from: 'rajouri-garden', to: 'ina-market', line: 'pink', mins: 14 },

  // Magenta Line
  { from: 'janakpuri-west', to: 'palam', line: 'magenta', mins: 8 },
  { from: 'palam', to: 'iit-delhi', line: 'magenta', mins: 11 },
  { from: 'iit-delhi', to: 'hauz-khas', line: 'magenta', mins: 4 },
];

export function resolveMemberStationId(locationText: string): string {
  const lower = (locationText || '').toLowerCase();
  if (lower.includes('dwarka mor')) return 'dwarka-mor';
  if (lower.includes('sec 21') || lower.includes('sector 21')) return 'dwarka-sec-21';
  if (lower.includes('nsut') || lower.includes('dwarka') || lower.includes('nawada'))
    return 'nsut-nawada';
  if (lower.includes('janakpuri')) return 'janakpuri-west';
  if (lower.includes('rajouri')) return 'rajouri-garden';
  if (lower.includes('karol bagh')) return 'karol-bagh';
  if (lower.includes('civil lines')) return 'civil-lines';
  if (lower.includes('vishwavidyalaya') || lower.includes('north campus'))
    return 'vishwavidyalaya';
  if (lower.includes('igdtuw') || lower.includes('kashmere')) return 'igdtuw-kashmere';
  if (lower.includes('rohini')) return 'rohini-sec-18';
  if (lower.includes('nsp') || lower.includes('pitampura') || lower.includes('subhash'))
    return 'nsp';
  if (lower.includes('hauz khas') || lower.includes('sda')) return 'hauz-khas';
  if (lower.includes('iit') || lower.includes('munirka')) return 'iit-delhi';
  if (lower.includes('ina') || lower.includes('south ex') || lower.includes('lajpat'))
    return 'ina-market';
  if (lower.includes('noida')) return 'noida-sec-18';
  if (lower.includes('mandi house')) return 'mandi-house';
  if (lower.includes('rajiv') || lower.includes('connaught')) return 'rajiv-chowk';
  return 'janakpuri-west';
}

export interface ComputedTransitRoute {
  memberId: string;
  memberName: string;
  initials: string;
  isCurrentUser: boolean;
  homeStation: DmrcStation;
  hubStation: DmrcStation;
  stationPath: DmrcStation[];
  linesUsed: DmrcLineId[];
  interchanges: string[];
  totalMins: number;
  stopsCount: number;
  leaveByTime: string;
  curfewFormatted: string;
}

export function findShortestDmrcPath(
  startId: string,
  targetId: string
): { stationIds: string[]; linesUsed: DmrcLineId[]; interchanges: string[]; totalMins: number } {
  if (startId === targetId) {
    const st = DMRC_STATIONS.find((s) => s.id === startId);
    return {
      stationIds: [startId],
      linesUsed: st ? [st.lines[0]] : ['blue'],
      interchanges: [],
      totalMins: 5,
    };
  }

  const adj: Record<string, { to: string; line: DmrcLineId; mins: number }[]> = {};
  DMRC_STATIONS.forEach((s) => {
    adj[s.id] = [];
  });
  DMRC_EDGES.forEach((e) => {
    adj[e.from]?.push({ to: e.to, line: e.line, mins: e.mins });
    adj[e.to]?.push({ to: e.from, line: e.line, mins: e.mins });
  });

  interface QueueNode {
    current: string;
    path: string[];
    edgeLines: DmrcLineId[];
    mins: number;
  }

  const queue: QueueNode[] = [{ current: startId, path: [startId], edgeLines: [], mins: 0 }];
  const bestCost: Record<string, number> = { [startId]: 0 };
  let bestResult: QueueNode | null = null;

  while (queue.length > 0) {
    queue.sort((a, b) => a.mins - b.mins);
    const node = queue.shift()!;

    if (node.current === targetId) {
      bestResult = node;
      break;
    }

    for (const neighbor of adj[node.current] || []) {
      if (node.path.includes(neighbor.to)) continue;
      const prevLine = node.edgeLines[node.edgeLines.length - 1];
      const transferPenalty = prevLine && prevLine !== neighbor.line ? 4 : 0;
      const nextMins = node.mins + neighbor.mins + transferPenalty;

      if (bestCost[neighbor.to] === undefined || nextMins <= bestCost[neighbor.to] + 4) {
        bestCost[neighbor.to] = nextMins;
        queue.push({
          current: neighbor.to,
          path: [...node.path, neighbor.to],
          edgeLines: [...node.edgeLines, neighbor.line],
          mins: nextMins,
        });
      }
    }
  }

  if (!bestResult) {
    return {
      stationIds: [startId, targetId],
      linesUsed: ['blue'],
      interchanges: [],
      totalMins: 25,
    };
  }

  const uniqueLines: DmrcLineId[] = [];
  const interchanges: string[] = [];

  bestResult.edgeLines.forEach((line, idx) => {
    if (!uniqueLines.includes(line)) {
      uniqueLines.push(line);
    }
    if (idx > 0 && bestResult!.edgeLines[idx - 1] !== line) {
      const transferStationId = bestResult!.path[idx];
      const st = DMRC_STATIONS.find((s) => s.id === transferStationId);
      if (st && !interchanges.includes(st.shortName)) {
        interchanges.push(st.shortName);
      }
    }
  });

  return {
    stationIds: bestResult.path,
    linesUsed: uniqueLines,
    interchanges,
    totalMins: bestResult.mins,
  };
}

interface DmrcMetroMapProps {
  mode: AppMode;
  activeHub: HubRecommendation & { matchScore: number; modeReason: string };
  onSelectHub: (hubId: string) => void;
  userName: string;
  userLocation: string;
  userCurfew: string;
  members: SquadMember[];
}

export const DmrcMetroMap: React.FC<DmrcMetroMapProps> = ({
  mode,
  activeHub,
  onSelectHub,
  userName,
  userLocation,
  userCurfew,
  members,
}) => {
  const [focusedMemberId, setFocusedMemberId] = useState<string>('all');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const stationMap = useMemo(() => {
    const map: Record<string, DmrcStation> = {};
    DMRC_STATIONS.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, []);

  const hubStationId =
    activeHub.id === 'igdtuw-kashmere' ? 'igdtuw-kashmere' : 'nsut-nawada';
  const hubStation = stationMap[hubStationId] || DMRC_STATIONS[2];

  // Combine current user + squad members into unified list with computed DMRC paths
  const memberRoutes = useMemo<ComputedTransitRoute[]>(() => {
    const routes: ComputedTransitRoute[] = [];

    const userStId = resolveMemberStationId(userLocation);
    const userHomeSt = stationMap[userStId] || stationMap['dwarka-mor'];
    const userPath = findShortestDmrcPath(userHomeSt.id, hubStation.id);
    const userSched = calculateParticipantSchedule(userCurfew, userLocation);

    const cleanUser = (userName || 'Saumay').trim();
    routes.push({
      memberId: 'current-user',
      memberName: cleanUser,
      initials: cleanUser.slice(0, 2).toUpperCase(),
      isCurrentUser: true,
      homeStation: userHomeSt,
      hubStation,
      stationPath: userPath.stationIds.map((id) => stationMap[id]).filter(Boolean),
      linesUsed: userPath.linesUsed,
      interchanges: userPath.interchanges,
      totalMins: userPath.totalMins,
      stopsCount: Math.max(0, userPath.stationIds.length - 1),
      leaveByTime: userSched.leaveByTime,
      curfewFormatted: userSched.curfewFormatted,
    });

    members.forEach((m) => {
      if (m.name.toLowerCase().trim() === cleanUser.toLowerCase()) return;
      const stId = resolveMemberStationId(m.location);
      const homeSt = stationMap[stId] || stationMap['janakpuri-west'];
      const pathInfo = findShortestDmrcPath(homeSt.id, hubStation.id);
      const sched = calculateParticipantSchedule(m.curfew, m.location);

      routes.push({
        memberId: m.id,
        memberName: m.name,
        initials: m.initials,
        isCurrentUser: false,
        homeStation: homeSt,
        hubStation,
        stationPath: pathInfo.stationIds.map((id) => stationMap[id]).filter(Boolean),
        linesUsed: pathInfo.linesUsed,
        interchanges: pathInfo.interchanges,
        totalMins: pathInfo.totalMins,
        stopsCount: Math.max(0, pathInfo.stationIds.length - 1),
        leaveByTime: m.leaveByTime || sched.leaveByTime,
        curfewFormatted: sched.curfewFormatted,
      });
    });

    return routes;
  }, [userName, userLocation, userCurfew, members, hubStation, stationMap]);

  const activeRoutes = useMemo(() => {
    if (focusedMemberId === 'all') return memberRoutes;
    return memberRoutes.filter((r) => r.memberId === focusedMemberId);
  }, [memberRoutes, focusedMemberId]);

  const activePathStationIds = useMemo(() => {
    const set = new Set<string>();
    activeRoutes.forEach((r) => {
      r.stationPath.forEach((st) => set.add(st.id));
    });
    return set;
  }, [activeRoutes]);

  // Group members by their home station ID so multiple members at the same station stack cleanly
  const membersByHomeStation = useMemo(() => {
    const grouped: Record<string, ComputedTransitRoute[]> = {};
    memberRoutes.forEach((r) => {
      if (!grouped[r.homeStation.id]) grouped[r.homeStation.id] = [];
      grouped[r.homeStation.id].push(r);
    });
    return grouped;
  }, [memberRoutes]);

  const selectedStation = selectedStationId ? stationMap[selectedStationId] : null;
  const focusedSingleRoute =
    focusedMemberId !== 'all'
      ? memberRoutes.find((r) => r.memberId === focusedMemberId) || null
      : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Squad Member Path Filter Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
            Transit Paths:
          </span>
          <button
            type="button"
            onClick={() => setFocusedMemberId('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              focusedMemberId === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Squad ({memberRoutes.length})
          </button>
          {memberRoutes.map((route) => {
            const isSelected = focusedMemberId === route.memberId;
            return (
              <button
                key={route.memberId}
                type="button"
                onClick={() => {
                  setFocusedMemberId(isSelected ? 'all' : route.memberId);
                  setSelectedStationId(route.homeStation.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{route.isCurrentUser ? `${route.memberName} (You)` : route.memberName}</span>
                <span className="text-[10px] opacity-75">· {route.stopsCount} stops</span>
              </button>
            );
          })}
        </div>

        {/* DMRC Line Legend */}
        <div className="flex items-center gap-2.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
          {(['blue', 'yellow', 'red', 'pink', 'magenta'] as DmrcLineId[]).map((lineKey) => (
            <span key={lineKey} className="flex items-center gap-1 whitespace-nowrap">
              <span
                className="w-2.5 h-1 rounded-full inline-block"
                style={{ backgroundColor: DMRC_LINE_META[lineKey].color }}
              />
              <span>{DMRC_LINE_META[lineKey].name.replace(' Line', '')}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Interactive SVG DMRC Transit Network Canvas */}
      <div className="relative w-full h-[380px] rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden select-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 680 310"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="dmrc-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="currentColor"
                className="text-slate-200/70 dark:text-slate-800/60"
                strokeWidth="0.7"
              />
            </pattern>
            <filter id="hub-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.35" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#dmrc-grid)" />

          {/* 1. Base DMRC Metro Line Tracks */}
          {DMRC_EDGES.map((edge, idx) => {
            const stFrom = stationMap[edge.from];
            const stTo = stationMap[edge.to];
            if (!stFrom || !stTo) return null;
            const lineColor = DMRC_LINE_META[edge.line].color;
            const isDimmed =
              focusedMemberId !== 'all' &&
              !(activePathStationIds.has(edge.from) && activePathStationIds.has(edge.to));

            return (
              <line
                key={`edge-${idx}`}
                x1={stFrom.x}
                y1={stFrom.y}
                x2={stTo.x}
                y2={stTo.y}
                stroke={lineColor}
                strokeWidth={isDimmed ? 3.5 : 5}
                strokeLinecap="round"
                opacity={isDimmed ? 0.22 : 0.75}
              />
            );
          })}

          {/* 2. Highlighted Member-to-Hub Transit Path Overlays */}
          {activeRoutes.map((route) => {
            if (route.stationPath.length < 2) return null;
            const pointsAttr = route.stationPath.map((s) => `${s.x},${s.y}`).join(' ');
            return (
              <g key={`route-overlay-${route.memberId}`}>
                {/* Outer luminous path casing */}
                <polyline
                  points={pointsAttr}
                  fill="none"
                  stroke={route.isCurrentUser ? '#0f172a' : '#2563eb'}
                  strokeWidth={route.isCurrentUser ? 8.5 : 7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={focusedMemberId === 'all' ? 0.25 : 0.45}
                />
                {/* Inner directional dashed flow line */}
                <polyline
                  points={pointsAttr}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={2.2}
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* 3. Safe Case Pink Saheli Halo around Active Central Hub */}
          {mode === 'safe' && (
            <g>
              <circle
                cx={hubStation.x}
                cy={hubStation.y}
                r={30}
                fill="#10b981"
                opacity={0.14}
              />
              <circle
                cx={hubStation.x}
                cy={hubStation.y}
                r={30}
                fill="none"
                stroke="#10b981"
                strokeWidth={1.2}
                strokeDasharray="4 3"
                opacity={0.6}
              />
            </g>
          )}

          {/* 4. DMRC Station Nodes & Labels */}
          {DMRC_STATIONS.map((station) => {
            const isCentralHub = station.id === hubStation.id;
            const isOtherHub = Boolean(station.hubId && station.hubId !== activeHub.id);
            const isOnActivePath = activePathStationIds.has(station.id);
            const isSelected = selectedStationId === station.id;
            const primaryColor = DMRC_LINE_META[station.lines[0]].color;

            let labelDy = 16;
            let labelDx = 0;
            let anchor: 'middle' | 'start' | 'end' = 'middle';
            if (station.labelPos === 'top') labelDy = -12;
            if (station.labelPos === 'right') {
              labelDx = 12;
              labelDy = 3;
              anchor = 'start';
            }
            if (station.labelPos === 'left') {
              labelDx = -12;
              labelDy = 3;
              anchor = 'end';
            }

            return (
              <g
                key={station.id}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedStationId(station.id);
                  if (station.hubId) {
                    onSelectHub(station.hubId);
                  }
                }}
              >
                {/* Safe Case Pink Saheli Dot */}
                {mode === 'safe' && station.pinkSaheliBooth && (
                  <circle
                    cx={station.x + 9}
                    cy={station.y - 9}
                    r={4}
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth={1.2}
                  />
                )}

                {/* Interchange Outer Ring */}
                {station.isInterchange && (
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={isCentralHub ? 12 : 8.5}
                    fill="#ffffff"
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                )}

                {/* Station Core Circle */}
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={isCentralHub ? 9.5 : isOtherHub ? 7.5 : station.isInterchange ? 5.5 : 5}
                  fill={isCentralHub ? '#2563eb' : isSelected ? '#0f172a' : '#ffffff'}
                  stroke={isCentralHub ? '#ffffff' : primaryColor}
                  strokeWidth={isCentralHub ? 2.5 : 2.5}
                  opacity={focusedMemberId !== 'all' && !isOnActivePath && !isCentralHub ? 0.45 : 1}
                />

                {/* Station Name Label */}
                <text
                  x={station.x + labelDx}
                  y={station.y + labelDy}
                  textAnchor={anchor}
                  className={`text-[9px] font-bold ${
                    isCentralHub
                      ? 'fill-blue-700 dark:fill-blue-300'
                      : isOnActivePath
                        ? 'fill-slate-800 dark:fill-slate-100'
                        : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {station.shortName}
                </text>
              </g>
            );
          })}

          {/* 5. Active Central Hub Callout Banner */}
          <g
            transform={`translate(${hubStation.x}, ${hubStation.y - 28})`}
            filter="url(#hub-glow)"
            className="cursor-pointer"
            onClick={() => setSelectedStationId(hubStation.id)}
          >
            <rect
              x={-68}
              y={-14}
              width={136}
              height={20}
              rx={6}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <text
              x={0}
              y={-1}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={9}
              fontWeight="bold"
            >
              HUB: {hubStation.shortName.toUpperCase()}
            </text>
          </g>

          {/* 6. Member Home Station Badges Overlaid on Stations */}
          {Object.entries(membersByHomeStation).map(([stId, routesAtStation]) => {
            const st = stationMap[stId];
            if (!st) return null;
            return routesAtStation.map((route, stackIdx) => {
              const isHighlighted =
                focusedMemberId === 'all' || focusedMemberId === route.memberId;
              const offsetY = st.id === hubStation.id ? 26 + stackIdx * 18 : -22 - stackIdx * 18;
              const offsetX = stackIdx % 2 === 0 ? 0 : 12;

              return (
                <g
                  key={`badge-${route.memberId}`}
                  transform={`translate(${st.x + offsetX}, ${st.y + offsetY})`}
                  className="cursor-pointer"
                  opacity={isHighlighted ? 1 : 0.3}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocusedMemberId(
                      focusedMemberId === route.memberId ? 'all' : route.memberId
                    );
                    setSelectedStationId(st.id);
                  }}
                >
                  <rect
                    x={-28}
                    y={-9}
                    width={56}
                    height={16}
                    rx={8}
                    fill={route.isCurrentUser ? '#0f172a' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                  <text
                    x={0}
                    y={2}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={8.5}
                    fontWeight="bold"
                  >
                    {route.isCurrentUser ? `${route.memberName}*` : route.memberName}
                  </text>
                </g>
              );
            });
          })}
        </svg>

        {/* Top-Left Overlay Info Chip */}
        <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
            Central Hub: <span className="text-blue-600 dark:text-blue-400">{hubStation.name}</span>
          </div>
          {mode === 'safe' && (
            <div className="bg-emerald-50/95 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold">
              Pink Saheli Stations Active
            </div>
          )}
        </div>

        {/* Interactive Station or Member Route Inspector Card */}
        {(focusedSingleRoute || selectedStation) && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg flex items-start justify-between gap-2">
            {focusedSingleRoute ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  <span>
                    {focusedSingleRoute.memberName}&apos;s Transit Path ({focusedSingleRoute.stopsCount}{' '}
                    stops · ~{focusedSingleRoute.totalMins} mins)
                  </span>
                </div>
                <div className="font-display text-xs font-bold text-slate-900 dark:text-white">
                  {focusedSingleRoute.homeStation.shortName} → {focusedSingleRoute.hubStation.shortName}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  {focusedSingleRoute.stationPath.map((s) => s.shortName).join(' → ')}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 pt-0.5">
                  <span>Leave by {focusedSingleRoute.leaveByTime}</span>
                  <span>·</span>
                  <span>Curfew {focusedSingleRoute.curfewFormatted}</span>
                </div>
              </div>
            ) : selectedStation ? (
              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {selectedStation.isInterchange ? 'DMRC Interchange Station' : 'DMRC Metro Station'}
                </div>
                <div className="font-display text-xs font-bold text-slate-900 dark:text-white">
                  {selectedStation.name}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {selectedStation.lines.map((l) => (
                    <span
                      key={l}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${DMRC_LINE_META[l].badgeBg}`}
                    >
                      {DMRC_LINE_META[l].name}
                    </span>
                  ))}
                  {mode === 'safe' && selectedStation.pinkSaheliBooth && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      · Pink Saheli Booth Verified
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setFocusedMemberId('all');
                setSelectedStationId(null);
              }}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-bold px-1"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Squad Member Station-to-Hub Path Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {memberRoutes.map((route) => {
          const isFocused = focusedMemberId === route.memberId;
          return (
            <button
              key={route.memberId}
              type="button"
              onClick={() =>
                setFocusedMemberId(isFocused ? 'all' : route.memberId)
              }
              className={`text-left rounded-xl p-2.5 border transition-colors flex flex-col gap-1 ${
                isFocused
                  ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-xs font-bold text-slate-900 dark:text-white truncate">
                  {route.isCurrentUser ? `${route.memberName} (You)` : route.memberName}
                </span>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                  {route.stopsCount === 0 ? 'At Hub' : `${route.stopsCount} stops · ${route.totalMins}m`}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                {route.homeStation.shortName} → {route.hubStation.shortName}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span>
                  {route.interchanges.length > 0
                    ? `Via ${route.interchanges.join(', ')}`
                    : `Direct ${DMRC_LINE_META[route.linesUsed[0] || 'blue'].name}`}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Leave {route.leaveByTime}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

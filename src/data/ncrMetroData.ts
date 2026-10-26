export type GenderProfile = 'female' | 'male' | 'non-binary';
export type CompanionStatus = 'alone' | 'accompanied';
export type TabPath = 'home' | 'lobby' | 'safe-map' | 'companion-routes';

export interface MetroStation {
  id: string;
  name: string;
  gateInfo: string;
  lines: ('Yellow' | 'Blue' | 'Magenta' | 'Violet' | 'Pink' | 'Red' | 'Rapid')[];
  cisfNote: string;
  transitMinsToCP: number;
  lightingScore: number;
  saheliBooth: string;
  corridorGroup: 'yellow' | 'blue' | 'magenta';
}

export interface SquadMember {
  id: string;
  lobbyCode: string;
  userId: string;
  name: string;
  initials: string;
  gender: GenderProfile;
  stationId: string;
  stationName: string;
  curfew: string;
  curfewType: 'Strict' | 'Flex' | 'Late' | 'Flexible';
  companionStatus: CompanionStatus;
  budget: string;
  pairingNote: string;
}

export interface LobbyData {
  code: string;
  title: string;
  hostName: string;
  hostId: string;
  centralHub: string;
  departureTime: string;
  activePings: number;
  lastPingBy: string;
  sosActive: boolean;
}

export const NCR_METRO_STATIONS: MetroStation[] = [
  {
    id: 'hauz-khas',
    name: 'Hauz Khas',
    gateInfo: 'Gate 2 • Pink & Magenta Interchange',
    lines: ['Yellow', 'Magenta'],
    cisfNote: 'Interchange hub with 24/7 CISF safety desk verified',
    transitMinsToCP: 45,
    lightingScore: 98.8,
    saheliBooth: 'Pink Saheli Booth #09 (Gate 2)',
    corridorGroup: 'yellow',
  },
  {
    id: 'rajiv-chowk',
    name: 'Rajiv Chowk',
    gateInfo: 'Gate 7 • Yellow & Blue Line Interchange',
    lines: ['Yellow', 'Blue'],
    cisfNote: 'Central Command CISF Quick Response Team & CCTV Node',
    transitMinsToCP: 15,
    lightingScore: 99.4,
    saheliBooth: 'Pink Saheli Booth #01 (Concourse B)',
    corridorGroup: 'yellow',
  },
  {
    id: 'noida-sec-18',
    name: 'Noida Sector 18',
    gateInfo: 'Gate 1 • Blue Line Commercial Corridor',
    lines: ['Blue'],
    cisfNote: 'Lit market exit with dedicated UP Police Pink Patrol',
    transitMinsToCP: 42,
    lightingScore: 98.1,
    saheliBooth: 'Pink Saheli Booth #18 (Atta Market Exit)',
    corridorGroup: 'blue',
  },
  {
    id: 'cyber-city',
    name: 'Moulsari Avenue / DLF Cyber Hub',
    gateInfo: 'Gate 1 • Rapid & Yellow Line Link',
    lines: ['Rapid', 'Yellow'],
    cisfNote: '24/7 Corporate Security & Verified Women Cab Bay',
    transitMinsToCP: 55,
    lightingScore: 99.0,
    saheliBooth: 'Cyber Hub Women Safety Desk #04',
    corridorGroup: 'yellow',
  },
  {
    id: 'kashmere-gate',
    name: 'Kashmere Gate',
    gateInfo: 'Gate 3 • Red, Yellow & Violet Tri-Interchange',
    lines: ['Red', 'Yellow', 'Violet'],
    cisfNote: 'Multi-tier CISF dog squad & Pink Coach marshals active',
    transitMinsToCP: 25,
    lightingScore: 97.6,
    saheliBooth: 'Pink Saheli Booth #12 (Gate 3 Auto Stand)',
    corridorGroup: 'yellow',
  },
  {
    id: 'vaishali',
    name: 'Vaishali',
    gateInfo: 'Gate 2 • Blue Line Branch Terminal',
    lines: ['Blue'],
    cisfNote: 'High-mast LED terminal plaza & pre-paid auto booth',
    transitMinsToCP: 40,
    lightingScore: 97.9,
    saheliBooth: 'Pink Saheli Booth #15 (Main Feeder Bay)',
    corridorGroup: 'blue',
  },
  {
    id: 'green-park',
    name: 'Green Park',
    gateInfo: 'Gate 1 • Yellow Line Main Road Exit',
    lines: ['Yellow'],
    cisfNote: 'Direct Aurobindo Marg lit corridor with PCR van point',
    transitMinsToCP: 35,
    lightingScore: 98.5,
    saheliBooth: 'Pink Saheli Booth #07 (Gate 1)',
    corridorGroup: 'yellow',
  },
  {
    id: 'malviya-nagar',
    name: 'Malviya Nagar',
    gateInfo: 'Gate 3 • Yellow Line Saket Link',
    lines: ['Yellow'],
    cisfNote: 'Verified CISF concourse & feeder e-rickshaw stand',
    transitMinsToCP: 45,
    lightingScore: 98.2,
    saheliBooth: 'Pink Saheli Booth #10 (Press Enclave Rd)',
    corridorGroup: 'yellow',
  },
  {
    id: 'kalkaji-mandir',
    name: 'Kalkaji Mandir',
    gateInfo: 'Gate 4 • Violet & Magenta Interchange',
    lines: ['Violet', 'Magenta'],
    cisfNote: 'Elevated glass concourse with 100% CCTV coverage',
    transitMinsToCP: 38,
    lightingScore: 98.7,
    saheliBooth: 'Pink Saheli Booth #14 (Nehru Place Link)',
    corridorGroup: 'magenta',
  },
];

export const DEFAULT_SQUAD_MEMBERS: SquadMember[] = [
  {
    id: 'member-ananya',
    lobbyCode: 'TRV-8492',
    userId: 'demo-ananya',
    name: 'Ananya S.',
    initials: 'AS',
    gender: 'female',
    stationId: 'green-park',
    stationName: 'Green Park (Yellow)',
    curfew: '8:00 PM',
    curfewType: 'Strict',
    companionStatus: 'alone',
    budget: '₹300 - ₹800',
    pairingNote: 'Pairing with Hauz Khas',
  },
  {
    id: 'member-priya',
    lobbyCode: 'TRV-8492',
    userId: 'demo-priya',
    name: 'Priya R.',
    initials: 'PR',
    gender: 'female',
    stationId: 'malviya-nagar',
    stationName: 'Malviya Nagar (Yellow)',
    curfew: '8:00 PM',
    curfewType: 'Strict',
    companionStatus: 'alone',
    budget: '₹300 - ₹800',
    pairingNote: 'Walking companion',
  },
  {
    id: 'member-rohan',
    lobbyCode: 'TRV-8492',
    userId: 'demo-rohan',
    name: 'Rohan M.',
    initials: 'RM',
    gender: 'male',
    stationId: 'hauz-khas',
    stationName: 'Saket (Yellow)',
    curfew: '10:00 PM',
    curfewType: 'Flex',
    companionStatus: 'accompanied',
    budget: '₹300 - ₹800',
    pairingNote: 'Accompanied',
  },
  {
    id: 'member-tanvi',
    lobbyCode: 'TRV-8492',
    userId: 'demo-tanvi',
    name: 'Tanvi K.',
    initials: 'TK',
    gender: 'female',
    stationId: 'kalkaji-mandir',
    stationName: 'Kalkaji Mandir (Violet/Mag)',
    curfew: '8:30 PM',
    curfewType: 'Strict',
    companionStatus: 'alone',
    budget: '₹300 - ₹800',
    pairingNote: 'Magenta metro partner',
  },
];

export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 20 * 60; // default 8:00 PM
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export function formatMinutesToTime(totalMins: number): string {
  const normalized = ((totalMins % 1440) + 1440) % 1440;
  let hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function formatMinutesTo24h(totalMins: number): string {
  const normalized = ((totalMins % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours24.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function calculateDepartureInfo(curfewTime: string, stationId: string) {
  const station = NCR_METRO_STATIONS.find((s) => s.id === stationId) || NCR_METRO_STATIONS[0];
  const curfewMins = parseTimeToMinutes(curfewTime);
  const departureMins = curfewMins - station.transitMinsToCP;
  return {
    departureTime12h: formatMinutesToTime(departureMins),
    departureTime24h: formatMinutesTo24h(departureMins),
    transitMins: station.transitMinsToCP,
    station,
  };
}

export function calculateSquadMetrics(members: SquadMember[]) {
  if (!members.length) {
    return {
      earliestCurfew: '8:00 PM',
      hubDeparture12h: '7:15 PM',
      hubDeparture24h: '19:15',
      femaleCount: 3,
      recommendedHub: 'Rajiv Chowk Metro (Gate 7)',
      bufferMins: 45,
    };
  }

  // Filter female / non-binary weighted members first
  const priorityMembers = members.filter((m) => m.gender === 'female' || m.gender === 'non-binary');
  const pool = priorityMembers.length > 0 ? priorityMembers : members;

  let earliestCurfewMins = Infinity;
  let earliestCurfewStr = '8:00 PM';
  let maxTransitMins = 45;

  for (const m of pool) {
    const mins = parseTimeToMinutes(m.curfew);
    const st = NCR_METRO_STATIONS.find((s) => s.id === m.stationId);
    const transit = st ? st.transitMinsToCP : 45;
    if (mins < earliestCurfewMins) {
      earliestCurfewMins = mins;
      earliestCurfewStr = m.curfew;
      maxTransitMins = transit;
    }
  }

  const hubDepartureMins = earliestCurfewMins - maxTransitMins;
  const femaleCount = members.filter((m) => m.gender === 'female').length;

  return {
    earliestCurfew: earliestCurfewStr,
    hubDeparture12h: formatMinutesToTime(hubDepartureMins),
    hubDeparture24h: formatMinutesTo24h(hubDepartureMins),
    femaleCount: Math.max(femaleCount, 1),
    recommendedHub: 'Rajiv Chowk Metro (Gate 7)',
    bufferMins: maxTransitMins,
  };
}

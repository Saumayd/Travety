export type GenderProfile = 'female' | 'male';
export type AppMode = 'safe' | 'fun';
export type TabPath = 'home' | 'lobby' | 'past-outings' | 'reviews';

export interface HubRecommendation {
  id: string;
  name: string;
  shortName: string;
  area: string;
  metroLine: string;
  avgCost: number;
  centralDistanceKm: number;
  pinkSaheliBooths: number;
  lightingIndex: number; // out of 100
  crimeSafetyScore: number; // out of 100
  funVibeScore: number; // out of 100
  highlights: string[];
  mapCoords: { x: number; y: number };
  lat: number;
  lng: number;
}

export interface SquadMember {
  id: string;
  lobbyCode: string;
  userId: string;
  name: string;
  initials: string;
  gender: GenderProfile;
  location: string;
  curfew: string;
  accompanyingDetails: string;
  budget: number;
  phone: string;
  leaveByTime: string;
  transitMins: number;
}

export interface LobbyData {
  code: string;
  title: string;
  hostName: string;
  hostId: string;
  mode: AppMode;
  centralHub: string;
  departureTime: string;
  activePings: number;
  lastPingBy: string;
  sosActive: boolean;
}

export interface PollItem {
  id: string;
  lobbyCode: string;
  title: string;
  subtitle: string;
  votes: number;
  createdBy: string;
  userVoted?: boolean;
}

export interface PastOuting {
  id: string;
  title: string;
  venue: string;
  area: string;
  date: string;
  mode: AppMode;
  avgSpend: number;
  participants: string[];
  safetyScore: number;
  summary: string;
}

export interface AreaReviewItem {
  id: string;
  userId: string;
  authorName: string;
  areaName: string;
  safetyRating: number;
  lightingStatus: 'Well-Lit LED' | 'Moderate Lighting' | 'Dim / Dark Stretches';
  issueFlag:
    | 'Safe & Verified Corridor'
    | 'Poor Street Lighting'
    | 'Unsafe / Isolated Spot'
    | 'No Pink Saheli Booth Nearby'
    | 'Crowded / High Traffic';
  comment: string;
  dateLabel: string;
}

// Focused strictly on NSUT and IGDTUW as the core University Hubs
export const NCR_HUB_RECOMMENDATIONS: HubRecommendation[] = [
  {
    id: 'nsut-dwarka',
    name: 'NSUT (Netaji Subhas University of Technology)',
    shortName: 'NSUT Dwarka',
    area: 'Dwarka Sector 3 / Dwarka Mor Metro',
    metroLine: 'Blue Line Corridor',
    avgCost: 350,
    centralDistanceKm: 3.2,
    pinkSaheliBooths: 4,
    lightingIndex: 97,
    crimeSafetyScore: 96,
    funVibeScore: 96,
    highlights: [
      '4 Pink Saheli Booths (Main Gate & Metro)',
      '97% Lit Campus Perimeter',
      'Direct Blue Line Access',
    ],
    mapCoords: { x: 115, y: 205 },
    lat: 28.61,
    lng: 77.0379,
  },
  {
    id: 'igdtuw-kashmere',
    name: 'IGDTUW (Indira Gandhi Delhi Technical University)',
    shortName: 'IGDTUW Kashmere Gate',
    area: 'Kashmere Gate Metro Interchange',
    metroLine: 'Yellow, Red & Violet Line',
    avgCost: 300,
    centralDistanceKm: 2.8,
    pinkSaheliBooths: 4,
    lightingIndex: 98,
    crimeSafetyScore: 97,
    funVibeScore: 94,
    highlights: [
      'Dedicated Women University Patrol',
      'Triple-Line Metro Interchange',
      '24/7 CISF & Pink Booth Gate 6',
    ],
    mapCoords: { x: 295, y: 85 },
    lat: 28.6654,
    lng: 77.232,
  },
];

// Squad Members: Devika, Vansh, Saumay, Rimisha, Pragya
export const DEFAULT_SQUAD_MEMBERS: SquadMember[] = [
  {
    id: 'member-devika',
    lobbyCode: 'TRV-8492',
    userId: 'demo-devika',
    name: 'Devika',
    initials: 'DV',
    gender: 'female',
    location: 'IGDTUW, Kashmere Gate',
    curfew: '20:30',
    accompanyingDetails: 'Yellow Line with Rimisha',
    budget: 400,
    phone: '+91 98110 44210',
    leaveByTime: '7:55 PM',
    transitMins: 35,
  },
  {
    id: 'member-vansh',
    lobbyCode: 'TRV-8492',
    userId: 'demo-vansh',
    name: 'Vansh',
    initials: 'VN',
    gender: 'male',
    location: 'NSUT, Dwarka Sector 3',
    curfew: '21:30',
    accompanyingDetails: 'Blue Line with Saumay',
    budget: 500,
    phone: '+91 98182 31904',
    leaveByTime: '9:00 PM',
    transitMins: 30,
  },
  {
    id: 'member-saumay',
    lobbyCode: 'TRV-8492',
    userId: 'demo-saumay',
    name: 'Saumay',
    initials: 'SM',
    gender: 'male',
    location: 'NSUT, Dwarka Mor',
    curfew: '21:30',
    accompanyingDetails: 'Escorting squad till Blue Line interchange',
    budget: 500,
    phone: '+91 99104 88123',
    leaveByTime: '9:02 PM',
    transitMins: 28,
  },
  {
    id: 'member-rimisha',
    lobbyCode: 'TRV-8492',
    userId: 'demo-rimisha',
    name: 'Rimisha',
    initials: 'RM',
    gender: 'female',
    location: 'IGDTUW, Civil Lines',
    curfew: '20:15',
    accompanyingDetails: 'Traveling with Devika on Yellow Line',
    budget: 450,
    phone: '+91 98711 55092',
    leaveByTime: '7:43 PM',
    transitMins: 32,
  },
  {
    id: 'member-pragya',
    lobbyCode: 'TRV-8492',
    userId: 'demo-pragya',
    name: 'Pragya',
    initials: 'PG',
    gender: 'female',
    location: 'NSUT, Janakpuri West',
    curfew: '20:30',
    accompanyingDetails: 'Blue Line with Vansh & Saumay',
    budget: 450,
    phone: '+91 98109 77341',
    leaveByTime: '7:58 PM',
    transitMins: 32,
  },
];

export const DEFAULT_POLL_OPTIONS: PollItem[] = [
  {
    id: 'poll-nsut',
    lobbyCode: 'TRV-8492',
    title: 'NSUT Campus & Dwarka Sec-3 Hub',
    subtitle: '4 Pink Saheli Booths · Blue Line · Avg ₹350/person',
    votes: 3,
    createdBy: 'demo-saumay',
    userVoted: true,
  },
  {
    id: 'poll-igdtuw',
    lobbyCode: 'TRV-8492',
    title: 'IGDTUW Campus & Kashmere Gate Hub',
    subtitle: '98% Lit Corridor · Yellow/Red/Violet Interchange · Avg ₹300/person',
    votes: 2,
    createdBy: 'demo-devika',
    userVoted: false,
  },
];

export const DEFAULT_PAST_OUTINGS: PastOuting[] = [
  {
    id: 'outing-1',
    title: 'NSUT Fest & Evening Cafe Meet',
    venue: 'NSUT (Netaji Subhas University of Technology)',
    area: 'Dwarka Sector 3',
    date: 'Oct 19, 2026',
    mode: 'safe',
    avgSpend: 340,
    participants: ['Devika', 'Vansh', 'Saumay', 'Rimisha', 'Pragya'],
    safetyScore: 97,
    summary:
      'All 5 team members departed via Dwarka Mor Blue Line corridor and reached home 15 mins before curfew.',
  },
  {
    id: 'outing-2',
    title: 'IGDTUW Hackathon & Old Delhi Coffee Walk',
    venue: 'IGDTUW (Indira Gandhi Delhi Technical University)',
    area: 'Kashmere Gate',
    date: 'Oct 11, 2026',
    mode: 'fun',
    avgSpend: 310,
    participants: ['Devika', 'Vansh', 'Saumay', 'Rimisha', 'Pragya'],
    safetyScore: 98,
    summary:
      'Coordinated return via Kashmere Gate Gate 6 interchange. Automated curfew texts sent 35 mins prior.',
  },
];

export const DEFAULT_AREA_REVIEWS: AreaReviewItem[] = [
  {
    id: 'rev-1',
    userId: 'demo-devika',
    authorName: 'Devika',
    areaName: 'IGDTUW Main Gate to Kashmere Gate Metro Gate 6',
    safetyRating: 5,
    lightingStatus: 'Well-Lit LED',
    issueFlag: 'Safe & Verified Corridor',
    comment:
      'Bright LED lighting outside IGDTUW campus gate and active Pink Saheli patrol stationed right by the metro concourse.',
    dateLabel: '2 days ago',
  },
  {
    id: 'rev-2',
    userId: 'demo-pragya',
    authorName: 'Pragya',
    areaName: 'NSUT North Gate to Dwarka Mor Metro Walkway',
    safetyRating: 5,
    lightingStatus: 'Well-Lit LED',
    issueFlag: 'Safe & Verified Corridor',
    comment:
      'High student footfall and verified e-rickshaw stand right outside NSUT gate. Police booth is active in the evening.',
    dateLabel: '4 days ago',
  },
  {
    id: 'rev-3',
    userId: 'demo-rimisha',
    authorName: 'Rimisha',
    areaName: 'Subway Stretch behind Old Kashmere Gate ISBT',
    safetyRating: 2,
    lightingStatus: 'Dim / Dark Stretches',
    issueFlag: 'Poor Street Lighting',
    comment:
      'Two lights in the outer service lane were dim after 7:30 PM. Always use the main lit IGDTUW Gate 6 metro approach instead.',
    dateLabel: '1 week ago',
  },
];

export function estimateTransitMinutes(locationText: string): number {
  const lower = (locationText || '').toLowerCase();
  if (lower.includes('nsut') || lower.includes('dwarka')) return 28;
  if (lower.includes('janakpuri') || lower.includes('rajouri')) return 32;
  if (lower.includes('igdtuw') || lower.includes('kashmere') || lower.includes('civil lines'))
    return 34;
  if (lower.includes('rohini') || lower.includes('pitampura')) return 36;
  return 35;
}

export function parseManualTimeToMinutes(timeStr: string): number {
  const clean = (timeStr || '').trim();
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    return h * 60 + m;
  }
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  return 20 * 60 + 30;
}

export function formatMinutesTo12h(totalMins: number): string {
  const normalized = ((totalMins % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function calculateParticipantSchedule(curfewInput: string, locationInput: string) {
  const transitMins = estimateTransitMinutes(locationInput);
  const curfewMins = parseManualTimeToMinutes(curfewInput);
  const leaveByMins = curfewMins - transitMins;
  return {
    curfewFormatted: formatMinutesTo12h(curfewMins),
    leaveByTime: formatMinutesTo12h(leaveByMins),
    transitMins,
  };
}

export function rankHubsByMode(
  mode: AppMode,
  avgGroupBudget: number
): (HubRecommendation & { matchScore: number; modeReason: string })[] {
  return NCR_HUB_RECOMMENDATIONS.map((hub) => {
    const budgetDiff = Math.abs(hub.avgCost - avgGroupBudget);
    const budgetScore = Math.max(70, 100 - Math.round(budgetDiff / 10));
    const locationScore = Math.max(75, Math.round(100 - hub.centralDistanceKm * 3));

    if (mode === 'safe') {
      const composite = Math.round(
        hub.lightingIndex * 0.25 +
          hub.crimeSafetyScore * 0.25 +
          Math.min(100, hub.pinkSaheliBooths * 25) * 0.2 +
          locationScore * 0.15 +
          budgetScore * 0.15
      );
      return {
        ...hub,
        matchScore: Math.min(99, composite),
        modeReason: `${hub.pinkSaheliBooths} Pink Saheli Booths · ${hub.lightingIndex}% Lit · ₹${hub.avgCost} avg`,
      };
    } else {
      const composite = Math.round(
        locationScore * 0.45 + budgetScore * 0.4 + hub.funVibeScore * 0.15
      );
      return {
        ...hub,
        matchScore: Math.min(99, composite),
        modeReason: `${hub.metroLine} · ₹${hub.avgCost}/person Budget Match`,
      };
    }
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export function resolveLocationCoords(locationText: string): {
  lat: number;
  lng: number;
  metroX: number;
  metroY: number;
} {
  const lower = (locationText || '').toLowerCase();
  if (lower.includes('dwarka mor')) {
    return { lat: 28.6193, lng: 77.0333, metroX: 95, metroY: 215 };
  }
  if (lower.includes('nsut') || lower.includes('dwarka')) {
    return { lat: 28.61, lng: 77.0379, metroX: 115, metroY: 205 };
  }
  if (lower.includes('janakpuri')) {
    return { lat: 28.6289, lng: 77.0777, metroX: 155, metroY: 190 };
  }
  if (lower.includes('rajouri')) {
    return { lat: 28.649, lng: 77.1225, metroX: 190, metroY: 175 };
  }
  if (lower.includes('igdtuw') || lower.includes('kashmere')) {
    return { lat: 28.6654, lng: 77.232, metroX: 295, metroY: 85 };
  }
  if (lower.includes('civil lines') || lower.includes('vidhan sabha')) {
    return { lat: 28.6769, lng: 77.225, metroX: 280, metroY: 65 };
  }
  if (lower.includes('rohini')) {
    return { lat: 28.7383, lng: 77.1333, metroX: 225, metroY: 45 };
  }
  if (lower.includes('rajiv') || lower.includes('connaught')) {
    return { lat: 28.6328, lng: 77.2197, metroX: 255, metroY: 155 };
  }

  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = (hash * 31 + lower.charCodeAt(i)) % 1000;
  }
  const latOffset = ((hash % 100) - 50) * 0.0006;
  const lngOffset = ((Math.floor(hash / 10) % 100) - 50) * 0.0006;
  return {
    lat: Number((28.635 + latOffset).toFixed(4)),
    lng: Number((77.145 + lngOffset).toFixed(4)),
    metroX: 210 + ((hash % 50) - 25),
    metroY: 150 + ((hash % 40) - 20),
  };
}

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function getPinkSaheliBoothsForHub(hub: HubRecommendation): {
  id: string;
  label: string;
  lat: number;
  lng: number;
  metroX: number;
  metroY: number;
}[] {
  const offsets = [
    { dLat: 0.0038, dLng: -0.0042, dx: -22, dy: -16, gate: 'Main Campus Gate Booth' },
    { dLat: -0.0035, dLng: 0.0045, dx: 24, dy: 16, gate: 'Metro Concourse Helpdesk' },
    { dLat: 0.0042, dLng: 0.0035, dx: 20, dy: -18, gate: 'Women Patrol Post' },
    { dLat: -0.004, dLng: -0.0038, dx: -20, dy: 18, gate: 'Verified E-Rickshaw Bay' },
  ];
  return offsets.slice(0, hub.pinkSaheliBooths).map((off, idx) => ({
    id: `${hub.id}-saheli-${idx + 1}`,
    label: `Pink Saheli #${idx + 1} (${off.gate})`,
    lat: Number((hub.lat + off.dLat).toFixed(4)),
    lng: Number((hub.lng + off.dLng).toFixed(4)),
    metroX: hub.mapCoords.x + off.dx,
    metroY: hub.mapCoords.y + off.dy,
  }));
}

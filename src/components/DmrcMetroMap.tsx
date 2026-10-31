import React, { useMemo, useState } from 'react';
import {
  Clock,
  Compass,
  MapPin,
  Maximize2,
  Navigation,
  ShieldCheck,
  Sparkles,
  TrainFront,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  AppMode,
  calculateParticipantSchedule,
  HubRecommendation,
  SquadMember,
} from '../data/ncrMetroData';
import { memberById, type Member } from '../data/travityData';
import { FriendAvatar } from './travity/TravityBits';

export type DmrcLineId =
  | 'blue'
  | 'yellow'
  | 'red'
  | 'pink'
  | 'magenta'
  | 'violet'
  | 'orange'
  | 'green';

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
  { name: string; shortLabel: string; color: string; badgeBg: string }
> = {
  blue: {
    name: 'Blue Line (Dwarka – Noida / Vaishali)',
    shortLabel: 'Blue',
    color: '#2563eb',
    badgeBg: 'bg-blue-600 text-white',
  },
  yellow: {
    name: 'Yellow Line (Samaypur Badli – Gurugram)',
    shortLabel: 'Yellow',
    color: '#eab308',
    badgeBg: 'bg-amber-500 text-slate-950',
  },
  red: {
    name: 'Red Line (Rithala – Shaheed Sthal)',
    shortLabel: 'Red',
    color: '#dc2626',
    badgeBg: 'bg-red-600 text-white',
  },
  pink: {
    name: 'Pink Line (Majlis Park – Shiv Vihar Ring)',
    shortLabel: 'Pink',
    color: '#ec4899',
    badgeBg: 'bg-pink-600 text-white',
  },
  magenta: {
    name: 'Magenta Line (Janakpuri West – Botanical)',
    shortLabel: 'Magenta',
    color: '#9333ea',
    badgeBg: 'bg-purple-600 text-white',
  },
  violet: {
    name: 'Violet Line (Kashmere Gate – Faridabad)',
    shortLabel: 'Violet',
    color: '#7c3aed',
    badgeBg: 'bg-violet-600 text-white',
  },
  orange: {
    name: 'Airport Express (New Delhi – Yashobhoomi)',
    shortLabel: 'Airport Orange',
    color: '#f97316',
    badgeBg: 'bg-orange-500 text-white',
  },
  green: {
    name: 'Green Line (Inderlok – Bahadurgarh)',
    shortLabel: 'Green',
    color: '#10b981',
    badgeBg: 'bg-emerald-600 text-white',
  },
};

export const DMRC_STATIONS: DmrcStation[] = [
  // =========================================================================
  // 1. BLUE LINE (West: Dwarka Sec 21 -> Central: Rajiv Chowk -> East: Noida & Vaishali)
  // =========================================================================
  {
    id: 'dwarka-sec-21',
    name: 'Dwarka Sector 21 Interchange',
    shortName: 'Dwarka Sec 21',
    x: 115,
    y: 525,
    lines: ['blue', 'orange'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'left',
  },
  {
    id: 'dwarka-mor',
    name: 'Dwarka Mor (NSUT Main Gate)',
    shortName: 'Dwarka Mor',
    x: 170,
    y: 470,
    lines: ['blue'],
    pinkSaheliBooth: true,
    labelPos: 'left',
  },
  {
    id: 'nsut-nawada',
    name: 'NSUT / Nawada Campus Hub',
    shortName: 'NSUT (Dwarka)',
    x: 225,
    y: 425,
    lines: ['blue'],
    hubId: 'nsut-dwarka',
    pinkSaheliBooth: true,
    labelPos: 'top',
  },
  {
    id: 'uttam-nagar',
    name: 'Uttam Nagar West',
    shortName: 'Uttam Nagar',
    x: 270,
    y: 398,
    lines: ['blue'],
    labelPos: 'bottom',
  },
  {
    id: 'janakpuri-west',
    name: 'Janakpuri West Interchange',
    shortName: 'Janakpuri W',
    x: 315,
    y: 372,
    lines: ['blue', 'magenta'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'top',
  },
  {
    id: 'rajouri-garden',
    name: 'Rajouri Garden Interchange',
    shortName: 'Rajouri Garden',
    x: 380,
    y: 342,
    lines: ['blue', 'pink'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'top',
  },
  {
    id: 'kirti-nagar',
    name: 'Kirti Nagar Interchange',
    shortName: 'Kirti Nagar',
    x: 432,
    y: 326,
    lines: ['blue', 'green'],
    isInterchange: true,
    labelPos: 'bottom',
  },
  {
    id: 'karol-bagh',
    name: 'Karol Bagh',
    shortName: 'Karol Bagh',
    x: 482,
    y: 318,
    lines: ['blue'],
    labelPos: 'top',
  },
  {
    id: 'rajiv-chowk',
    name: 'Rajiv Chowk (Connaught Place Hub)',
    shortName: 'Rajiv Chowk (CP)',
    x: 550,
    y: 318,
    lines: ['blue', 'yellow'],
    isInterchange: true,
    hubId: 'connaught-place',
    pinkSaheliBooth: true,
    labelPos: 'top',
  },
  {
    id: 'mandi-house',
    name: 'Mandi House Interchange',
    shortName: 'Mandi House',
    x: 625,
    y: 325,
    lines: ['blue', 'violet'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'top',
  },
  {
    id: 'yamuna-bank',
    name: 'Yamuna Bank Junction',
    shortName: 'Yamuna Bank',
    x: 695,
    y: 340,
    lines: ['blue'],
    isInterchange: true,
    labelPos: 'bottom',
  },
  {
    id: 'mayur-vihar-1',
    name: 'Mayur Vihar-I Interchange',
    shortName: 'Mayur Vihar-I',
    x: 748,
    y: 382,
    lines: ['blue', 'pink'],
    isInterchange: true,
    labelPos: 'left',
  },
  {
    id: 'noida-sec-18',
    name: 'Noida Sector 18',
    shortName: 'Noida Sec 18',
    x: 805,
    y: 432,
    lines: ['blue'],
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'botanical-garden',
    name: 'Botanical Garden (Noida Interchange)',
    shortName: 'Botanical Garden',
    x: 858,
    y: 472,
    lines: ['blue', 'magenta'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'noida-electronic-city',
    name: 'Noida Electronic City',
    shortName: 'Noida Elec City',
    x: 945,
    y: 458,
    lines: ['blue'],
    labelPos: 'top',
  },
  // Blue Line Vaishali Branch
  {
    id: 'karkardooma',
    name: 'Karkardooma Interchange',
    shortName: 'Karkardooma',
    x: 775,
    y: 285,
    lines: ['blue', 'pink'],
    isInterchange: true,
    labelPos: 'top',
  },
  {
    id: 'anand-vihar',
    name: 'Anand Vihar ISBT Interchange',
    shortName: 'Anand Vihar',
    x: 838,
    y: 275,
    lines: ['blue', 'pink'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'vaishali',
    name: 'Vaishali (Ghaziabad)',
    shortName: 'Vaishali',
    x: 920,
    y: 262,
    lines: ['blue'],
    labelPos: 'top',
  },

  // =========================================================================
  // 2. YELLOW LINE (North: Samaypur Badli -> Central -> South: Gurugram)
  // =========================================================================
  {
    id: 'samaypur-badli',
    name: 'Samaypur Badli (North Terminal)',
    shortName: 'Samaypur Badli',
    x: 495,
    y: 58,
    lines: ['yellow'],
    labelPos: 'left',
  },
  {
    id: 'azadpur',
    name: 'Azadpur Interchange',
    shortName: 'Azadpur',
    x: 512,
    y: 105,
    lines: ['yellow', 'pink'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'left',
  },
  {
    id: 'vishwavidyalaya',
    name: 'Vishwavidyalaya (DU North Campus)',
    shortName: 'Vishwavidyalaya',
    x: 532,
    y: 142,
    lines: ['yellow'],
    pinkSaheliBooth: true,
    labelPos: 'right',
  },
  {
    id: 'civil-lines',
    name: 'Civil Lines',
    shortName: 'Civil Lines',
    x: 545,
    y: 178,
    lines: ['yellow'],
    labelPos: 'right',
  },
  {
    id: 'igdtuw-kashmere',
    name: 'Kashmere Gate (IGDTUW Campus Hub)',
    shortName: 'IGDTUW (Kashmere Gate)',
    x: 558,
    y: 218,
    lines: ['yellow', 'red', 'violet'],
    isInterchange: true,
    hubId: 'igdtuw-kashmere',
    pinkSaheliBooth: true,
    labelPos: 'right',
  },
  {
    id: 'chandni-chowk',
    name: 'Chandni Chowk (Old Delhi)',
    shortName: 'Chandni Chowk',
    x: 554,
    y: 256,
    lines: ['yellow'],
    labelPos: 'left',
  },
  {
    id: 'new-delhi',
    name: 'New Delhi Railway & Airport Express',
    shortName: 'New Delhi',
    x: 552,
    y: 286,
    lines: ['yellow', 'orange'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'left',
  },
  {
    id: 'central-secretariat',
    name: 'Central Secretariat Interchange',
    shortName: 'Central Sec',
    x: 550,
    y: 378,
    lines: ['yellow', 'violet'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'left',
  },
  {
    id: 'ina-market',
    name: 'Dilli Haat - INA Interchange',
    shortName: 'Dilli Haat - INA',
    x: 546,
    y: 452,
    lines: ['yellow', 'pink'],
    isInterchange: true,
    hubId: 'dilli-haat-ina',
    pinkSaheliBooth: true,
    labelPos: 'left',
  },
  {
    id: 'aiims',
    name: 'AIIMS Medical Campus',
    shortName: 'AIIMS',
    x: 544,
    y: 492,
    lines: ['yellow'],
    pinkSaheliBooth: true,
    labelPos: 'left',
  },
  {
    id: 'hauz-khas',
    name: 'Hauz Khas Interchange',
    shortName: 'Hauz Khas',
    x: 540,
    y: 540,
    lines: ['yellow', 'magenta'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'qutab-minar',
    name: 'Qutab Minar / Saket',
    shortName: 'Qutab Minar',
    x: 490,
    y: 625,
    lines: ['yellow'],
    labelPos: 'right',
  },
  {
    id: 'sikanderpur',
    name: 'Sikanderpur (DLF CyberHub)',
    shortName: 'Sikanderpur',
    x: 425,
    y: 675,
    lines: ['yellow'],
    pinkSaheliBooth: true,
    labelPos: 'right',
  },
  {
    id: 'millennium-city',
    name: 'Millennium City Centre Gurugram',
    shortName: 'Gurugram Hub',
    x: 355,
    y: 715,
    lines: ['yellow'],
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },

  // =========================================================================
  // 3. RED LINE (West: Rithala -> NSP -> Inderlok -> Kashmere Gate -> Shaheed Sthal)
  // =========================================================================
  {
    id: 'rithala',
    name: 'Rithala (Rohini West)',
    shortName: 'Rithala',
    x: 215,
    y: 120,
    lines: ['red'],
    labelPos: 'top',
  },
  {
    id: 'rohini-sec-18',
    name: 'Pitampura / Rohini',
    shortName: 'Pitampura',
    x: 295,
    y: 152,
    lines: ['red'],
    labelPos: 'top',
  },
  {
    id: 'nsp',
    name: 'Netaji Subhash Place (NSP Hub)',
    shortName: 'NSP',
    x: 375,
    y: 185,
    lines: ['red', 'pink'],
    isInterchange: true,
    hubId: 'netaji-subhash-place',
    pinkSaheliBooth: true,
    labelPos: 'top',
  },
  {
    id: 'inderlok',
    name: 'Inderlok Interchange',
    shortName: 'Inderlok',
    x: 435,
    y: 205,
    lines: ['red', 'green'],
    isInterchange: true,
    labelPos: 'bottom',
  },
  {
    id: 'tis-hazari',
    name: 'Tis Hazari',
    shortName: 'Tis Hazari',
    x: 495,
    y: 212,
    lines: ['red'],
    labelPos: 'top',
  },
  {
    id: 'welcome',
    name: 'Welcome Interchange',
    shortName: 'Welcome',
    x: 725,
    y: 198,
    lines: ['red', 'pink'],
    isInterchange: true,
    labelPos: 'top',
  },
  {
    id: 'shaheed-sthal',
    name: 'Shaheed Sthal (New Bus Adda)',
    shortName: 'Shaheed Sthal',
    x: 910,
    y: 182,
    lines: ['red'],
    labelPos: 'top',
  },

  // =========================================================================
  // 4. PINK LINE RING ADDITIONS
  // =========================================================================
  {
    id: 'majlis-park',
    name: 'Majlis Park',
    shortName: 'Majlis Park',
    x: 560,
    y: 88,
    lines: ['pink'],
    labelPos: 'right',
  },
  {
    id: 'punjabi-bagh',
    name: 'Punjabi Bagh West Interchange',
    shortName: 'Punjabi Bagh W',
    x: 372,
    y: 262,
    lines: ['pink', 'green'],
    isInterchange: true,
    labelPos: 'left',
  },
  {
    id: 'dhaula-kuan',
    name: 'Dhaula Kuan (DU South Campus)',
    shortName: 'Dhaula Kuan',
    x: 445,
    y: 418,
    lines: ['pink', 'orange'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'left',
  },
  {
    id: 'lajpat-nagar',
    name: 'Lajpat Nagar Interchange',
    shortName: 'Lajpat Nagar',
    x: 642,
    y: 452,
    lines: ['pink', 'violet'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'shiv-vihar',
    name: 'Shiv Vihar (North-East Terminal)',
    shortName: 'Shiv Vihar',
    x: 785,
    y: 122,
    lines: ['pink'],
    labelPos: 'top',
  },

  // =========================================================================
  // 5. MAGENTA LINE ADDITIONS (Janakpuri W -> IGI T1 -> IIT -> Hauz Khas -> Kalkaji -> Botanical)
  // =========================================================================
  {
    id: 'palam',
    name: 'Palam / Terminal 1-IGI Airport',
    shortName: 'Palam / IGI T1',
    x: 365,
    y: 495,
    lines: ['magenta'],
    labelPos: 'bottom',
  },
  {
    id: 'iit-delhi',
    name: 'IIT Delhi / Munirka',
    shortName: 'IIT Delhi',
    x: 455,
    y: 540,
    lines: ['magenta'],
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'kalkaji-mandir',
    name: 'Kalkaji Mandir Interchange',
    shortName: 'Kalkaji Mandir',
    x: 672,
    y: 540,
    lines: ['magenta', 'violet'],
    isInterchange: true,
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'jamia-millia',
    name: 'Jamia Millia Islamia / Okhla',
    shortName: 'Jamia Millia',
    x: 768,
    y: 515,
    lines: ['magenta'],
    labelPos: 'bottom',
  },

  // =========================================================================
  // 6. VIOLET LINE ADDITIONS (Kashmere Gate -> Mandi House -> JLN Stadium -> Faridabad)
  // =========================================================================
  {
    id: 'jama-masjid',
    name: 'Lal Quila / Jama Masjid',
    shortName: 'Jama Masjid',
    x: 605,
    y: 265,
    lines: ['violet'],
    labelPos: 'right',
  },
  {
    id: 'jln-stadium',
    name: 'JLN Stadium (Sunder Nursery Hub)',
    shortName: 'JLN Stadium',
    x: 625,
    y: 410,
    lines: ['violet'],
    hubId: 'sunder-nursery',
    pinkSaheliBooth: true,
    labelPos: 'right',
  },
  {
    id: 'badarpur',
    name: 'Badarpur Border',
    shortName: 'Badarpur',
    x: 715,
    y: 625,
    lines: ['violet'],
    labelPos: 'right',
  },
  {
    id: 'faridabad',
    name: 'Raja Nahar Singh (Faridabad)',
    shortName: 'Faridabad',
    x: 755,
    y: 705,
    lines: ['violet'],
    labelPos: 'bottom',
  },

  // =========================================================================
  // 7. AIRPORT EXPRESS (ORANGE LINE) & GREEN LINE TERMINALS
  // =========================================================================
  {
    id: 'igi-t3',
    name: 'IGI Airport T3 / Aerocity',
    shortName: 'IGI Airport T3',
    x: 245,
    y: 495,
    lines: ['orange'],
    pinkSaheliBooth: true,
    labelPos: 'bottom',
  },
  {
    id: 'yashobhoomi',
    name: 'Yashobhoomi Dwarka Sector 25',
    shortName: 'Yashobhoomi',
    x: 70,
    y: 565,
    lines: ['orange'],
    labelPos: 'bottom',
  },
  {
    id: 'peeragarhi',
    name: 'Peeragarhi',
    shortName: 'Peeragarhi',
    x: 265,
    y: 256,
    lines: ['green'],
    labelPos: 'top',
  },
  {
    id: 'bahadurgarh',
    name: 'Brig. Hoshiyar Singh (Bahadurgarh)',
    shortName: 'Bahadurgarh',
    x: 115,
    y: 248,
    lines: ['green'],
    labelPos: 'top',
  },
];

export const DMRC_EDGES: DmrcEdge[] = [
  // Blue Line Main
  { from: 'dwarka-sec-21', to: 'dwarka-mor', line: 'blue', mins: 6 },
  { from: 'dwarka-mor', to: 'nsut-nawada', line: 'blue', mins: 4 },
  { from: 'nsut-nawada', to: 'uttam-nagar', line: 'blue', mins: 3 },
  { from: 'uttam-nagar', to: 'janakpuri-west', line: 'blue', mins: 4 },
  { from: 'janakpuri-west', to: 'rajouri-garden', line: 'blue', mins: 7 },
  { from: 'rajouri-garden', to: 'kirti-nagar', line: 'blue', mins: 5 },
  { from: 'kirti-nagar', to: 'karol-bagh', line: 'blue', mins: 5 },
  { from: 'karol-bagh', to: 'rajiv-chowk', line: 'blue', mins: 6 },
  { from: 'rajiv-chowk', to: 'mandi-house', line: 'blue', mins: 5 },
  { from: 'mandi-house', to: 'yamuna-bank', line: 'blue', mins: 5 },
  { from: 'yamuna-bank', to: 'mayur-vihar-1', line: 'blue', mins: 5 },
  { from: 'mayur-vihar-1', to: 'noida-sec-18', line: 'blue', mins: 8 },
  { from: 'noida-sec-18', to: 'botanical-garden', line: 'blue', mins: 4 },
  { from: 'botanical-garden', to: 'noida-electronic-city', line: 'blue', mins: 14 },
  // Blue Line Vaishali Branch
  { from: 'yamuna-bank', to: 'karkardooma', line: 'blue', mins: 7 },
  { from: 'karkardooma', to: 'anand-vihar', line: 'blue', mins: 3 },
  { from: 'anand-vihar', to: 'vaishali', line: 'blue', mins: 5 },

  // Yellow Line
  { from: 'samaypur-badli', to: 'azadpur', line: 'yellow', mins: 8 },
  { from: 'azadpur', to: 'vishwavidyalaya', line: 'yellow', mins: 6 },
  { from: 'vishwavidyalaya', to: 'civil-lines', line: 'yellow', mins: 4 },
  { from: 'civil-lines', to: 'igdtuw-kashmere', line: 'yellow', mins: 4 },
  { from: 'igdtuw-kashmere', to: 'chandni-chowk', line: 'yellow', mins: 3 },
  { from: 'chandni-chowk', to: 'new-delhi', line: 'yellow', mins: 3 },
  { from: 'new-delhi', to: 'rajiv-chowk', line: 'yellow', mins: 3 },
  { from: 'rajiv-chowk', to: 'central-secretariat', line: 'yellow', mins: 4 },
  { from: 'central-secretariat', to: 'ina-market', line: 'yellow', mins: 7 },
  { from: 'ina-market', to: 'aiims', line: 'yellow', mins: 3 },
  { from: 'aiims', to: 'hauz-khas', line: 'yellow', mins: 5 },
  { from: 'hauz-khas', to: 'qutab-minar', line: 'yellow', mins: 8 },
  { from: 'qutab-minar', to: 'sikanderpur', line: 'yellow', mins: 10 },
  { from: 'sikanderpur', to: 'millennium-city', line: 'yellow', mins: 7 },

  // Red Line
  { from: 'rithala', to: 'rohini-sec-18', line: 'red', mins: 6 },
  { from: 'rohini-sec-18', to: 'nsp', line: 'red', mins: 6 },
  { from: 'nsp', to: 'inderlok', line: 'red', mins: 5 },
  { from: 'inderlok', to: 'tis-hazari', line: 'red', mins: 6 },
  { from: 'tis-hazari', to: 'igdtuw-kashmere', line: 'red', mins: 4 },
  { from: 'igdtuw-kashmere', to: 'welcome', line: 'red', mins: 8 },
  { from: 'welcome', to: 'shaheed-sthal', line: 'red', mins: 18 },

  // Pink Line (Ring Corridor)
  { from: 'majlis-park', to: 'azadpur', line: 'pink', mins: 4 },
  { from: 'azadpur', to: 'nsp', line: 'pink', mins: 5 },
  { from: 'nsp', to: 'punjabi-bagh', line: 'pink', mins: 4 },
  { from: 'punjabi-bagh', to: 'rajouri-garden', line: 'pink', mins: 5 },
  { from: 'rajouri-garden', to: 'dhaula-kuan', line: 'pink', mins: 9 },
  { from: 'dhaula-kuan', to: 'ina-market', line: 'pink', mins: 6 },
  { from: 'ina-market', to: 'lajpat-nagar', line: 'pink', mins: 5 },
  { from: 'lajpat-nagar', to: 'mayur-vihar-1', line: 'pink', mins: 8 },
  { from: 'mayur-vihar-1', to: 'anand-vihar', line: 'pink', mins: 9 },
  { from: 'anand-vihar', to: 'karkardooma', line: 'pink', mins: 3 },
  { from: 'karkardooma', to: 'welcome', line: 'pink', mins: 6 },
  { from: 'welcome', to: 'shiv-vihar', line: 'pink', mins: 12 },

  // Magenta Line
  { from: 'janakpuri-west', to: 'palam', line: 'magenta', mins: 8 },
  { from: 'palam', to: 'iit-delhi', line: 'magenta', mins: 11 },
  { from: 'iit-delhi', to: 'hauz-khas', line: 'magenta', mins: 4 },
  { from: 'hauz-khas', to: 'kalkaji-mandir', line: 'magenta', mins: 9 },
  { from: 'kalkaji-mandir', to: 'jamia-millia', line: 'magenta', mins: 7 },
  { from: 'jamia-millia', to: 'botanical-garden', line: 'magenta', mins: 8 },

  // Violet Line
  { from: 'igdtuw-kashmere', to: 'jama-masjid', line: 'violet', mins: 5 },
  { from: 'jama-masjid', to: 'mandi-house', line: 'violet', mins: 6 },
  { from: 'mandi-house', to: 'central-secretariat', line: 'violet', mins: 5 },
  { from: 'central-secretariat', to: 'jln-stadium', line: 'violet', mins: 6 },
  { from: 'jln-stadium', to: 'lajpat-nagar', line: 'violet', mins: 4 },
  { from: 'lajpat-nagar', to: 'kalkaji-mandir', line: 'violet', mins: 8 },
  { from: 'kalkaji-mandir', to: 'badarpur', line: 'violet', mins: 11 },
  { from: 'badarpur', to: 'faridabad', line: 'violet', mins: 15 },

  // Airport Express Orange Line
  { from: 'new-delhi', to: 'dhaula-kuan', line: 'orange', mins: 8 },
  { from: 'dhaula-kuan', to: 'igi-t3', line: 'orange', mins: 7 },
  { from: 'igi-t3', to: 'dwarka-sec-21', line: 'orange', mins: 5 },
  { from: 'dwarka-sec-21', to: 'yashobhoomi', line: 'orange', mins: 4 },

  // Green Line
  { from: 'inderlok', to: 'punjabi-bagh', line: 'green', mins: 4 },
  { from: 'kirti-nagar', to: 'punjabi-bagh', line: 'green', mins: 5 },
  { from: 'punjabi-bagh', to: 'peeragarhi', line: 'green', mins: 8 },
  { from: 'peeragarhi', to: 'bahadurgarh', line: 'green', mins: 18 },
];

export function resolveMemberStationId(locationText: string): string {
  const lower = (locationText || '').toLowerCase();
  if (lower.includes('dwarka mor')) return 'dwarka-mor';
  if (lower.includes('sec 21') || lower.includes('sector 21') || lower.includes('sec 3'))
    return 'dwarka-sec-21';
  if (lower.includes('nsut') || lower.includes('dwarka') || lower.includes('nawada'))
    return 'nsut-nawada';
  if (lower.includes('janakpuri')) return 'janakpuri-west';
  if (lower.includes('rajouri')) return 'rajouri-garden';
  if (lower.includes('karol bagh')) return 'karol-bagh';
  if (lower.includes('civil lines')) return 'civil-lines';
  if (lower.includes('vishwavidyalaya') || lower.includes('north campus'))
    return 'vishwavidyalaya';
  if (lower.includes('igdtuw') || lower.includes('kashmere')) return 'igdtuw-kashmere';
  if (lower.includes('rithala') || lower.includes('rohini')) return 'rohini-sec-18';
  if (lower.includes('nsp') || lower.includes('pitampura') || lower.includes('subhash'))
    return 'nsp';
  if (lower.includes('hauz khas') || lower.includes('sda')) return 'hauz-khas';
  if (lower.includes('iit') || lower.includes('munirka')) return 'iit-delhi';
  if (lower.includes('ina') || lower.includes('south ex')) return 'ina-market';
  if (lower.includes('lajpat')) return 'lajpat-nagar';
  if (lower.includes('jln') || lower.includes('sunder')) return 'jln-stadium';
  if (lower.includes('noida')) return 'noida-sec-18';
  if (lower.includes('botanical')) return 'botanical-garden';
  if (lower.includes('mandi house')) return 'mandi-house';
  if (lower.includes('rajiv') || lower.includes('connaught')) return 'rajiv-chowk';
  if (lower.includes('gurugram') || lower.includes('sikanderpur')) return 'sikanderpur';
  return 'janakpuri-west';
}

export interface ComputedTransitRoute {
  memberId: string;
  memberName: string;
  initials: string;
  memberProfile: Member;
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
  const [selectedLineFilter, setSelectedLineFilter] = useState<DmrcLineId | 'all'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const stationMap = useMemo(() => {
    const map: Record<string, DmrcStation> = {};
    DMRC_STATIONS.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, []);

  const hubStationId = useMemo(() => {
    if (activeHub.id === 'igdtuw-kashmere') return 'igdtuw-kashmere';
    if (activeHub.id === 'connaught-place') return 'rajiv-chowk';
    if (activeHub.id === 'dilli-haat-ina') return 'ina-market';
    if (activeHub.id === 'sunder-nursery') return 'jln-stadium';
    if (activeHub.id === 'netaji-subhash-place') return 'nsp';
    return 'nsut-nawada';
  }, [activeHub.id]);

  const hubStation = stationMap[hubStationId] || DMRC_STATIONS[2];

  // Combine current user + squad members into unified list with computed DMRC paths
  const memberRoutes = useMemo<ComputedTransitRoute[]>(() => {
    const routes: ComputedTransitRoute[] = [];

    const userStId = resolveMemberStationId(userLocation);
    const userHomeSt = stationMap[userStId] || stationMap['dwarka-mor'];
    const userPath = findShortestDmrcPath(userHomeSt.id, hubStation.id);
    const userSched = calculateParticipantSchedule(userCurfew, userLocation);

    const cleanUser = (userName || 'Saumay').trim();
    const userProfile = memberById(cleanUser);
    routes.push({
      memberId: 'current-user',
      memberName: cleanUser,
      initials: cleanUser.slice(0, 2).toUpperCase(),
      memberProfile: userProfile,
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
      const profile = memberById(m.name);

      routes.push({
        memberId: m.id,
        memberName: m.name,
        initials: m.initials,
        memberProfile: profile,
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

  // Group members by home station ID so badges stack cleanly without overlapping
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

  // Dynamic viewBox for zoom centered on the network or focused hub
  const viewBoxStr = useMemo(() => {
    const fullW = 1040;
    const fullH = 760;
    if (zoomLevel <= 1) return `0 0 ${fullW} ${fullH}`;
    const w = Math.round(fullW / zoomLevel);
    const h = Math.round(fullH / zoomLevel);
    const centerSt = selectedStation || hubStation;
    const cx = Math.max(w / 2, Math.min(fullW - w / 2, centerSt.x));
    const cy = Math.max(h / 2, Math.min(fullH - h / 2, centerSt.y));
    return `${Math.round(cx - w / 2)} ${Math.round(cy - h / 2)} ${w} ${h}`;
  }, [zoomLevel, selectedStation, hubStation]);

  return (
    <div className="flex flex-col gap-4">
      {/* Control Card: Squad Path Filter + Complete 8-Line Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Navigation className="h-3.5 w-3.5 text-primary" aria-hidden />
              Squad Transit Paths:
            </span>
            <button
              type="button"
              onClick={() => {
                setFocusedMemberId('all');
                setSelectedStationId(null);
              }}
              className={
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors ' +
                (focusedMemberId === 'all'
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground')
              }
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
                  className={
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ' +
                    (isSelected
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-accent')
                  }
                >
                  <FriendAvatar member={route.memberProfile} size={18} />
                  <span>{route.isCurrentUser ? `${route.memberName} (You)` : route.memberName}</span>
                  <span className="text-[11px] text-muted-foreground">
                    · {route.stopsCount} stops
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* All 8 DMRC Lines Interactive Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedLineFilter('all')}
              className={
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ' +
                (selectedLineFilter === 'all'
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground')
              }
            >
              All 8 Lines ({DMRC_STATIONS.length} stations)
            </button>
            {(Object.keys(DMRC_LINE_META) as DmrcLineId[]).map((lineKey) => {
              const active = selectedLineFilter === lineKey;
              return (
                <button
                  key={lineKey}
                  type="button"
                  onClick={() =>
                    setSelectedLineFilter(active ? 'all' : lineKey)
                  }
                  className={
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ' +
                    (active
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-transparent bg-surface-sunk text-muted-foreground hover:text-foreground')
                  }
                >
                  <span
                    className="h-2 w-3.5 rounded-full"
                    style={{ backgroundColor: DMRC_LINE_META[lineKey].color }}
                    aria-hidden
                  />
                  <span>{DMRC_LINE_META[lineKey].shortLabel}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-muted-foreground">
            Click any station to inspect lines or switch hub
          </span>
        </div>
      </div>

      {/* Complete Delhi NCR DMRC Network Map Canvas */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lift select-none">
        {/* Top Overlay Bar: Active Hub + Safety Badge + Zoom Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-sunk/70 px-3.5 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-2xs">
              <TrainFront className="h-3.5 w-3.5 text-primary" aria-hidden />
              <span>Central Hub:</span>
              <span className="text-primary">{hubStation.name}</span>
            </span>

            {mode === 'safe' && (
              <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Pink Saheli Stations Active
              </span>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.2, Number((z + 0.35).toFixed(2))))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(1, Number((z - 0.35).toFixed(2))))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setSelectedStationId(null);
                setFocusedMemberId('all');
                setSelectedLineFilter('all');
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Reset full Delhi NCR network view"
            >
              <Maximize2 className="h-3 w-3" />
              <span>Full Map</span>
            </button>
          </div>
        </div>

        {/* Interactive SVG Canvas showing the ENTIRE Delhi NCR DMRC Network */}
        <div className="relative w-full aspect-[1040/720] min-h-[420px] max-h-[680px]">
          <svg
            className="h-full w-full"
            viewBox={viewBoxStr}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="dmrc-grid-full" width="36" height="36" patternUnits="userSpaceOnUse">
                <path
                  d="M 36 0 L 0 0 0 36"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="0.6"
                  opacity="0.45"
                />
              </pattern>
              <filter id="hub-glow-full" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="var(--color-primary)"
                  floodOpacity="0.4"
                />
              </filter>
            </defs>

            <rect width="1040" height="760" fill="var(--color-card)" />
            <rect width="1040" height="760" fill="url(#dmrc-grid-full)" />

            {/* Yamuna River Geographical Path */}
            <path
              d="M 580 15 C 595 110, 585 190, 602 255 C 625 320, 665 355, 690 420 C 715 485, 745 595, 795 750"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.11"
            />

            {/* NCR Zone Watermarks */}
            <g
              opacity="0.34"
              fill="var(--color-muted-foreground)"
              fontSize="10"
              fontWeight="700"
              letterSpacing="1.8"
            >
              <text x="160" y="82">ROHINI · NORTH-WEST DELHI</text>
              <text x="580" y="46">NORTH CAMPUS · BADLI</text>
              <text x="805" y="155">SHAHDARA · GHAZIABAD</text>
              <text x="80" y="425">DWARKA · NSUT CAMPUS</text>
              <text x="820" y="525">NOIDA · BOTANICAL</text>
              <text x="195" y="685">GURUGRAM · MILLENNIUM CITY</text>
              <text x="770" y="685">FARIDABAD</text>
            </g>

            {/* 1. All 8 Base DMRC Metro Line Tracks */}
            {DMRC_EDGES.map((edge, idx) => {
              const stFrom = stationMap[edge.from];
              const stTo = stationMap[edge.to];
              if (!stFrom || !stTo) return null;
              const lineColor = DMRC_LINE_META[edge.line].color;

              const dimmedByMember =
                focusedMemberId !== 'all' &&
                !(activePathStationIds.has(edge.from) && activePathStationIds.has(edge.to));
              const dimmedByLine =
                selectedLineFilter !== 'all' && edge.line !== selectedLineFilter;
              const isDimmed = dimmedByMember || dimmedByLine;

              return (
                <line
                  key={`edge-${idx}`}
                  x1={stFrom.x}
                  y1={stFrom.y}
                  x2={stTo.x}
                  y2={stTo.y}
                  stroke={lineColor}
                  strokeWidth={isDimmed ? 3 : edge.line === 'orange' ? 4.5 : 5.5}
                  strokeDasharray={edge.line === 'orange' ? '9 5' : undefined}
                  strokeLinecap="round"
                  opacity={isDimmed ? 0.16 : 0.85}
                />
              );
            })}

            {/* 2. Highlighted Member-to-Hub Transit Path Overlays */}
            {activeRoutes.map((route) => {
              if (route.stationPath.length < 2) return null;
              const pointsAttr = route.stationPath.map((s) => `${s.x},${s.y}`).join(' ');
              return (
                <g key={`route-overlay-${route.memberId}`}>
                  <polyline
                    points={pointsAttr}
                    fill="none"
                    stroke={route.memberProfile.color}
                    strokeWidth={focusedMemberId === route.memberId ? 9.5 : 7.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={focusedMemberId === 'all' ? 0.32 : 0.55}
                  />
                  <polyline
                    points={pointsAttr}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2.2}
                    strokeDasharray="6 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="anim-dash"
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
                  r={26}
                  fill="#10b981"
                  opacity={0.14}
                />
                <circle
                  cx={hubStation.x}
                  cy={hubStation.y}
                  r={26}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={1.4}
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
              </g>
            )}

            {/* 4. DMRC Station Nodes & Labels */}
            {DMRC_STATIONS.map((station) => {
              const isCentralHub = station.id === hubStation.id;
              const isOtherHub = Boolean(station.hubId && station.hubId !== activeHub.id);
              const isOnActivePath = activePathStationIds.has(station.id);
              const isSelected = selectedStationId === station.id;
              const matchesLineFilter =
                selectedLineFilter === 'all' || station.lines.includes(selectedLineFilter);
              const primaryColor = DMRC_LINE_META[station.lines[0]].color;

              let labelDy = 15;
              let labelDx = 0;
              let anchor: 'middle' | 'start' | 'end' = 'middle';
              if (station.labelPos === 'top') labelDy = -11;
              if (station.labelPos === 'right') {
                labelDx = 11;
                labelDy = 3;
                anchor = 'start';
              }
              if (station.labelPos === 'left') {
                labelDx = -11;
                labelDy = 3;
                anchor = 'end';
              }

              const dimmed =
                (!matchesLineFilter ||
                  (focusedMemberId !== 'all' && !isOnActivePath && !isCentralHub));

              return (
                <g
                  key={station.id}
                  className="cursor-pointer"
                  opacity={dimmed ? 0.3 : 1}
                  onClick={() => {
                    setSelectedStationId(station.id);
                    if (station.hubId) {
                      onSelectHub(station.hubId);
                    }
                  }}
                >
                  {/* Safe Case Pink Saheli Verified Dot */}
                  {mode === 'safe' && station.pinkSaheliBooth && (
                    <circle
                      cx={station.x + 8}
                      cy={station.y - 8}
                      r={3.6}
                      fill="#10b981"
                      stroke="var(--color-card)"
                      strokeWidth={1.2}
                    />
                  )}

                  {/* Interchange Outer Ring */}
                  {station.isInterchange && (
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r={isCentralHub ? 11.5 : 7.8}
                      fill="var(--color-card)"
                      stroke="var(--color-foreground)"
                      strokeWidth={1.8}
                    />
                  )}

                  {/* Station Core Circle */}
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={isCentralHub ? 8.5 : isOtherHub ? 6.5 : station.isInterchange ? 4.8 : 4.2}
                    fill={
                      isCentralHub
                        ? 'var(--color-primary)'
                        : isSelected
                          ? 'var(--color-foreground)'
                          : 'var(--color-background)'
                    }
                    stroke={isCentralHub ? '#ffffff' : primaryColor}
                    strokeWidth={2.4}
                  />

                  {/* Station Name Label */}
                  <text
                    x={station.x + labelDx}
                    y={station.y + labelDy}
                    textAnchor={anchor}
                    fontSize={isCentralHub || station.isInterchange ? 9.5 : 8.5}
                    fontWeight={isCentralHub || isOnActivePath || station.isInterchange ? 700 : 600}
                    fill={
                      isCentralHub
                        ? 'var(--color-primary)'
                        : isOnActivePath
                          ? 'var(--color-foreground)'
                          : 'var(--color-muted-foreground)'
                    }
                  >
                    {station.shortName}
                  </text>
                </g>
              );
            })}

            {/* 5. Active Central Hub Callout Banner */}
            <g
              transform={`translate(${hubStation.x}, ${hubStation.y - 26})`}
              filter="url(#hub-glow-full)"
              className="cursor-pointer"
              onClick={() => setSelectedStationId(hubStation.id)}
            >
              <rect
                x={-74}
                y={-13}
                width={148}
                height={19}
                rx={9.5}
                fill="var(--color-primary)"
                stroke="var(--color-card)"
                strokeWidth={1.6}
              />
              <text
                x={0}
                y={-0.5}
                textAnchor="middle"
                fill="var(--color-primary-foreground)"
                fontSize={8.8}
                fontWeight="700"
              >
                HUB: {hubStation.shortName.toUpperCase()}
              </text>
            </g>

            {/* 6. Squad Member Home Station Badges (colored with each friend's Travety color) */}
            {Object.entries(membersByHomeStation).map(([stId, routesAtStation]) => {
              const st = stationMap[stId];
              if (!st) return null;
              return routesAtStation.map((route, stackIdx) => {
                const isHighlighted =
                  focusedMemberId === 'all' || focusedMemberId === route.memberId;
                const placeBelow = st.y < 140 || st.id === hubStation.id;
                const offsetY = placeBelow
                  ? 24 + stackIdx * 18
                  : -22 - stackIdx * 18;
                const offsetX = stackIdx % 2 === 0 ? 0 : 14;

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
                      x={-30}
                      y={-8.5}
                      width={60}
                      height={16}
                      rx={8}
                      fill={route.memberProfile.color}
                      stroke="var(--color-card)"
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={2.5}
                      textAnchor="middle"
                      fill="#252541"
                      fontSize={8.5}
                      fontWeight="700"
                    >
                      {route.isCurrentUser ? `${route.memberName} ★` : route.memberName}
                    </text>
                  </g>
                );
              });
            })}
          </svg>

          {/* Interactive Station or Member Route Inspector Floating Card */}
          {(focusedSingleRoute || selectedStation) && (
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-start justify-between gap-3 rounded-2xl border border-border bg-card/95 p-3.5 shadow-lift backdrop-blur-md sm:right-auto sm:w-96">
              {focusedSingleRoute ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <FriendAvatar member={focusedSingleRoute.memberProfile} size={24} />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {focusedSingleRoute.memberName}&apos;s Metro Path ({focusedSingleRoute.stopsCount}{' '}
                      stops · ~{focusedSingleRoute.totalMins} mins)
                    </span>
                  </div>
                  <div className="font-display text-sm font-bold text-foreground">
                    {focusedSingleRoute.homeStation.shortName} →{' '}
                    {focusedSingleRoute.hubStation.shortName}
                  </div>
                  <div className="text-xs leading-relaxed text-muted-foreground">
                    {focusedSingleRoute.stationPath.map((s) => s.shortName).join(' → ')}
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-primary">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    <span>Leave by {focusedSingleRoute.leaveByTime}</span>
                    <span>·</span>
                    <span>Curfew {focusedSingleRoute.curfewFormatted}</span>
                  </div>
                </div>
              ) : selectedStation ? (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    {selectedStation.isInterchange
                      ? 'DMRC Multi-Line Interchange'
                      : 'DMRC Metro Station'}
                  </div>
                  <div className="font-display text-sm font-bold text-foreground">
                    {selectedStation.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {selectedStation.lines.map((l) => (
                      <span
                        key={l}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${DMRC_LINE_META[l].badgeBg}`}
                      >
                        {DMRC_LINE_META[l].shortLabel} Line
                      </span>
                    ))}
                    {mode === 'safe' && selectedStation.pinkSaheliBooth && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Pink Saheli Desk
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
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Close station inspector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Squad Member Station-to-Hub Path Summary Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {memberRoutes.map((route) => {
          const isFocused = focusedMemberId === route.memberId;
          return (
            <button
              key={route.memberId}
              type="button"
              onClick={() =>
                setFocusedMemberId(isFocused ? 'all' : route.memberId)
              }
              className={
                'flex flex-col gap-1.5 rounded-2xl border p-3.5 text-left shadow-soft transition-all ' +
                (isFocused
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:bg-accent')
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-display text-sm font-bold text-foreground truncate">
                  <FriendAvatar member={route.memberProfile} size={24} />
                  <span className="truncate">
                    {route.isCurrentUser ? `${route.memberName} (You)` : route.memberName}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {route.stopsCount === 0
                    ? 'At Hub'
                    : `${route.stopsCount} stops · ${route.totalMins}m`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span className="truncate">
                  {route.homeStation.shortName} → {route.hubStation.shortName}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-1.5 text-[11px] text-muted-foreground">
                <span className="truncate">
                  {route.interchanges.length > 0
                    ? `Interchange: ${route.interchanges.join(', ')}`
                    : `Direct ${DMRC_LINE_META[route.linesUsed[0] || 'blue'].shortLabel} Line`}
                </span>
                <span className="shrink-0 font-semibold text-foreground">
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

import { getApiUrl } from './lib/api.ts';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  Bell,
  CalendarDays,
  CircleHelp,
  Compass,
  Heart,
  History,
  Home,
  Mail,
  Map as MapIcon,
  PenSquare,
  Scale,
  ShieldCheck,
  Star,
  User as UserIcon,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  auth,
  db,
  handleFirestoreError,
  logOutUser,
  OperationType,
  signInWithGoogle,
} from './firebase';
import {
  AppMode,
  AreaReviewItem,
  calculateParticipantSchedule,
  DEFAULT_AREA_REVIEWS,
  DEFAULT_PAST_OUTINGS,
  DEFAULT_POLL_OPTIONS,
  DEFAULT_SQUAD_MEMBERS,
  GenderProfile,
  LobbyData,
  PastOuting,
  PollItem,
  rankHubsByMode,
  SquadMember,
} from './data/ncrMetroData';
import {
  destBySlug,
  INITIAL_EXPENSES,
  INITIAL_NOTIFICATIONS,
  memberById,
  MEMBERS,
  type ExpenseItem,
  type MemberId,
  type NotificationItem,
} from './data/travityData';
import { LanguageProvider, ThemeProvider, useT, type TKey } from './lib/ui-prefs';
import { AuthView, AuthSession } from './components/AuthView';
import { DemoBadge, FriendAvatar, TravisImg } from './components/travity/TravityBits';
import {
  DashboardPage,
  DestinationDetailPage,
  ExplorePage,
  GroupLobbyPage,
  JoinPlanPage,
  PlanOutingPage,
  RecommendationsPage,
  RouteMapPage,
  SafetyPage,
  SavedPage,
  type ActivePlanState,
  type GroupChatNote,
  type TravityPageId,
} from './components/travity/TravityPages';
import {
  CalendarPage,
  ExpensesPage,
  HelpPage,
  InvitationsPage,
  MyOutingsPage,
  NotificationsPage,
  PastOutingsTravityPage,
  ProfilePage,
  ReviewsTravityPage,
  TravityHeader,
} from './components/travity/TravityMorePages';
import { SosModal } from './components/SosModal';
import { ChatMessageItem, GeminiChatDrawer } from './components/GeminiChatDrawer';

const DEFAULT_LOBBY: LobbyData = {
  code: 'TRV-8492',
  title: 'NSUT × IGDTUW Squad Meet',
  hostName: 'Saumay',
  hostId: 'demo-saumay',
  mode: 'safe',
  centralHub: 'NSUT (Netaji Subhas University of Technology)',
  departureTime: '7:45 PM',
  activePings: 5,
  lastPingBy: 'Saumay',
  sosActive: false,
};

const DEFAULT_CHAT_MESSAGES: ChatMessageItem[] = [
  {
    id: 'msg-welcome',
    role: 'model',
    text: 'Hi! I am Travis, your Travety Gemini Assistant for the NSUT & IGDTUW squad (Devika, Vansh, Saumay, Rimsha, and Pragya).\n\n• Ask me to plan curfew-safe DMRC Blue & Yellow Line routes between NSUT (Dwarka Mor) and IGDTUW (Kashmere Gate)\n• Toggle Google Search Grounding ON for live Delhi weather, DMRC metro updates, and student cafes with verified web citations\n• Switch between Fast (3.1 Flash-Lite) and General (3.8 Flash) reasoning modes.',
    modelUsed: 'gemini-3.8-flash',
    timestamp: 'Ready',
  },
];

const DEFAULT_GROUP_NOTES: GroupChatNote[] = [
  {
    id: 'gn-1',
    memberId: 'devika',
    text: 'Leaving IGDTUW Kashmere Gate Gate 6 by 5:00 PM — let’s meet before curfew!',
    time: '16:40',
  },
  {
    id: 'gn-2',
    memberId: 'vansh',
    text: 'Saumay and I are at NSUT Main Gate (Dwarka Sec 3), boarding Blue Line.',
    time: '16:45',
  },
  {
    id: 'gn-3',
    memberId: 'rimsha',
    text: 'My curfew is 8:15 PM at Civil Lines, so let’s wrap up by 7:40 PM.',
    time: '16:48',
  },
];

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface NavItem {
  id: TravityPageId;
  labelKey: TKey;
  icon: LucideIcon;
}

const NAV_GROUPS: NavItem[][] = [
  [
    { id: 'dashboard', labelKey: 'nav.home', icon: Home },
    { id: 'plan', labelKey: 'nav.plan', icon: PenSquare },
    { id: 'join', labelKey: 'nav.join', icon: Compass },
  ],
  [
    { id: 'lobby', labelKey: 'nav.lobby', icon: Users },
    { id: 'recommendations', labelKey: 'nav.recommendations', icon: Scale },
    { id: 'explore', labelKey: 'nav.explore', icon: Compass },
    { id: 'saved', labelKey: 'nav.saved', icon: Heart },
    { id: 'map', labelKey: 'map.title', icon: MapIcon },
    { id: 'safety', labelKey: 'safety.title', icon: ShieldCheck },
  ],
  [
    { id: 'outings', labelKey: 'nav.upcoming', icon: CalendarDays },
    { id: 'calendar', labelKey: 'nav.calendar', icon: CalendarDays },
    { id: 'invitations', labelKey: 'nav.invitations', icon: Mail },
    { id: 'past', labelKey: 'nav.past', icon: History },
    { id: 'reviews', labelKey: 'nav.reviews', icon: Star },
    { id: 'expenses', labelKey: 'nav.expenses', icon: Wallet },
  ],
  [
    { id: 'notifications', labelKey: 'nav.notifications', icon: Bell },
    { id: 'profile', labelKey: 'nav.profile', icon: UserIcon },
    { id: 'help', labelKey: 'nav.help', icon: CircleHelp },
  ],
];

const BOTTOM_TABS: { id: TravityPageId; key: string; icon: LucideIcon }[] = [
  { id: 'dashboard', key: 'tab.home', icon: Home },
  { id: 'calendar', key: 'tab.calendar', icon: CalendarDays },
  { id: 'map', key: 'tab.map', icon: MapIcon },
  { id: 'lobby', key: 'tab.invites', icon: Users },
  { id: 'profile', key: 'tab.profile', icon: UserIcon },
];

function TravityShell() {
  const { t, dt } = useT();

  const [currentPage, setCurrentPage] = useState<TravityPageId>('dashboard');
  const [pageHistory, setPageHistory] = useState<TravityPageId[]>([]);
  const [selectedDestSlug, setSelectedDestSlug] = useState<string>('nsut-dwarka-hub');

  const [user, setUser] = useState<User | null>(null);
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('travety_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(() =>
    loadStored<ChatMessageItem[]>('travety_chat_v2', DEFAULT_CHAT_MESSAGES)
  );

  // Existing Backend & Persisted State
  const [lobbyCode, setLobbyCode] = useState<string>('TRV-8492');
  const [lobby, setLobby] = useState<LobbyData>(() =>
    loadStored<LobbyData>('travety_lobby_v2', DEFAULT_LOBBY)
  );
  const [mode, setMode] = useState<AppMode>(() =>
    loadStored<AppMode>('travety_mode_v2', 'safe')
  );
  const [members, setMembers] = useState<SquadMember[]>(() =>
    loadStored<SquadMember[]>('travety_members_v2', DEFAULT_SQUAD_MEMBERS)
  );
  const [pollOptions, setPollOptions] = useState<PollItem[]>(() =>
    loadStored<PollItem[]>('travety_polls_v2', DEFAULT_POLL_OPTIONS)
  );
  const [pastOutings] = useState<PastOuting[]>(DEFAULT_PAST_OUTINGS);
  const [reviews, setReviews] = useState<AreaReviewItem[]>(() =>
    loadStored<AreaReviewItem[]>('travety_reviews_v2', DEFAULT_AREA_REVIEWS)
  );
  const [prefillReviewArea, setPrefillReviewArea] = useState<string>('');

  // Travity UI Extended State
  const [activeMemberId, setActiveMemberId] = useState<MemberId>('saumay');
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    loadStored<string[]>('travity_saved_v2', [
      'nsut-dwarka-hub',
      'igdtuw-kashmere-gate',
      'connaught-place',
    ])
  );
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() =>
    loadStored<ExpenseItem[]>('travity_expenses_v2', INITIAL_EXPENSES)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadStored<NotificationItem[]>('travity_notifs_v2', INITIAL_NOTIFICATIONS)
  );
  const [startPoints, setStartPoints] = useState<Partial<Record<MemberId, string>>>(() =>
    loadStored<Partial<Record<MemberId, string>>>('travity_starts_v2', {
      saumay: 'dwarka-mor',
      devika: 'kashmere-gate',
      vansh: 'dwarka-sec-21',
      rimsha: 'civil-lines',
      pragya: 'janakpuri-west',
    })
  );
  const [groupChat, setGroupChat] = useState<GroupChatNote[]>(() =>
    loadStored<GroupChatNote[]>('travity_group_notes_v2', DEFAULT_GROUP_NOTES)
  );
  const [planKind, setPlanKind] = useState<string>('Campus & Cafes');
  const [planDate, setPlanDate] = useState<string>('2026-10-30');
  const [planMemberIds, setPlanMemberIds] = useState<MemberId[]>([
    'saumay',
    'devika',
    'vansh',
    'rimsha',
    'pragya',
  ]);
  const [chosenDestinationSlug, setChosenDestinationSlug] = useState<string | null>(
    'nsut-dwarka-hub'
  );

  // Active Participant State synced with backend
  const [userName, setUserName] = useState<string>('Saumay');
  const [userPhone, setUserPhone] = useState<string>('+91 99104 88123');
  const [location, setLocation] = useState<string>('NSUT, Dwarka Mor');
  const [gender, setGender] = useState<GenderProfile>('male');
  const [curfew, setCurfew] = useState<string>('21:30');
  const [accompanyingDetails, setAccompanyingDetails] = useState<string>(
    'Escorting squad till Blue Line interchange'
  );
  const [budget, setBudget] = useState<number>(450);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  const navigateTo = (nextPage: TravityPageId) => {
    setPageHistory((prev) => [...prev.slice(-12), currentPage]);
    setCurrentPage(nextPage);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (pageHistory.length > 0) {
      const prev = pageHistory[pageHistory.length - 1]!;
      setPageHistory((h) => h.slice(0, -1));
      setCurrentPage(prev);
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    try {
      localStorage.setItem('travety_auth_session', JSON.stringify(session));
    } catch {
      // ignore
    }
    if (session.memberId) {
      handleSelectSquadMember(session.memberId);
    } else if (session.displayName) {
      setUserName(session.displayName);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOutUser();
    } catch {
      // ignore
    }
    setUser(null);
    setAuthSession(null);
    try {
      localStorage.removeItem('travety_auth_session');
    } catch {
      // ignore
    }
  };

  const handleSelectSquadMember = (memberId: MemberId) => {
    setActiveMemberId(memberId);
    const m = memberById(memberId);
    setUserName(m.name);
    setUserPhone(m.phone);
    setLocation(m.homeLabel.replace(' · ', ', '));
    setGender(m.gender);
    setCurfew(m.curfew);
    setBudget(m.budget);
  };

  // Persist local caches
  useEffect(() => {
    try {
      localStorage.setItem('travety_lobby_v2', JSON.stringify(lobby));
      localStorage.setItem('travety_mode_v2', JSON.stringify(mode));
      localStorage.setItem('travety_members_v2', JSON.stringify(members));
      localStorage.setItem('travety_polls_v2', JSON.stringify(pollOptions));
      localStorage.setItem('travety_reviews_v2', JSON.stringify(reviews));
      localStorage.setItem('travety_chat_v2', JSON.stringify(chatMessages));
      localStorage.setItem('travity_saved_v2', JSON.stringify(savedIds));
      localStorage.setItem('travity_expenses_v2', JSON.stringify(expenses));
      localStorage.setItem('travity_notifs_v2', JSON.stringify(notifications));
      localStorage.setItem('travity_starts_v2', JSON.stringify(startPoints));
      localStorage.setItem('travity_group_notes_v2', JSON.stringify(groupChat));
    } catch {
      // Ignore storage quota
    }
  }, [
    lobby,
    mode,
    members,
    pollOptions,
    reviews,
    chatMessages,
    savedIds,
    expenses,
    notifications,
    startPoints,
    groupChat,
  ]);

  // Listen for Google Maps Demo Key Quota Exceeded events
  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  // Helper to call authenticated Cloud SQL endpoints with in-memory Firebase ID token
  const callSqlApi = async (path: string, method: 'GET' | 'POST', body?: unknown) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : 'demo-saumay';
      const devUid = auth.currentUser?.uid || user?.uid || authSession?.uid || 'demo-rimsha';
      const res = await fetch(getApiUrl(path), {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-dev-user-id': devUid,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  // Track Firebase Auth State & Sync User Profile to Cloud SQL
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.displayName) {
        const first = currentUser.displayName.split(' ')[0]!;
        const matched = MEMBERS.find((m) => m.name.toLowerCase() === first.toLowerCase());
        if (matched) {
          handleSelectSquadMember(matched.id);
        } else {
          setUserName(currentUser.displayName);
        }
      }
      setAuthReady(true);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          await fetch('/api/sql/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              displayName: currentUser.displayName || 'Saumay',
            }),
          });
        } catch {
          // Non-fatal
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Lobby, Members, Polls, and Reviews when authenticated (Cloud SQL + Firestore)
  useEffect(() => {
    if (!authReady || !user || !lobbyCode) return;

    const loadFromSql = async () => {
      const data = await callSqlApi(`/api/sql/lobby/${encodeURIComponent(lobbyCode)}`, 'GET');
      if (!data) return;

      if (data.lobby) {
        const loadedMode: AppMode = data.lobby.mode === 'fun' ? 'fun' : 'safe';
        setMode(loadedMode);
        setLobby({
          code: data.lobby.code || lobbyCode,
          title: data.lobby.title || 'NSUT × IGDTUW Squad Meet',
          hostName: data.lobby.hostName || 'Saumay',
          hostId: data.lobby.hostId || user?.uid || 'demo-saumay',
          mode: loadedMode,
          centralHub:
            data.lobby.centralHub || 'NSUT (Netaji Subhas University of Technology)',
          departureTime: data.lobby.departureTime || '7:45 PM',
          activePings: typeof data.lobby.activePings === 'number' ? data.lobby.activePings : 5,
          lastPingBy: data.lobby.lastPingBy || 'Saumay',
          sosActive: Boolean(data.lobby.sosActive),
        });
      }

      if (Array.isArray(data.members) && data.members.length > 0) {
        const merged = [...DEFAULT_SQUAD_MEMBERS];
        for (const d of data.members) {
          const item: SquadMember = {
            id: d.id,
            lobbyCode: d.lobbyCode,
            userId: d.userId,
            name: d.name,
            initials: d.initials,
            gender: d.gender === 'male' ? 'male' : 'female',
            location: d.location || 'NSUT, Dwarka Mor',
            curfew: d.curfew || '20:30',
            accompanyingDetails: d.accompanyingDetails || 'Blue Line Metro',
            budget: typeof d.budget === 'number' ? d.budget : 450,
            phone: d.phone || '+91 98110 44210',
            leaveByTime: d.leaveByTime || '7:55 PM',
            transitMins: typeof d.transitMins === 'number' ? d.transitMins : 32,
          };
          const idx = merged.findIndex(
            (m) => m.id === item.id || m.name.toLowerCase() === item.name.toLowerCase()
          );
          if (idx >= 0) {
            merged[idx] = item;
          } else {
            merged.push(item);
          }
        }
        setMembers(merged);
      }

      if (Array.isArray(data.reviews) && data.reviews.length > 0) {
        const mergedRevs = [...DEFAULT_AREA_REVIEWS];
        for (const r of data.reviews) {
          if (!mergedRevs.some((m) => m.id === r.id)) {
            mergedRevs.unshift({
              id: r.id,
              userId: r.userId,
              authorName: r.authorName,
              areaName: r.areaName,
              safetyRating: r.safetyRating,
              lightingStatus: r.lightingStatus,
              issueFlag: r.issueFlag,
              comment: r.comment,
              dateLabel: 'Recent',
            });
          }
        }
        setReviews(mergedRevs);
      }
    };

    loadFromSql();

    const lobbyRef = doc(db, 'lobbies', lobbyCode);

    const ensureAndListen = async () => {
      try {
        const snap = await getDoc(lobbyRef);
        if (!snap.exists()) {
          await setDoc(lobbyRef, {
            code: lobbyCode,
            title: lobby.title,
            hostName: (user?.displayName || userName || 'Saumay').slice(0, 50),
            hostId: user?.uid || 'demo-saumay',
            mode: mode,
            centralHub: lobby.centralHub,
            departureTime: lobby.departureTime,
            activePings: 5,
            lastPingBy: (user?.displayName || userName || 'Saumay').slice(0, 60),
            sosActive: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch {
        // ignore
      }
    };

    ensureAndListen();

    const unsubLobby = onSnapshot(
      lobbyRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const loadedMode: AppMode = data.mode === 'fun' ? 'fun' : 'safe';
          setMode(loadedMode);
          setLobby({
            code: data.code || lobbyCode,
            title: data.title || 'NSUT × IGDTUW Squad Meet',
            hostName: data.hostName || 'Saumay',
            hostId: data.hostId || user?.uid || 'demo-saumay',
            mode: loadedMode,
            centralHub: data.centralHub || 'NSUT (Netaji Subhas University of Technology)',
            departureTime: data.departureTime || '7:45 PM',
            activePings: typeof data.activePings === 'number' ? data.activePings : 5,
            lastPingBy: data.lastPingBy || 'Saumay',
            sosActive: Boolean(data.sosActive),
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `lobbies/${lobbyCode}`);
      }
    );

    const reviewsQuery = query(collection(db, 'reviews'), where('safetyRating', '>=', 1));
    const unsubReviews = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedRevs: AreaReviewItem[] = snapshot.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              userId: d.userId,
              authorName: d.authorName,
              areaName: d.areaName,
              safetyRating: d.safetyRating,
              lightingStatus: d.lightingStatus,
              issueFlag: d.issueFlag,
              comment: d.comment,
              dateLabel: 'Recent',
            };
          });
          const mergedRevs = [...DEFAULT_AREA_REVIEWS];
          for (const r of loadedRevs) {
            if (!mergedRevs.some((m) => m.id === r.id)) {
              mergedRevs.unshift(r);
            }
          }
          setReviews(mergedRevs);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'reviews');
      }
    );

    return () => {
      unsubLobby();
      unsubReviews();
    };
  }, [authReady, user, lobbyCode]);

  const handleModeChange = async (nextMode: AppMode) => {
    setMode(nextMode);
    const ranked = rankHubsByMode(nextMode, budget || 450);
    const nextHub = ranked[0].name;
    const updatedLobby: LobbyData = {
      ...lobby,
      mode: nextMode,
      centralHub: nextHub,
    };
    setLobby(updatedLobby);

    if (user) {
      callSqlApi('/api/sql/lobby', 'POST', updatedLobby);
      try {
        await updateDoc(doc(db, 'lobbies', lobbyCode), {
          mode: nextMode,
          centralHub: nextHub,
          departureTime: lobby.departureTime,
          activePings: lobby.activePings,
          lastPingBy: lobby.lastPingBy,
          sosActive: lobby.sosActive,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // ignore
      }
    }
  };

  const handleCreatePlan = async (input: {
    title: string;
    kind: string;
    date: string;
    budget: number;
    memberIds: MemberId[];
  }) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `TRV-${randomNum}`;
    const titleToUse = (input.title || 'NSUT × IGDTUW Squad Meet').slice(0, 80);
    const hostDisplay = (user?.displayName || userName || 'Saumay').slice(0, 50);
    const ranked = rankHubsByMode(mode, input.budget || 450);

    const newLobbyObj: LobbyData = {
      code: newCode,
      title: titleToUse,
      hostName: hostDisplay,
      hostId: user?.uid || 'demo-saumay',
      mode,
      centralHub: ranked[0].name,
      departureTime: '7:45 PM',
      activePings: input.memberIds.length,
      lastPingBy: hostDisplay,
      sosActive: false,
    };

    setPlanKind(input.kind);
    setPlanDate(input.date);
    setBudget(input.budget);
    setPlanMemberIds(input.memberIds);
    setLobbyCode(newCode);
    setLobby(newLobbyObj);
    navigateTo('lobby');

    if (user) {
      callSqlApi('/api/sql/lobby', 'POST', newLobbyObj);
      try {
        await setDoc(doc(db, 'lobbies', newCode), {
          ...newLobbyObj,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `lobbies/${newCode}`);
      }
    }

    setBannerMessage(`Created Plan "${titleToUse}" (${newCode}).`);
    setTimeout(() => setBannerMessage(null), 3000);
  };

  const handleJoinCode = (codeInput: string) => {
    const cleanCode = codeInput.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'TRV-8492';
    setLobbyCode(cleanCode);
    setLobby((prev) => ({
      ...prev,
      code: cleanCode,
    }));
    navigateTo('lobby');
    setBannerMessage(`Joined Lobby ${cleanCode}.`);
    setTimeout(() => setBannerMessage(null), 2500);
  };

  const handleSetStartPoint = async (memberId: MemberId, stationId: string) => {
    setStartPoints((prev) => ({ ...prev, [memberId]: stationId }));
    const m = memberById(memberId);
    const calc = calculateParticipantSchedule(m.curfew, stationId);
    const memberPayload: SquadMember = {
      id: `mem-${memberId}`,
      lobbyCode,
      userId: user?.uid || `demo-${memberId}`,
      name: m.name,
      initials: m.name.slice(0, 2).toUpperCase(),
      gender: m.gender,
      location: stationId,
      curfew: m.curfew,
      accompanyingDetails: 'DMRC Metro',
      budget: m.budget,
      phone: m.phone,
      leaveByTime: calc.leaveByTime,
      transitMins: calc.transitMins,
    };

    setMembers((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((x) => x.name.toLowerCase() === m.name.toLowerCase());
      if (idx >= 0) copy[idx] = memberPayload;
      else copy.push(memberPayload);
      return copy;
    });

    if (user) {
      callSqlApi('/api/sql/member', 'POST', memberPayload);
      try {
        await setDoc(doc(db, 'lobbies', lobbyCode, 'members', memberPayload.id), {
          ...memberPayload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch {
        // ignore
      }
    }
  };

  const handleChooseDestination = async (slug: string) => {
    setChosenDestinationSlug(slug);
    const dest = destBySlug(slug);
    if (!dest) return;

    const hubLabel =
      slug === 'igdtuw-kashmere-gate'
        ? 'IGDTUW (Indira Gandhi Delhi Technical University for Women)'
        : slug === 'nsut-dwarka-hub'
          ? 'NSUT (Netaji Subhas University of Technology)'
          : dest.name;

    const updatedLobby: LobbyData = {
      ...lobby,
      centralHub: hubLabel,
    };
    setLobby(updatedLobby);

    if (user) {
      callSqlApi('/api/sql/lobby', 'POST', updatedLobby);
      try {
        await updateDoc(doc(db, 'lobbies', lobbyCode), {
          centralHub: hubLabel,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // ignore
      }
    }
  };

  const handleSubmitAreaReview = async (
    areaName: string,
    safetyRating: number,
    lightingStatus: AreaReviewItem['lightingStatus'],
    issueFlag: AreaReviewItem['issueFlag'],
    comment: string
  ) => {
    const revId = `rev-${Date.now()}`;
    const author = (user?.displayName || memberById(activeMemberId).name || 'Saumay').slice(0, 50);
    const newRev: AreaReviewItem = {
      id: revId,
      userId: user?.uid || 'demo-saumay',
      authorName: author,
      areaName: areaName.slice(0, 80),
      safetyRating,
      lightingStatus,
      issueFlag,
      comment: comment.slice(0, 300),
      dateLabel: 'Just now',
    };

    setReviews((prev) => [newRev, ...prev]);

    if (user) {
      callSqlApi('/api/sql/review', 'POST', newRev);
      try {
        await setDoc(doc(db, 'reviews', revId), {
          userId: user.uid,
          authorName: newRev.authorName,
          areaName: newRev.areaName,
          safetyRating: newRev.safetyRating,
          lightingStatus: newRev.lightingStatus,
          issueFlag: newRev.issueFlag,
          comment: newRev.comment,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `reviews/${revId}`);
      }
    }
  };

  const handleTriggerSosAlert = async () => {
    const pinger = (user?.displayName || memberById(activeMemberId).name || 'Saumay').slice(0, 60);
    const nextPings = lobby.activePings + 1;
    const updatedLobby: LobbyData = {
      ...lobby,
      activePings: nextPings,
      lastPingBy: pinger,
      sosActive: true,
    };
    setLobby(updatedLobby);

    if (user) {
      callSqlApi('/api/sql/lobby', 'POST', updatedLobby);
      try {
        await updateDoc(doc(db, 'lobbies', lobbyCode), {
          mode: lobby.mode,
          centralHub: lobby.centralHub,
          departureTime: lobby.departureTime,
          activePings: nextPings,
          lastPingBy: pinger,
          sosActive: true,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // ignore
      }
    }
  };

  const activePlan: ActivePlanState = {
    title: lobby.title,
    kind: planKind,
    date: planDate,
    budget,
    inviteCode: lobby.code,
    destinationSlug: chosenDestinationSlug,
    memberIds: planMemberIds,
    startPoints,
    chat: groupChat,
    status: chosenDestinationSlug ? 'planned' : 'lobby',
  };

  if (!authSession && !user) {
    return (
      <ThemeProvider>
        <LanguageProvider>
          <AuthView
            onLoginSuccess={handleLoginSuccess}
            onGoogleSignIn={async () => {
              const res = await signInWithGoogle();
              if (res?.user) {
                const session: AuthSession = {
                  uid: res.user.uid,
                  displayName: res.user.displayName || 'Travety Student',
                  email: res.user.email || '',
                };
                handleLoginSuccess(session);
              }
            }}
          />
        </LanguageProvider>
      </ThemeProvider>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[264px_1fr]">
      {/* Google Maps Quota Banner if needed */}
      {quotaExceeded && (
        <div
          role="alert"
          className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm lg:col-span-2"
        >
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <button
          type="button"
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 text-left"
        >
          <TravisImg pose="wave" className="h-9 w-9 anim-float" />
          <span className="font-display text-xl font-bold tracking-tight">Travety</span>
        </button>
        <p className="mt-1 px-1 text-xs text-muted-foreground">{t('brand.tagline')}</p>

        <nav aria-label="Main" className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="space-y-1">
              {group.map((item) => {
                const active = currentPage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ' +
                      (active
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-4 space-y-3 border-t border-sidebar-border pt-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2">
            <FriendAvatar member={memberById(activeMemberId)} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {memberById(activeMemberId).name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {memberById(activeMemberId).homeLabel}
              </p>
            </div>
          </div>

          {(user || authSession) ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                try {
                  await signInWithGoogle();
                } catch {
                  // ignore cancel
                }
              }}
              className="text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </aside>

      {/* Smartphone Slide-Over Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-xs"
            aria-hidden
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[min(18.5rem,86vw)] flex-col border-r border-sidebar-border bg-sidebar px-4 py-4 shadow-lift">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigateTo('dashboard')}
                className="flex items-center gap-2.5 text-left"
              >
                <TravisImg pose="wave" className="h-8 w-8 anim-float" />
                <span className="font-display text-xl font-bold tracking-tight">Travety</span>
              </button>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <p className="mt-1 px-1 text-xs text-muted-foreground">{t('brand.tagline')}</p>

            <nav aria-label="Mobile Main" className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
              {NAV_GROUPS.map((group, gi) => (
                <div key={gi} className="space-y-1">
                  {group.map((item) => {
                    const active = currentPage === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        aria-current={active ? 'page' : undefined}
                        className={
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ' +
                          (active
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        {t(item.labelKey)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="mt-3 space-y-2.5 border-t border-sidebar-border pt-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2">
                <FriendAvatar member={memberById(activeMemberId)} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {memberById(activeMemberId).name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {memberById(activeMemberId).homeLabel}
                  </p>
                </div>
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logOutUser();
                  }}
                  className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                >
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    try {
                      await signInWithGoogle();
                    } catch {
                      // ignore
                    }
                  }}
                  className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-w-0 flex flex-col min-h-screen">
        <TravityHeader
          canGoBack={pageHistory.length > 0 || currentPage !== 'dashboard'}
          onBack={handleBack}
          onNavigate={navigateTo}
          notifications={notifications}
          onMarkRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
            )
          }
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
          }
          onOpenGeminiChat={() => setIsChatOpen(true)}
          onOpenSos={() => setIsSosOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-3.5 pb-28 pt-4 sm:px-6 sm:pt-6 lg:pb-10 lg:pt-8">
          <DemoBadge className="mb-3.5 lg:hidden" />

          {bannerMessage && (
            <div className="mb-5 flex items-center justify-between rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft">
              <span>{bannerMessage}</span>
              <button type="button" onClick={() => setBannerMessage(null)}>
                ×
              </button>
            </div>
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              activeMemberId={activeMemberId}
              onSelectMember={handleSelectSquadMember}
              onNavigate={navigateTo}
              plan={activePlan}
            />
          )}

          {currentPage === 'plan' && (
            <PlanOutingPage
              activeMemberId={activeMemberId}
              onCreatePlan={handleCreatePlan}
            />
          )}

          {currentPage === 'join' && (
            <JoinPlanPage
              plan={activePlan}
              onJoinCode={handleJoinCode}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'lobby' && (
            <GroupLobbyPage
              plan={activePlan}
              activeMemberId={activeMemberId}
              mode={mode}
              onSetMode={handleModeChange}
              onSetStartPoint={handleSetStartPoint}
              onSendChat={(text) => {
                const now = new Date();
                const time = `${String(now.getHours()).padStart(2, '0')}:${String(
                  now.getMinutes()
                ).padStart(2, '0')}`;
                setGroupChat((prev) => [
                  ...prev,
                  {
                    id: `gn-${Date.now()}`,
                    memberId: activeMemberId,
                    text,
                    time,
                  },
                ]);
              }}
              onNavigate={navigateTo}
              onOpenDestination={(slug) => {
                setSelectedDestSlug(slug);
                navigateTo('destination');
              }}
              onOpenGeminiChat={() => setIsChatOpen(true)}
            />
          )}

          {currentPage === 'recommendations' && (
            <RecommendationsPage
              plan={activePlan}
              onChooseDestination={handleChooseDestination}
              onOpenDestination={(slug) => {
                setSelectedDestSlug(slug);
                navigateTo('destination');
              }}
            />
          )}

          {currentPage === 'explore' && (
            <ExplorePage
              savedIds={savedIds}
              onToggleSaved={(slug) =>
                setSavedIds((prev) =>
                  prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
                )
              }
              onOpenDestination={(slug) => {
                setSelectedDestSlug(slug);
                navigateTo('destination');
              }}
            />
          )}

          {currentPage === 'saved' && (
            <SavedPage
              savedIds={savedIds}
              onToggleSaved={(slug) =>
                setSavedIds((prev) =>
                  prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
                )
              }
              onOpenDestination={(slug) => {
                setSelectedDestSlug(slug);
                navigateTo('destination');
              }}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'destination' && (
            <DestinationDetailPage
              slug={selectedDestSlug}
              plan={activePlan}
              savedIds={savedIds}
              onToggleSaved={(slug) =>
                setSavedIds((prev) =>
                  prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
                )
              }
              onChooseDestination={handleChooseDestination}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'map' && (
            <RouteMapPage
              plan={activePlan}
              mode={mode}
              userName={userName}
              location={location}
              squadMembers={members}
            />
          )}

          {currentPage === 'safety' && <SafetyPage />}

          {currentPage === 'calendar' && <CalendarPage onNavigate={navigateTo} />}

          {currentPage === 'invitations' && (
            <InvitationsPage
              onAcceptInvite={(title, destSlug) => {
                setChosenDestinationSlug(destSlug);
                setLobby((prev) => ({ ...prev, title }));
                navigateTo('lobby');
              }}
            />
          )}

          {currentPage === 'outings' && (
            <MyOutingsPage plan={activePlan} onNavigate={navigateTo} />
          )}

          {currentPage === 'past' && (
            <PastOutingsTravityPage
              outings={pastOutings}
              onRehostOuting={(title, outingMode) => {
                setMode(outingMode);
                handleCreatePlan({
                  title,
                  kind: 'Squad Re-run',
                  date: '2026-11-01',
                  budget: 450,
                  memberIds: ['saumay', 'devika', 'vansh', 'rimsha', 'pragya'],
                });
              }}
              onRateOutingArea={(areaName) => {
                setPrefillReviewArea(areaName);
                navigateTo('reviews');
              }}
            />
          )}

          {currentPage === 'reviews' && (
            <ReviewsTravityPage
              reviews={reviews}
              prefillArea={prefillReviewArea}
              onSubmitReview={handleSubmitAreaReview}
            />
          )}

          {currentPage === 'expenses' && (
            <ExpensesPage
              expenses={expenses}
              activeMemberId={activeMemberId}
              onAddExpense={(item) =>
                setExpenses((prev) => [{ ...item, id: `exp-${Date.now()}` }, ...prev])
              }
            />
          )}

          {currentPage === 'notifications' && (
            <NotificationsPage
              notifications={notifications}
              onMarkAllRead={() =>
                setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
              }
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'profile' && (
            <ProfilePage
              activeMemberId={activeMemberId}
              onSelectMember={handleSelectSquadMember}
              userEmail={user?.email || authSession?.email || null}
              onGoogleLogin={async () => {
                try {
                  await signInWithGoogle();
                } catch {
                  // ignore
                }
              }}
              onLogout={handleSignOut}
            />
          )}

          {currentPage === 'help' && <HelpPage onNavigate={navigateTo} />}
        </main>
      </div>

      {/* Mobile-Only 5-Tab Bottom Navigation (lg:hidden prevents desktop bar redundancy) */}
      <nav
        aria-label="Bottom"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {BOTTOM_TABS.map((item) => {
          const active = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              aria-current={active ? 'page' : undefined}
              className={
                'flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors active:scale-95 ' +
                (active ? 'text-primary' : 'text-muted-foreground hover:text-foreground')
              }
            >
              <span
                className={
                  'flex h-7 w-12 items-center justify-center rounded-full transition-colors ' +
                  (active ? 'bg-primary/15' : '')
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="truncate">{dt(item.key)}</span>
            </button>
          );
        })}
      </nav>

      {/* Emergency SOS Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onTriggerAlert={handleTriggerSosAlert}
        lobbyCode={lobbyCode}
        currentLocationName={location}
      />

      {/* Multi-Turn Gemini Chatbot Drawer with Google Search Grounding */}
      <GeminiChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        lobby={lobby}
        mode={mode}
        userName={userName}
        members={members}
        messages={chatMessages}
        onUpdateMessages={setChatMessages}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TravityShell />
      </LanguageProvider>
    </ThemeProvider>
  );
}

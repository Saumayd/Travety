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
  TabPath,
} from './data/ncrMetroData';
import { HomeView } from './components/HomeView';
import { LobbyView } from './components/LobbyView';
import { PastOutingsView } from './components/PastOutingsView';
import { ReviewsView } from './components/ReviewsView';
import { SosModal } from './components/SosModal';
import { ChatMessageItem, GeminiChatDrawer } from './components/GeminiChatDrawer';
import { getApiUrl } from './lib/api.ts';

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
    text: 'Hi! I am the Travety Gemini Assistant for the NSUT & IGDTUW squad (Devika, Vansh, Saumay, Rimisha, and Pragya).\n\n• Ask me to plan curfew-safe DMRC Blue & Yellow Line routes between NSUT (Dwarka Mor) and IGDTUW (Kashmere Gate)\n• Toggle Google Search Grounding ON for live Delhi weather, DMRC metro updates, and student cafes with verified web citations\n• Switch between Fast (3.1 Flash-Lite) and General (3.8 Flash) reasoning modes.',
    modelUsed: 'gemini-3.8-flash',
    timestamp: 'Ready',
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabPath>('home');
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    loadStored<boolean>('travety_dark_mode_v2', false)
  );
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(() =>
    loadStored<ChatMessageItem[]>('travety_chat_v2', DEFAULT_CHAT_MESSAGES)
  );

  // Database & Local Persisted State (Devika, Vansh, Saumay, Rimisha, Pragya & NSUT/IGDTUW)
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

  // Active Participant State (Defaults to Saumay)
  const [userName, setUserName] = useState<string>('Saumay');
  const [userPhone, setUserPhone] = useState<string>('+91 99104 88123');
  const [location, setLocation] = useState<string>('NSUT, Dwarka Mor');
  const [gender, setGender] = useState<GenderProfile>('male');
  const [curfew, setCurfew] = useState<string>('21:30');
  const [accompanyingDetails, setAccompanyingDetails] = useState<string>(
    'Escorting squad till Blue Line interchange'
  );
  const [budget, setBudget] = useState<number>(500);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Sync Dark Mode Class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('travety_dark_mode_v2', JSON.stringify(darkMode));
    } catch {
      // Ignore storage error
    }
  }, [darkMode]);

  // Persist Database Cache in LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('travety_lobby_v2', JSON.stringify(lobby));
      localStorage.setItem('travety_mode_v2', JSON.stringify(mode));
      localStorage.setItem('travety_members_v2', JSON.stringify(members));
      localStorage.setItem('travety_polls_v2', JSON.stringify(pollOptions));
      localStorage.setItem('travety_reviews_v2', JSON.stringify(reviews));
      localStorage.setItem('travety_chat_v2', JSON.stringify(chatMessages));
    } catch {
      // Ignore storage quota
    }
  }, [lobby, mode, members, pollOptions, reviews, chatMessages]);

  // Listen for Google Maps Demo Key Quota Exceeded events
  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  // Helper to call authenticated PostgreSQL / Supabase endpoints
  const callSqlApi = async (path: string, method: 'GET' | 'POST', body?: unknown) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : 'demo-saumay';
      const devUid = auth.currentUser?.uid || user?.uid || 'demo-saumay';
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
        const first = currentUser.displayName.split(' ')[0];
        const matched = DEFAULT_SQUAD_MEMBERS.find(
          (m) => m.name.toLowerCase() === first.toLowerCase()
        );
        if (matched) {
          setUserName(matched.name);
          setLocation(matched.location);
          setGender(matched.gender);
          setCurfew(matched.curfew);
          setAccompanyingDetails(matched.accompanyingDetails);
          setBudget(matched.budget);
          setUserPhone(matched.phone);
        } else {
          setUserName(currentUser.displayName);
        }
      }
      setAuthReady(true);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          await fetch(getApiUrl('/api/sql/sync-user'), {
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

  // Sync Lobby, Members, Polls, and Reviews when authenticated
  useEffect(() => {
    if (!authReady || !lobbyCode) return;

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

      if (Array.isArray(data.polls) && data.polls.length > 0) {
        const mergedPolls = [...DEFAULT_POLL_OPTIONS];
        for (const p of data.polls) {
          const idx = mergedPolls.findIndex((item) => item.id === p.id);
          if (idx >= 0) {
            mergedPolls[idx] = { ...mergedPolls[idx], votes: p.votes };
          } else {
            mergedPolls.push({
              id: p.id,
              lobbyCode: p.lobbyCode,
              title: p.title,
              subtitle: p.subtitle,
              votes: typeof p.votes === 'number' ? p.votes : 1,
              createdBy: p.createdBy,
            });
          }
        }
        setPollOptions(mergedPolls);
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
      } catch (err) {
        console.warn('Lobby init check:', err);
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

    const membersQuery = query(
      collection(db, 'lobbies', lobbyCode, 'members'),
      where('lobbyCode', '==', lobbyCode)
    );
    const unsubMembers = onSnapshot(
      membersQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: SquadMember[] = snapshot.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
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
          });
          const merged = [...DEFAULT_SQUAD_MEMBERS];
          for (const item of loaded) {
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
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `lobbies/${lobbyCode}/members`);
      }
    );

    const pollsQuery = query(
      collection(db, 'lobbies', lobbyCode, 'polls'),
      where('lobbyCode', '==', lobbyCode)
    );
    const unsubPolls = onSnapshot(
      pollsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedPolls: PollItem[] = snapshot.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              lobbyCode: d.lobbyCode,
              title: d.title,
              subtitle: d.subtitle,
              votes: typeof d.votes === 'number' ? d.votes : 1,
              createdBy: d.createdBy,
            };
          });
          const mergedPolls = [...DEFAULT_POLL_OPTIONS];
          for (const p of loadedPolls) {
            const idx = mergedPolls.findIndex((item) => item.id === p.id);
            if (idx >= 0) {
              mergedPolls[idx] = { ...mergedPolls[idx], votes: p.votes };
            } else {
              mergedPolls.push(p);
            }
          }
          setPollOptions(mergedPolls);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `lobbies/${lobbyCode}/polls`);
      }
    );

    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('safetyRating', '>=', 1)
    );
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
      unsubMembers();
      unsubPolls();
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
        // Ignore if lobby doc not yet created
      }
    }
  };

  const handleCreateLobby = async (customTitle: string, selectedMode: AppMode) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `TRV-${randomNum}`;
    const titleToUse = (customTitle || 'NSUT × IGDTUW Squad Meet').slice(0, 80);
    const hostDisplay = (user?.displayName || userName || 'Saumay').slice(0, 50);
    const ranked = rankHubsByMode(selectedMode, budget || 450);

    const newLobbyObj: LobbyData = {
      code: newCode,
      title: titleToUse,
      hostName: hostDisplay,
      hostId: user?.uid || 'demo-saumay',
      mode: selectedMode,
      centralHub: ranked[0].name,
      departureTime: '7:45 PM',
      activePings: 5,
      lastPingBy: hostDisplay,
      sosActive: false,
    };

    setMode(selectedMode);
    setLobbyCode(newCode);
    setLobby(newLobbyObj);
    setActiveTab('lobby');

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

    setBannerMessage(`Created Lobby ${newCode} (${selectedMode === 'safe' ? 'Safe Case' : 'Best Fun Case'}).`);
    setTimeout(() => setBannerMessage(null), 3000);
  };

  const handleJoinLobby = (codeInput: string) => {
    const cleanCode = codeInput.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'TRV-8492';
    setLobbyCode(cleanCode);
    setLobby((prev) => ({
      ...prev,
      code: cleanCode,
    }));
    setActiveTab('lobby');
    setBannerMessage(`Joined Lobby ${cleanCode}.`);
    setTimeout(() => setBannerMessage(null), 2500);
  };

  const handleSubmitPreferences = async () => {
    const cleanName = (userName.trim() || 'Saumay').slice(0, 50);
    const parts = cleanName.split(' ').filter(Boolean);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : cleanName.slice(0, 2).toUpperCase();

    const calc = calculateParticipantSchedule(curfew, location);
    const memberId = user
      ? `member-${user.uid.slice(0, 12)}`
      : `member-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const newMember: SquadMember = {
      id: memberId,
      lobbyCode,
      userId: user?.uid || 'demo-saumay',
      name: cleanName,
      initials,
      gender,
      location: (location.trim() || 'NSUT, Dwarka Mor').slice(0, 100),
      curfew: (curfew.trim() || '20:30').slice(0, 20),
      accompanyingDetails: (accompanyingDetails.trim() || 'Blue Line Metro').slice(0, 100),
      budget: Math.min(100000, Math.max(0, Math.round(budget || 450))),
      phone: (userPhone.trim() || '+91 98110 44210').slice(0, 20),
      leaveByTime: calc.leaveByTime,
      transitMins: calc.transitMins,
    };

    const updatedMembers = [...members];
    const existingIdx = updatedMembers.findIndex(
      (m) => m.id === memberId || m.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existingIdx >= 0) {
      updatedMembers[existingIdx] = newMember;
    } else {
      updatedMembers.push(newMember);
    }

    setMembers(updatedMembers);

    if (user) {
      callSqlApi('/api/sql/member', 'POST', newMember);
      try {
        await setDoc(doc(db, 'lobbies', lobbyCode, 'members', memberId), {
          lobbyCode,
          userId: user.uid,
          name: newMember.name,
          initials: newMember.initials,
          gender: newMember.gender,
          location: newMember.location,
          curfew: newMember.curfew,
          accompanyingDetails: newMember.accompanyingDetails,
          budget: newMember.budget,
          phone: newMember.phone,
          leaveByTime: newMember.leaveByTime,
          transitMins: newMember.transitMins,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(
          error,
          OperationType.WRITE,
          `lobbies/${lobbyCode}/members/${memberId}`
        );
      }
    }

    setBannerMessage(
      `Updated ${newMember.name}'s commute schedule. Leave by ${calc.leaveByTime}.`
    );
    setTimeout(() => setBannerMessage(null), 3000);
  };

  const handleVotePoll = async (pollId: string) => {
    let targetOption: PollItem | null = null;

    setPollOptions((prev) =>
      prev.map((item) => {
        if (item.id === pollId) {
          const nextVoted = !item.userVoted;
          const nextVotes = Math.max(0, item.votes + (nextVoted ? 1 : -1));
          const updated = { ...item, userVoted: nextVoted, votes: nextVotes };
          targetOption = updated;
          return updated;
        }
        return item;
      })
    );

    if (user && targetOption) {
      const opt = targetOption as PollItem;
      callSqlApi('/api/sql/poll', 'POST', opt);
      const pollRef = doc(db, 'lobbies', lobbyCode, 'polls', pollId);
      try {
        const snap = await getDoc(pollRef);
        if (snap.exists()) {
          await updateDoc(pollRef, {
            votes: opt.votes,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(pollRef, {
            lobbyCode,
            title: opt.title.slice(0, 80),
            subtitle: opt.subtitle.slice(0, 120),
            votes: opt.votes,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch {
        // Local storage fallback already updated
      }
    }
  };

  const handleAddPollOption = async (title: string, subtitle: string) => {
    const newId = `poll-${Date.now()}`;
    const newItem: PollItem = {
      id: newId,
      lobbyCode,
      title: title.slice(0, 80),
      subtitle: subtitle.slice(0, 120),
      votes: 1,
      createdBy: user?.uid || 'demo-saumay',
      userVoted: true,
    };

    setPollOptions((prev) => [...prev, newItem]);

    if (user) {
      callSqlApi('/api/sql/poll', 'POST', newItem);
      try {
        await setDoc(doc(db, 'lobbies', lobbyCode, 'polls', newId), {
          lobbyCode,
          title: newItem.title,
          subtitle: newItem.subtitle,
          votes: 1,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `lobbies/${lobbyCode}/polls/${newId}`);
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
    const author = (user?.displayName || userName || 'Saumay').slice(0, 50);
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
    const pinger = (user?.displayName || userName || 'Saumay').slice(0, 60);
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
        // Ignore if unauthenticated
      }
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col min-h-screen w-full transition-colors">
      {quotaExceeded && (
        <div
          role="alert"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            backgroundColor: '#FEF3C7',
            borderBottom: '1px solid #F59E0B',
            color: '#92400E',
            padding: '10px 16px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span>
            <strong>Google Maps Demo Key quota reached.</strong> Switch to your own Google Maps API
            key in AI Studio Settings to continue, or see the{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#92400E', textDecoration: 'underline', fontWeight: 600 }}
            >
              troubleshooting guide
            </a>
            .
          </span>
          <button
            onClick={() => setQuotaExceeded(false)}
            aria-label="Dismiss"
            style={{
              background: 'none',
              border: 'none',
              color: '#92400E',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Top App Bar (Desktop Navigation + Dark Mode Toggle + SOS) */}
      <header className="sticky top-0 w-full z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="font-display text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 whitespace-nowrap shrink-0"
          >
            travety
          </button>

          {/* Zone 2: Desktop Navigation Links (Hidden on Mobile to prevent redundancy with Bottom Nav) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'home' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lobby')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'lobby' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
              }`}
            >
              Lobby &amp; Map
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('past-outings')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'past-outings' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
              }`}
            >
              Past Outings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'reviews' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
              }`}
            >
              Safety Reviews
            </button>
          </nav>

          {/* Zone 3: Gemini AI Chat, Dark Mode Toggle & Emergency SOS */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              aria-label="Open Travety Gemini Assistant"
              className="py-2 px-3 rounded-xl bg-blue-600/10 dark:bg-blue-500/15 hover:bg-blue-600/20 dark:hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/70 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">voice_chat</span>
              <span>Ask Gemini</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle Dark Mode"
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSosOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">emergency</span>
              <span>SOS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (pb-20 on mobile for bottom nav, md:pb-8 on desktop where bottom nav is hidden) */}
      <main className="flex-1 w-full pb-20 md:pb-8">
        {bannerMessage && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
            <div className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
              <span>{bannerMessage}</span>
              <button
                type="button"
                onClick={() => setBannerMessage(null)}
                className="text-blue-100 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <HomeView
            userName={userName}
            setUserName={setUserName}
            userEmail={user?.email || null}
            userPhone={userPhone}
            setUserPhone={setUserPhone}
            onGoogleLogin={async () => {
              try {
                await signInWithGoogle();
              } catch {
                // Ignore popup cancel
              }
            }}
            onLogout={logOutUser}
            mode={mode}
            setMode={handleModeChange}
            location={location}
            setLocation={setLocation}
            gender={gender}
            setGender={setGender}
            curfew={curfew}
            setCurfew={setCurfew}
            accompanyingDetails={accompanyingDetails}
            setAccompanyingDetails={setAccompanyingDetails}
            budget={budget}
            setBudget={setBudget}
            onCreateLobby={handleCreateLobby}
            onJoinLobby={handleJoinLobby}
          />
        )}

        {activeTab === 'lobby' && (
          <LobbyView
            lobby={lobby}
            members={members}
            pollOptions={pollOptions}
            mode={mode}
            setMode={handleModeChange}
            userName={userName}
            setUserName={setUserName}
            userPhone={userPhone}
            setUserPhone={setUserPhone}
            location={location}
            setLocation={setLocation}
            gender={gender}
            setGender={setGender}
            curfew={curfew}
            setCurfew={setCurfew}
            accompanyingDetails={accompanyingDetails}
            setAccompanyingDetails={setAccompanyingDetails}
            budget={budget}
            setBudget={setBudget}
            onSubmitPreferences={handleSubmitPreferences}
            onVotePoll={handleVotePoll}
            onAddPollOption={handleAddPollOption}
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}

        {activeTab === 'past-outings' && (
          <PastOutingsView
            outings={pastOutings}
            onRehostOuting={(title, outingMode) => handleCreateLobby(title, outingMode)}
            onRateOutingArea={(areaName) => {
              setPrefillReviewArea(areaName);
              setActiveTab('reviews');
            }}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsView
            reviews={reviews}
            prefillArea={prefillReviewArea}
            onSubmitReview={handleSubmitAreaReview}
          />
        )}
      </main>

      {/* Mobile-Only Bottom Navigation Bar (md:hidden prevents desktop bar redundancy) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-4xl mx-auto grid grid-cols-4 items-center h-16 px-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
              activeTab === 'home'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lobby')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
              activeTab === 'lobby'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">train</span>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">Lobby &amp; Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('past-outings')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
              activeTab === 'past-outings'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">Outings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
              activeTab === 'reviews'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">rate_review</span>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">Reviews</span>
          </button>
        </div>
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

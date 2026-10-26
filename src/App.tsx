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
  serverTimestamp,
  setDoc,
  updateDoc,
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
  calculateSquadMetrics,
  CompanionStatus,
  DEFAULT_SQUAD_MEMBERS,
  GenderProfile,
  LobbyData,
  NCR_METRO_STATIONS,
  SquadMember,
  TabPath,
} from './data/ncrMetroData';
import { HomeView } from './components/HomeView';
import { LobbyView } from './components/LobbyView';
import { SafeMapView } from './components/SafeMapView';
import { CompanionView } from './components/CompanionView';
import { SosModal } from './components/SosModal';

const DEFAULT_LOBBY: LobbyData = {
  code: 'TRV-8492',
  title: 'Saturday Evening Hangout',
  hostName: 'Ananya S.',
  hostId: 'demo-host',
  centralHub: 'Rajiv Chowk Metro (Gate 7)',
  departureTime: '7:15 PM',
  activePings: 5,
  lastPingBy: 'Ananya S.',
  sosActive: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabPath>('home');
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);

  // Active Lobby & Squad State
  const [lobbyCode, setLobbyCode] = useState<string>('TRV-8492');
  const [lobby, setLobby] = useState<LobbyData>(DEFAULT_LOBBY);
  const [members, setMembers] = useState<SquadMember[]>(DEFAULT_SQUAD_MEMBERS);

  // User's Safety & Commute Preferences
  // Home view defaults to Rajiv Chowk (as in Image_1), Lobby defaults to Hauz Khas (as in Image_7)
  const [homeStationId, setHomeStationId] = useState<string>('rajiv-chowk');
  const [lobbyStationId, setLobbyStationId] = useState<string>('hauz-khas');
  const [userName, setUserName] = useState<string>('Ananya S.');
  const [gender, setGender] = useState<GenderProfile>('female');
  const [curfew, setCurfew] = useState<string>('8:00 PM');
  const [companionStatus, setCompanionStatus] = useState<CompanionStatus>('alone');
  const [budget, setBudget] = useState<string>('₹300 - ₹800');
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Track Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.displayName) {
        setUserName(currentUser.displayName);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore listener when user is authenticated
  useEffect(() => {
    if (!authReady || !user || !lobbyCode) return;

    const lobbyRef = doc(db, 'lobbies', lobbyCode);

    const ensureAndListen = async () => {
      try {
        const snap = await getDoc(lobbyRef);
        if (!snap.exists()) {
          await setDoc(lobbyRef, {
            code: lobbyCode,
            title: lobby.title,
            hostName: user.displayName || 'Ananya S.',
            hostId: user.uid,
            centralHub: 'Rajiv Chowk Metro (Gate 7)',
            departureTime: '7:15 PM',
            activePings: 5,
            lastPingBy: user.displayName || 'Ananya S.',
            sosActive: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.warn('Initial lobby check note:', err);
      }
    };

    ensureAndListen();

    const unsubLobby = onSnapshot(
      lobbyRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setLobby({
            code: data.code || lobbyCode,
            title: data.title || 'Saturday Evening Hangout',
            hostName: data.hostName || 'Ananya S.',
            hostId: data.hostId || user.uid,
            centralHub: data.centralHub || 'Rajiv Chowk Metro (Gate 7)',
            departureTime: data.departureTime || '7:15 PM',
            activePings: typeof data.activePings === 'number' ? data.activePings : 5,
            lastPingBy: data.lastPingBy || 'Ananya S.',
            sosActive: Boolean(data.sosActive),
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `lobbies/${lobbyCode}`);
      }
    );

    const membersQuery = collection(db, 'lobbies', lobbyCode, 'members');
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
              gender: d.gender as GenderProfile,
              stationId: d.stationId,
              stationName: d.stationName,
              curfew: d.curfew,
              curfewType: d.curfewType || 'Strict',
              companionStatus: d.companionStatus as CompanionStatus,
              budget: d.budget,
              pairingNote: d.pairingNote,
            };
          });
          const merged = [...DEFAULT_SQUAD_MEMBERS];
          for (const item of loaded) {
            const existingIdx = merged.findIndex((m) => m.id === item.id || m.name === item.name);
            if (existingIdx >= 0) {
              merged[existingIdx] = item;
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

    return () => {
      unsubLobby();
      unsubMembers();
    };
  }, [authReady, user, lobbyCode]);

  const handleCreateLobby = async (customTitle?: string) => {
    const titleToUse = (customTitle || 'Saturday Evening Hangout').slice(0, 80);

    let activeUser = user;
    if (!activeUser) {
      try {
        const cred = await signInWithGoogle();
        activeUser = cred.user;
      } catch {
        // Proceed with local guest session if popup closed
      }
    }

    const hostDisplay = (activeUser?.displayName || 'Ananya S.').slice(0, 50);
    const newLobbyObj: LobbyData = {
      code: lobbyCode,
      title: titleToUse,
      hostName: hostDisplay,
      hostId: activeUser?.uid || 'guest-host',
      centralHub: 'Rajiv Chowk Metro (Gate 7)',
      departureTime: '7:15 PM',
      activePings: 5,
      lastPingBy: hostDisplay,
      sosActive: false,
    };

    setLobby(newLobbyObj);
    setActiveTab('lobby');

    if (activeUser) {
      try {
        await setDoc(doc(db, 'lobbies', lobbyCode), {
          ...newLobbyObj,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `lobbies/${lobbyCode}`);
      }
    }
  };

  const handleJoinLobby = (codeInput: string) => {
    const cleanCode = codeInput.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'TRV-8492';
    setLobbyCode(cleanCode);
    setLobby((prev) => ({
      ...prev,
      code: cleanCode,
    }));
    setActiveTab('lobby');
  };

  const handleSubmitPreferences = async () => {
    const station =
      NCR_METRO_STATIONS.find((s) => s.id === lobbyStationId) || NCR_METRO_STATIONS[0];
    const cleanName = (user?.displayName || userName.trim() || 'Ananya S.').slice(0, 50);
    const parts = cleanName.split(' ').filter(Boolean);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : cleanName.slice(0, 2).toUpperCase();

    const curfewType =
      curfew === '8:00 PM' || curfew === '7:30 PM'
        ? 'Strict'
        : curfew === '9:30 PM' || curfew === '9:00 PM'
        ? 'Flex'
        : 'Late';

    const pairingNote =
      companionStatus === 'accompanied'
        ? 'Accompanied'
        : `Pairing with ${station.name}`;

    const memberId = user ? `member-${user.uid.slice(0, 12)}` : 'member-ananya';
    const newMember: SquadMember = {
      id: memberId,
      lobbyCode,
      userId: user?.uid || 'demo-ananya',
      name: cleanName,
      initials,
      gender,
      stationId: station.id,
      stationName: `${station.name} (${station.lines[0]})`.slice(0, 80),
      curfew,
      curfewType,
      companionStatus,
      budget,
      pairingNote: pairingNote.slice(0, 80),
    };

    const updatedMembers = [...members];
    const existingIdx = updatedMembers.findIndex(
      (m) => m.id === memberId || m.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existingIdx >= 0) {
      updatedMembers[existingIdx] = newMember;
    } else {
      updatedMembers.unshift(newMember);
    }

    setMembers(updatedMembers);
    const metrics = calculateSquadMetrics(updatedMembers);

    setLobby((prev) => ({
      ...prev,
      departureTime: metrics.hubDeparture12h,
      centralHub: metrics.recommendedHub,
    }));

    if (user) {
      try {
        await setDoc(doc(db, 'lobbies', lobbyCode, 'members', memberId), {
          lobbyCode,
          userId: user.uid,
          name: newMember.name,
          initials: newMember.initials,
          gender: newMember.gender,
          stationId: newMember.stationId,
          stationName: newMember.stationName,
          curfew: newMember.curfew,
          curfewType: newMember.curfewType,
          companionStatus: newMember.companionStatus,
          budget: newMember.budget,
          pairingNote: newMember.pairingNote,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await updateDoc(doc(db, 'lobbies', lobbyCode), {
          centralHub: metrics.recommendedHub,
          departureTime: metrics.hubDeparture12h,
          activePings: lobby.activePings + 1,
          lastPingBy: newMember.name.slice(0, 60),
          sosActive: lobby.sosActive,
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

    setSyncNotification(
      `Preferences synced! Hub locked to ${metrics.recommendedHub} (${metrics.hubDeparture12h} departure)`
    );
    setTimeout(() => setSyncNotification(null), 3500);
    setActiveTab('companion-routes');
  };

  const handleTriggerLivePing = async () => {
    const nextPings = lobby.activePings + 1;
    const pinger = (user?.displayName || userName || 'Ananya S.').slice(0, 60);
    setLobby((prev) => ({
      ...prev,
      activePings: nextPings,
      lastPingBy: pinger,
    }));

    if (user) {
      try {
        await updateDoc(doc(db, 'lobbies', lobbyCode), {
          centralHub: lobby.centralHub,
          departureTime: lobby.departureTime,
          activePings: nextPings,
          lastPingBy: pinger,
          sosActive: lobby.sosActive,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `lobbies/${lobbyCode}`);
      }
    }
  };

  const handleTriggerSosAlert = async () => {
    const pinger = (user?.displayName || userName || 'Ananya S.').slice(0, 60);
    const nextPings = lobby.activePings + 1;
    setLobby((prev) => ({
      ...prev,
      activePings: nextPings,
      lastPingBy: pinger,
      sosActive: true,
    }));

    if (user) {
      try {
        await updateDoc(doc(db, 'lobbies', lobbyCode), {
          centralHub: lobby.centralHub,
          departureTime: lobby.departureTime,
          activePings: nextPings,
          lastPingBy: pinger,
          sosActive: true,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `lobbies/${lobbyCode}`);
      }
    }
  };

  const currentStationObj =
    NCR_METRO_STATIONS.find(
      (s) => s.id === (activeTab === 'home' ? homeStationId : lobbyStationId)
    ) || NCR_METRO_STATIONS[0];

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen w-full max-w-[430px] mx-auto relative shadow-[0_0_48px_rgba(0,0,0,0.65)]">
      {/* Fixed Top App Header */}
      <header className="fixed top-0 left-0 right-0 max-w-[430px] mx-auto w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div
            onClick={() => setActiveTab('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveTab('home');
            }}
            className="cursor-pointer flex items-center gap-space-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary-container shadow-[0_0_16px_rgba(255,74,142,0.35)]">
              <span className="material-symbols-outlined text-[24px]">shield_person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none lowercase font-bold">
                travety
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse shadow-[0_0_8px_rgba(0,242,209,0.8)]"></span>
                <span className="font-label-sm text-label-sm text-secondary tracking-wide uppercase">
                  Shield Live • NCR
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-xs relative">
            <button
              type="button"
              onClick={() => setIsSosOpen(true)}
              aria-label="Emergency SOS Alert"
              className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(255,74,142,0.45)] hover:opacity-95 transition-opacity"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">fmd_bad</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-label="User Profile & Cloud Sync"
              className="w-11 h-11 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-14 w-64 rounded-xl bg-surface-container-highest p-3 shadow-2xl flex flex-col gap-2 z-50">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase">
                    {user ? 'Cloud Sync Active' : 'Guest Mode Active'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface truncate">
                  {user ? user.email || user.displayName : `Guest (${userName})`}
                </p>
                {user ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await logOutUser();
                      setShowProfileMenu(false);
                    }}
                    className="w-full py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-bright transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signInWithGoogle();
                        setShowProfileMenu(false);
                      } catch {
                        // Ignore popup cancel
                      }
                    }}
                    className="w-full py-2 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_12px_rgba(255,74,142,0.3)]"
                  >
                    Sign in with Google for Multi-Device Sync
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-20 bg-surface">
        {syncNotification && (
          <div className="mx-margin mt-2 rounded-xl bg-surface-container-highest px-3.5 py-2.5 flex items-center justify-between shadow-lg">
            <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {syncNotification}
            </span>
            <button
              type="button"
              onClick={() => setSyncNotification(null)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <HomeView
            stationId={homeStationId}
            setStationId={(id) => {
              setHomeStationId(id);
              setLobbyStationId(id);
            }}
            gender={gender}
            setGender={setGender}
            curfew={curfew}
            setCurfew={setCurfew}
            companionStatus={companionStatus}
            setCompanionStatus={setCompanionStatus}
            budget={budget}
            setBudget={setBudget}
            onCreateLobby={handleCreateLobby}
            onJoinLobby={handleJoinLobby}
            activeLobbyCode={lobbyCode}
          />
        )}

        {activeTab === 'lobby' && (
          <LobbyView
            lobby={lobby}
            members={members}
            stationId={lobbyStationId}
            setStationId={setLobbyStationId}
            gender={gender}
            setGender={setGender}
            curfew={curfew}
            setCurfew={setCurfew}
            companionStatus={companionStatus}
            setCompanionStatus={setCompanionStatus}
            budget={budget}
            setBudget={setBudget}
            onSubmitPreferences={handleSubmitPreferences}
          />
        )}

        {activeTab === 'safe-map' && <SafeMapView />}

        {activeTab === 'companion-routes' && (
          <CompanionView
            lobby={lobby}
            members={members}
            onTriggerLivePing={handleTriggerLivePing}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto w-full z-50 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.2)]"
        data-active-classes="text-primary-container"
      >
        <div className="flex justify-around items-center h-16 px-space-xs">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
            }}
            aria-current={activeTab === 'home' ? 'page' : undefined}
            data-path="home"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
              activeTab === 'home'
                ? 'text-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">explore</span>
            <span className="font-label-sm text-label-sm mt-0.5">Home</span>
          </a>

          <a
            href="#lobby"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('lobby');
            }}
            aria-current={activeTab === 'lobby' ? 'page' : undefined}
            data-path="lobby"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
              activeTab === 'lobby'
                ? 'text-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">groups_2</span>
            <span className="font-label-sm text-label-sm mt-0.5">Lobby</span>
          </a>

          <a
            href="#safe-map"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('safe-map');
            }}
            aria-current={activeTab === 'safe-map' ? 'page' : undefined}
            data-path="safe-map"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
              activeTab === 'safe-map'
                ? 'text-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">shield_lock</span>
            <span className="font-label-sm text-label-sm mt-0.5">Safe Map</span>
          </a>

          <a
            href="#companion-routes"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('companion-routes');
            }}
            aria-current={activeTab === 'companion-routes' ? 'page' : undefined}
            data-path="companion-routes"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
              activeTab === 'companion-routes'
                ? 'text-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">chevron_forward</span>
            <span className="font-label-sm text-label-sm mt-0.5">Companion</span>
          </a>
        </div>
      </nav>

      {/* Emergency SOS Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onTriggerAlert={handleTriggerSosAlert}
        lobbyCode={lobbyCode}
        currentStationName={currentStationObj.name}
      />
    </div>
  );
}

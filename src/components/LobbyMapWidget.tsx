import React, { useEffect, useMemo, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Clock,
  Globe,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
  ShieldCheck,
  Sparkles,
  TrainFront,
} from 'lucide-react';
import {
  AppMode,
  calculateDistanceKm,
  calculateParticipantSchedule,
  getPinkSaheliBoothsForHub,
  HubRecommendation,
  resolveLocationCoords,
  SquadMember,
} from '../data/ncrMetroData';
import { DESTINATIONS, memberById, type Member } from '../data/travityData';
import { FriendAvatar } from './travity/TravityBits';
import { DmrcMetroMap } from './DmrcMetroMap';

export type MapVisualMode = 'metro' | 'google';

interface LobbyMapWidgetProps {
  mode: AppMode;
  activeHub: HubRecommendation & { matchScore: number; modeReason: string };
  rankedHubs: (HubRecommendation & { matchScore: number; modeReason: string })[];
  selectedHubId: string;
  onSelectHub: (hubId: string) => void;
  userName: string;
  userLocation: string;
  userCurfew: string;
  members: SquadMember[];
  defaultVisualMode?: MapVisualMode;
  hideModeSwitcher?: boolean;
}

interface PlottedPoint {
  id: string;
  name: string;
  subtitle: string;
  category: 'hub' | 'alt-hub' | 'user-home' | 'squad-home' | 'pink-saheli';
  lat: number;
  lng: number;
  badgeText: string;
  extraMeta?: string;
  memberProfile?: Member;
  hubId?: string;
}

interface SquadPolylineItem {
  id: string;
  color: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  emphasized: boolean;
}

/**
 * Renders curved/direct transit polylines between each squad member's start station
 * and the active central hub on the Google Map instance.
 */
const GoogleMapRouteLines: React.FC<{
  lines: SquadPolylineItem[];
  showLines: boolean;
}> = ({ lines, showLines }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib || !showLines) {
      return;
    }

    const polylines = lines.map((item) => {
      const midLat = (item.from.lat + item.to.lat) / 2 + 0.008;
      const midLng = (item.from.lng + item.to.lng) / 2 - 0.008;
      return new mapsLib.Polyline({
        path: [item.from, { lat: midLat, lng: midLng }, item.to],
        geodesic: true,
        strokeColor: item.color,
        strokeOpacity: item.emphasized ? 0.9 : 0.35,
        strokeWeight: item.emphasized ? 4.5 : 2.5,
        map,
      });
    });

    return () => {
      polylines.forEach((p) => p.setMap(null));
    };
  }, [map, mapsLib, lines, showLines]);

  return null;
};

/**
 * Allows imperative camera panning/zooming when the user clicks a squad member or hub card.
 */
const GoogleMapCameraController: React.FC<{
  target: { lat: number; lng: number; zoom?: number } | null;
}> = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    map.panTo({ lat: target.lat, lng: target.lng });
    if (target.zoom) {
      map.setZoom(target.zoom);
    }
  }, [map, target]);

  return null;
};

export const LobbyMapWidget: React.FC<LobbyMapWidgetProps> = ({
  mode,
  activeHub,
  rankedHubs,
  selectedHubId,
  onSelectHub,
  userName,
  userLocation,
  userCurfew,
  members,
  defaultVisualMode = 'metro',
  hideModeSwitcher = false,
}) => {
  const [visualMode, setVisualMode] = useState<MapVisualMode>(defaultVisualMode);
  const [selectedMarker, setSelectedMarker] = useState<PlottedPoint | null>(null);
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null);
  const [showRouteLines, setShowRouteLines] = useState<boolean>(true);
  const [showSafetyPins, setShowSafetyPins] = useState<boolean>(true);
  const [cameraTarget, setCameraTarget] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);

  useEffect(() => {
    setVisualMode(defaultVisualMode);
  }, [defaultVisualMode]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const userHomeCoords = resolveLocationCoords(userLocation);
  const userSchedule = calculateParticipantSchedule(userCurfew, userLocation);
  const userDistanceToHubKm = calculateDistanceKm(
    userHomeCoords.lat,
    userHomeCoords.lng,
    activeHub.lat,
    activeHub.lng
  );
  const currentUserProfile = memberById(userName || 'Saumay');

  const { plottedPoints, squadPolylines, squadCards } = useMemo(() => {
    const pts: PlottedPoint[] = [
      {
        id: `hub-${activeHub.id}`,
        name: activeHub.shortName,
        subtitle: activeHub.area,
        category: 'hub',
        lat: activeHub.lat,
        lng: activeHub.lng,
        badgeText: 'ACTIVE CENTRAL HUB',
        extraMeta: `${activeHub.matchScore}% Fit · ₹${activeHub.avgCost}/person`,
        hubId: activeHub.id,
      },
    ];

    // Also include other Delhi NCR Travety destinations as selectable secondary hub pins
    DESTINATIONS.forEach((d) => {
      const distKm = Math.hypot(d.lat - activeHub.lat, d.lng - activeHub.lng);
      if (distKm < 0.008) return; // skip duplicate of activeHub
      pts.push({
        id: `dest-pin-${d.slug}`,
        name: d.name,
        subtitle: `${d.area} · ${d.lines.join('/')} Line`,
        category: 'alt-hub',
        lat: d.lat,
        lng: d.lng,
        badgeText: 'DELHI NCR OUTING SPOT',
        extraMeta: `₹${d.cost[0]}–₹${d.cost[1]} · ${d.walkMin}m walk from metro`,
        hubId: d.slug === 'igdtuw-kashmere-gate' ? 'igdtuw-kashmere' : d.slug === 'nsut-dwarka-hub' ? 'nsut-dwarka' : d.slug,
      });
    });

    const userPt: PlottedPoint = {
      id: 'user-home-marker',
      name: `${userName || 'Saumay'} (You)`,
      subtitle: userLocation || 'NSUT, Dwarka Mor',
      category: 'user-home',
      lat: userHomeCoords.lat,
      lng: userHomeCoords.lng,
      badgeText: 'YOUR START STATION',
      extraMeta: `${userDistanceToHubKm} km to Hub · Leave by ${userSchedule.leaveByTime}`,
      memberProfile: currentUserProfile,
    };
    pts.push(userPt);

    const lines: SquadPolylineItem[] = [
      {
        id: 'user-home-marker',
        color: currentUserProfile.color,
        from: { lat: userHomeCoords.lat, lng: userHomeCoords.lng },
        to: { lat: activeHub.lat, lng: activeHub.lng },
        emphasized: focusedMemberId === null || focusedMemberId === 'user-home-marker',
      },
    ];

    const cards: {
      id: string;
      name: string;
      isYou: boolean;
      profile: Member;
      location: string;
      distKm: number;
      leaveBy: string;
      lat: number;
      lng: number;
      point: PlottedPoint;
    }[] = [
      {
        id: 'user-home-marker',
        name: userName || 'Saumay',
        isYou: true,
        profile: currentUserProfile,
        location: userLocation || 'NSUT, Dwarka Mor',
        distKm: userDistanceToHubKm,
        leaveBy: userSchedule.leaveByTime,
        lat: userHomeCoords.lat,
        lng: userHomeCoords.lng,
        point: userPt,
      },
    ];

    members.forEach((member, index) => {
      const isCurrentUser =
        member.name.toLowerCase().trim() === (userName || 'Saumay').toLowerCase().trim();
      if (isCurrentUser) return;

      const coords = resolveLocationCoords(member.location);
      const jitterLat = (index % 2 === 0 ? 1 : -1) * 0.0018 * (index + 1);
      const jitterLng = (index % 3 === 0 ? -1 : 1) * 0.0018 * (index + 1);
      const finalLat = Number((coords.lat + jitterLat).toFixed(4));
      const finalLng = Number((coords.lng + jitterLng).toFixed(4));
      const distKm = calculateDistanceKm(finalLat, finalLng, activeHub.lat, activeHub.lng);
      const memberProfile = memberById(member.name);
      const markerId = `squad-${member.id}`;

      const pt: PlottedPoint = {
        id: markerId,
        name: member.name,
        subtitle: member.location,
        category: 'squad-home',
        lat: finalLat,
        lng: finalLng,
        badgeText: `${member.name.toUpperCase()}'S START`,
        extraMeta: `${distKm} km to Hub · Leave by ${member.leaveByTime}`,
        memberProfile,
      };
      pts.push(pt);

      lines.push({
        id: markerId,
        color: memberProfile.color,
        from: { lat: finalLat, lng: finalLng },
        to: { lat: activeHub.lat, lng: activeHub.lng },
        emphasized: focusedMemberId === null || focusedMemberId === markerId,
      });

      cards.push({
        id: markerId,
        name: member.name,
        isYou: false,
        profile: memberProfile,
        location: member.location,
        distKm,
        leaveBy: member.leaveByTime,
        lat: finalLat,
        lng: finalLng,
        point: pt,
      });
    });

    if (showSafetyPins) {
      const booths = getPinkSaheliBoothsForHub(activeHub);
      booths.forEach((b) => {
        pts.push({
          id: b.id,
          name: b.label,
          subtitle: `Verified Safe Corridor near ${activeHub.shortName}`,
          category: 'pink-saheli',
          lat: b.lat,
          lng: b.lng,
          badgeText: 'PINK SAHELI SAFETY BOOTH',
          extraMeta: '24/7 Women Patrol & Lit Gate Helpdesk',
        });
      });
    }

    return { plottedPoints: pts, squadPolylines: lines, squadCards: cards };
  }, [
    activeHub,
    userName,
    userLocation,
    userHomeCoords.lat,
    userHomeCoords.lng,
    userDistanceToHubKm,
    userSchedule.leaveByTime,
    currentUserProfile,
    members,
    focusedMemberId,
    showSafetyPins,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Control Bar: Cohesive Travety Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {!hideModeSwitcher && (
            <div className="inline-flex rounded-xl border border-border bg-surface-sunk p-1">
              <button
                type="button"
                onClick={() => setVisualMode('metro')}
                className={
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ' +
                  (visualMode === 'metro'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground')
                }
              >
                <TrainFront className="h-3.5 w-3.5" aria-hidden />
                <span>DMRC Metro Network</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('google')}
                className={
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ' +
                  (visualMode === 'google'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground')
                }
              >
                <Globe className="h-3.5 w-3.5" aria-hidden />
                <span>Live Google Maps</span>
              </button>
            </div>
          )}

          {visualMode === 'google' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowRouteLines((v) => !v)}
                className={
                  'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ' +
                  (showRouteLines
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground')
                }
              >
                <Route className="h-3.5 w-3.5" aria-hidden />
                <span>Squad Paths</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSafetyPins((v) => !v)}
                className={
                  'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ' +
                  (showSafetyPins
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground')
                }
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                <span>Pink Saheli Pins</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFocusedMemberId(null);
                  setSelectedMarker(null);
                  setCameraTarget({
                    lat: Number(((activeHub.lat + 28.6328) / 2).toFixed(4)),
                    lng: Number(((activeHub.lng + 77.2197) / 2).toFixed(4)),
                    zoom: 11,
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LocateFixed className="h-3.5 w-3.5" aria-hidden />
                <span>Reset NCR View</span>
              </button>
            </div>
          )}
        </div>

        {/* Central Hub Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted-foreground">Active Hub:</span>
          {rankedHubs.map((hub) => {
            const isSelected = selectedHubId === hub.id || activeHub.id === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => {
                  onSelectHub(hub.id);
                  setSelectedMarker(null);
                  setCameraTarget({ lat: hub.lat, lng: hub.lng, zoom: 12 });
                }}
                className={
                  'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ' +
                  (isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-border bg-background text-foreground hover:bg-accent')
                }
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                <span>
                  {hub.shortName} · ₹{hub.avgCost}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {visualMode === 'metro' ? (
        <DmrcMetroMap
          mode={mode}
          activeHub={activeHub}
          onSelectHub={onSelectHub}
          userName={userName}
          userLocation={userLocation}
          userCurfew={userCurfew}
          members={members}
        />
      ) : (
        <>
          {/* Live Google Maps Canvas integrated into a Travety Card Frame */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
            {/* Top Status Strip inside Map Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-sunk/70 px-4 py-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                  <span>Destination Hub:</span>
                  <span className="text-primary">{activeHub.name}</span>
                </span>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {activeHub.matchScore}% Group Fit
                </span>
              </div>
              <span className="text-muted-foreground">
                Click any friend avatar or hub pin on the map for commute &amp; curfew details
              </span>
            </div>

            <div className="relative h-[440px] w-full sm:h-[500px]">
              {apiKey ? (
                <APIProvider apiKey={apiKey}>
                  <Map
                    defaultCenter={{
                      lat: Number(((activeHub.lat + 28.6328) / 2).toFixed(4)),
                      lng: Number(((activeHub.lng + 77.16) / 2).toFixed(4)),
                    }}
                    defaultZoom={11}
                    mapId="DEMO_MAP_ID"
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <GoogleMapRouteLines
                      lines={squadPolylines}
                      showLines={showRouteLines}
                    />
                    <GoogleMapCameraController target={cameraTarget} />

                    {plottedPoints.map((pt) => (
                      <AdvancedMarker
                        key={pt.id}
                        position={{ lat: pt.lat, lng: pt.lng }}
                        onClick={() => setSelectedMarker(pt)}
                      >
                        {pt.category === 'hub' && (
                          <div className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105">
                            <div className="flex items-center gap-1.5 rounded-2xl border-2 border-white bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg whitespace-nowrap">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span>{pt.name}</span>
                            </div>
                            <div className="-mt-1 h-2.5 w-2.5 rotate-45 border-b border-r border-white bg-primary" />
                          </div>
                        )}

                        {pt.category === 'alt-hub' && (
                          <div className="flex flex-col items-center cursor-pointer opacity-90 transition-transform hover:scale-105 hover:opacity-100">
                            <div className="flex items-center gap-1 rounded-full border border-border bg-card/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-md whitespace-nowrap">
                              <span className="h-2 w-2 rounded-full bg-primary" />
                              <span>{pt.name}</span>
                            </div>
                          </div>
                        )}

                        {(pt.category === 'user-home' || pt.category === 'squad-home') &&
                          pt.memberProfile && (
                            <div className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105">
                              <div
                                className="flex items-center gap-1.5 rounded-full border-2 border-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-lg whitespace-nowrap"
                                style={{ backgroundColor: pt.memberProfile.color }}
                              >
                                <FriendAvatar member={pt.memberProfile} size={20} />
                                <span>{pt.name}</span>
                              </div>
                              <div
                                className="-mt-1 h-2 w-2 rotate-45 border-b border-r border-white"
                                style={{ backgroundColor: pt.memberProfile.color }}
                              />
                            </div>
                          )}

                        {pt.category === 'pink-saheli' && (
                          <div
                            title={pt.name}
                            className="flex items-center gap-1 rounded-full border border-white bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md cursor-pointer whitespace-nowrap"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            <span>Pink Saheli</span>
                          </div>
                        )}
                      </AdvancedMarker>
                    ))}

                    {selectedMarker && (
                      <InfoWindow
                        position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                        onCloseClick={() => setSelectedMarker(null)}
                      >
                        <div className="max-w-[230px] p-1 text-slate-900">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                            {selectedMarker.badgeText}
                          </div>
                          <div className="mt-0.5 font-display text-xs font-bold text-slate-900">
                            {selectedMarker.name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-600">
                            {selectedMarker.subtitle}
                          </div>
                          {selectedMarker.extraMeta && (
                            <div className="mt-1.5 border-t border-slate-200 pt-1 text-[11px] font-semibold text-indigo-700">
                              {selectedMarker.extraMeta}
                            </div>
                          )}
                          {selectedMarker.category === 'alt-hub' && selectedMarker.hubId && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  selectedMarker.hubId === 'nsut-dwarka' ||
                                  selectedMarker.hubId === 'igdtuw-kashmere'
                                ) {
                                  onSelectHub(selectedMarker.hubId);
                                }
                                setCameraTarget({
                                  lat: selectedMarker.lat,
                                  lng: selectedMarker.lng,
                                  zoom: 13,
                                });
                              }}
                              className="mt-2 w-full rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700"
                            >
                              Focus Outing Spot
                            </button>
                          )}
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                  <Globe className="mb-2 h-8 w-8 text-primary" aria-hidden />
                  <p className="text-sm font-bold text-foreground">
                    Google Maps API Key Not Configured
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Switch to the DMRC Metro Network tab to inspect station-to-hub transit paths.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Squad Member Commute Cards connected to Google Maps Camera */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {squadCards.map((card) => {
              const isFocused = focusedMemberId === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    const nextFocus = isFocused ? null : card.id;
                    setFocusedMemberId(nextFocus);
                    setSelectedMarker(card.point);
                    setCameraTarget({
                      lat: card.lat,
                      lng: card.lng,
                      zoom: 12,
                    });
                  }}
                  className={
                    'flex flex-col gap-1.5 rounded-2xl border p-3.5 text-left shadow-soft transition-all ' +
                    (isFocused
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-accent')
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-display text-sm font-bold text-foreground truncate">
                      <FriendAvatar member={card.profile} size={24} />
                      <span className="truncate">
                        {card.isYou ? `${card.name} (You)` : card.name}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {card.distKm} km to Hub
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                    <Navigation className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    <span className="truncate">
                      {card.location} → {activeHub.shortName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/60 pt-1.5 text-[11px] text-muted-foreground">
                    <span>Click to focus on Google Maps</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Clock className="h-3 w-3 text-primary" aria-hidden />
                      Leave {card.leaveBy}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

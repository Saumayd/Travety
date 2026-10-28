import React, { useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
} from '@vis.gl/react-google-maps';
import {
  AppMode,
  calculateDistanceKm,
  calculateParticipantSchedule,
  getPinkSaheliBoothsForHub,
  HubRecommendation,
  resolveLocationCoords,
  SquadMember,
} from '../data/ncrMetroData';
import { DmrcMetroMap } from './DmrcMetroMap';
import firebaseConfig from '../../firebase-applet-config.json';

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
}

interface PlottedPoint {
  id: string;
  name: string;
  subtitle: string;
  category: 'hub' | 'user-home' | 'squad-home' | 'pink-saheli';
  lat: number;
  lng: number;
  badgeText: string;
  extraMeta?: string;
}

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
}) => {
  const [visualMode, setVisualMode] = useState<MapVisualMode>('metro');
  const [selectedMarker, setSelectedMarker] = useState<PlottedPoint | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || firebaseConfig.apiKey || '';
  const userHomeCoords = resolveLocationCoords(userLocation);
  const userSchedule = calculateParticipantSchedule(userCurfew, userLocation);
  const userDistanceToHubKm = calculateDistanceKm(
    userHomeCoords.lat,
    userHomeCoords.lng,
    activeHub.lat,
    activeHub.lng
  );

  const plottedPoints: PlottedPoint[] = [
    {
      id: `hub-${activeHub.id}`,
      name: activeHub.shortName,
      subtitle: activeHub.area,
      category: 'hub',
      lat: activeHub.lat,
      lng: activeHub.lng,
      badgeText: 'ACTIVE CENTRAL HUB',
      extraMeta: `${activeHub.matchScore}% Match · ₹${activeHub.avgCost}/person`,
    },
    {
      id: 'user-home-marker',
      name: `${userName || 'You'} (Your Start)`,
      subtitle: userLocation || 'NSUT, Dwarka Mor',
      category: 'user-home',
      lat: userHomeCoords.lat,
      lng: userHomeCoords.lng,
      badgeText: 'YOUR LOCATION',
      extraMeta: `${userDistanceToHubKm} km to Hub · Leave by ${userSchedule.leaveByTime}`,
    },
  ];

  members.forEach((member, index) => {
    const isCurrentUser =
      member.name.toLowerCase().trim() === userName.toLowerCase().trim();
    if (isCurrentUser) return;

    const coords = resolveLocationCoords(member.location);
    const jitterLat = (index % 2 === 0 ? 1 : -1) * 0.002 * (index + 1);
    const jitterLng = (index % 3 === 0 ? -1 : 1) * 0.002 * (index + 1);
    const finalLat = Number((coords.lat + jitterLat).toFixed(4));
    const finalLng = Number((coords.lng + jitterLng).toFixed(4));
    const distKm = calculateDistanceKm(finalLat, finalLng, activeHub.lat, activeHub.lng);

    plottedPoints.push({
      id: `squad-${member.id}`,
      name: member.name,
      subtitle: member.location,
      category: 'squad-home',
      lat: finalLat,
      lng: finalLng,
      badgeText: member.initials,
      extraMeta: `${distKm} km · Leave by ${member.leaveByTime}`,
    });
  });

  if (mode === 'safe') {
    const booths = getPinkSaheliBoothsForHub(activeHub);
    booths.forEach((b) => {
      plottedPoints.push({
        id: b.id,
        name: b.label,
        subtitle: `Verified Safe Corridor near ${activeHub.shortName}`,
        category: 'pink-saheli',
        lat: b.lat,
        lng: b.lng,
        badgeText: 'Pink Saheli Booth',
        extraMeta: '24/7 Women Patrol & Lit Gate Helpdesk',
      });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Top Bar: Map Engine Switcher & University Hub Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2">
        <div className="inline-flex rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1">
          <button
            type="button"
            onClick={() => setVisualMode('metro')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              visualMode === 'metro'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">subway</span>
            <span>Interactive DMRC Metro Map</span>
          </button>
          <button
            type="button"
            onClick={() => setVisualMode('google')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              visualMode === 'google'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">public</span>
            <span>Live Google Maps</span>
          </button>
        </div>

        {/* Central Hub Switcher Buttons: NSUT vs IGDTUW */}
        <div className="flex items-center gap-1.5">
          {rankedHubs.map((hub) => {
            const isSelected = selectedHubId === hub.id || activeHub.id === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => {
                  onSelectHub(hub.id);
                  setSelectedMarker(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-500'
                }`}
              >
                {hub.shortName} · ₹{hub.avgCost}
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
        <div className="relative w-full h-[380px] rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden">
          {apiKey ? (
            <APIProvider apiKey={apiKey}>
              <Map
                key={`gmap-${activeHub.id}`}
                defaultCenter={{
                  lat: Number(((activeHub.lat + userHomeCoords.lat) / 2).toFixed(4)),
                  lng: Number(((activeHub.lng + userHomeCoords.lng) / 2).toFixed(4)),
                }}
                defaultZoom={11}
                mapId="DEMO_MAP_ID"
                gestureHandling="greedy"
                disableDefaultUI={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                {plottedPoints.map((pt) => (
                  <AdvancedMarker
                    key={pt.id}
                    position={{ lat: pt.lat, lng: pt.lng }}
                    onClick={() => setSelectedMarker(pt)}
                  >
                    {pt.category === 'hub' && (
                      <div className="flex flex-col items-center cursor-pointer">
                        <div className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-bold shadow-md border-2 border-white flex items-center gap-1 whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]">school</span>
                          <span>{pt.name}</span>
                        </div>
                        <div className="w-2.5 h-2.5 rotate-45 bg-blue-600 -mt-1 border-r border-b border-white" />
                      </div>
                    )}

                    {pt.category === 'user-home' && (
                      <div className="flex flex-col items-center cursor-pointer">
                        <div className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-md border-2 border-white flex items-center gap-1 whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]">
                            person_pin_circle
                          </span>
                          <span>
                            {userName}: {pt.subtitle}
                          </span>
                        </div>
                        <div className="w-2.5 h-2.5 rotate-45 bg-slate-900 -mt-1 border-r border-b border-white" />
                      </div>
                    )}

                    {pt.category === 'squad-home' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-bold shadow-md border-2 border-white cursor-pointer whitespace-nowrap">
                        <span>{pt.badgeText}</span>
                        <span className="hidden sm:inline">· {pt.name}</span>
                      </div>
                    )}

                    {pt.category === 'pink-saheli' && (
                      <div
                        title={pt.name}
                        className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-sm border border-white flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[12px]">shield</span>
                        <span>Saheli</span>
                      </div>
                    )}
                  </AdvancedMarker>
                ))}

                {selectedMarker && (
                  <InfoWindow
                    position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div className="p-1 max-w-[210px] text-slate-900">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {selectedMarker.badgeText}
                      </div>
                      <div className="font-display text-xs font-bold text-slate-900 mt-0.5">
                        {selectedMarker.name}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {selectedMarker.subtitle}
                      </div>
                      {selectedMarker.extraMeta && (
                        <div className="text-[11px] font-semibold text-blue-700 mt-1 pt-1 border-t border-slate-100">
                          {selectedMarker.extraMeta}
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <span className="material-symbols-outlined text-blue-600 text-[32px] mb-2">
                subway
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Google Maps API Key Not Configured
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Use the Interactive DMRC Metro Map tab above to inspect station-to-hub transit
                paths.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

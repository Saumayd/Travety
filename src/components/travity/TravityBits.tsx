import React, { type ReactNode } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';
import {
  LINE_COLORS,
  METRO_LINES,
  STATIONS,
  type Destination,
  type Member,
  type SafetyMarker,
} from '../../data/travityData';
import { useT } from '../../lib/ui-prefs';

export type TravisPose = 'wave' | 'think' | 'celebrate';

const RAW_BASE = import.meta.env.BASE_URL || './';
const ASSET_PREFIX = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;

const POSE_SRC: Record<TravisPose, string> = {
  wave: `${ASSET_PREFIX}assets/aistudio/travis-wave_7e70df70.png`,
  think: `${ASSET_PREFIX}assets/aistudio/travis-think_d6f2bb78.png`,
  celebrate: `${ASSET_PREFIX}assets/aistudio/travis-celebrate_4503b27e.png`,
};

export function TravisImg({ pose, className }: { pose: TravisPose; className?: string }) {
  return <img src={POSE_SRC[pose]} alt="Travis, the Travety guide" className={className} />;
}

export function DemoBadge({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-sunk px-3 py-1 text-xs font-medium text-muted-foreground ' +
        (className ?? '')
      }
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{t('common.demo')}</span>
    </span>
  );
}

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">{sub}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div>}
    </div>
  );
}

export function DestinationArt({
  dest,
  className,
  compact,
}: {
  dest: Destination;
  className?: string;
  compact?: boolean;
}) {
  const { t } = useT();
  return (
    <div
      className={
        'relative overflow-hidden rounded-xl bg-surface-sunk ' +
        (className ?? 'aspect-[16/9]')
      }
    >
      <div
        className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10"
        aria-hidden
      />
      <div
        className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-brand-pink/10"
        aria-hidden
      />
      <div
        className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-brand-cyan anim-twinkle"
        aria-hidden
      />
      <div
        className="absolute right-10 top-8 h-1 w-1 rounded-full bg-brand-pink anim-twinkle"
        aria-hidden
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
        <span
          className={
            'font-display font-bold text-primary ' +
            (compact ? 'text-base' : 'text-xl sm:text-2xl')
          }
        >
          {dest.name}
        </span>
        {!compact && <span className="text-xs text-muted-foreground">{dest.category}</span>}
      </div>
      <span
        className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground"
        title={t('destination.photoNote')}
      >
        <ImageOff className="h-3 w-3" aria-hidden />
        {t('destination.photoNote')}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FriendAvatar SVG character system (from FriendAvatar_e4412183.tsx) */
/* ------------------------------------------------------------------ */

function Accessory({ kind, color }: { kind: Member['accessory']; color: string }) {
  const dark = '#252541';
  switch (kind) {
    case 'cap':
      return (
        <g>
          <path d="M12 14 Q20 4 28 14 L28 16 Q20 12 12 16 Z" fill={dark} />
          <path d="M28 15 Q34 15 34 17.5 L28 17.5 Z" fill={dark} />
        </g>
      );
    case 'bow':
      return (
        <g transform="translate(9 8)">
          <ellipse cx="3" cy="3" rx="3.4" ry="2.6" fill={color} stroke={dark} strokeWidth="0.8" />
          <ellipse cx="10" cy="3" rx="3.4" ry="2.6" fill={color} stroke={dark} strokeWidth="0.8" />
          <circle cx="6.5" cy="3" r="1.6" fill={dark} />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path
            d="M11 17 Q20 6 29 17"
            fill="none"
            stroke={dark}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <rect x="8" y="15" width="5" height="7" rx="2.5" fill={dark} />
          <rect x="27" y="15" width="5" height="7" rx="2.5" fill={dark} />
        </g>
      );
    case 'glasses':
      return (
        <g>
          <circle cx="15.5" cy="19.5" r="3.6" fill="none" stroke={dark} strokeWidth="1.6" />
          <circle cx="24.5" cy="19.5" r="3.6" fill="none" stroke={dark} strokeWidth="1.6" />
          <path d="M19.1 19.5 L20.9 19.5" stroke={dark} strokeWidth="1.6" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path
            d="M11 14 Q20 4 29 14 L29 16 L11 16 Z"
            fill={color}
            stroke={dark}
            strokeWidth="0.9"
          />
          <rect x="10.5" y="14.5" width="19" height="3.2" rx="1.6" fill={dark} />
          <circle cx="20" cy="6" r="2" fill="#F472B6" />
        </g>
      );
    case 'flower':
      return (
        <g transform="translate(29 8)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-2.6"
              rx="1.7"
              ry="2.6"
              fill="#F472B6"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="1.5" fill="#FBBF24" />
        </g>
      );
  }
}

export function FriendAvatar({
  member,
  size = 40,
  label,
}: {
  member: Member;
  size?: number;
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={label ?? member.name}
      className="shrink-0 overflow-visible"
    >
      <circle
        cx="20"
        cy="20"
        r="18.4"
        fill="var(--card)"
        stroke={member.color}
        strokeWidth="1.6"
      />
      <circle cx="20" cy="22" r="13" fill={member.color} />
      <circle cx="16.4" cy="21" r="1.5" fill="#252541" />
      <circle cx="23.6" cy="21" r="1.5" fill="#252541" />
      <path
        d="M16.5 25.5 Q20 28.4 23.5 25.5"
        fill="none"
        stroke="#252541"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Accessory kind={member.accessory} color={member.color} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* MetroMap component (from MetroMap_18dcf9e9.tsx)                    */
/* ------------------------------------------------------------------ */

export interface MapRoute {
  member: Member;
  dest: Destination;
  stationId?: string;
  emphasized?: boolean;
}

interface MetroMapProps {
  destinations?: Destination[];
  selectedDest?: string | null;
  routes?: MapRoute[];
  markers?: SafetyMarker[];
  highlightStationId?: string | null;
  className?: string;
  children?: ReactNode;
}

function routePath(
  from: { x: number; y: number },
  to: { x: number; y: number }
): { d: string; mid: { x: number; y: number } } {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const bow = Math.min(60, len * 0.18);
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return {
    d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
    mid: { x: (mx + cx) / 2, y: (my + cy) / 2 },
  };
}

export function MetroMap({
  destinations = [],
  selectedDest = null,
  routes = [],
  markers = [],
  highlightStationId = null,
  className,
  children,
}: MetroMapProps) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 1000 920"
        className="h-auto w-full"
        role="img"
        aria-label="Complete stylised metro map of Delhi NCR"
      >
        <defs>
          <pattern id="travity-metro-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="0.6"
              opacity="0.45"
            />
          </pattern>
        </defs>

        <rect x="0" y="0" width="1000" height="920" rx="24" fill="var(--color-card)" />
        <rect x="0" y="0" width="1000" height="920" rx="24" fill="url(#travity-metro-grid)" />

        {/* Yamuna River Geographical Ribbon */}
        <path
          d="M 555 20 C 570 140, 560 220, 575 300 C 590 380, 640 420, 665 495 C 690 575, 720 690, 775 900"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="22"
          strokeLinecap="round"
          opacity="0.12"
        />

        {/* Subtle NCR Regional Watermark Labels */}
        <g opacity="0.38" fill="var(--color-muted-foreground)" fontSize="11" fontWeight="700" letterSpacing="2">
          <text x="200" y="110">ROHINI · NORTH-WEST</text>
          <text x="530" y="65">NORTH CAMPUS · BADLI</text>
          <text x="790" y="195">EAST DELHI · GHAZIABAD</text>
          <text x="90" y="520">DWARKA · NSUT WEST</text>
          <text x="480" y="438">CONNAUGHT PLACE</text>
          <text x="795" y="625">NOIDA · BOTANICAL</text>
          <text x="210" y="835">GURUGRAM · MILLENNIUM CITY</text>
          <text x="750" y="865">FARIDABAD</text>
        </g>

        {/* All 8 DMRC Metro Lines */}
        {METRO_LINES.map((line, idx) => (
          <polyline
            key={`${line.name}-${idx}`}
            points={line.points}
            fill="none"
            stroke={LINE_COLORS[line.name]}
            strokeWidth={line.name === 'Orange' ? 4.5 : 6}
            strokeDasharray={line.name === 'Orange' ? '10 5' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.86}
          />
        ))}

        {/* Stations + Interchange Rings + Key Station Labels */}
        {STATIONS.map((s) => {
          const highlight = s.id === highlightStationId;
          const isInterchange = Boolean(s.isInterchange || s.lines.length > 1);
          return (
            <g key={s.id}>
              {highlight && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={15}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  className="dot-pulse"
                />
              )}
              {isInterchange && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={7.5}
                  fill="var(--color-card)"
                  stroke="var(--color-foreground)"
                  strokeWidth={1.8}
                />
              )}
              <circle
                cx={s.x}
                cy={s.y}
                r={isInterchange ? 4.5 : 4}
                fill="var(--color-background)"
                stroke={LINE_COLORS[s.lines[0] ?? 'Blue']}
                strokeWidth={2.5}
              />
              {s.showLabel && (
                <text
                  x={s.x}
                  y={s.y - 11}
                  textAnchor="middle"
                  fontSize={9.5}
                  fontWeight={600}
                  fill="var(--color-muted-foreground)"
                >
                  {s.shortName || s.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Safety markers */}
        {markers.map((m) => (
          <circle
            key={m.id}
            cx={m.x}
            cy={m.y}
            r={7.5}
            fill="var(--color-brand-pink)"
            opacity={0.9}
            stroke="var(--color-card)"
            strokeWidth={1.8}
          />
        ))}

        {/* Destination markers */}
        {destinations.map((d) => {
          const selected = d.slug === selectedDest;
          return (
            <g key={d.slug}>
              <circle
                cx={d.x}
                cy={d.y}
                r={selected ? 15 : 11}
                fill="var(--color-primary)"
                opacity={selected ? 1 : 0.9}
                stroke="var(--color-card)"
                strokeWidth={selected ? 3 : 2}
              />
              <circle cx={d.x} cy={d.y} r={4.5} fill="var(--color-primary-foreground)" />
            </g>
          );
        })}

        {/* Member routes */}
        {routes.map((r) => {
          const st = STATIONS.find((s) => s.id === (r.stationId ?? r.member.stationId));
          if (!st) return null;
          const { d, mid } = routePath(st, r.dest);
          return (
            <g
              key={`${r.member.id}-${r.dest.slug}`}
              opacity={r.emphasized === false ? 0.35 : 1}
            >
              <path
                d={d}
                fill="none"
                stroke={r.member.color}
                strokeWidth={r.emphasized === false ? 3 : 4.5}
                strokeDasharray="10 8"
                strokeLinecap="round"
                className={r.emphasized ? 'anim-dash' : undefined}
              />
              <g transform={`translate(${mid.x} ${mid.y - 10})`}>
                <rect
                  x={-r.member.name.length * 3.4 - 8}
                  y={-9}
                  width={r.member.name.length * 6.8 + 16}
                  height={17}
                  rx={8.5}
                  fill={r.member.color}
                  stroke="var(--color-card)"
                  strokeWidth={1.5}
                />
                <text
                  x={0}
                  y={3.5}
                  textAnchor="middle"
                  fontSize={10.5}
                  fontWeight={700}
                  fill="#252541"
                >
                  {r.member.name}
                </text>
              </g>
            </g>
          );
        })}

        {/* Destination name callout pills */}
        {destinations.map((d) => (
          <g key={`label-${d.slug}`} transform={`translate(${d.x}, ${d.y + 26})`}>
            <rect
              x={-Math.min(115, d.name.length * 3.4 + 10)}
              y={-11}
              width={Math.min(230, d.name.length * 6.8 + 20)}
              height={18}
              rx={6}
              fill="var(--color-card)"
              opacity={0.92}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={0}
              y={2}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={700}
              fill="var(--color-foreground)"
            >
              {d.name}
            </text>
          </g>
        ))}
      </svg>
      {children}
    </div>
  );
}

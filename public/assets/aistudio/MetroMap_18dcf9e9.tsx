import type { ReactNode } from "react";
import {
  LINE_COLORS,
  METRO_LINES,
  STATIONS,
  type Destination,
  type Member,
  type SafetyMarker,
} from "@/data/mock";

/* ------------------------------------------------------------------ */
/* Reusable stylised metro map (mock coordinate space, §6.1).           */
/* Consumes data-layer interfaces only. Never presented as live data.  */
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
  to: { x: number; y: number },
): { d: string; mid: { x: number; y: number } } {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const bow = Math.min(60, len * 0.18);
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return { d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`, mid: { x: (mx + cx) / 2, y: (my + cy) / 2 } };
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
        aria-label="Stylised demo metro map of Delhi NCR"
      >
        <rect x="0" y="0" width="1000" height="920" rx="24" fill="var(--color-card)" />

        {/* metro lines */}
        {METRO_LINES.map((line) => (
          <polyline
            key={line.name}
            points={line.points}
            fill="none"
            stroke={LINE_COLORS[line.name]}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        ))}

        {/* stations */}
        {STATIONS.map((s) => {
          const highlight = s.id === highlightStationId;
          return (
            <g key={s.id}>
              {highlight && (
                <circle cx={s.x} cy={s.y} r={14} fill="none" stroke="var(--color-primary)" strokeWidth={3} className="dot-pulse" />
              )}
              <circle cx={s.x} cy={s.y} r={5} fill="var(--color-background)" stroke={LINE_COLORS[s.lines[0] ?? "Blue"]} strokeWidth={2.5} />
            </g>
          );
        })}

        {/* safety markers */}
        {markers.map((m) => (
          <circle
            key={m.id}
            cx={m.x}
            cy={m.y}
            r={7}
            fill="var(--color-brand-pink)"
            opacity={0.85}
            stroke="var(--color-card)"
            strokeWidth={1.5}
          />
        ))}

        {/* destination markers */}
        {destinations.map((d) => {
          const selected = d.slug === selectedDest;
          return (
            <g key={d.slug}>
              <circle cx={d.x} cy={d.y} r={selected ? 15 : 11} fill="var(--color-primary)" opacity={selected ? 1 : 0.9} stroke="var(--color-card)" strokeWidth={selected ? 3 : 2} />
              <circle cx={d.x} cy={d.y} r={4} fill="var(--color-primary-foreground)" />
            </g>
          );
        })}

        {/* member routes */}
        {routes.map((r) => {
          const st = STATIONS.find((s) => s.id === (r.stationId ?? r.member.stationId));
          if (!st) return null;
          const { d, mid } = routePath(st, r.dest);
          return (
            <g key={`${r.member.id}-${r.dest.slug}`} opacity={r.emphasized === false ? 0.45 : 1}>
              <path d={d} fill="none" stroke={r.member.color} strokeWidth={r.emphasized === false ? 3 : 4.5} strokeDasharray="10 8" strokeLinecap="round" className={r.emphasized ? "anim-dash" : undefined} />
              <g transform={`translate(${mid.x} ${mid.y - 10})`}>
                <rect x={-r.member.name.length * 3.4 - 8} y={-9} width={r.member.name.length * 6.8 + 16} height={16} rx={8} fill={r.member.color} stroke="var(--color-card)" strokeWidth={1.4} />
                <text x={0} y={4} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#252541">
                  {r.member.name}
                </text>
              </g>
            </g>
          );
        })}

        {/* destination name labels */}
        {destinations.map((d) => (
          <text
            key={`label-${d.slug}`}
            x={d.x}
            y={d.y + 28}
            textAnchor="middle"
            fontSize={12}
            fontWeight={700}
            fill="var(--color-foreground)"
          >
            {d.name}
          </text>
        ))}
      </svg>
      {children}
    </div>
  );
}

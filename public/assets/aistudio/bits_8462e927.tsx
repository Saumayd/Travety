import { ImageOff, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import travisWave from "@/assets/travis-wave.png";
import travisThink from "@/assets/travis-think.png";
import travisCelebrate from "@/assets/travis-celebrate.png";
import type { Destination } from "@/data/mock";
import { useT } from "@/lib/ui-prefs";

export type TravisPose = "wave" | "think" | "celebrate";

const POSE_SRC: Record<TravisPose, string> = {
  wave: travisWave,
  think: travisThink,
  celebrate: travisCelebrate,
};

export function TravisImg({ pose, className }: { pose: TravisPose; className?: string }) {
  return <img src={POSE_SRC[pose]} alt="Travis, the Travity guide" className={className} />;
}

/** Persistent demo-data label (§6.1, §14). */
export function DemoBadge({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-sunk px-3 py-1 text-xs font-medium text-muted-foreground " +
        (className ?? "")
      }
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      {t("common.demo")}
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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Branded destination placeholder (§8). No fabricated imagery for     */
/* real places — a Midnight Galaxy treatment carrying the place name.  */
/* ------------------------------------------------------------------ */

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
        "relative overflow-hidden rounded-xl bg-surface-sunk " + (className ?? "aspect-[16/9]")
      }
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10" aria-hidden />
      <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-brand-pink/10" aria-hidden />
      <div className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-brand-cyan anim-twinkle" aria-hidden />
      <div className="absolute right-10 top-8 h-1 w-1 rounded-full bg-brand-pink anim-twinkle" aria-hidden />
      <div className="relative flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
        <span className={"font-display font-bold text-primary " + (compact ? "text-base" : "text-xl sm:text-2xl")}>
          {dest.name}
        </span>
        {!compact && <span className="text-xs text-muted-foreground">{dest.category}</span>}
      </div>
      <span
        className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground"
        title={t("destination.photoNote")}
      >
        <ImageOff className="h-3 w-3" aria-hidden />
        {t("destination.photoNote")}
      </span>
    </div>
  );
}

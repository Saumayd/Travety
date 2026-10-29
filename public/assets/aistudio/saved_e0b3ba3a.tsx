import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, HeartOff } from "lucide-react";

import { DemoBadge, DestinationArt, PageHeader, TravisImg } from "@/components/travity/bits";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { destBySlug } from "@/data/mock";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/saved")({
  head: () => ({
    meta: [
      { title: "Travity — Saved places" },
      { name: "description", content: "Places your groups shortlisted for later outings across Delhi NCR." },
      { property: "og:title", content: "Travity — Saved places" },
      { property: "og:description", content: "Places your groups shortlisted for later." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedPage,
});

const inr = (n: number) => `₹${n}`;

function SavedPage() {
  const { t } = useT();
  const { savedIds, toggleSaved } = useDemo();
  const saved = savedIds.map((slug) => destBySlug(slug)).filter((d) => d !== undefined);

  return (
    <div>
      <PageHeader title={t("saved.title")} sub={t("saved.sub")} />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      {saved.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <TravisImg pose="think" className="mx-auto h-20 w-20 anim-float" />
          <p className="mt-4 font-semibold">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any place to shortlist it for a future outing.</p>
          <Button className="mt-6 grad-primary" asChild>
            <Link to="/explore">{t("nav.explore")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((d) => (
            <article key={d.slug} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="relative">
                <DestinationArt dest={d} compact />
                <button
                  type="button"
                  onClick={() => toggleSaved(d.slug)}
                  aria-label={`Remove ${d.name} from saved`}
                  className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/85 shadow-soft transition-colors hover:bg-background"
                >
                  <HeartOff className="h-4 w-4 text-muted-foreground" aria-hidden />
                </button>
              </div>
              <div className="p-4">
                <h2 className="font-display text-base font-bold">{d.name}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.area} · {d.duration} · {inr(d.cost[0])}–{inr(d.cost[1])}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.short}</p>
                <Link to="/destination/$slug" params={{ slug: d.slug }} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-2 hover:underline">
                  <Heart className="h-3.5 w-3.5" aria-hidden />
                  {t("common.viewDetails")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

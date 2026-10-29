import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";

import { DemoBadge, DestinationArt, PageHeader, TravisImg } from "@/components/travity/bits";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { DESTINATIONS, destBySlug } from "@/data/mock";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/explore")({
  head: () => ({
    meta: [
      { title: "Travity — Explore places" },
      { name: "description", content: "Browse every Travity destination across Delhi NCR with commute and budget context." },
      { property: "og:title", content: "Travity — Explore places" },
      { property: "og:description", content: "Every Travity destination across Delhi NCR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExplorePage,
});

const inr = (n: number) => `₹${n}`;

function ExplorePage() {
  const { t } = useT();
  const { savedIds, toggleSaved } = useDemo();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(DESTINATIONS.map((d) => d.category)))], []);

  const results = DESTINATIONS.filter((d) => {
    const matchesQuery =
      query.trim() === "" ||
      `${d.name} ${d.area} ${d.category} ${d.short}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCategory = category === "All" || d.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div>
      <PageHeader title={t("explore.title")} sub={t("explore.sub")} />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      {/* Search + filters */}
      <div className="mb-6 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search") + " places, areas, vibes…"}
            className="pl-9"
            aria-label={t("common.search")}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Category filters">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={"rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " + (category === c ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <TravisImg pose="think" className="mx-auto h-20 w-20 anim-float" />
          <p className="mt-4 font-semibold">No places match that search</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a broader term — the demo covers {DESTINATIONS.length} Delhi NCR destinations.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((d) => {
            const saved = savedIds.includes(d.slug);
            return (
              <article key={d.slug} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <div className="relative">
                  <DestinationArt dest={d} compact />
                  <button
                    type="button"
                    onClick={() => toggleSaved(d.slug)}
                    aria-pressed={saved}
                    aria-label={saved ? `Remove ${d.name} from saved` : `Save ${d.name}`}
                    className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-soft transition-colors hover:bg-background"
                  >
                    <Heart className={"h-4 w-4 " + (saved ? "fill-current text-brand-pink" : "")} aria-hidden />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-base font-bold">{d.name}</h2>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">{d.area}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.short}</p>
                  <p className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{d.duration}</span>
                    <span aria-hidden>·</span>
                    <span>{inr(d.cost[0])}–{inr(d.cost[1])} {t("common.perPerson")}</span>
                  </p>
                  <Link
                    to="/destination/$slug"
                    params={{ slug: d.slug }}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
                  >
                    {t("common.viewDetails")}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Showing demo data for {destBySlug(results[0]?.slug ?? "") ? "Delhi NCR" : "Delhi NCR"} only — Travity never covers cities outside the NCR.
      </p>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Scale, Table2 } from "lucide-react";

import { DemoBadge, DestinationArt, PageHeader, TravisImg } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { DESTINATIONS, destBySlug, groupCommutes, memberById, type Destination } from "@/data/mock";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/recommendations")({
  head: () => ({
    meta: [
      { title: "Travity — Destination recommendations" },
      { name: "description", content: "Compare Delhi NCR destinations for your whole group — travel time, fares and budget trade-offs." },
      { property: "og:title", content: "Travity — Destination recommendations" },
      { property: "og:description", content: "Find a place that works for everyone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecommendationsPage,
});

const inr = (n: number) => `₹${n}`;

interface Scored {
  dest: Destination;
  score: number;
  minMin: number;
  maxMin: number;
  avgFare: number;
}

function scoreDestinations(memberIds: string[], startPoints: Record<string, string | undefined>, budget: number | null): Scored[] {
  return DESTINATIONS.map((dest) => {
    const commutes = groupCommutes(dest, memberIds as never, startPoints);
    const minutes = commutes.map((c) => c.minutes);
    const minMin = Math.min(...minutes);
    const maxMin = Math.max(...minutes);
    const avgFare = Math.round(commutes.reduce((s, c) => s + c.fare, 0) / Math.max(1, commutes.length));
    const balance = Math.max(0, 100 - (maxMin - minMin) * 1.8);
    const budgetScore = budget == null ? dest.budgetFit : dest.cost[1] <= budget ? 92 : Math.max(0, 92 - (dest.cost[1] - budget) / 12);
    const score =
      0.3 * dest.fairness +
      0.18 * dest.excitement +
      0.16 * dest.accessibility +
      0.14 * dest.returnFit +
      0.22 * budgetScore +
      0.2 * balance -
      0.05 * avgFare / 5;
    return { dest, score: Math.round(score), minMin, maxMin, avgFare };
  }).sort((a, b) => b.score - a.score);
}

function RecommendationsPage() {
  const { t } = useT();
  const { plan, chooseDestination } = useDemo();
  const navigate = useNavigate();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [chosen, setChosen] = useState<string | null>(null);

  if (!plan) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <TravisImg pose="think" className="mx-auto h-20 w-20 anim-float" />
          <h1 className="mt-4 text-xl font-bold">No plan to score yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">Recommendations compare destinations for a group — create a plan first.</p>
          <Button className="mt-6 grad-primary" asChild>
            <Link to="/plan">Plan an outing</Link>
          </Button>
        </div>
      </div>
    );
  }

  const scored = scoreDestinations(plan.memberIds, plan.startPoints, plan.budget);

  const pick = (slug: string) => {
    setChosen(slug);
    chooseDestination(slug);
    setTimeout(() => void navigate({ to: `/destination/${slug}` }), 900);
  };

  return (
    <div>
      <PageHeader
        title={t("recommendations.title")}
        sub={`Scored for your group of ${plan.memberIds.length} against a ${inr(plan.budget)} destination budget. Travel times are illustrative demo estimates.`}
        actions={
          <div className="flex rounded-lg border border-border bg-card p-1" role="tablist">
            {(["cards", "table"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={"inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors " + (view === v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                {v === "cards" ? <Scale className="h-4 w-4" aria-hidden /> : <Table2 className="h-4 w-4" aria-hidden />}
                {v === "cards" ? "Trade-offs" : "Compare"}
              </button>
            ))}
          </div>
        }
      />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      {view === "cards" ? (
        <div className="space-y-4">
          {scored.map((s, i) => (
            <article key={s.dest.slug} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="grid gap-4 p-5 sm:grid-cols-[200px_1fr]">
                <DestinationArt dest={s.dest} className="aspect-[16/10]" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{s.dest.name}</h2>
                    {i === 0 && <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">Best group fit</span>}
                    <span className="rounded-full bg-surface-sunk px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Fit score {s.score}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.dest.short}</p>

                  {/* per-member commute chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {groupCommutes(s.dest, plan.memberIds, plan.startPoints).map((c) => {
                      const m = memberById(c.memberId);
                      return (
                        <span key={c.memberId} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs">
                          <FriendAvatar member={m} size={18} />
                          <span className="font-semibold">{m.name}</span>
                          <span className="text-muted-foreground">{c.minutes} min · {inr(c.fare)}</span>
                        </span>
                      );
                    })}
                  </div>

                  <ul className="mt-3 space-y-1">
                    {s.dest.reasons.slice(0, 2).map((r) => (
                      <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan" aria-hidden />
                        {r}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button className="grad-primary" onClick={() => pick(s.dest.slug)} disabled={chosen !== null}>
                      {t("common.selectDestination")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/destination/$slug" params={{ slug: s.dest.slug }}>{t("common.viewDetails")}</Link>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {s.minMin}–{s.maxMin} min spread · avg fare {inr(s.avgFare)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Commute spread</th>
                <th className="px-4 py-3 font-medium">Avg fare</th>
                <th className="px-4 py-3 font-medium">{t("common.destinationBudget")}</th>
                <th className="px-4 py-3 font-medium">Fit score</th>
                <th className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {scored.map((s) => (
                <tr key={s.dest.slug} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">
                    <Link to="/destination/$slug" params={{ slug: s.dest.slug }} className="text-primary underline-offset-2 hover:underline">
                      {s.dest.name}
                    </Link>
                    <span className="block text-xs font-normal text-muted-foreground">{s.dest.area}</span>
                  </td>
                  <td className="px-4 py-3">{s.minMin}–{s.maxMin} min</td>
                  <td className="px-4 py-3">{inr(s.avgFare)}</td>
                  <td className="px-4 py-3">{inr(s.dest.cost[0])}–{inr(s.dest.cost[1])}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{s.score}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => pick(s.dest.slug)} disabled={chosen !== null}>
                      {t("common.selectDestination")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chosen && (
        <div className="fixed inset-x-0 bottom-24 z-30 mx-auto flex w-fit items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-lift lg:bottom-10" role="status">
          <TravisImg pose="celebrate" className="h-10 w-10 anim-bounce-soft" />
          <span className="text-sm font-semibold">{destBySlug(chosen)?.name} locked in — opening details…</span>
        </div>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Heart, IndianRupee, MapPin, ShieldCheck, Sparkles } from "lucide-react";

import { DemoBadge, DestinationArt, TravisImg } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { destBySlug, groupCommutes, memberById, NEARBY, stationName, type NearbyPlace } from "@/data/mock";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/destination/$slug")({
  head: ({ params }) => {
    const dest = destBySlug(params.slug);
    return {
      meta: [
        { title: dest ? `Travity — ${dest.name}` : "Travity — Destination" },
        { name: "description", content: dest ? `${dest.short} — commute options, budget and nearby discovery on Travity.` : "Destination details on Travity." },
        { property: "og:title", content: dest ? `Travity — ${dest.name}` : "Travity — Destination" },
        { property: "og:description", content: dest?.short ?? "Destination details on Travity." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: DestinationPage,
});

const inr = (n: number) => `₹${n}`;

const NEARBY_CATEGORY_LABEL: Record<NearbyPlace["category"], string> = {
  "Cafes & Restaurants": "Cafes & Restaurants",
  "Shops & Markets": "Shops & Markets",
  Activities: "Activities",
  "Events & Experiences": "Events & Experiences",
};

function DestinationPage() {
  const { slug } = Route.useParams();
  const { t } = useT();
  const { plan, savedIds, toggleSaved } = useDemo();

  const dest = destBySlug(slug);
  if (!dest) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <TravisImg pose="think" className="mx-auto h-20 w-20 anim-float" />
          <h1 className="mt-4 text-xl font-bold">Destination not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">That place isn't in the demo dataset yet.</p>
          <Button className="mt-6" asChild>
            <Link to="/explore">Explore places</Link>
          </Button>
        </div>
      </div>
    );
  }

  const saved = savedIds.includes(dest.slug);
  const commutes = plan ? groupCommutes(dest, plan.memberIds, plan.startPoints) : groupCommutes(dest, ["aarav"]);
  const nearby = NEARBY.filter((n) => n.dest === dest.slug);
  const categories = Array.from(new Set(nearby.map((n) => n.category)));

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to explore
        </Link>
        <Button
          type="button"
          variant={saved ? "secondary" : "outline"}
          onClick={() => toggleSaved(dest.slug)}
          aria-pressed={saved}
        >
          <Heart className={"h-4 w-4 " + (saved ? "fill-current text-brand-pink" : "")} aria-hidden />
          {saved ? t("common.saved") : t("common.save")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Left */}
        <div className="space-y-6">
          <DestinationArt dest={dest} className="aspect-[16/8]" />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{dest.name}</h1>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{dest.category}</span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              {dest.area} · near {stationName(dest.stationId)} station
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed">{dest.description}</p>
          </div>

          {/* Key facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" aria-hidden />{t("common.duration")}</p>
              <p className="mt-1 font-semibold">{dest.duration}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><IndianRupee className="h-3.5 w-3.5" aria-hidden />{t("common.budget")}</p>
              <p className="mt-1 font-semibold">{inr(dest.cost[0])}–{inr(dest.cost[1])}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" aria-hidden />Last mile</p>
              <p className="mt-1 text-sm font-semibold">{dest.walkMin} min walk</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5" aria-hidden />Metro lines</p>
              <p className="mt-1 font-semibold">{dest.lines.join(" · ")}</p>
            </div>
          </div>

          {/* Activities */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">Things to do here</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {dest.activities.map((a) => (
                <li key={a} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm">{a}</li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold">Hours:</dt>
                <dd className="text-muted-foreground">{dest.hours}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold">Getting there:</dt>
                <dd className="text-muted-foreground">{dest.lastMile}</dd>
              </div>
            </dl>
          </section>

          {/* Nearby */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">Nearby discovery</h2>
            <p className="mt-1 text-xs text-muted-foreground">Demo listings — not verified, not sponsored placements except where marked.</p>
            <Accordion type="multiple" className="mt-3">
              {categories.map((cat) => (
                <AccordionItem key={cat} value={cat}>
                  <AccordionTrigger className="text-sm font-semibold">{NEARBY_CATEGORY_LABEL[cat]} ({nearby.filter((n) => n.category === cat).length})</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {nearby.filter((n) => n.category === cat).map((n) => (
                        <li key={n.id} className="flex items-start justify-between gap-3 rounded-lg bg-surface-sunk p-3">
                          <div>
                            <p className="text-sm font-semibold">{n.name}</p>
                            <p className="text-xs text-muted-foreground">{n.note}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{n.budget}</span>
                            {n.sponsored && <span className="text-[10px] font-semibold uppercase tracking-wide text-warning">Sponsored</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Commutes */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">Getting there — who from where</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("common.illustrative")} · {t("common.commuteFareNote")}</p>
            <ul className="mt-3 space-y-2.5">
              {commutes.map((c) => {
                const m = memberById(c.memberId);
                return (
                  <li key={c.memberId} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-center gap-2.5">
                      <FriendAvatar member={m} size={30} />
                      <p className="text-sm font-semibold">{m.name}</p>
                      <span className="ml-auto text-sm font-semibold text-primary">{c.minutes} min</span>
                    </div>
                    <p className="mt-1 pl-10 text-xs text-muted-foreground">
                      from {stationName(plan?.startPoints[c.memberId] ?? m.stationId)} · {inr(c.fare)} · {c.transfers === 0 ? "no transfers" : `${c.transfers} transfer${c.transfers > 1 ? "s" : ""}`} · back by ~{c.returnTime}
                    </p>
                    <details className="mt-2 pl-10">
                      <summary className="cursor-pointer text-xs font-medium text-primary underline-offset-2 hover:underline">Route options</summary>
                      <ul className="mt-1.5 space-y-1">
                        {c.options.map((o) => (
                          <li key={o.id} className="rounded-lg bg-surface-sunk px-3 py-2 text-xs">
                            <span className="font-semibold">{o.label}</span> · {o.minutes} min · {inr(o.fare)} · {o.transfers} transfers
                            {o.note && <span className="block text-muted-foreground">{o.note}</span>}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Safety note */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              {t("common.safety")} awareness
            </h2>
            <div className="mt-3 rounded-xl border-l-4 border-warning bg-surface-sunk p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-warning">
                {dest.safetyLevel === "good" ? t("safety.status.official") : t("safety.status.community")} · {t("safety.limited")}
              </p>
              <p className="mt-1.5 text-sm">{dest.safetyNote}</p>
              <p className="mt-2 text-xs text-muted-foreground">{t("safety.incomplete")} — safety information supports decisions, it never replaces your judgement.</p>
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/safety">{t("safety.title")}</Link>
            </Button>
          </section>

          <DemoBadge className="mx-auto" />
        </div>
      </div>
    </div>
  );
}

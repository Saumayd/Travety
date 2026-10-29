import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Orbit } from "lucide-react";

import { PageHeader, TravisImg } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { MetroMap, type MapRoute } from "@/components/travity/MetroMap";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { DESTINATIONS, destBySlug, groupCommutes, LINE_COLORS, memberById, type MemberId } from "@/data/mock";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/map")({
  head: () => ({
    meta: [
      { title: "Travity — Route map" },
      { name: "description", content: "A stylised map of Delhi NCR showing how every friend gets to your outing destination." },
      { property: "og:title", content: "Travity — Route map" },
      { property: "og:description", content: "See how everyone gets there." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { t } = useT();
  const { plan } = useDemo();
  const [intro, setIntro] = useState(true);
  const [focus, setFocus] = useState<MemberId | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 4200);
    return () => clearTimeout(timer);
  }, []);

  const chosenDest = plan?.destinationSlug ? destBySlug(plan.destinationSlug) : null;
  const routes: MapRoute[] =
    chosenDest && plan
      ? groupCommutes(chosenDest, plan.memberIds, plan.startPoints).map((c) => ({
          member: memberById(c.memberId),
          dest: chosenDest,
          stationId: plan.startPoints[c.memberId] ?? memberById(c.memberId).stationId,
          emphasized: focus === null || focus === c.memberId,
        }))
      : [];

  return (
    <div>
      <PageHeader
        title={t("map.title")}
        sub="A stylised demo map of Delhi NCR — not a live or navigable map. Route lines are illustrative."
      />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
        <MetroMap
          className="p-2 sm:p-4"
          destinations={chosenDest ? [chosenDest] : DESTINATIONS}
          selectedDest={chosenDest?.slug ?? null}
          routes={routes}
          highlightStationId={focus ? (plan?.startPoints[focus] ?? memberById(focus).stationId) : null}
        />

        {/* Globe intro overlay (§6.4) */}
        {intro && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-background/90 backdrop-blur-sm">
            <div
              className="anim-spin-slow h-40 w-40 rounded-full grad-sky shadow-lift sm:h-52 sm:w-52"
              role="img"
              aria-label="Stylised globe in the Midnight Galaxy gradient, zooming toward Delhi NCR"
            >
              <div className="mt-16 ml-16 h-10 w-16 rounded-full bg-background/20 sm:mt-20 sm:ml-20" aria-hidden />
              <div className="mt-3 ml-24 h-6 w-10 rounded-full bg-background/15 sm:ml-28" aria-hidden />
            </div>
            <div className="flex items-center gap-4">
              <TravisImg pose="wave" className="h-14 w-14 anim-greet" />
              <p className="max-w-xs text-center text-sm font-medium">Zooming in on Delhi NCR…</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setIntro(false)}>
              <Orbit className="h-4 w-4" aria-hidden />
              {t("map.skipIntro")}
            </Button>
          </div>
        )}
      </div>

      {/* Legend + friend focus */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 text-base font-bold">{t("map.legend")}</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(LINE_COLORS).map(([line, color]) => (
              <li key={line} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-6 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                {line} line
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Line colours are stylised demo visuals inspired by the Delhi Metro, not official DMRC mapping.</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 text-base font-bold">{t("map.selectFriend")}</h2>
          {chosenDest ? (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFocus(null)}
                  aria-pressed={focus === null}
                  className={"rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " + (focus === null ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-accent")}
                >
                  Everyone
                </button>
                {plan!.memberIds.map((id) => {
                  const m = memberById(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFocus(id)}
                      aria-pressed={focus === id}
                      className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " + (focus === id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-accent")}
                    >
                      <FriendAvatar member={m} size={18} />
                      {m.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {chosenDest.name} is locked for “{plan!.title}”. Select a friend to emphasise their route.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No destination locked yet — the map shows all Travity destinations. Lock one from{" "}
              {plan ? "recommendations" : "a new plan"} to see each friend's route drawn on the map.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

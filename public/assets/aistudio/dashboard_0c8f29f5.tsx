import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, History, Navigation, Users, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { TravisImg } from "@/components/travity/bits";
import { destBySlug } from "@/data/mock";
import { fmtDate, outingsBy } from "@/data/outings";
import { useDT } from "@/lib/dash-i18n";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Travity — Home" },
      { name: "description", content: "Your Travity dashboard — plan an outing, join a plan and see active, upcoming and recent outings across Delhi NCR." },
      { property: "og:title", content: "Travity — Home" },
      { property: "og:description", content: "Plan day outings with friends across Delhi NCR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function SmallCard({ to, icon: Icon, title, children, tone }: { to: string; icon: LucideIcon; title: string; children: ReactNode; tone: string }) {
  return (
    <Link
      to={to}
      className="group flex min-h-[132px] flex-col rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:bg-accent active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className={"flex h-10 w-10 items-center justify-center rounded-xl " + tone}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="mt-3 text-sm font-semibold leading-tight">{title}</span>
      <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{children}</span>
    </Link>
  );
}

function Dashboard() {
  const { userName } = useDemo();
  const { t } = useT();
  const { dt, lang } = useDT();
  const active = outingsBy("active")[0];
  const upcoming = outingsBy("upcoming");
  const past = outingsBy("past");

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">{t("home.greeting", { name: userName })}</h1>

      {/* Primary action */}
      <Link
        to="/plan"
        className="group relative mb-5 block overflow-hidden rounded-3xl border border-primary/30 bg-card p-6 shadow-lift transition-all hover:-translate-y-1 active:translate-y-0 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-8"
        style={{ boxShadow: "0 1px 0 0 color-mix(in oklab, var(--primary-foreground) 25%, transparent) inset, 0 18px 40px -16px color-mix(in oklab, var(--primary) 55%, transparent)" }}
      >
        <div className="pointer-events-none absolute inset-0 grad-primary opacity-[0.12]" aria-hidden />
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-brand-pink/15 blur-2xl" aria-hidden />
        <div className="relative flex items-center gap-4 sm:gap-6">
          <TravisImg pose="celebrate" className="h-20 w-20 shrink-0 anim-float drop-shadow-lg sm:h-28 sm:w-28" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              <span className="text-grad">{dt("planTitle")}</span>
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{dt("planSub")}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-colors group-hover:bg-primary/90">
              {dt("planCta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>

      {/* Secondary cards — 2 × 2 */}
      <section className="grid grid-cols-1 gap-3 min-[340px]:grid-cols-2 sm:gap-4">
        <SmallCard to="/join" icon={Users} title={dt("joinTitle")} tone="bg-brand-cyan/10 text-brand-cyan">
          {dt("joinSub")}
        </SmallCard>
        {active ? (
          <SmallCard to="/calendar" icon={Navigation} title={dt("activeTitle")} tone="bg-success/10 text-success">
            {active.title} · {dt("today")} {active.time}
          </SmallCard>
        ) : (
          <SmallCard to="/plan" icon={Navigation} title={dt("activeTitle")} tone="bg-success/10 text-success">
            {dt("noActive")} — {dt("noActiveSub")}
          </SmallCard>
        )}
        <SmallCard to="/calendar" icon={CalendarClock} title={dt("upcomingTitle")} tone="bg-primary/10 text-primary">
          {dt("upcomingCount", { n: upcoming.length })}
          {upcoming[0] ? ` · ${fmtDate(upcoming[0].date, lang)}` : ""}
        </SmallCard>
        <SmallCard to="/past" icon={History} title={dt("recentTitle")} tone="bg-brand-pink/10 text-brand-pink">
          {dt("recentCount", { n: past.length })}
          {past.at(-1) ? ` · ${destBySlug(past.at(-1)!.dest)?.name ?? ""}` : ""}
        </SmallCard>
      </section>
    </div>
  );
}

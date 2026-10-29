import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";

import { DemoBadge, DestinationArt, PageHeader, TravisImg } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { destBySlug, memberById, type MemberId } from "@/data/mock";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/outings")({
  head: () => ({
    meta: [
      { title: "Travity — My outings" },
      { name: "description", content: "Your active and upcoming group outings across Delhi NCR." },
      { property: "og:title", content: "Travity — My outings" },
      { property: "og:description", content: "Active and upcoming group plans in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OutingsPage,
});

const STATUS_LABEL: Record<string, string> = {
  lobby: "Setting up — in the lobby",
  recommendations: "Choosing a destination",
  planned: "Planned & confirmed",
};

function OutingsPage() {
  const { t } = useT();
  const { plan } = useDemo();

  return (
    <div>
      <PageHeader title={t("nav.upcoming")} sub="Everything your group is working on right now, from lobby to locked-in plan." />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      {!plan ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <TravisImg pose="wave" className="mx-auto h-20 w-20 anim-float" />
          <p className="mt-4 font-semibold">Nothing on the calendar</p>
          <p className="mt-1 text-sm text-muted-foreground">Start a plan or join one with an invite code — the whole group sorts out place, date and budget together.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button className="grad-primary" asChild>
              <Link to="/plan">{t("nav.plan")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/join">{t("nav.join")}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="grid sm:grid-cols-[260px_1fr]">
            {plan.destinationSlug && destBySlug(plan.destinationSlug) ? (
              <DestinationArt dest={destBySlug(plan.destinationSlug)!} className="aspect-[16/9] sm:aspect-auto sm:h-full sm:rounded-none" />
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center bg-surface-sunk sm:aspect-auto sm:h-full">
                <MapPin className="h-8 w-8 text-muted-foreground" aria-hidden />
              </div>
            )}
            <div className="p-5">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {STATUS_LABEL[plan.status]}
              </span>
              <h2 className="mt-3 font-display text-xl font-bold">{plan.title}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {plan.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {plan.memberIds.length} going
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {t("common.budget")}: ₹{plan.budget} {t("common.perPerson")}
                </span>
              </p>
              <div className="mt-4 flex items-center">
                {plan.memberIds.map((id: MemberId) => (
                  <div key={id} className="-ml-2 first:ml-0 rounded-full ring-2 ring-card">
                    <FriendAvatar member={memberById(id)} size={28} />
                  </div>
                ))}
              </div>
              <Link
                to="/lobby"
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Open group lobby
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

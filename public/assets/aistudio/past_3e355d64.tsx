import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";

import { DemoBadge, PageHeader, TravisImg } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { destBySlug, memberById, type MemberId } from "@/data/mock";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/past")({
  head: () => ({
    meta: [
      { title: "Travity — Past outings" },
      { name: "description", content: "Relive your group's past Delhi NCR outings — highlights, spend and ratings." },
      { property: "og:title", content: "Travity — Past outings" },
      { property: "og:description", content: "Highlights, spend and ratings from past outings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PastPage,
});

const inr = (n: number) => `₹${n}`;

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-warning" aria-label={`Rated ${value} out of 5`}>
      <Star className="h-4 w-4" fill="currentColor" aria-hidden />
      {value.toFixed(1)}
    </span>
  );
}

function PastPage() {
  const { t } = useT();
  const { pastOutings } = useDemo();

  return (
    <div>
      <PageHeader title={t("nav.past")} sub="Every outing your group completed — what it cost, who came, and the moment worth repeating." />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      {pastOutings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <TravisImg pose="think" className="mx-auto h-20 w-20 anim-float" />
          <p className="mt-4 font-semibold">No past outings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Once your group completes an outing it will show up here with highlights and spend.</p>
          <Button className="mt-6 grad-primary" asChild>
            <Link to="/plan">{t("home.ctaPlan")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pastOutings.map((o) => {
            const dest = destBySlug(o.dest);
            return (
              <article key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold">{o.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {o.date} · {dest?.name ?? o.dest} · {inr(o.spend)} spent
                    </p>
                  </div>
                  <Stars value={o.rating} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{o.highlight}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center">
                    {o.attendees.map((id: MemberId) => (
                      <div key={id} className="-ml-2 first:ml-0 rounded-full ring-2 ring-card">
                        <FriendAvatar member={memberById(id)} size={28} />
                      </div>
                    ))}
                  </div>
                  {dest && (
                    <Link
                      to="/destination/$slug"
                      params={{ slug: dest.slug }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      {t("common.viewDetails")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

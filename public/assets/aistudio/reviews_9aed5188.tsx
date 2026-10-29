import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareHeart, Star } from "lucide-react";

import { DemoBadge, PageHeader } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useT } from "@/lib/ui-prefs";
import { REVIEWS, memberById, type MemberId } from "@/data/mock";

export const Route = createFileRoute("/_app/reviews")({
  head: () => ({
    meta: [
      { title: "Travity — Reviews & experiences" },
      { name: "description", content: "What your group said after each outing — honest notes on places, food and safety." },
      { property: "og:title", content: "Travity — Reviews & experiences" },
      { property: "og:description", content: "Honest group notes on places, food and safety." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReviewsPage,
});

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={"h-4 w-4 " + (i <= value ? "text-warning" : "text-muted-foreground/30")}
          fill={i <= value ? "currentColor" : "none"}
          aria-hidden
        />
      ))}
    </span>
  );
}

function ReviewsPage() {
  const { t } = useT();

  // Group reviews by outing, keeping mock order.
  const groups: { outing: string; items: typeof REVIEWS }[] = [];
  for (const r of REVIEWS) {
    const g = groups.find((x) => x.outing === r.outing);
    if (g) g.items.push(r);
    else groups.push({ outing: r.outing, items: [r] });
  }

  return (
    <div>
      <PageHeader title={t("nav.reviews")} sub="Notes your group left after each outing — what worked, what to skip next time." />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.outing}>
            <h2 className="mb-3 text-lg font-bold">{g.outing}</h2>
            <div className="space-y-3">
              {g.items.map((r) => {
                const member = memberById(r.author as MemberId);
                return (
                  <article key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <FriendAvatar member={member} size={36} />
                        <div>
                          <p className="text-sm font-semibold">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{r.date}</p>
                        </div>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <MessageSquareHeart className="mx-auto h-8 w-8 text-primary" aria-hidden />
          <p className="mt-3 font-semibold">Just finished an outing?</p>
          <p className="mt-1 text-sm text-muted-foreground">Reviews written right after an outing help the next group choose well. Full review writing arrives with real accounts.</p>
        </div>
      </div>
    </div>
  );
}

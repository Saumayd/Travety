import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarCheck, ShieldCheck, UserPlus, type LucideIcon } from "lucide-react";
import { useEffect } from "react";

import { DemoBadge, PageHeader, TravisImg } from "@/components/travity/bits";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { NOTIFICATIONS, type NotificationKind } from "@/data/mock";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Travity — Notifications" },
      { name: "description", content: "Invites, joins and plan updates from your groups — all in one feed." },
      { property: "og:title", content: "Travity — Notifications" },
      { property: "og:description", content: "Invites, joins and plan updates in one feed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

const KIND_META: Record<NotificationKind, { icon: LucideIcon; cls: string }> = {
  invite: { icon: UserPlus, cls: "bg-primary/10 text-primary" },
  join: { icon: UserPlus, cls: "bg-brand-cyan/10 text-brand-cyan" },
  update: { icon: CalendarCheck, cls: "bg-success/10 text-success" },
  safety: { icon: ShieldCheck, cls: "bg-brand-pink/10 text-brand-pink" },
};

function NotificationsPage() {
  const { t } = useT();
  const { notifsRead, markNotifsRead } = useDemo();

  useEffect(() => {
    if (!notifsRead) markNotifsRead();
  }, [notifsRead, markNotifsRead]);

  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div>
      <PageHeader title={t("nav.notifications")} sub="Invites, joins and updates from your groups — newest first." />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      {NOTIFICATIONS.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <TravisImg pose="think" className="mx-auto h-20 w-20 anim-float" />
          <p className="mt-4 font-semibold">All quiet</p>
          <p className="mt-1 text-sm text-muted-foreground">New invites and plan updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unread > 0 && (
            <p className="text-sm font-medium text-muted-foreground" role="status">
              {unread} unread — marked as read as you view them.
            </p>
          )}
          {NOTIFICATIONS.map((n) => {
            const meta = KIND_META[n.kind];
            const Icon = meta.icon;
            return (
              <article
                key={n.id}
                className={
                  "flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-soft " +
                  (n.unread && !notifsRead ? "border-primary/40" : "border-border")
                }
              >
                <span className={"mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " + meta.cls}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                </div>
                {n.unread && !notifsRead && <Bell className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

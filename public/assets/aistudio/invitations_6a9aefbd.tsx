import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, X } from "lucide-react";

import { PageHeader } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { destBySlug, memberById } from "@/data/mock";
import { fmtDate, outingById, RECEIVED_INVITES, SENT_INVITES, type SentStatus } from "@/data/outings";
import { useDT } from "@/lib/dash-i18n";
import { dashStore, useDashStore } from "@/lib/dash-store";

type Search = { tab?: "received" | "sent" | undefined; focus?: string | undefined };

export const Route = createFileRoute("/_app/invitations")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tab: s["tab"] === "sent" ? "sent" : s["tab"] === "received" ? "received" : undefined,
    focus: typeof s["focus"] === "string" ? s["focus"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Travity — Invitations" },
      { name: "description", content: "Outing invitations you received and sent on Travity." },
      { property: "og:title", content: "Travity — Invitations" },
      { property: "og:description", content: "Received and sent outing invitations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InvitationsPage,
});

const SENT_CLS: Record<SentStatus, string> = {
  pending: "bg-warning/15 text-warning",
  accepted: "bg-success/15 text-success",
  declined: "bg-muted text-muted-foreground",
};

function InvitationsPage() {
  const { tab = "received", focus } = Route.useSearch();
  const navigate = useNavigate({ from: "/invitations" });
  const { dt, lang } = useDT();
  const s = useDashStore();

  return (
    <div>
      <PageHeader title={dt("invTitle")} sub={dt("invSub")} />
      <Tabs value={tab} onValueChange={(v) => navigate({ search: { tab: v as Search["tab"] }, replace: true })}>
        <TabsList className="mb-4 grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="received">{dt("received")}</TabsTrigger>
          <TabsTrigger value="sent">{dt("sent")}</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-3">
          {RECEIVED_INVITES.length === 0 && <p className="text-sm text-muted-foreground">{dt("noReceived")}</p>}
          {RECEIVED_INVITES.map((inv) => {
            const m = memberById(inv.from);
            const r = s.responses[inv.id];
            return (
              <article
                key={inv.id}
                className={"rounded-2xl border bg-card p-4 shadow-soft " + (focus === inv.id ? "border-primary ring-2 ring-primary/30" : "border-border")}
              >
                <div className="flex items-start gap-3">
                  <FriendAvatar member={m} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{dt("from", { name: m.name })}</p>
                    <h3 className="font-semibold">{inv.title}</h3>
                    <p className="text-xs text-muted-foreground">{fmtDate(inv.date, lang)} · {destBySlug(inv.dest)?.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{inv.summary}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r ? (
                    <span className={"rounded-full px-3 py-1 text-xs font-semibold " + SENT_CLS[r]}>{dt(r)}</span>
                  ) : (
                    <>
                      <button type="button" onClick={() => dashStore.respond(inv.id, "accepted")} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                        <Check className="h-4 w-4" aria-hidden />{dt("accept")}
                      </button>
                      <button type="button" onClick={() => dashStore.respond(inv.id, "declined")} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">
                        <X className="h-4 w-4" aria-hidden />{dt("decline")}
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </TabsContent>

        <TabsContent value="sent" className="space-y-3">
          {SENT_INVITES.map((inv) => {
            const m = memberById(inv.to);
            const o = outingById(inv.outingId);
            return (
              <article key={inv.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <FriendAvatar member={m} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{dt("to", { name: m.name })}</p>
                  <h3 className="font-semibold">{o?.title}</h3>
                  {o && <p className="text-xs text-muted-foreground">{fmtDate(o.date, lang)} · {destBySlug(o.dest)?.name}</p>}
                </div>
                <span className={"shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " + SENT_CLS[inv.status]}>{dt(inv.status)}</span>
              </article>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

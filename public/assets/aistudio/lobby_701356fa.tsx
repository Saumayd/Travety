import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Copy, MapPin, MessageSquare, Send, Users } from "lucide-react";

import { PageHeader, TravisImg } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { memberById, MEMBERS, STATIONS, stationName, type MemberId } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/lobby")({
  head: () => ({
    meta: [
      { title: "Travity — Group lobby" },
      { name: "description", content: "Coordinate start points, share the invite code and chat in your Travity group lobby." },
      { property: "og:title", content: "Travity — Group lobby" },
      { property: "og:description", content: "Coordinate start points and chat with your group." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LobbyPage,
});

const inr = (n: number) => `₹${n}`;

function LobbyPage() {
  const { t } = useT();
  const { plan, setStartPoint, sendChat } = useDemo();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [plan?.chat.length]);

  if (!plan) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <TravisImg pose="think" className="mx-auto h-20 w-20 anim-float" />
          <h1 className="mt-4 text-xl font-bold">No active plan yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create an outing or join a friend's plan — the lobby opens once a plan exists.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/plan">Plan an outing</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/join">Join a plan</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pending = plan.memberIds.filter((id) => !plan.startPoints[id]);
  const everyoneSet = pending.length === 0;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(plan.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sendChat(text);
    setDraft("");
  };

  return (
    <div>
      <PageHeader
        title={plan.title}
        sub={`${plan.kind} · ${plan.date || "date to decide"} · ${t("common.destinationBudget")} ${inr(plan.budget)} ${t("common.perPerson")}`}
        actions={
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {plan.status === "planned" ? "Destination locked" : "Group lobby"}
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Invite */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Users className="h-4 w-4 text-primary" aria-hidden />
              {t("lobby.invite")}
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <code className="flex-1 rounded-lg border border-border bg-surface-sunk px-4 py-2.5 font-mono text-lg font-bold tracking-widest">
                {plan.inviteCode}
              </code>
              <Button type="button" variant="outline" onClick={copyCode}>
                <Copy className="h-4 w-4" aria-hidden />
                {copied ? t("common.copied") : t("common.copy")}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Friends enter this code on the Join page (demo — no real invites are sent).</p>
          </section>

          {/* Members */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-base font-bold">The group ({plan.memberIds.length})</h2>
            <ul className="space-y-2.5">
              {plan.memberIds.map((id) => {
                const m = memberById(id);
                const set = plan.startPoints[id];
                return (
                  <li key={id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                    <FriendAvatar member={m} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{m.name}{id === "aarav" ? " (you)" : ""}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {set ? stationName(set) : m.homeLabel}
                      </p>
                    </div>
                    {set ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        {t("lobby.joined")}
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {t("lobby.pending")}
                        </span>
                        {id !== "aarav" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="hidden sm:inline-flex"
                            onClick={() => setStartPoint(id, m.stationId)}
                          >
                            Simulate reply (demo)
                          </Button>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            {pending.length > 0 && (
              <p className="mt-3 rounded-lg bg-surface-sunk p-3 text-xs text-muted-foreground">
                {pending.map((id) => memberById(id).name).join(", ")} still need to set a starting point. “Simulate reply” fills their home station in this demo.
              </p>
            )}
          </section>

          {/* My start point */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-base font-bold">{t("lobby.startPoint")}</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-station">{t("lobby.useMetro")}</Label>
                <select
                  id="start-station"
                  value={plan.startPoints.aarav ?? ""}
                  onChange={(e) => setStartPoint("aarav", e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="" disabled>
                    Choose a station…
                  </option>
                  {STATIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStartPoint("aarav", "rajiv-chowk")}
              >
                <MapPin className="h-4 w-4" aria-hidden />
                {t("lobby.useLocation")}
              </Button>
              <p className="text-xs text-muted-foreground">Demo: “use my location” snaps to Rajiv Chowk — no real location is read.</p>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Chat */}
          <section className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
              {t("lobby.groupChat")}
            </h2>
            <div ref={chatRef} className="h-72 space-y-3 overflow-y-auto pr-1">
              {plan.chat.map((msg) => {
                const m = memberById(msg.memberId);
                const mine = msg.memberId === "aarav";
                return (
                  <div key={msg.id} className={"flex items-end gap-2 " + (mine ? "flex-row-reverse" : "")}>
                    <FriendAvatar member={m} size={26} />
                    <div className={"max-w-[75%] rounded-2xl px-3 py-2 text-sm " + (mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-surface-sunk")}>
                      {!mine && <p className="mb-0.5 text-[11px] font-bold" style={{ color: m.color }}>{m.name}</p>}
                      <p>{msg.text}</p>
                      <p className={"mt-0.5 text-[10px] " + (mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{msg.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form className="mt-3 flex gap-2" onSubmit={send}>
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a note to the group…" aria-label="Message" />
              <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim()}>
                <Send className="h-4 w-4" aria-hidden />
              </Button>
            </form>
          </section>

          {/* Next step */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">Next step</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {everyoneSet
                ? "Everyone's start points are in. Travis can now compare destinations for the whole group."
                : `Waiting on ${pending.length} starting point${pending.length === 1 ? "" : "s"} before recommendations unlock.`}
            </p>
            <Button className="mt-4 w-full grad-primary" disabled={!everyoneSet} onClick={() => void navigate({ to: "/recommendations" })}>
              {t("recommendations.title")}
            </Button>
            {plan.status === "planned" && plan.destinationSlug && (
              <Button variant="outline" className="mt-2 w-full" asChild>
                <Link to="/destination/$slug" params={{ slug: plan.destinationSlug }}>View chosen destination</Link>
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Navigation, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { destBySlug, memberById } from "@/data/mock";
import { DEMO_OUTINGS, fmtDate, type OutingStatus } from "@/data/outings";
import { useDT } from "@/lib/dash-i18n";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({
    meta: [
      { title: "Travity — Calendar" },
      { name: "description", content: "See past, active and upcoming group outings on one calendar." },
      { property: "og:title", content: "Travity — Calendar" },
      { property: "og:description", content: "Past, active and upcoming outings at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalendarPage,
});

export const STATUS_STYLE: Record<OutingStatus, { cls: string; dot: string; icon: LucideIcon }> = {
  past: { cls: "bg-muted text-muted-foreground border-muted-foreground/40", dot: "bg-muted-foreground", icon: CheckCircle2 },
  active: { cls: "bg-success/15 text-success border-success", dot: "bg-success", icon: Navigation },
  upcoming: { cls: "bg-primary/15 text-primary border-primary", dot: "bg-primary", icon: Clock },
};

const pad = (n: number) => String(n).padStart(2, "0");

function CalendarPage() {
  const { dt, lang } = useDT();
  const [month, setMonth] = useState({ y: 2026, m: 9 }); // October 2026 (demo "today")
  const [selected, setSelected] = useState<string>("2026-10-27");

  const first = new Date(month.y, month.m, 1);
  const days = new Date(month.y, month.m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Monday first
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2026, 9, 26 + i).toLocaleDateString(locale, { weekday: "narrow" }));
  const shift = (d: number) => setMonth(({ y, m }) => { const n = new Date(y, m + d, 1); return { y: n.getFullYear(), m: n.getMonth() }; });
  const dayOutings = DEMO_OUTINGS.filter((o) => o.date === selected);

  return (
    <div>
      <PageHeader title={dt("calTitle")} sub={dt("calSub")} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className="h-9 w-9 rounded-lg hover:bg-accent"><ChevronLeft className="mx-auto h-5 w-5" /></button>
            <p className="font-semibold">{first.toLocaleDateString(locale, { month: "long", year: "numeric" })}</p>
            <button type="button" aria-label="Next month" onClick={() => shift(1)} className="h-9 w-9 rounded-lg hover:bg-accent"><ChevronRight className="mx-auto h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {weekdays.map((w, i) => <span key={i} className="py-1">{w}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const iso = `${month.y}-${pad(month.m + 1)}-${pad(d)}`;
              const o = DEMO_OUTINGS.find((x) => x.date === iso);
              const sel = iso === selected;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(iso)}
                  aria-pressed={sel}
                  aria-label={`${d}${o ? ` — ${dt(`status.${o.status}`)}: ${o.title}` : ""}`}
                  className={
                    "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                    (o ? STATUS_STYLE[o.status].cls + " font-semibold " : "border-transparent hover:bg-accent ") +
                    (sel ? "ring-2 ring-foreground ring-offset-1 ring-offset-card" : "")
                  }
                >
                  {d}
                  {o && <span className={"absolute bottom-1 h-1 w-1 rounded-full " + STATUS_STYLE[o.status].dot} aria-hidden />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{dt("legend")}</p>
            <ul className="flex flex-wrap gap-3 text-xs">
              {(["past", "active", "upcoming"] as OutingStatus[]).map((s) => {
                const Icon = STATUS_STYLE[s].icon;
                return (
                  <li key={s} className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 " + STATUS_STYLE[s].cls}>
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {dt(`status.${s}`)}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section aria-live="polite">
          <h2 className="mb-3 text-lg font-bold">{fmtDate(selected, lang)}</h2>
          {dayOutings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">{dt("noOutingDay")} {dt("selectDay")}</p>
          ) : (
            dayOutings.map((o) => {
              const S = STATUS_STYLE[o.status];
              const Icon = S.icon;
              return (
                <article key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold " + S.cls}>
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {dt(`status.${o.status}`)}
                  </span>
                  <h3 className="mt-2 text-lg font-bold">{o.title}</h3>
                  <p className="text-sm text-muted-foreground">{destBySlug(o.dest)?.name} · {o.time}</p>
                  <div className="mt-3 flex gap-1.5">
                    {o.memberIds.map((id) => <FriendAvatar key={id} member={memberById(id)} size={30} />)}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

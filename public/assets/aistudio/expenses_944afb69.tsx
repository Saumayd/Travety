import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { DemoBadge, PageHeader } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useT } from "@/lib/ui-prefs";
import { EXPENSES, MEMBERS, memberById, type MemberId } from "@/data/mock";

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({
    meta: [
      { title: "Travity — Expenses" },
      { name: "description", content: "Split group outing expenses fairly — who paid, who owes, and the settled balance." },
      { property: "og:title", content: "Travity — Expenses" },
      { property: "og:description", content: "Who paid, who owes, and the settled balance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExpensesPage,
});

const inr = (n: number) => `₹${Math.round(n)}`;

function ExpensesPage() {
  const { t } = useT();

  // Net balance per member across the demo expense sheet.
  const net = new Map<MemberId, number>();
  for (const e of EXPENSES) {
    const share = e.amount / e.participants.length;
    net.set(e.paidBy, (net.get(e.paidBy) ?? 0) + e.amount);
    for (const p of e.participants) {
      net.set(p, (net.get(p) ?? 0) - share);
    }
  }
  const total = EXPENSES.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader title={t("nav.expenses")} sub="One shared sheet per outing — every rupee logged, split only among who took part." />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Expense sheet</h2>
            <span className="text-sm font-semibold text-primary">Total {inr(total)}</span>
          </div>
          <div className="space-y-3">
            {EXPENSES.map((e) => (
              <article key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <FriendAvatar member={memberById(e.paidBy)} size={32} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{e.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Paid by {memberById(e.paidBy).name} · split {e.participants.length} ways
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold">{inr(e.amount)}</span>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Settle up</h2>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="space-y-3">
              {MEMBERS.map((m) => {
                const bal = net.get(m.id) ?? 0;
                const positive = bal >= 0;
                return (
                  <div key={m.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FriendAvatar member={m} size={28} />
                      <span className="text-sm font-medium">{m.name}</span>
                    </div>
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-xs font-semibold " +
                        (positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")
                      }
                    >
                      {positive ? `gets ${inr(bal)}` : `owes ${inr(-bal)}`}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-sunk p-3 text-xs text-muted-foreground">
              <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {t("common.illustrative")} — settle directly with friends; the app never holds money.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

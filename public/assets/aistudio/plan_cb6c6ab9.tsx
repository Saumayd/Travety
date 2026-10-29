import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, Clapperboard, Coffee, ShoppingBag, Trees, Utensils } from "lucide-react";

import { PageHeader, TravisImg } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { MEMBERS, memberById } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_app/plan")({
  head: () => ({
    meta: [
      { title: "Travity — Plan an outing" },
      { name: "description", content: "Create a group outing across Delhi NCR — pick the vibe, invite friends and set a destination budget." },
      { property: "og:title", content: "Travity — Plan an outing" },
      { property: "og:description", content: "Find a place that works for everyone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanPage,
});

const KINDS = [
  { id: "food-walk", label: "Food walk", icon: Utensils },
  { id: "picnic", label: "Picnic & parks", icon: Trees },
  { id: "cafes", label: "Cafe hopping", icon: Coffee },
  { id: "market", label: "Markets & shopping", icon: ShoppingBag },
  { id: "movie", label: "Movie & mall", icon: Clapperboard },
];

const STEPS = ["plan.stepKind", "plan.stepGroup", "plan.stepBudget", "plan.stepReview"] as const;

const inr = (n: number) => `₹${n}`;

function PlanPage() {
  const { t } = useT();
  const { createPlan } = useDemo();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [kind, setKind] = useState(KINDS[0]!.id);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [memberIds, setMemberIds] = useState(["aarav"]);
  const [budget, setBudget] = useState(500);

  const kindLabel = KINDS.find((k) => k.id === kind)?.label ?? kind;
  const canContinue =
    (step === 0 && kind) ||
    (step === 1 && (title.trim().length > 0 || true) && memberIds.length > 0) ||
    step === 2 ||
    step === 3;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlan({
      title: title.trim() || `${kindLabel} outing`,
      kind: kindLabel,
      date,
      budget,
      memberIds: memberIds as never,
    });
    void navigate({ to: "/lobby" });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("nav.plan")} sub="Four quick steps — then Travis finds places that work for everyone." />

      {/* Step indicator */}
      <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((key, i) => (
          <li key={key} className="flex flex-1 flex-col gap-1.5">
            <div className={"h-1.5 rounded-full " + (i <= step ? "bg-primary" : "bg-surface-sunk")} aria-hidden />
            <span className={"text-[11px] font-medium " + (i <= step ? "text-primary" : "text-muted-foreground")}>{t(key)}</span>
          </li>
        ))}
      </ol>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        {step === 0 && (
          <fieldset>
            <legend className="mb-4 font-display text-lg font-bold">{t("plan.stepKind")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  aria-pressed={kind === k.id}
                  className={
                    "flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition-colors " +
                    (kind === k.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-accent")
                  }
                >
                  <k.icon className="h-5 w-5 shrink-0" aria-hidden />
                  {k.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="space-y-5">
            <legend className="mb-4 font-display text-lg font-bold">{t("plan.stepGroup")}</legend>
            <div className="space-y-1.5">
              <Label htmlFor="plan-title">Outing name</Label>
              <Input id="plan-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`${KINDS.find((k) => k.id === kind)?.label} outing`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-date">Date</Label>
              <Input id="plan-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Who's coming?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {MEMBERS.map((m) => {
                  const checked = memberIds.includes(m.id);
                  const locked = m.id === "aarav";
                  return (
                    <label
                      key={m.id}
                      className={
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors " +
                        (checked ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-accent") +
                        (locked ? " cursor-default opacity-90" : "")
                      }
                    >
                      <Checkbox
                        checked={checked}
                        disabled={locked}
                        onCheckedChange={(v) =>
                          setMemberIds((ids) => (v === true ? [...ids, m.id] : ids.filter((x) => x !== m.id)))
                        }
                        aria-label={m.name}
                      />
                      <FriendAvatar member={m} size={32} />
                      <span className="min-w-0">
                        <span className="block font-semibold">{m.name}{locked ? " (you)" : ""}</span>
                        <span className="block truncate text-xs text-muted-foreground">{m.homeLabel}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="mb-4 font-display text-lg font-bold">{t("plan.stepBudget")}</legend>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">{t("common.destinationBudget")} · {t("common.perPerson")}</p>
              <span className="font-display text-2xl font-bold text-primary">{inr(budget)}</span>
            </div>
            <Slider
              value={[budget]}
              min={100}
              max={2000}
              step={50}
              onValueChange={([v]) => setBudget(v ?? 500)}
              aria-label="Destination budget per person"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>₹100</span>
              <span>₹2,000</span>
            </div>
            <p className="mt-4 rounded-lg bg-surface-sunk p-3 text-xs text-muted-foreground">{t("common.commuteFareNote")}</p>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="mb-4 font-display text-lg font-bold">{t("plan.stepReview")}</legend>
            <div className="flex items-start gap-4">
              <TravisImg pose="think" className="h-16 w-16 shrink-0" />
              <dl className="grid flex-1 gap-2 text-sm">
                <div className="flex justify-between gap-4 rounded-lg bg-surface-sunk px-3 py-2">
                  <dt className="text-muted-foreground">Outing</dt>
                  <dd className="font-semibold">{title.trim() || `${kindLabel} outing`}</dd>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-surface-sunk px-3 py-2">
                  <dt className="text-muted-foreground">Type · date</dt>
                  <dd className="font-semibold">{kindLabel} · {date || "date to decide"}</dd>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-surface-sunk px-3 py-2">
                  <dt className="text-muted-foreground">{t("common.destinationBudget")}</dt>
                  <dd className="font-semibold">{inr(budget)} {t("common.perPerson")}</dd>
                </div>
                <div className="rounded-lg bg-surface-sunk px-3 py-2">
                  <dt className="text-muted-foreground">Group</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {memberIds.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1 text-xs font-semibold">
                        <FriendAvatar member={memberById(id as never)} size={20} />
                        {memberById(id as never).name}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </fieldset>
        )}

        {/* Nav buttons */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t("common.back")}
          </Button>
          {step < 3 ? (
            <Button type="button" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
              {t("common.continue")}
              <Check className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button type="submit" className="grad-primary">
              Create plan
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

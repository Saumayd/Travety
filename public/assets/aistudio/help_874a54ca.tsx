import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleHelp, Lock, ShieldCheck } from "lucide-react";

import { DemoBadge, PageHeader, TravisImg } from "@/components/travity/bits";
import { useT } from "@/lib/ui-prefs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_app/help")({
  head: () => ({
    meta: [
      { title: "Travity — Help & privacy" },
      { name: "description", content: "How Travity works, what data it uses, and how your group's safety comes first." },
      { property: "og:title", content: "Travity — Help & privacy" },
      { property: "og:description", content: "How Travity works and how your privacy is protected." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

const FAQS = [
  {
    q: "How does Travity pick a place everyone can reach?",
    a: "Each friend sets a starting metro station. Travity estimates every person's commute to candidate destinations and surfaces options that balance travel time, budget and vibe — so nobody draws the short straw.",
  },
  {
    q: "How do invite codes work?",
    a: "Every plan gets a short code (like TRV-2210). Share it with friends; they enter it under Join a plan and land straight in your group lobby.",
  },
  {
    q: "Is the safety information real?",
    a: "Safety cards show the source of every claim — official data, mapped features, community reports or satellite estimates. Anything demo or community-sourced is labelled honestly and should be double-checked on the ground.",
  },
  {
    q: "How are expenses split?",
    a: "Log what was paid and who took part. Travity keeps a running sheet and shows who gets back and who owes — settling happens directly between friends, never through the app.",
  },
];

const PRIVACY = [
  {
    title: "Your location",
    body: "Live location is shared only with your own group, only while an outing is active, and off by default everywhere else.",
  },
  {
    title: "Your chats and plans",
    body: "Group chat, starting points and budgets stay inside your group. Nothing is sold or shared with advertisers.",
  },
  {
    title: "Sponsored listings",
    body: "Any sponsored place or offer is always labelled clearly — recommendations are never secretly paid placements.",
  },
];

function HelpPage() {
  const { t } = useT();

  return (
    <div>
      <PageHeader title={t("nav.help")} sub="Short answers on how Travity works, plus exactly what we do — and never do — with your data." />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-3 text-lg font-bold">Frequently asked</h2>
          <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4 shadow-soft">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <h2 className="mb-3 mt-8 text-lg font-bold">Privacy, in plain words</h2>
          <div className="space-y-3">
            {PRIVACY.map((p) => (
              <article key={p.title} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Lock className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{p.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
            <TravisImg pose="celebrate" className="mx-auto h-20 w-20 anim-float" />
            <p className="mt-3 font-semibold">Still stuck?</p>
            <p className="mt-1 text-sm text-muted-foreground">Travis can walk you through planning your first outing step by step.</p>
            <Link
              to="/plan"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("home.ctaPlan")}
            </Link>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm text-muted-foreground">
              This is a demo preview — support channels are illustrative and not yet live.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Safety guidance is informational only. Always use your own judgement on the ground.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

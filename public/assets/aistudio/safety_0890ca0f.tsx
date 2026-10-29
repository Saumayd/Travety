import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Info, ShieldCheck } from "lucide-react";

import { DemoBadge, PageHeader } from "@/components/travity/bits";
import { MetroMap } from "@/components/travity/MetroMap";
import { useT } from "@/lib/ui-prefs";
import { DESTINATIONS, SAFETY_LAYER_META, SAFETY_MARKERS, type SafetyMarker } from "@/data/mock";

export const Route = createFileRoute("/_app/safety")({
  head: () => ({
    meta: [
      { title: "Travity — Safety awareness" },
      { name: "description", content: "Transparent, honestly-labelled safety information for Delhi NCR outings — with sources, coverage and limitations shown." },
      { property: "og:title", content: "Travity — Safety awareness" },
      { property: "og:description", content: "Safety information with honest labels — never a guarantee." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SafetyPage,
});

function statusKey(status: SafetyMarker["status"]) {
  return `safety.status.${status}` as const;
}

function SafetyPage() {
  const { t } = useT();
  const [active, setActive] = useState<Set<string>>(new Set(SAFETY_LAYER_META.map((l) => l.key)));
  const [selected, setSelected] = useState<SafetyMarker | null>(null);

  const toggleLayer = (key: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visible = SAFETY_MARKERS.filter((m) => active.has(m.category));

  return (
    <div>
      <PageHeader
        title={t("safety.title")}
        sub="Every marker carries its source, coverage and limitations. Mapped does not mean verified — safety information supports decisions, it never replaces your judgement."
      />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Map + layers */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
            <MetroMap className="p-2 sm:p-4" destinations={DESTINATIONS} markers={visible} />
          </div>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-base font-bold">{t("safety.layers")}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {SAFETY_LAYER_META.map((layer) => {
                const on = active.has(layer.key);
                const count = SAFETY_MARKERS.filter((m) => m.category === layer.key).length;
                return (
                  <li key={layer.key}>
                    <button
                      type="button"
                      onClick={() => toggleLayer(layer.key)}
                      aria-pressed={on}
                      className={"flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors " + (on ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-accent")}
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: layer.color, opacity: on ? 1 : 0.35 }} aria-hidden />
                      <span className={"flex-1 font-medium " + (on ? "" : "text-muted-foreground line-through decoration-1")}>
                        {layer.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Details + honesty cards */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-base font-bold">{t("safety.detail")}</h2>
            {selected ? (
              <div className="space-y-3 text-sm">
                <h3 className="font-display text-lg font-bold">{selected.name}</h3>
                <p className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {t(statusKey(selected.status))}
                </p>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</dt>
                    <dd>{selected.sourceType}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last updated</dt>
                    <dd>{selected.lastUpdated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coverage</dt>
                    <dd>{selected.coverage}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confidence</dt>
                    <dd>{selected.confidence}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Limitations</dt>
                    <dd className="text-muted-foreground">{selected.limitations}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a marker card below to see its source, coverage, confidence and limitations.</p>
            )}
          </section>

          {/* Honest data cards */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              What this data can and can't tell you
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5 rounded-xl bg-surface-sunk p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden />
                <span>Markers are <strong>locations, not guarantees</strong>. A mapped booth or facility isn't necessarily staffed, open, or reachable right now.</span>
              </li>
              <li className="flex gap-2.5 rounded-xl bg-surface-sunk p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                <span><strong>No reports ≠ proof of safety.</strong> An area without community reports may simply have no observers — absence of data is not evidence of safety.</span>
              </li>
              <li className="flex gap-2.5 rounded-xl bg-surface-sunk p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden />
                <span><strong>One report ≠ an unsafe neighbourhood.</strong> A single negative report needs context; repeated, credible, recent reports matter more — and would still require moderation in production.</span>
              </li>
              <li className="flex gap-2.5 rounded-xl bg-surface-sunk p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                <span><strong>Satellite lighting estimates cover broad areas</strong> (~200 m). Brightness suggests lit streets — it can't confirm any individual streetlight works.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Marker list */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">All markers ({visible.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => {
            const layerColor = SAFETY_LAYER_META.find((l) => l.key === m.category)?.color ?? "var(--color-primary)";
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m)}
                aria-expanded={selected?.id === m.id}
                className={"rounded-xl border p-4 text-left transition-colors " + (selected?.id === m.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent")}
              >
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: layerColor }} aria-hidden />
                  <span className="font-semibold">{m.name}</span>
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{t(statusKey(m.status))} · {m.confidence} confidence</span>
                <span className="mt-1.5 block line-clamp-2 text-xs text-muted-foreground">{m.limitations}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

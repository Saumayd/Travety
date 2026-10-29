import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, LogOut, Moon, ShieldCheck, Star, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useDT } from "@/lib/dash-i18n";
import { destBySlug as destOf } from "@/data/mock";
import { fmtDate, MY_REVIEWS } from "@/data/outings";

import { DemoBadge, PageHeader } from "@/components/travity/bits";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useDemo } from "@/lib/demo-state";
import { LanguageSelect, useT, useTheme } from "@/lib/ui-prefs";
import { memberById } from "@/data/mock";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Travity — Profile & settings" },
      { name: "description", content: "Your Travity profile, language, theme and privacy settings." },
      { property: "og:title", content: "Travity — Profile & settings" },
      { property: "og:description", content: "Profile, language, theme and privacy settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

function ProfilePage() {
  const { t } = useT();
  const { userName, signOut } = useDemo();
  const { theme, toggleTheme } = useTheme();
  const [shareLive, setShareLive] = useState(true);
  const [safeRoutes, setSafeRoutes] = useState(true);
  const { session } = useAuth();
  const { dt, lang } = useDT();

  return (
    <div>
      <PageHeader title={t("nav.profile")} sub="Who you are on Travity, and how the app behaves for you." />
      <DemoBadge className="mb-6 hidden lg:inline-flex" />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Profile card */}
        <section className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
          <div className="mx-auto w-fit rounded-full ring-4 ring-primary/10">
            <FriendAvatar member={memberById("aarav")} size={72} />
          </div>
          <h2 className="mt-3 font-display text-xl font-bold">{userName}</h2>
          <p className="text-sm text-muted-foreground">Delhi NCR · member since Oct 2026</p>
          <button
            type="button"
            onClick={() => {
              signOut();
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </section>

        {/* Settings */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-bold">{dt("personal")}</h2>
            <div className="space-y-3">
              <Row label={dt("name")}><span className="text-sm text-muted-foreground">{userName}</span></Row>
              <Row label={dt("email")}><span className="break-all text-sm text-muted-foreground">{session?.user.email ?? dt("notSignedIn")}</span></Row>
              <Row label={dt("city")}><span className="text-sm text-muted-foreground">Delhi NCR</span></Row>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold">{dt("account")}</h2>
            <div className="space-y-3">
              <Row label={dt("password")}><span className="text-sm tracking-widest text-muted-foreground" aria-label={dt("passwordHidden")}>••••••••</span></Row>
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium opacity-60">
                  <KeyRound className="h-4 w-4" aria-hidden />{dt("changePw")}
                </button>
                <p className="mt-2 text-xs text-muted-foreground">{dt("changePwNote")}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-1 text-lg font-bold">{dt("myReviews")}</h2>
            <p className="mb-3 text-xs text-muted-foreground">{dt("reviewsDemo")}</p>
            <div className="space-y-3">
              {MY_REVIEWS.map((r) => (
                <article key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{destOf(r.dest)?.name}</h3>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-warning" aria-label={`${r.rating} / 5`}>
                      <Star className="h-4 w-4 fill-current" aria-hidden />{r.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{fmtDate(r.date, lang)}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold">Preferences</h2>
            <div className="space-y-3">
              <Row label="Language">
                <LanguageSelect />
              </Row>
              <Row label="Appearance">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </button>
              </Row>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold">Privacy & safety</h2>
            <div className="space-y-3">
              <Row label="Share live location with my group during outings">
                <Switch checked={shareLive} onCheckedChange={setShareLive} aria-label="Share live location" />
              </Row>
              <Row label="Prefer well-lit, busier route options by default">
                <Switch checked={safeRoutes} onCheckedChange={setSafeRoutes} aria-label="Prefer safer routes" />
              </Row>
              <p className="flex items-start gap-2 rounded-xl bg-surface-sunk p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                Location sharing is off by default outside active outings and never visible to people outside your group.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

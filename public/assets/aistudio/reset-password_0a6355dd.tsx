import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";


import { TravisImg } from "@/components/travity/bits";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useT, useTheme } from "@/lib/ui-prefs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Travity — Set a new password" },
      {
        name: "description",
        content: "Choose a new password for your Travity account.",
      },
      { property: "og:title", content: "Travity — Set a new password" },
      {
        property: "og:description",
        content: "Choose a new password for your Travity account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useT();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setRecovery(true);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match — try re-typing them.");
      return;
    }
    setBusy(true);
    try {
      // Recovery sessions are exempt from the current-password requirement.
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-brand-pink/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[520px] flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4 self-stretch">
          <span className="font-display text-2xl font-bold tracking-tight">Travity</span>
          <LanguageSelect />
        </div>

        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <TravisImg pose="think" className="h-14 w-14 shrink-0" />
            <div>
              <h1 className="text-xl font-bold">Set a new password</h1>
              <p className="text-sm text-muted-foreground">Pick something you haven't used before.</p>
            </div>
          </div>

          {done ? (
            <div className="space-y-4">
              <p className="text-sm text-success" role="status">
                Password updated. You can now sign in with your new password.
              </p>
              <Button type="button" className="w-full" onClick={() => void navigate({ to: "/" })}>
                Go to sign in
              </Button>
            </div>
          ) : recovery ? (
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">{t("login.password")}</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">{t("login.confirmPassword")}</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Updating…" : "Update password"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This page is for password-reset links. Open the link from your email to set a new password.
              </p>
              <Button type="button" variant="outline" className="w-full" asChild>
                <Link to="/">{t("login.backToSignIn")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <span className="sr-only" data-theme={theme}>
        current theme {theme}
      </span>
    </div>
  );
}

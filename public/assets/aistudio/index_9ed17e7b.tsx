import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, MoreVertical, Sun, Moon, Languages, ArrowRight } from "lucide-react";

import { DemoBadge, TravisImg } from "@/components/travity/bits";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useT, useTheme } from "@/lib/ui-prefs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

// Welcome-only copy stays local so other screens retain their existing wording.
const welcomeCopy = {
  en: {
    welcome: "Hi, I’m Travis! Let’s plan an escape.",
    headline: "A place everyone can get to.",
    preferences: "Appearance and language",
    appearance: "Appearance",
    light: "Light Mode",
    dark: "Dark Mode",
    language: "Language",
    name: "Name",
    passwordMismatch: "Passwords don't match — try re-typing them.",
    failure: "Something went wrong. Please try again.",
    confirmEmail: "Check your email — we sent you a confirmation link. Tap it to activate your account, then sign in here.",
    sending: "Sending…",
    resetSent: "Reset link sent — check your inbox (and spam) for the email.",
    preview: "Continue preview",
  },
  hi: {
    welcome: "हाय, मैं ट्रैविस हूँ! चलो, कहीं घूमने का प्लान बनाएँ।",
    headline: "ऐसी जगह जहाँ सब पहुँच सकें।",
    preferences: "रंग-रूप और भाषा",
    appearance: "रंग-रूप",
    light: "लाइट मोड",
    dark: "डार्क मोड",
    language: "भाषा",
    name: "नाम",
    passwordMismatch: "पासवर्ड मेल नहीं खाते — दोबारा लिखकर देखें।",
    failure: "कुछ गड़बड़ हो गई। कृपया फिर कोशिश करें।",
    confirmEmail: "अपना ईमेल देखें — हमने पुष्टि का लिंक भेजा है। अपना अकाउंट सक्रिय करने के लिए लिंक खोलें, फिर यहाँ साइन इन करें।",
    sending: "भेज रहे हैं…",
    resetSent: "पासवर्ड रीसेट का लिंक भेज दिया गया है — अपना इनबॉक्स और स्पैम फ़ोल्डर देखें।",
    preview: "बिना साइन इन प्रीव्यू देखें",
  },
};

function WelcomePreferences() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useT();
  const copy = welcomeCopy[lang];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label={copy.preferences} title={copy.preferences}>
          <MoreVertical className="h-5 w-5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} collisionPadding={16} className="w-56 rounded-xl p-2 shadow-soft">
        <DropdownMenuLabel className="text-muted-foreground">{copy.appearance}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => {
          if ((value === "light" || value === "dark") && value !== theme) toggleTheme();
        }}>
          <DropdownMenuRadioItem value="light" className="min-h-11 gap-2 rounded-lg"><Sun className="h-4 w-4" aria-hidden />{copy.light}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="min-h-11 gap-2 rounded-lg"><Moon className="h-4 w-4" aria-hidden />{copy.dark}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2 text-muted-foreground"><Languages className="h-4 w-4" aria-hidden />{copy.language}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={lang} onValueChange={(value) => {
          if (value === "en" || value === "hi") setLang(value);
        }}>
          <DropdownMenuRadioItem value="en" lang="en" className="min-h-11 rounded-lg">English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="hi" lang="hi" className="min-h-11 rounded-lg">हिंदी</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Travity — Sign in" },
      {
        name: "description",
        content:
          "Sign in to Travity — plan day outings with friends across Delhi NCR with shared routes, budgets and safety awareness.",
      },
      { property: "og:title", content: "Travity — Sign in" },
      {
        property: "og:description",
        content: "Good plans. Great people. Safer journeys — plan your next Delhi NCR outing together.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function AuthCard() {
  const { t, lang } = useT();
  const copy = welcomeCopy[lang];
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [recovering, setRecovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recoverSent, setRecoverSent] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (mode === "signup" && password !== confirm) {
      setError(copy.passwordMismatch);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: "/dashboard" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name || undefined },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (data.session) void navigate({ to: "/dashboard" });
        else setAwaitingConfirm(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failure);
    } finally {
      setBusy(false);
    }
  };

  const recover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setRecoverSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failure);
    } finally {
      setBusy(false);
    }
  };

  if (awaitingConfirm) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h2 className="text-xl font-bold">{t("login.createAccount")}</h2>
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {copy.confirmEmail}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 w-full"
          onClick={() => {
            setAwaitingConfirm(false);
            setMode("signin");
          }}
        >
          {t("login.backToSignIn")}
        </Button>
      </div>
    );
  }

  if (recovering) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h2 className="text-xl font-bold">{t("login.recoverTitle")}</h2>
        <form className="mt-5 space-y-4" onSubmit={recover}>
          <div className="space-y-1.5">
            <Label htmlFor="recover-email">{t("login.email")}</Label>
            <Input
              id="recover-email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? copy.sending : t("login.recoverTitle")}
          </Button>
          {recoverSent && (
            <p className="text-sm text-success" role="status">
              {copy.resetSent}
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setRecovering(false);
              setRecoverSent(false);
              setError(null);
            }}
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            ← {t("login.backToSignIn")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-surface-sunk p-1" role="tablist">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={
              "min-h-[40px] rounded-lg text-sm font-semibold transition-colors " +
              (mode === m ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")
            }
          >
            {m === "signin" ? t("login.signIn") : t("login.createAccount")}
          </button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={submit}>
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">{copy.name}</Label>
            <Input
              id="name"
              placeholder="Aarav"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("login.email")}</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("login.password")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
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
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="confirm">{t("login.confirmPassword")}</Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} aria-label={t("login.rememberMe")} />
            {t("login.rememberMe")}
          </label>
          <button
            type="button"
            onClick={() => {
              setRecovering(true);
              setError(null);
              setRecoverSent(false);
            }}
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {t("login.forgot")}
          </button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "…" : mode === "signin" ? t("login.signIn") : t("login.createAccount")}
        </Button>
      </form>
    </div>
  );
}

function Login() {
  const { t, lang } = useT();
  const copy = welcomeCopy[lang];
  const { session, loading, startPreview } = useAuth();
  const navigate = useNavigate();

  // Already signed in (restored session)? Skip straight to the dashboard.
  useEffect(() => {
    if (!loading && session) void navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Lagoon accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-brand-pink/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 pb-8 pt-4 sm:px-6 sm:pt-6">
        <header className="flex items-center justify-between gap-4">
          <span className="font-display text-2xl font-bold tracking-normal">Travity</span>
          <WelcomePreferences />
        </header>

        <main className="mx-auto mt-5 w-full max-w-md sm:mt-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <TravisDoodles />
              <TravisImg pose="wave" className="relative h-48 w-48 shrink-0 object-contain anim-greet sm:h-64 sm:w-64" />
            </div>
            <h1 className="mt-4 font-display text-xl font-bold leading-snug tracking-normal sm:text-2xl">{copy.welcome}</h1>
            <p className="mt-2 text-sm font-semibold text-grad">{copy.headline}</p>
          </div>

          <div className="mt-6 sm:mt-8">
            <AuthCard />
            <Button type="button" variant="outline" className="mt-4 min-h-11 w-full" onClick={() => {
              startPreview();
              void navigate({ to: "/dashboard" });
            }}>
              {copy.preview}<ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <DemoBadge />
            <span className="text-sm text-muted-foreground">{t("brand.support")}</span>
          </div>
        </main>
      </div>
    </div>
  );
}

/* Sparse decorative doodles around Travis — purely ornamental. */
function TravisDoodles() {
  const star = "M12 2l2.2 6.8H21l-5.5 4 2.1 6.7L12 15.4 6.4 19.5l2.1-6.7L3 8.8h6.8z";
  return (
    <div className="pointer-events-none absolute -inset-10 sm:-inset-14" aria-hidden>
      <svg viewBox="0 0 24 24" className="absolute left-2 top-6 h-5 w-5 text-brand-pink anim-twinkle" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d={star} /></svg>
      <svg viewBox="0 0 24 24" className="absolute right-4 top-2 h-4 w-4 text-brand-cyan anim-twinkle [animation-delay:1.2s]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d={star} /></svg>
      <svg viewBox="0 0 24 24" className="absolute bottom-10 right-0 h-3.5 w-3.5 text-primary anim-twinkle [animation-delay:0.6s]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d={star} /></svg>
      <span className="absolute bottom-16 left-0 h-3 w-3 rounded-full border border-brand-cyan/70 anim-float" />
      <span className="absolute left-8 top-1/2 h-2 w-2 rounded-full border border-primary/60 anim-float [animation-delay:2s]" />
      <span className="absolute right-8 top-1/3 h-2.5 w-2.5 rounded-full border border-brand-pink/60 anim-float [animation-delay:1s]" />
      <svg viewBox="0 0 24 24" className="absolute -right-1 bottom-24 h-6 w-6 rotate-45 text-primary/80 anim-float [animation-delay:0.5s]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c3 2.5 4 6 4 10l-4 3-4-3c0-4 1-7.5 4-10z" /><circle cx="12" cy="9" r="1.5" /><path d="M8 12l-3 3 3 1M16 12l3 3-3 1M11 18l1 3 1-3" />
      </svg>
    </div>
  );
}

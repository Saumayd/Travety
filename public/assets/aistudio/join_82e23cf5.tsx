import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Ticket } from "lucide-react";

import { PageHeader, TravisImg } from "@/components/travity/bits";
import { useDemo } from "@/lib/demo-state";
import { useT } from "@/lib/ui-prefs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/join")({
  head: () => ({
    meta: [
      { title: "Travity — Join a plan" },
      { name: "description", content: "Enter an invite code to join a friend's Travity outing plan." },
      { property: "og:title", content: "Travity — Join a plan" },
      { property: "og:description", content: "Join your friends' outing plan with an invite code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { t } = useT();
  const { plan, joinByCode } = useDemo();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!/^TRV-\d{4}$/.test(normalized)) {
      setError("Invite codes look like TRV-1234. Check the code and try again.");
      return;
    }
    setBusy(true);
    const ok = await joinByCode(normalized);
    setBusy(false);
    if (ok) {
      void navigate({ to: "/lobby" });
      return;
    }
    setError("No plan found with that code. Ask your friend to double-check the code and try again.");
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t("nav.join")} sub="Got a code from a friend? Drop it in and you're in the lobby." />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-4">
          <TravisImg pose="wave" className="h-14 w-14 shrink-0 anim-greet" />
          <p className="text-sm text-muted-foreground">
            Friends share a <span className="font-semibold text-foreground">TRV-XXXX</span> code when they create a plan.
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="invite-code">Invite code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="invite-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
                placeholder="TRV-0000"
                className="pl-9 font-mono uppercase tracking-widest"
                autoFocus
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            <Ticket className="h-4 w-4" aria-hidden />
            {busy ? "Joining…" : "Join plan"}
          </Button>
        </form>

        {plan && (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-surface-sunk p-4 text-sm">
            <p className="font-semibold">Your plan's code</p>
            <p className="mt-1 text-muted-foreground">
              Share <span className="font-mono font-bold text-foreground">{plan.inviteCode}</span> with friends so they can join “{plan.title}”.
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No code yet?{" "}
          <Link to="/plan" className="font-medium text-primary underline-offset-2 hover:underline">
            Plan an outing instead
          </Link>
        </p>
      </div>
    </div>
  );
}

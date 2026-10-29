import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

/* ------------------------------------------------------------------ */
/* Real auth session + profile. Mounted once in the root route.        */
/* ------------------------------------------------------------------ */

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  /** True until the first session lookup resolves. */
  loading: boolean;
  /** UI-only guest preview; never creates an authenticated session. */
  preview: boolean;
  startPreview: () => void;
  exitPreview: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setPreview(window.sessionStorage.getItem("travity-preview") === "1");
  }, []);

  const startPreview = useCallback(() => {
    window.sessionStorage.setItem("travity-preview", "1");
    setPreview(true);
  }, []);

  const exitPreview = useCallback(() => {
    window.sessionStorage.removeItem("travity-preview");
    setPreview(false);
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setProfile(data);
        return;
      }
      // Signup trigger normally creates the row; fall back to a direct insert.
      const { data: created } = await supabase
        .from("profiles")
        .insert({ id: userId })
        .select("id, display_name, created_at")
        .single();
      if (active && created) setProfile(created);
    };

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!active) return;
      setSession(s);
      setLoading(false);
      if (s) await loadProfile(s.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      // Identity transitions only — TOKEN_REFRESHED fires hourly and would thrash the router.
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(s);
      router.invalidate();
      if (s) void loadProfile(s.user.id);
      else setProfile(null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return <AuthContext.Provider value={{ session, profile, loading, preview, startPreview, exitPreview }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

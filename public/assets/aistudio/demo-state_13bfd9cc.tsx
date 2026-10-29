import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { DemoContext } from "@/lib/demo-context";
import { DEMO_CHAT_SEED, memberById, type MemberId } from "@/data/mock";

/* ------------------------------------------------------------------ */
/* Cloud-backed application state (Lovable Cloud).                     */
/* The signed-in user is the plan owner ("aarav" in the demo UI);      */
/* real users who join by invite code are keyed by their display name. */
/* Writes are optimistic: local state updates immediately, the backend */
/* write follows in the background.                                    */
/* ------------------------------------------------------------------ */

export interface ChatMsg {
  id: string;
  memberId: MemberId;
  text: string;
  time: string;
}

export interface Expense {
  id: string;
  label: string;
  paidBy: MemberId;
  amount: number;
  participants: MemberId[];
}

export interface Plan {
  id: string;
  title: string;
  kind: string;
  date: string;
  budget: number;
  destinationSlug: string | null;
  inviteCode: string;
  memberIds: MemberId[];
  startPoints: Partial<Record<MemberId, string>>;
  chat: ChatMsg[];
  expenses: Expense[];
  status: "lobby" | "recommendations" | "planned";
}

export interface Outing {
  id: string;
  name: string;
  date: string;
  dest: string;
  attendees: MemberId[];
  spend: number;
  rating: number;
  highlight: string;
}

interface DemoState {
  signedIn: boolean;
  plan: Plan | null;
  savedIds: string[];
  notifsRead: boolean;
  pastOutings: Outing[];
}

const DEFAULT_SAVED = ["sunder-nursery", "dilli-haat-ina"];

/* Demo past outings shown until the user's own completed outings exist. */
const DEFAULT_PAST_OUTINGS: Outing[] = [
  {
    id: "past-1",
    name: "Sunder Nursery Picnic",
    date: "Sun, Oct 11",
    dest: "sunder-nursery",
    attendees: ["aarav", "priya", "rohan", "sana"],
    spend: 310,
    rating: 4.6,
    highlight: "Golden hour by the water channels — Priya's chess comeback.",
  },
  {
    id: "past-2",
    name: "NSP Food Street Crawl",
    date: "Sat, Sep 27",
    dest: "netaji-subhash-place",
    attendees: ["aarav", "kabir", "meera"],
    spend: 420,
    rating: 4.2,
    highlight: "Tandoori chai round two, and Kabir's 12-momo record.",
  },
];

const NOTIFS_KEY = "travity-notifs-read";

export interface DemoApi extends DemoState {
  /** True once the signed-in user's data has loaded from the backend. */
  hydrated: boolean;
  userName: string;
  signIn: (name?: string) => void;
  signOut: () => Promise<void>;
  createPlan: (input: { title: string; kind: string; date: string; budget: number; memberIds: MemberId[] }) => void;
  updatePlan: (patch: Partial<Plan>) => void;
  setStartPoint: (memberId: MemberId, stationId: string) => void;
  addMember: (memberId: MemberId) => void;
  /** Join a plan by invite code. Resolves true when the plan was joined. */
  joinByCode: (code: string) => Promise<boolean>;
  sendChat: (text: string) => void;
  chooseDestination: (slug: string) => void;
  toggleSaved: (slug: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  markNotifsRead: () => void;
}

/* ----------------------------- DB rows ----------------------------- */

interface PlanRow {
  id: string;
  owner_id: string;
  title: string;
  kind: string;
  date: string | null;
  budget: number | null;
  destination_slug: string | null;
  invite_code: string;
  status: string;
}

interface MemberRow {
  member_key: string;
  display_name: string;
  profile_id: string | null;
  start_point: string | null;
}

interface ChatRow {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface ExpenseRow {
  id: string;
  paid_by_name: string;
  label: string;
  amount: number | null;
  /** jsonb array of member keys; typed loosely at the boundary. */
  participants: unknown;
}

interface OutingRow {
  id: string;
  name: string;
  date: string | null;
  dest: string | null;
  /** jsonb array of member keys; typed loosely at the boundary. */
  attendees: unknown;
  spend: number | null;
  rating: number | null;
  highlight: string | null;
}

function hhmm(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function mapChat(row: ChatRow): ChatMsg {
  return { id: row.id, memberId: row.author_name, text: row.body, time: hhmm(row.created_at) };
}

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    label: row.label,
    paidBy: row.paid_by_name,
    amount: Number(row.amount ?? 0),
    participants: (row.participants as MemberId[] | null) ?? [],
  };
}

function mapOuting(row: OutingRow): Outing {
  return {
    id: row.id,
    name: row.name,
    date: row.date ?? "",
    dest: row.dest ?? "",
    attendees: (row.attendees as MemberId[] | null) ?? [],
    spend: Number(row.spend ?? 0),
    rating: Number(row.rating ?? 0),
    highlight: row.highlight ?? "",
  };
}

async function fetchPlan(planId: string): Promise<Plan | null> {
  const [{ data: planRow }, { data: memberRows }, { data: chatRows }, { data: expenseRows }] = await Promise.all([
    supabase.from("plans").select("*").eq("id", planId).maybeSingle(),
    supabase.from("plan_members").select("member_key, display_name, profile_id, start_point").eq("plan_id", planId).order("joined_at"),
    supabase.from("chat_messages").select("id, author_name, body, created_at").eq("plan_id", planId).order("created_at").limit(200),
    supabase.from("expenses").select("id, paid_by_name, label, amount, participants").eq("plan_id", planId).order("created_at"),
  ]);
  if (!planRow) return null;
  const p = planRow as PlanRow;
  const members = (memberRows ?? []) as MemberRow[];
  const startPoints: Partial<Record<MemberId, string>> = {};
  for (const m of members) if (m.start_point) startPoints[m.member_key as MemberId] = m.start_point;
  return {
    id: p.id,
    title: p.title,
    kind: p.kind,
    date: p.date ?? "",
    budget: Number(p.budget ?? 0),
    destinationSlug: p.destination_slug,
    inviteCode: p.invite_code,
    memberIds: members.map((m) => m.member_key) as MemberId[],
    startPoints,
    chat: ((chatRows ?? []) as ChatRow[]).map(mapChat),
    expenses: ((expenseRows ?? []) as ExpenseRow[]).map(mapExpense),
    status: (p.status as Plan["status"]) ?? "lobby",
  };
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const { session, profile, loading: authLoading, exitPreview } = useAuth();
  const [state, setState] = useState<DemoState>({
    signedIn: false,
    plan: null,
    savedIds: DEFAULT_SAVED,
    notifsRead: false,
    pastOutings: DEFAULT_PAST_OUTINGS,
  });
  const [hydrated, setHydrated] = useState(false);
  /** True once the user has toggled a saved place — after that the backend list is authoritative. */
  const touchedSaved = useRef(false);

  /* Restore the notifications-read flag from local storage. */
  useEffect(() => {
    try {
      if (window.localStorage.getItem(NOTIFS_KEY) === "1") setState((s) => ({ ...s, notifsRead: true }));
    } catch {
      /* storage unavailable */
    }
  }, []);

  /* Load the signed-in user's data from the backend. */
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setState({ signedIn: false, plan: null, savedIds: DEFAULT_SAVED, notifsRead: false, pastOutings: DEFAULT_PAST_OUTINGS });
      setHydrated(true);
      return;
    }
    let active = true;
    setHydrated(false);
    (async () => {
      const uid = session.user.id;
      // Own most recent plan, else the most recent plan joined as a member.
      const { data: ownRows } = await supabase.from("plans").select("id").eq("owner_id", uid).order("created_at", { ascending: false }).limit(1);
      let planId: string | null = ownRows?.[0]?.id ?? null;
      if (!planId) {
        const { data: memberRows } = await supabase
          .from("plan_members")
          .select("plan_id")
          .eq("profile_id", uid)
          .order("joined_at", { ascending: false })
          .limit(1);
        planId = memberRows?.[0]?.plan_id ?? null;
      }
      if (!active) return;
      const [{ data: savedRows }, { data: outingRows }, plan] = await Promise.all([
        supabase.from("saved_places").select("slug").eq("user_id", uid),
        supabase.from("outings").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(50),
        planId ? fetchPlan(planId) : Promise.resolve(null),
      ]);
      if (!active) return;
      setState((s) => ({
        ...s,
        signedIn: true,
        plan,
        savedIds:
          savedRows && savedRows.length > 0 ? savedRows.map((r) => r.slug) : touchedSaved.current ? [] : s.savedIds,
        pastOutings: outingRows && outingRows.length > 0 ? outingRows.map(mapOuting) : s.pastOutings,
      }));
      setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, [session, authLoading]);

  /* Live chat for the active plan. */
  const planId = state.plan?.id;
  useEffect(() => {
    if (!planId || !session) return;
    const channel = supabase
      .channel(`chat-${planId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `plan_id=eq.${planId}` },
        (payload) => {
          const row = payload.new as ChatRow;
          setState((s) => {
            if (!s.plan || s.plan.id !== planId) return s;
            if (s.plan.chat.some((c) => c.id === row.id)) return s;
            return { ...s, plan: { ...s.plan!, chat: [...s.plan!.chat, mapChat(row)] } };
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [planId, session]);

  const signIn = useCallback(() => {
    setState((s) => ({ ...s, signedIn: true }));
  }, []);

  const signOut = useCallback(async () => {
    exitPreview();
    await supabase.auth.signOut();
  }, [exitPreview]);

  const createPlan = useCallback<DemoApi["createPlan"]>(
    (input) => {
      if (!session || !profile) return;
      const id = crypto.randomUUID();
      const inviteCode = `TRV-${Math.floor(1000 + Math.random() * 9000)}`;
      const plan: Plan = {
        id,
        title: input.title,
        kind: input.kind,
        date: input.date,
        budget: input.budget,
        destinationSlug: null,
        inviteCode,
        memberIds: ["aarav", ...input.memberIds],
        startPoints: { aarav: "rajiv-chowk" },
        chat: [...DEMO_CHAT_SEED],
        expenses: [],
        status: "lobby",
      };
      setState((s) => ({ ...s, plan }));

      void (async () => {
        const { error } = await supabase.from("plans").insert({
          id,
          owner_id: profile.id,
          title: input.title,
          kind: input.kind,
          date: input.date,
          budget: input.budget,
          invite_code: inviteCode,
          status: "lobby",
        });
        if (error) {
          console.error("createPlan failed", error);
          return;
        }
        const memberRows: { plan_id: string; member_key: string; display_name: string; profile_id: string | null }[] = [
          { plan_id: id, member_key: "aarav", display_name: profile.display_name, profile_id: profile.id },
        ];
        for (const memberId of input.memberIds) {
          memberRows.push({ plan_id: id, member_key: memberId, display_name: memberById(memberId).name, profile_id: null });
        }
        await supabase.from("plan_members").insert(memberRows);
        await supabase.from("chat_messages").insert(
          DEMO_CHAT_SEED.map((m) => ({ plan_id: id, author_name: m.memberId, body: m.text })),
        );
      })();
    },
    [session, profile],
  );

  const updatePlan = useCallback<DemoApi["updatePlan"]>((patch) => {
    setState((s) => (s.plan ? { ...s, plan: { ...s.plan, ...patch } } : s));
    if (!state.plan) return;
    const row: {
      title?: string;
      kind?: string;
      date?: string;
      budget?: number;
      destination_slug?: string | null;
      status?: string;
    } = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.kind !== undefined) row.kind = patch.kind;
    if (patch.date !== undefined) row.date = patch.date;
    if (patch.budget !== undefined) row.budget = patch.budget;
    if (patch.destinationSlug !== undefined) row.destination_slug = patch.destinationSlug;
    if (patch.status !== undefined) row.status = patch.status;
    if (Object.keys(row).length === 0) return;
    void supabase.from("plans").update(row).eq("id", state.plan.id);
  }, [state.plan]);

  const setStartPoint = useCallback<DemoApi["setStartPoint"]>((memberId, stationId) => {
    setState((s) =>
      s.plan
        ? { ...s, plan: { ...s.plan, startPoints: { ...s.plan.startPoints, [memberId]: stationId } } }
        : s,
    );
    if (!state.plan) return;
    void supabase.from("plan_members").update({ start_point: stationId }).eq("plan_id", state.plan.id).eq("member_key", memberId);
  }, [state.plan]);

  const addMember = useCallback<DemoApi["addMember"]>((memberId) => {
    setState((s) =>
      s.plan && !s.plan.memberIds.includes(memberId)
        ? { ...s, plan: { ...s.plan, memberIds: [...s.plan.memberIds, memberId] } }
        : s,
    );
    if (!state.plan || state.plan.memberIds.includes(memberId)) return;
    void supabase.from("plan_members").insert({
      plan_id: state.plan.id,
      member_key: memberId,
      display_name: memberById(memberId).name,
      profile_id: null,
    });
  }, [state.plan]);

  const joinByCode = useCallback<DemoApi["joinByCode"]>(
    async (code) => {
      if (!session) return false;
      const { data: planRow } = await supabase.from("plans").select("id").eq("invite_code", code).maybeSingle();
      if (!planRow) return false;
      const { data: existing } = await supabase
        .from("plan_members")
        .select("id")
        .eq("plan_id", planRow.id)
        .eq("profile_id", session.user.id)
        .maybeSingle();
      if (!existing) {
        const name = (profile?.display_name ?? "").trim() || "Friend";
        let key = name;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { error } = await supabase.from("plan_members").insert({
            plan_id: planRow.id,
            member_key: key,
            display_name: name,
            profile_id: session.user.id,
          });
          if (!error) break;
          key = `${name} ${attempt + 2}`;
        }
      }
      const plan = await fetchPlan(planRow.id);
      if (plan) setState((s) => ({ ...s, plan }));
      return true;
    },
    [session, profile],
  );

  const sendChat = useCallback<DemoApi["sendChat"]>((text) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const localId = `c-${now.getTime()}`;
    setState((s) => {
      if (!s.plan) return s;
      return { ...s, plan: { ...s.plan, chat: [...s.plan.chat, { id: localId, memberId: "aarav" as MemberId, text, time }] } };
    });
    if (!state.plan) return;
    void supabase.from("chat_messages").insert({
      plan_id: state.plan.id,
      author_name: "aarav",
      body: text,
    });
  }, [state.plan]);

  const chooseDestination = useCallback<DemoApi["chooseDestination"]>(
    (slug) => {
      updatePlan({ destinationSlug: slug, status: "planned" });
    },
    [updatePlan],
  );

  const toggleSaved = useCallback<DemoApi["toggleSaved"]>(
    (slug) => {
      touchedSaved.current = true;
      setState((s) => {
        const savedIds = s.savedIds.includes(slug) ? s.savedIds.filter((x) => x !== slug) : [...s.savedIds, slug];
        if (session) {
          void (async () => {
            await supabase.from("saved_places").delete().eq("user_id", session.user.id);
            if (savedIds.length > 0) {
              await supabase.from("saved_places").insert(savedIds.map((sl) => ({ user_id: session.user.id, slug: sl })));
            }
          })();
        }
        return { ...s, savedIds };
      });
    },
    [session],
  );

  const addExpense = useCallback<DemoApi["addExpense"]>((expense) => {
    const localId = `e-${Date.now()}`;
    setState((s) =>
      s.plan
        ? { ...s, plan: { ...s.plan, expenses: [...s.plan.expenses, { ...expense, id: localId }] } }
        : s,
    );
    if (!state.plan) return;
    void supabase.from("expenses").insert({
      plan_id: state.plan.id,
      paid_by_profile_id: profile?.id ?? null,
      paid_by_name: expense.paidBy,
      label: expense.label,
      amount: expense.amount,
      participants: expense.participants,
    });
  }, [state.plan, profile]);

  const markNotifsRead = useCallback(() => {
    setState((s) => ({ ...s, notifsRead: true }));
    try {
      window.localStorage.setItem(NOTIFS_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const userName = profile?.display_name ?? "Aarav";

  const value = useMemo<DemoApi>(
    () => ({
      ...state,
      hydrated,
      userName,
      signIn,
      signOut,
      createPlan,
      updatePlan,
      setStartPoint,
      addMember,
      joinByCode,
      sendChat,
      chooseDestination,
      toggleSaved,
      addExpense,
      markNotifsRead,
    }),
    [state, hydrated, userName, signIn, signOut, createPlan, updatePlan, setStartPoint, addMember, joinByCode, sendChat, chooseDestination, toggleSaved, addExpense, markNotifsRead],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}

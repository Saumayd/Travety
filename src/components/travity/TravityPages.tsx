import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clapperboard,
  Clock,
  Coffee,
  Copy,
  Heart,
  HeartOff,
  History,
  IndianRupee,
  Info,
  KeyRound,
  MapPin,
  MessageSquare,
  Navigation,
  Orbit,
  Scale,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Table2,
  Ticket,
  Trees,
  Users,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import {
  DEMO_OUTINGS,
  DESTINATIONS,
  destBySlug,
  fmtDate,
  groupCommutes,
  LINE_COLORS,
  memberById,
  MEMBERS,
  NEARBY,
  outingsBy,
  SAFETY_LAYER_META,
  SAFETY_MARKERS,
  stationName,
  STATIONS,
  type Destination,
  type MemberId,
  type NearbyPlace,
  type SafetyMarker,
} from '../../data/travityData';
import { useT } from '../../lib/ui-prefs';
import {
  DemoBadge,
  DestinationArt,
  FriendAvatar,
  MetroMap,
  PageHeader,
  TravisImg,
  type MapRoute,
} from './TravityBits';
import { DmrcMetroMap } from '../DmrcMetroMap';
import { LobbyMapWidget } from '../LobbyMapWidget';
import {
  NCR_HUB_RECOMMENDATIONS,
  type AppMode,
  type HubRecommendation,
  type SquadMember,
} from '../../data/ncrMetroData';
import type { GroundingSource } from '../GeminiChatDrawer';

export type TravityPageId =
  | 'dashboard'
  | 'plan'
  | 'join'
  | 'lobby'
  | 'recommendations'
  | 'explore'
  | 'saved'
  | 'destination'
  | 'map'
  | 'safety'
  | 'calendar'
  | 'invitations'
  | 'outings'
  | 'past'
  | 'reviews'
  | 'expenses'
  | 'notifications'
  | 'profile'
  | 'help';

export interface GroupChatNote {
  id: string;
  memberId: MemberId;
  text: string;
  time: string;
}

export interface ActivePlanState {
  title: string;
  kind: string;
  date: string;
  budget: number;
  inviteCode: string;
  destinationSlug: string | null;
  memberIds: MemberId[];
  startPoints: Partial<Record<MemberId, string>>;
  chat: GroupChatNote[];
  status: 'lobby' | 'recommendations' | 'planned';
}

const inr = (n: number) => `₹${Math.round(n)}`;

/* ========================================================================== */
/* 1. DASHBOARD PAGE                                                          */
/* ========================================================================== */

function SmallCard({
  onClick,
  icon: Icon,
  title,
  children,
  tone,
}: {
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  tone: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[132px] w-full flex-col rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:bg-accent active:translate-y-0 active:scale-[0.99]"
    >
      <span className={'flex h-10 w-10 items-center justify-center rounded-xl ' + tone}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="mt-3 text-sm font-semibold leading-tight">{title}</span>
      <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{children}</span>
    </button>
  );
}

export function DashboardPage({
  activeMemberId,
  onSelectMember,
  onNavigate,
  plan,
}: {
  activeMemberId: MemberId;
  onSelectMember: (id: MemberId) => void;
  onNavigate: (page: TravityPageId) => void;
  plan: ActivePlanState;
}) {
  const { t, dt, lang } = useT();
  const activeMember = memberById(activeMemberId);
  const activeOuting = outingsBy('active')[0];
  const upcoming = outingsBy('upcoming');
  const past = outingsBy('past');

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {t('home.greeting', { name: activeMember.name })}
        </h1>

        {/* Quick Squad Identity Selector (Saumay, Devika, Vansh, Rimisha, Pragya) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {MEMBERS.map((m) => {
            const selected = m.id === activeMemberId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMember(m.id)}
                className={
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ' +
                  (selected
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground')
                }
              >
                <FriendAvatar member={m} size={18} />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate('plan')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onNavigate('plan');
        }}
        className="group relative mb-5 block cursor-pointer overflow-hidden rounded-3xl border border-primary/30 bg-card p-5 shadow-lift transition-all hover:-translate-y-1 active:translate-y-0 active:scale-[0.995] sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 grad-primary opacity-[0.12]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-brand-pink/15 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-start gap-4 min-[420px]:flex-row min-[420px]:items-center sm:gap-6">
          <TravisImg
            pose="celebrate"
            className="h-16 w-16 shrink-0 anim-float drop-shadow-lg min-[420px]:h-20 min-[420px]:w-20 sm:h-28 sm:w-28"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold leading-tight sm:text-3xl">
              <span className="text-grad">{dt('planTitle')}</span>
            </h2>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {dt('planSub')}
            </p>
            <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors group-hover:bg-primary/90 sm:mt-4 sm:text-sm">
              {dt('planCta')}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Cards — 2 × 2 */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <SmallCard
          onClick={() => onNavigate('join')}
          icon={Users}
          title={dt('joinTitle')}
          tone="bg-brand-cyan/10 text-brand-cyan"
        >
          {dt('joinSub')}
        </SmallCard>

        <SmallCard
          onClick={() => onNavigate('lobby')}
          icon={Navigation}
          title={dt('activeTitle')}
          tone="bg-success/10 text-success"
        >
          {plan.title} ({plan.inviteCode}) ·{' '}
          {activeOuting ? `${dt('today')} ${activeOuting.time}` : 'Open group lobby'}
        </SmallCard>

        <SmallCard
          onClick={() => onNavigate('calendar')}
          icon={CalendarClock}
          title={dt('upcomingTitle')}
          tone="bg-primary/10 text-primary"
        >
          {dt('upcomingCount', { n: upcoming.length })}
          {upcoming[0] ? ` · ${fmtDate(upcoming[0].date, lang)}` : ''}
        </SmallCard>

        <SmallCard
          onClick={() => onNavigate('past')}
          icon={History}
          title={dt('recentTitle')}
          tone="bg-brand-pink/10 text-brand-pink"
        >
          {dt('recentCount', { n: past.length })}
          {past.at(-1) ? ` · ${destBySlug(past.at(-1)!.dest)?.name ?? ''}` : ''}
        </SmallCard>
      </section>

      {/* Quick Tools Strip for Smartphones & Desktop */}
      <section className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => onNavigate('recommendations')}
          className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-left text-xs font-semibold transition-colors hover:bg-accent"
        >
          <Scale className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{t('nav.recommendations')}</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('explore')}
          className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-left text-xs font-semibold transition-colors hover:bg-accent"
        >
          <Search className="h-4 w-4 shrink-0 text-brand-cyan" aria-hidden />
          <span className="truncate">{t('nav.explore')}</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('safety')}
          className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-left text-xs font-semibold transition-colors hover:bg-accent"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
          <span className="truncate">{t('safety.title')}</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('expenses')}
          className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-left text-xs font-semibold transition-colors hover:bg-accent"
        >
          <IndianRupee className="h-4 w-4 shrink-0 text-brand-pink" aria-hidden />
          <span className="truncate">{t('nav.expenses')}</span>
        </button>
      </section>
    </div>
  );
}

/* ========================================================================== */
/* 2. PLAN AN OUTING PAGE                                                     */
/* ========================================================================== */

const KINDS = [
  { id: 'food-walk', label: 'Food walk', icon: Utensils },
  { id: 'picnic', label: 'Picnic & parks', icon: Trees },
  { id: 'cafes', label: 'Cafe hopping', icon: Coffee },
  { id: 'market', label: 'Markets & shopping', icon: ShoppingBag },
  { id: 'movie', label: 'Campus & lounge', icon: Clapperboard },
];

const STEPS = [
  'plan.stepKind',
  'plan.stepGroup',
  'plan.stepBudget',
  'plan.stepReview',
] as const;

export function PlanOutingPage({
  activeMemberId,
  onCreatePlan,
}: {
  activeMemberId: MemberId;
  onCreatePlan: (input: {
    title: string;
    kind: string;
    date: string;
    budget: number;
    memberIds: MemberId[];
  }) => void;
}) {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState(KINDS[0]!.id);
  const [title, setTitle] = useState('NSUT × IGDTUW Squad Meet');
  const [date, setDate] = useState('2026-10-30');
  const [memberIds, setMemberIds] = useState<MemberId[]>([
    'saumay',
    'devika',
    'vansh',
    'rimisha',
    'pragya',
  ]);
  const [budget, setBudget] = useState(450);

  const kindLabel = KINDS.find((k) => k.id === kind)?.label ?? kind;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePlan({
      title: title.trim() || `${kindLabel} outing`,
      kind: kindLabel,
      date,
      budget,
      memberIds: memberIds.length > 0 ? memberIds : [activeMemberId],
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t('nav.plan')}
        sub="Four quick steps — then Travis finds places across Delhi NCR that work for everyone."
      />

      <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((key, i) => (
          <li key={key} className="flex flex-1 flex-col gap-1.5">
            <div
              className={'h-1.5 rounded-full ' + (i <= step ? 'bg-primary' : 'bg-surface-sunk')}
              aria-hidden
            />
            <span
              className={
                'text-[11px] font-medium ' +
                (i <= step ? 'text-primary' : 'text-muted-foreground')
              }
            >
              {t(key)}
            </span>
          </li>
        ))}
      </ol>

      <form
        onSubmit={submit}
        className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8"
      >
        {step === 0 && (
          <fieldset>
            <legend className="mb-4 font-display text-lg font-bold">{t('plan.stepKind')}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  aria-pressed={kind === k.id}
                  className={
                    'flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition-colors ' +
                    (kind === k.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:bg-accent')
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
            <legend className="mb-4 font-display text-lg font-bold">{t('plan.stepGroup')}</legend>
            <div className="space-y-1.5">
              <label htmlFor="plan-title" className="text-sm font-medium">
                Outing name
              </label>
              <input
                id="plan-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${kindLabel} outing`}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="plan-date" className="text-sm font-medium">
                Date
              </label>
              <input
                id="plan-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Who&apos;s coming?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {MEMBERS.map((m) => {
                  const checked = memberIds.includes(m.id);
                  const locked = m.id === activeMemberId;
                  return (
                    <label
                      key={m.id}
                      className={
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ' +
                        (checked
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:bg-accent') +
                        (locked ? ' cursor-default opacity-95' : '')
                      }
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={locked}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setMemberIds((ids) =>
                            next ? [...ids, m.id] : ids.filter((x) => x !== m.id)
                          );
                        }}
                        className="h-4 w-4 accent-primary"
                      />
                      <FriendAvatar member={m} size={32} />
                      <span className="min-w-0">
                        <span className="block font-semibold">
                          {m.name}
                          {locked ? ' (you)' : ''}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {m.homeLabel} · Curfew {m.curfew}
                        </span>
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
            <legend className="mb-4 font-display text-lg font-bold">{t('plan.stepBudget')}</legend>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">
                {t('common.destinationBudget')} · {t('common.perPerson')}
              </p>
              <span className="font-display text-2xl font-bold text-primary">{inr(budget)}</span>
            </div>
            <input
              type="range"
              min={100}
              max={1500}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
              aria-label="Destination budget per person"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>₹100</span>
              <span>₹1,500</span>
            </div>
            <p className="mt-4 rounded-lg bg-surface-sunk p-3 text-xs text-muted-foreground">
              {t('common.commuteFareNote')}
            </p>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="mb-4 font-display text-lg font-bold">{t('plan.stepReview')}</legend>
            <div className="flex items-start gap-4">
              <TravisImg pose="think" className="h-16 w-16 shrink-0" />
              <dl className="grid flex-1 gap-2 text-sm">
                <div className="flex justify-between gap-4 rounded-lg bg-surface-sunk px-3 py-2">
                  <dt className="text-muted-foreground">Outing</dt>
                  <dd className="font-semibold">{title.trim() || `${kindLabel} outing`}</dd>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-surface-sunk px-3 py-2">
                  <dt className="text-muted-foreground">Type · date</dt>
                  <dd className="font-semibold">
                    {kindLabel} · {date || 'date to decide'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-surface-sunk px-3 py-2">
                  <dt className="text-muted-foreground">{t('common.destinationBudget')}</dt>
                  <dd className="font-semibold">
                    {inr(budget)} {t('common.perPerson')}
                  </dd>
                </div>
                <div className="rounded-lg bg-surface-sunk px-3 py-2">
                  <dt className="text-muted-foreground">Group</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {memberIds.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1 text-xs font-semibold"
                      >
                        <FriendAvatar member={memberById(id)} size={20} />
                        {memberById(id).name}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </fieldset>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t('common.back')}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t('common.continue')}
              <Check className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg grad-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              Create plan
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ========================================================================== */
/* 3. JOIN A PLAN PAGE                                                        */
/* ========================================================================== */

export function JoinPlanPage({
  plan,
  onJoinCode,
  onNavigate,
}: {
  plan: ActivePlanState;
  onJoinCode: (code: string) => void;
  onNavigate: (page: TravityPageId) => void;
}) {
  const { t } = useT();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!/^TRV-\d{4}$/.test(normalized)) {
      setError('Invite codes look like TRV-8492. Check the code and try again.');
      return;
    }
    onJoinCode(normalized);
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t('nav.join')}
        sub="Got a code from a friend? Drop it in and you're in the group lobby."
      />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-4">
          <TravisImg pose="wave" className="h-14 w-14 shrink-0 anim-greet" />
          <p className="text-sm text-muted-foreground">
            Friends share a <span className="font-semibold text-foreground">TRV-XXXX</span> code
            when they create a plan.
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <label htmlFor="invite-code" className="text-sm font-medium">
              Invite code
            </label>
            <div className="relative">
              <KeyRound
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="invite-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
                placeholder="TRV-8492"
                className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 font-mono text-sm uppercase tracking-widest"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Ticket className="h-4 w-4" aria-hidden />
            Join plan
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-border bg-surface-sunk p-4 text-sm">
          <p className="font-semibold">Your active plan&apos;s code</p>
          <p className="mt-1 text-muted-foreground">
            Share{' '}
            <button
              type="button"
              onClick={() => setCode(plan.inviteCode)}
              className="font-mono font-bold text-primary underline-offset-2 hover:underline"
            >
              {plan.inviteCode}
            </button>{' '}
            with friends so they can join &ldquo;{plan.title}&rdquo;.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No code yet?{' '}
          <button
            type="button"
            onClick={() => onNavigate('plan')}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Plan an outing instead
          </button>
        </p>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* 4. GROUP LOBBY PAGE                                                        */
/* ========================================================================== */

export function GroupLobbyPage({
  plan,
  activeMemberId,
  mode,
  onSetMode,
  onSetStartPoint,
  onSendChat,
  onNavigate,
  onOpenDestination,
  onOpenGeminiChat,
}: {
  plan: ActivePlanState;
  activeMemberId: MemberId;
  mode: AppMode;
  onSetMode: (m: AppMode) => void;
  onSetStartPoint: (memberId: MemberId, stationId: string) => void;
  onSendChat: (text: string) => void;
  onNavigate: (page: TravityPageId) => void;
  onOpenDestination: (slug: string) => void;
  onOpenGeminiChat: () => void;
}) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  // Live Google Search Grounding state for the active hub
  const [groundingLoading, setGroundingLoading] = useState(false);
  const [groundingSummary, setGroundingSummary] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [plan.chat.length]);

  const pending = plan.memberIds.filter((id) => !plan.startPoints[id]);
  const everyoneSet = pending.length === 0;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(plan.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSendChat(text);
    setDraft('');
  };

  const handleFetchLiveSearch = async () => {
    if (groundingLoading) return;
    setGroundingLoading(true);
    const destName =
      (plan.destinationSlug && destBySlug(plan.destinationSlug)?.name) ||
      'NSUT Dwarka Sector 3 and IGDTUW Kashmere Gate';
    try {
      const response = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Latest DMRC Delhi Metro updates, weather, and student hangout spots near ${destName}, Delhi NCR.`,
        }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        setGroundingSummary(data.text || null);
        setGroundingSources(Array.isArray(data.sources) ? data.sources : []);
      } else {
        setGroundingSummary(
          `DMRC Blue, Yellow, Pink, and Magenta lines operating on normal headways (3–5 min peak) near ${destName}. CISF & Pink Saheli booths active at main interchanges; recommended curfew departure buffer is 35 minutes before hostel check-in.`
        );
        setGroundingSources([
          { title: 'Delhi Metro Rail Corporation (DMRC)', uri: 'https://www.delhimetrorail.com' },
        ]);
      }
    } catch {
      setGroundingSummary(
        `DMRC Blue, Yellow, Pink, and Magenta lines operating on normal headways near ${destName}. Recommended curfew departure buffer is 35 minutes before hostel check-in.`
      );
      setGroundingSources([
        { title: 'Delhi Metro Rail Corporation (DMRC)', uri: 'https://www.delhimetrorail.com' },
      ]);
    } finally {
      setGroundingLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={plan.title}
        sub={`${plan.kind} · ${plan.date || 'date to decide'} · ${t('common.destinationBudget')} ${inr(plan.budget)} ${t('common.perPerson')}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => onSetMode('safe')}
                className={
                  'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ' +
                  (mode === 'safe'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground')
                }
              >
                Safe Case
              </button>
              <button
                type="button"
                onClick={() => onSetMode('fun')}
                className={
                  'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ' +
                  (mode === 'fun'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground')
                }
              >
                Best Fun
              </button>
            </div>

            <button
              type="button"
              onClick={handleFetchLiveSearch}
              disabled={groundingLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-accent"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {groundingLoading ? 'Searching Google…' : 'Live Search Info'}
            </button>

            <button
              type="button"
              onClick={onOpenGeminiChat}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Ask Travis AI
            </button>
          </div>
        }
      />

      {groundingSummary && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Google Search Grounded Delhi NCR Updates
            </span>
            <button
              type="button"
              onClick={() => setGroundingSummary(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground">
            {groundingSummary}
          </p>
          {groundingSources.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {groundingSources.map((src, idx) => (
                <a
                  key={`${src.uri}-${idx}`}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-sunk px-2 py-0.5 text-[11px] font-medium text-primary hover:underline"
                >
                  <span className="truncate max-w-[200px]">{src.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Invite code */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Users className="h-4 w-4 text-primary" aria-hidden />
              {t('lobby.invite')}
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <code className="flex-1 rounded-lg border border-border bg-surface-sunk px-4 py-2.5 font-mono text-lg font-bold tracking-widest">
                {plan.inviteCode}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-medium hover:bg-accent"
              >
                <Copy className="h-4 w-4" aria-hidden />
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Friends enter this code on the Join page to sync into your group lobby.
            </p>
          </section>

          {/* Squad Members */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-base font-bold">The group ({plan.memberIds.length})</h2>
            <ul className="space-y-2.5">
              {plan.memberIds.map((id) => {
                const m = memberById(id);
                const set = plan.startPoints[id];
                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <FriendAvatar member={m} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {m.name}
                          {id === activeMemberId ? ' (you)' : ''}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                          <span className="truncate">
                            {set ? stationName(set) : m.homeLabel} · Curfew {m.curfew}
                          </span>
                        </p>
                      </div>
                    </div>
                    {set ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        {t('lobby.joined')}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {t('lobby.pending')}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSetStartPoint(id, m.stationId)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-accent"
                        >
                          Confirm station
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Starting point selector */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-base font-bold">
              {t('lobby.startPoint')} ({memberById(activeMemberId).name})
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="start-station" className="text-xs font-medium text-muted-foreground">
                  {t('lobby.useMetro')}
                </label>
                <select
                  id="start-station"
                  value={plan.startPoints[activeMemberId] ?? ''}
                  onChange={(e) => onSetStartPoint(activeMemberId, e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="" disabled>
                    Choose a station…
                  </option>
                  {STATIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => onSetStartPoint(activeMemberId, 'rajiv-chowk')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                <MapPin className="h-4 w-4" aria-hidden />
                {t('lobby.useLocation')}
              </button>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Group Notes Chat */}
          <section className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
              {t('lobby.groupChat')}
            </h2>
            <div ref={chatRef} className="h-72 space-y-3 overflow-y-auto pr-1">
              {plan.chat.map((msg) => {
                const m = memberById(msg.memberId);
                const mine = msg.memberId === activeMemberId;
                return (
                  <div
                    key={msg.id}
                    className={'flex items-end gap-2 ' + (mine ? 'flex-row-reverse' : '')}
                  >
                    <FriendAvatar member={m} size={26} />
                    <div
                      className={
                        'max-w-[75%] rounded-2xl px-3 py-2 text-sm ' +
                        (mine
                          ? 'rounded-br-sm bg-primary text-primary-foreground'
                          : 'rounded-bl-sm bg-surface-sunk')
                      }
                    >
                      {!mine && (
                        <p className="mb-0.5 text-[11px] font-bold" style={{ color: m.color }}>
                          {m.name}
                        </p>
                      )}
                      <p>{msg.text}</p>
                      <p
                        className={
                          'mt-0.5 text-[10px] ' +
                          (mine ? 'text-primary-foreground/70' : 'text-muted-foreground')
                        }
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form className="mt-3 flex gap-2" onSubmit={send}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Type a note as ${memberById(activeMemberId).name}…`}
                aria-label="Message"
                className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={!draft.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </section>

          {/* Next step */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">Next step</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {everyoneSet
                ? "Everyone's start points are in. Travis can now compare destinations for the whole group."
                : `Waiting on ${pending.length} starting point${pending.length === 1 ? '' : 's'} before recommendations unlock.`}
            </p>
            <button
              type="button"
              disabled={!everyoneSet}
              onClick={() => onNavigate('recommendations')}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl grad-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
            >
              {t('recommendations.title')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            {plan.destinationSlug && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDestination(plan.destinationSlug!)}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
                >
                  View chosen destination
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('map')}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
                >
                  Open route map
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* 5. RECOMMENDATIONS PAGE                                                    */
/* ========================================================================== */

interface Scored {
  dest: Destination;
  score: number;
  minMin: number;
  maxMin: number;
  avgFare: number;
}

function scoreDestinations(
  memberIds: MemberId[],
  startPoints: Partial<Record<MemberId, string>>,
  budget: number | null
): Scored[] {
  return DESTINATIONS.map((dest) => {
    const commutes = groupCommutes(dest, memberIds, startPoints);
    const minutes = commutes.map((c) => c.minutes);
    const minMin = Math.min(...minutes);
    const maxMin = Math.max(...minutes);
    const avgFare = Math.round(
      commutes.reduce((s, c) => s + c.fare, 0) / Math.max(1, commutes.length)
    );
    const balance = Math.max(0, 100 - (maxMin - minMin) * 1.8);
    const budgetScore =
      budget == null
        ? dest.budgetFit
        : dest.cost[1] <= budget
          ? 92
          : Math.max(0, 92 - (dest.cost[1] - budget) / 12);
    const score =
      0.3 * dest.fairness +
      0.18 * dest.excitement +
      0.16 * dest.accessibility +
      0.14 * dest.returnFit +
      0.22 * budgetScore +
      0.2 * balance -
      (0.05 * avgFare) / 5;
    return { dest, score: Math.round(score), minMin, maxMin, avgFare };
  }).sort((a, b) => b.score - a.score);
}

export function RecommendationsPage({
  plan,
  onChooseDestination,
  onOpenDestination,
}: {
  plan: ActivePlanState;
  onChooseDestination: (slug: string) => void;
  onOpenDestination: (slug: string) => void;
}) {
  const { t } = useT();
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [chosen, setChosen] = useState<string | null>(null);

  const scored = scoreDestinations(plan.memberIds, plan.startPoints, plan.budget);

  const pick = (slug: string) => {
    setChosen(slug);
    onChooseDestination(slug);
    setTimeout(() => {
      onOpenDestination(slug);
    }, 800);
  };

  return (
    <div>
      <PageHeader
        title={t('recommendations.title')}
        sub={`Scored for your group of ${plan.memberIds.length} against a ${inr(plan.budget)} destination budget.`}
        actions={
          <div className="flex rounded-lg border border-border bg-card p-1" role="tablist">
            {(['cards', 'table'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ' +
                  (view === v
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground')
                }
              >
                {v === 'cards' ? (
                  <Scale className="h-4 w-4" aria-hidden />
                ) : (
                  <Table2 className="h-4 w-4" aria-hidden />
                )}
                {v === 'cards' ? 'Trade-offs' : 'Compare'}
              </button>
            ))}
          </div>
        }
      />

      {view === 'cards' ? (
        <div className="space-y-4">
          {scored.map((s, i) => (
            <article
              key={s.dest.slug}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
            >
              <div className="grid gap-4 p-5 sm:grid-cols-[200px_1fr]">
                <DestinationArt dest={s.dest} className="aspect-[16/10]" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{s.dest.name}</h2>
                    {i === 0 && (
                      <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                        Best group fit
                      </span>
                    )}
                    <span className="rounded-full bg-surface-sunk px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      Fit score {s.score}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.dest.short}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {groupCommutes(s.dest, plan.memberIds, plan.startPoints).map((c) => {
                      const m = memberById(c.memberId);
                      return (
                        <span
                          key={c.memberId}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs"
                        >
                          <FriendAvatar member={m} size={18} />
                          <span className="font-semibold">{m.name}</span>
                          <span className="text-muted-foreground">
                            {c.minutes} min · {inr(c.fare)} · leave {c.returnTime}
                          </span>
                        </span>
                      );
                    })}
                  </div>

                  <ul className="mt-3 space-y-1">
                    {s.dest.reasons.slice(0, 2).map((r) => (
                      <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan"
                          aria-hidden
                        />
                        {r}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => pick(s.dest.slug)}
                      disabled={chosen !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg grad-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
                    >
                      {t('common.selectDestination')}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDestination(s.dest.slug)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                    >
                      {t('common.viewDetails')}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {s.minMin}–{s.maxMin} min spread · avg fare {inr(s.avgFare)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Commute spread</th>
                <th className="px-4 py-3 font-medium">Avg fare</th>
                <th className="px-4 py-3 font-medium">{t('common.destinationBudget')}</th>
                <th className="px-4 py-3 font-medium">Fit score</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {scored.map((s) => (
                <tr key={s.dest.slug} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => onOpenDestination(s.dest.slug)}
                      className="text-left text-primary underline-offset-2 hover:underline"
                    >
                      {s.dest.name}
                    </button>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {s.dest.area}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.minMin}–{s.maxMin} min
                  </td>
                  <td className="px-4 py-3">{inr(s.avgFare)}</td>
                  <td className="px-4 py-3">
                    {inr(s.dest.cost[0])}–{inr(s.dest.cost[1])}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary">{s.score}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => pick(s.dest.slug)}
                      disabled={chosen !== null}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                    >
                      {t('common.selectDestination')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chosen && (
        <div
          className="fixed inset-x-0 bottom-24 z-30 mx-auto flex w-fit items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-lift lg:bottom-10"
          role="status"
        >
          <TravisImg pose="celebrate" className="h-10 w-10 anim-bounce-soft" />
          <span className="text-sm font-semibold">
            {destBySlug(chosen)?.name} locked in — opening details…
          </span>
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/* 6. EXPLORE PLACES & SAVED PLACES & DESTINATION DETAIL                      */
/* ========================================================================== */

export function ExplorePage({
  savedIds,
  onToggleSaved,
  onOpenDestination,
}: {
  savedIds: string[];
  onToggleSaved: (slug: string) => void;
  onOpenDestination: (slug: string) => void;
}) {
  const { t } = useT();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(DESTINATIONS.map((d) => d.category)))],
    []
  );

  const results = DESTINATIONS.filter((d) => {
    const matchesQuery =
      query.trim() === '' ||
      `${d.name} ${d.area} ${d.category} ${d.short}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    const matchesCategory = category === 'All' || d.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div>
      <PageHeader title={t('explore.title')} sub={t('explore.sub')} />

      <div className="mb-6 space-y-3">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search') + ' places, areas, vibes…'}
            className="flex h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm"
            aria-label={t('common.search')}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Category filters">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ' +
                (category === c
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground')
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <TravisImg pose="think" className="mx-auto h-20 w-20 anim-float" />
          <p className="mt-4 font-semibold">No places match that search</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a broader term — covering {DESTINATIONS.length} Delhi NCR destinations.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((d) => {
            const saved = savedIds.includes(d.slug);
            return (
              <article
                key={d.slug}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
              >
                <div className="relative">
                  <DestinationArt dest={d} compact />
                  <button
                    type="button"
                    onClick={() => onToggleSaved(d.slug)}
                    aria-pressed={saved}
                    aria-label={saved ? `Remove ${d.name} from saved` : `Save ${d.name}`}
                    className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-soft transition-colors hover:bg-background"
                  >
                    <Heart
                      className={'h-4 w-4 ' + (saved ? 'fill-current text-brand-pink' : '')}
                      aria-hidden
                    />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-base font-bold">{d.name}</h2>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {d.area}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.short}</p>
                  <p className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{d.duration}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {inr(d.cost[0])}–{inr(d.cost[1])} {t('common.perPerson')}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenDestination(d.slug)}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
                  >
                    {t('common.viewDetails')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SavedPage({
  savedIds,
  onToggleSaved,
  onOpenDestination,
  onNavigate,
}: {
  savedIds: string[];
  onToggleSaved: (slug: string) => void;
  onOpenDestination: (slug: string) => void;
  onNavigate: (page: TravityPageId) => void;
}) {
  const { t } = useT();
  const saved = savedIds
    .map((slug) => destBySlug(slug))
    .filter((d): d is Destination => d !== undefined);

  return (
    <div>
      <PageHeader title={t('saved.title')} sub={t('saved.sub')} />

      {saved.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <TravisImg pose="think" className="mx-auto h-20 w-20 anim-float" />
          <p className="mt-4 font-semibold">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the heart on any place to shortlist it for a future outing.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="mt-6 inline-flex items-center rounded-lg grad-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {t('nav.explore')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((d) => (
            <article
              key={d.slug}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
            >
              <div className="relative">
                <DestinationArt dest={d} compact />
                <button
                  type="button"
                  onClick={() => onToggleSaved(d.slug)}
                  aria-label={`Remove ${d.name} from saved`}
                  className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/85 shadow-soft transition-colors hover:bg-background"
                >
                  <HeartOff className="h-4 w-4 text-muted-foreground" aria-hidden />
                </button>
              </div>
              <div className="p-4">
                <h2 className="font-display text-base font-bold">{d.name}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {d.area} · {d.duration} · {inr(d.cost[0])}–{inr(d.cost[1])}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.short}</p>
                <button
                  type="button"
                  onClick={() => onOpenDestination(d.slug)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-2 hover:underline"
                >
                  <Heart className="h-3.5 w-3.5" aria-hidden />
                  {t('common.viewDetails')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const NEARBY_CATEGORY_LABEL: Record<NearbyPlace['category'], string> = {
  'Cafes & Restaurants': 'Cafes & Restaurants',
  'Shops & Markets': 'Shops & Markets',
  Activities: 'Activities',
  'Events & Experiences': 'Events & Experiences',
};

export function DestinationDetailPage({
  slug,
  plan,
  savedIds,
  onToggleSaved,
  onChooseDestination,
  onNavigate,
}: {
  slug: string;
  plan: ActivePlanState;
  savedIds: string[];
  onToggleSaved: (slug: string) => void;
  onChooseDestination: (slug: string) => void;
  onNavigate: (page: TravityPageId) => void;
}) {
  const { t } = useT();
  const [openCat, setOpenCat] = useState<string | null>('Cafes & Restaurants');
  const dest = destBySlug(slug) ?? DESTINATIONS[0];

  const saved = savedIds.includes(dest.slug);
  const commutes = groupCommutes(dest, plan.memberIds, plan.startPoints);
  const nearby = NEARBY.filter((n) => n.dest === dest.slug);
  const categories = Array.from(new Set(nearby.map((n) => n.category)));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('explore')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to explore
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleSaved(dest.slug)}
            aria-pressed={saved}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-accent"
          >
            <Heart
              className={'h-4 w-4 ' + (saved ? 'fill-current text-brand-pink' : '')}
              aria-hidden
            />
            {saved ? t('common.saved') : t('common.save')}
          </button>
          <button
            type="button"
            onClick={() => {
              onChooseDestination(dest.slug);
              onNavigate('map');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg grad-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Lock for squad &amp; view map
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <DestinationArt dest={dest} className="aspect-[16/8]" />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{dest.name}</h1>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {dest.category}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              {dest.area} · near {stationName(dest.stationId)}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed">{dest.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {t('common.duration')}
              </p>
              <p className="mt-1 font-semibold">{dest.duration}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <IndianRupee className="h-3.5 w-3.5" aria-hidden />
                {t('common.budget')}
              </p>
              <p className="mt-1 font-semibold">
                {inr(dest.cost[0])}–{inr(dest.cost[1])}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Last mile
              </p>
              <p className="mt-1 text-sm font-semibold">{dest.walkMin} min walk</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Metro lines
              </p>
              <p className="mt-1 font-semibold">{dest.lines.join(' · ')}</p>
            </div>
          </div>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">Things to do here</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {dest.activities.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  {a}
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold">Hours:</dt>
                <dd className="text-muted-foreground">{dest.hours}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold">Getting there:</dt>
                <dd className="text-muted-foreground">{dest.lastMile}</dd>
              </div>
            </dl>
          </section>

          {categories.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-base font-bold">Nearby discovery</h2>
              <div className="mt-3 divide-y divide-border">
                {categories.map((cat) => {
                  const isOpen = openCat === cat;
                  const items = nearby.filter((n) => n.category === cat);
                  return (
                    <div key={cat} className="py-2">
                      <button
                        type="button"
                        onClick={() => setOpenCat(isOpen ? null : cat)}
                        className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold"
                      >
                        <span>
                          {NEARBY_CATEGORY_LABEL[cat]} ({items.length})
                        </span>
                        <ChevronDown
                          className={
                            'h-4 w-4 transition-transform ' + (isOpen ? 'rotate-180' : '')
                          }
                        />
                      </button>
                      {isOpen && (
                        <ul className="space-y-2 pb-2 pt-1">
                          {items.map((n) => (
                            <li
                              key={n.id}
                              className="flex items-start justify-between gap-3 rounded-lg bg-surface-sunk p-3"
                            >
                              <div>
                                <p className="text-sm font-semibold">{n.name}</p>
                                <p className="text-xs text-muted-foreground">{n.note}</p>
                              </div>
                              <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {n.budget}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">Getting there — who from where</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('common.illustrative')} · {t('common.commuteFareNote')}
            </p>
            <ul className="mt-3 space-y-2.5">
              {commutes.map((c) => {
                const m = memberById(c.memberId);
                return (
                  <li
                    key={c.memberId}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <FriendAvatar member={m} size={30} />
                      <p className="text-sm font-semibold">{m.name}</p>
                      <span className="ml-auto text-sm font-semibold text-primary">
                        {c.minutes} min
                      </span>
                    </div>
                    <p className="mt-1 pl-10 text-xs text-muted-foreground">
                      from {stationName(plan.startPoints[c.memberId] ?? m.stationId)} ·{' '}
                      {inr(c.fare)} ·{' '}
                      {c.transfers === 0
                        ? 'no transfers'
                        : `${c.transfers} transfer${c.transfers > 1 ? 's' : ''}`}{' '}
                      · leave by ~{c.returnTime} (Curfew {m.curfew})
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              {t('common.safety')} awareness
            </h2>
            <div className="mt-3 rounded-xl border-l-4 border-warning bg-surface-sunk p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-warning">
                {dest.safetyLevel === 'good'
                  ? t('safety.status.official')
                  : t('safety.status.community')}{' '}
                · {t('safety.limited')}
              </p>
              <p className="mt-1.5 text-sm">{dest.safetyNote}</p>
              <p className="mt-2 text-xs text-muted-foreground">{t('safety.incomplete')}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('safety')}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              {t('safety.title')}
            </button>
          </section>

          <DemoBadge className="mx-auto" />
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* 7. ROUTE MAP PAGE (Stylised MetroMap + DMRC Topology + Live Google Maps)   */
/* ========================================================================== */

export function RouteMapPage({
  plan,
  mode,
  userName,
  location,
  squadMembers,
}: {
  plan: ActivePlanState;
  mode: AppMode;
  userName: string;
  location: string;
  squadMembers: SquadMember[];
}) {
  const { t } = useT();
  const [intro, setIntro] = useState(false);
  const [focus, setFocus] = useState<MemberId | null>(null);
  const [mapTab, setMapTab] = useState<'stylised' | 'dmrc' | 'google'>('stylised');

  const chosenDest =
    (plan.destinationSlug && destBySlug(plan.destinationSlug)) || DESTINATIONS[0];

  const routes: MapRoute[] = groupCommutes(chosenDest, plan.memberIds, plan.startPoints).map(
    (c) => ({
      member: memberById(c.memberId),
      dest: chosenDest,
      stationId: plan.startPoints[c.memberId] ?? memberById(c.memberId).stationId,
      emphasized: focus === null || focus === c.memberId,
    })
  );

  const [selectedHubId, setSelectedHubId] = useState<string>(
    chosenDest.slug === 'igdtuw-kashmere-gate'
      ? 'igdtuw-kashmere'
      : chosenDest.slug === 'nsut-dwarka-hub'
        ? 'nsut-dwarka'
        : chosenDest.slug
  );

  const rankedHubs = useMemo<
    (HubRecommendation & { matchScore: number; modeReason: string })[]
  >(
    () => [
      ...NCR_HUB_RECOMMENDATIONS.map((h) => ({
        ...h,
        matchScore: h.id === 'nsut-dwarka' ? 96 : 94,
        modeReason:
          mode === 'safe'
            ? 'Verified DMRC security & Pink Saheli corridor'
            : 'Student hub with cafes & direct metro interchange',
      })),
      {
        id: 'connaught-place',
        name: 'Connaught Place (Rajiv Chowk Interchange)',
        shortName: 'Connaught Place (CP)',
        area: 'Central Delhi · Blue & Yellow Line',
        metroLine: 'Blue & Yellow Line Interchange',
        avgCost: 350,
        centralDistanceKm: 0.5,
        pinkSaheliBooths: 4,
        lightingIndex: 98,
        crimeSafetyScore: 97,
        funVibeScore: 96,
        highlights: ['Direct 0-transfer midpoint', 'Inner Circle cafes'],
        mapCoords: { x: 525, y: 395 },
        lat: 28.6315,
        lng: 77.2167,
        matchScore: 98,
        modeReason: 'Exact Blue + Yellow Line midpoint for NSUT & IGDTUW',
      },
      {
        id: 'dilli-haat-ina',
        name: 'Dilli Haat INA (Yellow & Pink Line)',
        shortName: 'Dilli Haat INA',
        area: 'INA Market · Yellow & Pink Line',
        metroLine: 'Yellow & Pink Line Interchange',
        avgCost: 320,
        centralDistanceKm: 6.2,
        pinkSaheliBooths: 3,
        lightingIndex: 95,
        crimeSafetyScore: 95,
        funVibeScore: 94,
        highlights: ['State food stalls', 'Gate 5 direct entry'],
        mapCoords: { x: 520, y: 555 },
        lat: 28.5733,
        lng: 77.2075,
        matchScore: 91,
        modeReason: 'Direct Yellow & Pink Line interchange plaza',
      },
    ],
    [mode]
  );

  const activeHub = useMemo(
    () => rankedHubs.find((h) => h.id === selectedHubId) || rankedHubs[0],
    [rankedHubs, selectedHubId]
  );

  return (
    <div>
      <PageHeader
        title={t('map.title')}
        sub="Compare every friend's metro path across the complete Delhi NCR network — switch between the Stylised Squad Map, Full 8-Line DMRC Network, and Live Google Maps."
        actions={
          <div className="grid w-full grid-cols-3 rounded-xl border border-border bg-card p-1 sm:inline-flex sm:w-auto">
            <button
              type="button"
              onClick={() => setMapTab('stylised')}
              className={
                'rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ' +
                (mapTab === 'stylised'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground')
              }
            >
              Squad Map
            </button>
            <button
              type="button"
              onClick={() => setMapTab('dmrc')}
              className={
                'rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ' +
                (mapTab === 'dmrc'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground')
              }
            >
              Full DMRC Map
            </button>
            <button
              type="button"
              onClick={() => setMapTab('google')}
              className={
                'rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ' +
                (mapTab === 'google'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground')
              }
            >
              Live Google Maps
            </button>
          </div>
        }
      />

      {mapTab === 'stylised' && (
        <>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
            <MetroMap
              className="p-2 sm:p-4"
              destinations={DESTINATIONS}
              selectedDest={chosenDest.slug}
              routes={routes}
              highlightStationId={
                focus ? (plan.startPoints[focus] ?? memberById(focus).stationId) : null
              }
            />

            {intro && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-background/90 backdrop-blur-sm">
                <div
                  className="anim-spin-slow h-40 w-40 rounded-full grad-sky shadow-lift sm:h-52 sm:w-52"
                  role="img"
                  aria-label="Stylised globe zooming toward Delhi NCR"
                >
                  <div
                    className="mt-16 ml-16 h-10 w-16 rounded-full bg-background/20 sm:mt-20 sm:ml-20"
                    aria-hidden
                  />
                  <div
                    className="mt-3 ml-24 h-6 w-10 rounded-full bg-background/15 sm:ml-28"
                    aria-hidden
                  />
                </div>
                <div className="flex items-center gap-4">
                  <TravisImg pose="wave" className="h-14 w-14 anim-greet" />
                  <p className="max-w-xs text-center text-sm font-medium">
                    Zooming in on Delhi NCR…
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIntro(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium"
                >
                  <Orbit className="h-4 w-4" aria-hidden />
                  {t('map.skipIntro')}
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold">{t('map.legend')} (All 8 NCR Lines)</h2>
                <button
                  type="button"
                  onClick={() => setIntro(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Replay Globe Intro
                </button>
              </div>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Object.entries(LINE_COLORS).map(([line, color]) => (
                  <li key={line} className="flex items-center gap-2 text-xs sm:text-sm">
                    <span
                      className="h-2.5 w-5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    <span className="truncate">{line} line</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="mb-3 text-base font-bold">{t('map.selectFriend')}</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFocus(null)}
                  aria-pressed={focus === null}
                  className={
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ' +
                    (focus === null
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:bg-accent')
                  }
                >
                  Everyone
                </button>
                {plan.memberIds.map((id) => {
                  const m = memberById(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFocus(id)}
                      aria-pressed={focus === id}
                      className={
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ' +
                        (focus === id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:bg-accent')
                      }
                    >
                      <FriendAvatar member={m} size={18} />
                      {m.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Showing routes into <strong>{chosenDest.name}</strong> for &ldquo;{plan.title}
                &rdquo;.
              </p>
            </section>
          </div>
        </>
      )}

      {mapTab === 'dmrc' && (
        <div className="space-y-4">
          {/* Central Hub Quick Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
            <span className="text-xs font-semibold text-muted-foreground">
              Select Outing Central Hub:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {rankedHubs.map((hub) => {
                const isSelected = selectedHubId === hub.id || activeHub.id === hub.id;
                return (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => setSelectedHubId(hub.id)}
                    className={
                      'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ' +
                      (isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                        : 'border-border bg-background text-foreground hover:bg-accent')
                    }
                  >
                    {hub.shortName} · ₹{hub.avgCost}
                  </button>
                );
              })}
            </div>
          </div>

          <DmrcMetroMap
            mode={mode}
            activeHub={activeHub}
            onSelectHub={setSelectedHubId}
            userName={userName}
            userLocation={location}
            userCurfew="21:30"
            members={squadMembers}
          />
        </div>
      )}

      {mapTab === 'google' && (
        <LobbyMapWidget
          mode={mode}
          activeHub={activeHub}
          rankedHubs={rankedHubs}
          selectedHubId={selectedHubId}
          onSelectHub={setSelectedHubId}
          userName={userName}
          userLocation={location}
          userCurfew="21:30"
          members={squadMembers}
          defaultVisualMode="google"
          hideModeSwitcher={true}
        />
      )}
    </div>
  );
}

/* ========================================================================== */
/* 8. SAFETY AWARENESS PAGE                                                   */
/* ========================================================================== */

export function SafetyPage() {
  const { t } = useT();
  const [active, setActive] = useState<Set<string>>(
    new Set(SAFETY_LAYER_META.map((l) => l.key))
  );
  const [selected, setSelected] = useState<SafetyMarker | null>(SAFETY_MARKERS[0]);

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
        title={t('safety.title')}
        sub="Every marker carries its source, coverage and limitations. Safety information supports decisions — it never replaces your judgement."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
            <MetroMap className="p-2 sm:p-4" destinations={DESTINATIONS} markers={visible} />
          </div>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-base font-bold">{t('safety.layers')}</h2>
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
                      className={
                        'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ' +
                        (on
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:bg-accent')
                      }
                    >
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full"
                        style={{ backgroundColor: layer.color, opacity: on ? 1 : 0.35 }}
                        aria-hidden
                      />
                      <span
                        className={
                          'flex-1 font-medium ' +
                          (on ? '' : 'text-muted-foreground line-through decoration-1')
                        }
                      >
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

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-base font-bold">{t('safety.detail')}</h2>
            {selected ? (
              <div className="space-y-3 text-sm">
                <h3 className="font-display text-lg font-bold">{selected.name}</h3>
                <p className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {t(`safety.status.${selected.status}`)}
                </p>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Source
                    </dt>
                    <dd>{selected.sourceType}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Last updated
                    </dt>
                    <dd>{selected.lastUpdated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Coverage
                    </dt>
                    <dd>{selected.coverage}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Confidence
                    </dt>
                    <dd>{selected.confidence}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Limitations
                    </dt>
                    <dd className="text-muted-foreground">{selected.limitations}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a marker card below to see its source, coverage, confidence and limitations.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              What this data can and can&apos;t tell you
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5 rounded-xl bg-surface-sunk p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden />
                <span>
                  Markers are <strong>locations, not guarantees</strong>. Always verify Pink Saheli
                  booth staffing on the ground.
                </span>
              </li>
              <li className="flex gap-2.5 rounded-xl bg-surface-sunk p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                <span>
                  <strong>No reports ≠ proof of safety.</strong> Absence of community reports is
                  not evidence of safety.
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">All markers ({visible.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => {
            const layerColor =
              SAFETY_LAYER_META.find((l) => l.key === m.category)?.color ??
              'var(--color-primary)';
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m)}
                aria-expanded={selected?.id === m.id}
                className={
                  'rounded-xl border p-4 text-left transition-colors ' +
                  (selected?.id === m.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent')
                }
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: layerColor }}
                    aria-hidden
                  />
                  <span className="font-semibold">{m.name}</span>
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {t(`safety.status.${m.status}`)} · {m.confidence} confidence
                </span>
                <span className="mt-1.5 block line-clamp-2 text-xs text-muted-foreground">
                  {m.limitations}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

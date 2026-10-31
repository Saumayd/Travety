import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageSquareHeart,
  Moon,
  MoreVertical,
  Navigation,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  UserPlus,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  DEMO_OUTINGS,
  destBySlug,
  fmtDate,
  memberById,
  MEMBERS,
  RECEIVED_INVITES,
  SENT_INVITES,
  type ExpenseItem,
  type MemberId,
  type NotificationItem,
  type NotificationKind,
  type OutingStatus,
  type SentStatus,
} from '../../data/travityData';
import type { AreaReviewItem, PastOuting } from '../../data/ncrMetroData';
import { LanguageSelect, useT, useTheme, type Lang } from '../../lib/ui-prefs';
import { DestinationArt, FriendAvatar, PageHeader, TravisImg } from './TravityBits';
import type { ActivePlanState, TravityPageId } from './TravityPages';

const inr = (n: number) => `₹${Math.round(n)}`;

const iconBtn =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent active:scale-95';

const KIND_META: Record<NotificationKind, { icon: LucideIcon; cls: string }> = {
  invite: { icon: UserPlus, cls: 'bg-primary/10 text-primary' },
  join: { icon: UserPlus, cls: 'bg-brand-cyan/10 text-brand-cyan' },
  update: { icon: CalendarCheck, cls: 'bg-success/10 text-success' },
  safety: { icon: ShieldCheck, cls: 'bg-brand-pink/10 text-brand-pink' },
};

/* ========================================================================== */
/* APP HEADER (from AppHeader_acb6e2df.tsx)                                   */
/* ========================================================================== */

export function TravityHeader({
  canGoBack,
  onBack,
  onNavigate,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onOpenGeminiChat,
  onOpenSos,
  onOpenMobileMenu,
}: {
  canGoBack: boolean;
  onBack: () => void;
  onNavigate: (page: TravityPageId) => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenGeminiChat: () => void;
  onOpenSos: () => void;
  onOpenMobileMenu?: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, dt } = useT();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-border bg-background/95 px-2.5 py-2 backdrop-blur sm:gap-2 sm:px-5">
      {(settingsOpen || notifsOpen) && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden
          onClick={() => {
            setSettingsOpen(false);
            setNotifsOpen(false);
          }}
        />
      )}

      {onOpenMobileMenu && (
        <button
          type="button"
          aria-label="Open navigation menu"
          className={iconBtn + ' lg:hidden'}
          onClick={onOpenMobileMenu}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      )}

      {canGoBack && (
        <button
          type="button"
          aria-label={dt('back')}
          className={iconBtn}
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
      )}

      <button
        type="button"
        onClick={() => onNavigate('dashboard')}
        className="flex min-w-0 items-center gap-2 text-left lg:hidden"
      >
        <TravisImg pose="wave" className="h-8 w-8 shrink-0 anim-float sm:h-9 sm:w-9" />
        <span className="truncate font-display text-lg font-bold tracking-tight sm:text-xl">
          Travety
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        {/* Gemini Assistant Button */}
        <button
          type="button"
          onClick={onOpenGeminiChat}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 sm:px-3"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Ask Travis AI</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Emergency SOS Button */}
        <button
          type="button"
          onClick={onOpenSos}
          className="inline-flex h-9 items-center gap-1 rounded-xl bg-destructive px-2.5 text-xs font-bold text-destructive-foreground transition-opacity hover:opacity-90 sm:px-3"
        >
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>SOS</span>
        </button>

        {/* Settings Menu Dropdown */}
        <div className="relative z-50">
          <button
            type="button"
            aria-label={dt('menu')}
            className={iconBtn}
            onClick={() => {
              setSettingsOpen((o) => !o);
              setNotifsOpen(false);
            }}
          >
            <MoreVertical className="h-5 w-5" aria-hidden />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lift">
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                {dt('appearance')}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                  setSettingsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-accent"
              >
                <span className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  {dt('light')}
                </span>
                {theme === 'light' && <Check className="h-4 w-4 text-primary" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                  setSettingsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-accent"
              >
                <span className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  {dt('dark')}
                </span>
                {theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
              </button>

              <div className="my-1.5 h-px bg-border" />

              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                {dt('language')}
              </p>
              {(['en', 'hi'] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLang(l);
                    setSettingsOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-accent"
                >
                  <span>{l === 'en' ? 'English' : 'हिंदी'}</span>
                  {lang === l && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell Popover */}
        <div className="relative z-50">
          <button
            type="button"
            aria-label={`${dt('notifs')}${unread ? ` (${unread})` : ''}`}
            className={iconBtn + ' relative'}
            onClick={() => {
              setNotifsOpen((o) => !o);
              setSettingsOpen(false);
            }}
          >
            <Bell className="h-5 w-5" aria-hidden />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-pink px-1 text-[10px] font-bold text-primary-foreground">
                {unread}
              </span>
            )}
          </button>

          {notifsOpen && (
            <div className="fixed inset-x-3 top-14 z-50 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lift sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-88">
              <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                <p className="font-semibold">{dt('notifs')}</p>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {dt('markAll')}
                  </button>
                )}
              </div>

              {unread === 0 ? (
                <div className="px-4 py-7 text-center">
                  <TravisImg pose="think" className="mx-auto h-14 w-14" />
                  <p className="mt-2 text-sm font-semibold">{dt('noNotifs')}</p>
                  <p className="text-xs text-muted-foreground">{dt('noNotifsSub')}</p>
                </div>
              ) : (
                <ul className="max-h-[55vh] overflow-y-auto">
                  {notifications.map((n) => {
                    const meta = KIND_META[n.kind];
                    const Icon = meta.icon;
                    return (
                      <li
                        key={n.id}
                        className={
                          'flex gap-3 border-b border-border px-4 py-3 last:border-0 ' +
                          (!n.unread ? 'opacity-70' : 'bg-primary/5')
                        }
                      >
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 gap-3 text-left"
                          onClick={() => {
                            onMarkRead(n.id);
                            setNotifsOpen(false);
                            if (n.targetTab) onNavigate(n.targetTab as TravityPageId);
                          }}
                        >
                          <span
                            className={
                              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ' +
                              meta.cls
                            }
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-xs font-semibold">
                              {n.unread && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                              )}
                              {n.title}
                            </span>
                            <span className="block text-xs text-muted-foreground">{n.body}</span>
                            <span className="block text-[11px] text-muted-foreground">
                              {n.time}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="border-t border-border px-4 py-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setNotifsOpen(false);
                    onNavigate('notifications');
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ========================================================================== */
/* CALENDAR PAGE                                                              */
/* ========================================================================== */

const STATUS_STYLE: Record<
  OutingStatus,
  { cls: string; dot: string; icon: LucideIcon }
> = {
  past: {
    cls: 'bg-muted text-muted-foreground border-muted-foreground/40',
    dot: 'bg-muted-foreground',
    icon: CheckCircle2,
  },
  active: {
    cls: 'bg-success/15 text-success border-success',
    dot: 'bg-success',
    icon: Navigation,
  },
  upcoming: {
    cls: 'bg-primary/15 text-primary border-primary',
    dot: 'bg-primary',
    icon: Clock,
  },
};

const pad = (n: number) => String(n).padStart(2, '0');

export function CalendarPage({
  onNavigate,
}: {
  onNavigate: (page: TravityPageId) => void;
}) {
  const { dt, lang } = useT();
  const [month, setMonth] = useState({ y: 2026, m: 9 }); // Oct 2026
  const [selected, setSelected] = useState<string>('2026-10-28');

  const first = new Date(month.y, month.m, 1);
  const days = new Date(month.y, month.m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2026, 9, 26 + i).toLocaleDateString(locale, { weekday: 'narrow' })
  );
  const shift = (d: number) =>
    setMonth(({ y, m }) => {
      const n = new Date(y, m + d, 1);
      return { y: n.getFullYear(), m: n.getMonth() };
    });
  const dayOutings = DEMO_OUTINGS.filter((o) => o.date === selected);

  return (
    <div>
      <PageHeader title={dt('calTitle')} sub={dt('calSub')} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shift(-1)}
              className="h-9 w-9 rounded-lg hover:bg-accent"
            >
              <ChevronLeft className="mx-auto h-5 w-5" />
            </button>
            <p className="font-semibold">
              {first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shift(1)}
              className="h-9 w-9 rounded-lg hover:bg-accent"
            >
              <ChevronRight className="mx-auto h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {weekdays.map((w, i) => (
              <span key={i} className="py-1">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const iso = `${month.y}-${pad(month.m + 1)}-${pad(d)}`;
              const o = DEMO_OUTINGS.find((x) => x.date === iso);
              const sel = iso === selected;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(iso)}
                  aria-pressed={sel}
                  className={
                    'relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-colors ' +
                    (o
                      ? STATUS_STYLE[o.status].cls + ' font-semibold '
                      : 'border-transparent hover:bg-accent ') +
                    (sel ? 'ring-2 ring-foreground ring-offset-1 ring-offset-card' : '')
                  }
                >
                  {d}
                  {o && (
                    <span
                      className={'absolute bottom-1 h-1 w-1 rounded-full ' + STATUS_STYLE[o.status].dot}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{dt('legend')}</p>
            <ul className="flex flex-wrap gap-3 text-xs">
              {(['past', 'active', 'upcoming'] as OutingStatus[]).map((s) => {
                const Icon = STATUS_STYLE[s].icon;
                return (
                  <li
                    key={s}
                    className={
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ' +
                      STATUS_STYLE[s].cls
                    }
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {dt(`status.${s}`)}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section aria-live="polite">
          <h2 className="mb-3 text-lg font-bold">{fmtDate(selected, lang)}</h2>
          {dayOutings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
              {dt('noOutingDay')} {dt('selectDay')}
            </p>
          ) : (
            <div className="space-y-3">
              {dayOutings.map((o) => {
                const S = STATUS_STYLE[o.status];
                const Icon = S.icon;
                return (
                  <article
                    key={o.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                  >
                    <span
                      className={
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ' +
                        S.cls
                      }
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {dt(`status.${o.status}`)}
                    </span>
                    <h3 className="mt-2 text-lg font-bold">{o.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {destBySlug(o.dest)?.name} · {o.time}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {o.memberIds.map((id) => (
                          <FriendAvatar key={id} member={memberById(id)} size={30} />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('lobby')}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Open lobby →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* INVITATIONS PAGE                                                           */
/* ========================================================================== */

const SENT_CLS: Record<SentStatus, string> = {
  pending: 'bg-warning/15 text-warning',
  accepted: 'bg-success/15 text-success',
  declined: 'bg-muted text-muted-foreground',
};

export function InvitationsPage({
  onAcceptInvite,
}: {
  onAcceptInvite: (title: string, destSlug: string) => void;
}) {
  const { dt, lang } = useT();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [responses, setResponses] = useState<Record<string, 'accepted' | 'declined'>>({});

  return (
    <div>
      <PageHeader title={dt('invTitle')} sub={dt('invSub')} />
      <div className="mb-4 inline-grid w-full max-w-sm grid-cols-2 rounded-xl bg-surface-sunk p-1">
        <button
          type="button"
          onClick={() => setTab('received')}
          className={
            'rounded-lg py-1.5 text-sm font-semibold transition-colors ' +
            (tab === 'received' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground')
          }
        >
          {dt('received')}
        </button>
        <button
          type="button"
          onClick={() => setTab('sent')}
          className={
            'rounded-lg py-1.5 text-sm font-semibold transition-colors ' +
            (tab === 'sent' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground')
          }
        >
          {dt('sent')}
        </button>
      </div>

      {tab === 'received' ? (
        <div className="space-y-3">
          {RECEIVED_INVITES.map((inv) => {
            const m = memberById(inv.from);
            const r = responses[inv.id];
            return (
              <article
                key={inv.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <FriendAvatar member={m} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{dt('from', { name: m.name })}</p>
                    <h3 className="font-semibold">{inv.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(inv.date, lang)} · {destBySlug(inv.dest)?.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{inv.summary}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r ? (
                    <span className={'rounded-full px-3 py-1 text-xs font-semibold ' + SENT_CLS[r]}>
                      {dt(r)}
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setResponses((prev) => ({ ...prev, [inv.id]: 'accepted' }));
                          onAcceptInvite(inv.title, inv.dest);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                      >
                        <Check className="h-4 w-4" aria-hidden />
                        {dt('accept')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setResponses((prev) => ({ ...prev, [inv.id]: 'declined' }))
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
                      >
                        <X className="h-4 w-4" aria-hidden />
                        {dt('decline')}
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {SENT_INVITES.map((inv) => {
            const m = memberById(inv.to);
            const o = DEMO_OUTINGS.find((x) => x.id === inv.outingId);
            return (
              <article
                key={inv.id}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <FriendAvatar member={m} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{dt('to', { name: m.name })}</p>
                  <h3 className="font-semibold">{o?.title}</h3>
                  {o && (
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(o.date, lang)} · {destBySlug(o.dest)?.name}
                    </p>
                  )}
                </div>
                <span
                  className={
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ' +
                    SENT_CLS[inv.status]
                  }
                >
                  {dt(inv.status)}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/* MY OUTINGS & PAST OUTINGS PAGES                                            */
/* ========================================================================== */

const STATUS_LABEL: Record<string, string> = {
  lobby: 'Setting up — in the lobby',
  recommendations: 'Choosing a destination',
  planned: 'Planned & confirmed',
};

export function MyOutingsPage({
  plan,
  onNavigate,
}: {
  plan: ActivePlanState;
  onNavigate: (page: TravityPageId) => void;
}) {
  const { t } = useT();
  const dest = plan.destinationSlug ? destBySlug(plan.destinationSlug) : undefined;

  return (
    <div>
      <PageHeader
        title={t('nav.upcoming')}
        sub="Everything your group is working on right now, from lobby to locked-in plan."
      />

      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="grid sm:grid-cols-[260px_1fr]">
          {dest ? (
            <DestinationArt
              dest={dest}
              className="aspect-[16/9] sm:aspect-auto sm:h-full sm:rounded-none"
            />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-surface-sunk sm:aspect-auto sm:h-full">
              <MapPin className="h-8 w-8 text-muted-foreground" aria-hidden />
            </div>
          )}
          <div className="p-5">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {STATUS_LABEL[plan.status] ?? 'Active Lobby'}
            </span>
            <h2 className="mt-3 font-display text-xl font-bold">{plan.title}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {plan.date || 'Today'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" aria-hidden />
                {plan.memberIds.length} going
              </span>
              <span className="inline-flex items-center gap-1.5">
                {t('common.budget')}: ₹{plan.budget} {t('common.perPerson')}
              </span>
            </p>
            <div className="mt-4 flex items-center">
              {plan.memberIds.map((id: MemberId) => (
                <div key={id} className="-ml-2 first:ml-0 rounded-full ring-2 ring-card">
                  <FriendAvatar member={memberById(id)} size={28} />
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate('lobby')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Open group lobby
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                View route map
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function PastOutingsTravityPage({
  outings,
  onRehostOuting,
  onRateOutingArea,
}: {
  outings: PastOuting[];
  onRehostOuting: (title: string, mode: 'safe' | 'fun') => void;
  onRateOutingArea: (areaName: string) => void;
}) {
  const { t } = useT();

  return (
    <div>
      <PageHeader
        title={t('nav.past')}
        sub="Every outing your group completed — what it cost, who came, and the moment worth repeating."
      />

      <div className="space-y-4">
        {outings.map((o) => (
          <article
            key={o.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">{o.title}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {o.date} · {o.venue} · ₹{o.avgSpend} avg spent
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-warning font-semibold text-sm">
                <Star className="h-4 w-4" fill="currentColor" aria-hidden />
                {(o.safetyScore / 20).toFixed(1)}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{o.summary}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center">
                {o.participants.map((name: string) => (
                  <div key={name} className="-ml-2 first:ml-0 rounded-full ring-2 ring-card">
                    <FriendAvatar member={memberById(name)} size={28} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRateOutingArea(o.venue)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                >
                  Write review
                </button>
                <button
                  type="button"
                  onClick={() => onRehostOuting(o.title, o.mode)}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
                >
                  Plan again
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* REVIEWS & EXPERIENCES PAGE                                                 */
/* ========================================================================== */

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={'h-4 w-4 ' + (i <= value ? 'text-warning' : 'text-muted-foreground/30')}
          fill={i <= value ? 'currentColor' : 'none'}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function ReviewsTravityPage({
  reviews,
  prefillArea,
  onSubmitReview,
}: {
  reviews: AreaReviewItem[];
  prefillArea: string;
  onSubmitReview: (
    areaName: string,
    safetyRating: number,
    lightingStatus: AreaReviewItem['lightingStatus'],
    issueFlag: AreaReviewItem['issueFlag'],
    comment: string
  ) => void;
}) {
  const { t } = useT();
  const [areaName, setAreaName] = useState(
    prefillArea || 'NSUT (Netaji Subhas University of Technology)'
  );
  const [rating, setRating] = useState(5);
  const [lighting, setLighting] = useState<AreaReviewItem['lightingStatus']>('Well-Lit LED');
  const [issue, setIssue] = useState<AreaReviewItem['issueFlag']>('Safe & Verified Corridor');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmitReview(areaName, rating, lighting, issue, comment.trim());
    setComment('');
  };

  return (
    <div>
      <PageHeader
        title={t('nav.reviews')}
        sub="Notes your group left after each outing — honest feedback on campus hubs, metro exits, and evening safety."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {reviews.map((r) => {
            const member = memberById(r.authorName);
            return (
              <article
                key={r.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FriendAvatar member={member} size={36} />
                    <div>
                      <p className="text-sm font-semibold">{r.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.areaName} · {r.dateLabel}
                      </p>
                    </div>
                  </div>
                  <Stars value={r.safetyRating} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-full bg-surface-sunk px-2.5 py-0.5 font-medium text-foreground">
                    Lighting: {r.lightingStatus}
                  </span>
                  {r.issueFlag !== 'Safe & Verified Corridor' && (
                    <span className="rounded-full bg-warning/15 px-2.5 py-0.5 font-medium text-warning">
                      Note: {r.issueFlag}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft h-fit">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareHeart className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-base font-bold">Add a squad review</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Destination / Campus Hub
              </label>
              <select
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
              >
                <option value="NSUT (Netaji Subhas University of Technology)">
                  NSUT (Dwarka Sector 3)
                </option>
                <option value="IGDTUW (Indira Gandhi Delhi Technical University for Women)">
                  IGDTUW (Kashmere Gate)
                </option>
                <option value="Connaught Place (Rajiv Chowk)">
                  Connaught Place (Rajiv Chowk)
                </option>
                <option value="Sunder Nursery Heritage Park">Sunder Nursery</option>
                <option value="Dilli Haat INA">Dilli Haat INA</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Rating (1–5)
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Street Lighting
                </label>
                <select
                  value={lighting}
                  onChange={(e) =>
                    setLighting(e.target.value as AreaReviewItem['lightingStatus'])
                  }
                  className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
                >
                  <option value="Well-Lit LED">Well-Lit LED</option>
                  <option value="Moderate Lighting">Moderate Lighting</option>
                  <option value="Dim / Dark Stretches">Dim / Dark Stretches</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Observation Tag
              </label>
              <select
                value={issue}
                onChange={(e) => setIssue(e.target.value as AreaReviewItem['issueFlag'])}
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
              >
                <option value="Safe & Verified Corridor">Safe &amp; Verified Corridor</option>
                <option value="Crowded / High Traffic">Crowded / High Traffic</option>
                <option value="Poor Street Lighting">Poor Street Lighting</option>
                <option value="No Pink Saheli Booth Nearby">No Pink Saheli Booth Nearby</option>
                <option value="Unsafe / Isolated Spot">Unsafe / Isolated Spot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Your experience
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the metro exit, Pink Saheli support, or cafe vibe?"
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={!comment.trim()}
              className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Post review
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* EXPENSES PAGE                                                              */
/* ========================================================================== */

export function ExpensesPage({
  expenses,
  activeMemberId,
  onAddExpense,
}: {
  expenses: ExpenseItem[];
  activeMemberId: MemberId;
  onAddExpense: (item: Omit<ExpenseItem, 'id'>) => void;
}) {
  const { t } = useT();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<MemberId>(activeMemberId);

  const net = new Map<MemberId, number>();
  for (const e of expenses) {
    const share = e.amount / Math.max(1, e.participants.length);
    net.set(e.paidBy, (net.get(e.paidBy) ?? 0) + e.amount);
    for (const p of e.participants) {
      net.set(p, (net.get(p) ?? 0) - share);
    }
  }
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = (ev: React.FormEvent) => {
    ev.preventDefault();
    const num = Number(amount);
    if (!label.trim() || !num || num <= 0) return;
    onAddExpense({
      label: label.trim(),
      amount: num,
      paidBy,
      participants: ['saumay', 'devika', 'vansh', 'rimisha', 'pragya'],
    });
    setLabel('');
    setAmount('');
  };

  return (
    <div>
      <PageHeader
        title={t('nav.expenses')}
        sub="One shared sheet per outing — every rupee logged, split fairly among the squad."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4">
          <form
            onSubmit={handleAdd}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft flex flex-wrap items-end gap-2.5"
          >
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Expense item
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Metro snacks, E-rickshaw"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250"
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Paid by
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value as MemberId)}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
              >
                {MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </form>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Expense sheet</h2>
            <span className="text-sm font-semibold text-primary">Total {inr(total)}</span>
          </div>
          <div className="space-y-3">
            {expenses.map((e) => (
              <article
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FriendAvatar member={memberById(e.paidBy)} size={32} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{e.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Paid by {memberById(e.paidBy).name} · split {e.participants.length} ways
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold">{inr(e.amount)}</span>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Settle up</h2>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="space-y-3">
              {MEMBERS.map((m) => {
                const bal = net.get(m.id) ?? 0;
                const positive = bal >= 0;
                return (
                  <div key={m.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FriendAvatar member={m} size={28} />
                      <span className="text-sm font-medium">{m.name}</span>
                    </div>
                    <span
                      className={
                        'rounded-full px-2.5 py-1 text-xs font-semibold ' +
                        (positive
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive')
                      }
                    >
                      {positive ? `gets ${inr(bal)}` : `owes ${inr(-bal)}`}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-sunk p-3 text-xs text-muted-foreground">
              <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Settle directly with friends via UPI; Travity never holds money.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* NOTIFICATIONS PAGE                                                         */
/* ========================================================================== */

export function NotificationsPage({
  notifications,
  onMarkAllRead,
  onNavigate,
}: {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onNavigate: (page: TravityPageId) => void;
}) {
  const { t } = useT();

  return (
    <div>
      <PageHeader
        title={t('nav.notifications')}
        sub="Invites, joins and safety updates from your squad — newest first."
        actions={
          <button
            type="button"
            onClick={onMarkAllRead}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent"
          >
            Mark all read
          </button>
        }
      />

      <div className="space-y-3">
        {notifications.map((n) => {
          const meta = KIND_META[n.kind];
          const Icon = meta.icon;
          return (
            <article
              key={n.id}
              onClick={() => n.targetTab && onNavigate(n.targetTab as TravityPageId)}
              className={
                'flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4 shadow-soft transition-colors hover:bg-accent ' +
                (n.unread ? 'border-primary/40' : 'border-border')
              }
            >
              <span
                className={
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' +
                  meta.cls
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              </div>
              {n.unread && <Bell className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />}
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* PROFILE & SETTINGS PAGE                                                    */
/* ========================================================================== */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

export function ProfilePage({
  activeMemberId,
  onSelectMember,
  userEmail,
  onGoogleLogin,
  onLogout,
}: {
  activeMemberId: MemberId;
  onSelectMember: (id: MemberId) => void;
  userEmail: string | null;
  onGoogleLogin: () => void;
  onLogout: () => void;
}) {
  const { t } = useT();
  const { theme, toggleTheme } = useTheme();
  const [shareLive, setShareLive] = useState(true);
  const [safeRoutes, setSafeRoutes] = useState(true);
  const member = memberById(activeMemberId);

  return (
    <div>
      <PageHeader
        title={t('nav.profile')}
        sub="Who you are on Travety, and how the app behaves for your commute."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft h-fit">
          <div className="mx-auto w-fit rounded-full ring-4 ring-primary/10">
            <FriendAvatar member={member} size={72} />
          </div>
          <h2 className="mt-3 font-display text-xl font-bold">{member.name}</h2>
          <p className="text-sm text-muted-foreground">{member.homeLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Curfew: {member.curfew} · Budget: ₹{member.budget}
          </p>

          {userEmail ? (
            <button
              type="button"
              onClick={onLogout}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out ({userEmail})
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoogleLogin}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Sign in with Google
            </button>
          )}
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-bold">Switch active squad member</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MEMBERS.map((m) => {
                const active = m.id === activeMemberId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectMember(m.id)}
                    className={
                      'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors ' +
                      (active
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:bg-accent')
                    }
                  >
                    <FriendAvatar member={m} size={32} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{m.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        Curfew {m.curfew}
                      </p>
                    </div>
                  </button>
                );
              })}
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
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" aria-hidden />
                  ) : (
                    <Sun className="h-4 w-4" aria-hidden />
                  )}
                  {theme === 'light' ? 'Dark mode' : 'Light mode'}
                </button>
              </Row>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold">Privacy &amp; safety</h2>
            <div className="space-y-3">
              <Row label="Share live location with my group during outings">
                <input
                  type="checkbox"
                  checked={shareLive}
                  onChange={(e) => setShareLive(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </Row>
              <Row label="Prefer well-lit Pink Saheli metro routes by default">
                <input
                  type="checkbox"
                  checked={safeRoutes}
                  onChange={(e) => setSafeRoutes(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </Row>
              <p className="flex items-start gap-2 rounded-xl bg-surface-sunk p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                Location sharing is off by default outside active outings and never visible to
                people outside your squad.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* HELP & PRIVACY PAGE                                                        */
/* ========================================================================== */

const FAQS = [
  {
    q: 'How does Travety pick a place everyone can reach?',
    a: "Each friend sets a starting metro station (like Dwarka Mor for NSUT or Kashmere Gate for IGDTUW). Travety estimates every person's commute to candidate destinations and surfaces options that balance travel time, curfew return, and budget.",
  },
  {
    q: 'How do invite codes work?',
    a: 'Every plan gets a short code (like TRV-8492). Share it with friends; they enter it under Join a plan and land straight in your group lobby.',
  },
  {
    q: 'How are expenses split?',
    a: 'Log what was paid and who took part. Travety keeps a running sheet and shows who gets back and who owes — settling happens directly between friends.',
  },
];

const PRIVACY = [
  {
    title: 'Your location',
    body: 'Live location is shared only with your own squad, only while an outing is active.',
  },
  {
    title: 'Your chats and plans',
    body: 'Group notes, starting points and budgets stay inside your group.',
  },
];

export function HelpPage({ onNavigate }: { onNavigate: (page: TravityPageId) => void }) {
  const { t } = useT();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div>
      <PageHeader
        title={t('nav.help')}
        sub="Short answers on how Travety works, plus how your squad's safety comes first."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-3 text-lg font-bold">Frequently asked</h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4 shadow-soft">
            {FAQS.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between text-left text-sm font-semibold"
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      className={'h-4 w-4 transition-transform ' + (isOpen ? 'rotate-180' : '')}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>

          <h2 className="mb-3 mt-8 text-lg font-bold">Privacy, in plain words</h2>
          <div className="space-y-3">
            {PRIVACY.map((p) => (
              <article
                key={p.title}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
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
            <p className="mt-3 font-semibold">Ready to plan?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Travis can walk your NSUT &amp; IGDTUW squad through planning your next outing step
              by step.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('plan')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('home.ctaPlan')}
            </button>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Focused exclusively on Delhi NCR metro and campus corridors.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

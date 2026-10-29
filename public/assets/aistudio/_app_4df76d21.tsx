import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Bell,
  CalendarDays,
  CircleHelp,
  Compass,
  Heart,
  History,
  Home,
  Mail,
  Map,
  PenSquare,
  ShieldCheck,
  Star,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { DemoBadge, TravisImg } from "@/components/travity/bits";
import { AppHeader } from "@/components/travity/AppHeader";
import { FriendAvatar } from "@/components/travity/FriendAvatar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useT, type TKey } from "@/lib/ui-prefs";
import { useDT, type DKey } from "@/lib/dash-i18n";
import { memberById } from "@/data/mock";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

interface NavItem {
  to: string;
  labelKey: TKey;
  icon: LucideIcon;
}

const NAV_GROUPS: NavItem[][] = [
  [
    { to: "/dashboard", labelKey: "nav.home", icon: Home },
    { to: "/plan", labelKey: "nav.plan", icon: PenSquare },
    { to: "/join", labelKey: "nav.join", icon: Compass },
  ],
  [
    { to: "/explore", labelKey: "nav.explore", icon: Compass },
    { to: "/saved", labelKey: "nav.saved", icon: Heart },
    { to: "/map", labelKey: "map.title", icon: Map },
    { to: "/safety", labelKey: "safety.title", icon: ShieldCheck },
  ],
  [
    { to: "/outings", labelKey: "nav.upcoming", icon: CalendarDays },
    { to: "/past", labelKey: "nav.past", icon: History },
    { to: "/reviews", labelKey: "nav.reviews", icon: Star },
    { to: "/expenses", labelKey: "nav.expenses", icon: Wallet },
  ],
  [
    { to: "/notifications", labelKey: "nav.notifications", icon: Bell },
    { to: "/profile", labelKey: "nav.profile", icon: CircleHelp },
    { to: "/help", labelKey: "nav.help", icon: CircleHelp },
  ],
];

const BOTTOM_TABS: { to: string; key: DKey; icon: LucideIcon }[] = [
  { to: "/dashboard", key: "tab.home", icon: Home },
  { to: "/calendar", key: "tab.calendar", icon: CalendarDays },
  { to: "/map", key: "tab.map", icon: Map },
  { to: "/invitations", key: "tab.invites", icon: Mail },
  { to: "/profile", key: "tab.profile", icon: User },
];

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavLinkItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { t } = useT();
  const active = isActive(pathname, item.to);
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
        (active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {t(item.labelKey)}
    </Link>
  );
}

function UserChip() {
  const { profile } = useAuth();
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2">
      <FriendAvatar member={memberById("aarav")} size={32} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{profile?.display_name ?? "…"}</p>
        <p className="truncate text-xs text-muted-foreground">Delhi NCR</p>
      </div>
    </div>
  );
}

function AppLayout() {
  const { session, loading, preview, exitPreview } = useAuth();
  const { t } = useT();
  const { dt } = useDT();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Wait for the session to resolve before judging signedIn — a hard reload
  // would otherwise bounce to the login page for one render.
  useEffect(() => {
    if (!loading && !session && !preview) navigate({ to: "/" });
  }, [loading, session, preview, navigate]);

  if (loading || (!session && !preview)) return null;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      {/* Desktop sidebar — extra pages */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <TravisImg pose="wave" className="h-9 w-9 anim-float" />
          <span className="font-display text-xl font-bold tracking-tight">Travity</span>
        </Link>
        <p className="mt-1 px-1 text-xs text-muted-foreground">{t("brand.tagline")}</p>
        <nav aria-label="Main" className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="space-y-1">
              {group.map((item) => (
                <NavLinkItem key={item.to} item={item} pathname={pathname} />
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-4 space-y-3 border-t border-sidebar-border pt-4 pb-16">
          <UserChip />
          <button
            type="button"
            onClick={async () => {
              exitPreview();
              if (session) await supabase.auth.signOut();
              navigate({ to: "/", replace: true });
            }}
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            {preview && !session ? "Exit preview" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <AppHeader />
        <main className="mx-auto w-full max-w-[1200px] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:pt-8">
          <DemoBadge className="mb-4 lg:hidden" />
          <Outlet />
        </main>
      </div>

      {/* Fixed bottom navigation — five tabs, Map centred */}
      <nav
        aria-label="Bottom"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:left-[264px]"
      >
        {BOTTOM_TABS.map((item) => {
          const active = isActive(pathname, item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={
                "flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:scale-95 " +
                (active ? "text-primary" : "text-muted-foreground hover:text-foreground")
              }
            >
              <span className={"flex h-7 w-12 items-center justify-center rounded-full transition-colors " + (active ? "bg-primary/15" : "")}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="truncate">{dt(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bell, CalendarClock, Check, Lightbulb, Mail, MoreVertical, RefreshCw, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { TravisImg } from "@/components/travity/bits";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DASH_NOTIFICATIONS, type DashNotifKind } from "@/data/outings";
import { useDT } from "@/lib/dash-i18n";
import { dashStore, unreadCount, useDashStore } from "@/lib/dash-store";
import { useT, useTheme, type Lang } from "@/lib/ui-prefs";

const iconBtn =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const KIND: Record<DashNotifKind, { icon: LucideIcon; cls: string }> = {
  invite: { icon: Mail, cls: "bg-primary/10 text-primary" },
  suggestion: { icon: Lightbulb, cls: "bg-brand-cyan/10 text-brand-cyan" },
  update: { icon: RefreshCw, cls: "bg-success/10 text-success" },
  reminder: { icon: CalendarClock, cls: "bg-brand-pink/10 text-brand-pink" },
};

function BackButton() {
  const router = useRouter();
  const navigate = useNavigate();
  const { dt } = useDT();
  return (
    <button
      type="button"
      aria-label={dt("back")}
      className={iconBtn}
      onClick={() => {
        if (router.history.canGoBack()) router.history.back();
        else void navigate({ to: "/dashboard" });
      }}
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
    </button>
  );
}

function SettingsMenu() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useT();
  const { dt } = useDT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={dt("menu")} className={iconBtn}>
        <MoreVertical className="h-5 w-5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{dt("appearance")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => v !== theme && toggleTheme()}>
          <DropdownMenuRadioItem value="light">{dt("light")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">{dt("dark")}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{dt("language")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={lang} onValueChange={(v) => setLang(v as Lang)}>
          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="hi">हिंदी</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationBell() {
  const s = useDashStore();
  const { dt } = useDT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = unreadCount(s);
  const items = DASH_NOTIFICATIONS;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={`${dt("notifs")}${unread ? ` (${unread})` : ""}`} className={iconBtn + " relative"}>
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-pink px-1 text-[10px] font-bold text-primary-foreground">
            {unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} collisionPadding={8} className="w-[min(22rem,calc(100vw-1rem))] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="font-semibold">{dt("notifs")}</p>
          {unread > 0 && (
            <button type="button" onClick={dashStore.markAllRead} className="text-xs font-semibold text-primary hover:underline">
              {dt("markAll")}
            </button>
          )}
        </div>
        {items.length === 0 || unread === 0 ? (
          <div className="px-4 py-8 text-center">
            <TravisImg pose="think" className="mx-auto h-14 w-14" />
            <p className="mt-2 text-sm font-semibold">{dt("noNotifs")}</p>
            <p className="text-xs text-muted-foreground">{dt("noNotifsSub")}</p>
          </div>
        ) : null}
        {unread > 0 && (
          <ul className="max-h-[60vh] overflow-y-auto">
            {items.map((n) => {
              const read = s.readIds.includes(n.id);
              const K = KIND[n.kind];
              const Icon = K.icon;
              return (
                <li key={n.id} className={"flex gap-3 border-b border-border px-4 py-3 last:border-0 " + (read ? "opacity-70" : "bg-primary/5")}>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 gap-3 text-left"
                    onClick={() => {
                      dashStore.markRead(n.id);
                      setOpen(false);
                      if (n.kind === "invite") void navigate({ to: "/invitations", search: { tab: "received", focus: n.inviteId } });
                      else if (n.kind === "suggestion") void navigate({ to: "/explore" });
                      else void navigate({ to: "/calendar" });
                    }}
                  >
                    <span className={"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg " + K.cls}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-semibold">
                        {!read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="unread" />}
                        {dt(n.titleKey)}
                      </span>
                      <span className="block text-xs text-muted-foreground">{dt(n.bodyKey)}</span>
                      <span className="block text-[11px] text-muted-foreground">{dt("ago", { t: n.time })}</span>
                    </span>
                  </button>
                  {!read && (
                    <button type="button" aria-label={dt("markRead")} onClick={() => dashStore.markRead(n.id)} className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:bg-accent">
                      <Check className="mx-auto h-4 w-4" aria-hidden />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">{dt("demoNote")}</p>
      </PopoverContent>
    </Popover>
  );
}

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-border bg-background/90 px-2 py-2 backdrop-blur sm:px-4">
      <BackButton />
      <Link to="/dashboard" className="ml-1 flex min-w-0 items-center gap-2.5">
        <TravisImg pose="wave" className="h-9 w-9 anim-float" />
        <span className="font-display text-xl font-bold tracking-tight">Travity</span>
      </Link>
      <div className="ml-auto flex items-center gap-1">
        <SettingsMenu />
        <NotificationBell />
      </div>
    </header>
  );
}

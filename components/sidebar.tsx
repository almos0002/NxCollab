"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Layers, Clock, Settings, Shield, LogOut, Sun, Moon, Monitor, ChevronRight, PanelLeftClose, PanelLeft, Inbox, ChevronsUpDown, Menu, X, Lightbulb, MessageCircle } from "lucide-react";
import { Realtime } from "ably";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ablyChannels } from "@/lib/ably/channels";

interface SidebarProps {
  user: { id: string; name: string; email: string; image?: string | null; isAdmin?: boolean };
  siteLogo?: string;
  siteName?: string;
  initialCollapsed?: boolean;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workspaces", label: "Workspaces", icon: Layers },
  { href: "/ideas", label: "Idea Bank", icon: Lightbulb },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/recent", label: "Recent", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}

export function Sidebar({ user, siteLogo, siteName, initialCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const fetchChatUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/unread-count");
      if (res.ok) {
        const data = await res.json();
        setChatUnreadCount(data.count ?? 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchChatUnread();
    const interval = setInterval(fetchChatUnread, 30000);
    const handleChange = () => fetchChatUnread();
    window.addEventListener("chat-unread-change", handleChange);

    const realtime = new Realtime({ authUrl: "/api/ably/token", clientId: user.id });
    const channel = realtime.channels.get(ablyChannels.userNotifications(user.id));
    channel.subscribe("chat.unread", handleChange).catch(() => undefined);

    return () => {
      clearInterval(interval);
      window.removeEventListener("chat-unread-change", handleChange);
      channel.unsubscribe("chat.unread", handleChange);
      realtime.close();
    };
  }, [fetchChatUnread, user.id]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    setCookie("sidebar-collapsed", String(next), 365);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/auth/sign-in");
    router.refresh();
  }

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const themeLabel = theme === "system" ? "System" : theme === "light" ? "Light" : "Dark";

  function SidebarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
    if (!collapsed) return <>{children}</>;
    return (
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">{label}</TooltipContent>
      </Tooltip>
    );
  }

  const sidebarContent = (
    <aside
      className={cn(
        "flex flex-col min-h-screen border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0 overflow-hidden transition-all duration-200",
        "max-md:w-[260px]",
        collapsed ? "md:w-[68px]" : "md:w-[260px]"
      )}
    >
      <div className={cn("border-b border-[hsl(var(--border))] h-[49px] flex items-center", collapsed ? "md:px-2 max-md:px-3" : "px-3")}>
        <SidebarTooltip label={`${user.name}\n${user.email}`}>
          <Link
            href="/settings"
            className={cn(
              "flex items-center w-full",
              collapsed ? "md:justify-center md:py-2 max-md:gap-2.5 max-md:px-2 max-md:py-2" : "gap-2.5 px-2 py-2"
            )}
          >
            <div className="relative shrink-0">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[hsl(var(--background))]">{initials}</span>
                </div>
              )}
              {siteLogo && (
                <img
                  src={siteLogo}
                  alt={siteName || "Logo"}
                  className="absolute -bottom-1 -right-1 w-4 h-4 object-contain ring-2 ring-[hsl(var(--card))] bg-[hsl(var(--background))]"
                />
              )}
            </div>
            {(!collapsed || mobileOpen) && (
              <>
                <div className="flex-1 min-w-0 max-md:block hidden md:hidden">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate leading-tight">{user.name}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate leading-tight mt-0.5">{siteName || user.email}</p>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0 opacity-50 max-md:block hidden md:hidden" />
              </>
            )}
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 hidden md:block">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate leading-tight">{user.name}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate leading-tight mt-0.5">{siteName || user.email}</p>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0 opacity-50 hidden md:block" />
              </>
            )}
          </Link>
        </SidebarTooltip>
      </div>

      <nav className={cn("flex-1 py-3 space-y-0.5 overflow-y-auto", collapsed ? "md:px-2 max-md:px-3" : "px-3")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          const isCollapsedDesktop = collapsed;
          return (
            <SidebarTooltip key={item.href} label={item.href === "/messages" && chatUnreadCount > 0 ? `${item.label} (${chatUnreadCount})` : item.label}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg text-sm transition-all",
                  isCollapsedDesktop ? "md:justify-center md:px-0 md:py-2.5 max-md:gap-3 max-md:px-3 max-md:py-2.5" : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-medium"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <div className="relative shrink-0">
                  <Icon className="w-[18px] h-[18px]" />
                  {item.href === "/messages" && chatUnreadCount > 0 && isCollapsedDesktop && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[10px] font-bold flex items-center justify-center ring-2 ring-[hsl(var(--card))] hidden md:flex">{chatUnreadCount > 9 ? "9+" : chatUnreadCount}</span>
                  )}
                </div>
                {!isCollapsedDesktop && <span className="flex-1 hidden md:inline">{item.label}</span>}
                <span className="flex-1 md:hidden">{item.label}</span>
                {!isCollapsedDesktop && item.href === "/messages" && chatUnreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[11px] font-bold hidden md:flex items-center justify-center">{chatUnreadCount > 99 ? "99+" : chatUnreadCount}</span>
                )}
                {item.href === "/messages" && chatUnreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[11px] font-bold flex md:hidden items-center justify-center">{chatUnreadCount > 99 ? "99+" : chatUnreadCount}</span>
                )}
                {!isCollapsedDesktop && active && item.href !== "/messages" && <ChevronRight className="w-3.5 h-3.5 opacity-40 hidden md:block" />}
                {active && item.href !== "/messages" && <ChevronRight className="w-3.5 h-3.5 opacity-40 md:hidden" />}
              </Link>
            </SidebarTooltip>
          );
        })}
        {user.isAdmin && (
          <SidebarTooltip label="Admin">
            <Link
              href="/admin"
              className={cn(
                "group flex items-center rounded-lg text-sm transition-all",
                collapsed ? "md:justify-center md:px-0 md:py-2.5 max-md:gap-3 max-md:px-3 max-md:py-2.5" : "gap-3 px-3 py-2.5",
                pathname.startsWith("/admin")
                  ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-medium"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <Shield className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="flex-1 hidden md:inline">Admin</span>}
              <span className="flex-1 md:hidden">Admin</span>
              {!collapsed && pathname.startsWith("/admin") && <ChevronRight className="w-3.5 h-3.5 opacity-40 hidden md:block" />}
              {pathname.startsWith("/admin") && <ChevronRight className="w-3.5 h-3.5 opacity-40 md:hidden" />}
            </Link>
          </SidebarTooltip>
        )}
      </nav>

      <div className={cn("border-t border-[hsl(var(--border))] space-y-0.5", collapsed ? "md:px-2 max-md:px-3 py-3" : "px-3 py-3")}>
        <SidebarTooltip label={`${themeLabel} mode`}>
          <button
            onClick={() => setTheme(nextTheme)}
            className={cn(
              "flex items-center w-full rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))] transition-all",
              collapsed ? "md:justify-center md:px-0 md:py-2.5 max-md:gap-3 max-md:px-3 max-md:py-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            <ThemeIcon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="hidden md:inline">{themeLabel} mode</span>}
            <span className="md:hidden">{themeLabel} mode</span>
          </button>
        </SidebarTooltip>
        <SidebarTooltip label="Sign out">
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center w-full rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))] transition-all",
              collapsed ? "md:justify-center md:px-0 md:py-2.5 max-md:gap-3 max-md:px-3 max-md:py-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="hidden md:inline">Sign out</span>}
            <span className="md:hidden">Sign out</span>
          </button>
        </SidebarTooltip>
        <SidebarTooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <button
            onClick={toggleCollapsed}
            className={cn(
              "items-center w-full rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))] transition-all hidden md:flex",
              collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            {collapsed ? <PanelLeft className="w-[18px] h-[18px] shrink-0" /> : <PanelLeftClose className="w-[18px] h-[18px] shrink-0" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </SidebarTooltip>
      </div>
    </aside>
  );

  return (
    <TooltipProvider>
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center justify-center shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-[hsl(var(--foreground))]" />
      </button>

      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-[280px] animate-slide-in-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center z-10"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 text-[hsl(var(--foreground))]" />
            </button>
            {sidebarContent}
          </div>
        </>
      )}
    </TooltipProvider>
  );
}

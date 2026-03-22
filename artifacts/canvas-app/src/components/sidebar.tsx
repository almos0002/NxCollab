"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, Layers, Clock, Settings, Shield, LogOut, Sun, Moon, Monitor, ChevronRight, PanelLeftClose, PanelLeft, User } from "lucide-react";

interface SidebarProps {
  user: { name: string; email: string; image?: string | null; isAdmin?: boolean };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workspaces", label: "Workspaces", icon: Layers },
  { href: "/recent", label: "Recent", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

const SIDEBAR_KEY = "sidebar-collapsed";

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_KEY, String(next));
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

  return (
    <aside
      className={cn(
        "flex flex-col min-h-screen border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0 overflow-hidden",
        mounted && "transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
      style={!mounted ? { visibility: "hidden" } : undefined}
    >
      <div className={cn("border-b border-[hsl(var(--border))]", collapsed ? "px-2 py-4" : "px-4 py-4")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[hsl(var(--foreground))] flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-[hsl(var(--background))]">{initials}</span>
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{user.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>

      <nav className={cn("flex-1 py-3 space-y-0.5 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center rounded-lg text-sm transition-all",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-medium"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && active && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
            </Link>
          );
        })}
        {user.isAdmin && (
          <Link
            href="/admin"
            title={collapsed ? "Admin" : undefined}
            className={cn(
              "group flex items-center rounded-lg text-sm transition-all",
              collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
              pathname.startsWith("/admin")
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-medium"
                : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))]"
            )}
          >
            <Shield className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="flex-1">Admin</span>}
            {!collapsed && pathname.startsWith("/admin") && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
          </Link>
        )}
      </nav>

      <div className={cn("border-t border-[hsl(var(--border))] space-y-0.5", collapsed ? "px-2 py-3" : "px-3 py-3")}>
        <button
          onClick={() => setTheme(nextTheme)}
          title={collapsed ? `${theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"} mode` : undefined}
          className={cn(
            "flex items-center w-full rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))] transition-all",
            collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          <ThemeIcon className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>{theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"} mode</span>}
        </button>
        <button
          onClick={handleSignOut}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex items-center w-full rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))] transition-all",
            collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center w-full rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))] transition-all",
            collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          {collapsed ? <PanelLeft className="w-[18px] h-[18px] shrink-0" /> : <PanelLeftClose className="w-[18px] h-[18px] shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

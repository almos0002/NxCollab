"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Layers, Clock, Settings, Shield, LogOut, Sun, Moon, Monitor, ChevronRight } from "lucide-react";

interface SidebarProps {
  user: { name: string; email: string; isAdmin?: boolean };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workspaces", label: "Workspaces", icon: Layers },
  { href: "/recent", label: "Recent", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/auth/sign-in");
    router.refresh();
  }

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <aside className="flex flex-col w-[260px] min-h-screen border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
      <div className="px-5 py-5 border-b border-[hsl(var(--border))]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
            </svg>
          </div>
          <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Canvas</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              active
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-medium"
                : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))]"
            )}>
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
            </Link>
          );
        })}
        {user.isAdmin && (
          <Link href="/admin" className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
            pathname.startsWith("/admin")
              ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-medium"
              : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))]"
          )}>
            <Shield className="w-[18px] h-[18px] shrink-0" />
            <span className="flex-1">Admin</span>
            {pathname.startsWith("/admin") && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
          </Link>
        )}
      </nav>
      <div className="px-3 py-4 border-t border-[hsl(var(--border))] space-y-1">
        <button onClick={() => setTheme(nextTheme)} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))] transition-all">
          <ThemeIcon className="w-[18px] h-[18px] shrink-0" />
          {theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"} mode
        </button>
        <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--foreground))] transition-all">
          <LogOut className="w-[18px] h-[18px] shrink-0" /> Sign out
        </button>
        <div className="px-3 py-3 mt-1 rounded-lg bg-[hsl(var(--muted)/0.5)]">
          <p className="text-xs font-medium text-[hsl(var(--foreground))] truncate">{user.name}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}

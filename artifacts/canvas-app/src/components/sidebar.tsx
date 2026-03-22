"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Layers, Clock, Settings, Shield, LogOut, Sun, Moon, Monitor } from "lucide-react";

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
    <aside className="flex flex-col w-[240px] min-h-screen border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
      <div className="px-4 py-5 border-b border-[hsl(var(--border))]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[hsl(var(--foreground))] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" fill="hsl(var(--background))"/>
              <rect x="14" y="3" width="7" height="7" rx="1" fill="hsl(var(--background))"/>
              <rect x="3" y="14" width="7" height="7" rx="1" fill="hsl(var(--background))"/>
              <rect x="14" y="14" width="7" height="7" rx="1" fill="hsl(var(--background))"/>
            </svg>
          </div>
          <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Canvas</span>
        </Link>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
              active ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-medium" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
            )}>
              <Icon className="w-4 h-4 shrink-0" /> {item.label}
            </Link>
          );
        })}
        {user.isAdmin && (
          <Link href="/admin" className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
            pathname.startsWith("/admin") ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-medium" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
          )}>
            <Shield className="w-4 h-4 shrink-0" /> Admin
          </Link>
        )}
      </nav>
      <div className="px-2 py-3 border-t border-[hsl(var(--border))] space-y-0.5">
        <button onClick={() => setTheme(nextTheme)} className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors">
          <ThemeIcon className="w-4 h-4 shrink-0" />
          {theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"} mode
        </button>
        <button onClick={handleSignOut} className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors">
          <LogOut className="w-4 h-4 shrink-0" /> Sign out
        </button>
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-[hsl(var(--foreground))] truncate">{user.name}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}

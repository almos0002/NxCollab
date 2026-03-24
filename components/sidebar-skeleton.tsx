import { cn } from "@/lib/utils";
import { LayoutDashboard, Layers, Clock, Settings, Inbox } from "lucide-react";

interface SidebarSkeletonProps {
  collapsed?: boolean;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Workspaces", icon: Layers },
  { label: "Inbox", icon: Inbox },
  { label: "Recent", icon: Clock },
  { label: "Settings", icon: Settings },
];

export function SidebarSkeleton({ collapsed = false }: SidebarSkeletonProps) {
  return (
    <aside
      className={cn(
        "flex-col min-h-screen border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0 overflow-hidden hidden md:flex",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      <div className={cn("border-b border-[hsl(var(--border))] h-[49px] flex items-center", collapsed ? "px-2" : "px-3")}>
        <div className={cn(
          "flex items-center rounded-lg",
          collapsed ? "justify-center p-1.5" : "gap-2.5 px-2 py-1.5"
        )}>
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] shrink-0 animate-pulse" />
          {!collapsed && (
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-3.5 w-24 bg-[hsl(var(--muted))] rounded animate-pulse" />
              <div className="h-3 w-16 bg-[hsl(var(--muted))] rounded animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <nav className={cn("flex-1 py-3 space-y-0.5", collapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={cn(
                "flex items-center rounded-lg text-sm",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
              )}
            >
              <Icon className="w-[18px] h-[18px] text-[hsl(var(--muted-foreground))] shrink-0" />
              {!collapsed && (
                <span className="text-[hsl(var(--muted-foreground))]">{item.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      <div className={cn("border-t border-[hsl(var(--border))]", collapsed ? "px-2 py-3" : "px-3 py-3")}>
        <div className={cn("flex items-center rounded-lg", collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5")}>
          <div className="w-[18px] h-[18px] rounded bg-[hsl(var(--muted))] animate-pulse shrink-0" />
          {!collapsed && <div className="h-3.5 w-16 bg-[hsl(var(--muted))] rounded animate-pulse" />}
        </div>
      </div>
    </aside>
  );
}

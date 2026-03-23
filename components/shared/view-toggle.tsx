"use client";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
      <button
        onClick={() => onViewChange("grid")}
        className={`flex items-center justify-center w-8 h-8 transition-colors ${
          view === "grid"
            ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/0.5)]"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`flex items-center justify-center w-8 h-8 border-l border-[hsl(var(--border))] transition-colors ${
          view === "list"
            ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/0.5)]"
        }`}
      >
        <List className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

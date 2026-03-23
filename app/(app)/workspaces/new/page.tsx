import type { Metadata } from "next";
import { NewWorkspaceForm } from "@/components/workspace/new-workspace-form";
import Link from "next/link";

export const metadata: Metadata = { title: "New Workspace" };

export default function NewWorkspacePage() {
  return (
    <div className="p-8 max-w-xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
          <Link href="/workspaces" className="hover:text-[hsl(var(--foreground))] transition-colors">Workspaces</Link>
          <span className="opacity-40">/</span>
          <span className="text-[hsl(var(--foreground))] font-medium">New</span>
        </div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">New Workspace</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Create a workspace to collaborate on canvases</p>
      </div>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <NewWorkspaceForm />
      </div>
    </div>
  );
}

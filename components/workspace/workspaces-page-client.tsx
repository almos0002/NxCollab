"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { WorkspacesList } from "@/components/workspace/workspaces-list";
import { ResourceFormDialog } from "@/components/shared/resource-form-dialog";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  role: string;
  createdAt: string;
}

export function WorkspacesPageClient({ workspaces }: { workspaces: Workspace[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  async function handleCreate(data: { name: string; description: string }) {
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to create workspace");
    setShowCreate(false);
    router.push(`/workspaces/${result.id}`);
    router.refresh();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Workspaces</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New workspace
        </button>
      </div>
      <WorkspacesList workspaces={workspaces} />
      <ResourceFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        title="Create Workspace"
        submitLabel="Create workspace"
        namePlaceholder="My Workspace"
        descriptionPlaceholder="What is this workspace for?"
      />
    </div>
  );
}

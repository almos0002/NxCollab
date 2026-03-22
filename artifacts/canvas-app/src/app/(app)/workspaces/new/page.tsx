import { NewWorkspaceForm } from "@/components/workspace/new-workspace-form";
export default function NewWorkspacePage() {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">New Workspace</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Create a workspace to collaborate on canvases</p>
      </div>
      <NewWorkspaceForm />
    </div>
  );
}

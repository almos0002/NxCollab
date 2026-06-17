"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Spinner } from "@/components/ui/spinner";
import { parseJsonResponse } from "@/lib/http/parse-json-response";

interface WorkspaceChatProps {
  workspaceId: string;
  workspaceName: string;
  currentUser: {
    id: string;
    name: string;
    email?: string | null;
  };
}

interface WorkspaceThreadResponse {
  id: string;
}

export function WorkspaceChat({ workspaceId, workspaceName, currentUser }: WorkspaceChatProps) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspaceThread() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/chat/workspaces/${workspaceId}/thread`, {
          method: "POST",
        });
        const data = await parseJsonResponse<WorkspaceThreadResponse | { error?: string }>(res);
        if (!res.ok) throw new Error("error" in data ? data.error || "Failed to open workspace chat" : "Failed to open workspace chat");
        if (!("id" in data) || !data.id) throw new Error("Workspace chat is not ready. Run npm run db:push, then refresh.");
        if (!cancelled) setThreadId(data.id);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to open workspace chat");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWorkspaceThread();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Spinner /> Opening workspace chat...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.08)] p-5">
        <div className="flex items-start gap-2 text-sm text-[hsl(var(--destructive))]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Chat unavailable</p>
            <p className="mt-1 text-xs opacity-90">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatPanel
      threadId={threadId}
      currentUser={currentUser}
      title="Workspace chat"
      subtitle={workspaceName}
      placeholder={`Message ${workspaceName}...`}
    />
  );
}

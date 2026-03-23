"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, X, Shield, Eye, Pencil } from "lucide-react";

interface InviteConfirmationProps {
  token: string;
  workspaceName: string;
  role: string;
  inviterName: string;
}

const roleDescriptions: Record<string, { label: string; description: string; icon: typeof Shield }> = {
  admin: { label: "Admin", description: "Manage members and all canvases", icon: Shield },
  member: { label: "Member", description: "Create and edit canvases", icon: Pencil },
  viewer: { label: "Viewer", description: "View-only access", icon: Eye },
};

export function InviteConfirmation({ token, workspaceName, role, inviterName }: InviteConfirmationProps) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState("");

  const roleInfo = roleDescriptions[role] ?? { label: role, description: "", icon: Users };
  const RoleIcon = roleInfo.icon;

  async function handleAccept() {
    setAccepting(true);
    setError("");
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.workspaceId) {
        router.push(`/workspaces/${data.workspaceId}`);
      } else {
        setError(data.error || "Failed to accept invite");
        setAccepting(false);
      }
    } catch {
      setError("Something went wrong");
      setAccepting(false);
    }
  }

  async function handleDecline() {
    setDeclining(true);
    await fetch(`/api/invites/${token}/decline`, { method: "POST" });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="w-full max-w-md mx-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--foreground)/0.05)] to-[hsl(var(--foreground)/0.1)] flex items-center justify-center mx-auto mb-5">
              <UserPlus className="w-7 h-7 text-[hsl(var(--foreground))]" />
            </div>
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">You're invited!</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              <span className="font-medium text-[hsl(var(--foreground))]">{inviterName}</span> invited you to join
            </p>
          </div>

          <div className="mx-6 mb-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--foreground))] flex items-center justify-center">
                <span className="text-sm font-bold text-[hsl(var(--background))]">{workspaceName[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-base font-semibold text-[hsl(var(--foreground))]">{workspaceName}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[hsl(var(--muted)/0.5)]">
              <RoleIcon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <div>
                <p className="text-xs font-semibold text-[hsl(var(--foreground))]">Joining as {roleInfo.label}</p>
                {roleInfo.description && <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{roleInfo.description}</p>}
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 p-3 rounded-lg bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)]">
              <p className="text-xs text-[hsl(var(--destructive))] font-medium">{error}</p>
            </div>
          )}

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleDecline}
              disabled={declining || accepting}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting || declining}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <UserPlus className="w-4 h-4" />
              {accepting ? "Joining..." : "Accept & Join"}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-[hsl(var(--muted-foreground))] mt-4 opacity-60">
          This invitation will expire in 7 days
        </p>
      </div>
    </div>
  );
}

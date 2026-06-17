"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Search, UserRound } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { parseJsonResponse } from "@/lib/http/parse-json-response";

interface ChatUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface MessagesPageClientProps {
  currentUser: ChatUser;
  users: ChatUser[];
}

interface DmResponse {
  thread?: { id: string };
  user?: ChatUser;
  error?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MessagesPageClient({ currentUser, users }: MessagesPageClientProps) {
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [openingUserId, setOpeningUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(normalized)
    );
  }, [query, users]);

  async function openDm(user: ChatUser) {
    setOpeningUserId(user.id);
    setError(null);

    try {
      const res = await fetch(`/api/chat/dm/${user.id}`, { method: "POST" });
      const data = await parseJsonResponse<DmResponse>(res);
      if (!res.ok || !data.thread) throw new Error(data.error || "Failed to open DM");
      if (!data.thread?.id) throw new Error("DM chat is not ready. Run npm run db:push, then refresh.");
      setSelectedUser(data.user ?? user);
      setThreadId(data.thread.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open DM");
    } finally {
      setOpeningUserId(null);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        <div className="border-b border-[hsl(var(--border))] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))]">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Direct messages</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Start a private live chat</p>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teammates..."
              className="pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="m-3 rounded-xl border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
            {error}
          </div>
        )}

        <div className="max-h-[calc(100vh-270px)] overflow-y-auto p-2">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <UserRound className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">No people found</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Try another name or email.</p>
            </div>
          ) : filteredUsers.map((user) => {
            const active = selectedUser?.id === user.id;
            const opening = openingUserId === user.id;

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => openDm(user)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                  active
                    ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                    : "hover:bg-[hsl(var(--accent)/0.55)]"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[hsl(var(--muted))] text-xs font-bold text-[hsl(var(--muted-foreground))]">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                  ) : initials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">{user.name}</p>
                  <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                </div>
                {opening && <Spinner className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />}
              </button>
            );
          })}
        </div>
      </aside>

      <ChatPanel
        threadId={threadId}
        currentUser={currentUser}
        title={selectedUser ? selectedUser.name : "Direct message"}
        subtitle={selectedUser ? selectedUser.email : "Choose a teammate to start chatting"}
        placeholder={selectedUser ? `Message ${selectedUser.name}...` : "Choose a teammate first"}
        disabled={!selectedUser}
        className="min-h-[620px]"
      />
    </div>
  );
}

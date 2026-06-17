"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Realtime,
  type InboundMessage,
  type PresenceMessage,
  type RealtimeChannel,
} from "ably";
import { AlertTriangle, CheckCheck, MessageCircle, Send, Signal, Users, WifiOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ablyChannels } from "@/lib/ably/channels";
import { cn, formatDate } from "@/lib/utils";
import { parseJsonResponse } from "@/lib/http/parse-json-response";

type ChatSender = {
  id: string | null;
  name?: string | null;
  email?: string | null;
};

type ChatMessage = {
  id: string;
  threadId: string;
  senderId: string | null;
  body: string;
  metadata?: unknown;
  clientNonce?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  sender?: ChatSender;
};

type MessageCreatedPayload = {
  message?: ChatMessage;
  sender?: ChatSender;
};

type ReadReceiptPayload = {
  userId?: string;
  lastReadMessageId?: string | null;
  lastReadAt?: string;
};

type OnlineUser = {
  id: string;
  name: string;
  email?: string | null;
};

type TypingUser = OnlineUser & {
  expiresAt: number;
};

interface ChatPanelProps {
  threadId?: string | null;
  currentUser: {
    id: string;
    name: string;
    email?: string | null;
  };
  title?: string;
  subtitle?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

function normalizeMessage(message: ChatMessage, sender?: ChatSender): ChatMessage {
  return {
    ...message,
    createdAt: new Date(message.createdAt).toISOString(),
    updatedAt: new Date(message.updatedAt ?? message.createdAt).toISOString(),
    sender: message.sender ?? sender,
  };
}

function upsertMessage(messages: ChatMessage[], incoming: ChatMessage) {
  const next = [...messages];
  const existingIndex = next.findIndex((message) => message.id === incoming.id);
  if (existingIndex >= 0) {
    next[existingIndex] = { ...next[existingIndex], ...incoming };
  } else {
    next.push(incoming);
  }

  return next.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function getInitials(name?: string | null, email?: string | null) {
  const value = name?.trim() || email?.trim() || "?";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function messageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function presenceToOnlineUsers(members: PresenceMessage[], currentUserId: string) {
  const users = new Map<string, OnlineUser>();

  for (const member of members) {
    if (!member.clientId || member.clientId === currentUserId) continue;
    const data = member.data as Partial<OnlineUser> | undefined;
    users.set(member.clientId, {
      id: member.clientId,
      name: data?.name || "Teammate",
      email: data?.email ?? null,
    });
  }

  return Array.from(users.values());
}

function playMessageSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(980, audioContext.currentTime + 0.08);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch {
    // Browsers may block audio until the user has interacted with the page.
  }
}

export function ChatPanel({
  threadId,
  currentUser,
  title = "Live chat",
  subtitle = "Workspace conversation",
  className,
  placeholder = "Write a message...",
  disabled = false,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState("idle");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser>>({});
  const [readReceipts, setReadReceipts] = useState<Record<string, ReadReceiptPayload>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastReadMessageIdRef = useRef<string | null>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const typingStopTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  const canSend = Boolean(threadId) && !disabled && draft.trim().length > 0 && !sending;

  const channelName = useMemo(() => {
    return threadId ? ablyChannels.threadMessages(threadId) : null;
  }, [threadId]);

  const typingChannelName = useMemo(() => {
    return threadId ? ablyChannels.threadTyping(threadId) : null;
  }, [threadId]);

  const latestOwnMessage = useMemo(() => {
    return [...messages].reverse().find((message) => message.senderId === currentUser.id) ?? null;
  }, [currentUser.id, messages]);

  const latestOwnMessageSeenCount = useMemo(() => {
    if (!latestOwnMessage) return 0;
    const latestOwnCreatedAt = new Date(latestOwnMessage.createdAt).getTime();

    return Object.values(readReceipts).filter((receipt) => {
      if (!receipt.userId || receipt.userId === currentUser.id || !receipt.lastReadAt) return false;
      return new Date(receipt.lastReadAt).getTime() >= latestOwnCreatedAt;
    }).length;
  }, [currentUser.id, latestOwnMessage, readReceipts]);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers({});
      setReadReceipts({});
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
          cache: "no-store",
        });
        const data = await parseJsonResponse<{ messages?: ChatMessage[]; error?: string }>(res);
        if (!res.ok) throw new Error(data.error || "Failed to load messages");
        if (!cancelled) {
          setMessages((data.messages ?? []).map((message: ChatMessage) => normalizeMessage(message)));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [threadId]);

  useEffect(() => {
    if (!threadId || !channelName || !typingChannelName) return;

    let closed = false;
    const realtime = new Realtime({
      authUrl: "/api/ably/token",
      clientId: currentUser.id,
    });
    const channel = realtime.channels.get(channelName);
    const typingChannel = realtime.channels.get(typingChannelName);
    typingChannelRef.current = typingChannel;

    async function refreshPresence() {
      try {
        const members = await channel.presence.get();
        if (!closed) setOnlineUsers(presenceToOnlineUsers(members, currentUser.id));
      } catch {
        // Presence is a progressive enhancement; keep chat usable if it fails.
      }
    }

    const onMessageCreated = (message: InboundMessage) => {
      const payload = message.data as MessageCreatedPayload;
      if (!payload?.message) return;
      const normalized = normalizeMessage(payload.message, payload.sender);
      setMessages((prev) => upsertMessage(prev, normalized));
      if (normalized.senderId !== currentUser.id) {
        playMessageSound();
        window.dispatchEvent(new Event("chat-unread-change"));
      }
    };

    const onReceiptUpdated = (message: InboundMessage) => {
      const payload = message.data as ReadReceiptPayload;
      if (!payload?.userId) return;
      setReadReceipts((prev) => ({ ...prev, [payload.userId!]: payload }));
    };

    const onPresenceChange = () => {
      void refreshPresence();
    };

    const onTypingStarted = (message: InboundMessage) => {
      const payload = message.data as Partial<TypingUser> | undefined;
      const userId = payload?.id;
      if (!userId || userId === currentUser.id) return;
      setTypingUsers((prev) => ({
        ...prev,
        [userId]: {
          id: userId,
          name: payload.name || "Teammate",
          email: payload.email ?? null,
          expiresAt: Date.now() + 3000,
        },
      }));
    };

    const onTypingStopped = (message: InboundMessage) => {
      const payload = message.data as Partial<TypingUser> | undefined;
      if (!payload?.id) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[payload.id!];
        return next;
      });
    };

    realtime.connection.on((stateChange) => {
      if (!closed) setConnectionState(stateChange.current);
    });

    channel.subscribe("message.created", onMessageCreated).catch((err) => {
      if (!closed) setError(err instanceof Error ? err.message : "Failed to subscribe to chat");
    });
    channel.subscribe("receipt.updated", onReceiptUpdated).catch(() => undefined);
    channel.presence.subscribe(onPresenceChange).then(refreshPresence).catch(() => undefined);
    channel.presence.enter({ id: currentUser.id, name: currentUser.name, email: currentUser.email }).then(refreshPresence).catch(() => undefined);
    typingChannel.subscribe("typing.started", onTypingStarted).catch(() => undefined);
    typingChannel.subscribe("typing.stopped", onTypingStopped).catch(() => undefined);

    return () => {
      closed = true;
      typingChannelRef.current = null;
      channel.unsubscribe("message.created", onMessageCreated);
      channel.unsubscribe("receipt.updated", onReceiptUpdated);
      channel.presence.unsubscribe(onPresenceChange);
      typingChannel.unsubscribe("typing.started", onTypingStarted);
      typingChannel.unsubscribe("typing.stopped", onTypingStopped);
      channel.presence.leave({ id: currentUser.id }).catch(() => undefined);
      realtime.close();
    };
  }, [channelName, currentUser.email, currentUser.id, currentUser.name, threadId, typingChannelName]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const next = Object.fromEntries(
          Object.entries(prev).filter(([, user]) => user.expiresAt > now)
        );
        return Object.keys(next).length === Object.keys(prev).length ? prev : next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const typingChannel = typingChannelRef.current;
    if (!threadId || disabled || !typingChannel) return;

    if (typingStopTimeoutRef.current) {
      window.clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }

    async function stopTyping() {
      if (!isTypingRef.current || !typingChannelRef.current) return;
      isTypingRef.current = false;
      await typingChannelRef.current.publish("typing.stopped", {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      }).catch(() => undefined);
    }

    if (draft.trim()) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        typingChannel.publish("typing.started", {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        }).catch(() => undefined);
      }
      typingStopTimeoutRef.current = window.setTimeout(() => void stopTyping(), 1500);
    } else {
      void stopTyping();
    }

    return () => {
      if (typingStopTimeoutRef.current) {
        window.clearTimeout(typingStopTimeoutRef.current);
        typingStopTimeoutRef.current = null;
      }
    };
  }, [currentUser.email, currentUser.id, currentUser.name, disabled, draft, threadId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!threadId || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastReadMessageIdRef.current === lastMessage.id) return;

    lastReadMessageIdRef.current = lastMessage.id;
    fetch(`/api/chat/threads/${threadId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: lastMessage.id }),
    })
      .then(() => window.dispatchEvent(new Event("chat-unread-change")))
      .catch(() => {
        lastReadMessageIdRef.current = null;
      });
  }, [messages, threadId]);

  async function handleSend(event?: FormEvent) {
    event?.preventDefault();
    if (!threadId || !canSend) return;

    const body = draft.trim();
    const clientNonce = crypto.randomUUID();
    setSending(true);
    setError(null);

    if (isTypingRef.current && typingChannelRef.current) {
      isTypingRef.current = false;
      typingChannelRef.current.publish("typing.stopped", {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      }).catch(() => undefined);
    }

    try {
      const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, clientNonce }),
      });
      const data = await parseJsonResponse<{ message?: ChatMessage; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      if (!data.message) throw new Error("Message was not returned by the server");

      const sent = normalizeMessage(data.message, {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      });
      setMessages((prev) => upsertMessage(prev, sent));
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  const connectionOnline = connectionState === "connected";
  const typingList = Object.values(typingUsers);

  return (
    <section className={cn("rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden", className)}>
      <div className="relative border-b border-[hsl(var(--border))] bg-[linear-gradient(135deg,hsl(var(--muted)/0.55),hsl(var(--card))_58%,hsl(var(--accent)/0.35))] px-4 py-4">
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.7)] px-2 py-1 text-[10px] font-medium text-[hsl(var(--muted-foreground))] backdrop-blur">
          {connectionOnline ? <Signal className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3" />}
          {connectionOnline ? "Live" : connectionState}
        </div>
        <div className="flex items-center gap-3 pr-20">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-sm">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight text-[hsl(var(--foreground))]">{title}</h3>
            <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{subtitle}</p>
          </div>
        </div>
        {onlineUsers.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
            <Users className="h-3 w-3" />
            <span>{onlineUsers.length} online</span>
            <div className="flex -space-x-1.5">
              {onlineUsers.slice(0, 4).map((user) => (
                <div key={user.id} title={user.name} className="flex h-5 w-5 items-center justify-center rounded-full border border-[hsl(var(--card))] bg-emerald-100 text-[8px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {getInitials(user.name, user.email)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex h-[420px] flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {!threadId ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--muted))]">
                <MessageCircle className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">No chat selected</p>
              <p className="mt-1 max-w-56 text-xs text-[hsl(var(--muted-foreground))]">Open a workspace chat or start a DM to begin.</p>
            </div>
          ) : loading ? (
            <div className="flex h-full items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
              <Spinner className="mr-2" /> Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 rounded-full border border-dashed border-[hsl(var(--border))] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">
                Fresh channel
              </div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Start the conversation</p>
              <p className="mt-1 max-w-60 text-xs text-[hsl(var(--muted-foreground))]">Messages are saved in Neon and delivered live with Ably.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isMine = message.senderId === currentUser.id;
                const senderName = isMine ? currentUser.name : message.sender?.name || message.sender?.email || "Teammate";
                const isLatestOwnMessage = latestOwnMessage?.id === message.id;

                return (
                  <div key={message.id} className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}>
                    {!isMine && (
                      <div className="mt-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                        {getInitials(senderName, message.sender?.email)}
                      </div>
                    )}
                    <div className={cn("max-w-[82%]", isMine && "text-right")}>
                      <div className={cn("mb-1 flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]", isMine && "justify-end")}>
                        <span className="font-medium">{senderName}</span>
                        <span>{messageTime(message.createdAt)}</span>
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words",
                          isMine
                            ? "rounded-br-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                            : "rounded-bl-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                        )}
                        title={formatDate(message.createdAt)}
                      >
                        {message.body}
                      </div>
                      {isMine && isLatestOwnMessage && latestOwnMessageSeenCount > 0 && (
                        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                          <CheckCheck className="h-3 w-3 text-emerald-500" />
                          Seen by {latestOwnMessageSeenCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {typingList.length > 0 && (
          <div className="mx-4 mb-3 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex gap-1 rounded-full bg-[hsl(var(--muted))] px-2 py-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
            </span>
            <span>{typingList.length === 1 ? `${typingList[0].name} is typing` : `${typingList.length} people are typing`}</span>
          </div>
        )}

        {error && (
          <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background)/0.55)] p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={!threadId || disabled || sending}
              className="max-h-32 min-h-11 resize-none rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm shadow-none"
            />
            <Button type="submit" size="icon" disabled={!canSend} className="h-11 w-11 shrink-0 rounded-xl">
              {sending ? <Spinner /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">Press Enter to send · Shift+Enter for a new line</p>
        </form>
      </div>
    </section>
  );
}

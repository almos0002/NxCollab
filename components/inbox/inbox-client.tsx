"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Mail, MailOpen, Trash2, CheckCheck, Bell, UserPlus, ShieldAlert, UserMinus, FileX, FilePlus, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  metadata: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  workspace_invite: UserPlus,
  role_changed: ShieldAlert,
  member_removed: UserMinus,
  canvas_deleted: FileX,
  canvas_created: FilePlus,
  member_joined: Users,
  general: Bell,
};

const typeColors: Record<string, string> = {
  workspace_invite: "text-[hsl(var(--success))]",
  role_changed: "text-[hsl(var(--warning))]",
  member_removed: "text-[hsl(var(--destructive))]",
  canvas_deleted: "text-[hsl(var(--destructive))]",
  canvas_created: "text-[hsl(var(--success))]",
  member_joined: "text-[hsl(var(--info,220_90%_56%))]",
  general: "text-[hsl(var(--muted-foreground))]",
};

interface InboxClientProps {
  initialNotifications: Notification[];
}

export function InboxClient({ initialNotifications }: InboxClientProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);

  const filtered = filter === "unread" ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setMarkingAll(false);
  }

  async function deleteNotification(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  async function handleClick(notification: Notification) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === "all" ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === "unread" ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">
            {filter === "unread" ? "No unread notifications" : "Your inbox is empty"}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {filter === "unread" ? "You're all caught up!" : "Notifications about invites, role changes, and workspace activity will appear here."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden divide-y divide-[hsl(var(--border))]">
          {filtered.map(notification => {
            const Icon = typeIcons[notification.type] ?? Bell;
            const iconColor = typeColors[notification.type] ?? typeColors.general;

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3.5 px-5 py-4 transition-colors group ${!notification.isRead ? "bg-[hsl(var(--accent)/0.3)]" : "hover:bg-[hsl(var(--accent)/0.15)]"}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${!notification.isRead ? "bg-[hsl(var(--foreground)/0.08)]" : "bg-[hsl(var(--muted))]"}`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${!notification.isRead ? "font-semibold text-[hsl(var(--foreground))]" : "font-medium text-[hsl(var(--foreground))]"}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[hsl(var(--foreground))] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1.5 opacity-70">{formatDate(notification.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notification.link && (
                        <button
                          onClick={() => handleClick(notification)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
                          title="Open"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
                          title="Mark as read"
                        >
                          <MailOpen className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

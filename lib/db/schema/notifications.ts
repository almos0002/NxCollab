import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const notificationTypeEnum = pgEnum("notification_type", [
  "workspace_invite",
  "role_changed",
  "member_removed",
  "canvas_deleted",
  "canvas_created",
  "member_joined",
  "general",
]);

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull().default("general"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  metadata: text("metadata"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;

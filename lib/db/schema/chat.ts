import { index, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { workspacesTable } from "./workspaces";

export const chatThreadTypeEnum = pgEnum("chat_thread_type", ["workspace", "dm"]);

export const chatThreadsTable = pgTable(
  "chat_threads",
  {
    id: text("id").primaryKey(),
    type: chatThreadTypeEnum("type").notNull(),
    workspaceId: text("workspace_id").references(() => workspacesTable.id, {
      onDelete: "cascade",
    }),
    dmKey: text("dm_key").unique(),
    createdBy: text("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    lastMessageAt: timestamp("last_message_at"),
  },
  (table) => [
    uniqueIndex("chat_threads_workspace_id_unique").on(table.workspaceId),
    index("chat_threads_last_message_at_idx").on(table.lastMessageAt),
  ]
);

export const chatMessagesTable = pgTable(
  "chat_messages",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => chatThreadsTable.id, { onDelete: "cascade" }),
    senderId: text("sender_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    metadata: jsonb("metadata"),
    clientNonce: text("client_nonce"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("chat_messages_thread_created_at_idx").on(table.threadId, table.createdAt),
    index("chat_messages_sender_id_idx").on(table.senderId),
    uniqueIndex("chat_messages_thread_client_nonce_unique").on(table.threadId, table.clientNonce),
  ]
);

export const chatParticipantsTable = pgTable(
  "chat_participants",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => chatThreadsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    lastReadMessageId: text("last_read_message_id").references(() => chatMessagesTable.id, {
      onDelete: "set null",
    }),
    lastReadAt: timestamp("last_read_at"),
    mutedAt: timestamp("muted_at"),
  },
  (table) => [
    uniqueIndex("chat_participants_thread_user_unique").on(table.threadId, table.userId),
    index("chat_participants_user_id_idx").on(table.userId),
  ]
);

export type ChatThread = typeof chatThreadsTable.$inferSelect;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
export type ChatParticipant = typeof chatParticipantsTable.$inferSelect;

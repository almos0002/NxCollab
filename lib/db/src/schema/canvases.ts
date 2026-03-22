import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { workspacesTable } from "./workspaces";
import { usersTable } from "./users";

export const canvasesTable = pgTable("canvases", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspacesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").default("{}"),
  thumbnail: text("thumbnail"),
  createdBy: text("created_by")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  updatedBy: text("updated_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const canvasVersionsTable = pgTable("canvas_versions", {
  id: text("id").primaryKey(),
  canvasId: text("canvas_id")
    .notNull()
    .references(() => canvasesTable.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  createdBy: text("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLogsTable = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspacesTable.id, { onDelete: "cascade" }),
  canvasId: text("canvas_id").references(() => canvasesTable.id, {
    onDelete: "set null",
  }),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Canvas = typeof canvasesTable.$inferSelect;
export type CanvasVersion = typeof canvasVersionsTable.$inferSelect;
export type ActivityLog = typeof activityLogsTable.$inferSelect;

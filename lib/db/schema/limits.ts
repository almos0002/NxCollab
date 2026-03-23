import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userLimitsTable = pgTable("user_limits", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  workspaceLimit: integer("workspace_limit"),
  canvasPerWorkspaceLimit: integer("canvas_per_workspace_limit"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserLimit = typeof userLimitsTable.$inferSelect;

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const appSettingsTable = pgTable("app_settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AppSetting = typeof appSettingsTable.$inferSelect;

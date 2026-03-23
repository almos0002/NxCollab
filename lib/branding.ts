import { db } from "@/lib/db";
import { appSettingsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export interface Branding {
  siteName: string;
  siteLogo: string;
  siteFavicon: string;
}

export async function getBranding(): Promise<Branding> {
  const keys = ["site_name", "site_logo", "site_favicon"] as const;
  const settings: Record<string, string> = {};
  for (const key of keys) {
    const row = await db
      .select()
      .from(appSettingsTable)
      .where(eq(appSettingsTable.key, key))
      .limit(1);
    if (row[0]) settings[key] = row[0].value;
  }
  return {
    siteName: settings.site_name || "Canvas",
    siteLogo: settings.site_logo || "",
    siteFavicon: settings.site_favicon || "/favicon.svg",
  };
}

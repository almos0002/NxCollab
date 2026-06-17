import { db } from "@/lib/db";
import { appSettingsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export interface Branding {
  siteName: string;
  siteLogo: string;
  siteFavicon: string;
}

const DEFAULT_BRANDING: Branding = {
  siteName: "Canvas",
  siteLogo: "",
  siteFavicon: "/favicon.svg",
};
export async function getBranding(): Promise<Branding> {
  if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
    return DEFAULT_BRANDING;
  }

  try {
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
      siteName: settings.site_name || DEFAULT_BRANDING.siteName,
      siteLogo: settings.site_logo || DEFAULT_BRANDING.siteLogo,
      siteFavicon: settings.site_favicon || DEFAULT_BRANDING.siteFavicon,
    };
  } catch (error) {
    console.warn("Using default branding because database branding lookup failed", error);
    return DEFAULT_BRANDING;
}
}

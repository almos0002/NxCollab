import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { appSettingsTable } from "@/lib/db";
import { inArray } from "drizzle-orm";

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

const BRANDING_KEYS = ["site_name", "site_logo", "site_favicon"] as const;

async function loadBranding(): Promise<Branding> {
  if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
    return DEFAULT_BRANDING;
  }

  try {
    const rows = await db
      .select({ key: appSettingsTable.key, value: appSettingsTable.value })
      .from(appSettingsTable)
      .where(inArray(appSettingsTable.key, BRANDING_KEYS));

    const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));

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

export const getBranding = unstable_cache(loadBranding, ["branding"], {
  tags: ["branding"],
  revalidate: 3600,
});

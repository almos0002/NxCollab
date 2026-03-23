import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { db } from "@/lib/db";
import { appSettingsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

async function getBrandingSettings() {
  const keys = ["site_name", "site_favicon", "site_logo"] as const;
  const settings: Record<string, string> = {};
  for (const key of keys) {
    const row = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, key)).limit(1);
    if (row[0]) settings[key] = row[0].value;
  }
  return settings;
}

export async function generateMetadata() {
  const branding = await getBrandingSettings();
  const siteName = branding.site_name || "Canvas";
  const favicon = branding.site_favicon || "/favicon.svg";

  return {
    title: `${siteName} — Collaborative Workspace`,
    description: "Real-time collaborative canvas for teams",
    icons: { icon: favicon },
  };
}

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'system';
    var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getBranding } from "@/lib/branding";

export async function generateMetadata() {
  const { siteName, siteFavicon } = await getBranding();

  return {
    title: {
      template: `%s — ${siteName}`,
      default: `${siteName} — Collaborative Workspace`,
    },
    description: "Real-time collaborative canvas for teams",
    icons: { icon: siteFavicon },
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
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

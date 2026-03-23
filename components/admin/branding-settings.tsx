"use client";
import { useState } from "react";
import { Globe, Image, Type, Save, Loader2 } from "lucide-react";

interface BrandingSettingsProps {
  initialSettings: {
    site_name: string;
    site_favicon: string;
    site_logo: string;
  };
}

export function BrandingSettings({ initialSettings }: BrandingSettingsProps) {
  const [siteName, setSiteName] = useState(initialSettings.site_name);
  const [siteFavicon, setSiteFavicon] = useState(initialSettings.site_favicon);
  const [siteLogo, setSiteLogo] = useState(initialSettings.site_logo);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_name: siteName, site_favicon: siteFavicon, site_logo: siteLogo }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSaving(false);
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
          <Globe className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Branding & Appearance</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Customize site name, favicon, and logo</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">
            <Type className="w-3.5 h-3.5" /> Site Name
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Canvas"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-shadow"
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Displayed in the browser tab and header</p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">
            <Image className="w-3.5 h-3.5" /> Favicon URL
          </label>
          <input
            type="text"
            value={siteFavicon}
            onChange={(e) => setSiteFavicon(e.target.value)}
            placeholder="/favicon.svg"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-shadow"
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">URL or path to the favicon image (e.g. /favicon.svg)</p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">
            <Image className="w-3.5 h-3.5" /> Logo URL
          </label>
          <input
            type="text"
            value={siteLogo}
            onChange={(e) => setSiteLogo(e.target.value)}
            placeholder="/logo.png"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-shadow"
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">URL or path to the site logo (displayed in sidebar)</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          {saved && <span className="text-xs text-[hsl(var(--success))] font-medium">Settings saved successfully</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Saving..." : "Save Branding"}
        </button>
      </div>
    </div>
  );
}

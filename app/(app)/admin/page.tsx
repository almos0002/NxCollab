import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Admin — Canvas" };
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { usersTable, appSettingsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { AdminActions } from "@/components/admin/admin-actions";
import { BrandingSettings } from "@/components/admin/branding-settings";
import { Shield, Users, UserCheck } from "lucide-react";

export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  const signupSetting = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "signup_disabled")).limit(1);
  const signupDisabled = signupSetting[0]?.value === "true";

  const brandingKeys = ["site_name", "site_favicon", "site_logo"] as const;
  const brandingSettings: Record<string, string> = { site_name: "", site_favicon: "", site_logo: "" };
  for (const key of brandingKeys) {
    const row = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, key)).limit(1);
    if (row[0]) brandingSettings[key] = row[0].value;
  }

  const stats = [
    { label: "Total Users", value: users.length, icon: Users },
    { label: "Admins", value: users.filter(u => u.isAdmin).length, icon: Shield },
    { label: "Sign-up", value: signupDisabled ? "Closed" : "Open", icon: UserCheck },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage users, settings, and system configuration</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-6">
        <BrandingSettings initialSettings={{ site_name: brandingSettings.site_name, site_favicon: brandingSettings.site_favicon, site_logo: brandingSettings.site_logo }} />
        <AdminActions signupDisabled={signupDisabled} currentUserId={session.user.id} users={users.map(u => ({ id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin ?? false, createdAt: u.createdAt.toISOString() }))} />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { db } from "@workspace/db";
import { usersTable, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { AdminActions } from "@/components/admin/admin-actions";

export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  const signupSetting = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "signup_disabled")).limit(1);
  const signupDisabled = signupSetting[0]?.value === "true";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Admin Dashboard</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage users, settings, and system configuration</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ label: "Total Users", value: users.length }, { label: "Admins", value: users.filter(u => u.isAdmin).length }, { label: "Sign-up", value: signupDisabled ? "Disabled" : "Open" }].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">{label}</p>
            <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{value}</p>
          </div>
        ))}
      </div>
      <AdminActions signupDisabled={signupDisabled} users={users.map(u => ({ id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin ?? false, createdAt: u.createdAt.toISOString() }))} />
    </div>
  );
}

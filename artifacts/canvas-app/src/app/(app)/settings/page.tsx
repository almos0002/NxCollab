import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Settings — Canvas" };
import { getServerSession } from "@/lib/session";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const user = await db.select().from(usersTable).where(eq(usersTable.id, session.user.id)).limit(1);
  if (!user[0]) redirect("/auth/sign-in");

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Settings</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage your account settings</p>
      </div>
      <SettingsForm user={{ id: user[0].id, name: user[0].name, email: user[0].email }} />
    </div>
  );
}

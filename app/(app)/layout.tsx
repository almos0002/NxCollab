import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { Sidebar } from "@/components/sidebar";
import { db } from "@/lib/db";
import { usersTable, appSettingsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const user = await db.select().from(usersTable).where(eq(usersTable.id, session.user.id)).limit(1);
  const userData = user[0];

  const logoRow = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "site_logo")).limit(1);
  const nameRow = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "site_name")).limit(1);
  const siteLogo = logoRow[0]?.value || "";
  const siteName = nameRow[0]?.value || "";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={{ name: userData?.name ?? "User", email: userData?.email ?? "", image: userData?.image ?? null, isAdmin: userData?.isAdmin ?? false }} siteLogo={siteLogo} siteName={siteName} />
      <main className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">{children}</main>
    </div>
  );
}

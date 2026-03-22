import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { Sidebar } from "@/components/sidebar";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const user = await db.select().from(usersTable).where(eq(usersTable.id, session.user.id)).limit(1);
  const userData = user[0];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={{ name: userData?.name ?? "User", email: userData?.email ?? "", isAdmin: userData?.isAdmin ?? false }} />
      <main className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">{children}</main>
    </div>
  );
}

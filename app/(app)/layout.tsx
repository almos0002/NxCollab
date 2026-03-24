import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { getServerSession } from "@/lib/session";
import { Sidebar } from "@/components/sidebar";
import { SidebarSkeleton } from "@/components/sidebar-skeleton";
import { getBranding } from "@/lib/branding";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";

async function SidebarData({ userId, initialCollapsed }: { userId: string; initialCollapsed: boolean }) {
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const userData = user[0];
  const { siteName, siteLogo } = await getBranding();

  return (
    <Sidebar
      user={{ name: userData?.name ?? "User", email: userData?.email ?? "", image: userData?.image ?? null, isAdmin: userData?.isAdmin ?? false }}
      siteLogo={siteLogo}
      siteName={siteName}
      initialCollapsed={initialCollapsed}
    />
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const cookieStore = await cookies();
  const collapsed = cookieStore.get("sidebar-collapsed")?.value === "true";

  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={<SidebarSkeleton collapsed={collapsed} />}>
        <SidebarData userId={session.user.id} initialCollapsed={collapsed} />
      </Suspense>
      <main className="flex-1 overflow-y-auto bg-[hsl(var(--background))] min-w-0">{children}</main>
    </div>
  );
}

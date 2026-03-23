import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { TrashPageClient } from "@/components/trash/trash-page-client";

export const metadata: Metadata = { title: "Trash — Canvas" };

export default async function TrashPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  return <TrashPageClient />;
}

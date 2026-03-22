import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getServerSession();
  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/auth/sign-in");
  }
}

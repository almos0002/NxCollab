import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { db } from "@workspace/db";
import { appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export default async function SignUpPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

  let signupDisabled = false;
  try {
    const setting = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "signup_disabled")).limit(1);
    signupDisabled = setting[0]?.value === "true";
  } catch {}

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--foreground))] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1" fill="hsl(var(--background))"/>
              <rect x="13" y="3" width="8" height="8" rx="1" fill="hsl(var(--background))"/>
              <rect x="3" y="13" width="8" height="8" rx="1" fill="hsl(var(--background))"/>
              <rect x="13" y="13" width="8" height="8" rx="1" fill="hsl(var(--background))"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Create an account</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Start collaborating today</p>
        </div>
        {signupDisabled ? (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-6 text-center">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Registration is currently disabled</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Contact an administrator to get access.</p>
          </div>
        ) : <SignUpForm />}
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
          Already have an account?{" "}
          <a href="/auth/sign-in" className="text-[hsl(var(--foreground))] font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}

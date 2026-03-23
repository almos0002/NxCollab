import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getBranding } from "@/lib/branding";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { db } from "@/lib/db";
import { appSettingsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";

export async function generateMetadata() {
  return { title: "Sign Up" };
}

export default async function SignUpPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

  const { siteName, siteLogo } = await getBranding();

  let signupDisabled = false;
  try {
    const setting = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "signup_disabled")).limit(1);
    signupDisabled = setting[0]?.value === "true";
  } catch {}

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className="w-8 h-8 rounded-lg object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                  </svg>
                </div>
              )}
              <span className="font-semibold text-sm text-[hsl(var(--foreground))]">{siteName}</span>
            </Link>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Create an account</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5">Start collaborating with your team today</p>
          </div>
          {signupDisabled ? (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] p-6 text-center">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Registration is currently closed</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Contact an administrator to get access.</p>
            </div>
          ) : <SignUpForm />}
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-6">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-[hsl(var(--foreground))] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center border-l border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
        <div className="text-center max-w-sm px-8">
          <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-6">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="w-10 h-10 rounded-xl object-contain" />
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--muted-foreground))"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--muted-foreground))"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--muted-foreground))"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--muted-foreground))"/>
              </svg>
            )}
          </div>
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">Your ideas, together</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">Create workspaces, invite your team, and start building visual artifacts in real-time.</p>
        </div>
      </div>
    </div>
  );
}

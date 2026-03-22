import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { SignInForm } from "@/components/auth/sign-in-form";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign In — Canvas" };

export default async function SignInPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                </svg>
              </div>
              <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Canvas</span>
            </Link>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Welcome back</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5">Sign in to your account to continue</p>
          </div>
          <SignInForm />
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-[hsl(var(--foreground))] font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center border-l border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
        <div className="text-center max-w-sm px-8">
          <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--muted-foreground))"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--muted-foreground))"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--muted-foreground))"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--muted-foreground))"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">Collaborate visually</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">Sketch, diagram, and brainstorm together with your team on an infinite canvas.</p>
        </div>
      </div>
    </div>
  );
}

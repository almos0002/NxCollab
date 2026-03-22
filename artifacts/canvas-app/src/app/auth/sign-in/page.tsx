import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

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
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Welcome back</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Sign in to your account</p>
        </div>
        <SignInForm />
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
          Don&apos;t have an account?{" "}
          <a href="/auth/sign-up" className="text-[hsl(var(--foreground))] font-medium hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}

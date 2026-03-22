"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Invalid credentials");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[hsl(var(--foreground))]">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email" className="w-full px-3 py-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-colors" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[hsl(var(--foreground))]">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" autoComplete="current-password" className="w-full px-3 py-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-colors" />
      </div>
      <button type="submit" disabled={loading} className="w-full py-2 px-4 text-sm font-medium rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity">
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        setError(result.error.message || "Failed to create account");
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
      {error && (
        <div className="rounded-lg bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.15)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[hsl(var(--foreground))]">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--ring)/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.15)] focus:border-[hsl(var(--ring)/0.4)] transition-all" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[hsl(var(--foreground))]">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--ring)/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.15)] focus:border-[hsl(var(--ring)/0.4)] transition-all" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[hsl(var(--foreground))]">Password</label>
        <div className="relative">
          <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min. 8 characters" className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--ring)/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.15)] focus:border-[hsl(var(--ring)/0.4)] transition-all" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full py-2.5 px-4 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity mt-2">
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

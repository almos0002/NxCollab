"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({ email, password, rememberMe });
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
    <form onSubmit={handleSubmit} className="ui-root space-y-5">
      {error && <div className="ui-notice">{error}</div>}
      <div>
        <label className="ui-field-label">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email" className="ui-field" />
      </div>
      <div>
        <label className="ui-field-label">Password</label>
        <div className="relative">
          <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" autoComplete="current-password" className="ui-field pr-10" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ui-text-2)" }}>
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <span className="relative flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="peer sr-only"
          />
          <span className="ui-check">
            {rememberMe && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="var(--ui-primary-contrast)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 6L5 8.5L9.5 3.5" />
              </svg>
            )}
          </span>
        </span>
        <span style={{ fontSize: "13.5px", color: "var(--ui-text-2)" }}>Remember me</span>
      </label>
      <button type="submit" disabled={loading} className="ui-btn-block">
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

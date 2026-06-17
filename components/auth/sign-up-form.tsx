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
    <form onSubmit={handleSubmit} className="ui-root space-y-5">
      {error && <div className="ui-notice">{error}</div>}
      <div>
        <label className="ui-field-label">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" className="ui-field" />
      </div>
      <div>
        <label className="ui-field-label">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="ui-field" />
      </div>
      <div>
        <label className="ui-field-label">Password</label>
        <div className="relative">
          <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min. 8 characters" className="ui-field pr-10" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ui-text-2)" }}>
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="ui-btn-block">
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

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

function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="24" height="24" stroke="var(--ui-text)" strokeWidth="1.5" />
      <path d="M7 17 L13 7 L19 17" stroke="var(--ui-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9.5" y1="13" x2="16.5" y2="13" stroke="var(--ui-text)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Tick({ className = "" }: { className?: string }) {
  return (
    <span className={`absolute select-none ${className}`} style={{ fontSize: "13px", lineHeight: 1, color: "var(--ui-border-strong)" }} aria-hidden="true">
      +
    </span>
  );
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
    <div className="ui-root min-h-screen grid lg:grid-cols-2" style={{ background: "var(--ui-bg)", color: "var(--ui-text)" }}>
      {/* form panel */}
      <div className="relative flex items-center justify-center px-6 py-16" style={{ borderRight: "1px solid var(--ui-border)" }}>
        <Tick className="left-3 top-3" />
        <Tick className="right-3 top-3" />
        <Tick className="left-3 bottom-3" />
        <Tick className="right-3 bottom-3" />

        <div className="w-full" style={{ maxWidth: "380px" }}>
          <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="w-7 h-7 object-contain" />
            ) : (
              <Mark size={26} />
            )}
            <span className="ui-serif" style={{ fontSize: "16px", fontWeight: 600 }}>{siteName}</span>
          </Link>

          <div className="mb-9">
            <span className="ui-mono uppercase block" style={{ fontSize: "11px", letterSpacing: "0.16em", color: "var(--ui-text-2)" }}>
              New sheet
            </span>
            <h1 className="ui-serif" style={{ marginTop: "12px", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.025em" }}>
              Create an account.
            </h1>
            <p style={{ marginTop: "12px", fontSize: "14.5px", lineHeight: 1.6, color: "var(--ui-text-2)" }}>
              Start drawing with your team in under a minute.
            </p>
          </div>

          {signupDisabled ? (
            <div className="ui-notice" style={{ padding: "20px", textAlign: "center", color: "var(--ui-text)", background: "var(--ui-surface)", borderColor: "var(--ui-border-strong)" }}>
              <p style={{ fontSize: "14px", fontWeight: 600 }}>Registration is currently closed</p>
              <p style={{ marginTop: "6px", fontSize: "13.5px", color: "var(--ui-text-2)" }}>Contact an administrator to get access.</p>
            </div>
          ) : <SignUpForm />}

          <p style={{ marginTop: "28px", fontSize: "14px", color: "var(--ui-text-2)" }}>
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="ui-link" style={{ color: "var(--ui-text)" }}>Sign in</Link>
          </p>
        </div>
      </div>

      {/* editorial aside */}
      <aside className="hidden lg:flex relative items-center justify-center px-12" style={{ background: "var(--ui-surface)" }}>
        <div style={{ maxWidth: "420px" }}>
          <span className="ui-mono uppercase block" style={{ fontSize: "11px", letterSpacing: "0.18em", color: "var(--ui-text-2)" }}>
            ◦ Your ideas, together
          </span>
          <p className="ui-serif" style={{ marginTop: "20px", fontSize: "clamp(26px, 2.6vw, 34px)", fontWeight: 500, lineHeight: 1.22, letterSpacing: "-0.02em" }}>
            Your team&apos;s next idea is{" "}
            <span className="italic" style={{ color: "var(--ui-primary)" }}>probably a drawing</span>.
          </p>
          <p style={{ marginTop: "20px", fontSize: "14.5px", lineHeight: 1.65, color: "var(--ui-text-2)", maxWidth: "40ch" }}>
            Spin up a workspace, invite the right people, and build visual artifacts together in real-time.
          </p>

          <div className="ui-mono uppercase flex flex-wrap gap-x-4 gap-y-2" style={{ marginTop: "32px", fontSize: "11px", letterSpacing: "0.1em", color: "var(--ui-text-2)" }}>
            {["Free workspace", "No card", "50 versions back"].map((t, i) => (
              <span key={t} className="inline-flex items-center gap-4">
                {i > 0 && <span style={{ color: "var(--ui-border-strong)" }}>/</span>}
                {t}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

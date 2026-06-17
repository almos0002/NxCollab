import Link from "next/link";
import { Suspense } from "react";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getBranding } from "@/lib/branding";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export async function generateMetadata() {
  const { siteName } = await getBranding();
  return { title: { absolute: `${siteName} — Collaborative Workspace` } };
}

/* ─────────────────────────────────────────────────────────────
   Brand mark — a small drafted square
   ───────────────────────────────────────────────────────────── */
function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="24" height="24" rx="5" stroke="var(--ui-text)" strokeWidth="1.5" />
      <path d="M7 17 L13 7 L19 17" stroke="var(--ui-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9.5" y1="13" x2="16.5" y2="13" stroke="var(--ui-text)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* Hand-drawn red-pen underline that draws itself in */
function PenUnderline() {
  return (
    <svg
      className="absolute left-[-2%] w-[104%] pointer-events-none"
      style={{ bottom: "-0.28em", height: "0.42em" }}
      viewBox="0 0 300 20"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 13 C 52 6, 96 16, 150 10 C 208 4, 246 17, 296 8"
        stroke="var(--ui-primary)"
        strokeWidth="4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* Hand-drawn strike-through — crosses a word out like an editor's redline */
function PenStrike() {
  return (
    <svg
      className="absolute left-[-3%] w-[106%] pointer-events-none"
      style={{ top: "46%", height: "0.5em" }}
      viewBox="0 0 300 20"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 11 C 60 7, 110 14, 168 9 C 220 5, 256 13, 297 10"
        stroke="var(--ui-primary)"
        strokeWidth="3.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* Corner registration tick (`+`) — a draftsman's crop mark */
function Tick({ className = "" }: { className?: string }) {
  return (
    <span
      className={`ui-mono absolute select-none ${className}`}
      style={{ fontSize: "13px", lineHeight: 1, color: "var(--ui-border-strong)" }}
      aria-hidden="true"
    >
      +
    </span>
  );
}

async function AuthRedirect() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");
  return null;
}

/* ─────────────────────────────────────────────────────────────
   Landing page — "the drafting sheet"
   ───────────────────────────────────────────────────────────── */
export default async function LandingPage() {
  const { siteName, siteLogo } = await getBranding();

  const capabilities = [
    {
      n: "01",
      title: "An infinite canvas",
      tag: "Excalidraw",
      body:
        "A boundless drawing surface. Zoom out to the whole system, in to a single arrow. Nothing pushes you to tidy up before you're ready.",
    },
    {
      n: "02",
      title: "Everyone, live",
      tag: "Real-time",
      body:
        "Cursors, selections and edits land the instant they happen. You always know who is touching what — no refresh, no merge conflicts.",
    },
    {
      n: "03",
      title: "Encrypted end to end",
      tag: "AES-GCM",
      body:
        "Boards are sealed with AES-GCM. The server only ever holds ciphertext; the key stays with your team. Privacy by construction, not policy.",
    },
    {
      n: "04",
      title: "Nothing is ever lost",
      tag: "50 versions",
      body:
        "Every save is a snapshot. Walk back through the last fifty and restore any one of them with a single click. Mistakes are reversible here.",
    },
    {
      n: "05",
      title: "Rooms to work in",
      tag: "Workspaces",
      body:
        "Group boards by team or project, invite the right people, and keep the noise out. One tidy home for everything in flight.",
    },
    {
      n: "06",
      title: "Exactly enough access",
      tag: "Roles",
      body:
        "Owner, admin, member, viewer. Hand out precisely as much power as you mean to — and take it back just as easily.",
    },
  ];

  const steps = [
    { n: "01", t: "Open a workspace", d: "Name it, describe it, done. Thirty seconds at most." },
    { n: "02", t: "Pull people in", d: "Share one link or send a direct invite. They pick a role and they're on the board." },
    { n: "03", t: "Start drawing", d: "Everyone on the same canvas, right now. Every stroke is saved as you go." },
  ];

  return (
    <div className="ui-root min-h-screen" style={{ background: "var(--ui-bg)", color: "var(--ui-text)" }}>
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      {/* ── Header ───────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: "58px",
          background: "color-mix(in srgb, var(--ui-bg) 85%, transparent)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--ui-border)",
        }}
      >
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            {siteLogo ? <img src={siteLogo} alt={siteName} className="w-6 h-6 object-contain" /> : <Mark size={24} />}
            <span className="ui-serif" style={{ fontSize: "19px", fontWeight: 600, letterSpacing: "-0.01em" }}>
              {siteName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 ui-mono" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            <a href="#capabilities" className="ui-btn-ghost uppercase">Capabilities</a>
            <a href="#process" className="ui-btn-ghost uppercase">How it works</a>
          </nav>

          <div className="flex items-center gap-5">
            <Link href="/auth/sign-in" className="ui-btn-ghost ui-mono uppercase hidden sm:inline" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="ui-btn-primary ui-mono inline-flex items-center gap-2 uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, padding: "9px 16px", borderRadius: "var(--ui-r-control)" }}
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: "58px" }}>
        {/* The sheet — ledger margin rules run the full height */}
        <div
          className="max-w-6xl mx-auto"
          style={{ borderLeft: "1px solid var(--ui-border)", borderRight: "1px solid var(--ui-border)" }}
        >
          {/* ── Hero ───────────────────────────────────────────── */}
          <section className="relative px-6 sm:px-10" style={{ paddingTop: "84px", paddingBottom: "76px", borderBottom: "1px solid var(--ui-border)" }}>
            <Tick className="left-2.5 top-2.5" />
            <Tick className="right-2.5 top-2.5" />

            <div className="relative text-center">
              {/* kicker */}
              <p className="ui-mono uppercase" style={{ fontSize: "11px", letterSpacing: "0.18em", color: "var(--ui-text-2)" }}>
                <span style={{ color: "var(--ui-primary)" }}>◦</span>&nbsp; A collaborative canvas for teams who think out loud
              </p>

              {/* headline */}
              <h1
                className="ui-serif mx-auto"
                style={{ marginTop: "26px", fontSize: "clamp(40px, 7vw, 82px)", fontWeight: 500, lineHeight: 1.02, letterSpacing: "-0.025em", maxWidth: "16ch" }}
              >
                A shared canvas for teams who{" "}
                <span className="relative whitespace-nowrap italic" style={{ fontWeight: 500 }}>
                  think by drawing
                  <PenUnderline />
                </span>
                .
              </h1>

              {/* subhead */}
              <p
                className="mx-auto"
                style={{ marginTop: "30px", fontSize: "clamp(15px, 1.5vw, 18px)", lineHeight: 1.6, color: "var(--ui-text-2)", maxWidth: "52ch" }}
              >
                Infinite space to sketch ideas, map systems and shape decisions together — live, with
                everyone in the room. Encrypted, versioned, and entirely yours.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4" style={{ marginTop: "36px" }}>
                <Link
                  href="/auth/sign-up"
                  className="ui-btn-primary ui-mono inline-flex items-center gap-2.5 uppercase"
                  style={{ fontSize: "12px", letterSpacing: "0.1em", fontWeight: 700, padding: "15px 26px", borderRadius: "var(--ui-r-control)" }}
                >
                  Start a canvas — free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="ui-link ui-mono inline-flex items-center gap-1.5 uppercase"
                  style={{ fontSize: "12px", letterSpacing: "0.08em", paddingBottom: "2px" }}
                >
                  Sign in
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* technical legend */}
              <div
                className="ui-mono uppercase flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2"
                style={{ marginTop: "52px", fontSize: "11px", letterSpacing: "0.08em", color: "var(--ui-text-2)" }}
              >
                {["Infinite canvas", "50 versions back", "4 access roles", "AES-GCM encrypted"].map((t, i) => (
                  <span key={t} className="inline-flex items-center gap-3.5">
                    {i > 0 && <span style={{ color: "var(--ui-border-strong)" }}>/</span>}
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── Capabilities (3D perspective rack) ─────────────── */}
          <section
            id="capabilities"
            className="relative overflow-hidden px-6 sm:px-10"
            style={{ paddingTop: "62px", paddingBottom: "88px", borderBottom: "1px solid var(--ui-border)" }}
          >
            <div className="text-center mx-auto" style={{ maxWidth: "640px" }}>
              <h2 className="ui-serif" style={{ fontSize: "clamp(28px, 3.4vw, 42px)", fontWeight: 500, lineHeight: 1.04, letterSpacing: "-0.025em" }}>
                What lives on the sheet.
              </h2>
              <p className="mx-auto" style={{ marginTop: "16px", fontSize: "15px", lineHeight: 1.62, color: "var(--ui-text-2)", maxWidth: "46ch" }}>
                A shared canvas that grows with your team&apos;s thinking — from the first loose
                scribble to the decision everyone signs off on.
              </p>
            </div>

            {/* asymmetric bento — first & last tiles span wide */}
            <div className="ui-bento grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {capabilities.map((c, i) => {
                // zigzag bento: wide tiles at 0,3,4 tile 3 cols perfectly with no gaps
                const wide = i === 0 || i === 3 || i === 4;
                return (
                  <div
                    key={c.n}
                    className={`ui-cap ${wide ? "lg:col-span-2" : ""}`}
                  >
                    {/* solid camera corners + red joint squares over the dashed frame */}
                    <span className="ui-cap-corner tl" aria-hidden="true" />
                    <span className="ui-cap-corner tr" aria-hidden="true" />
                    <span className="ui-cap-corner bl" aria-hidden="true" />
                    <span className="ui-cap-corner br" aria-hidden="true" />
                    <span className="ui-serif ui-cap-ghost" aria-hidden="true">{c.n}</span>
                    <div className="ui-cap-body">
                      <span
                        className="ui-mono uppercase block"
                        style={{ fontSize: "11px", letterSpacing: "0.14em", color: "var(--ui-text-2)" }}
                      >
                        {c.tag}
                      </span>
                      <h3 className="ui-serif" style={{ marginTop: "14px", fontSize: "21px", fontWeight: 500, letterSpacing: "-0.015em" }}>
                        {c.title}
                      </h3>
                      <p style={{ marginTop: "10px", fontSize: "14px", lineHeight: 1.6, color: "var(--ui-text-2)", maxWidth: "42ch" }}>
                        {c.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Manifesto (editor's redline) ──────────────────── */}
          <section className="relative px-6 sm:px-10 text-center" style={{ paddingTop: "92px", paddingBottom: "92px", borderBottom: "1px solid var(--ui-border)" }}>
            <div className="mx-auto">
              {/* redlined statement */}
              <p
                className="ui-serif mx-auto"
                style={{ fontSize: "clamp(26px, 3.8vw, 46px)", fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.02em", maxWidth: "24ch" }}
              >
                Most tools want your thinking to arrive{" "}
                <span className="relative inline-block">
                  finished
                  <PenStrike />
                </span>
                . This one is happy to watch it{" "}
                <span className="relative inline-block italic" style={{ color: "var(--ui-primary)" }}>
                  take shape
                  <PenUnderline />
                </span>
                .
              </p>
            </div>
          </section>

          {/* ── Process (camera-focus frames) ─────────────────── */}
          <section id="process" className="px-6 sm:px-10" style={{ paddingTop: "58px", paddingBottom: "60px", borderBottom: "1px solid var(--ui-border)" }}>
            <div className="text-center" style={{ marginBottom: "36px" }}>
              <h2 className="ui-serif" style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 500, letterSpacing: "-0.02em" }}>
                From nothing to drawing together
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-y-6 sm:gap-0 items-stretch">
              {steps.map((s, i) => (
                <div key={s.n} className="relative flex items-stretch">
                  {/* mini camera-focus node between cards (with icon) */}
                  {i > 0 && (
                    <span
                      className="ui-conn absolute hidden sm:flex items-center justify-center z-10"
                      style={{ left: "-16px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px" }}
                      aria-hidden="true"
                    >
                      <span className="ui-cfocus absolute" style={{ top: 0, left: 0 }}>⌜</span>
                      <span className="ui-cfocus absolute" style={{ top: 0, right: 0 }}>⌝</span>
                      <span className="ui-cfocus absolute" style={{ bottom: 0, left: 0 }}>⌞</span>
                      <span className="ui-cfocus absolute" style={{ bottom: 0, right: 0 }}>⌟</span>
                      <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--ui-text-2)" }} />
                    </span>
                  )}

                  <div className="ui-frame relative h-full w-full mx-0 sm:mx-3 px-7 sm:px-8" style={{ paddingTop: "34px", paddingBottom: "36px" }}>
                    {/* camera-focus corner brackets */}
                    <span className="ui-focus absolute" style={{ top: "10px", left: "12px" }}>⌜</span>
                    <span className="ui-focus absolute" style={{ top: "10px", right: "12px" }}>⌝</span>
                    <span className="ui-focus absolute" style={{ bottom: "10px", left: "12px" }}>⌞</span>
                    <span className="ui-focus absolute" style={{ bottom: "10px", right: "12px" }}>⌟</span>

                    <div className="ui-mono uppercase" style={{ fontSize: "11px", letterSpacing: "0.14em", color: "var(--ui-primary)" }}>
                      Step {s.n}
                    </div>
                    <h3 className="ui-serif" style={{ marginTop: "16px", fontSize: "22px", fontWeight: 500, letterSpacing: "-0.015em" }}>
                      {s.t}
                    </h3>
                    <p style={{ marginTop: "10px", fontSize: "14.5px", lineHeight: 1.6, color: "var(--ui-text-2)" }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Closing call ──────────────────────────────────── */}
          <section className="relative px-6 sm:px-10 text-center" style={{ paddingTop: "96px", paddingBottom: "100px" }}>
            <Tick className="left-2.5 bottom-2.5" />
            <Tick className="right-2.5 bottom-2.5" />

            <h2
              className="ui-serif mx-auto"
              style={{ fontSize: "clamp(34px, 5.5vw, 64px)", fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.025em", maxWidth: "15ch" }}
            >
              Your team's next idea is{" "}
              <span className="relative whitespace-nowrap italic">
                probably a drawing
                <PenUnderline />
              </span>
              .
            </h2>
            <p className="mx-auto" style={{ marginTop: "26px", fontSize: "16px", lineHeight: 1.6, color: "var(--ui-text-2)", maxWidth: "44ch" }}>
              Make the canvas where it happens. Spin up a free workspace and start drawing in under a minute.
            </p>

            <div className="flex justify-center" style={{ marginTop: "36px" }}>
              <Link
                href="/auth/sign-up"
                className="ui-btn-primary ui-mono inline-flex items-center gap-2.5 uppercase"
                style={{ fontSize: "12px", letterSpacing: "0.1em", fontWeight: 700, padding: "16px 30px", borderRadius: "var(--ui-r-control)" }}
              >
                Create your free workspace
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="ui-mono uppercase" style={{ marginTop: "26px", fontSize: "11px", letterSpacing: "0.1em", color: "var(--ui-text-2)" }}>
              No card&nbsp; / &nbsp;Free workspace&nbsp; / &nbsp;End-to-end encrypted
            </p>
          </section>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--ui-border)", background: "var(--ui-bg)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ paddingTop: "26px", paddingBottom: "26px" }}>
          <div className="flex items-center gap-2.5">
            {siteLogo ? <img src={siteLogo} alt={siteName} className="w-5 h-5 object-contain" /> : <Mark size={22} />}
            <span className="ui-serif" style={{ fontSize: "16px", fontWeight: 600 }}>{siteName}</span>
          </div>

          <div className="ui-mono uppercase flex items-center gap-6" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            <a href="#capabilities" className="ui-btn-ghost">Capabilities</a>
            <a href="#process" className="ui-btn-ghost">How it works</a>
            <Link href="/auth/sign-up" className="ui-btn-ghost">Get started</Link>
          </div>

          <p className="ui-mono uppercase" style={{ fontSize: "10.5px", letterSpacing: "0.1em", color: "var(--ui-text-2)" }}>
            © 2026 — Sheet 01 / 01
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getBranding } from "@/lib/branding";
import { Layers, Users, Lock, History, Zap, ArrowRight, Shield } from "lucide-react";
import { HeroCanvasWrapper } from "@/components/hero-canvas-wrapper";

export async function generateMetadata() {
  const { siteName } = await getBranding();
  return { title: { absolute: `${siteName} — Collaborative Workspace` } };
}

const SERIF = "'Instrument Serif', Georgia, serif";


export default async function LandingPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");
  const { siteName, siteLogo } = await getBranding();

  return (
    <div className="min-h-screen" style={{ background: "var(--lp-bg1)" }}>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "var(--lp-nav-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--lp-nav-line)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6" style={{ height: "60px" }}>
          <div className="flex items-center gap-2.5">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="w-8 h-8 object-contain" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--lp-btn)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="var(--lp-btn-fg)" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="var(--lp-btn-fg)" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="var(--lp-btn-fg)" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="var(--lp-btn-fg)" />
                </svg>
              </div>
            )}
            <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--lp-ink)" }}>
              {siteName}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {[{ href: "#features", label: "Features" }, { href: "#how-it-works", label: "How it works" }].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm transition-colors hover:opacity-70"
                style={{ color: "var(--lp-ink2)" }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/sign-in"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-70"
              style={{ color: "var(--lp-ink2)" }}
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-85"
              style={{ background: "var(--lp-btn)", color: "var(--lp-btn-fg)" }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "var(--lp-bg1)", paddingTop: "120px", paddingBottom: "96px" }}
        >
          {/* Radial texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "var(--lp-radial)" }}
          />

          {/* Grid */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ color: "var(--lp-dot)", opacity: 0.6 }}
            aria-hidden="true"
          >
            <defs>
              <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>

          <div className="relative max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              {/* Left: Copy */}
              <div className="flex-1 max-w-xl stagger-1">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                  style={{
                    border: "1px solid var(--lp-badge-line)",
                    color: "var(--lp-ink2)",
                    background: "var(--lp-badge-bg)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4ade80" }} />
                  Collaborative canvas for modern teams
                </div>

                {/* Headline */}
                <h1 className="mb-6 leading-none" style={{ letterSpacing: "-0.03em" }}>
                  <span
                    className="block font-bold"
                    style={{
                      fontSize: "clamp(40px, 5.5vw, 72px)",
                      lineHeight: 1.05,
                      color: "var(--lp-ink)",
                    }}
                  >
                    Think together,
                  </span>
                  <span
                    className="block"
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: "clamp(42px, 6vw, 76px)",
                      lineHeight: 1.05,
                      color: "var(--lp-serif)",
                    }}
                  >
                    draw together.
                  </span>
                </h1>

                <p
                  className="mb-10 leading-relaxed"
                  style={{ color: "var(--lp-ink2)", fontSize: "16px", maxWidth: "400px" }}
                >
                  A shared space to sketch ideas, plan projects, and build visual
                  artifacts — together, in real-time. Encrypted and version-controlled.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 mb-12">
                  <Link
                    href="/auth/sign-up"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-opacity hover:opacity-85"
                    style={{ background: "var(--lp-btn)", color: "var(--lp-btn-fg)" }}
                  >
                    Start for free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-opacity hover:opacity-70"
                    style={{
                      border: "1px solid var(--lp-btn2-line)",
                      color: "var(--lp-btn2-fg)",
                    }}
                  >
                    Sign in
                  </Link>
                </div>

                {/* Stats */}
                <div
                  className="flex items-center gap-8 pt-8"
                  style={{ borderTop: "1px solid var(--lp-line)" }}
                >
                  {[
                    { val: "∞", label: "Canvas size" },
                    { val: "50×", label: "Version history" },
                    { val: "4", label: "Permission roles" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-2xl font-bold mb-0.5" style={{ color: "var(--lp-ink)", fontVariantNumeric: "tabular-nums" }}>
                        {s.val}
                      </div>
                      <div className="text-xs" style={{ color: "var(--lp-ink3)" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Creative visual */}
              <div className="flex-1 w-full max-w-lg lg:max-w-none stagger-2">
                <HeroCanvasWrapper />
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section
          id="features"
          className="max-w-6xl mx-auto px-6"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--lp-ink3)" }}
              >
                Features
              </p>
              <h2
                className="font-bold leading-tight"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  letterSpacing: "-0.03em",
                  color: "var(--lp-ink)",
                }}
              >
                Built for serious
                <br />
                <span style={{ fontFamily: SERIF, fontStyle: "italic", color: "var(--lp-serif)" }}>
                  creative teams.
                </span>
              </h2>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--lp-ink2)" }}>
              Everything you need to ideate, collaborate, and ship visual work —
              no other tools required.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ── 01 Infinite Canvas — adaptive ── */}
            <div
              className="lg:col-span-2 rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "var(--lp-card)", border: "1px solid var(--lp-card-line)", minHeight: "240px" }}
            >
              <div className="absolute right-6 bottom-0 font-black select-none" style={{ fontSize: "120px", lineHeight: 1, color: "var(--lp-ghost)" }}>
                01
              </div>
              <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--lp-icon)", border: "1px solid var(--lp-icon-line)" }}>
                <Layers className="w-5 h-5" style={{ color: "var(--lp-card-ink)" }} />
              </div>
              <h3 className="relative z-10 font-bold mb-2" style={{ color: "var(--lp-card-ink)", fontSize: "18px" }}>
                Infinite Canvas
              </h3>
              <p className="relative z-10 text-sm leading-relaxed max-w-sm" style={{ color: "var(--lp-ink2)" }}>
                Draw, sketch, and diagram on a boundless whiteboard powered by
                Excalidraw. No limits, no boundaries — just your imagination.
              </p>
              <div className="relative z-10 mt-6 rounded-lg overflow-hidden" style={{ background: "var(--lp-icon)", border: "1px solid var(--lp-icon-line)", height: "60px" }}>
                <svg className="w-full h-full" viewBox="0 0 400 60" fill="none" aria-hidden="true">
                  <defs>
                    <marker id="sm-arr" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                      <polygon points="0 0, 6 2.5, 0 5" fill="var(--lp-card-line)" />
                    </marker>
                  </defs>
                  <rect x="12" y="14" width="80" height="32" rx="5" stroke="var(--lp-card-line)" strokeWidth="1" />
                  <text x="52" y="34" textAnchor="middle" fontSize="8" fill="var(--lp-ink3)" fontFamily="system-ui">Idea</text>
                  <path d="M92 30 L118 30" stroke="var(--lp-card-line)" strokeWidth="1" markerEnd="url(#sm-arr)" />
                  <rect x="118" y="14" width="80" height="32" rx="5" stroke="var(--lp-card-line)" strokeWidth="1" />
                  <text x="158" y="34" textAnchor="middle" fontSize="8" fill="var(--lp-ink3)" fontFamily="system-ui">Design</text>
                  <path d="M198 30 L224 30" stroke="var(--lp-card-line)" strokeWidth="1" markerEnd="url(#sm-arr)" />
                  <rect x="224" y="14" width="80" height="32" rx="5" stroke="var(--lp-btn)" strokeWidth="1.5" fill="var(--lp-ghost)" />
                  <text x="264" y="34" textAnchor="middle" fontSize="8" fill="var(--lp-ink2)" fontFamily="system-ui">Build</text>
                  <path d="M304 30 L330 30" stroke="var(--lp-card-line)" strokeWidth="1" markerEnd="url(#sm-arr)" />
                  <rect x="330" y="14" width="60" height="32" rx="5" stroke="var(--lp-card-line)" strokeWidth="1" />
                  <text x="360" y="34" textAnchor="middle" fontSize="8" fill="var(--lp-ink3)" fontFamily="system-ui">Ship</text>
                </svg>
              </div>
            </div>

            {/* ── 02 Collaboration — adaptive ── */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "var(--lp-card)", border: "1px solid var(--lp-card-line)", minHeight: "240px" }}
            >
              <div className="absolute right-4 bottom-0 font-black select-none" style={{ fontSize: "120px", lineHeight: 1, color: "var(--lp-ghost)" }}>
                02
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--lp-icon)", border: "1px solid var(--lp-icon-line)" }}>
                <Users className="w-5 h-5" style={{ color: "var(--lp-card-ink)" }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "var(--lp-card-ink)", fontSize: "18px" }}>
                Real-time Collaboration
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--lp-ink2)" }}>
                Work with your team live — see cursors and edits as they happen, all in sync.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {["A", "M", "J", "S"].map((l, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: ["#6366f1", "#ec4899", "#10b981", "#f59e0b"][i],
                        border: "2px solid var(--lp-card)",
                        marginLeft: i > 0 ? "-8px" : "0",
                      }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <span className="text-xs ml-2" style={{ color: "var(--lp-ink2)" }}>4 collaborators online</span>
              </div>
            </div>

            {/* ── 03 Encryption — adaptive ── */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "var(--lp-card)", border: "1px solid var(--lp-card-line)", minHeight: "200px" }}
            >
              <div className="absolute right-4 bottom-0 font-black select-none" style={{ fontSize: "120px", lineHeight: 1, color: "var(--lp-ghost)" }}>
                03
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--lp-icon)", border: "1px solid var(--lp-icon-line)" }}>
                <Lock className="w-5 h-5" style={{ color: "var(--lp-card-ink)" }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "var(--lp-card-ink)", fontSize: "16px" }}>
                End-to-End Encryption
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--lp-ink2)" }}>
                AES-GCM encryption ensures only you and your team can ever access your canvas data.
              </p>
            </div>

            {/* ── 04 Version History — adaptive, wide ── */}
            <div
              className="lg:col-span-2 rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "var(--lp-card)", border: "1px solid var(--lp-card-line)", minHeight: "200px" }}
            >
              <div className="absolute right-6 bottom-0 font-black select-none" style={{ fontSize: "120px", lineHeight: 1, color: "var(--lp-ghost)" }}>
                04
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--lp-icon)", border: "1px solid var(--lp-icon-line)" }}>
                <History className="w-5 h-5" style={{ color: "var(--lp-card-ink)" }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "var(--lp-card-ink)", fontSize: "18px" }}>
                Version History
              </h3>
              <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: "var(--lp-ink2)" }}>
                Every save creates a snapshot. Restore any of the last 50 versions of your canvas with a single click.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {["v1", "v2", "v3", "v4", "v5", "v6", "...", "v50"].map((v, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-mono font-medium"
                    style={{
                      background: i === 4 ? "var(--lp-btn)" : "var(--lp-icon)",
                      color: i === 4 ? "var(--lp-btn-fg)" : "var(--lp-ink2)",
                      border: `1px solid ${i === 4 ? "transparent" : "var(--lp-icon-line)"}`,
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 05 Workspaces — adaptive ── */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "var(--lp-card)", border: "1px solid var(--lp-card-line)", minHeight: "200px" }}
            >
              <div className="absolute right-4 bottom-0 font-black select-none" style={{ fontSize: "120px", lineHeight: 1, color: "var(--lp-ghost)" }}>
                05
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--lp-icon)", border: "1px solid var(--lp-icon-line)" }}>
                <Zap className="w-5 h-5" style={{ color: "var(--lp-card-ink)" }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "var(--lp-card-ink)", fontSize: "16px" }}>
                Workspaces
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--lp-ink2)" }}>
                Organize canvases, invite members, and control access — all in one structured workspace.
              </p>
            </div>

            {/* ── 06 Role-Based Access — adaptive ── */}
            <div
              className="lg:col-span-2 rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "var(--lp-card)", border: "1px solid var(--lp-card-line)", minHeight: "200px" }}
            >
              <div className="absolute right-6 bottom-0 font-black select-none" style={{ fontSize: "120px", lineHeight: 1, color: "var(--lp-ghost)" }}>
                06
              </div>
              <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--lp-icon)", border: "1px solid var(--lp-icon-line)" }}>
                <Shield className="w-5 h-5" style={{ color: "var(--lp-card-ink)" }} />
              </div>
              <h3 className="relative z-10 font-bold mb-2" style={{ color: "var(--lp-card-ink)", fontSize: "18px" }}>
                Role-Based Access
              </h3>
              <p className="relative z-10 text-sm leading-relaxed mb-6 max-w-sm" style={{ color: "var(--lp-ink2)" }}>
                Fine-grained permissions give you precise control over who can view, edit, or manage your workspace.
              </p>
              <div className="relative z-10 flex flex-wrap gap-2">
                {[
                  { role: "Owner", desc: "Full control" },
                  { role: "Admin", desc: "Manage members" },
                  { role: "Member", desc: "Create & edit" },
                  { role: "Viewer", desc: "View only" },
                ].map((r) => (
                  <div
                    key={r.role}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                    style={{ background: "var(--lp-icon)", border: "1px solid var(--lp-icon-line)", color: "var(--lp-ink2)" }}
                  >
                    <span className="font-semibold" style={{ color: "var(--lp-card-ink)" }}>{r.role}</span>
                    <span style={{ color: "var(--lp-icon-line)" }}>·</span>
                    {r.desc}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────── */}
        <section
          id="how-it-works"
          style={{
            background: "var(--lp-bg2)",
            borderTop: "1px solid var(--lp-line)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6" style={{ paddingTop: "96px", paddingBottom: "96px" }}>
            <div className="text-center mb-20">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--lp-ink3)" }}>
                How it works
              </p>
              <h2
                className="font-bold leading-tight mb-5"
                style={{ fontSize: "clamp(28px, 3.5vw, 48px)", letterSpacing: "-0.03em", color: "var(--lp-ink)" }}
              >
                Up and running{" "}
                <span style={{ fontFamily: SERIF, fontStyle: "italic", color: "var(--lp-serif)" }}>
                  in minutes.
                </span>
              </h2>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "var(--lp-ink2)" }}>
                No complex setup. Just three steps and your team is drawing together.
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-px"
              style={{ background: "var(--lp-line)" }}
            >
              {[
                { num: "01", title: "Create a workspace", desc: "Set up a shared space for your team or project in seconds.", detail: "Name it, describe it, and you're ready to go." },
                { num: "02", title: "Invite your team", desc: "Share a link or send direct invites.", detail: "Teammates join with one click and choose their role." },
                { num: "03", title: "Start creating", desc: "Open an infinite canvas and draw together.", detail: "See each other's cursors live. Every change is saved automatically." },
              ].map((step, i) => (
                <div
                  key={i}
                  className="relative p-10"
                  style={{ background: "var(--lp-bg2)" }}
                >
                  <div
                    className="text-7xl font-black mb-8 leading-none select-none"
                    style={{ fontFamily: SERIF, fontStyle: "italic", color: "var(--lp-num)" }}
                  >
                    {step.num}
                  </div>
                  <h3 className="font-bold mb-3" style={{ color: "var(--lp-ink)", fontSize: "17px" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--lp-ink2)" }}>
                    {step.desc}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--lp-ink3)" }}>
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-14">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl transition-opacity hover:opacity-85"
                style={{ background: "var(--lp-btn)", color: "var(--lp-btn-fg)" }}
              >
                Get started for free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section
          style={{
            background: "var(--lp-bg1)",
            borderTop: "1px solid var(--lp-line)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6" style={{ paddingTop: "96px", paddingBottom: "96px" }}>
            <div
              className="relative rounded-2xl overflow-hidden text-center px-8 py-20 sm:px-20"
              style={{ background: "var(--lp-card)", border: "1px solid var(--lp-card-line)" }}
            >
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <svg className="w-full h-full" style={{ opacity: 1 }}>
                  <defs>
                    <pattern id="cta-dots" width="30" height="30" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="1" fill="var(--lp-dot)" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#cta-dots)" />
                </svg>
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)" }} />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" style={{ width: "600px", height: "600px", border: "1px solid var(--lp-card-line)" }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" style={{ width: "400px", height: "400px", border: "1px solid var(--lp-card-line)" }} />

              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--lp-ink3)" }}>
                  Free to get started
                </p>
                <h2
                  className="font-bold mb-5 leading-tight"
                  style={{ fontSize: "clamp(28px, 4vw, 54px)", letterSpacing: "-0.03em", color: "var(--lp-ink)" }}
                >
                  Ready to think{" "}
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", color: "var(--lp-serif)" }}>
                    and draw
                  </span>
                  <br />
                  together?
                </h2>
                <p className="text-sm leading-relaxed mb-10 mx-auto" style={{ color: "var(--lp-ink2)", maxWidth: "360px" }}>
                  Create your free account and start building on an infinite canvas with your team today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/auth/sign-up"
                    className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
                    style={{ background: "var(--lp-btn)", color: "var(--lp-btn-fg)" }}
                  >
                    Create free account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium rounded-xl transition-opacity hover:opacity-70"
                    style={{ border: "1px solid var(--lp-btn2-line)", color: "var(--lp-btn2-fg)" }}
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ background: "var(--lp-bg2)", borderTop: "1px solid var(--lp-line)" }}>
        <div
          className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ paddingTop: "28px", paddingBottom: "28px" }}
        >
          <div className="flex items-center gap-2.5">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="w-6 h-6 object-contain" />
            ) : (
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--lp-ink)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="var(--lp-btn-fg)" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="var(--lp-btn-fg)" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="var(--lp-btn-fg)" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="var(--lp-btn-fg)" />
                </svg>
              </div>
            )}
            <span className="text-sm font-semibold" style={{ color: "var(--lp-ink)" }}>{siteName}</span>
          </div>

          <div className="flex items-center gap-6 text-xs" style={{ color: "var(--lp-ink3)" }}>
            <a href="#features" className="transition-opacity hover:opacity-70">Features</a>
            <a href="#how-it-works" className="transition-opacity hover:opacity-70">How it works</a>
            <Link href="/auth/sign-up" className="transition-opacity hover:opacity-70">Get started</Link>
          </div>

          <p className="text-xs" style={{ color: "var(--lp-ink3)", opacity: 0.6 }}>
            Collaborative workspace for teams
          </p>
        </div>
      </footer>
    </div>
  );
}

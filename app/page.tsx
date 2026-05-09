import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getBranding } from "@/lib/branding";
import { Layers, Users, Lock, History, Zap, ArrowRight, Shield } from "lucide-react";

export async function generateMetadata() {
  const { siteName } = await getBranding();
  return { title: { absolute: `${siteName} — Collaborative Workspace` } };
}

const SERIF = "'Instrument Serif', Georgia, serif";

function LogoMark({ light = false }: { light?: boolean }) {
  const bg = light ? "#ffffff" : "#0b0b0b";
  const fill = light ? "#0b0b0b" : "#ffffff";
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: bg }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill={fill} />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill={fill} />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill={fill} />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill={fill} />
      </svg>
    </div>
  );
}

function CanvasPreview() {
  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-2xl border border-zinc-200"
      style={{ background: "#fafaf9" }}
    >
      {/* Toolbar top */}
      <div className="flex items-center gap-2 px-4 h-10 border-b border-zinc-200 bg-white/95">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-[11px] font-semibold text-zinc-500">
            Sprint Planning — Q3 Roadmap
          </span>
        </div>
        <div className="flex items-center gap-1">
          {["A", "M", "J"].map((l, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{
                background: ["#3b82f6", "#ec4899", "#10b981"][i],
                marginLeft: i > 0 ? "-5px" : "0",
                border: "2px solid white",
              }}
            >
              {l}
            </div>
          ))}
          <span className="text-[9px] text-zinc-400 ml-1.5">3 online</span>
        </div>
      </div>

      {/* Canvas area */}
      <div className="relative" style={{ height: "320px" }}>
        {/* Dot grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="canvas-dots"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.9" fill="#d4d4d0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#canvas-dots)" />
        </svg>

        {/* Diagram SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 620 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#3f3f3c" />
            </marker>
            <marker
              id="arrowhead-dashed"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#aaa" />
            </marker>
            <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#00000018"
              />
            </filter>
          </defs>

          {/* Research box */}
          <rect
            x="32"
            y="44"
            width="148"
            height="68"
            rx="8"
            fill="white"
            stroke="#1c1c1a"
            strokeWidth="1.5"
            filter="url(#card-shadow)"
          />
          <text
            x="106"
            y="72"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#1c1c1a"
            fontFamily="system-ui"
          >
            Research Phase
          </text>
          <text
            x="106"
            y="89"
            textAnchor="middle"
            fontSize="9"
            fill="#888"
            fontFamily="system-ui"
          >
            Discovery &amp; interviews
          </text>
          <text x="46" y="107" fontSize="8.5" fill="#22c55e" fontFamily="system-ui">
            ✓ Complete
          </text>

          {/* Arrow 1 */}
          <path
            d="M180 78 L218 78"
            stroke="#3f3f3c"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
          />

          {/* Design sprint box */}
          <rect
            x="218"
            y="44"
            width="148"
            height="68"
            rx="8"
            fill="white"
            stroke="#1c1c1a"
            strokeWidth="1.5"
            filter="url(#card-shadow)"
          />
          <text
            x="292"
            y="72"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#1c1c1a"
            fontFamily="system-ui"
          >
            Design Sprint
          </text>
          <text
            x="292"
            y="89"
            textAnchor="middle"
            fontSize="9"
            fill="#888"
            fontFamily="system-ui"
          >
            Wireframes &amp; prototyping
          </text>
          <text x="232" y="107" fontSize="8.5" fill="#f59e0b" fontFamily="system-ui">
            ● In progress
          </text>

          {/* Arrow 2 */}
          <path
            d="M366 78 L404 78"
            stroke="#3f3f3c"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
          />

          {/* Launch box */}
          <rect
            x="404"
            y="44"
            width="130"
            height="68"
            rx="8"
            fill="#0b0b0b"
            stroke="#0b0b0b"
            strokeWidth="1.5"
            filter="url(#card-shadow)"
          />
          <text
            x="469"
            y="72"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="white"
            fontFamily="system-ui"
          >
            Launch
          </text>
          <text
            x="469"
            y="89"
            textAnchor="middle"
            fontSize="9"
            fill="#888"
            fontFamily="system-ui"
          >
            Ship to production
          </text>
          <text x="418" y="107" fontSize="8.5" fill="#6b7280" fontFamily="system-ui">
            ◌ Upcoming
          </text>

          {/* Dashed ellipse around design sprint */}
          <ellipse
            cx="292"
            cy="78"
            rx="88"
            ry="52"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="5 3"
            fill="#3b82f620"
          />
          <text
            x="350"
            y="42"
            fontSize="8"
            fill="#3b82f6"
            fontWeight="600"
            fontFamily="system-ui"
          >
            Priority
          </text>

          {/* Sticky note */}
          <rect
            x="38"
            y="160"
            width="150"
            height="96"
            rx="4"
            fill="#fef9c3"
            stroke="#fde047"
            strokeWidth="1"
          />
          <rect x="38" y="160" width="150" height="16" rx="4" fill="#fde04799" />
          <text
            x="48"
            y="173"
            fontSize="8.5"
            fontWeight="700"
            fill="#92400e"
            fontFamily="system-ui"
          >
            📋 Action Items
          </text>
          <text x="48" y="193" fontSize="8" fill="#78350f" fontFamily="system-ui">
            • Finalize user research
          </text>
          <text x="48" y="208" fontSize="8" fill="#78350f" fontFamily="system-ui">
            • Complete prototype v2
          </text>
          <text x="48" y="223" fontSize="8" fill="#78350f" fontFamily="system-ui">
            • Stakeholder review call
          </text>
          <text x="48" y="238" fontSize="8" fill="#78350f" fontFamily="system-ui">
            • Ship MVP by Q3 →
          </text>

          {/* Connection from sticky to design box */}
          <path
            d="M188 200 Q 210 200 220 140"
            stroke="#aaa"
            strokeWidth="1"
            strokeDasharray="4 2"
            fill="none"
            markerEnd="url(#arrowhead-dashed)"
          />

          {/* Second node group */}
          <rect
            x="240"
            y="170"
            width="130"
            height="60"
            rx="8"
            fill="white"
            stroke="#e5e5e0"
            strokeWidth="1.5"
            filter="url(#card-shadow)"
          />
          <text
            x="305"
            y="197"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="#1c1c1a"
            fontFamily="system-ui"
          >
            Component Library
          </text>
          <text
            x="305"
            y="212"
            textAnchor="middle"
            fontSize="8.5"
            fill="#888"
            fontFamily="system-ui"
          >
            shadcn/ui + Tailwind
          </text>
          <text x="255" y="226" fontSize="8" fill="#888" fontFamily="system-ui">
            ● 24 components
          </text>

          <rect
            x="400"
            y="170"
            width="130"
            height="60"
            rx="8"
            fill="white"
            stroke="#e5e5e0"
            strokeWidth="1.5"
            filter="url(#card-shadow)"
          />
          <text
            x="465"
            y="197"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="#1c1c1a"
            fontFamily="system-ui"
          >
            API Integration
          </text>
          <text
            x="465"
            y="212"
            textAnchor="middle"
            fontSize="8.5"
            fill="#888"
            fontFamily="system-ui"
          >
            REST + WebSockets
          </text>
          <text x="415" y="226" fontSize="8" fill="#888" fontFamily="system-ui">
            ● 12 endpoints
          </text>

          <path
            d="M370 200 L400 200"
            stroke="#e5e5e0"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
          />

          {/* Freehand curved line */}
          <path
            d="M 80 255 C 120 230, 180 270, 235 250"
            stroke="#d4d4d0"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Alex cursor */}
          <g transform="translate(192, 270)">
            <path
              d="M0 0 L0 16 L4 12 L7 20 L10 18 L7 11 L12 11 Z"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="1"
            />
            <rect x="13" y="4" width="36" height="15" rx="4" fill="#3b82f6" />
            <text
              x="31"
              y="15"
              textAnchor="middle"
              fontSize="8"
              fill="white"
              fontWeight="600"
              fontFamily="system-ui"
            >
              Alex
            </text>
          </g>

          {/* Maya cursor */}
          <g transform="translate(445, 248)">
            <path
              d="M0 0 L0 16 L4 12 L7 20 L10 18 L7 11 L12 11 Z"
              fill="#ec4899"
              stroke="white"
              strokeWidth="1"
            />
            <rect x="13" y="4" width="40" height="15" rx="4" fill="#ec4899" />
            <text
              x="33"
              y="15"
              textAnchor="middle"
              fontSize="8"
              fill="white"
              fontWeight="600"
              fontFamily="system-ui"
            >
              Maya
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center gap-1 px-4 h-10 border-t border-zinc-200 bg-white/95">
        {["✦", "◻", "○", "◇", "T", "↗", "⌗"].map((icon, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors"
            style={{
              background: i === 0 ? "#0b0b0b" : "transparent",
              color: i === 0 ? "white" : "#888",
            }}
          >
            {icon}
          </div>
        ))}
        <div className="flex-1" />
        <div className="text-[10px] text-zinc-400">
          Zoom 100%
        </div>
      </div>
    </div>
  );
}

const marqueeItems = [
  "Infinite canvas",
  "Real-time collaboration",
  "Version history",
  "AES-GCM encryption",
  "Role-based access",
  "Workspace management",
  "Invite links",
  "Auto-save every 10s",
  "50 version snapshots",
  "Soft delete & restore",
  "In-app inbox",
  "Admin dashboard",
];

export default async function LandingPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

  const { siteName, siteLogo } = await getBranding();

  return (
    <div className="min-h-screen" style={{ background: "#fafaf9" }}>
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          background: "rgba(11,11,11,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "#1f1f1e",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-15" style={{ height: "60px" }}>
          <div className="flex items-center gap-2.5">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="w-8 h-8 object-contain" />
            ) : (
              <LogoMark light />
            )}
            <span className="font-semibold text-white text-sm tracking-tight">{siteName}</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm transition-colors hover:text-white"
                style={{ color: "#888" }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/sign-in"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: "#888" }}
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "#fff", color: "#0b0b0b" }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "#0b0b0b", paddingTop: "120px", paddingBottom: "80px" }}
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.02) 0%, transparent 50%)",
          }}
        />
        {/* Subtle grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.03 }}
        >
          <defs>
            <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
            {/* Left: Copy */}
            <div className="flex-1 max-w-xl stagger-1">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                style={{
                  border: "1px solid #2a2a28",
                  color: "#999",
                  background: "#161614",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#4ade80" }}
                />
                Collaborative canvas for modern teams
              </div>

              {/* Headline */}
              <h1
                className="mb-6 leading-none"
                style={{ letterSpacing: "-0.03em" }}
              >
                <span
                  className="block text-white font-bold"
                  style={{ fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 1.05 }}
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
                    color: "#6b6b68",
                  }}
                >
                  draw together.
                </span>
              </h1>

              <p
                className="mb-10 leading-relaxed"
                style={{ color: "#666", fontSize: "16px", maxWidth: "400px" }}
              >
                A shared space to sketch ideas, plan projects, and build visual
                artifacts — together, in real-time. Encrypted and
                version-controlled.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mb-12">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
                  style={{ background: "#fff", color: "#0b0b0b" }}
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-colors"
                  style={{
                    border: "1px solid #2a2a28",
                    color: "#aaa",
                  }}
                >
                  Sign in
                </Link>
              </div>

              {/* Stats */}
              <div
                className="flex items-center gap-8 pt-8"
                style={{ borderTop: "1px solid #1f1f1e" }}
              >
                {[
                  { val: "∞", label: "Canvas size" },
                  { val: "50×", label: "Version history" },
                  { val: "4", label: "Permission roles" },
                ].map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-2xl font-bold text-white mb-0.5"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {s.val}
                    </div>
                    <div className="text-xs" style={{ color: "#555" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Canvas preview */}
            <div className="flex-1 w-full max-w-2xl lg:max-w-none stagger-2 animate-float-slow">
              <CanvasPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip ───────────────────────────────────────────── */}
      <div
        className="overflow-hidden"
        style={{
          borderTop: "1px solid #e8e8e4",
          borderBottom: "1px solid #e8e8e4",
          background: "#f4f4f2",
          padding: "12px 0",
        }}
      >
        <div
          className="animate-marquee flex gap-0 whitespace-nowrap"
          style={{ width: "max-content" }}
        >
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 text-xs font-medium"
              style={{ color: "#888", padding: "0 32px" }}
            >
              <span
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: "#c8c8c4" }}
              />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────── */}
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
              style={{ color: "#aaa" }}
            >
              Features
            </p>
            <h2
              className="font-bold leading-tight"
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                letterSpacing: "-0.03em",
                color: "#0b0b0b",
              }}
            >
              Built for serious
              <br />
              <span style={{ fontFamily: SERIF, fontStyle: "italic", color: "#888" }}>
                creative teams.
              </span>
            </h2>
          </div>
          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: "#888" }}
          >
            Everything you need to ideate, collaborate, and ship visual work —
            no other tools required.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Feature 1 — Wide, Infinite Canvas */}
          <div
            className="lg:col-span-2 rounded-2xl p-8 relative overflow-hidden group transition-all duration-300"
            style={{
              background: "#0b0b0b",
              border: "1px solid #1f1f1e",
              minHeight: "240px",
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full opacity-[0.04]">
                <defs>
                  <pattern id="feat-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.8" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#feat-dots)" />
              </svg>
            </div>
            <div
              className="absolute right-6 bottom-0 text-white font-black select-none"
              style={{ fontSize: "120px", lineHeight: 1, opacity: 0.04 }}
            >
              01
            </div>
            <div
              className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "#1a1a18", border: "1px solid #2a2a28" }}
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h3
              className="relative z-10 font-bold mb-2"
              style={{ color: "#f2f2f0", fontSize: "18px" }}
            >
              Infinite Canvas
            </h3>
            <p
              className="relative z-10 text-sm leading-relaxed max-w-sm"
              style={{ color: "#666" }}
            >
              Draw, sketch, and diagram on a boundless whiteboard powered by
              Excalidraw. No limits, no boundaries — just your imagination.
            </p>
            {/* Mini canvas preview */}
            <div
              className="relative z-10 mt-6 rounded-lg overflow-hidden"
              style={{
                background: "#141412",
                border: "1px solid #2a2a28",
                height: "60px",
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 400 60" fill="none" aria-hidden="true">
                <rect x="12" y="14" width="80" height="32" rx="5" stroke="#3a3a38" strokeWidth="1" />
                <text x="52" y="34" textAnchor="middle" fontSize="8" fill="#555" fontFamily="system-ui">Idea</text>
                <path d="M92 30 L118 30" stroke="#3a3a38" strokeWidth="1" markerEnd="url(#sm-arrow)" />
                <defs>
                  <marker id="sm-arrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                    <polygon points="0 0, 6 2.5, 0 5" fill="#3a3a38" />
                  </marker>
                </defs>
                <rect x="118" y="14" width="80" height="32" rx="5" stroke="#3a3a38" strokeWidth="1" />
                <text x="158" y="34" textAnchor="middle" fontSize="8" fill="#555" fontFamily="system-ui">Design</text>
                <path d="M198 30 L224 30" stroke="#3a3a38" strokeWidth="1" markerEnd="url(#sm-arrow)" />
                <rect x="224" y="14" width="80" height="32" rx="5" stroke="#4a4a48" strokeWidth="1.5" fill="#1e1e1c" />
                <text x="264" y="34" textAnchor="middle" fontSize="8" fill="#888" fontFamily="system-ui">Build</text>
                <path d="M304 30 L330 30" stroke="#3a3a38" strokeWidth="1" markerEnd="url(#sm-arrow)" />
                <rect x="330" y="14" width="60" height="32" rx="5" stroke="#3a3a38" strokeWidth="1" />
                <text x="360" y="34" textAnchor="middle" fontSize="8" fill="#555" fontFamily="system-ui">Ship</text>
              </svg>
            </div>
          </div>

          {/* Feature 2 — Collaboration */}
          <div
            className="rounded-2xl p-8 relative overflow-hidden group transition-colors duration-300"
            style={{
              background: "#fafaf9",
              border: "1px solid #e8e8e4",
              minHeight: "240px",
            }}
          >
            <div
              className="absolute right-4 bottom-0 font-black select-none"
              style={{ fontSize: "120px", lineHeight: 1, opacity: 0.04, color: "#0b0b0b" }}
            >
              02
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "#f0f0ed", border: "1px solid #e8e8e4" }}
            >
              <Users className="w-5 h-5" style={{ color: "#0b0b0b" }} />
            </div>
            <h3
              className="font-bold mb-2"
              style={{ color: "#0b0b0b", fontSize: "18px" }}
            >
              Real-time Collaboration
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#888" }}>
              Work with your team live — see cursors and edits as they happen,
              all in sync.
            </p>
            {/* Avatar stack */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {["A", "M", "J", "S"].map((l, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: ["#3b82f6", "#ec4899", "#10b981", "#f59e0b"][i],
                      border: "2px solid #fafaf9",
                      marginLeft: i > 0 ? "-8px" : "0",
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <span className="text-xs ml-2" style={{ color: "#888" }}>
                4 collaborators online
              </span>
            </div>
          </div>

          {/* Feature 3 — Encryption */}
          <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "#fafaf9",
              border: "1px solid #e8e8e4",
              minHeight: "200px",
            }}
          >
            <div
              className="absolute right-4 bottom-0 font-black select-none"
              style={{ fontSize: "120px", lineHeight: 1, opacity: 0.04, color: "#0b0b0b" }}
            >
              03
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "#f0f0ed", border: "1px solid #e8e8e4" }}
            >
              <Lock className="w-5 h-5" style={{ color: "#0b0b0b" }} />
            </div>
            <h3
              className="font-bold mb-2"
              style={{ color: "#0b0b0b", fontSize: "16px" }}
            >
              End-to-End Encryption
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#888" }}>
              AES-GCM encryption ensures only you and your team can ever access
              your canvas data.
            </p>
          </div>

          {/* Feature 4 — Version History (wide) */}
          <div
            className="lg:col-span-2 rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "#fafaf9",
              border: "1px solid #e8e8e4",
              minHeight: "200px",
            }}
          >
            <div
              className="absolute right-6 bottom-0 font-black select-none"
              style={{ fontSize: "120px", lineHeight: 1, opacity: 0.04, color: "#0b0b0b" }}
            >
              04
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "#f0f0ed", border: "1px solid #e8e8e4" }}
            >
              <History className="w-5 h-5" style={{ color: "#0b0b0b" }} />
            </div>
            <h3
              className="font-bold mb-2"
              style={{ color: "#0b0b0b", fontSize: "18px" }}
            >
              Version History
            </h3>
            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: "#888" }}>
              Every save creates a snapshot. Restore any of the last 50 versions
              of your canvas with a single click.
            </p>
            {/* Version timeline */}
            <div className="flex items-center gap-2">
              {["v1", "v2", "v3", "v4", "v5", "v6", "...", "v50"].map((v, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-md text-xs font-mono font-medium"
                  style={{
                    background: i === 4 ? "#0b0b0b" : "#f0f0ed",
                    color: i === 4 ? "#fff" : "#888",
                    border: `1px solid ${i === 4 ? "#0b0b0b" : "#e8e8e4"}`,
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Feature 5 — Workspaces */}
          <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "#fafaf9",
              border: "1px solid #e8e8e4",
              minHeight: "200px",
            }}
          >
            <div
              className="absolute right-4 bottom-0 font-black select-none"
              style={{ fontSize: "120px", lineHeight: 1, opacity: 0.04, color: "#0b0b0b" }}
            >
              05
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "#f0f0ed", border: "1px solid #e8e8e4" }}
            >
              <Zap className="w-5 h-5" style={{ color: "#0b0b0b" }} />
            </div>
            <h3
              className="font-bold mb-2"
              style={{ color: "#0b0b0b", fontSize: "16px" }}
            >
              Workspaces
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#888" }}>
              Organize canvases, invite members, and control access — all in one
              structured workspace.
            </p>
          </div>

          {/* Feature 6 — Role-Based Access */}
          <div
            className="lg:col-span-2 rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "#0b0b0b",
              border: "1px solid #1f1f1e",
              minHeight: "200px",
            }}
          >
            <div
              className="absolute right-6 bottom-0 text-white font-black select-none"
              style={{ fontSize: "120px", lineHeight: 1, opacity: 0.04 }}
            >
              06
            </div>
            <div
              className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "#1a1a18", border: "1px solid #2a2a28" }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3
              className="relative z-10 font-bold mb-2"
              style={{ color: "#f2f2f0", fontSize: "18px" }}
            >
              Role-Based Access
            </h3>
            <p
              className="relative z-10 text-sm leading-relaxed mb-6 max-w-sm"
              style={{ color: "#666" }}
            >
              Fine-grained permissions give you precise control over who can
              view, edit, or manage your workspace.
            </p>
            {/* Role pills */}
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
                  style={{
                    background: "#1a1a18",
                    border: "1px solid #2a2a28",
                    color: "#aaa",
                  }}
                >
                  <span className="font-semibold text-white">{r.role}</span>
                  <span style={{ color: "#555" }}>·</span>
                  {r.desc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{ background: "#0b0b0b", borderTop: "1px solid #1f1f1e" }}
      >
        <div
          className="max-w-6xl mx-auto px-6"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          <div className="text-center mb-20">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#555" }}
            >
              How it works
            </p>
            <h2
              className="font-bold leading-tight mb-5"
              style={{
                fontSize: "clamp(28px, 3.5vw, 48px)",
                letterSpacing: "-0.03em",
                color: "#f2f2f0",
              }}
            >
              Up and running{" "}
              <span style={{ fontFamily: SERIF, fontStyle: "italic", color: "#555" }}>
                in minutes.
              </span>
            </h2>
            <p
              className="text-sm leading-relaxed max-w-xs mx-auto"
              style={{ color: "#555" }}
            >
              No complex setup. Just three steps and your team is drawing
              together.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: "#1f1f1e" }}>
            {[
              {
                num: "01",
                title: "Create a workspace",
                desc: "Set up a shared space for your team or project in seconds.",
                detail: "Name it, describe it, and you're ready to go.",
              },
              {
                num: "02",
                title: "Invite your team",
                desc: "Share a link or send direct invites.",
                detail: "Teammates join with one click and choose their role.",
              },
              {
                num: "03",
                title: "Start creating",
                desc: "Open an infinite canvas and draw together.",
                detail: "See each other's cursors live. Every change is saved automatically.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative p-10 group"
                style={{ background: "#0b0b0b" }}
              >
                <div
                  className="text-7xl font-black mb-8 leading-none select-none"
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    color: "#1a1a18",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  className="font-bold mb-3"
                  style={{ color: "#f2f2f0", fontSize: "17px" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: "#555" }}>
                  {step.desc}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#3a3a38" }}>
                  {step.detail}
                </p>
                <div
                  className="absolute bottom-0 left-0 right-0 h-px transition-all duration-500"
                  style={{ background: "transparent" }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-14">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
              style={{ background: "#fff", color: "#0b0b0b" }}
            >
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section
        style={{ background: "#fafaf9", borderTop: "1px solid #e8e8e4" }}
      >
        <div
          className="max-w-6xl mx-auto px-6"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          <div
            className="relative rounded-2xl overflow-hidden text-center px-8 py-20 sm:px-20"
            style={{ background: "#0b0b0b" }}
          >
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full opacity-[0.06]" aria-hidden="true">
                <defs>
                  <pattern id="cta-dots" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-dots)" />
              </svg>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
                }}
              />
            </div>

            {/* Decorative ring */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: "600px",
                height: "600px",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: "400px",
                height: "400px",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            />

            <div className="relative z-10">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-5"
                style={{ color: "#444" }}
              >
                Free to get started
              </p>
              <h2
                className="font-bold mb-5 leading-tight"
                style={{
                  fontSize: "clamp(28px, 4vw, 54px)",
                  letterSpacing: "-0.03em",
                  color: "#f2f2f0",
                }}
              >
                Ready to think{" "}
                <span
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    color: "#555",
                  }}
                >
                  and draw
                </span>
                <br />
                together?
              </h2>
              <p
                className="text-sm leading-relaxed mb-10 mx-auto"
                style={{ color: "#555", maxWidth: "360px" }}
              >
                Create your free account and start building on an infinite canvas
                with your team today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
                  style={{ background: "#fff", color: "#0b0b0b" }}
                >
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium rounded-xl transition-colors"
                  style={{
                    border: "1px solid #2a2a28",
                    color: "#777",
                  }}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ background: "#0b0b0b", borderTop: "1px solid #1f1f1e" }}>
        <div
          className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ paddingTop: "28px", paddingBottom: "28px" }}
        >
          <div className="flex items-center gap-2.5">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="w-6 h-6 object-contain" />
            ) : (
              <LogoMark light />
            )}
            <span className="text-sm font-semibold text-white">{siteName}</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: "#444" }}>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <Link href="/auth/sign-up" className="hover:text-white transition-colors">Get started</Link>
          </div>
          <p className="text-xs" style={{ color: "#333" }}>
            Collaborative workspace for teams
          </p>
        </div>
      </footer>
    </div>
  );
}

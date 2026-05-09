"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

const NODE_COUNT = 78;
const ACCENT_COUNT = 10;
const CONNECT_DIST = 120;
const ACCENT_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  isAccent: boolean;
  phase: number;
  pulseSpeed: number;
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = resolvedTheme === "dark";

    /* ── Colors ─────────────────────────────── */
    const nodeDim = isDark ? "rgba(140,140,200,0.55)" : "rgba(100,100,180,0.42)";
    const lineColor = isDark ? "rgba(80,80,180,0.22)" : "rgba(100,100,200,0.15)";
    const bgColor = isDark ? "#0f0f0e" : "#f0efec";

    /* ── Resize ─────────────────────────────── */
    function resize() {
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /* ── Nodes ──────────────────────────────── */
    const nodes: Node[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const isAccent = i < ACCENT_COUNT;
      nodes.push({
        x: Math.random() * (canvas.width || 520),
        y: Math.random() * (canvas.height || 460),
        z: Math.random(),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: isAccent ? 3.5 + Math.random() * 2.5 : 1.2 + Math.random() * 2,
        color: isAccent ? ACCENT_COLORS[i % ACCENT_COLORS.length] : nodeDim,
        isAccent,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 1,
      });
    }

    /* ── Mouse ──────────────────────────────── */
    let mx = canvas.width / 2;
    let my = canvas.height / 2;
    let tmx = mx;
    let tmy = my;
    const onMM = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      tmx = e.clientX - rect.left;
      tmy = e.clientY - rect.top;
    };
    container.addEventListener("mousemove", onMM);

    /* ── Animation ──────────────────────────── */
    let raf: number;
    let t = 0;

    function draw() {
      raf = requestAnimationFrame(draw);
      if (!canvas || !ctx) return;
      t += 0.005;

      const W = canvas.width;
      const H = canvas.height;

      /* Smooth mouse follow */
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      const parallaxX = (mx / W - 0.5) * 18;
      const parallaxY = (my / H - 0.5) * 10;

      /* Clear */
      ctx.clearRect(0, 0, W, H);

      /* Background */
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      /* Dot grid */
      const dotColor = isDark ? "rgba(80,80,100,0.35)" : "rgba(160,158,154,0.55)";
      const gridStep = 28;
      ctx.fillStyle = dotColor;
      for (let gx = 0; gx < W; gx += gridStep) {
        for (let gy = 0; gy < H; gy += gridStep) {
          ctx.beginPath();
          ctx.arc(gx + 1, gy + 1, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* Ambient glow blobs */
      const g1 = ctx.createRadialGradient(W * 0.65 + parallaxX, H * 0.3 + parallaxY, 0, W * 0.65 + parallaxX, H * 0.3 + parallaxY, 160);
      g1.addColorStop(0, "rgba(99,102,241,0.07)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(W * 0.25 + parallaxX * 0.6, H * 0.7 + parallaxY * 0.6, 0, W * 0.25 + parallaxX * 0.6, H * 0.7 + parallaxY * 0.6, 120);
      g2.addColorStop(0, "rgba(236,72,153,0.055)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      /* Move nodes */
      for (const n of nodes) {
        n.x += n.vx + parallaxX * 0.008 * n.z;
        n.y += n.vy + Math.sin(t + n.phase) * 0.04 + parallaxY * 0.008 * n.z;
        if (n.x < -20) n.x = W + 20;
        else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        else if (n.y > H + 20) n.y = -20;
      }

      /* Lines */
      ctx.save();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * (isDark ? 0.28 : 0.2);
            ctx.strokeStyle = isDark
              ? `rgba(100,100,220,${alpha})`
              : `rgba(110,110,200,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      /* Nodes */
      for (const n of nodes) {
        const pulse = n.isAccent ? 1 + Math.sin(t * n.pulseSpeed + n.phase) * 0.15 : 1;
        const r = n.r * pulse;

        if (n.isAccent) {
          /* Glow halo using shadowBlur */
          ctx.save();
          ctx.shadowColor = n.color;
          ctx.shadowBlur = isDark ? 18 : 12;
          ctx.fillStyle = n.color;
          ctx.globalAlpha = 0.92;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          /* Outer soft halo disc */
          ctx.save();
          ctx.globalAlpha = isDark ? 0.07 : 0.05;
          ctx.fillStyle = n.color;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          /* Pulse ring */
          const ringR = r * 3.5 + Math.sin(t * n.pulseSpeed * 1.3 + n.phase) * r;
          ctx.save();
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = isDark ? 0.18 : 0.12;
          ctx.beginPath();
          ctx.arc(n.x, n.y, ringR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.save();
          ctx.globalAlpha = isDark ? 0.52 : 0.42;
          ctx.fillStyle = n.color;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      /* Status pill */
      /* (rendered as HTML overlay, see JSX) */
    }

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("mousemove", onMM);
    };
  }, [resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        minHeight: "460px",
        cursor: "crosshair",
        border: "1px solid var(--lp-hero-border)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.05)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />

      {/* Live collaboration pill */}
      <div
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium pointer-events-none select-none"
        style={{
          background: "var(--lp-hero-pill-bg)",
          border: "1px solid var(--lp-hero-pill-border)",
          color: "var(--lp-hero-pill-text)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
        Live collaboration
      </div>

      {/* User cursor labels */}
      <div
        className="absolute top-10 right-16 z-10 pointer-events-none select-none flex flex-col items-start gap-1"
        style={{ animation: "float 8s ease-in-out infinite", animationDelay: "1s" }}
      >
        <svg width="14" height="18" viewBox="0 0 18 22" fill="none">
          <path d="M0 0 L0 18 L4.5 13.5 L8 22 L11 20 L7.5 12 L14 12 Z" fill="#6366f1" stroke="white" strokeWidth="1.2" />
        </svg>
        <span className="text-[9px] font-semibold text-white rounded px-1.5 py-0.5" style={{ background: "#6366f1" }}>Sofia</span>
      </div>

      <div
        className="absolute bottom-20 left-32 z-10 pointer-events-none select-none flex flex-col items-start gap-1"
        style={{ animation: "float 9.5s ease-in-out infinite", animationDelay: "2.4s" }}
      >
        <svg width="14" height="18" viewBox="0 0 18 22" fill="none">
          <path d="M0 0 L0 18 L4.5 13.5 L8 22 L11 20 L7.5 12 L14 12 Z" fill="#ec4899" stroke="white" strokeWidth="1.2" />
        </svg>
        <span className="text-[9px] font-semibold text-white rounded px-1.5 py-0.5" style={{ background: "#ec4899" }}>Marcus</span>
      </div>
    </div>
  );
}

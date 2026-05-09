"use client";

import dynamic from "next/dynamic";

const HeroCanvas = dynamic(
  () => import("@/components/hero-canvas").then((m) => m.HeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-2xl"
        style={{
          minHeight: "460px",
          background: "var(--lp-hero-bg)",
          border: "1px solid var(--lp-hero-border)",
        }}
      />
    ),
  }
);

export function HeroCanvasWrapper() {
  return <HeroCanvas />;
}

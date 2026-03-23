import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "better-auth"],
  transpilePackages: ["@excalidraw/excalidraw"],
  allowedDevOrigins: [
    "*.replit.dev",
    "*.worf.replit.dev",
    "*.riker.replit.dev",
    "*.kirk.replit.dev",
    "*.picard.replit.dev",
    "*.janeway.replit.dev",
    "*.spock.replit.dev",
    "*.repl.co",
  ],
};

export default nextConfig;

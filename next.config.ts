import type { NextConfig } from "next";

const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "better-auth"],
  transpilePackages: ["@excalidraw/excalidraw"],
  allowedDevOrigins: [
    "*.replit.dev",
    "*.sisko.replit.dev",
    "*.worf.replit.dev",
    "*.riker.replit.dev",
    "*.kirk.replit.dev",
    "*.picard.replit.dev",
    "*.janeway.replit.dev",
    "*.spock.replit.dev",
    "*.repl.co",
    ...(replitDevDomain ? [replitDevDomain] : []),
  ],
};

export default nextConfig;

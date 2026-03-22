import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "better-auth"],
  allowedDevOrigins: [
    "*.replit.dev",
    "*.worf.replit.dev",
    "*.repl.co",
  ],
};

export default nextConfig;

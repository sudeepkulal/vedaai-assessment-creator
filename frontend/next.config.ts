import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 'standalone' bundles only what's needed, making it ideal for Docker/Render deployments
  output: "standalone",
};

export default nextConfig;

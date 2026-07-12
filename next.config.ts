import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  output: "standalone",
  experimental: {
    sri: {
      algorithm: 'sha256',
    },
  },
};

export default nextConfig;

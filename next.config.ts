import type { NextConfig } from "next";

const isVercelBuild = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  // Vercel supplies its own deployment adapter and does not need the
  // standalone server bundle. Keeping standalone for self-hosted builds avoids
  // the adapter/standalone NFT finalization conflict on Vercel.
  ...(isVercelBuild ? {} : { output: "standalone" }),
};

export default nextConfig;

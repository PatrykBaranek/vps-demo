import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const isVercelBuild = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  // Vercel supplies its own deployment adapter and does not need the
  // standalone server bundle. Keeping standalone for self-hosted builds avoids
  // the adapter/standalone NFT finalization conflict on Vercel.
  ...(isVercelBuild ? {} : { output: "standalone" }),
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    // Source map uploads are enabled automatically when a build auth token is
    // available, but local builds should remain self-contained.
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  silent: !process.env.CI,
});

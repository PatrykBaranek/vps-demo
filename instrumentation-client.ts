import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // The browser DSN is intentionally public. NEXT_PUBLIC_* values are embedded
  // into the client bundle during `next build`.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

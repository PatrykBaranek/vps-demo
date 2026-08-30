This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Sentry

Sentry is configured for browser, Node.js, and Edge runtimes with error monitoring and
performance tracing. Set the following values in `.env`:

```dotenv
NEXT_PUBLIC_SENTRY_DSN=your-public-dsn
SENTRY_DSN=your-public-dsn
```

`NEXT_PUBLIC_SENTRY_DSN` must be available when `next build` runs because Next.js embeds
public environment variables into the browser bundle. The Docker Compose build forwards
this value automatically. `SENTRY_DSN` is used by the server and Edge runtimes, with the
public DSN as a fallback.

For readable production stack traces, provide `SENTRY_ORG`, `SENTRY_PROJECT`, and
`SENTRY_AUTH_TOKEN` during the production build to upload source maps. Source-map upload
is disabled automatically when `SENTRY_AUTH_TOKEN` is not set.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

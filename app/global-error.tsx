'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, sans-serif',
            gap: '1rem',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div>
            <h2>Something went wrong</h2>
            <p>We could not load this page.</p>
          </div>
          <button type="button" onClick={() => reset()}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

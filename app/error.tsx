'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page could not be displayed.</p>
      </div>
      <Button variant="outline" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  );
}

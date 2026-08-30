"use client"

import { useEffect } from "react";
import { CircleAlertIcon, RefreshCwIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {

   useEffect(() => {
     console.error(error)
   },[error])

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>The RSS feed could not be displayed.</span>
        <Button variant="outline" size="sm" onClick={reset}><RefreshCwIcon data-icon="inline-start" />Try again</Button>
      </AlertDescription>
    </Alert>
  );
}

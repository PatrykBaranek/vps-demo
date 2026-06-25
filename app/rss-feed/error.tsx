"use client"

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {

   useEffect(() => {
     console.error(error)
   },[error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>
         Try again
      </button>
    </div>
  );
}
'use client';

import Link from "next/link";

export default function WebApiComponent() {
  return (
    <>
      <div>Client Component Web Api</div>
      <Link href="https://www.ollama.com" className="underline text-3xl">
        External link
      </Link>
    </>
  );
}
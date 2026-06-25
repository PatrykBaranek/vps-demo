import { Suspense } from "react";
import { SignInButton } from "@/components/SignInButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import Dither from '@/components/Dither';
import { AdSlot } from "@/components/AdSlot";

export default async function Home() {
  return (
    <>
      <section className="flex flex-col glass text-center p-6 gap-6">
        <div style={{ width: '100%', height: '600px', position: 'relative' }}>
          <Dither
            waveColor={[0.5,0.5,0.5]}
            enableMouseInteraction={false}
            mouseRadius={0.3}
            colorNum={4}
            waveAmplitude={0.3}
            waveFrequency={3}
            waveSpeed={0.05}
          />
        </div>

        <h1 className="text-3xl">Cache Components showcase</h1>
        <Suspense fallback={<div className="spin-in">Loading...</div>}>
          <SessionSection />
        </Suspense>
      </section>
      <AdSlot slot="0000000000" />
    </>
  );
}

async function SessionSection() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return (
      <div className="w-full h-full bg-black rounded-3xl p-4">
        <code className="text-left">
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </code>
      </div>
    );
  }

  return (
    <SignInButton />
  );
}

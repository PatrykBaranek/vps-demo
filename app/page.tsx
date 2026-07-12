import Link from "next/link";

import Dither from '@/components/Dither';
import { AdSlot } from "@/components/AdSlot";

export default function Home() {
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
        <p className="text-muted-foreground">
          A local-first Next.js demo. Data lives in your browser via Dexie
          (IndexedDB) — no sign-in, no server database. Explore the{' '}
          <Link href="/posts" className="underline underline-offset-2">posts</Link>,{' '}
          <Link href="/rss-feed" className="underline underline-offset-2">RSS feed</Link>, and{' '}
          <Link href="/dexie-showcase" className="underline underline-offset-2">Dexie showcase</Link>.
        </p>
      </section>
      <AdSlot slot="0000000000" />
    </>
  );
}

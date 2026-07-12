import Link from 'next/link';

export default function Home() {
  return (
    <section className="flex flex-col glass text-center p-10 gap-6 items-center">
      <h1 className="text-3xl">Cache Components showcase</h1>
      <p className="text-muted-foreground max-w-xl">
        A local-first Next.js demo. Data lives in your browser via Dexie
        (IndexedDB) — no sign-in, no server database. Explore the{' '}
        <Link href="/posts" className="underline underline-offset-2">
          posts
        </Link>
        ,{' '}
        <Link href="/rss-feed" className="underline underline-offset-2">
          RSS feed
        </Link>
        , and{' '}
        <Link href="/dexie-showcase" className="underline underline-offset-2">
          Dexie showcase
        </Link>
        .
      </p>
    </section>
  );
}

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import LinkButton from './LinkButton';

const links = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Posts' },
  { href: '/rss-feed', label: 'RSS Feed' },
  { href: '/tanstack-ai', label: 'Tanstack AI' },
  { href: '/web-api', label: 'Web API' },
  { href: '/terminal-gui', label: 'TerminalGUI' },
  { href: '/dexie-showcase', label: 'Dexie' },
];

export default async function Navbar() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <nav className="glass flex items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="size-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            V
          </span>
          <span className="text-sm font-semibold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            vps-demo
          </span>
        </Link>
        <ul className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <LinkButton href={href} label={label} />
            </li>
          ))}
        </ul>
        <Suspense fallback="TUDUM">
          <Avatar />
        </Suspense>
      </nav>
    </header>
  );
}

async function Avatar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Image
      className="rounded-4xl"
      height={30}
      width={30}
      src={
        session?.user?.image ??
        'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
      }
      loading="eager"
      alt="User avatar"
    />
  );
}

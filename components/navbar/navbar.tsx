import Link from 'next/link';

import LinkButton from './link-button';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Posts' },
  { href: '/rss-feed', label: 'RSS Feed' },
  { href: '/dexie-showcase', label: 'Dexie' },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Button variant="ghost">
          <Link href="/" prefetch>
            vps-demo
          </Link>
        </Button>
        <ul className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <LinkButton href={href} label={label} />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

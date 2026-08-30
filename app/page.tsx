import Link from 'next/link';
import { ArrowRightIcon, DatabaseIcon, NewspaperIcon, RssIcon } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  { href: '/posts', label: 'Posts', description: 'Browse local seeded content.', icon: NewspaperIcon },
  { href: '/rss-feed', label: 'RSS feed', description: 'Read and summarize gaming news.', icon: RssIcon },
  { href: '/dexie-showcase', label: 'Dexie showcase', description: 'Edit reactive browser data.', icon: DatabaseIcon },
];

export default function Home() {
  return (
    <section className="flex flex-col gap-8">
      <Card className="mx-auto w-full max-w-3xl text-center">
        <CardHeader>
          <CardTitle><h1 className="text-3xl">Local-first Next.js playground</h1></CardTitle>
          <CardDescription className="mx-auto max-w-xl">
            Explore browser-native data, cached content, RSS reading, and AI summaries—without an account or server database.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map(({ href, label, description, icon: Icon }) => (
          <Card key={href}>
            <CardHeader>
              <CardTitle><h2>{label}</h2></CardTitle>
              <CardDescription>{description}</CardDescription>
              <CardAction><Icon className="text-muted-foreground" /></CardAction>
            </CardHeader>
            <CardFooter>
              <Link href={href} className={buttonVariants({ variant: 'ghost' })}>
                Open {label}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

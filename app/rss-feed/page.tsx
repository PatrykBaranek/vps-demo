import { prisma } from '@/lib/prisma';
import { RssFeedClient } from './rss-feed-client';
import { DotsLoader } from './dots-loader';
import { Suspense } from 'react';

async function getSources() {
  'use cache';
  return await prisma.rssSource.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export default async function RssFeedPage() {
  const sources = await getSources();

  return (
    <Suspense fallback={<DotsLoader />}>
      <RssFeedClient initialSources={sources} />
    </Suspense>
  );
}

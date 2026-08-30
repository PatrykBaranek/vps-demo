'use cache';

import { cacheLife } from 'next/cache';
import { RssFeedClient } from './components/rss-feed-client';

export const metadata = {
  title: 'RSS Feed',
};

export default async function RssFeedPage() {
  cacheLife('hours');

  return <RssFeedClient />;
}

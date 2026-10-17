import Parser from 'rss-parser';

import { defaultRssSources } from './rss-sources';

export interface FeedItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content: string | null;
  creator?: string;
  isoDate?: string;
  categories?: string[];
  source: string;
}

const parser = new Parser();

// Fetches and merges the given feeds, newest first. A feed that fails to load
// is logged and skipped so one broken source does not empty the whole list.
export async function fetchFeedItems(urls: string[]): Promise<FeedItem[]> {
  const allItems: FeedItem[] = [];

  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);
      const sourceName = extractSourceName(url);
      const items = (feed.items || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        contentSnippet: item.contentSnippet || item.description,
        content: item.content || null,
        creator: item.creator || item.author,
        isoDate: item.isoDate || item.pubDate,
        categories: item.categories,
        source: sourceName,
      }));
      allItems.push(...items);
    } catch (err) {
      console.error(`Failed to fetch from ${url}:`, err);
    }
  }

  allItems.sort((a, b) => {
    const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
    const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
    return dateB - dateA;
  });

  return allItems;
}

const FEED_CACHE_MS = 10 * 60 * 1000;

let defaultFeed: { items: FeedItem[]; fetchedAt: number } | null = null;

// The default sources are the same for every user, so the server keeps one
// short-lived copy of them to summarize from instead of trusting client input.
export async function getDefaultFeedItems({ maxAgeMs = FEED_CACHE_MS } = {}): Promise<FeedItem[]> {
  if (defaultFeed && Date.now() - defaultFeed.fetchedAt < maxAgeMs) {
    return defaultFeed.items;
  }

  const items = await fetchFeedItems(defaultRssSources.map((source) => source.url));
  if (items.length > 0) {
    defaultFeed = { items, fetchedAt: Date.now() };
  }
  return items;
}

function extractSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}

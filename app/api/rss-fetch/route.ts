import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body as { urls: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs array is required' }, { status: 400 });
    }

    const allItems: any[] = [];

    for (const url of urls) {
      try {
        const feed = await parser.parseURL(url);
        const sourceName = extractSourceName(url);
        const items = (feed.items || []).map((item: any) => ({
          title: item.title,
          link: item.link,
          contentSnippet: item.contentSnippet || item.description,
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

    // Sort by date (newest first)
    allItems.sort((a, b) => {
      const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
      const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ items: allItems });
  } catch (error) {
    console.error('Failed to fetch RSS feeds:', error);
    return NextResponse.json({ error: 'Failed to fetch RSS feeds' }, { status: 500 });
  }
}

function extractSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}
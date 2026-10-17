import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import { fetchFeedItems } from '@/lib/rss';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body as { urls: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs array is required' }, { status: 400 });
    }

    const items = await fetchFeedItems(urls);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to fetch RSS feeds:', error);
    Sentry.captureException(error, {
      tags: { route: '/api/rss-fetch', method: 'POST' },
    });
    return NextResponse.json({ error: 'Failed to fetch RSS feeds' }, { status: 500 });
  }
}

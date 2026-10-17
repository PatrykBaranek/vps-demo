import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

import { briefingKey, refreshSummary, summaryLanguages } from '@/lib/ai-summary';
import { getDefaultFeedItems } from '@/lib/rss';
import { readSummary } from '@/lib/summary-store';

// A retry after a partial failure only regenerates the languages that failed.
const RECENTLY_REFRESHED_MS = 30 * 60 * 1000;

// Called on a schedule (the `summary-refresh` service in docker-compose.yml,
// or Vercel Cron) to pre-generate the "All categories" briefing in every
// language, so users read a stored summary instead of waiting for the model.
// Requires `Authorization: Bearer $CRON_SECRET`.
async function handler(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 });
  }
  if (!isAuthorized(req.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await getDefaultFeedItems({ maxAgeMs: 0 });
  if (items.length === 0) {
    return NextResponse.json({ error: 'No feed items fetched' }, { status: 502 });
  }

  // Sequential on purpose: free OpenRouter models are rate-limited per minute.
  const results: Record<string, 'ok' | 'skipped' | 'failed'> = {};
  for (const language of summaryLanguages) {
    const key = briefingKey(language, 'all');
    const stored = await readSummary(key);
    if (stored && Date.now() - stored.createdAt < RECENTLY_REFRESHED_MS) {
      results[language] = 'skipped';
      continue;
    }
    try {
      await refreshSummary(key, items, language);
      results[language] = 'ok';
    } catch {
      // Already logged and reported to Sentry; the previous briefing stays.
      results[language] = 'failed';
    }
  }

  const failed = Object.values(results).includes('failed');
  return NextResponse.json({ results }, { status: failed ? 502 : 200 });
}

function isAuthorized(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header ?? '');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export { handler as GET, handler as POST };

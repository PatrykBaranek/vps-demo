import { NextResponse } from 'next/server';

import {
  articleKey,
  BRIEFING_MAX_AGE_MS,
  briefingKey,
  isSummaryLanguage,
  summaryResponse,
} from '@/lib/ai-summary';
import { getDefaultFeedItems } from '@/lib/rss';

type SummaryRequest =
  | { kind: 'briefing'; language?: unknown; category?: unknown }
  | { kind: 'article'; language?: unknown; link?: unknown };

// Summaries are shared by every user, so they are only ever generated from
// the server's own copy of the feed — the client just names what it wants.
export async function POST(req: Request) {
  const body = (await req.json()) as SummaryRequest;

  if (!isSummaryLanguage(body.language)) {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
  }
  const language = body.language;

  if (body.kind === 'briefing') {
    const category = typeof body.category === 'string' && body.category ? body.category : 'all';
    const feed = await getDefaultFeedItems();
    const items =
      category === 'all' ? feed : feed.filter((item) => item.categories?.includes(category));
    if (items.length === 0) {
      return NextResponse.json({ error: 'No articles to summarize' }, { status: 404 });
    }
    return summaryResponse(briefingKey(language, category), items, language, BRIEFING_MAX_AGE_MS);
  }

  if (body.kind === 'article' && typeof body.link === 'string' && body.link) {
    const link = body.link;
    let item = (await getDefaultFeedItems()).find((it) => it.link === link);
    // The article may be newer than the server's cached copy of the feed.
    item ??= (await getDefaultFeedItems({ maxAgeMs: 60 * 1000 })).find((it) => it.link === link);
    if (!item) {
      return NextResponse.json({ error: 'Article not found in the feed' }, { status: 404 });
    }
    return summaryResponse(articleKey(language, link), [item], language);
  }

  return NextResponse.json({ error: 'Invalid summary request' }, { status: 400 });
}

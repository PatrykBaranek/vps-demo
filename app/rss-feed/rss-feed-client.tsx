'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { appDb } from '@/lib/app-db';
import { AIBriefingPanel } from './ai-briefing-panel';
import { BookmarkButton } from './bookmark-button';
import { PerArticleSummary } from './per-article-summary';
import { DotsLoader } from './dots-loader';

type FeedItem = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  creator?: string;
  isoDate?: string;
  categories?: string[];
  source?: string;
};

const CACHE_KEY = 'rss-feed-cache';

export function RssFeedClient() {
  const sources = useLiveQuery(() =>
    appDb.rssSources.filter((s) => s.isActive).sortBy('name'),
  );
  const [selectedSource, setSelectedSource] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch feeds once sources are loaded and whenever the selected source changes
  useEffect(() => {
    if (sources) fetchFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource, sources]);

  // Clear cache on mount to ensure fresh data
  useEffect(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  async function fetchFeeds() {
    if (!sources) return;

    setLoading(true);
    setError(null);

    try {
      const sourcesToFetch =
        selectedSource === 'all'
          ? sources
          : sources.filter((s) => s.id === selectedSource);

      const urls = sourcesToFetch.map((s) => s.url);

      if (urls.length === 0) {
        setFeedItems([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/rss-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feeds: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid response format from RSS API');
      }

      setFeedItems(data.items);
    } catch (err: any) {
      console.error('Failed to fetch feeds:', err);
      setError(err.message ?? 'Failed to fetch feeds');
    } finally {
      setLoading(false);
    }
  }

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    feedItems.forEach((item) => {
      item.categories?.forEach((cat) => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, [feedItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return feedItems.filter((item) => {
      if (
        selectedSource !== 'all' &&
        item.source !== sources?.find((s) => s.id === selectedSource)?.name
      ) {
        return false;
      }
      if (
        selectedCategory !== 'all' &&
        !item.categories?.includes(selectedCategory)
      ) {
        return false;
      }
      return true;
    });
  }, [feedItems, selectedSource, selectedCategory, sources]);

  function formatDate(isoDate?: string) {
    if (!isoDate) return null;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoDate));
  }

  if (sources === undefined || loading) {
    return <DotsLoader />;
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8">
        Error: {error}
        <button
          onClick={fetchFeeds}
          className="ml-4 text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="max-w-6xl mx-auto pb-24">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <h1 className="text-base font-semibold text-white">
            Latest Articles
          </h1>
          {/* Source Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSource('all')}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedSource === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              All Sources
            </button>
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source.id)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedSource === source.id
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {source.name}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-400 border border-white/10 focus:outline-none focus:border-white/30"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <span className="text-xs text-gray-600 ml-auto">
            {filteredItems.length} articles
          </span>
        </div>

        {/* Feed Items */}
        <div className="rounded-3xl border border-white/10 overflow-hidden bg-black">
          <ul className="divide-y divide-white/5">
            {filteredItems.map((item) => (
              <li
                key={item.link}
                className="group px-5 py-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  {item.categories?.[0] && (
                    <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-1.5">
                      {item.categories[0]}
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 block text-sm font-medium text-gray-200 group-hover:text-white leading-snug mb-1.5 hover:underline underline-offset-2"
                    >
                      {item.title}
                    </a>
                    <div className="flex gap-2 shrink-0">
                      <BookmarkButton
                        articleLink={item.link || ''}
                        articleTitle={item.title || ''}
                        articleSource={item.source || ''}
                      />
                      <PerArticleSummary item={item} />
                    </div>
                  </div>
                  {item.contentSnippet && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                      {item.contentSnippet}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-gray-700">
                    {item.source && (
                      <>
                        <span className="text-blue-500">{item.source}</span>
                        <span>·</span>
                      </>
                    )}
                    {item.creator && <span>{item.creator}</span>}
                    {item.creator && item.isoDate && <span>·</span>}
                    {item.isoDate && <span>{formatDate(item.isoDate)}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AIBriefingPanel items={filteredItems} />
    </>
  );
}

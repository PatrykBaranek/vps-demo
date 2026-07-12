'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { appDb } from '@/lib/app-db';
import { ExternalLink } from 'lucide-react';
import { AIBriefingPanel } from './ai-briefing-panel';
import { BookmarkButton } from './bookmark-button';
import { PerArticleSummary } from './per-article-summary';
import { ArticleDrawer } from './article-drawer';
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

export function RssFeedClient() {
  const sources = useLiveQuery(() =>
    appDb.rssSources.filter((s) => s.isActive).sortBy('name'),
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | null>(null);

  // Fetch feeds once sources are loaded
  useEffect(() => {
    if (sources) fetchFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources]);

  async function fetchFeeds() {
    if (!sources) return;

    setLoading(true);
    setError(null);

    try {
      const urls = sources.map((s) => s.url);

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
    if (selectedCategory === 'all') return feedItems;
    return feedItems.filter((item) =>
      item.categories?.includes(selectedCategory),
    );
  }, [feedItems, selectedCategory]);

  function formatDate(isoDate?: string) {
    if (!isoDate) return null;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoDate));
  }

  function handleArticleClick(item: FeedItem) {
    setSelectedArticle(item);
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
      <section className="max-w-4xl mx-auto pb-24">
        {/* Header & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-lg font-semibold text-white">
            RSS Feed
          </h1>

          <div className="flex items-center gap-3">
            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/10 text-gray-300 border border-white/10 focus:outline-none focus:border-white/30"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            <span className="text-xs text-gray-600">
              {filteredItems.length} articles
            </span>
          </div>
        </div>

        {/* Feed Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-600 text-sm">
            No articles found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <article
                key={item.link}
                className="group rounded-2xl border border-white/10 bg-black/40 p-4 hover:bg-black/60 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => handleArticleClick(item)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-1.5">
                      {item.source && (
                        <span className="text-blue-400 font-medium">{item.source}</span>
                      )}
                      {item.source && item.isoDate && <span>·</span>}
                      {item.isoDate && <span>{formatDate(item.isoDate)}</span>}
                      {item.creator && (
                        <>
                          <span>·</span>
                          <span className="truncate">{item.creator}</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-sm font-medium text-gray-200 group-hover:text-white leading-snug mb-1.5">
                      {item.title}
                    </h2>

                    {/* Snippet */}
                    {item.contentSnippet && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {item.contentSnippet}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    <BookmarkButton
                      articleLink={item.link || ''}
                      articleTitle={item.title || ''}
                      articleSource={item.source || ''}
                    />
                    <PerArticleSummary item={item} />
                    <span
                      className="p-1 rounded hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="size-4" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <AIBriefingPanel items={filteredItems} />
      <ArticleDrawer
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  );
}

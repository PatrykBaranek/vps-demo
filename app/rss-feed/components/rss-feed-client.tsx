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
  const [language, setLanguage] = useState<'en' | 'pl' | 'de'>('pl');

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
      {/* Simplified header */}
      <header className="max-w-6xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gaming News Feed</h1>
            <div className="flex gap-4 text-xs text-white/40 font-mono mt-1">
              <span>{filteredItems.length} articles</span>
              <span>{sources?.length ?? 0} sources</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(['en', 'pl', 'de'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={[
                  'px-2 py-1 text-[11px] font-bold tracking-wider uppercase rounded transition-all duration-200',
                  language === lang
                    ? 'text-[#00f5ff] border border-[#00f5ff]/40 bg-[#00f5ff]/10'
                    : 'text-white/30 border border-transparent hover:text-white/60',
                ].join(' ')}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        <div className="h-px bg-white/10 mt-4" />
      </header>

      {/* 3-column layout */}
      <div className="max-w-6xl mx-auto w-full flex gap-6">
        {/* Left: Categories sidebar */}
        <aside className="w-36 shrink-0 sticky top-24 self-start">
          <div className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mb-3">
            Categories
          </div>
          <div className="space-y-0.5">
            {[
              { key: 'all', label: 'All' },
              ...categories.map((cat) => ({ key: cat, label: cat })),
            ].map(({ key, label }) => {
              const active = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                    active
                      ? 'text-[#ff2d95] bg-[#ff2d95]/10 border-l-2 border-[#ff2d95]'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  {active ? '\u25CF' : '\u25CB'} {label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center: Articles grid */}
        <main className="flex-1 min-w-0">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-5xl font-bold text-white/5 font-mono">
                NO SIGNAL
              </div>
              <div className="text-xs text-white/20 font-mono tracking-[0.3em] animate-pulse">
                AWAITING TRANSMISSION...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item, index) => (
                <article
                  key={item.link}
                  className="bg-[#0a0e17]/80 border border-[#1a2640] hover:border-[#00f5ff]/40 rounded-lg p-5 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleArticleClick(item)}
                  style={{
                    animation: 'fade-slide-up 0.5s ease-out forwards',
                    animationDelay: `${index * 80}ms`,
                    opacity: 0,
                  }}
                >
                  <div className="flex flex-col h-full">
                    {/* Source chip */}
                    <div className="flex items-center gap-2 mb-3">
                      {item.source && (
                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#00f5ff] border border-[#00f5ff]/30 rounded">
                          {item.source}
                        </span>
                      )}
                      {item.isoDate && (
                        <span className="text-[11px] text-[#ffb347] font-mono">
                          {formatDate(item.isoDate)}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-[#00f5ff] transition-colors">
                      {item.title}
                    </h2>

                    {/* Creator */}
                    {item.creator && (
                      <p className="text-xs text-[#ffb347]/60 font-mono mb-2">
                        {'>'} By {item.creator}
                      </p>
                    )}

                    {/* Snippet */}
                    {item.contentSnippet && (
                      <p className="text-xs text-white/40 leading-relaxed line-clamp-3 mb-4 flex-1">
                        {item.contentSnippet}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 pt-2 border-t border-[#1a2640]">
                      <BookmarkButton
                        articleLink={item.link || ''}
                        articleTitle={item.title || ''}
                        articleSource={item.source || ''}
                      />
                      <PerArticleSummary item={item} />
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-[#00f5ff] hover:drop-shadow-[0_0_3px_#00f5ff]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

      </div>

      <AIBriefingPanel items={filteredItems} language={language} />

      <ArticleDrawer
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookOpenIcon, ExternalLinkIcon, NewspaperIcon, RefreshCwIcon, RssIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { appDb } from '@/lib/app-db';
import { AIBriefingPanel } from './ai-briefing-panel';
import { ArticleDrawer } from './article-drawer';
import { BookmarkButton } from './bookmark-button';
import { DotsLoader } from './dots-loader';
import { PerArticleSummary } from './per-article-summary';

type FeedItem = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string | null;
  creator?: string;
  isoDate?: string;
  categories?: string[];
  source?: string;
};

type Language = 'en' | 'pl' | 'de';

export function RssFeedClient() {
  const sources = useLiveQuery(() => appDb.rssSources.filter((source) => source.isActive).sortBy('name'));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | null>(null);
  const [language, setLanguage] = useState<Language>('pl');

  useEffect(() => {
    if (sources) void fetchFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources]);

  async function fetchFeeds() {
    if (!sources) return;

    setLoading(true);
    setError(null);

    try {
      const urls = sources.map((source) => source.url);
      if (urls.length === 0) {
        setFeedItems([]);
        return;
      }

      const response = await fetch('/api/rss-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) throw new Error(`Failed to fetch RSS feeds: ${response.status}`);

      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('items' in data) || !Array.isArray(data.items)) {
        throw new Error('Invalid response format from RSS API');
      }

      setFeedItems(data.items as FeedItem[]);
    } catch (caughtError) {
      console.error('Failed to fetch feeds:', caughtError);
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to fetch feeds');
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const values = new Set<string>();
    feedItems.forEach((item) => item.categories?.forEach((category) => values.add(category)));
    return Array.from(values).sort();
  }, [feedItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return feedItems;
    return feedItems.filter((item) => item.categories?.includes(selectedCategory));
  }, [feedItems, selectedCategory]);

  function formatDate(isoDate?: string) {
    if (!isoDate) return null;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoDate));
  }

  if (sources === undefined || loading) return <DotsLoader />;

  if (error) {
    return (
      <Alert variant="destructive">
        <RssIcon />
        <AlertTitle>Could not load the feed</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void fetchFeeds()}>
            <RefreshCwIcon data-icon="inline-start" />Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary"><RssIcon data-icon="inline-start" />Live sources</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Gaming news feed</h1>
            <p className="text-sm text-muted-foreground">{filteredItems.length} articles from {sources.length} sources</p>
          </div>
          <ToggleGroup
            value={[language]}
            onValueChange={(value) => value[0] && setLanguage(value[0] as Language)}
            variant="outline"
            aria-label="Summary language"
          >
            {(['en', 'pl', 'de'] as const).map((item) => <ToggleGroupItem key={item} value={item}>{item.toUpperCase()}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        <Separator />
      </header>

      <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Filter the current feed.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-80">
                <div className="flex flex-col gap-1 pr-3">
                  {[{ key: 'all', label: 'All' }, ...categories.map((category) => ({ key: category, label: category }))].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'secondary' : 'ghost'}
                      className="justify-start"
                      onClick={() => setSelectedCategory(key)}
                    >
                      <span className="truncate">{label}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        <main className="min-w-0">
          {filteredItems.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><NewspaperIcon /></EmptyMedia>
                <EmptyTitle>No articles found</EmptyTitle>
                <EmptyDescription>Choose another category or refresh the feed.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredItems.map((item, index) => (
                <Card
                  key={item.link ?? `${item.title}-${index}`}
                  className="transition-colors hover:bg-muted/30"
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.source && <Badge variant="secondary">{item.source}</Badge>}
                      {item.isoDate && <Badge variant="outline">{formatDate(item.isoDate)}</Badge>}
                    </div>
                    <CardTitle><h2>{item.title || 'Untitled article'}</h2></CardTitle>
                    {item.creator && <CardDescription>By {item.creator}</CardDescription>}
                  </CardHeader>
                  {item.contentSnippet && <CardContent><p className="line-clamp-3 text-sm text-muted-foreground">{item.contentSnippet}</p></CardContent>}
                  <CardFooter className="gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(item)}>
                      <BookOpenIcon data-icon="inline-start" />Read article
                    </Button>
                    <BookmarkButton articleLink={item.link || ''} articleTitle={item.title || ''} articleSource={item.source || ''} />
                    <PerArticleSummary item={item} language={language} />
                    {item.link && (
                      <a
                        className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        aria-label="Open original article"
                      >
                        <ExternalLinkIcon />
                      </a>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <AIBriefingPanel items={filteredItems} language={language} />
      <ArticleDrawer article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </>
  );
}

'use client';

import { useState } from 'react';
import { MessageSquareTextIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { appDb } from '@/lib/app-db';
import { AIResponse } from './ai-response';
import { fetchSummary } from './fetch-summary';

interface PerArticleSummaryProps {
  item: {
    title?: string;
    link: string;
  };
  language: 'en' | 'pl' | 'de';
}

export function PerArticleSummary({ item, language }: PerArticleSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    if (summary || loading) return;

    const cacheKey = `article_${language}_${item.link}`;
    const cached = await appDb.aiSummaries.where('cacheKey').equals(cacheKey).first();
    if (cached && Date.now() - cached.createdAt < 86400000) {
      setSummary(cached.summary);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullSummary = await fetchSummary(
        { kind: 'article', language, link: item.link },
        (chunk) => setSummary(prev => prev + chunk),
      );

      await appDb.aiSummaries.put({ cacheKey, summary: fullSummary, createdAt: Date.now() });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
          if (!summary) void loadSummary();
        }}
        aria-label="Get AI summary"
      >
        <MessageSquareTextIcon />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClick={(event) => event.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>AI summary</DialogTitle>
            <DialogDescription>{item.title || 'Article summary'}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {loading && !summary && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner />Generating summary…</p>}
            {error && <Alert variant="destructive"><AlertTitle>Summary failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {!error && (summary || !loading) && <AIResponse summary={summary || 'No summary available.'} isStreaming={loading} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

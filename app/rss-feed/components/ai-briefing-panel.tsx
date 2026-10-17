'use client';

import React from 'react';
import { SparklesIcon } from 'lucide-react';

import { AIResponse } from './ai-response';
import { fetchSummary } from './fetch-summary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { appDb } from '@/lib/app-db';

interface AIBriefingPanelProps {
  category: string;
  language: 'en' | 'pl' | 'de';
}

const languageLabels: Record<string, string> = {
  en: 'English',
  pl: 'Polish',
  de: 'German',
};

export function AIBriefingPanel({
  category,
  language,
}: Readonly<AIBriefingPanelProps>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [output, setOutput] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const doFetch = React.useCallback(
    async (signal: AbortSignal) => {
      setOutput('');
      setIsStreaming(true);
      setError(null);

      const cacheKey = `briefing_${language}_${category}`;

      const cached = await appDb.aiSummaries
        .where('cacheKey')
        .equals(cacheKey)
        .first();
      if (cached && Date.now() - cached.createdAt < 3600000) {
        setOutput(cached.summary);
        setIsStreaming(false);
        return;
      }

      try {
        const fullSummary = await fetchSummary(
          { kind: 'briefing', language, category },
          (chunk) => setOutput((prev) => prev + chunk),
          signal,
        );

        await appDb.aiSummaries.put({
          cacheKey,
          summary: fullSummary,
          createdAt: Date.now(),
        });
      } catch (caughtError) {
        if (
          !(
            caughtError instanceof DOMException &&
            caughtError.name === 'AbortError'
          )
        ) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unexpected error',
          );
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [category, language],
  );

  React.useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    doFetch(controller.signal);
    return () => controller.abort();
  }, [doFetch, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed right-6 bottom-6">
        <SheetTrigger
          render={<Button size="icon-lg" aria-label="Open AI briefing" />}
        >
          <SparklesIcon />
        </SheetTrigger>
      </div>
      <SheetContent side="left">
        <SheetHeader>
          <Badge variant="secondary">
            <SparklesIcon data-icon="inline-start" />
            {languageLabels[language]}
          </Badge>
          <SheetTitle>AI feed briefing</SheetTitle>
          <SheetDescription>
            A summary of the newest articles in{' '}
            {category === 'all' ? 'all categories' : category}.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1 px-4">
          {isStreaming && !output && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              Preparing briefing…
            </p>
          )}
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Briefing failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <AIResponse summary={output} isStreaming={isStreaming} />
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

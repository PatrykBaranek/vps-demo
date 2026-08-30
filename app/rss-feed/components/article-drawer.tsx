'use client';

import { ExternalLinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ArticleDrawerProps {
  article: {
    title?: string;
    link?: string;
    contentSnippet?: string;
    content?: string | null;
    creator?: string;
    isoDate?: string;
    source?: string;
  } | null;
  onClose: () => void;
}

function formatDate(isoDate?: string) {
  if (!isoDate) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

export function ArticleDrawer({
  article,
  onClose,
}: Readonly<ArticleDrawerProps>) {
  const hasHtmlContent = !!article?.content;
  const displayContent = article?.content ?? article?.contentSnippet ?? null;

  return (
    <Sheet
      open={!!article}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="left"
        className="flex flex-col gap-0 p-0 sm:max-w-[90vw] lg:max-w-7xl"
      >
        <SheetHeader>
          <Badge variant="secondary">{article?.source || 'Article'}</Badge>
          <SheetTitle>{article?.title || 'Article'}</SheetTitle>
          <SheetDescription>
            {[article?.creator, article?.isoDate && formatDate(article.isoDate)]
              .filter(Boolean)
              .join(' · ') || 'Article details'}
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <ScrollArea className="min-h-0 flex-1 px-6">
          {displayContent &&
            (hasHtmlContent ? (
              <div
                className="article-content py-4"
                dangerouslySetInnerHTML={{ __html: article.content! }}
              />
            ) : (
              <p className="py-4 leading-7 whitespace-pre-line text-muted-foreground">
                {displayContent}
              </p>
            ))}
        </ScrollArea>
        <SheetFooter>
          {article?.link && (
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants()}
            >
              <ExternalLinkIcon data-icon="inline-start" />
              Open original article
            </a>
          )}
          <p className="text-xs text-muted-foreground">
            External sites may enforce their own security policies.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { ExternalLink } from 'lucide-react';
import {
  Sheet,
  SheetContent,
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

export function ArticleDrawer({ article, onClose }: Readonly<ArticleDrawerProps>) {
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
        side="right"
        className="flex flex-col gap-0 p-0 sm:max-w-5xl"
      >
        {/* Mini header bar */}
        <SheetHeader className="border-b px-5 py-4 shrink-0">
          <p className="text-xs text-muted-foreground truncate">
            {article?.source || 'Article'}
          </p>
          <SheetTitle className="text-sm font-semibold truncate">
            {article?.title}
          </SheetTitle>
        </SheetHeader>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-foreground leading-snug mb-4">
            {article?.title}
          </h2>

          {/* Meta row */}
          {(article?.creator || article?.isoDate) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-6">
              {article?.source && (
                <span className="text-blue-400 font-medium">{article.source}</span>
              )}
              {article?.creator && <span>{article.creator}</span>}
              {article?.isoDate && (
                <>
                  {article?.creator && <span>·</span>}
                  <span>{formatDate(article.isoDate)}</span>
                </>
              )}
            </div>
          )}

          {/* Article content: full HTML if available, otherwise plain snippet */}
          {displayContent && (
            <div className="mb-8">
              {hasHtmlContent ? (
                <div
                  className="article-content text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content! }}
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {displayContent}
                </p>
              )}
            </div>
          )}

          {/* Open in new tab */}
          {article?.link && (
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              <ExternalLink className="size-4" />
              Open original article
            </a>
          )}
        </div>

        {/* Bottom bar */}
        <div className="px-5 py-3 border-t shrink-0">
          <p className="text-[11px] text-muted-foreground text-center">
            External sites may not be embeddable due to security policies.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

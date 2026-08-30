'use client';

import { BookmarkCheckIcon, BookmarkIcon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '@/components/ui/button';
import { appDb } from '@/lib/app-db';

interface BookmarkButtonProps {
  articleLink: string;
  articleTitle: string;
  articleSource: string;
}

export function BookmarkButton({ articleLink, articleTitle, articleSource }: BookmarkButtonProps) {
  const bookmark = useLiveQuery(
    () => appDb.bookmarks.where('articleLink').equals(articleLink).first(),
    [articleLink],
  );
  const isBookmarked = !!bookmark;

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (bookmark) {
        await appDb.bookmarks.delete(bookmark.id);
      } else {
        await appDb.bookmarks.add({
          articleLink,
          articleTitle,
          articleSource,
          createdAt: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  return (
    <Button
      type="button"
      variant={isBookmarked ? 'secondary' : 'ghost'}
      size="icon-sm"
      onClick={toggleBookmark}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
    >
      {isBookmarked ? (
        <BookmarkCheckIcon />
      ) : (
        <BookmarkIcon />
      )}
    </Button>
  );
}

'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
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

  const toggleBookmark = async () => {
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
    <button
      onClick={toggleBookmark}
      className="p-1 rounded hover:bg-white/10 transition-colors"
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4 text-yellow-500" />
      ) : (
        <Bookmark className="w-4 h-4 text-gray-500 hover:text-gray-300" />
      )}
    </button>
  );
}

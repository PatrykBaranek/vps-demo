'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface BookmarkButtonProps {
  articleLink: string;
  articleTitle: string;
  articleSource: string;
}

export function BookmarkButton({ articleLink, articleTitle, articleSource }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = authClient.useSession();

  const toggleBookmark = async () => {
    if (!session?.user) {
      alert('Please sign in to bookmark articles');
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        await fetch('/api/bookmarks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleLink }),
        });
        setIsBookmarked(false);
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleLink, articleTitle, articleSource }),
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
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
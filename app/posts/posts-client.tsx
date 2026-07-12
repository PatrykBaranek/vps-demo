'use client';

import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { appDb } from '@/lib/app-db';

export function PostsList() {
  const posts = useLiveQuery(() =>
    appDb.posts
      .orderBy('createdAt')
      .reverse()
      .filter((post) => post.published)
      .toArray(),
  );

  if (posts === undefined) {
    return <div className="glass p-4">Loading posts...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {posts.map((post) => {
        return (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="glass flex flex-col items-start gap-2 px-4 py-4 group hover:bg-white/20 transition-colors"
          >
            <span className="text-sm font-medium">{post.title}</span>
            <p className="text-muted-foreground text-sm">{post.excerpt}</p>
          </Link>
        );
      })}
    </div>
  );
}

'use client';

import { notFound } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { appDb } from '@/lib/app-db';

export function PostContent({ postId }: Readonly<{ postId: number }>) {
  const post = useLiveQuery(
    async () => (await appDb.posts.get(postId)) ?? null,
    [postId],
  );

  if (post === undefined) {
    return <div className="glass p-6">Loading post...</div>;
  }

  if (post === null) {
    notFound();
  }

  const publishedAt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(post.createdAt);

  return (
    <article className="glass space-y-4 p-6">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Published {publishedAt}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">{post.title}</h1>
      <p className="text-lg text-muted-foreground">{post.excerpt}</p>
      <div className="prose prose-invert max-w-none">
        <p>{post.content}</p>
      </div>
    </article>
  );
}

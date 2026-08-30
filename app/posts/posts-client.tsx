'use client';

import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowRightIcon, FileTextIcon } from 'lucide-react';

import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
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
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-36" />)}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><FileTextIcon /></EmptyMedia>
          <EmptyTitle>No posts yet</EmptyTitle>
          <EmptyDescription>Published posts will appear here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        return (
          <Link key={post.id} href={`/posts/${post.id}`} className="group rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Card className="h-full transition-colors group-hover:bg-muted/50">
              <CardHeader>
                <CardTitle><h2>{post.title}</h2></CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
                <CardAction><ArrowRightIcon className="text-muted-foreground" /></CardAction>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

'use client';

import { notFound } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { appDb } from '@/lib/app-db';

export function PostContent({ postId }: Readonly<{ postId: number }>) {
  const post = useLiveQuery(
    async () => (await appDb.posts.get(postId)) ?? null,
    [postId],
  );

  if (post === undefined) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (post === null) {
    notFound();
  }

  const publishedAt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(post.createdAt);

  return (
    <article>
      <Card>
        <CardHeader>
          <Badge variant="outline">Published {publishedAt}</Badge>
          <CardTitle><h1 className="text-4xl">{post.title}</h1></CardTitle>
          <CardDescription>{post.excerpt}</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="leading-7"><p>{post.content}</p></CardContent>
      </Card>
    </article>
  );
}

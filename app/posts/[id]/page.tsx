import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cacheLife } from 'next/cache';

interface Props {
  params: Promise<{ id: string }>;
}

async function getPost(postId: number) {
  'use cache';
  cacheLife('hours');

  return prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      title: true,
      excerpt: true,
      content: true,
      createdAt: true,
    },
  });
}


export default async function PostPage({ params }: Readonly<Props>) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId)) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="glass p-6">Loading post...</div>}>
      <PostContent postId={postId} />
    </Suspense>
  );
}

async function PostContent({ postId }: Readonly<{ postId: number }>) {
  const post = await getPost(postId);

  if (!post) {
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
import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { cacheTag } from 'next/cache';

async function getPosts() {
  'use cache';
  cacheTag('post');

  return prisma.post.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
    },
  });
}

export default async function PostsPage() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-muted-foreground text-sm uppercase tracking-widest mb-1">
          Browse
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Posts</h1>
      </div>

      <Suspense fallback={<div className="glass p-4">Loading posts...</div>}>
        <PostsList />
      </Suspense>
    </section>
  );
}

async function PostsList() {
  const posts = await getPosts();

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
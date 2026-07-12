import { notFound } from 'next/navigation';
import { PostContent } from './post-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: Readonly<Props>) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId)) {
    notFound();
  }

  return <PostContent postId={postId} />;
}

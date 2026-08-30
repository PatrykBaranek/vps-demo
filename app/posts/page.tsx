import { PostsList } from './posts-client';

export const metadata = {
  title: 'Posts',
};

export default function PostsPage() {
  return (
    <section>
      <div className="mb-8 flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Browse
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Posts</h1>
      </div>

      <PostsList />
    </section>
  );
}

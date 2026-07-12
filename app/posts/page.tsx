import { PostsList } from './posts-client';

export const metadata = {
  title: 'Posts',
};

export default function PostsPage() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-muted-foreground text-sm uppercase tracking-widest mb-1">
          Browse
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Posts</h1>
      </div>

      <PostsList />
    </section>
  );
}

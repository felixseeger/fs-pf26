import {
  PageHeaderSkeleton,
  PostListSkeleton,
} from '@/components/ui/LoadingSkeleton';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-background font-sans" suppressHydrationWarning>
      <main className="max-w-6xl mx-auto px-6 py-20">
        <PageHeaderSkeleton />
        <PostListSkeleton count={6} />
      </main>
    </div>
  );
}

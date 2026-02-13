import {
  PageHeaderSkeleton,
  PortfolioGridSkeleton,
} from '@/components/ui/LoadingSkeleton';

export default function PortfolioLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
      <main className="max-w-6xl mx-auto px-6 py-20">
        <PageHeaderSkeleton />
        <PortfolioGridSkeleton count={6} />
      </main>
    </div>
  );
}

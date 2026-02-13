import {
  PageHeaderSkeleton,
  ServiceGridSkeleton,
} from '@/components/ui/LoadingSkeleton';

export default function ServicesLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
      <main className="max-w-6xl mx-auto px-6 py-20">
        <PageHeaderSkeleton />
        <ServiceGridSkeleton count={6} />
      </main>
    </div>
  );
}

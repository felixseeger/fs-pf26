import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Payment Successful',
  description: 'Your course enrollment was successful.',
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;
  const refId = session_id ? session_id.slice(-8) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-background py-24 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-6">
          Thank you for enrolling. You&apos;ll receive a confirmation email shortly
          with everything you need to get started.
        </p>
        {refId && (
          <p className="text-sm text-muted-foreground mb-8">
            Reference: <span className="font-mono">&hellip;{refId}</span>
          </p>
        )}
        <Link
          href="/courses"
          className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    </div>
  );
}

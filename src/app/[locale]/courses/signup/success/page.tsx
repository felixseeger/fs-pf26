import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { CheckCircle } from 'lucide-react';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const metadata: Metadata = {
  title: 'Payment Successful',
  description: 'Your course enrollment was successful.',
};

interface SuccessPageProps {
  searchParams: Promise<{ ref?: string; session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const rawRef = params.ref ?? params.session_id ?? null;
  const refId = rawRef ? rawRef.slice(-8) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-background pt-36 pb-24 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <Breadcrumb items={getBreadcrumbItems('/courses/signup/success', 'Success')} />
        </div>
        <div className="text-center">
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
    </div>
  );
}

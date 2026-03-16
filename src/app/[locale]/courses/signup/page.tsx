import { Metadata } from 'next';
import { getCourseBySlug } from '@/lib/wordpress/course';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { CourseSignupForm } from '@/components/course/CourseSignupForm';
import { OrderSummary } from '@/components/course/OrderSummary';

interface SignupPageProps {
  searchParams: Promise<{ course?: string; canceled?: string }>;
}

export async function generateMetadata({ searchParams }: SignupPageProps): Promise<Metadata> {
  const { course: slug } = await searchParams;
  if (!slug) return { title: 'Course Enrollment' };

  const item = await getCourseBySlug(slug);
  const name =
    item?.acf?.hero_headline?.replace(/<[^>]*>/g, '').trim() ||
    item?.title?.rendered?.replace(/<[^>]*>/g, '').trim() ||
    'Course';

  return {
    title: `Enroll – ${name}`,
    description: `Secure your spot in ${name}.`,
  };
}

export default async function CourseSignupPage({ searchParams }: SignupPageProps) {
  const { course: slug, canceled } = await searchParams;

  if (!slug) {
    return (
      <div className="min-h-screen bg-white dark:bg-background py-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <Breadcrumb items={getBreadcrumbItems('/courses/signup')} />
          </div>
          <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">No Course Selected</h1>
          <p className="text-muted-foreground">
            Please choose a course from our{' '}
            <a href="/courses" className="text-primary underline">
              courses page
            </a>
            .
          </p>
          </div>
        </div>
      </div>
    );
  }

  const item = await getCourseBySlug(slug);

  if (!item) {
    return (
      <div className="min-h-screen bg-white dark:bg-background py-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <Breadcrumb items={getBreadcrumbItems('/courses/signup')} />
          </div>
          <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Course Not Found</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t find that course. Browse our{' '}
            <a href="/courses" className="text-primary underline">
              available courses
            </a>
            .
          </p>
          </div>
        </div>
      </div>
    );
  }

  const acf = item.acf || {};
  const courseName =
    acf.hero_headline?.replace(/<[^>]*>/g, '').trim() ||
    item.title?.rendered?.replace(/<[^>]*>/g, '').trim() ||
    'Course';

  return (
    <div className="min-h-screen bg-white dark:bg-background pt-36 pb-12 px-4">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <Breadcrumb items={getBreadcrumbItems('/courses/signup', `Enroll – ${courseName}`)} />
        </div>
        {canceled && (
          <div className="mb-8 mx-auto max-w-lg rounded-xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950 p-4 text-center text-yellow-800 dark:text-yellow-200">
            Payment was canceled. You can try again whenever you&apos;re ready.
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-12">
          Secure Your Spot in &quot;{courseName}&quot;
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <CourseSignupForm courseSlug={slug} />
          </div>
          <div>
            <OrderSummary
              courseName={courseName}
              price={acf.price_amount}
              currency={acf.price_currency}
              priceType={acf.price_type}
              includes={acf.offer_includes}
              guaranteeHeading={acf.offer_guarantee_heading}
              guaranteeText={acf.offer_guarantee_text}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

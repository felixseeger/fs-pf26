import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getCourses } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';
import CourseCard from '@/components/course/CourseCard';
import DotMatrixStatic from '@/components/DotMatrix/DotMatrixStatic';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Learn with structured courses. Build skills with hands-on projects and clear outcomes.',
  alternates: { canonical: getCanonicalUrl('/courses') },
};

export default async function CoursesPage() {
  const items = await getCourses(100);

  return (
    <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
      <section className="relative min-h-screen overflow-hidden">
        <DotMatrixStatic color="#61dafb" dotSize={2} spacing={20} opacity={0.35} className="-z-10" />
        <main className="relative max-w-6xl mx-auto px-6 pt-36 pb-20 z-0">
        <div className="mb-8">
          <Breadcrumb items={getBreadcrumbItems('/courses')} />
        </div>
        <header className="max-w-3xl mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">
            Courses
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Structured learning to level up. From foundations to advanced workflows—one course at a time.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              No courses published yet. Check back soon.
            </p>
          </div>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <CourseCard item={item} />
              </li>
            ))}
          </ul>
        )}
        </main>
      </section>
    </div>
  );
}

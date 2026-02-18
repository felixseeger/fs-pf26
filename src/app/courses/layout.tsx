import { getCourses } from '@/lib/wordpress';
import CoursesMenu from '@/components/CoursesMenu/CoursesMenu';

export default async function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = await getCourses(100).catch(() => []);
  const courses = items.map((c) => ({
    slug: c.slug ?? '',
    title:
      (c.title?.rendered ?? '')
        .replace(/<[^>]*>/g, '')
        .trim() || c.slug ||
      'Course',
  }));

  return (
    <>
      <CoursesMenu
        logo="Courses"
        courses={courses}
        userflowLinks={[
          { href: '/courses', label: 'All courses' },
          { href: '/courses/signup', label: 'Sign up / Sign in' },
        ]}
      />
      {children}
    </>
  );
}

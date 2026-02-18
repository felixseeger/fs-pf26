import Breadcrumb from '@/components/ui/Breadcrumb';

/**
 * Manual test page for Breadcrumb.
 * Visit /breadcrumb-test to verify:
 * - Renders Home > Courses > My Course with chevrons
 * - Last item is current page (no link)
 * - Links are clickable
 */
export default function BreadcrumbTestPage() {
  const items = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Intro to AI Agents', path: '/courses/intro-to-ai-agents' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">Breadcrumb test</h1>
      <Breadcrumb items={items} />
      <p className="mt-6 text-zinc-500 text-sm">
        Check: Home and Courses are links; last item is plain text (current page). Use browser back and visit /courses/slug or /portfolio/slug for real usage.
      </p>
    </div>
  );
}

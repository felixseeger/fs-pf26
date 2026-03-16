export type BreadcrumbItem = { name: string; path: string };

const SEGMENT_LABELS: Record<string, string> = {
  courses: 'Courses',
  portfolio: 'Portfolio',
  blog: 'Blog',
  services: 'Services',
  about: 'About',
  'ueber-mich': 'Über mich',
  contact: 'Contact',
  resume: 'Resume',
  signup: 'Sign up',
  success: 'Success',
};

/**
 * Build breadcrumb items from a pathname.
 * @param pathname - e.g. '/courses/intro-to-ai-agents' or '/about'
 * @param lastItemName - Override the last segment's display name (e.g. course title, post title)
 */
export function getBreadcrumbItems(pathname: string, lastItemName?: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ name: 'Home', path: '/' }];

  const items: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];
  let path = '';

  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    const name = isLast && lastItemName ? lastItemName : (SEGMENT_LABELS[segments[i]] ?? formatSlug(segments[i]));
    items.push({ name, path });
  }

  return items;
}

function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

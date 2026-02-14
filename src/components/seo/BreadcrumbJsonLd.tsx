import { getCanonicalUrl } from '@/lib/site-config';

export type BreadcrumbItem = { name: string; path: string };

export default function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) return null;
  const list = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: getCanonicalUrl(item.path),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }}
    />
  );
}

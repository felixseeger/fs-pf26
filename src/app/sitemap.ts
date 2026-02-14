import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-config';
import { getPortfolioItems, getPosts, getAllServiceItems, getPages } from '@/lib/wordpress';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/resume`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const portfolioItems = await getPortfolioItems(500, 1).catch(() => []);
  const portfolioUrls: MetadataRoute.Sitemap = portfolioItems.map((item) => ({
    url: `${base}/portfolio/${item.slug}`,
    lastModified: item.modified ? new Date(item.modified) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const posts = await getPosts(500, 1).catch(() => []);
  const blogUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.modified ? new Date(post.modified) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const services = await getAllServiceItems().catch(() => []);
  const serviceUrls: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: s.modified ? new Date(s.modified) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const pages = await getPages(100, 1).catch(() => []);
  const pageSlugs = new Set(['about', 'contact', 'home', 'homepage', 'not-found']);
  const otherPages: MetadataRoute.Sitemap = pages
    .filter((p) => p.slug && !pageSlugs.has(p.slug))
    .map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.modified ? new Date(p.modified) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  return [...staticRoutes, ...portfolioUrls, ...blogUrls, ...serviceUrls, ...otherPages];
}

import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: 'Web design, development, and digital strategy. Portfolio, services, and contact.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/logo-light.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/logo-dark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}

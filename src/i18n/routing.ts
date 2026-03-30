import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always',
  // German localized slugs map to internal route segments.
  pathnames: {
    '/about': { de: '/ueber-mich' },
    '/contact': { de: '/kontakt' },
    '/services': { de: '/dienstleistungen' },
    '/services/[slug]': { de: '/dienstleistungen/[slug]' },
  },
});

export type Locale = (typeof routing.locales)[number];

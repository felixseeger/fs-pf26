import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always',
  // German: /de/ueber-mich → /about; English: /en/about
  pathnames: {
    '/about': { de: '/ueber-mich' },
  },
});

export type Locale = (typeof routing.locales)[number];

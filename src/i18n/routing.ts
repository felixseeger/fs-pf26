import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  // Use /de/ prefix only when NOT the default locale
  // → German: /about, /kontakt, …
  // → English: /en/about, /en/contact, …
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];

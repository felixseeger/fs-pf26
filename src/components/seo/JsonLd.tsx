import { getSiteUrl, DEFAULT_SOCIAL_URLS, SITE_NAME } from '@/lib/site-config';

const siteUrl = getSiteUrl();

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: siteUrl,
  sameAs: [
    DEFAULT_SOCIAL_URLS.linkedin,
    DEFAULT_SOCIAL_URLS.twitter,
    DEFAULT_SOCIAL_URLS.github,
  ].filter(Boolean),
};

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: siteUrl,
  publisher: { '@id': `${siteUrl}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/blog?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  url: siteUrl,
  sameAs: Object.values(DEFAULT_SOCIAL_URLS).filter(Boolean),
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([
          { ...organization, '@id': `${siteUrl}/#organization` },
          { ...website },
          { ...person },
        ]),
      }}
    />
  );
}

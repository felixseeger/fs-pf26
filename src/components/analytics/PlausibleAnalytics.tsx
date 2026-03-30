'use client';

import Script from 'next/script';

interface PlausibleAnalyticsProps {
  domain?: string;
}

/**
 * Plausible Analytics — privacy-first, cookieless analytics.
 * No GDPR/DSGVO consent required for basic page-view tracking.
 *
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to your domain (e.g. "felixseeger.de") to enable.
 * Enable the "revenue" goal extension via the Plausible dashboard to track purchase amounts.
 */
export default function PlausibleAnalytics({ domain }: PlausibleAnalyticsProps) {
  const d = domain ?? process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!d) return null;

  return (
    <Script
      defer
      data-domain={d}
      src="https://plausible.io/js/script.revenue.js"
      strategy="afterInteractive"
    />
  );
}

'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '@/components/providers/CookieConsentProvider';

type ConsentCategory = 'analytics' | 'marketing' | 'preferences';

interface ConditionalScriptProps {
  category: ConsentCategory;
  children: React.ReactNode;
}

/**
 * Conditionally renders children (usually Script components) based on consent
 */
export function ConditionalScript({ category, children }: ConditionalScriptProps) {
  const { consent, hasConsented } = useCookieConsent();

  if (!hasConsented || !consent[category]) {
    return null;
  }

  return <>{children}</>;
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

/**
 * Google Analytics 4 with consent management
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const { consent, hasConsented } = useCookieConsent();

  useEffect(() => {
    if (!hasConsented || !consent.analytics || !measurementId) return;

    // Load gtag script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', measurementId, {
      anonymize_ip: true, // DSGVO compliance
    });

    return () => {
      // Cleanup on unmount or consent withdrawal
      document.head.removeChild(script);
    };
  }, [hasConsented, consent.analytics, measurementId]);

  return null;
}

// Type declaration for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

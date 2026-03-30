'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Tracks a shop order conversion event on the thank-you page.
 * Fires once on mount. Revenue is tracked via WooCommerce Analytics / PayPal.
 */
export default function ShopConversionTracker() {
  useEffect(() => {
    trackEvent('Purchase', { channel: 'shop' });
  }, []);

  return null;
}

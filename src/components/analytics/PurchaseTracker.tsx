'use client';

import { useEffect } from 'react';
import { trackPurchase } from '@/lib/analytics';

interface PurchaseTrackerProps {
  amount?: number;
  currency?: string;
  productName?: string;
  orderId?: string;
  channel?: 'course' | 'shop';
}

/**
 * Drop-in tracker for post-purchase success / thank-you pages.
 * Fires once on mount. Renders nothing.
 */
export default function PurchaseTracker({
  amount,
  currency = 'EUR',
  productName,
  orderId,
  channel = 'shop',
}: PurchaseTrackerProps) {
  useEffect(() => {
    if (amount == null || amount <= 0) return;
    trackPurchase({ amount, currency, productName, orderId, channel });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

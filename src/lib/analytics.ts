/**
 * Analytics event tracking utilities.
 * Uses Plausible Analytics custom events with optional revenue tracking.
 *
 * Plausible exposes window.plausible() after the script loads.
 * Revenue props require the script variant: script.revenue.js
 */

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: {
        revenue?: { currency: string; amount: number };
        props?: Record<string, string | number | boolean>;
        callback?: () => void;
      }
    ) => void;
  }
}

export interface TrackPurchaseOptions {
  /** Revenue amount (numeric, e.g. 99.00) */
  amount: number;
  /** ISO 4217 currency code, e.g. "EUR" */
  currency?: string;
  /** Product or course name */
  productName?: string;
  /** Order / transaction ID */
  orderId?: string;
  /** Channel: "course" | "shop" */
  channel?: 'course' | 'shop';
}

/**
 * Track a completed purchase event.
 * Call this once on the confirmation/success page.
 */
export function trackPurchase({
  amount,
  currency = 'EUR',
  productName,
  orderId,
  channel = 'shop',
}: TrackPurchaseOptions): void {
  if (typeof window === 'undefined' || !window.plausible) return;

  const props: Record<string, string | number | boolean> = { channel };
  if (productName) props.product = productName;
  if (orderId) props.orderId = orderId;

  window.plausible('Purchase', {
    revenue: { currency, amount },
    props,
  });
}

/**
 * Track a generic custom event.
 */
export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined' || !window.plausible) return;
  window.plausible(name, props ? { props } : undefined);
}

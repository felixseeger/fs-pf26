/**
 * Stripe client singleton
 * Server-side only — no NEXT_PUBLIC_ prefix on env vars.
 */

import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  throw new Error(
    'STRIPE_SECRET_KEY is not set. Add it to .env.local (test key starts with sk_test_).'
  );
}

export const stripe = new Stripe(key, {
  typescript: true,
});

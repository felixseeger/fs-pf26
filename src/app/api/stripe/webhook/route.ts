import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderData = {
      email: session.customer_email || session.customer_details?.email || '',
      courseSlug: session.metadata?.courseSlug || '',
      wpCourseId: session.metadata?.wpCourseId || '',
      stripeSessionId: session.id,
      stripePaymentIntent:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || '',
      amount: session.amount_total ?? 0,
      currency: session.currency || '',
      status: session.payment_status || 'unknown',
    };

    // Post order to WordPress
    const wpUrl = (process.env.WORDPRESS_API_URL || '').replace(/\/+$/, '');
    const wpOrderSecret = process.env.WP_ORDER_SECRET;

    if (wpUrl && wpOrderSecret) {
      try {
        const res = await fetch(`${wpUrl}/wp-json/fs/v1/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Order-Secret': wpOrderSecret,
          },
          body: JSON.stringify(orderData),
        });

        if (!res.ok) {
          console.error(
            '[stripe-webhook] WordPress order creation failed:',
            res.status,
            await res.text().catch(() => '')
          );
        }
      } catch (err) {
        console.error('[stripe-webhook] Failed to reach WordPress:', err);
      }
    } else {
      console.warn(
        '[stripe-webhook] WP order endpoint not configured — order logged only:',
        orderData
      );
    }
  }

  return NextResponse.json({ received: true });
}

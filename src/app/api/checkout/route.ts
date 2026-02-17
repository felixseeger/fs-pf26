import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCourseBySlug } from '@/lib/wordpress/course';

export async function POST(request: NextRequest) {
  let body: { courseSlug?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { courseSlug, email } = body;

  if (!courseSlug || !email) {
    return NextResponse.json(
      { error: 'courseSlug and email are required.' },
      { status: 400 }
    );
  }

  // Fetch canonical price from WordPress to prevent tampering
  const course = await getCourseBySlug(courseSlug);
  if (!course || !course.acf) {
    return NextResponse.json(
      { error: 'Course not found.' },
      { status: 404 }
    );
  }

  const acf = course.acf;
  const priceAmount = acf.price_amount;
  if (priceAmount == null || priceAmount <= 0) {
    return NextResponse.json(
      { error: 'Course has no valid price configured.' },
      { status: 400 }
    );
  }

  // ACF stores symbol (€) or code (EUR) — normalize to Stripe ISO code
  const rawCurrency = acf.price_currency || 'EUR';
  const currencyMap: Record<string, string> = { '€': 'eur', '$': 'usd', '£': 'gbp' };
  const currency = currencyMap[rawCurrency] || rawCurrency.toLowerCase();
  const courseName =
    acf.hero_headline?.replace(/<[^>]*>/g, '').trim() ||
    course.title?.rendered?.replace(/<[^>]*>/g, '').trim() ||
    'Course';
  const isSubscription = acf.price_type === 'subscription';

  const origin = request.nextUrl.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: courseName },
            unit_amount: Math.round(priceAmount * 100),
            ...(isSubscription && { recurring: { interval: 'month' } }),
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseSlug,
        wpCourseId: String(course.id),
      },
      success_url: `${origin}/courses/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/courses/signup?course=${courseSlug}&canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';
import { getCourseBySlug } from '@/lib/wordpress/course';

export async function POST(request: NextRequest) {
  let body: { courseSlug?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
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
  if (!course?.acf) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  }

  const acf = course.acf;
  const priceAmount = acf.price_amount;
  if (priceAmount == null || priceAmount <= 0) {
    return NextResponse.json(
      { error: 'Course has no valid price configured.' },
      { status: 400 }
    );
  }

  // Normalize currency to ISO 4217 (PayPal requires uppercase code, e.g. "EUR")
  const rawCurrency = acf.price_currency || 'EUR';
  const currencyMap: Record<string, string> = { '€': 'EUR', '$': 'USD', '£': 'GBP' };
  const currency = (currencyMap[rawCurrency] ?? rawCurrency).toUpperCase();

  const courseName =
    acf.hero_headline?.replace(/<[^>]*>/g, '').trim() ||
    course.title?.rendered?.replace(/<[^>]*>/g, '').trim() ||
    'Course';

  // PayPal requires amount as a decimal string, e.g. "99.00"
  const amountValue = priceAmount.toFixed(2);

  const origin = request.nextUrl.origin;
  const returnUrl = `${origin}/api/checkout/capture?courseSlug=${encodeURIComponent(courseSlug)}&email=${encodeURIComponent(email)}&courseName=${encodeURIComponent(courseName)}`;
  const cancelUrl = `${origin}/courses/signup?course=${encodeURIComponent(courseSlug)}&canceled=true`;

  try {
    const { approveUrl } = await createPayPalOrder({
      amountValue,
      currency,
      description: courseName,
      returnUrl,
      cancelUrl,
    });

    return NextResponse.json({ url: approveUrl });
  } catch (err) {
    console.error('[checkout] PayPal error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}

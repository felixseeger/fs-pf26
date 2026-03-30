import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { sendEnrollmentEmail } from '@/lib/email';

/**
 * GET /api/checkout/capture?token=ORDER_ID&PayerID=PAYER_ID&courseSlug=...&email=...&courseName=...
 *
 * PayPal redirects here after the buyer approves the payment.
 * We capture the order, send a confirmation email, then redirect to the success page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');       // PayPal order ID
  const courseSlug = searchParams.get('courseSlug') ?? '';
  const email = searchParams.get('email') ?? '';
  const courseName = decodeURIComponent(searchParams.get('courseName') ?? 'Dein Kurs');
  const amount = searchParams.get('amount') ?? '';
  const currency = searchParams.get('currency') ?? 'EUR';
  const origin = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(
      `${origin}/courses/signup?course=${encodeURIComponent(courseSlug)}&canceled=true`
    );
  }

  try {
    const captured = await capturePayPalOrder(token);

    if (captured.status !== 'COMPLETED') {
      console.error('[capture] PayPal order not completed:', captured);
      return NextResponse.redirect(
        `${origin}/courses/signup?course=${encodeURIComponent(courseSlug)}&canceled=true`
      );
    }

    // Send enrollment confirmation email (fire-and-forget — don't block redirect)
    if (email) {
      sendEnrollmentEmail({ to: email, courseName, orderId: captured.id }).catch((err) =>
        console.error('[capture] Email send error:', err)
      );
    }

    const successParams = new URLSearchParams({
      ref: captured.id,
      product: courseName,
    });
    if (amount) successParams.set('amount', amount);
    if (currency) successParams.set('currency', currency);

    return NextResponse.redirect(
      `${origin}/courses/signup/success?${successParams.toString()}`
    );
  } catch (err) {
    console.error('[capture] PayPal capture error:', err);
    return NextResponse.redirect(
      `${origin}/courses/signup?course=${encodeURIComponent(courseSlug)}&canceled=true`
    );
  }
}

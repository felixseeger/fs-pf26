import { NextRequest, NextResponse } from 'next/server';
import { createWooOrder } from '@/lib/woocommerce';
import { WORDPRESS_API_URL } from '@/lib/wordpress/api';

type AccountMode = 'login' | 'register' | 'guest';
type PaymentMethod = 'paypal' | 'invoice';

interface CheckoutCartItem {
  id: string;
  productId: number;
  variationId?: number;
  quantity: number;
}

interface CheckoutRequestBody {
  accountMode: AccountMode;
  paymentMethod: PaymentMethod;
  customer: {
    fullName: string;
    email: string;
    phone?: string;
  };
  items: CheckoutCartItem[];
}

/**
 * Maps frontend payment method tokens to the WooCommerce payment gateway IDs
 * registered by installed plugins.
 *   ppcp-gateway  →  WooCommerce PayPal Payments (official plugin, enabled)
 *   invoice       →  Germanized "Pay by Invoice" gateway
 */
function getPaymentMethodId(method: PaymentMethod): string {
  switch (method) {
    case 'paypal':
      return 'ppcp-gateway';
    case 'invoice':
      return 'invoice';
    default:
      return 'ppcp-gateway';
  }
}

function getPaymentMethodTitle(method: PaymentMethod): string {
  switch (method) {
    case 'paypal':
      return 'PayPal';
    case 'invoice':
      return 'Rechnung';
    default:
      return 'PayPal';
  }
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: '', lastName: '' };

  const parts = trimmed.split(/\s+/);
  const firstName = parts.shift() ?? '';
  const lastName = parts.join(' ');
  return { firstName, lastName };
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { accountMode, paymentMethod, customer, items } = body;

  if (!customer?.email || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: 'Customer email and at least one cart item are required.' },
      { status: 400 }
    );
  }

  const lineItems = items
    .filter((item) => item.productId > 0 && item.quantity > 0)
    .map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      ...(item.variationId ? { variation_id: item.variationId } : {}),
    }));

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: 'No valid WooCommerce line items found.' },
      { status: 400 }
    );
  }

  const { firstName, lastName } = splitFullName(customer.fullName || '');
  const paymentId = getPaymentMethodId(paymentMethod);
  const preferredPayment = getPaymentMethodTitle(paymentMethod);
  const customerNote = `Frontend checkout handoff. Account mode: ${accountMode}. Preferred payment method: ${preferredPayment}.`;

  try {
    const order = await createWooOrder({
      status: 'pending',
      set_paid: false,
      payment_method: paymentId,
      payment_method_title: preferredPayment,
      customer_note: customerNote,
      billing: {
        first_name: firstName,
        last_name: lastName,
        email: customer.email,
        phone: customer.phone || '',
      },
      line_items: lineItems,
    });

    const backendBaseUrl = WORDPRESS_API_URL.replace(/\/+$/, '');
    const redirectUrl =
      order.payment_url ||
      `${backendBaseUrl}/checkout/order-pay/${order.id}/?pay_for_order=true&key=${order.order_key}`;

    return NextResponse.json({ redirectUrl, orderId: order.id });
  } catch (error) {
    console.error('[shop-checkout] Failed to create WooCommerce order:', error);
    return NextResponse.json(
      { error: 'Failed to create WooCommerce checkout order.' },
      { status: 500 }
    );
  }
}

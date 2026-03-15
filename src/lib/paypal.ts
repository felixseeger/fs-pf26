/**
 * PayPal REST API v2 helpers — server-side only.
 * Reads PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV from env.
 * Set PAYPAL_ENV=live for production; defaults to sandbox.
 */

const PAYPAL_ENV = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
const PAYPAL_API =
  PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) {
    throw new Error(
      'PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in .env.local.'
    );
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`PayPal auth failed ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface CreateOrderParams {
  amountValue: string;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalOrderResult {
  id: string;
  approveUrl: string;
}

export async function createPayPalOrder(
  params: CreateOrderParams
): Promise<PayPalOrderResult> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: params.currency.toUpperCase(),
            value: params.amountValue,
          },
          description: params.description,
        },
      ],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        brand_name: 'Felix Seeger',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
      },
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`PayPal create order failed ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    id: string;
    links: Array<{ href: string; rel: string }>;
  };

  const approveLink = data.links.find((l) => l.rel === 'approve');
  if (!approveLink) {
    throw new Error('PayPal did not return an approve URL.');
  }

  return { id: data.id, approveUrl: approveLink.href };
}

export async function capturePayPalOrder(
  orderId: string
): Promise<{ id: string; status: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`PayPal capture failed ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { id: string; status: string };
  return data;
}

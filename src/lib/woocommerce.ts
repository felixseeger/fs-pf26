import { WCProduct, WCProductCategory, WCProductVariation } from '@/types/woocommerce';
import { WORDPRESS_API_URL } from '@/lib/wordpress/api';

const WC_API_BASE = `${WORDPRESS_API_URL}/wp-json/wc/v3`;

export interface WooOrderLineItemInput {
  product_id: number;
  quantity: number;
  variation_id?: number;
}

export interface WooOrderCreateInput {
  payment_method?: string;
  payment_method_title?: string;
  set_paid?: boolean;
  status?: string;
  customer_note?: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  line_items: WooOrderLineItemInput[];
}

export interface WooOrderResponse {
  id: number;
  order_key: string;
  status: string;
  payment_url?: string;
}

function getAuthParams(): URLSearchParams {
  const params = new URLSearchParams();
  // Support both the documented short names and the existing .env.local names.
  const key = process.env.WC_CONSUMER_KEY ?? process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET ?? process.env.WOOCOMMERCE_CONSUMER_SECRET;
  if (key) params.set('consumer_key', key);
  if (secret) params.set('consumer_secret', secret);
  return params;
}

async function fetchWooCommerce<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
  revalidate = 60
): Promise<T> {
  const auth = getAuthParams();
  Object.entries(params).forEach(([k, v]) => auth.set(k, String(v)));

  const url = `${WC_API_BASE}${path}?${auth.toString()}`;
  const hasCredentials = auth.has('consumer_key') && auth.has('consumer_secret');

  try {
    if (!hasCredentials) {
      console.error(
        `WooCommerce credentials are missing for ${path}. Set WC_CONSUMER_KEY/WC_CONSUMER_SECRET or WOOCOMMERCE_CONSUMER_KEY/WOOCOMMERCE_CONSUMER_SECRET.`
      );
      return [] as unknown as T;
    }

    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) {
      console.error(`WooCommerce API error ${res.status} for ${path}`);
      return [] as unknown as T;
    }
    return res.json() as Promise<T>;
  } catch (err) {
    console.error(`WooCommerce fetch failed for ${path}:`, err);
    return [] as unknown as T;
  }
}

async function postWooCommerce<T>(path: string, body: unknown): Promise<T> {
  const auth = getAuthParams();
  const url = `${WC_API_BASE}${path}?${auth.toString()}`;
  const hasCredentials = auth.has('consumer_key') && auth.has('consumer_secret');

  if (!hasCredentials) {
    throw new Error(
      `WooCommerce credentials are missing for ${path}. Set WC_CONSUMER_KEY/WC_CONSUMER_SECRET or WOOCOMMERCE_CONSUMER_KEY/WOOCOMMERCE_CONSUMER_SECRET.`
    );
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const message = await res.text().catch(() => '');
    throw new Error(`WooCommerce API error ${res.status} for ${path}: ${message}`);
  }

  return res.json() as Promise<T>;
}

export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  const products = await fetchWooCommerce<WCProduct[]>('/products', {
    slug,
    per_page: 1,
    status: 'publish',
  });
  return Array.isArray(products) && products.length > 0 ? products[0] : null;
}

export async function getProducts(
  perPage = 100,
  categorySlug?: string
): Promise<WCProduct[]> {
  const params: Record<string, string | number | boolean> = {
    status: 'publish',
    per_page: perPage,
    _embed: true,
  };
  if (categorySlug) params.category = categorySlug;
  return fetchWooCommerce<WCProduct[]>('/products', params);
}

export async function getProductVariations(productId: number): Promise<WCProductVariation[]> {
  return fetchWooCommerce<WCProductVariation[]>(`/products/${productId}/variations`, {
    per_page: 100,
    status: 'publish',
  });
}

export async function getProductCategories(): Promise<WCProductCategory[]> {
  return fetchWooCommerce<WCProductCategory[]>('/products/categories', {
    hide_empty: true,
    per_page: 100,
  });
}

export async function createWooOrder(
  input: WooOrderCreateInput
): Promise<WooOrderResponse> {
  return postWooCommerce<WooOrderResponse>('/orders', input);
}

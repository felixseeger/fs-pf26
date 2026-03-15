import type { Metadata } from 'next';
import DotMatrixStatic from '@/components/DotMatrix/DotMatrixStatic';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ShopCheckoutContent from '@/components/shop/ShopCheckoutContent';
import { getCanonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Checkout | Shop',
  description: 'Review your order and continue to checkout.',
  alternates: { canonical: getCanonicalUrl('/shop/checkout') },
};

export default function ShopCheckoutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
      <section className="relative overflow-hidden">
        <DotMatrixStatic color="#4ade80" dotSize={2} spacing={20} opacity={0.18} className="-z-10" />

        <div className="max-w-6xl mx-auto px-6 pt-28 pb-24">
          <div className="mb-12">
            <Breadcrumb
              items={[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
                { name: 'Checkout', path: '/shop/checkout' },
              ]}
            />
          </div>

          <ShopCheckoutContent />
        </div>
      </section>
    </div>
  );
}

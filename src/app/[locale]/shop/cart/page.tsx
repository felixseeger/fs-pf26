import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import DotMatrixStatic from '@/components/DotMatrix/DotMatrixStatic';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ShopCartSummary from '@/components/shop/ShopCartSummary';
import { getCanonicalUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Cart | Shop',
  description: 'Review the products currently saved in your cart.',
  alternates: { canonical: getCanonicalUrl('/shop/cart') },
};

export default function ShopCartPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
      <section className="relative overflow-hidden">
        <DotMatrixStatic color="#61dafb" dotSize={2} spacing={20} opacity={0.2} className="-z-10" />

        <div className="max-w-6xl mx-auto px-6 pt-28 pb-24">
          <div className="mb-12">
            <Breadcrumb
              items={[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
                { name: 'Cart', path: '/shop/cart' },
              ]}
            />
          </div>

          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Cart
            </p>
            <h1 className="mt-3 text-5xl md:text-6xl font-unbounded font-black text-zinc-900 dark:text-white">
              Warenkorb
            </h1>
            <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Uberprufe deine Auswahl, passe Mengen an und gehe anschliessend weiter zur Kasse.
            </p>
          </div>

          <div className="mt-10 max-w-4xl space-y-6">
            <ShopCartSummary mode="page" />

            <Link
              href="/shop"
              className="inline-flex items-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
            >
              Weiter shoppen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

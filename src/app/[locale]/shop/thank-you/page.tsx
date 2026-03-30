import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import DotMatrixStatic from '@/components/DotMatrix/DotMatrixStatic';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getCanonicalUrl } from '@/lib/site-config';
import ShopConversionTracker from '@/components/analytics/ShopConversionTracker';

export const metadata: Metadata = {
  title: 'Thank You | Shop',
  description: 'Your order has been received successfully.',
  alternates: { canonical: getCanonicalUrl('/shop/thank-you') },
};

export default function ShopThankYouPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
      <ShopConversionTracker />
      <section className="relative overflow-hidden">
        <DotMatrixStatic color="#4ade80" dotSize={2} spacing={20} opacity={0.18} className="-z-10" />

        <div className="max-w-5xl mx-auto px-6 pt-28 pb-24">
          <div className="mb-12">
            <Breadcrumb
              items={[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
                { name: 'Checkout', path: '/shop/checkout' },
                { name: 'Thank You', path: '/shop/thank-you' },
              ]}
            />
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-10 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Order confirmed
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl font-unbounded font-black text-zinc-900 dark:text-white">
              Vielen Dank fur deine Bestellung.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Deine Zahlung wurde erfolgreich verarbeitet. Du wirst in Kurze weitere Informationen zu deiner Bestellung und den nachsten Schritten erhalten.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Bestellung eingegangen</p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Wir haben deine Bestellung erfolgreich erhalten.
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Bearbeitung startet</p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Wir bereiten jetzt Lieferung oder digitale Bereitstellung vor.
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Bestatigung per E-Mail</p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Alle weiteren Details folgen uber deine hinterlegte E-Mail-Adresse.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Zuruck zum Shop
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
              >
                Zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

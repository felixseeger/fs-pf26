import { Metadata } from 'next';
import { getProducts, getProductCategories } from '@/lib/woocommerce';
import { getCanonicalUrl } from '@/lib/site-config';
import DotMatrixStatic from '@/components/DotMatrix/DotMatrixStatic';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ShopGrid from '@/components/shop/ShopGrid';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Shop | Felix Seeger',
  description: 'Physical products, digital downloads, and services — available directly via the shop.',
  alternates: { canonical: getCanonicalUrl('/shop') },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getProductCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
      <section className="relative min-h-screen overflow-hidden">
        <DotMatrixStatic color="#61dafb" dotSize={2} spacing={20} opacity={0.35} className="-z-10" />
        <main className="relative max-w-6xl mx-auto px-6 pt-36 pb-20 z-0">
          <div className="mb-8">
            <Breadcrumb
              items={[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
              ]}
            />
          </div>
          <header className="max-w-3xl mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">
              Shop
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Digital downloads, physical products, and services — ready to order.
            </p>
          </header>

          <ShopGrid products={products} categories={categories} />
        </main>
      </section>
    </div>
  );
}

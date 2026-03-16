'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useShopCart } from '@/components/providers/ShopCartProvider';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

interface ShopCartSummaryProps {
  mode?: 'aside' | 'page';
  showActions?: boolean;
  title?: string;
}

export default function ShopCartSummary({
  mode = 'aside',
  showActions = true,
  title = 'Warenkorb',
}: ShopCartSummaryProps) {
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useShopCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/80 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
          Cart
        </p>
        <h2 className="mt-2 text-xl font-unbounded font-black text-zinc-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Dein Warenkorb ist aktuell leer.
        </p>
        {showActions && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
            >
              Weiter shoppen
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/80 backdrop-blur-sm p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Cart
          </p>
          <h2 className="mt-2 text-xl font-unbounded font-black text-zinc-900 dark:text-white">
            {title}
          </h2>
        </div>
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          {itemCount} Artikel
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4"
          >
            {item.imageSrc ? (
              <Image
                src={item.imageSrc}
                alt={item.imageAlt || item.name}
                width={64}
                height={80}
                className="h-20 w-16 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-900"
              />
            ) : (
              <div className="h-20 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  {item.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`${item.name} aus dem Warenkorb entfernen`}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
                >
                  x
                </button>
              </div>

              {item.selectedOptions.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {item.selectedOptions.map((option) => (
                    <li
                      key={`${item.id}-${option.name}`}
                      className="text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      {option.name}: {option.value}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Menge von ${item.name} reduzieren`}
                    className="flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    -
                  </button>
                  <span className="flex h-9 min-w-10 items-center justify-center border-x border-zinc-200 px-3 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label={`Menge von ${item.name} erhöhen`}
                    className="flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Gesamt
          </span>
          <span className={`font-unbounded font-black text-zinc-900 dark:text-white ${mode === 'page' ? 'text-2xl' : 'text-xl'}`}>
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/shop/cart"
            className="inline-flex items-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
          >
            View Cart
          </Link>
          <Link
            href="/shop/checkout"
            className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Checkout
          </Link>
          {mode === 'page' && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-500 transition-colors hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-500 dark:hover:text-red-400"
            >
              Cart leeren
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

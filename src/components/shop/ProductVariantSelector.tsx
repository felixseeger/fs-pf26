'use client';

import { useState, useMemo } from 'react';
import { useShopCart } from '@/components/providers/ShopCartProvider';
import ShopCartSummary from '@/components/shop/ShopCartSummary';
import type { WCProduct, WCProductVariation } from '@/types/woocommerce';

interface Props {
  product: WCProduct;
  variations: WCProductVariation[];
}

interface OptionSwatch {
  background: string;
  border?: string;
}

function getAttributeKey(id: number, name: string, index: number): string {
  if (id > 0) return `attribute-${id}`;
  return `attribute-${name}-${index}`;
}

function normalizeOptionLabel(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .trim();
}

function isColorAttribute(attributeName: string): boolean {
  const normalized = normalizeOptionLabel(attributeName);
  return normalized.includes('rahmen') || normalized.includes('passepartout');
}

function getOptionSwatch(attributeName: string, option: string): OptionSwatch | null {
  if (!isColorAttribute(attributeName)) return null;

  const normalized = normalizeOptionLabel(option);

  const matchers: Array<[string[], OptionSwatch]> = [
    [['schwarz', 'black', 'anthrazit', 'graphit'], { background: '#1f2937', border: 'rgba(255,255,255,0.12)' }],
    [['weiss', 'weiss', 'white', 'elfenbein', 'ivory', 'creme', 'cream'], { background: '#f8fafc', border: 'rgba(15,23,42,0.18)' }],
    [['grau', 'gray', 'grey', 'silber', 'silver'], { background: '#9ca3af', border: 'rgba(15,23,42,0.1)' }],
    [['natur', 'oak', 'eiche', 'holz', 'wood'], { background: '#c89f6a', border: 'rgba(120,53,15,0.18)' }],
    [['walnuss', 'nussbaum', 'brown', 'braun'], { background: '#7c4a2d', border: 'rgba(255,255,255,0.1)' }],
    [['gold', 'messing', 'brass'], { background: '#d4af37', border: 'rgba(120,53,15,0.16)' }],
    [['beige', 'sand'], { background: '#d6c4a1', border: 'rgba(120,53,15,0.12)' }],
    [['blau', 'blue', 'navy'], { background: '#2563eb', border: 'rgba(255,255,255,0.12)' }],
    [['gruen', 'green', 'olive'], { background: '#4d7c0f', border: 'rgba(255,255,255,0.12)' }],
    [['rot', 'red', 'burgund'], { background: '#b91c1c', border: 'rgba(255,255,255,0.12)' }],
  ];

  for (const [tokens, swatch] of matchers) {
    if (tokens.some((token) => normalized.includes(token))) {
      return swatch;
    }
  }

  return null;
}

/** Match a variation against the current selection.
 *  An attribute with option="" means "any" — it always matches. */
function findVariation(
  variations: WCProductVariation[],
  selected: Record<string, string>
): WCProductVariation | null {
  return (
    variations.find((v) =>
      v.attributes.every((attr) => {
        if (!attr.option) return true;
        const choice = selected[attr.name] ?? selected[attr.slug] ?? '';
        return attr.option.toLowerCase() === choice.toLowerCase();
      })
    ) ?? null
  );
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function parsePrice(value: string): number {
  const normalized = value.replace(',', '.').trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ProductVariantSelector({ product, variations }: Props) {
  const variantAttrs = product.attributes.filter((a) => a.variation && a.options.length > 0);
  const isVariable = product.type === 'variable' && variantAttrs.length > 0;

  const [selected, setSelected] = useState<Record<string, string>>({});
  const { addItem } = useShopCart();

  const allSelected = !isVariable || variantAttrs.every((a) => !!selected[a.name]);

  const matchedVariation = useMemo(
    () => (allSelected && isVariable ? findVariation(variations, selected) : null),
    [allSelected, isVariable, variations, selected]
  );

  // ── Price ──
  const { displayPrice, regularPrice, onSale, currentPriceValue } = useMemo(() => {
    if (matchedVariation) {
      const p = matchedVariation.on_sale && matchedVariation.sale_price
        ? matchedVariation.sale_price
        : matchedVariation.price;
      return {
        displayPrice: p,
        regularPrice: matchedVariation.regular_price,
        onSale: matchedVariation.on_sale,
        currentPriceValue: parsePrice(p),
      };
    }
    if (!isVariable) {
      const p = product.on_sale && product.sale_price ? product.sale_price : product.price;
      return {
        displayPrice: p,
        regularPrice: product.regular_price,
        onSale: product.on_sale,
        currentPriceValue: parsePrice(p),
      };
    }
    const prices = variations
      .map((v) => parseFloat(v.price))
      .filter((p) => !isNaN(p) && p > 0)
      .sort((a, b) => a - b);
    if (!prices.length) return { displayPrice: '', regularPrice: '', onSale: false, currentPriceValue: 0 };
    const min = prices[0];
    const max = prices[prices.length - 1];
    return {
      displayPrice: min === max ? String(min) : `${min} – ${max}`,
      regularPrice: '',
      onSale: false,
      currentPriceValue: min,
    };
  }, [matchedVariation, isVariable, product, variations]);

  // ── Stock ──
  const stockStatus = matchedVariation ? matchedVariation.stock_status : product.stock_status;
  const isOutOfStock = !product.downloadable && !product.virtual && stockStatus !== 'instock';

  // ── Unavailable options (all matching variations out of stock) ──
  const unavailableOptions = useMemo((): Record<string, Set<string>> => {
    const result: Record<string, Set<string>> = {};
    for (const attr of variantAttrs) {
      result[attr.name] = new Set();
      for (const opt of attr.options) {
        const testSelection = { ...selected, [attr.name]: opt };
        const matchingVars = variations.filter((v) =>
          v.attributes.every((va) => {
            if (!va.option) return true;
            const choice = testSelection[va.name] ?? testSelection[va.slug] ?? '';
            return va.option.toLowerCase() === choice.toLowerCase();
          })
        );
        if (matchingVars.length > 0 && matchingVars.every((v) => v.stock_status !== 'instock')) {
          result[attr.name].add(opt);
        }
      }
    }
    return result;
  }, [variantAttrs, variations, selected]);

  const toggleOption = (attrName: string, option: string) => {
    setSelected((prev) => ({
      ...prev,
      [attrName]: prev[attrName] === option ? '' : option,
    }));
  };

  const selectedOptions = useMemo(
    () =>
      variantAttrs
        .map((attr) => ({ name: attr.name, value: selected[attr.name] ?? '' }))
        .filter((option) => option.value),
    [selected, variantAttrs]
  );

  const handleAddToCart = () => {
    if (!ctaReady || currentPriceValue <= 0) return;

    const variationId = matchedVariation?.id ?? 0;
    const optionSignature = selectedOptions
      .map((option) => `${option.name}:${option.value}`)
      .join('|');
    const cartId = `${product.id}-${variationId}-${optionSignature || 'default'}`;
    const image = matchedVariation?.image ?? product.images[0];

    addItem({
      id: cartId,
      productId: product.id,
      variationId: matchedVariation?.id,
      name: product.name,
      price: currentPriceValue,
      quantity: 1,
      imageSrc: image?.src,
      imageAlt: image?.alt || product.name,
      selectedOptions,
    });
  };

  const ctaReady = allSelected && !isOutOfStock;

  return (
    <div className="flex flex-col">

      {/* ── Price ── */}
      {displayPrice && (
        <div className="flex items-baseline gap-4 mb-10">
          {isVariable && !allSelected && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 self-center">ab</span>
          )}
          <span
            className="font-unbounded font-black text-zinc-900 dark:text-white"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
          >
            {displayPrice}&thinsp;€
          </span>
          {onSale && regularPrice && (
            <span className="text-2xl text-zinc-400 line-through font-medium">
              {regularPrice}&thinsp;€
            </span>
          )}
          {onSale && (
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
              Sale
            </span>
          )}
        </div>
      )}

      {/* ── CTA — directly below price ── */}
      {ctaReady ? (
        <div className="flex flex-col gap-6 mb-10">
          <button
            type="button"
            onClick={handleAddToCart}
            className="group w-full inline-flex items-center justify-between bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-5 rounded-xl font-unbounded font-black text-xs uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
          >
            <span className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              In den Warenkorb
            </span>
            <svg className="w-4 h-4 opacity-60 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          <ShopCartSummary />
        </div>
      ) : isOutOfStock ? (
        <div className="w-full px-8 py-5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-unbounded font-black text-xs uppercase tracking-widest text-center mb-10">
          Nicht auf Lager
        </div>
      ) : null}

      {/* ── Variant attribute selectors ── */}
      {isVariable && (
        <div className="flex flex-col gap-7 mb-10">
          {variantAttrs.map((attr, attrIndex) => (
            <div key={getAttributeKey(attr.id, attr.name, attrIndex)}>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
                {attr.name}
                {selected[attr.name] && (
                  <span className="ml-2 normal-case tracking-normal font-normal text-zinc-900 dark:text-white">
                    — {selected[attr.name]}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {attr.options.map((option, optionIndex) => {
                  const isChosen = selected[attr.name] === option;
                  const isUnavailable = unavailableOptions[attr.name]?.has(option);
                  const swatch = getOptionSwatch(attr.name, option);
                  return (
                    <button
                      key={`${attr.name}-${option}-${optionIndex}`}
                      onClick={() => toggleOption(attr.name, option)}
                      disabled={isUnavailable}
                      className={[
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150',
                        isChosen
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent'
                          : isUnavailable
                          ? 'border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 line-through cursor-not-allowed'
                          : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-600 dark:hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-white',
                      ].join(' ')}
                    >
                      {swatch && (
                        <span
                          aria-hidden
                          className="h-3.5 w-3.5 shrink-0 rounded-full border"
                          style={{
                            backgroundColor: swatch.background,
                            borderColor: swatch.border ?? 'rgba(255,255,255,0.12)',
                          }}
                        />
                      )}
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Stock / selection hint ── */}
      {isOutOfStock && allSelected && (
        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-6">
          Nicht auf Lager
          {stockStatus === 'onbackorder' && ' — auf Anfrage verfügbar'}
        </p>
      )}
      {isVariable && !allSelected && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6">
          Bitte wähle alle Optionen, um fortzufahren.
        </p>
      )}

      {/* ── Divider ── */}
      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-8" />
    </div>
  );
}

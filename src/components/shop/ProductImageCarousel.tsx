'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import type { WCImage } from '@/types/woocommerce';

interface ProductImageCarouselProps {
  images: WCImage[];
  productName: string;
}

function getImageKey(image: WCImage, index: number): string {
  if (image.id > 0 && image.src) return `image-${image.id}-${image.src}-${index}`;
  if (image.id > 0) return `image-${image.id}-${index}`;
  if (image.src) return `image-${image.src}-${index}`;
  return `image-${index}`;
}

export default function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 25, align: 'center' },
    [WheelGesturesPlugin()]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo  = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => { emblaApi.off('select', onSelect); emblaApi.off('reInit', onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') scrollPrev();
      if (e.key === 'ArrowRight') scrollNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scrollPrev, scrollNext]);

  if (!images.length) return null;

  const showControls = images.length > 1;

  return (
    <div className="flex flex-row gap-3">
      {/* Vertical thumbnail strip — left side */}
      {showControls && (
        <div className="flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0 w-[72px]">
          {images.map((img, i) => (
            <button
              key={getImageKey(img, i)}
              onClick={() => scrollTo(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative shrink-0 w-full aspect-square rounded-lg overflow-hidden transition-all duration-200 ring-2 ${
                selectedIndex === i
                  ? 'ring-zinc-900 dark:ring-white opacity-100'
                  : 'ring-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt || `${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main carousel — right side */}
      <div className="relative group flex-1 min-w-0">
        <div
          ref={emblaRef}
          className="overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 aspect-4/5"
        >
          <div className="flex h-full">
            {images.map((img, i) => (
              <div key={getImageKey(img, i)} className="flex-none w-full h-full relative">
                <Image
                  src={img.src}
                  alt={img.alt || `${productName} — image ${i + 1}`}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next arrows */}
        {showControls && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/50"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/50"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Slide counter badge */}
        {showControls && (
          <span className="absolute bottom-3 right-3 text-xs font-semibold tabular-nums text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full pointer-events-none">
            {selectedIndex + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
}

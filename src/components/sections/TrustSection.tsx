'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import type { TrustClientItem } from '@/types/wordpress';

gsap.registerPlugin(CustomEase);
CustomEase.create('hop', 'M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1');

interface TrustSectionProps {
  title?: string;
  clients: TrustClientItem[];
  className?: string;
}

export default function TrustSection({ title = 'Trusted Us', clients, className = '' }: TrustSectionProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [displayedIndex, setDisplayedIndex] = useState<number>(-1);
  const isLeavingRef = useRef(false);

  const runReveal = useCallback(() => {
    const wrapper = wrapperRef.current;
    const img = imgRef.current;
    if (!wrapper || !img) return;
    gsap.set(wrapper, { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' });
    gsap.set(img, { scale: 1.25, opacity: 0 });
    gsap.to(wrapper, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 0.5,
      ease: 'hop',
    });
    gsap.to(img, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    gsap.to(img, { scale: 1, duration: 1.25, ease: 'hop' });
  }, []);

  const runHide = useCallback((onComplete: () => void) => {
    const img = imgRef.current;
    if (!img) {
      onComplete();
      return;
    }
    gsap.to(img, {
      opacity: 0,
      duration: 0.5,
      ease: 'power1.out',
      onComplete,
    });
  }, []);

  useEffect(() => {
    if (displayedIndex >= 0) {
      const t = requestAnimationFrame(() => runReveal());
      return () => cancelAnimationFrame(t);
    }
  }, [displayedIndex, runReveal]);

  const getImageUrl = useCallback((client: TrustClientItem) => {
    const img = client?.image;
    if (!img) return null;
    const url = typeof img === 'object' && img !== null && 'url' in img ? (img as { url?: string }).url : null;
    return url || null;
  }, []);

  const handleMouseEnter = useCallback(
    (index: number) => {
      const url = getImageUrl(clients[index]);
      if (url == null || url === '') return;
      if (displayedIndex === index) return;
      isLeavingRef.current = false;
      if (displayedIndex >= 0) {
        runHide(() => {
          if (!isLeavingRef.current) setDisplayedIndex(index);
        });
      } else {
        setDisplayedIndex(index);
      }
    },
    [displayedIndex, clients, runHide, getImageUrl]
  );

  const handleMouseLeave = useCallback(
    (index: number, relatedTarget: EventTarget | null, currentTarget: EventTarget) => {
      if (relatedTarget && (currentTarget as Node).contains(relatedTarget as Node)) return;
      if (displayedIndex !== index) return;
      isLeavingRef.current = true;
      runHide(() => setDisplayedIndex(-1));
    },
    [displayedIndex, runHide]
  );

  if (!clients?.length) return null;

  return (
    <section
      className={`relative w-full min-h-[70vh] flex flex-col justify-end items-start gap-8 overflow-hidden py-16 px-6 lg:px-10 ${className}`}
    >
      <div
        ref={previewRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[60%] aspect-6/5 max-h-[50vh] z-0 pointer-events-none"
      >
        {displayedIndex >= 0 && getImageUrl(clients[displayedIndex]) && (
          <div
            ref={wrapperRef}
            className="absolute inset-0 will-change-[clip-path] overflow-hidden rounded-lg"
            style={{ clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' }}
          >
            <img
              ref={imgRef}
              src={getImageUrl(clients[displayedIndex])!}
              alt={(clients[displayedIndex].image as { alt?: string } | undefined)?.alt || clients[displayedIndex].name}
              className="absolute w-full h-full object-cover will-change-transform"
            />
          </div>
        )}
      </div>

      <p className="relative text-xs uppercase tracking-widest font-semibold text-zinc-500 dark:text-zinc-400 z-10">
        {title}
      </p>

      <div className="relative w-full max-w-[80%] flex flex-wrap justify-start items-center gap-3 z-10">
        {clients.map((client, index) => {
          const logoUrl = getImageUrl(client);
          const hasPreview = logoUrl != null && logoUrl !== '';
          return (
            <div
              key={index}
              className={`relative inline-flex items-center gap-2 cursor-pointer group/client ${hasPreview ? '' : ''}`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={(e) => handleMouseLeave(index, e.relatedTarget, e.currentTarget)}
            >
              {hasPreview && (
                <span className="shrink-0 w-8 h-8 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800 ring-1 ring-zinc-300 dark:ring-zinc-700">
                  <img
                    src={logoUrl}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-medium text-zinc-900 dark:text-white leading-tight">
                {client.name || ' '}
                {index < clients.length - 1 ? ',' : '.'}
              </h2>
              <span
                className="absolute left-0 bottom-0 w-full h-[0.15rem] bg-zinc-900 dark:bg-white origin-right scale-x-0 transition-transform duration-300 ease-out group-hover/client:scale-x-100 group-hover/client:origin-left pointer-events-none"
                aria-hidden
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

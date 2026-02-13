'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { WPPortfolioItem } from '@/types/wordpress';
import Link from 'next/link';
import Image from 'next/image';

interface HomepageHeroProps {
  items?: WPPortfolioItem[];
}

const HERO_REF_APNG = '/fs-pf-26.apng';
const HERO_REF_MP4 = '/fs-pf-26.mp4';

export default function HomepageHero({ items = [] }: HomepageHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [apngReady, setApngReady] = useState(false);
  const [apngFailed, setApngFailed] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 40,
      skipSnaps: false
    },
    [
      Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true })
    ]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    setMounted(true);

    // Wait for header intro (centered cluster + entrance) before showing hero content
    const timer = setTimeout(() => setShowContent(true), 2200);

    // Hide scroll hint when user scrolls past hero
    const handleScroll = () => {
      const scrollThreshold = window.innerHeight * 0.5;
      if (window.scrollY > scrollThreshold) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  if (!mounted) return <div className="h-screen bg-background" suppressHydrationWarning />;

  const hasPortfolioSlides = Array.isArray(items) && items.length > 0;
  const displayItems = hasPortfolioSlides ? items : ([{ id: 0, title: { rendered: 'Felix Seeger' }, excerpt: { rendered: '' }, slug: '' }] as unknown as typeof items);

  return (
    <section
      id="hero"
      className="relative w-full h-[150vh] overflow-visible bg-background"
    >
      {/* Stick the slideshow to the viewport */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Reference hero background: APNG (animated) when present, else MP4 video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover ${apngReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-hidden
          >
            <source src={HERO_REF_MP4} type="video/mp4" />
          </video>
          {!apngFailed && (
            <img
              src={HERO_REF_APNG}
              alt=""
              role="presentation"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${apngReady ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setApngReady(true)}
              onError={() => setApngFailed(true)}
            />
          )}
          <div className="absolute inset-0 bg-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        </div>

        {/* Embla Viewport for Background Images (when portfolio items exist) */}
        {hasPortfolioSlides && (
          <div className="absolute inset-0 z-[1] overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {items.map((item) => {
                const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];
                return (
                  <div key={`hero-slide-${item.id}`} className="flex-none w-full h-full relative">
                    {featuredImage?.source_url && (
                      <div className="featured-image-write-in absolute inset-0">
                      <Image
                        src={featuredImage.source_url}
                        alt={featuredImage.alt_text || item.title.rendered}
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                      />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(233,255,19,0.08),transparent_70%)] opacity-60" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Layer */}
        <div className="container-custom relative z-10 w-full h-full flex items-center pointer-events-none">
          <AnimatePresence mode="wait">
            {showContent && displayItems.map((item, index) => {
              // Varied position offsets based on slide index
              const positionVariants = [
                'pt-32 md:pt-40 lg:pt-48 px-6 md:px-12 lg:pl-20', // Left aligned, lower
                'pt-24 md:pt-32 lg:pt-36 px-6 md:px-16 lg:pl-32', // More left offset, higher
                'pt-36 md:pt-44 lg:pt-52 px-6 md:px-10 lg:pl-16', // Slight left, lowest
                'pt-28 md:pt-36 lg:pt-40 px-6 md:px-20 lg:pl-40', // Most left offset, mid
                'pt-32 md:pt-40 lg:pt-44 px-6 md:px-14 lg:pl-24', // Medium offset
              ];
              const positionClass = positionVariants[index % positionVariants.length];
              const categories = item._embedded?.['wp:term']?.[0] || [];

              return index === selectedIndex && (
                <motion.div
                  key={`hero-content-${item.id}`}
                  className={`max-w-5xl pointer-events-auto ${positionClass}`}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                      initial={{ opacity: -30, y: 20 }}
                      animate={{ opacity: 1, y: -39 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      {hasPortfolioSlides && categories.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
                          {categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="inline-block px-4 py-1.5 md:px-5 md:py-2 text-[9px] md:text-[10px] font-black tracking-[0.3em] uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span
                          className="inline-block px-4 py-1.5 md:px-5 md:py-2 mb-6 md:mb-8 text-[9px] md:text-[10px] font-black tracking-[0.3em] uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full"
                        >
                          Portfolio
                        </span>
                      )}
                      <h1
                        className="text-5xl md:text-6xl lg:text-[10rem] font-unbounded font-black leading-[0.85] md:leading-[0.8] text-white mb-6 md:mb-10 drop-shadow-2xl uppercase italic tracking-tighter"
                        dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                      />
                      {item.excerpt?.rendered && (
                        <div
                          className="text-base md:text-lg lg:text-2xl text-zinc-300 max-w-2xl font-medium leading-relaxed mb-8 md:mb-12 line-clamp-3 drop-shadow-lg font-poppins"
                          dangerouslySetInnerHTML={{ __html: item.excerpt.rendered }}
                        />
                      )}
                      <div className="flex flex-wrap gap-4 md:gap-6">
                        <Link
                          href={hasPortfolioSlides ? `/portfolio/${item.slug}` : '/portfolio'}
                          className="group relative px-8 py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 bg-primary text-primary-foreground font-unbounded font-black text-[10px] md:text-xs tracking-widest uppercase hover:scale-105 transition-all duration-300 rounded-full"
                        >
                          {hasPortfolioSlides ? 'View Case Study' : 'View Portfolio'}
                        </Link>
                        <Link
                          href="/portfolio"
                          className="px-8 py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 border border-white/20 text-white font-unbounded font-black text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/10 transition-all duration-300 rounded-full backdrop-blur-md"
                        >
                          Explore All
                        </Link>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
        </div>

        {/* Slide Navigation — only when multiple portfolio slides */}
        {hasPortfolioSlides && items.length > 1 && (
          <>
            {/* Arrow Navigation - Absolute Sides */}
            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md text-white transition-all duration-300 border border-white/10 z-20 group"
              aria-label="Previous slide"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md text-white transition-all duration-300 border border-white/10 z-20 group"
              aria-label="Next slide"
            >
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Bottom Controls (Dots + Counter) */}
            <div className="absolute bottom-16 right-6 lg:right-16 flex items-center gap-10 z-20">
              <div className="hidden lg:flex gap-4">
                {items.map((_, index) => (
                  <button
                    key={`nav-dot-${index}`}
                    onClick={() => scrollTo(index)}
                    className={`h-1.5 transition-all duration-700 rounded-full shadow-sm ${selectedIndex === index ? 'w-24 bg-primary' : 'w-10 bg-white/10 hover:bg-white/30'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="text-white font-unbounded text-xl font-black tabular-nums tracking-tighter flex items-baseline gap-1">
                <span className="text-primary text-2xl">{String(selectedIndex + 1).padStart(2, '0')}</span>
                <span className="opacity-20 text-sm">/</span>
                <span className="opacity-40 text-sm">{String(items.length).padStart(2, '0')}</span>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Scroll Hint - Fixed to viewport bottom, outside sticky container */}
      <AnimatePresence>
        {showScrollHint && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={() => {
              setShowScrollHint(false);
              window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
              });
            }}
            className="fixed left-1/2 -translate-x-1/2 bottom-12 hidden lg:flex flex-col items-center gap-3 z-[9999] cursor-pointer group"
            aria-label="Scroll to next section"
          >
            <span className="text-white/50 group-hover:text-white/80 text-[10px] font-black tracking-[0.6em] uppercase transition-colors duration-300">
              Scroll to explore
            </span>
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{
                y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-white/50 group-hover:text-white/80 transition-colors duration-300"
            >
              <ChevronDown size={24} strokeWidth={1.5} />
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}

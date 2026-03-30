'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { WPPortfolioItem } from '@/types/wordpress';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import PixelatedVideoSlide from '@/components/Pixelated/PixelatedVideoSlide';
import DotMatrix from '@/components/DotMatrix/DotMatrix';

interface HomepageHeroProps {
  items?: WPPortfolioItem[];
  /** ACF: first slide pixelated title (falls back to first portfolio item title) */
  slideTitle?: string;
  /** ACF: small badge/pill text above the title */
  slideBadge?: string;
  /** ACF: subtitle/description text below the title */
  slideSubtitle?: string;
  /** ACF: primary CTA button label */
  slideCtaLabel?: string;
  /** ACF: primary CTA button URL */
  slideCtaUrl?: string;
  /** ACF: scroll-down hint label (default: "Scroll to explore") */
  scrollHintText?: string;
}

const HERO_REF_MP4 = '/fs-pf-26.mp4';

export default function HomepageHero({
  items = [],
  slideTitle,
  slideBadge,
  slideSubtitle,
  slideCtaLabel,
  slideCtaUrl,
  scrollHintText,
}: HomepageHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
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

    // Returning visitors (or subpage navigation): show content immediately.
    // First-time visitors: wait for the preloader-complete event so hero text
    // appears exactly when the preloader finishes — no hardcoded guessing.
    const skipIntro = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('homePreloaderShown');
    let contentTimer = 0;
    const onPreloaderDone = () => setShowContent(true);
    if (skipIntro) {
      setShowContent(true);
    } else {
      window.addEventListener('preloader-complete', onPreloaderDone, { once: true });
      // Safety fallback: if event never fires (tab backgrounded, reduced motion, etc.)
      contentTimer = window.setTimeout(onPreloaderDone, 6000);
    }

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

    if (!emblaApi) return () => {
      clearTimeout(contentTimer);
      window.removeEventListener('preloader-complete', onPreloaderDone);
      window.removeEventListener('scroll', handleScroll);
    };
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      clearTimeout(contentTimer);
      window.removeEventListener('preloader-complete', onPreloaderDone);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  if (!mounted) return <div className="h-screen bg-background" suppressHydrationWarning />;

  const hasPortfolioSlides = Array.isArray(items) && items.length > 0;
  const displayItems = hasPortfolioSlides ? items : ([{ id: 0, title: { rendered: 'Felix Seeger' }, excerpt: { rendered: '' }, slug: '' }] as unknown as typeof items);
  // Use ACF slide title if set, otherwise fall back to first portfolio item title
  const firstItemTitle = slideTitle
    ? slideTitle.trim()
    : (displayItems[0]?.title?.rendered ?? 'Felix Seeger').replace(/<[^>]*>/g, '').trim();
  const slideCount = hasPortfolioSlides ? 1 + items.length : 1;

  return (
    <section
      id="hero"
      className="relative w-full h-[115vh] overflow-visible bg-background"
    >
      {/* Stick the slideshow to the viewport */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* DotMatrix animated reveal - reveals after loading state completes */}
        <div className="absolute inset-0 z-[2] pointer-events-none">
          {showContent && (
            <DotMatrix
              color="#a3e635"
              delay={0}
              speed={0.02}
              dotSize={2}
              spacing={20}
              opacity={0.15}
            />
          )}
        </div>


        {/* Embla Viewport: Pixelated slide first, then portfolio images */}
        {(
          <div className="absolute inset-0 z-[1] overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {/* First slide: pixelated video + text effect */}
              <div key="hero-slide-pixelated" className="flex-none w-full h-full relative">
                <PixelatedVideoSlide
                  videoSrc={HERO_REF_MP4}
                  text={firstItemTitle}
                  className="w-full h-full"
                />
              </div>
              {hasPortfolioSlides && items.map((item) => {
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
          <h1 className="sr-only">Felix Seeger — Web design, development, and digital strategy</h1>
          <AnimatePresence mode="wait">
            {showContent && (() => {
              // Slide 0 is always the pixelated first slide (ACF-driven)
              // Slides 1..n map to portfolio items[0..n-1]
              if (selectedIndex === 0) {
                // First slide: use ACF props, fall back to defaults
                const badge = slideBadge || 'Portfolio';
                const title = slideTitle ?? (displayItems[0]?.title?.rendered ?? 'Felix Seeger');
                const subtitle = slideSubtitle || displayItems[0]?.excerpt?.rendered || '';
                const ctaLabel = slideCtaLabel || 'View Portfolio';
                const ctaHref = slideCtaUrl || '/portfolio';

                return (
                  <motion.div
                    key="hero-content-slide-0"
                    className="max-w-5xl pointer-events-auto pt-32 md:pt-40 lg:pt-48 px-6 md:px-12 lg:pl-20"
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
                      <span className="inline-block max-w-xs truncate px-4 py-1.5 md:px-5 md:py-2 mb-6 md:mb-8 text-[9px] md:text-[10px] font-black tracking-[0.3em] uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full">
                        {badge}
                      </span>
                      <h2
                        className="text-5xl md:text-6xl lg:text-[10rem] font-unbounded font-black leading-[0.85] md:leading-[0.8] text-white mb-6 md:mb-10 drop-shadow-2xl uppercase italic tracking-tighter"
                        dangerouslySetInnerHTML={{ __html: title }}
                      />
                      {subtitle && (
                        <div
                          className="text-base md:text-lg lg:text-2xl text-zinc-300 max-w-2xl font-medium leading-relaxed mb-8 md:mb-12 line-clamp-3 drop-shadow-lg font-poppins"
                          dangerouslySetInnerHTML={{ __html: subtitle }}
                        />
                      )}
                      <div className="flex flex-wrap gap-4 md:gap-6">
                        <Link
                          href={ctaHref}
                          className="group relative px-8 py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 bg-primary text-primary-foreground font-unbounded font-black text-[10px] md:text-xs tracking-widest uppercase hover:scale-105 transition-all duration-300 rounded-full"
                        >
                          {ctaLabel}
                        </Link>
                        {hasPortfolioSlides && (
                          <Link
                            href="/portfolio"
                            className="px-8 py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 border border-white/20 text-white font-unbounded font-black text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/10 transition-all duration-300 rounded-full backdrop-blur-md"
                          >
                            Explore All
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              }

              // Portfolio slides (index 1..n → items[0..n-1])
              const portfolioIndex = selectedIndex - 1;
              const item = hasPortfolioSlides ? items[portfolioIndex] : null;
              if (!item) return null;

              const positionVariants = [
                'pt-32 md:pt-40 lg:pt-48 px-6 md:px-12 lg:pl-20',
                'pt-24 md:pt-32 lg:pt-36 px-6 md:px-16 lg:pl-32',
                'pt-36 md:pt-44 lg:pt-52 px-6 md:px-10 lg:pl-16',
                'pt-28 md:pt-36 lg:pt-40 px-6 md:px-20 lg:pl-40',
                'pt-32 md:pt-40 lg:pt-44 px-6 md:px-14 lg:pl-24',
              ];
              const positionClass = positionVariants[portfolioIndex % positionVariants.length];
              const categories = item._embedded?.['wp:term']?.[0] || [];

              return (
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
                    {categories.length > 0 ? (
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
                      <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 mb-6 md:mb-8 text-[9px] md:text-[10px] font-black tracking-[0.3em] uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full">
                        Portfolio
                      </span>
                    )}
                    <h2
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
                        href={`/portfolio/${item.slug}`}
                        className="group relative px-8 py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 bg-primary text-primary-foreground font-unbounded font-black text-[10px] md:text-xs tracking-widest uppercase hover:scale-105 transition-all duration-300 rounded-full"
                      >
                        View Case Study
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
            })()}
          </AnimatePresence>
        </div>

        {/* Slide Navigation — when more than one slide */}
        {slideCount > 1 && (
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
                {Array.from({ length: slideCount }).map((_, index) => (
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
                <span className="opacity-40 text-sm">{String(slideCount).padStart(2, '0')}</span>
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
              // Scroll to the about section, triggering the SVG transition
              const aboutSection = document.getElementById('about');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="fixed left-1/2 -translate-x-1/2 bottom-12 hidden lg:flex flex-col items-center gap-3 z-[9999] cursor-pointer group"
            aria-label="Scroll to about section"
          >
            <span className="text-white/50 group-hover:text-white/80 text-[10px] font-black tracking-[0.6em] uppercase transition-colors duration-300">
              {scrollHintText || 'Scroll to explore'}
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

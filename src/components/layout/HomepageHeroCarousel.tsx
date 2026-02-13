'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPortfolioItem } from '@/types/wordpress';

interface HomepageHeroCarouselProps {
    items: WPPortfolioItem[];
}

export default function HomepageHeroCarousel({ items }: HomepageHeroCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);

    const scrollTo = useCallback((index: number) => {
        if (!scrollRef.current) return;
        const itemWidth = scrollRef.current.offsetWidth;
        scrollRef.current.scrollTo({
            left: index * itemWidth,
            behavior: 'smooth',
        });
        setActiveIndex(index);
    }, []);

    const nextSlide = useCallback(() => {
        const nextIndex = (activeIndex + 1) % items.length;
        scrollTo(nextIndex);
    }, [activeIndex, items.length, scrollTo]);

    const startAutoplay = useCallback(() => {
        if (autoplayRef.current) clearInterval(autoplayRef.current);
        autoplayRef.current = setInterval(nextSlide, 5000);
    }, [nextSlide]);

    const stopAutoplay = useCallback(() => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current);
            autoplayRef.current = null;
        }
    }, []);

    useEffect(() => {
        startAutoplay();
        return () => stopAutoplay();
    }, [startAutoplay, stopAutoplay]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollPosition = scrollRef.current.scrollLeft;
        const itemWidth = scrollRef.current.offsetWidth;
        if (itemWidth === 0) return;
        const newIndex = Math.round(scrollPosition / itemWidth);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <section
            className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden group"
            onMouseEnter={stopAutoplay}
            onMouseLeave={startAutoplay}
        >
            {/* Main Carousel Wrapper */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {items.map((item, index) => {
                    const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];
                    const categories = item._embedded?.['wp:term']?.[0] || [];

                    return (
                        <div
                            key={item.id}
                            className="flex-none w-full h-full snap-center relative overflow-hidden"
                        >
                            {/* Image with Parallax-like effect */}
                            <div className="featured-image-write-in absolute inset-0 transition-transform duration-700 scale-105 group-hover:scale-100">
                                {featuredImage?.source_url ? (
                                    <Image
                                        src={featuredImage.source_url}
                                        alt={featuredImage.alt_text || item.title.rendered}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800" />
                                )}
                                {/* Dark Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20">
                                <div className="max-w-4xl space-y-4 md:space-y-6">
                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                        {categories.map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full"
                                            >
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Title */}
                                    <h2
                                        className="text-4xl md:text-7xl font-black text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
                                        dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                                    />

                                    {/* Link Button */}
                                    <div className="pt-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
                                        <Link
                                            href={`/portfolio/${item.slug}`}
                                            className="inline-flex items-center gap-2 group/btn"
                                        >
                                            <span className="text-sm font-bold text-white uppercase tracking-widest border-b-2 border-white/30 pb-1 group-hover/btn:border-white transition-all">
                                                View Project Detail
                                            </span>
                                            <svg className="w-5 h-5 text-white transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Controls */}
            {items.length > 1 && (
                <>
                    {/* Progress Bar / Dots */}
                    <div className="absolute bottom-10 left-8 md:left-20 flex items-center gap-4 z-20">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className="group/dot relative p-2"
                                aria-label={`Go to slide ${index + 1}`}
                            >
                                <div className={`h-1 transition-all duration-300 rounded-full ${activeIndex === index
                                        ? 'w-12 bg-white'
                                        : 'w-4 bg-white/40 hover:bg-white/60'
                                    }`} />
                            </button>
                        ))}
                    </div>

                    {/* Arrow Icons (Top Right) */}
                    <div className="absolute top-10 right-8 md:right-20 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => scrollTo((activeIndex - 1 + items.length) % items.length)}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/20 transition-all"
                            aria-label="Previous slide"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/20 transition-all"
                            aria-label="Next slide"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}

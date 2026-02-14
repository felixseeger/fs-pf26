'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import Lightbox from 'yet-another-react-lightbox';
import Video from 'yet-another-react-lightbox/plugins/video';
import 'yet-another-react-lightbox/styles.css';
import type { SliderMediaItem } from '@/lib/wordpress/portfolio-media';

interface PortfolioCarouselProps {
    /** Slider items: images and/or videos from ACF portfolio_slider_media */
    slides: SliderMediaItem[];
}

export default function PortfolioCarousel({ slides }: PortfolioCarouselProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { 
            loop: true, 
            align: 'start',
            duration: 30,
            watchDrag: true
        }, 
        [
            Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
            WheelGesturesPlugin()
        ]
    );

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        setMounted(true);
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen) return;
            if (e.key === 'ArrowLeft') scrollPrev();
            if (e.key === 'ArrowRight') scrollNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scrollPrev, scrollNext, isOpen]);

    if (!slides || slides.length === 0 || !mounted) return null;

    const lightboxSlides = slides.map((s) =>
        s.type === 'video'
            ? { type: 'video' as const, sources: [{ src: s.url, type: 'video/mp4' }], poster: s.posterUrl, width: 1920, height: 1080 }
            : { src: s.url, alt: s.altText }
    );

    return (
        <div className="relative group">
            <div
                className="overflow-hidden rounded-2xl shadow-2xl bg-muted aspect-[16/9] md:aspect-[21/9]"
                ref={emblaRef}
            >
                <div className="flex h-full">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className="flex-none w-full h-full relative cursor-zoom-in active:cursor-grabbing flex flex-col"
                            onClick={() => slide.type === 'image' && setIsOpen(true)}
                        >
                            <div className={`absolute inset-0 shrink-0 ${index === 0 ? 'featured-image-write-in' : ''}`}>
                                {slide.type === 'video' ? (
                                    <video
                                        src={slide.url}
                                        poster={slide.posterUrl}
                                        className="w-full h-full object-cover pointer-events-none"
                                        playsInline
                                        muted
                                        loop
                                        preload="metadata"
                                    />
                                ) : (
                                    <img
                                        src={slide.url}
                                        alt={slide.altText || `Project image ${index + 1}`}
                                        className="w-full h-full object-cover pointer-events-none"
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                    />
                                )}
                            </div>
                            {slide.caption && (
                                <p className="absolute bottom-0 left-0 right-0 p-4 text-sm text-white bg-gradient-to-t from-black/70 to-transparent">
                                    {slide.caption}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10 p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                scrollTo(index);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedIndex === index ? 'bg-primary w-6' : 'bg-white/40 hover:bg-white/60'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {slides.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            scrollPrev();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40"
                        aria-label="Previous slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            scrollNext();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40"
                        aria-label="Next slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            <Lightbox
                open={isOpen}
                close={() => setIsOpen(false)}
                index={selectedIndex}
                slides={lightboxSlides}
                plugins={[Video]}
                on={{
                    view: ({ index }) => {
                        setSelectedIndex(index);
                        scrollTo(index);
                    }
                }}
            />
        </div>
    );
}

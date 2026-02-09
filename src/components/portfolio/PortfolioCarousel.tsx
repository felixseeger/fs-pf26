'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useTheme } from 'next-themes';

interface CarouselImage {
    url: string;
    altText?: string;
}

interface PortfolioCarouselProps {
    images: CarouselImage[];
}

export default function PortfolioCarousel({ images }: PortfolioCarouselProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    
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

    if (!images || images.length === 0 || !mounted) return null;

    return (
        <div className="relative group">
            {/* Embla Viewport */}
            <div 
                className="overflow-hidden rounded-2xl shadow-2xl bg-muted aspect-[16/9] md:aspect-[21/9]" 
                ref={emblaRef}
            >
                <div className="flex h-full">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="flex-none w-full h-full relative cursor-zoom-in active:cursor-grabbing"
                            onClick={() => setIsOpen(true)}
                        >
                            <img
                                src={image.url}
                                alt={image.altText || `Project image ${index + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                                loading={index === 0 ? "eager" : "lazy"}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Dots */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10 p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                scrollTo(index);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedIndex === index
                                ? 'bg-primary w-6'
                                : 'bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Arrows */}
            {images.length > 1 && (
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

            {/* Lightbox */}
            <Lightbox
                open={isOpen}
                close={() => setIsOpen(false)}
                index={selectedIndex}
                slides={images.map(img => ({ src: img.url, alt: img.altText }))}
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

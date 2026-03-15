'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedLink from '@/components/ui/AnimatedLink';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import LiquidGradientBackground, { type GradientColor } from '@/components/ui/LiquidGradientBackground';
import { DEFAULT_SOCIAL_URLS } from '@/lib/site-config';
import { playMenuOpen, playMenuClose, playMenuSelect } from '@/lib/menu-sounds';

gsap.registerPlugin(ScrollTrigger);

/** Gradient colors [r,g,b] 0–1 by pathname. Accent first, dark base second. */
const GRADIENT_BY_PATH: Record<string, { color1: GradientColor; color2: GradientColor }> = {
  '/': { color1: [0.945, 0.353, 0.133], color2: [0.039, 0.055, 0.153] },
  '/services': { color1: [0.2, 0.48, 0.95], color2: [0.02, 0.06, 0.18] },
  '/courses': { color1: [0.38, 0.85, 0.98], color2: [0.02, 0.1, 0.2] },
  '/portfolio': { color1: [0.6, 0.35, 0.9], color2: [0.08, 0.04, 0.15] },
  '/resume': { color1: [0.95, 0.55, 0.2], color2: [0.08, 0.05, 0.12] },
  '/about': { color1: [0.15, 0.7, 0.6], color2: [0.02, 0.08, 0.1] },
  '/contact': { color1: [0.9, 0.4, 0.5], color2: [0.12, 0.03, 0.08] },
  '/shop': { color1: [0.3, 0.8, 0.5], color2: [0.02, 0.1, 0.06] },
  '/impressum': { color1: [0.5, 0.5, 0.6], color2: [0.06, 0.06, 0.1] },
  '/privacy-policy': { color1: [0.5, 0.5, 0.6], color2: [0.06, 0.06, 0.1] },
};

function getGradientColors(pathname: string) {
  const exact = GRADIENT_BY_PATH[pathname];
  if (exact) return exact;
  if (pathname.startsWith('/services')) return GRADIENT_BY_PATH['/services'];
  if (pathname.startsWith('/courses')) return GRADIENT_BY_PATH['/courses'];
  if (pathname.startsWith('/portfolio')) return GRADIENT_BY_PATH['/portfolio'];
  if (pathname.startsWith('/shop')) return GRADIENT_BY_PATH['/shop'];
  return GRADIENT_BY_PATH['/'];
}

const navLinks = [
    { name: 'About', href: '/#about' },
    { name: 'Services', href: '/#services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Courses', href: '/courses' },
    { name: 'Shop', href: '/shop' },
];

const mobileNavLinks = [
    ...navLinks,
    { name: 'Resume', href: '/resume' },
];

const legalLinks = [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
];

const socialLinkLabels: Record<string, string> = {
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    instagram: 'Instagram',
    facebook: 'Facebook',
};

const mobileSocialLinks = (Object.entries(DEFAULT_SOCIAL_URLS) as [string, string][])
    .filter(([, url]) => url?.trim())
    .map(([key, href]) => ({ name: socialLinkLabels[key] ?? key, href }));

const allMobileNavLinks = [
    ...mobileNavLinks,
    ...mobileSocialLinks,
    ...legalLinks,
];

const mobileMenuContainerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    }),
    exit: { opacity: 0, transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const mobileMenuItemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
};

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();
    const { setTheme, resolvedTheme } = useTheme();

    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const headerInnerRef = useRef<HTMLDivElement>(null);
    const logoWrapperRef = useRef<HTMLDivElement>(null);
    const leftLinksRef = useRef<HTMLDivElement>(null);
    const rightLinksRef = useRef<HTMLDivElement>(null);
    const secondaryActionsRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);

    // Initial mount
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => setIsOpen(false), [pathname]);

    useGSAP(() => {
        if (!mounted || pathname !== '/') return;

        const isDesktop = window.innerWidth >= 768;
        if (!isDesktop) return;

        const viewportHeight = window.innerHeight;

        // Ensure all refs are present before animating
        if (!headerRef.current || !headerInnerRef.current || !logoWrapperRef.current || !leftLinksRef.current || !rightLinksRef.current || !secondaryActionsRef.current || !backgroundRef.current) return;

        // --- 1. INITIAL POSITIONING (Full Screen Splash) ---

        // Header container: Full viewport height, theme-dependent background for readability
        const initialBgColor = resolvedTheme === 'dark'
            ? "rgba(0, 0, 0, 0.15)"        // Dark overlay for dark mode
            : "rgba(255, 255, 255, 0.08)"; // Light overlay for light mode

        gsap.set(headerRef.current, {
            height: viewportHeight,
            backgroundColor: initialBgColor,
            backdropFilter: "blur(8px)"
        });

        // Background layer: Hidden initially
        gsap.set(backgroundRef.current, {
            opacity: 0,
            visibility: "hidden"
        });

        gsap.set(headerInnerRef.current, {
            height: viewportHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        // Logo: Center, Scale 1, Opacity 0 initially
        gsap.set(logoWrapperRef.current, {
            position: "absolute",
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
            scale: 1,
            opacity: 0,
            zIndex: 110,
            transformOrigin: 'center center'
        });

        // Left Nav: Center - offset
        gsap.set(leftLinksRef.current, {
            position: "absolute",
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
            x: -255,
            opacity: 0,
            zIndex: 105
        });

        // Right Nav: Center + offset
        gsap.set(rightLinksRef.current, {
            position: "absolute",
            left: "50%",
            right: "auto",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
            x: 255,
            opacity: 0,
            zIndex: 105
        });

        // Secondary actions: Hidden initially
        gsap.set(secondaryActionsRef.current, {
            position: "absolute",
            left: "50%",
            right: "auto",
            top: "50%",
            yPercent: -50,
            x: 200,
            opacity: 0,
            visibility: "hidden",
            zIndex: 100
        });

        // --- 2. ENTRANCE ANIMATION (Fade In) ---
        const entranceTl = gsap.timeline();
        entranceTl.to([logoWrapperRef.current, leftLinksRef.current, rightLinksRef.current], {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.3,
            stagger: 0.15,
            ease: "power3.out"
        });

        // --- 3. SCROLL INTERACTION (Triggered Animation - Only Once) ---
        const scrollTl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top -80",
                end: "+=100",
                scrub: false,
                once: true, // Only trigger once, never reverse
            }
        });

        // Animate Header Height & Blur
        scrollTl.to(headerRef.current, {
            height: 80,
            backdropFilter: "blur(12px)",
            duration: 0.8,
            ease: "power2.inOut"
        }, 0);

        // Animate Background Opacity
        scrollTl.to(backgroundRef.current, {
            opacity: 1,
            visibility: "visible",
            duration: 0.8,
            ease: "power2.inOut"
        }, 0);

        scrollTl.to(headerInnerRef.current, {
            height: 80,
            duration: 0.8,
            ease: "power2.inOut"
        }, 0);

        // Animate Logo: Scale down to 0.25
        scrollTl.to(logoWrapperRef.current, {
            scale: 0.25,
            duration: 0.8,
            ease: "power2.inOut"
        }, 0);

        // Spread Nav Items to Edges
        scrollTl.to(leftLinksRef.current, {
            left: '2.5rem',
            x: 0,
            xPercent: 0,
            top: '50%',
            yPercent: -50,
            duration: 0.8,
            ease: "power2.inOut"
        }, 0);

        // Right Nav (Portfolio, Contact) -> Left of Theme/Resume
        scrollTl.to(rightLinksRef.current, {
            left: '100%',
            xPercent: -100,
            x: -350,
            top: '50%',
            yPercent: -50,
            duration: 0.8,
            ease: "power2.inOut"
        }, 0);

        // Secondary Actions (Theme, Resume) -> Far right
        scrollTl.to(secondaryActionsRef.current, {
            left: '100%',
            xPercent: -100,
            x: -40,
            top: '50%',
            yPercent: -50,
            duration: 0.8,
            ease: "power2.inOut"
        }, 0);

        // Show Secondary Actions (Fade In near end)
        scrollTl.to(secondaryActionsRef.current, {
            opacity: 1,
            visibility: "visible",
            duration: 0.4
        }, 0.4);

    }, { dependencies: [mounted, pathname], scope: containerRef });

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    if (!mounted) return null;

    if (pathname?.startsWith('/courses')) return null;

    // Helper to render links (play select sound on nav click)
    const renderNavLinks = (sliceStart: number, sliceEnd: number) => {
        return (
            <ul className="flex space-x-10 items-center">
                {navLinks.slice(sliceStart, sliceEnd).map((link) => (
                    <li key={link.name}>
                        <AnimatedLink href={link.href} onClick={() => playMenuSelect()} className="font-unbounded text-xs font-bold tracking-widest uppercase text-black dark:text-primary hover:text-blue-600 dark:hover:text-primary transition-colors">
                            {link.name}
                        </AnimatedLink>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div ref={containerRef} className="relative w-full z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100000] md:hidden bg-background/95 backdrop-blur-3xl flex flex-col"
                    >
                        {/* Close button */}
                        <button onClick={() => { playMenuClose(); setIsOpen(false); }} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center border border-border rounded-full text-foreground z-10" aria-label="Close menu">
                            <X size={24} aria-hidden />
                        </button>

                        {/* Logo */}
                        <div className="absolute top-6 left-6 z-10">
                            <Link href="/" onClick={() => { playMenuSelect(); setIsOpen(false); }}>
                                <Image src={resolvedTheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg'} alt="Logo" width={48} height={48} />
                            </Link>
                        </div>

                        {/* Navigation + dotted lines + stagger animation */}
                        <motion.ul
                            className="flex flex-col flex-1 p-12 pt-32 pb-8 list-none"
                            variants={mobileMenuContainerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            aria-label="Mobile navigation"
                        >
                            {allMobileNavLinks.map((l) => (
                                <motion.li
                                    key={`${l.href}-${l.name}`}
                                    variants={mobileMenuItemVariants}
                                    className="border-b border-dashed border-border/60 py-4 first:pt-0"
                                >
                                    {l.href.startsWith('http') ? (
                                        <a
                                            href={l.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-3xl md:text-4xl font-unbounded font-black uppercase text-foreground hover:text-primary transition-colors block"
                                            onClick={() => { playMenuSelect(); setIsOpen(false); }}
                                        >
                                            {l.name}
                                        </a>
                                    ) : (
                                        <AnimatedLink
                                            href={l.href}
                                            className="text-3xl md:text-4xl font-unbounded font-black uppercase text-foreground hover:text-primary transition-colors block"
                                            onClick={() => { playMenuSelect(); setIsOpen(false); }}
                                        >
                                            {l.name}
                                        </AnimatedLink>
                                    )}
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Standard Header for non-home pages */}
            {pathname !== '/' && (() => {
                const { color1, color2 } = getGradientColors(pathname);
                return (
                <header className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-border overflow-hidden">
                    <LiquidGradientBackground
                        className="absolute inset-0 -z-20 w-full h-full pointer-events-none"
                        color1={color1}
                        color2={color2}
                    />
                    <div className="absolute inset-0 bg-background/55 backdrop-blur-md pointer-events-none" aria-hidden />
                    <div className="max-w-6xl mx-auto px-4 h-full flex justify-between items-center relative z-10">
                        <nav className="hidden md:flex flex-1 justify-start" aria-label="Main navigation">
                            {renderNavLinks(0, 2)}
                        </nav>
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-16">
                            <Link href="/" onClick={() => playMenuSelect()} className="block">
                                <Image src={resolvedTheme === 'dark' ? "/logo-light.svg" : "/logo-dark.svg"} alt="Logo" width={64} height={64} className="w-full h-auto" priority />
                            </Link>
                        </div>
                        <nav className="hidden md:flex flex-1 justify-end items-center gap-10" aria-label="Secondary navigation">
                            {renderNavLinks(2, 5)}
                            <div className="hidden lg:flex items-center gap-6">
                                <Link href="/resume" onClick={() => playMenuSelect()} className="bg-primary text-primary-foreground px-5 py-2.5 font-unbounded font-black text-[10px] tracking-widest uppercase rounded-md shadow-lg inline-flex items-center gap-2">
                                    Resume
                                </Link>
                                <button onClick={toggleTheme} className="p-2 bg-muted rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                                    {resolvedTheme === 'dark' ? <Sun size={16} className="text-foreground" aria-hidden /> : <Moon size={16} className="text-foreground" aria-hidden />}
                                </button>
                            </div>
                        </nav>
                        <div className="md:hidden ml-auto flex items-center gap-3">
                            <button onClick={toggleTheme} className="p-2 bg-muted rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                                {resolvedTheme === 'dark' ? <Sun size={16} className="text-foreground" aria-hidden /> : <Moon size={16} className="text-foreground" aria-hidden />}
                            </button>
                            <button onClick={() => { playMenuOpen(); setIsOpen(true); }} className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center" aria-label="Open menu" aria-expanded={isOpen}>
                                <span className="flex flex-col justify-center gap-1 w-5" aria-hidden>
                                    <span className="block w-5 h-0.5 bg-foreground rounded-full" />
                                    <span className="block w-5 h-0.5 bg-foreground rounded-full" />
                                </span>
                            </button>
                        </div>
                    </div>
                </header>
                );
            })()}

            {/* Home Page Animated Header Elements */}
            {pathname === '/' && (() => {
                const { color1, color2 } = getGradientColors(pathname);
                return (
                <>
                    <header
                        ref={headerRef}
                        className="fixed top-0 left-0 right-0 w-full z-[100] transition-colors duration-500 pointer-events-none overflow-hidden"
                    >
                        <LiquidGradientBackground
                            className="absolute inset-0 -z-20 w-full h-full pointer-events-none"
                            color1={color1}
                            color2={color2}
                        />
                        {/* Separate background layer for color transition */}
                        <div
                            ref={backgroundRef}
                            className="absolute inset-0 bg-background/55 w-full h-full -z-10"
                        />

                        <div ref={headerInnerRef} className="w-full h-full relative pointer-events-auto">

                            {/* Left Group - Hidden on mobile/tablet */}
                            <div
                                ref={leftLinksRef}
                                className="hidden md:flex pointer-events-auto items-center"
                            >
                                {renderNavLinks(0, 2)}
                            </div>

                            {/* Logo Wrapper - Hidden on mobile/tablet, inline SVG for stroke intro animation */}
                            <div
                                ref={logoWrapperRef}
                                className="hidden md:block pointer-events-auto w-[250px]"
                            >
                                <Link href="/" onClick={() => playMenuSelect()} className="block w-full text-[#1D4ED8] dark:text-white" aria-label="Home">
                                    <svg
                                        width="250"
                                        height="250"
                                        viewBox="0 0 113 112"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-full h-auto"
                                    >
                                        <path className="logo-stroke" d="M30.3918 105.99V49.9899C30.3918 47.9111 32.3859 46.1434 35.0632 45.8182L47.4157 44.3758C49.9453 44.0788 52.2163 45.5778 52.2163 47.5434V51.4606L68.317 50.5556" strokeMiterlimit="10" />
                                        <path className="logo-stroke" d="M95.4222 11.9071L84.4546 13.1091V11.2141C84.4546 8.7394 81.6296 6.8303 78.4353 7.12727L69.868 7.93333C67.1168 8.18788 65.0489 9.98384 65.0489 12.1051V21.4667C65.0489 22.895 65.5659 24.3091 66.526 25.5253L82.8482 46.3273C83.9007 47.6707 84.4546 49.198 84.4546 50.7535V61.5859C84.4546 63.5798 82.4974 65.2768 79.9124 65.5172L65.0489 66.903V56.9616" strokeMiterlimit="10" />
                                        <path className="logo-stroke" d="M33.2353 78.3576L41.7657 77.6081" strokeMiterlimit="10" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Right Group - Hidden on mobile/tablet */}
                            <div
                                ref={rightLinksRef}
                                className="hidden md:flex pointer-events-auto items-center gap-12"
                            >
                                {renderNavLinks(2, 5)}
                            </div>

                            {/* Theme and Resume (Secondary Actions) - Hidden on mobile/tablet, shown on desktop */}
                            <div
                                ref={secondaryActionsRef}
                                className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 items-center gap-6"
                            >
                                <Link href="/resume" onClick={() => playMenuSelect()} className="bg-primary text-primary-foreground px-6 py-3 font-unbounded font-black text-[10px] tracking-widest uppercase rounded-md shadow-xl pointer-events-auto inline-flex items-center gap-2">
                                    Resume
                                </Link>
                                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors pointer-events-auto bg-white/10 backdrop-blur-md" aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                                    {resolvedTheme === 'dark' ? <Sun size={20} className="text-foreground" aria-hidden /> : <Moon size={20} className="text-foreground" aria-hidden />}
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Mobile/Tablet View */}
                    <header className="md:hidden fixed top-0 left-0 w-full h-20 px-6 flex justify-between items-center z-[101]">
                        <Link href="/" onClick={() => playMenuSelect()}><Image src={resolvedTheme === 'dark' ? "/logo-light.svg" : "/logo-dark.svg"} alt="Logo" width={48} height={48} /></Link>
                        <div className="flex items-center gap-3">
                            <button onClick={toggleTheme} className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors" aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                                {resolvedTheme === 'dark' ? <Sun size={18} className="text-foreground" aria-hidden /> : <Moon size={18} className="text-foreground" aria-hidden />}
                            </button>
                            <button onClick={() => { playMenuOpen(); setIsOpen(true); }} className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center" aria-label="Open menu" aria-expanded={isOpen}>
                                <span className="flex flex-col justify-center gap-1 w-5" aria-hidden>
                                    <span className="block w-5 h-0.5 bg-foreground rounded-full" />
                                    <span className="block w-5 h-0.5 bg-foreground rounded-full" />
                                </span>
                            </button>
                        </div>
                    </header>
                </>
                );
            })()}
        </div>
    );
}

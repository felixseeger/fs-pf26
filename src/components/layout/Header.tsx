'use client';

import React, { useRef, useState, useEffect } from 'react';
import AnimatedLink from '@/components/ui/AnimatedLink';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import LiquidGradientBackground, { type GradientColor } from '@/components/ui/LiquidGradientBackground';
import { DEFAULT_SOCIAL_URLS } from '@/lib/site-config';
import { playMenuOpen, playMenuClose, playMenuSelect } from '@/lib/menu-sounds';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

gsap.registerPlugin(ScrollTrigger);

// Brand-adapted layer colors (flash lime → settle into navy)
const MENU_BG_COLORS = ['#a3e635', '#011627', '#052d1a', '#073d22'] as const;

const GRADIENT_BY_PATH: Record<string, { color1: GradientColor; color2: GradientColor }> = {
  '/': { color1: [0.945, 0.353, 0.133], color2: [0.039, 0.055, 0.153] },
  '/services': { color1: [0.2, 0.48, 0.95], color2: [0.02, 0.06, 0.18] },
  '/courses': { color1: [0.38, 0.85, 0.98], color2: [0.02, 0.1, 0.2] },
  '/portfolio': { color1: [0.6, 0.35, 0.9], color2: [0.08, 0.04, 0.15] },
  '/resume': { color1: [0.95, 0.55, 0.2], color2: [0.08, 0.05, 0.12] },
  '/about': { color1: [0.15, 0.7, 0.6], color2: [0.02, 0.08, 0.1] },
  '/ueber-mich': { color1: [0.15, 0.7, 0.6], color2: [0.02, 0.08, 0.1] },
  '/contact': { color1: [0.9, 0.4, 0.5], color2: [0.12, 0.03, 0.08] },
  '/shop': { color1: [0.3, 0.8, 0.5], color2: [0.02, 0.1, 0.06] },
  '/impressum': { color1: [0.5, 0.5, 0.6], color2: [0.06, 0.06, 0.1] },
  '/privacy-policy': { color1: [0.5, 0.5, 0.6], color2: [0.06, 0.06, 0.1] },
};

function getGradientColors(pathname: string) {
  const exact = GRADIENT_BY_PATH[pathname];
  if (exact) return exact;
  if (pathname.startsWith('/ueber-mich')) return GRADIENT_BY_PATH['/about'];
  if (pathname.startsWith('/services')) return GRADIENT_BY_PATH['/services'];
  if (pathname.startsWith('/courses')) return GRADIENT_BY_PATH['/courses'];
  if (pathname.startsWith('/portfolio')) return GRADIENT_BY_PATH['/portfolio'];
  if (pathname.startsWith('/shop')) return GRADIENT_BY_PATH['/shop'];
  return GRADIENT_BY_PATH['/'];
}

const socialLinkLabels: Record<string, string> = {
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

const mobileSocialLinks = (Object.entries(DEFAULT_SOCIAL_URLS) as [string, string][])
  .filter(([key]) => !['instagram', 'facebook', 'twitter'].includes(key))
  .filter(([, url]) => url?.trim())
  .map(([key, href]) => ({ name: socialLinkLabels[key] ?? key, href }));

interface NavItem { name: string; href: string; }

export default function Header({
  locale = 'de',
  navItems,
}: {
  locale?: string;
  navItems?: NavItem[];
}) {
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const navLinks: NavItem[] = navItems && navItems.length > 0
    ? navItems
    : [
        { name: t('about'),     href: '/#about'   },
        { name: t('services'),  href: '/#services' },
        { name: t('portfolio'), href: '/portfolio' },
        { name: t('courses'),   href: '/courses'   },
        { name: t('shop'),      href: '/shop'      },
      ];

  const mobileNavLinks: NavItem[] = [
    ...navLinks,
    { name: t('resume'), href: '/resume' },
  ];

  const legalLinks = [
    { name: tFooter('imprint'), href: '/impressum' },
    { name: tFooter('privacy'), href: '/privacy-policy' },
  ];

  const { setTheme, resolvedTheme } = useTheme();

  // ── Desktop header refs (unchanged) ──
  const containerRef       = useRef<HTMLDivElement>(null);
  const headerRef          = useRef<HTMLElement>(null);
  const headerInnerRef     = useRef<HTMLDivElement>(null);
  const logoWrapperRef     = useRef<HTMLDivElement>(null);
  const leftLinksRef       = useRef<HTMLDivElement>(null);
  const rightLinksRef      = useRef<HTMLDivElement>(null);
  const secondaryActionsRef = useRef<HTMLDivElement>(null);
  const backgroundRef      = useRef<HTMLDivElement>(null);

  // ── Mobile menu GSAP refs ──
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const navBgRefs      = useRef<HTMLDivElement[]>([]);
  const navContentRef  = useRef<HTMLDivElement>(null);
  const menuTlRef      = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  // Close menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Build GSAP menu timeline (once on mount) ──
  useGSAP(() => {
    if (!mounted) return;
    const overlay    = menuOverlayRef.current;
    const navContent = navContentRef.current;
    if (!overlay || !navContent) return;

    const navBgs = navBgRefs.current.filter(Boolean);
    if (navBgs.length === 0) return;

    // Establish initial states before first paint
    gsap.set(navBgs, { scaleY: 0, transformOrigin: 'top' });
    gsap.set(navContent, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' });
    gsap.set(overlay.querySelectorAll('[data-menu-line]'), { y: '100%' });

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => { isAnimatingRef.current = false; },
      onReverseComplete: () => {
        gsap.set(overlay.querySelectorAll('[data-menu-line]'), { y: '100%' });
        isAnimatingRef.current = false;
      },
    });

    tl.to(navBgs, {
      scaleY: 1,
      duration: 0.75,
      stagger: 0.1,
      ease: 'power3.inOut',
    });

    tl.to(navContent, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 0.75,
      ease: 'power3.inOut',
    }, '-=0.6');

    menuTlRef.current = tl;
  }, { scope: menuOverlayRef, dependencies: [mounted] });

  // ── Respond to isOpen changes ──
  useEffect(() => {
    const tl = menuTlRef.current;
    if (!tl || isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    if (isOpen) {
      tl.play();
      const overlay = menuOverlayRef.current;
      if (overlay) {
        gsap.fromTo(
          overlay.querySelectorAll('[data-menu-line]'),
          { y: '100%' },
          { y: '0%', duration: 0.75, stagger: 0.05, ease: 'power3.out', delay: 0.85 },
        );
      }
    } else {
      tl.reverse();
    }
  }, [isOpen]);

  // ── Desktop GSAP header animation (unchanged) ──
  useGSAP(() => {
    if (!mounted || pathname !== '/') return;
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) return;

    const viewportHeight = window.innerHeight;
    if (!headerRef.current || !headerInnerRef.current || !logoWrapperRef.current ||
        !leftLinksRef.current || !rightLinksRef.current ||
        !secondaryActionsRef.current || !backgroundRef.current) return;

    const initialBgColor = resolvedTheme === 'dark'
      ? 'rgba(0, 0, 0, 0.15)'
      : 'rgba(255, 255, 255, 0.08)';

    gsap.set(headerRef.current,      { height: viewportHeight, backgroundColor: initialBgColor, backdropFilter: 'blur(8px)' });
    gsap.set(backgroundRef.current,  { opacity: 0, visibility: 'hidden' });
    gsap.set(headerInnerRef.current, { height: viewportHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' });
    gsap.set(logoWrapperRef.current, { position: 'absolute', left: '50%', top: '50%', xPercent: -50, yPercent: -50, scale: 1, opacity: 0, zIndex: 110, transformOrigin: 'center center' });
    gsap.set(leftLinksRef.current,   { position: 'absolute', left: '50%', top: '50%', xPercent: -50, yPercent: -50, x: -255, opacity: 0, zIndex: 105 });
    gsap.set(rightLinksRef.current,  { position: 'absolute', left: '50%', right: 'auto', top: '50%', xPercent: -50, yPercent: -50, x: 255, opacity: 0, zIndex: 105 });
    gsap.set(secondaryActionsRef.current, { position: 'absolute', left: '50%', right: 'auto', top: '50%', yPercent: -50, x: 200, opacity: 0, visibility: 'hidden', zIndex: 100 });

    const entranceTl = gsap.timeline();
    entranceTl.to([logoWrapperRef.current, leftLinksRef.current, rightLinksRef.current], {
      opacity: 1, y: 0, duration: 1, delay: 0.3, stagger: 0.15, ease: 'power3.out',
    });

    const scrollTl = gsap.timeline({
      scrollTrigger: { trigger: 'body', start: 'top -80', end: '+=100', scrub: false, once: true },
    });

    scrollTl.to(headerRef.current,      { height: 80, backdropFilter: 'blur(12px)', duration: 0.8, ease: 'power2.inOut' }, 0);
    scrollTl.to(backgroundRef.current,  { opacity: 1, visibility: 'visible', duration: 0.8, ease: 'power2.inOut' }, 0);
    scrollTl.to(headerInnerRef.current, { height: 80, duration: 0.8, ease: 'power2.inOut' }, 0);
    scrollTl.to(logoWrapperRef.current, { scale: 0.25, duration: 0.8, ease: 'power2.inOut' }, 0);
    scrollTl.to(leftLinksRef.current,   { left: '2.5rem', x: 0, xPercent: 0, top: '50%', yPercent: -50, duration: 0.8, ease: 'power2.inOut' }, 0);
    scrollTl.to(rightLinksRef.current,  { left: '100%', xPercent: -100, x: -350, top: '50%', yPercent: -50, duration: 0.8, ease: 'power2.inOut' }, 0);
    scrollTl.to(secondaryActionsRef.current, { left: '100%', xPercent: -100, x: -40, top: '50%', yPercent: -50, duration: 0.8, ease: 'power2.inOut' }, 0);
    scrollTl.to(secondaryActionsRef.current, { opacity: 1, visibility: 'visible', duration: 0.4 }, 0.4);

  }, { dependencies: [mounted, pathname], scope: containerRef });

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const handleMenuToggle = () => {
    if (isAnimatingRef.current) return;
    if (isOpen) { playMenuClose(); setIsOpen(false); }
    else         { playMenuOpen();  setIsOpen(true);  }
  };

  const handleNavClick = () => { playMenuSelect(); setIsOpen(false); };

  if (!mounted) return null;
  if (pathname?.startsWith('/courses')) return null;

  const renderNavLinks = (sliceStart: number, sliceEnd: number) => (
    <ul className="flex space-x-10 items-center">
      {navLinks.slice(sliceStart, sliceEnd).map((link) => (
        <li key={link.name}>
          <AnimatedLink
            href={link.href}
            onClick={() => playMenuSelect()}
            className="font-unbounded text-xs font-bold tracking-widest uppercase text-black dark:text-primary hover:text-blue-600 dark:hover:text-primary transition-colors"
          >
            {link.name}
          </AnimatedLink>
        </li>
      ))}
    </ul>
  );

  // Hamburger that morphs to ✕ when open — sits at z-100 above the z-98 overlay
  const toggler = (
    <button
      onClick={handleMenuToggle}
      className="relative z-[100] flex flex-col justify-center items-center gap-[5px] w-10 h-10"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <span className={`block w-7 h-[2px] rounded-full transition-all duration-300 origin-center ${
        isOpen ? 'bg-white rotate-45 translate-y-[3.5px]' : 'bg-foreground'
      }`} />
      <span className={`block w-7 h-[2px] rounded-full transition-all duration-300 origin-center ${
        isOpen ? 'bg-white -rotate-45 -translate-y-[3.5px]' : 'bg-foreground'
      }`} />
    </button>
  );

  return (
    <div ref={containerRef} className="relative w-full z-[100]">

      {/* ═══════════════════════════════════════════════════
          GSAP Grid-Overlay Mobile Menu
          z-[98] — always mounted, below headers (z-100)
          ═══════════════════════════════════════════════════ */}
      <div
        id="mobile-menu"
        ref={menuOverlayRef}
        className="fixed inset-0 z-[98] md:hidden"
        aria-hidden={!isOpen}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        {/* 4 staggered background layer panels */}
        {MENU_BG_COLORS.map((color, i) => (
          <div
            key={i}
            ref={(el) => { if (el) navBgRefs.current[i] = el; }}
            className="absolute inset-0 will-change-transform"
            style={{ backgroundColor: color }}
          />
        ))}

        {/* Nav content — clip-path revealed */}
        <div
          ref={navContentRef}
          className="absolute inset-0 flex flex-col will-change-[clip-path]"
          style={{ backgroundColor: '#011627' }}
        >
          {/* Top bar — logo placeholder height (header is above at z-100) */}
          <div className="h-20 shrink-0" />

          {/* Two-column nav content */}
          <div className="flex flex-1 gap-6 px-6 sm:px-10 py-8 min-h-0">

            {/* Col 1: Socials (top) + Legal (bottom) — hidden on very small screens */}
            <div className="hidden sm:flex flex-col justify-between shrink-0 w-36">
              <div className="flex flex-col gap-2">
                {mobileSocialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playMenuSelect()}
                    className="block overflow-hidden"
                  >
                    <span
                      data-menu-line
                      className="block text-base font-medium text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </span>
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                {legalLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={handleNavClick} className="block overflow-hidden">
                    <span
                      data-menu-line
                      className="block text-xs font-medium text-white/30 hover:text-white/60 transition-colors duration-200"
                    >
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 2: Primary nav links */}
            <div className="flex-1 flex flex-col justify-center">
              {mobileNavLinks.map((link) => (
                link.href.startsWith('http') ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleNavClick}
                    className="block overflow-hidden leading-[1.05] mb-0.5"
                  >
                    <span
                      data-menu-line
                      className="block text-[2.25rem] sm:text-5xl font-unbounded font-black uppercase text-white hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </span>
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={handleNavClick}
                    className="block overflow-hidden leading-[1.05] mb-0.5"
                  >
                    <span
                      data-menu-line
                      className="block text-[2.25rem] sm:text-5xl font-unbounded font-black uppercase text-white hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </span>
                  </Link>
                )
              ))}

              {/* Socials inline on small mobile (col 1 hidden) */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 sm:hidden mt-6">
                {mobileSocialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playMenuSelect()}
                    className="block overflow-hidden"
                  >
                    <span
                      data-menu-line
                      className="block text-sm font-medium text-white/50 hover:text-white transition-colors"
                    >
                      {link.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar: Language + Theme */}
          <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-t border-white/10 shrink-0">
            <LanguageSwitcher locale={locale} />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark'
                ? <Sun size={18} className="text-white" aria-hidden />
                : <Moon size={18} className="text-white" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          Standard Header — non-home pages
          ═══════════════════════════════════════════════════ */}
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
                  <Image src={resolvedTheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg'} alt="Logo" width={64} height={64} className="w-full h-auto" priority />
                </Link>
              </div>
              <nav className="hidden md:flex flex-1 justify-end items-center gap-10" aria-label="Secondary navigation">
                {renderNavLinks(2, 5)}
                <div className="hidden lg:flex items-center gap-6">
                  <LanguageSwitcher locale={locale} />
                  <button onClick={toggleTheme} className="p-2 bg-muted rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                    {resolvedTheme === 'dark' ? <Sun size={16} className="text-foreground" aria-hidden /> : <Moon size={16} className="text-foreground" aria-hidden />}
                  </button>
                </div>
              </nav>
              {/* Mobile controls */}
              <div className="md:hidden ml-auto flex items-center gap-1">
                <button onClick={toggleTheme} className="p-2 bg-muted rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                  {resolvedTheme === 'dark' ? <Sun size={16} className="text-foreground" aria-hidden /> : <Moon size={16} className="text-foreground" aria-hidden />}
                </button>
                {toggler}
              </div>
            </div>
          </header>
        );
      })()}

      {/* ═══════════════════════════════════════════════════
          Home Page Animated Header
          ═══════════════════════════════════════════════════ */}
      {pathname === '/' && (() => {
        const { color1, color2 } = getGradientColors(pathname);
        return (
          <>
            {/* Desktop animated header */}
            <header
              ref={headerRef}
              className="fixed top-0 left-0 right-0 w-full z-[100] transition-colors duration-500 pointer-events-none overflow-hidden"
            >
              <LiquidGradientBackground
                className="absolute inset-0 -z-20 w-full h-full pointer-events-none"
                color1={color1}
                color2={color2}
              />
              <div ref={backgroundRef} className="absolute inset-0 bg-background/55 w-full h-full -z-10" />

              <div ref={headerInnerRef} className="w-full h-full relative pointer-events-auto">
                <div ref={leftLinksRef} className="hidden md:flex pointer-events-auto items-center">
                  {renderNavLinks(0, 2)}
                </div>

                <div ref={logoWrapperRef} className="hidden md:block pointer-events-auto w-[250px]">
                  <Link href="/" onClick={() => playMenuSelect()} className="block w-full text-[#1D4ED8] dark:text-white" aria-label="Home">
                    <svg width="250" height="250" viewBox="0 0 113 112" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                      <path className="logo-stroke" d="M30.3918 105.99V49.9899C30.3918 47.9111 32.3859 46.1434 35.0632 45.8182L47.4157 44.3758C49.9453 44.0788 52.2163 45.5778 52.2163 47.5434V51.4606L68.317 50.5556" strokeMiterlimit="10" />
                      <path className="logo-stroke" d="M95.4222 11.9071L84.4546 13.1091V11.2141C84.4546 8.7394 81.6296 6.8303 78.4353 7.12727L69.868 7.93333C67.1168 8.18788 65.0489 9.98384 65.0489 12.1051V21.4667C65.0489 22.895 65.5659 24.3091 66.526 25.5253L82.8482 46.3273C83.9007 47.6707 84.4546 49.198 84.4546 50.7535V61.5859C84.4546 63.5798 82.4974 65.2768 79.9124 65.5172L65.0489 66.903V56.9616" strokeMiterlimit="10" />
                      <path className="logo-stroke" d="M33.2353 78.3576L41.7657 77.6081" strokeMiterlimit="10" />
                    </svg>
                  </Link>
                </div>

                <div ref={rightLinksRef} className="hidden md:flex pointer-events-auto items-center gap-12">
                  {renderNavLinks(2, 5)}
                </div>

                <div ref={secondaryActionsRef} className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 items-center gap-6">
                  <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors pointer-events-auto bg-white/10 backdrop-blur-md" aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                    {resolvedTheme === 'dark' ? <Sun size={20} className="text-foreground" aria-hidden /> : <Moon size={20} className="text-foreground" aria-hidden />}
                  </button>
                </div>
              </div>
            </header>

            {/* Mobile bar for home page */}
            <header className="md:hidden fixed top-0 left-0 w-full h-20 px-6 flex justify-between items-center z-[100]">
              <Link href="/" onClick={() => playMenuSelect()}>
                <Image src={resolvedTheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg'} alt="Logo" width={48} height={48} />
              </Link>
              <div className="flex items-center gap-1">
                <button onClick={toggleTheme} className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors" aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                  {resolvedTheme === 'dark' ? <Sun size={18} className="text-foreground" aria-hidden /> : <Moon size={18} className="text-foreground" aria-hidden />}
                </button>
                {toggler}
              </div>
            </header>
          </>
        );
      })()}
    </div>
  );
}

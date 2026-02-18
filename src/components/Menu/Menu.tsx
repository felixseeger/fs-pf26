'use client';

import './Menu.css';
import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import LiquidGradientBackground from '@/components/ui/LiquidGradientBackground';
import { playMenuOpen, playMenuClose, playMenuSelect } from '@/lib/menu-sounds';

export interface MenuLink {
  href: string;
  label: string;
}

export interface MenuSubColumn {
  title: string;
  links: MenuLink[];
}

export interface MenuSocialLink {
  href: string;
  label: string;
}

export interface MenuProps {
  logo?: string;
  /** Optional React node for logo (e.g. Image + Link); when set, shown instead of logo text */
  logoNode?: React.ReactNode;
  mainLinks?: MenuLink[];
  /** Title for the main (left) column in the overlay */
  mainColumnTitle?: string;
  subColumns?: MenuSubColumn[];
  socialLinks?: MenuSocialLink[];
  /** Legal links shown below social links in the overlay footer */
  legalLinks?: MenuLink[];
  /** Use Three.js gradient background and glassmorphism (e.g. for Courses Menu) */
  variant?: 'default' | 'glass';
}

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

function scrambleText(elements: Element[], duration = 0.4): void {
  elements.forEach((el) => {
    const span = el as HTMLSpanElement;
    const originalText = span.textContent ?? '';
    let iterations = 0;
    const maxIterations = Math.floor(Math.random() * 6) + 3;

    gsap.set(span, { opacity: 1 });

    const scrambleInterval = setInterval(() => {
      span.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      iterations++;
      if (iterations >= maxIterations) {
        clearInterval(scrambleInterval);
        span.textContent = originalText;
      }
    }, 25);

    setTimeout(() => {
      clearInterval(scrambleInterval);
      span.textContent = originalText;
    }, duration * 1000);
  });
}

const defaultMainLinks: MenuLink[] = [
  { href: '/', label: 'Index' },
  { href: '/#about', label: 'About' },
  { href: '/#services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/courses', label: 'Courses' },
  { href: '/resume', label: 'Resume' },
];

const defaultSubColumns: MenuSubColumn[] = [
  {
    title: 'Explore',
    links: [
      { href: '/portfolio', label: 'Portfolio' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

const defaultSocialLinks: MenuSocialLink[] = [
  { href: 'https://x.com/codegridweb', label: 'Twitter' },
  { href: 'https://www.instagram.com/codegridweb/', label: 'Instagram' },
  { href: 'https://www.youtube.com/@codegrid', label: 'YouTube' },
];

export default function Menu({
  logo = 'Menu',
  logoNode,
  mainLinks = defaultMainLinks,
  mainColumnTitle = 'Navigation',
  subColumns = defaultSubColumns,
  socialLinks = defaultSocialLinks,
  legalLinks = [],
  variant = 'default',
}: MenuProps) {
  const isGlass = variant === 'glass';
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const menuRef = useRef<HTMLElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const charElementsRef = useRef<Element[]>([]);
  const mainWordElementsRef = useRef<Element[]>([]);
  const lastScrollY = useRef(0);

  const openMenu = useCallback(() => {
    playMenuOpen();
    setIsOpen(true);
    setIsAnimating(true);

    hamburgerRef.current?.classList.add('open');

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    tl.to(menuOverlayRef.current, {
      duration: 0.75,
      scaleY: 1,
      ease: 'power4.out',
    });

    tl.to(
      mainWordElementsRef.current,
      {
        duration: 0.75,
        yPercent: 0,
        stagger: 0.1,
        ease: 'power4.out',
      },
      '-=0.5'
    );

    const subCols = menuOverlayRef.current?.querySelectorAll('.menu-overlay-sub-col') ?? [];
    subCols.forEach((col) => {
      const links = col.querySelectorAll('.menu-sub-links a');
      tl.to(
        links,
        {
          duration: 0.75,
          y: 0,
          opacity: 1,
          stagger: 0.05,
          ease: 'power4.out',
        },
        '<'
      );
    });

    tl.add(() => {
      const linkChars = menuOverlayRef.current?.querySelectorAll('.menu-link-char') ?? [];
      const linkCharsArray = Array.from(linkChars);
      gsap.set(linkCharsArray, { opacity: 0 });
      gsap.to(linkCharsArray, {
        opacity: 1,
        duration: 0.05,
        ease: 'power2.inOut',
        stagger: { amount: 0.5, each: 0.1, from: 'random' },
      });
    }, '-=0.4');

    tl.add(() => {
      charElementsRef.current.forEach((char, index) => {
        setTimeout(() => scrambleText([char], 0.4), index * 30);
      });
    }, '<');
  }, []);

  const closeMenu = useCallback(() => {
    playMenuClose();
    setIsOpen(false);
    setIsAnimating(true);

    hamburgerRef.current?.classList.remove('open');

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    const linkChars = menuOverlayRef.current?.querySelectorAll('.menu-link-char') ?? [];
    const linkCharsArray = Array.from(linkChars);
    tl.to(linkCharsArray, {
      opacity: 0,
      duration: 0.05,
      ease: 'power2.inOut',
      stagger: { amount: 0.5, each: 0.1, from: 'random' },
    });

    tl.add(() => {
      gsap.to(charElementsRef.current, { opacity: 0, duration: 0.2 });
    }, '+=0.35');

    const subCols = menuOverlayRef.current?.querySelectorAll('.menu-overlay-sub-col') ?? [];
    subCols.forEach((col) => {
      const links = col.querySelectorAll('.menu-sub-links a');
      tl.to(
        links,
        {
          duration: 0.3,
          y: 50,
          opacity: 0,
          stagger: -0.05,
          ease: 'power3.in',
        },
        '+=0'
      );
    });

    tl.to(
      mainWordElementsRef.current,
      {
        duration: 0.3,
        yPercent: 120,
        stagger: -0.05,
        ease: 'power3.in',
      },
      '<'
    );

    tl.to(
      menuOverlayRef.current,
      {
        duration: 0.5,
        scaleY: 0,
        ease: 'power3.inOut',
      },
      '-=0.1'
    );
  }, []);

  const toggleMenu = useCallback(() => {
    if (isAnimating) return;
    if (isOpen) closeMenu();
    else openMenu();
  }, [isAnimating, isOpen, openMenu, closeMenu]);

  const handleLinkClick = useCallback(() => {
    playMenuSelect();
    if (isOpen) setTimeout(closeMenu, 500);
  }, [isOpen, closeMenu]);

  useEffect(() => {
    const overlay = menuOverlayRef.current;
    if (!overlay) return;

    gsap.set(overlay, {
      scaleY: 0,
      transformOrigin: 'top center',
    });

    const scrambleSelectors = '.menu-items-header .menu-char, .menu-social .menu-char';
    const scrambleEls = overlay.querySelectorAll(scrambleSelectors);
    charElementsRef.current = Array.from(scrambleEls);
    gsap.set(charElementsRef.current, { opacity: 0 });

    const mainWords = overlay.querySelectorAll('.menu-main-link .menu-word');
    mainWordElementsRef.current = Array.from(mainWords);
    gsap.set(mainWordElementsRef.current, { yPercent: 120 });

    const subLinks = overlay.querySelectorAll('.menu-sub-links a');
    gsap.set(subLinks, { y: 50, opacity: 0 });

    const linkChars = overlay.querySelectorAll('.menu-link-char');
    gsap.set(linkChars, { opacity: 0 });
  }, [mainLinks, subColumns, socialLinks]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1000);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      if (menuRef.current && !isMenuVisible) {
        menuRef.current.classList.remove('hidden');
        setIsMenuVisible(true);
      }
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        if (isOpen) closeMenu();
        if (isMenuVisible && menuRef.current) {
          menuRef.current.classList.add('hidden');
          setIsMenuVisible(false);
        }
      } else if (currentScrollY < lastScrollY.current && !isMenuVisible && menuRef.current) {
        menuRef.current.classList.remove('hidden');
        setIsMenuVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, isMenuVisible, isMobile, closeMenu]);

  return (
    <nav className={`menu ${isGlass ? 'menu--glass' : ''} ${isGlass && isOpen ? 'menu--open' : ''}`} ref={menuRef} aria-label="Main menu">
      {isGlass && (
        <>
          <LiquidGradientBackground className="menu__gradient" />
          <div className="menu__glass-overlay" aria-hidden />
        </>
      )}
      <div className="menu-header" onClick={toggleMenu} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleMenu()}>
        {logoNode ? <div className="menu-logo">{logoNode}</div> : <h4 className="menu-logo">{logo}</h4>}
        <div className="menu-header-actions">
          {isGlass && (
            <button
              type="button"
              className="menu-theme-toggle"
              aria-label={!mounted ? 'Switch to light mode' : (resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}
              onClick={(e) => {
                e.stopPropagation();
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              }}
            >
              {!mounted ? <Sun size={18} aria-hidden /> : (resolvedTheme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />)}
            </button>
          )}
          <button type="button" className="menu-toggle" aria-label="Toggle menu" aria-expanded={isOpen}>
            <div className="menu-hamburger-icon" ref={hamburgerRef}>
              <span className="menu-item" />
              <span className="menu-item" />
            </div>
          </button>
        </div>
      </div>

      <div className="menu-overlay" ref={menuOverlayRef}>
        <div className="menu-overlay-items">
          <div className="menu-overlay-col menu-overlay-col-sm">
            <div className="menu-items-header">
              <p>
                {mainColumnTitle.split('').map((c, i) => (
                  <span key={i} className="menu-char">
                    {c}
                  </span>
                ))}
              </p>
            </div>
            <div className="menu-main-links">
              {mainLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="menu-main-link"
                  onClick={handleLinkClick}
                >
                  <h4>
                    {link.label.split(/\s+/).map((word, i) => (
                      <span key={i} className="menu-word">
                        {word}{' '}
                      </span>
                    ))}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
          <div className="menu-overlay-col menu-overlay-col-lg">
            {subColumns.map((col) => (
              <div key={col.title} className="menu-overlay-sub-col">
                <div className="menu-items-header">
                  <p>
                    {col.title.split('').map((c, i) => (
                      <span key={i} className="menu-char">
                        {c}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="menu-sub-links">
                  {col.links.map((link) => (
                    <Link key={link.href + link.label} href={link.href} onClick={handleLinkClick}>
                      <span className="menu-sub-link-text" aria-hidden>
                        {link.label.split('').map((c, i) => (
                          <span key={i} className="menu-link-char">
                            {c}
                          </span>
                        ))}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="menu-overlay-footer">
          <div className="menu-overlay-footer-social">
            {socialLinks.map((link) => (
              <div key={link.href + link.label} className="menu-social">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                >
                  {link.label.split('').map((c, i) => (
                    <span key={i} className="menu-char">
                      {c}
                    </span>
                  ))}
                </a>
              </div>
            ))}
          </div>
          {legalLinks.length > 0 && (
            <div className="menu-legal">
              {legalLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href} onClick={handleLinkClick}>
                  <span className="menu-legal-link-text" aria-hidden>
                    {link.label.split('').map((c, i) => (
                      <span key={i} className="menu-link-char">
                        {c}
                      </span>
                    ))}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import PreloaderAnimation from '@/components/ui/PreloaderAnimation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Avoid the "useLayoutEffect does nothing on the server" warning
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SESSION_KEY = 'homePreloaderShown';

export interface HomePreloaderWrapperProps {
  children: React.ReactNode;
  orbitLabels?: string[];
  backgroundColor?: string;
  textColor?: string;
  counterDuration?: number;
  showOncePerSession?: boolean;
}

export default function HomePreloaderWrapper({
  children,
  orbitLabels,
  backgroundColor,
  textColor,
  counterDuration,
  showOncePerSession = true,
}: HomePreloaderWrapperProps) {
  // Start false: SSR + hydration both render content immediately → no flash,
  // no layout-shift, no blocked scroll anchors for returning visitors.
  const [showPreloader, setShowPreloader] = useState(false);

  // Runs synchronously before the browser paints (client-only).
  // On first visit this sets showPreloader→true before anything is visible,
  // so the user never sees a flash of page content beneath the intro.
  useIsomorphicLayoutEffect(() => {
    const forceShow =
      new URLSearchParams(window.location.search).get('preload') === 'true';
    const alreadyShown =
      showOncePerSession && sessionStorage.getItem(SESSION_KEY);

    if (forceShow || !alreadyShown) {
      setShowPreloader(true);
    }
    // Returning visitors: stays false → preloader never mounts → chunk never loads
  }, [showOncePerSession]);

  // Stable reference — must not change identity between renders so GSAP's
  // onComplete dependency never triggers a mid-animation effect restart.
  const handleComplete = useCallback(() => {
    if (showOncePerSession) sessionStorage.setItem(SESSION_KEY, '1');
    setShowPreloader(false);
    // Notify SmoothScroll to resize Lenis and refresh ScrollTrigger after preloader unmounts
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('preloader-complete'));
    });
  }, [showOncePerSession]);

  // Safety timeout: if GSAP fails to fire onComplete (tab backgrounded, reduced
  // motion, slow device) the preloader is force-dismissed after 15 s.
  useEffect(() => {
    if (!showPreloader) return;
    const id = setTimeout(handleComplete, 15_000);
    return () => clearTimeout(id);
  }, [showPreloader, handleComplete]);

  // When preloader is skipped (returning visitor or nav from subpage), fire
  // preloader-complete so ScrollTrigger refreshes and scroll works.
  useEffect(() => {
    if (showPreloader) return;
    const id = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('preloader-complete'));
    }, 150);
    return () => clearTimeout(id);
  }, [showPreloader]);

  // Scroll to hash anchor once the preloader is out of the way.
  // Uses double-rAF so the layout is fully settled before we measure element positions.
  // Works for both returning visitors (showPreloader starts false) and
  // first-time visitors (fires again when preloader finishes).
  useEffect(() => {
    if (showPreloader) return; // Still playing — wait for handleComplete

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    let rafId: number;
    const scroll = () => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Double rAF: first frame commits layout, second frame measures
    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(scroll);
    });

    const onHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (!newHash) return;
      const target = document.getElementById(newHash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [showPreloader]);

  return (
    <>
      {/* Preloader: fixed z-9999 overlay — only mounted when truly needed.
          Not mounted for returning visitors → zero extra JS, zero GSAP work. */}
      {showPreloader && (
        <PreloaderAnimation
          orbitLabels={orbitLabels}
          backgroundColor={backgroundColor}
          textColor={textColor}
          counterDuration={counterDuration}
          onComplete={handleComplete}
        />
      )}

      {/* Content is always in the DOM and fully laid out.
          On first visit the preloader (fixed+z-9999) covers it until done. */}
      {children}
    </>
  );
}

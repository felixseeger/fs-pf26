'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePathname } from '@/i18n/navigation';

gsap.registerPlugin(ScrollTrigger);

/** Disable Lenis — it was blocking scroll on homepage. Use native scroll. */
const USE_LENIS = false;

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!USE_LENIS) {
      // Refresh ScrollTrigger when layout settles (preloader, dynamic content)
      const refreshId = setTimeout(() => ScrollTrigger.refresh(), 500);
      const onPreloaderComplete = () => ScrollTrigger.refresh();
      window.addEventListener('preloader-complete', onPreloaderComplete);
      return () => {
        window.removeEventListener('preloader-complete', onPreloaderComplete);
        clearTimeout(refreshId);
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const refreshId = setTimeout(() => ScrollTrigger.refresh(), 500);
    const onPreloaderComplete = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener('preloader-complete', onPreloaderComplete);

    return () => {
      window.removeEventListener('preloader-complete', onPreloaderComplete);
      gsap.ticker.remove(raf);
      lenis.destroy();
      clearTimeout(refreshId);
    };
  }, []);

  // Refresh ScrollTrigger when navigating to homepage (fixes scroll stuck after subpage nav)
  useEffect(() => {
    const isHome = pathname === '/' || !pathname || pathname === '';
    if (isHome) {
      const id = setTimeout(() => ScrollTrigger.refresh(), 300);
      return () => clearTimeout(id);
    }
  }, [pathname]);

  return <>{children}</>;
}

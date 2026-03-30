'use client';

import React, { useCallback, useRef, useState, createContext, useContext, useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import gsap from 'gsap';
import type { PageTransitionType } from '@/lib/page-transitions';
import { DEFAULT_PAGE_TRANSITION } from '@/lib/page-transitions';

interface PageTransitionContextValue {
  navigate: (href: string, transition?: PageTransitionType) => void;
  transitionType: PageTransitionType;
  defaultTransition: PageTransitionType;
  setDefaultTransition: (t: PageTransitionType) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function usePageTransition() {
  return useContext(PageTransitionContext);
}

const DURATION = 0.85;

type Status = 'idle' | 'entering' | 'entered' | 'exiting';

export function PageTransitionProvider({
  children,
  defaultTransition: defaultTransitionProp = DEFAULT_PAGE_TRANSITION,
}: {
  children: React.ReactNode;
  defaultTransition?: PageTransitionType;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const prevPathRef = useRef(pathname);
  const pendingExitRef = useRef(false);
  const pendingHrefRef = useRef<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [defaultTransition, setDefaultTransitionState] =
    useState<PageTransitionType>(defaultTransitionProp);

  const setDefaultTransition = useCallback((t: PageTransitionType) => {
    setDefaultTransitionState(t);
  }, []);

  // After mount: compute real path lengths and set initial hidden state
  useEffect(() => {
    const p1 = path1Ref.current;
    const p2 = path2Ref.current;
    if (!p1 || !p2) return;
    const len1 = p1.getTotalLength();
    const len2 = p2.getTotalLength();
    gsap.set(p1, {
      strokeDasharray: len1,
      strokeDashoffset: len1,
      attr: { 'stroke-width': 200 },
    });
    gsap.set(p2, {
      strokeDasharray: len2,
      strokeDashoffset: len2,
      attr: { 'stroke-width': 200 },
    });
  }, []);

  // next-intl's router.push only accepts typed pathnames; keep a stable ref for dynamic navigation
  const routerRef = useRef(router);
  routerRef.current = router;
  const doPush = useCallback((href: string) => {
    (routerRef.current as unknown as { push: (href: string) => void }).push(href);
  }, []);

  const navigate = useCallback(
    (href: string, _transition?: PageTransitionType) => {
      if (status !== 'idle') {
        doPush(href);
        return;
      }
      const p1 = path1Ref.current;
      const p2 = path2Ref.current;
      if (!p1 || !p2) {
        doPush(href);
        return;
      }

      pendingHrefRef.current = href;
      setStatus('entering');

      // Leave: strokes draw in and expand to cover the screen
      const tl = gsap.timeline({
        onComplete: () => {
          setStatus('entered');
          pendingExitRef.current = true;
          const url = pendingHrefRef.current;
          pendingHrefRef.current = null;
          if (url) doPush(url);
        },
      });
      tl.to(
        p1,
        { strokeDashoffset: 0, attr: { 'stroke-width': 700 }, duration: DURATION, ease: 'power1.inOut' },
        0,
      );
      tl.to(
        p2,
        { strokeDashoffset: 0, attr: { 'stroke-width': 700 }, duration: DURATION, ease: 'power1.inOut' },
        0,
      );
    },
    [status, doPush],
  );

  // After route changes: run exit (reveal) animation
  useEffect(() => {
    if (status !== 'entered') return;
    const p1 = path1Ref.current;
    const p2 = path2Ref.current;
    if (!p1 || !p2) return;
    const pathChanged = pathname !== prevPathRef.current;
    if (!pathChanged && !pendingExitRef.current) return;
    if (pathChanged) prevPathRef.current = pathname;
    pendingExitRef.current = false;
    setStatus('exiting');

    const len1 = p1.getTotalLength();
    const len2 = p2.getTotalLength();

    // Enter: strokes sweep out, revealing the new page
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(p1, { strokeDashoffset: len1, attr: { 'stroke-width': 200 } });
        gsap.set(p2, { strokeDashoffset: len2, attr: { 'stroke-width': 200 } });
        setStatus('idle');
      },
    });
    tl.to(
      p1,
      { strokeDashoffset: -len1, attr: { 'stroke-width': 200 }, duration: DURATION, ease: 'power1.inOut' },
      0,
    );
    tl.to(
      p2,
      { strokeDashoffset: -len2, attr: { 'stroke-width': 200 }, duration: DURATION, ease: 'power1.inOut' },
      0,
    );
  }, [pathname, status]);

  const value: PageTransitionContextValue = {
    navigate,
    transitionType: defaultTransition,
    defaultTransition,
    setDefaultTransition,
  };

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      {/* SVG Stroke Transition Overlay */}
      <div
        aria-hidden
        className="page-transition-svg"
      >
        <svg
          viewBox="0 0 2453 2535"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            ref={path1Ref}
            d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
            stroke="var(--transition-stroke-1)"
            strokeWidth="200"
            strokeLinecap="round"
            style={{ strokeDasharray: 99999, strokeDashoffset: 99999 }}
          />
          <path
            ref={path2Ref}
            d="M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012"
            stroke="var(--transition-stroke-2)"
            strokeWidth="200"
            strokeLinecap="round"
            style={{ strokeDasharray: 99999, strokeDashoffset: 99999 }}
          />
        </svg>
      </div>
    </PageTransitionContext.Provider>
  );
}

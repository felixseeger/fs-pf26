'use client';

import React, { useCallback, useRef, useState, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
  type PageTransitionType,
  PAGE_TRANSITION_PRESETS,
  DEFAULT_PAGE_TRANSITION,
} from '@/lib/page-transitions';

type Status = 'idle' | 'entering' | 'entered' | 'exiting';

interface PageTransitionContextValue {
  /** Navigate to href with the given (or default) transition */
  navigate: (href: string, transition?: PageTransitionType) => void;
  /** Current transition type for the overlay (e.g. for curtain markup) */
  transitionType: PageTransitionType;
  /** Default transition used when not specified */
  defaultTransition: PageTransitionType;
  setDefaultTransition: (t: PageTransitionType) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  return ctx;
}

const DURATION = 0.5;

export function PageTransitionProvider({
  children,
  defaultTransition: defaultTransitionProp = DEFAULT_PAGE_TRANSITION,
}: {
  children: React.ReactNode;
  defaultTransition?: PageTransitionType;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(pathname);
  const pendingExitRef = useRef(false);
  const [status, setStatus] = useState<Status>('idle');
  const [defaultTransition, setDefaultTransitionState] = useState<PageTransitionType>(defaultTransitionProp);
  const [transitionType, setTransitionType] = useState<PageTransitionType>(defaultTransitionProp);
  const pendingHrefRef = useRef<string | null>(null);

  const setDefaultTransition = useCallback((t: PageTransitionType) => {
    setDefaultTransitionState(t);
  }, []);

  const navigate = useCallback(
    (href: string, transition?: PageTransitionType) => {
      if (status !== 'idle' || !overlayRef.current) {
        router.push(href);
        return;
      }
      const type = transition ?? defaultTransition;
      setTransitionType(type);
      pendingHrefRef.current = href;
      setStatus('entering');
      const preset = PAGE_TRANSITION_PRESETS[type];
      preset.setInitial?.(overlayRef.current);
      const tween = preset.enter(overlayRef.current, DURATION);
      tween.eventCallback('onComplete', () => {
        setStatus('entered');
        pendingExitRef.current = true;
        const url = pendingHrefRef.current;
        pendingHrefRef.current = null;
        if (url) router.push(url);
      });
    },
    [status, defaultTransition, router]
  );

  // When pathname changes (or same-page hash nav) after we navigated, run exit animation
  React.useEffect(() => {
    if (status !== 'entered' || !overlayRef.current) return;
    const pathChanged = pathname !== prevPathRef.current;
    if (!pathChanged && !pendingExitRef.current) return;
    if (pathChanged) prevPathRef.current = pathname;
    pendingExitRef.current = false;
    setStatus('exiting');
    const preset = PAGE_TRANSITION_PRESETS[transitionType];
    const tween = preset.exit(overlayRef.current, DURATION);
    tween.eventCallback('onComplete', () => {
      setStatus('idle');
      const el = overlayRef.current;
      if (el) preset.setInitial?.(el);
    });
  }, [pathname, status, transitionType]);

  const value: PageTransitionContextValue = {
    navigate,
    transitionType,
    defaultTransition,
    setDefaultTransition,
  };

  const isCurtain = transitionType === 'curtain';

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden
        data-transition={transitionType}
        className="fixed inset-0 z-[9998] bg-background pointer-events-none page-transition-overlay"
        style={{ visibility: status === 'idle' ? 'hidden' : 'visible' }}
      >
        {isCurtain ? (
          <>
            <div data-curtain="left" className="absolute inset-y-0 left-0 w-1/2 bg-background" />
            <div data-curtain="right" className="absolute inset-y-0 right-0 w-1/2 bg-background" />
          </>
        ) : null}
      </div>
    </PageTransitionContext.Provider>
  );
}

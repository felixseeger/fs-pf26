/**
 * Creative GSAP page transition presets.
 * Each preset has enter (cover viewport) and exit (reveal new page) animations.
 */

import gsap from 'gsap';

export type PageTransitionType =
  | 'fade'
  | 'slideRight'
  | 'slideLeft'
  | 'slideUp'
  | 'slideDown'
  | 'wipeRight'
  | 'wipeLeft'
  | 'scaleIn'
  | 'blur'
  | 'curtain'
  | 'diamond';

const DEFAULT_DURATION = 0.5;
const DEFAULT_EASE = 'power3.inOut';

export interface PageTransitionPreset {
  enter: (el: HTMLElement, duration?: number) => gsap.core.Tween | gsap.core.Timeline;
  exit: (el: HTMLElement, duration?: number) => gsap.core.Tween | gsap.core.Timeline;
  /** Initial state before enter (so exit can reverse to it) */
  setInitial?: (el: HTMLElement) => void;
}

export const PAGE_TRANSITION_PRESETS: Record<PageTransitionType, PageTransitionPreset> = {
  fade: {
    setInitial: (el) => gsap.set(el, { opacity: 0, pointerEvents: 'none' }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { opacity: 1, duration: d, ease: DEFAULT_EASE, pointerEvents: 'auto' }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { opacity: 0, duration: d, ease: DEFAULT_EASE, pointerEvents: 'none' }),
  },

  slideRight: {
    setInitial: (el) => gsap.set(el, { xPercent: -100, pointerEvents: 'none' }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { xPercent: 0, duration: d, ease: DEFAULT_EASE, pointerEvents: 'auto' }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { xPercent: 100, duration: d, ease: DEFAULT_EASE, pointerEvents: 'none' }),
  },

  slideLeft: {
    setInitial: (el) => gsap.set(el, { xPercent: 100, pointerEvents: 'none' }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { xPercent: 0, duration: d, ease: DEFAULT_EASE, pointerEvents: 'auto' }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { xPercent: -100, duration: d, ease: DEFAULT_EASE, pointerEvents: 'none' }),
  },

  slideUp: {
    setInitial: (el) => gsap.set(el, { yPercent: 100, pointerEvents: 'none' }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { yPercent: 0, duration: d, ease: DEFAULT_EASE, pointerEvents: 'auto' }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { yPercent: -100, duration: d, ease: DEFAULT_EASE, pointerEvents: 'none' }),
  },

  slideDown: {
    setInitial: (el) => gsap.set(el, { yPercent: -100, pointerEvents: 'none' }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { yPercent: 0, duration: d, ease: DEFAULT_EASE, pointerEvents: 'auto' }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, { yPercent: 100, duration: d, ease: DEFAULT_EASE, pointerEvents: 'none' }),
  },

  wipeRight: {
    setInitial: (el) => gsap.set(el, { clipPath: 'inset(0 100% 0 0)', pointerEvents: 'none' }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        clipPath: 'inset(0 0% 0 0)',
        duration: d,
        ease: DEFAULT_EASE,
        pointerEvents: 'auto',
      }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        clipPath: 'inset(0 0 0 100%)',
        duration: d,
        ease: DEFAULT_EASE,
        pointerEvents: 'none',
      }),
  },

  wipeLeft: {
    setInitial: (el) => gsap.set(el, { clipPath: 'inset(0 0 0 100%)', pointerEvents: 'none' }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        clipPath: 'inset(0 0 0 0)',
        duration: d,
        ease: DEFAULT_EASE,
        pointerEvents: 'auto',
      }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        clipPath: 'inset(0 100% 0 0)',
        duration: d,
        ease: DEFAULT_EASE,
        pointerEvents: 'none',
      }),
  },

  scaleIn: {
    setInitial: (el) =>
      gsap.set(el, { scale: 0, transformOrigin: 'center center', pointerEvents: 'none' }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        scale: 1,
        duration: d,
        ease: 'back.out(1.2)',
        pointerEvents: 'auto',
      }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        scale: 0,
        transformOrigin: 'center center',
        duration: d,
        ease: 'back.in(1.2)',
        pointerEvents: 'none',
      }),
  },

  blur: {
    setInitial: (el) =>
      gsap.set(el, {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)',
        pointerEvents: 'none',
      }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        opacity: 1,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        duration: d,
        ease: DEFAULT_EASE,
        pointerEvents: 'auto',
      }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)',
        duration: d,
        ease: DEFAULT_EASE,
        pointerEvents: 'none',
      }),
  },

  curtain: {
    setInitial: (el) => {
      gsap.set(el, { pointerEvents: 'none' });
      const left = el.querySelector('[data-curtain="left"]') as HTMLElement;
      const right = el.querySelector('[data-curtain="right"]') as HTMLElement;
      if (left) gsap.set(left, { xPercent: -100 });
      if (right) gsap.set(right, { xPercent: 100 });
    },
    enter: (el, d = DEFAULT_DURATION) => {
      const left = el.querySelector('[data-curtain="left"]') as HTMLElement;
      const right = el.querySelector('[data-curtain="right"]') as HTMLElement;
      gsap.set(el, { pointerEvents: 'auto' });
      const tl = gsap.timeline();
      if (left) tl.to(left, { xPercent: 0, duration: d * 0.5, ease: DEFAULT_EASE }, 0);
      if (right) tl.to(right, { xPercent: 0, duration: d * 0.5, ease: DEFAULT_EASE }, 0);
      return tl;
    },
    exit: (el, d = DEFAULT_DURATION) => {
      const left = el.querySelector('[data-curtain="left"]') as HTMLElement;
      const right = el.querySelector('[data-curtain="right"]') as HTMLElement;
      const tl = gsap.timeline();
      if (left) tl.to(left, { xPercent: -100, duration: d * 0.5, ease: DEFAULT_EASE }, 0);
      if (right) tl.to(right, { xPercent: 100, duration: d * 0.5, ease: DEFAULT_EASE }, 0);
      tl.set(el, { pointerEvents: 'none' }, 0);
      return tl;
    },
  },

  diamond: {
    setInitial: (el) =>
      gsap.set(el, {
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        pointerEvents: 'none',
      }),
    enter: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: d,
        ease: DEFAULT_EASE,
        pointerEvents: 'auto',
      }),
    exit: (el, d = DEFAULT_DURATION) =>
      gsap.to(el, {
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        duration: d,
        ease: DEFAULT_EASE,
        pointerEvents: 'none',
      }),
  },
};

export const DEFAULT_PAGE_TRANSITION: PageTransitionType = 'slideRight';

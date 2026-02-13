'use client';

import { useEffect, useRef } from 'react';
import {
  getRandomLoadPattern,
  STRUDEL_LOAD_PLAYLIST,
  STRUDEL_LOAD_DURATION_MS,
  STRUDEL_MINIMAL_PATTERN,
} from '@/lib/strudel-load-pattern';

const SESSION_KEY = 'page-sound-played';
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export default function StrudelLoadSound() {
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preloadCompleteRef = useRef(false);
  const initedRef = useRef(false);
  const pendingClickRef = useRef(false);
  const pendingPlayNowRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;
    let removePlayListener: (() => void) | null = null;
    let removeClickListener: (() => void) | null = null;

    const tryPlay = async (
      evaluate: (code: string) => Promise<unknown>,
      hush: () => void,
      getAudioContext: () => AudioContext
    ) => {
      if (sessionStorage.getItem(SESSION_KEY)) return false;
      try {
        const ctx = getAudioContext();
        if (ctx?.state === 'suspended') await ctx.resume();
      } catch (e) {
        if (isDev) console.error('[StrudelLoadSound] AudioContext resume failed', e);
        return false;
      }

      const patterns = [
        getRandomLoadPattern(),
        STRUDEL_LOAD_PLAYLIST[0]?.code,
        STRUDEL_MINIMAL_PATTERN,
      ].filter(Boolean);
      for (const pattern of patterns) {
        try {
          await evaluate(pattern);
          sessionStorage.setItem(SESSION_KEY, 'true');
          if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
          stopTimeoutRef.current = setTimeout(() => {
            hush();
            stopTimeoutRef.current = null;
          }, STRUDEL_LOAD_DURATION_MS);
          return true;
        } catch (e) {
          if (isDev) console.warn('[StrudelLoadSound] Pattern failed, trying next', e);
          continue;
        }
      }
      if (isDev) console.error('[StrudelLoadSound] All patterns failed');
      return false;
    };

    (async () => {
      try {
        const { initStrudel, evaluate, hush, samples, getAudioContext } = await import('@strudel/web');
        if (!mounted) return;

        // Mark preload complete when event fires
        const handlePreloadComplete = () => {
          preloadCompleteRef.current = true;
        };
        window.addEventListener('pageloadsound:play', handlePreloadComplete);

        // Play-now: user explicitly requested (e.g. "Play sound" button) – run in same gesture
        const handlePlayNow = async () => {
          if (sessionStorage.getItem(SESSION_KEY)) return;
          if (!initedRef.current) {
            pendingPlayNowRef.current = true;
            return;
          }
          const played = await tryPlay(evaluate, hush, getAudioContext);
          if (played) removeClickListener?.();
        };
        window.addEventListener('pageloadsound:play-now', handlePlayNow);

        removePlayListener = () => {
          window.removeEventListener('pageloadsound:play', handlePreloadComplete);
          window.removeEventListener('pageloadsound:play-now', handlePlayNow);
        };

        // Attach click listener immediately so we don't miss the first click while init runs
        const handleFirstClick = async () => {
          if (!preloadCompleteRef.current || sessionStorage.getItem(SESSION_KEY)) return;
          if (!initedRef.current) {
            pendingClickRef.current = true;
            return;
          }
          const played = await tryPlay(evaluate, hush, getAudioContext);
          if (played) removeClickListener?.();
        };
        window.addEventListener('click', handleFirstClick, { capture: true });
        removeClickListener = () => window.removeEventListener('click', handleFirstClick, { capture: true });

        const prebakeWithTimeout = () =>
          Promise.race([
            samples('github:tidalcycles/dirt-samples'),
            new Promise<void>((resolve) => setTimeout(resolve, 8000)),
          ]);
        await initStrudel({ prebake: prebakeWithTimeout });
        if (!mounted) return;
        initedRef.current = true;

        if (pendingClickRef.current && preloadCompleteRef.current && !sessionStorage.getItem(SESSION_KEY)) {
          pendingClickRef.current = false;
          const played = await tryPlay(evaluate, hush, getAudioContext);
          if (played) removeClickListener?.();
        }
        if (pendingPlayNowRef.current && !sessionStorage.getItem(SESSION_KEY)) {
          pendingPlayNowRef.current = false;
          await tryPlay(evaluate, hush, getAudioContext);
        }
      } catch (e) {
        if (isDev) console.error('[StrudelLoadSound] Init failed', e);
      }
    })();

    return () => {
      mounted = false;
      removePlayListener?.();
      removeClickListener?.();
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, []);

  return null;
}

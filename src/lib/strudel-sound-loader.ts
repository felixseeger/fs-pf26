/**
 * Strudel sound loader: preload (import) Strudel + samples once, then play from playlist.
 * Call ensureStrudelReady() to load sounds; call playLoadPattern() to play (after a user gesture).
 */

import {
  getRandomLoadPattern,
  STRUDEL_LOAD_PLAYLIST,
  STRUDEL_MINIMAL_PATTERN,
  STRUDEL_LOAD_DURATION_MS,
} from './strudel-load-pattern';

let initPromise: Promise<{
  evaluate: (code: string, autoplay?: boolean) => Promise<unknown>;
  hush: () => void;
  getAudioContext: () => AudioContext;
}> | null = null;
let hushTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Unlock the AudioContext with a short sound in the same user gesture.
 * Call this synchronously at the start of a click handler.
 */
export function unlockAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Load (import) Strudel and samples. Call once before play, or let play call it.
 * Resolves when Strudel is ready to evaluate patterns.
 */
export async function ensureStrudelReady(): Promise<{
  evaluate: (code: string, autoplay?: boolean) => Promise<unknown>;
  hush: () => void;
  getAudioContext: () => AudioContext;
}> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const mod = await import('@strudel/web');
    const { initStrudel, evaluate, hush, samples, getAudioContext } = mod;
    await initStrudel({
      prebake: () =>
        Promise.race([
          samples('github:tidalcycles/dirt-samples'),
          new Promise<void>((r) => setTimeout(r, 10000)),
        ]),
    });
    return { evaluate, hush, getAudioContext };
  })();
  return initPromise;
}

/**
 * Play one pattern from the playlist (random or fallbacks), then hush after duration.
 * Call after ensureStrudelReady() and only in a user gesture (e.g. click).
 */
export async function playLoadPattern(): Promise<boolean> {
  try {
    const { evaluate, hush, getAudioContext } = await ensureStrudelReady();
    const ctx = getAudioContext();
    if (ctx?.state === 'suspended') await ctx.resume();
    const patterns = [
      STRUDEL_MINIMAL_PATTERN,
      getRandomLoadPattern(),
      STRUDEL_LOAD_PLAYLIST[0]?.code,
    ].filter(Boolean);
    for (const code of patterns) {
      try {
        await evaluate(code);
        if (hushTimeout) clearTimeout(hushTimeout);
        hushTimeout = setTimeout(() => {
          hush();
          hushTimeout = null;
        }, STRUDEL_LOAD_DURATION_MS);
        return true;
      } catch {
        continue;
      }
    }
    return false;
  } catch {
    return false;
  }
}

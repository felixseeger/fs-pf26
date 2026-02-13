'use client';

import { useEffect, useState } from 'react';

// Global sound trigger event
export const triggerPageLoadSound = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pageloadsound:play'));
  }
};

export default function PageLoadSound() {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const sessionKey = 'page-sound-played';
    
    // Check if already played this session
    if (sessionStorage.getItem(sessionKey)) {
      setHasPlayed(true);
      return;
    }

    const playStartupSound = () => {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const now = ctx.currentTime;
        const duration = 1.4;

        // Master gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.35, now + 0.08);
        masterGain.gain.setValueAtTime(0.35, now + 0.5);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        masterGain.connect(ctx.destination);

        // Low-pass filter for warm pad / startup sweep
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2800, now + 0.5);
        filter.frequency.setValueAtTime(2800, now + duration);
        filter.Q.setValueAtTime(0.5, now);
        filter.connect(masterGain);

        // Base pad: soft fundamental (like Windows/PlayStation startup)
        const pad1 = ctx.createOscillator();
        pad1.type = 'sine';
        pad1.frequency.setValueAtTime(220, now);
        pad1.frequency.exponentialRampToValueAtTime(330, now + 0.4);
        pad1.frequency.setValueAtTime(330, now + duration);
        pad1.connect(filter);

        // Second layer: fifth for body
        const pad2 = ctx.createOscillator();
        pad2.type = 'sine';
        pad2.frequency.setValueAtTime(330, now);
        pad2.frequency.exponentialRampToValueAtTime(495, now + 0.4);
        pad2.frequency.setValueAtTime(495, now + duration);
        pad2.connect(filter);

        // Gentle high layer for "epic" shimmer
        const pad3 = ctx.createOscillator();
        pad3.type = 'sine';
        pad3.frequency.setValueAtTime(440, now);
        pad3.frequency.exponentialRampToValueAtTime(660, now + 0.35);
        pad3.frequency.setValueAtTime(660, now + duration);
        pad3.connect(filter);

        [pad1, pad2, pad3].forEach((osc) => {
          osc.start(now);
          osc.stop(now + duration);
        });

        setHasPlayed(true);
        sessionStorage.setItem(sessionKey, 'true');
      } catch {
        // Silent fail if audio is not supported
      }
    };

    // Listen for the preloader complete event
    const handleSoundTrigger = () => {
      if (!hasPlayed) {
        playStartupSound();
      }
    };

    window.addEventListener('pageloadsound:play', handleSoundTrigger);

    // Also play after a timeout as fallback (for pages without preloader)
    const fallbackTimer = setTimeout(() => {
      if (!hasPlayed && !sessionStorage.getItem(sessionKey)) {
        playStartupSound();
      }
    }, 3000);

    return () => {
      window.removeEventListener('pageloadsound:play', handleSoundTrigger);
      clearTimeout(fallbackTimer);
    };
  }, [hasPlayed]);

  return null;
}

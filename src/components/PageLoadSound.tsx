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

    const playChime = () => {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Create a pleasant chime sound
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);

        setHasPlayed(true);
        sessionStorage.setItem(sessionKey, 'true');
      } catch (e) {
        // Silent fail if audio is not supported
      }
    };

    // Listen for the preloader complete event
    const handleSoundTrigger = () => {
      if (!hasPlayed) {
        playChime();
      }
    };

    window.addEventListener('pageloadsound:play', handleSoundTrigger);

    // Also play after a timeout as fallback (for pages without preloader)
    const fallbackTimer = setTimeout(() => {
      if (!hasPlayed && !sessionStorage.getItem(sessionKey)) {
        playChime();
      }
    }, 3000);

    return () => {
      window.removeEventListener('pageloadsound:play', handleSoundTrigger);
      clearTimeout(fallbackTimer);
    };
  }, [hasPlayed]);

  return null;
}

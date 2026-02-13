'use client';

// Dispatches the event that triggers the Strudel load sound when home preload finishes.
// The actual sound is played by StrudelLoadSound (Strudel pattern, once per session).

export const triggerPageLoadSound = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pageloadsound:play'));
  }
};

/** Call from a user click to play the load sound immediately (unlocks audio). */
export const triggerPageLoadSoundPlayNow = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pageloadsound:play-now'));
  }
};

export default function PageLoadSound() {
  return null;
}

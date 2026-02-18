/**
 * Menu SFX from /public/sfx/ (menu-open.mp3, menu-close.mp3, menu-select.mp3).
 * Play on user gesture to satisfy autoplay policy.
 */

const SFX = {
  open: '/sfx/menu-open.mp3',
  close: '/sfx/menu-close.mp3',
  select: '/sfx/menu-select.mp3',
} as const;

function play(src: string, volume = 0.6): void {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio(src);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

export function playMenuOpen(): void {
  play(SFX.open);
}

export function playMenuClose(): void {
  play(SFX.close);
}

export function playMenuSelect(): void {
  play(SFX.select);
}

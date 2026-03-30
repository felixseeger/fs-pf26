'use client';

import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { useCookieConsent } from '@/components/providers/CookieConsentProvider';

interface CookieSettingsButtonProps {
  variant?: 'floating' | 'inline';
  className?: string;
}

export default function CookieSettingsButton({ variant = 'floating', className = '' }: CookieSettingsButtonProps) {
  const { openSettings, hasConsented } = useCookieConsent();
  const [hideAtPageBottom, setHideAtPageBottom] = useState(false);

  useEffect(() => {
    if (variant !== 'floating') return;

    const updateBottomState = () => {
      const reachedPageBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 8;
      setHideAtPageBottom(reachedPageBottom);
    };

    updateBottomState();
    window.addEventListener('scroll', updateBottomState, { passive: true });
    window.addEventListener('resize', updateBottomState);
    return () => {
      window.removeEventListener('scroll', updateBottomState);
      window.removeEventListener('resize', updateBottomState);
    };
  }, [variant]);

  // Only show after user has consented (so they can change their settings)
  if (!hasConsented) return null;
  if (variant === 'floating' && hideAtPageBottom) return null;

  if (variant === 'inline') {
    return (
      <button
        onClick={openSettings}
        className={`text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 ${className}`}
        aria-label="Open cookie settings"
      >
        <Cookie size={14} />
        Cookie Settings
      </button>
    );
  }

  return (
    <button
      onClick={openSettings}
      className={`fixed bottom-6 left-6 lg:bottom-10 lg:left-10 z-9998 w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-background/90 backdrop-blur-md border border-border rounded-full shadow-lg hover:bg-muted transition-all hover:scale-110 ${className}`}
      aria-label="Open cookie settings"
      title="Cookie Settings"
    >
      <Cookie className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
    </button>
  );
}

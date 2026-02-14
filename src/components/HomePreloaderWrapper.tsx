'use client';

import { useEffect, useState } from 'react';
import PreloaderAnimation from '@/components/ui/PreloaderAnimation';

const SESSION_STORAGE_KEY = 'homePreloaderShown';

export interface HomePreloaderWrapperProps {
  children: React.ReactNode;
  orbitLabels?: string[];
  backgroundColor?: string;
  textColor?: string;
  counterDuration?: number;
  showOncePerSession?: boolean;
}

export default function HomePreloaderWrapper({
  children,
  orbitLabels,
  backgroundColor,
  textColor,
  counterDuration,
  showOncePerSession = true,
}: HomePreloaderWrapperProps) {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for force show param in URL (?preload=true)
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get('preload') === 'true';

    if (!forceShow && showOncePerSession && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      setShowPreloader(false);
    }
  }, [showOncePerSession]);

  const handleComplete = () => {
    if (showOncePerSession && typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
    }
    setShowPreloader(false);
  };

  // When preloader is done and we have a hash (e.g. /#about, /#services), scroll to that section
  useEffect(() => {
    if (showPreloader || typeof window === 'undefined') return;
    const scrollToHash = () => {
      const hash = window.location.hash?.replace(/^#/, '');
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    // Initial scroll after layout has painted
    const t = setTimeout(scrollToHash, 400);
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      clearTimeout(t);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, [showPreloader]);

  return (
    <>
      <div style={{ display: showPreloader ? 'block' : 'none' }} aria-hidden={!showPreloader}>
        <PreloaderAnimation
          orbitLabels={orbitLabels}
          backgroundColor={backgroundColor}
          textColor={textColor}
          counterDuration={counterDuration}
          onComplete={handleComplete}
        />
      </div>
      <div style={{ display: showPreloader ? 'none' : 'block' }}>{children}</div>
    </>
  );
}

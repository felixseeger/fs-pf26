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
    if (showOncePerSession && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      setShowPreloader(false);
    }
  }, [showOncePerSession]);

  const handleComplete = () => {
    if (showOncePerSession && typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
    }
    setShowPreloader(false);
  };

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

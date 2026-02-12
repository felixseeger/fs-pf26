'use client';

import { useEffect, useState } from 'react';
import PreloaderAnimation from '@/components/ui/PreloaderAnimation';
import { triggerPageLoadSound } from '@/components/PageLoadSound';

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
    // Trigger the page load sound when preloader finishes
    triggerPageLoadSound();
  };

  // Manual trigger button for testing
  const handleReplay = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem('page-sound-played');
    window.location.reload();
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
      <div style={{ display: showPreloader ? 'none' : 'block' }}>
        {children}
        {/* Debug replay button - shows in corner */}
        <button
          onClick={handleReplay}
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 9999,
            padding: '8px 12px',
            fontSize: '12px',
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: 0.7,
          }}
          title="Replay preloader and sound"
        >
          ↻ Replay Animation
        </button>
      </div>
    </>
  );
}

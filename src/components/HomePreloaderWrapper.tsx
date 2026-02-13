'use client';

import { useEffect, useState } from 'react';
import PreloaderAnimation from '@/components/ui/PreloaderAnimation';
import { triggerPageLoadSound } from '@/components/PageLoadSound';
import { unlockAudioContext, ensureStrudelReady, playLoadPattern } from '@/lib/strudel-sound-loader';

const SESSION_STORAGE_KEY = 'homePreloaderShown';
const SOUND_SESSION_KEY = 'page-sound-played';

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

  // Preload Strudel + samples in background when home content is visible (import sounds early)
  useEffect(() => {
    if (!showPreloader) void ensureStrudelReady().then(() => setSoundsReady(true));
  }, [showPreloader]);

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
    sessionStorage.removeItem(SOUND_SESSION_KEY);
    window.location.reload();
  };

  // 1) Unlock audio with a short beep in this click (same user gesture)
  // 2) Load Strudel + samples (import sounds), then play a pattern from the playlist
  const handlePlaySound = async () => {
    if (typeof window === 'undefined' || sessionStorage.getItem(SOUND_SESSION_KEY)) return;
    unlockAudioContext();
    try {
      const played = await playLoadPattern();
      if (played) sessionStorage.setItem(SOUND_SESSION_KEY, 'true');
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error('[Play sound]', e);
    }
  };

  // Preload (import) Strudel + samples so "Play sound" is faster and sounds are ready
  const [soundsReady, setSoundsReady] = useState(false);
  const handleLoadSounds = async () => {
    unlockAudioContext();
    try {
      await ensureStrudelReady();
      setSoundsReady(true);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error('[Load sounds]', e);
    }
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
        {/* Debug / sound controls - show in corner */}
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 9999,
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            onClick={() => void handleLoadSounds()}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              background: soundsReady ? '#0f5132' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: 0.9,
            }}
            title="Load Strudel and samples first (then click Play sound)"
          >
            {soundsReady ? '✓ Sounds loaded' : '↑ Load sounds'}
          </button>
          <button
            onClick={() => void handlePlaySound()}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              background: '#1a5f2a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: 0.9,
            }}
            title="Play intro sound once (random from playlist). Click Load sounds first if needed."
          >
            ▶ Play sound
          </button>
          <button
            onClick={handleReplay}
            style={{
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
      </div>
    </>
  );
}

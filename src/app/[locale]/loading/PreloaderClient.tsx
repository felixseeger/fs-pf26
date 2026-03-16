'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import PreloaderAnimation from '@/components/ui/PreloaderAnimation';

gsap.registerPlugin(CustomEase);
CustomEase.create('hop', '0.9, 0, 0.1, 1');

const DEFAULT_LABELS = [
  'Developer',
  'Frontend',
  'Creative',
  'Designer',
  'Portfolio',
  'Digital',
  'Modern',
  'Design',
];

export interface PreloaderClientProps {
  orbitLabels?: string[];
  backgroundColor?: string;
  textColor?: string;
  counterDuration?: number;
  redirectUrl?: string;
  heroHeading?: string;
  heroImageUrl?: string | null;
}

export default function PreloaderClient({
  orbitLabels = DEFAULT_LABELS,
  backgroundColor = '#d1d9b8',
  textColor = '#0f0f0f',
  counterDuration = 4,
  redirectUrl = '',
  heroHeading = 'Your content begins here',
  heroImageUrl = null,
}: PreloaderClientProps) {
  const router = useRouter();
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLParagraphElement>(null);
  const heroJustShown = useRef(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);

  const handleLoaderComplete = () => {
    setLoaderVisible(false);
    setHeroVisible(true);
    if (redirectUrl) {
      const url = redirectUrl.trim();
      // In dev, avoid redirecting to another origin (e.g. production URL) so the app stays on localhost
      if (typeof window !== 'undefined' && url.startsWith('http')) {
        try {
          const target = new URL(url);
          if (target.origin !== window.location.origin) {
            router.push(target.pathname || '/');
            return;
          }
        } catch {
          // fall through to router.push(url) if URL parsing fails
        }
      }
      router.push(url);
    }
  };

  useLayoutEffect(() => {
    if (!heroVisible || redirectUrl) return;
    heroJustShown.current = true;
    const heroBg = heroBgRef.current;
    const heroCopy = heroCopyRef.current;
    if (heroBg) gsap.fromTo(heroBg, { scale: 1.25 }, { scale: 1, duration: 2, ease: 'hop' });
    if (heroCopy) gsap.fromTo(heroCopy, { y: '100%' }, { y: 0, duration: 2, delay: -0.25, ease: 'hop' });
  }, [heroVisible, redirectUrl]);

  return (
    <>
      {loaderVisible && (
        <PreloaderAnimation
          orbitLabels={orbitLabels}
          backgroundColor={backgroundColor}
          textColor={textColor}
          counterDuration={counterDuration}
          onComplete={handleLoaderComplete}
        />
      )}

      {heroVisible && !redirectUrl && (
        <section className="relative w-full h-svh flex justify-center items-center overflow-hidden bg-zinc-900">
          {heroImageUrl && (
            <div
              ref={heroBgRef}
              className="absolute inset-0 scale-125 will-change-transform"
            >
              <img src={heroImageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="hero-copy relative z-10">
            <p
              ref={heroCopyRef}
              className="text-white uppercase font-medium text-center text-lg md:text-xl"
            >
              {heroHeading}
            </p>
          </div>
        </section>
      )}

      {heroVisible && redirectUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-900 text-white">
          <p>Redirecting…</p>
        </div>
      )}
    </>
  );
}

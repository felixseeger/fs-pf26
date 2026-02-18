'use client';

import { useState, useRef, useCallback } from 'react';
import TiltCard from '@/components/ui/TiltCard';

interface FAQItem {
  question?: string;
  answer?: string;
}

interface CourseFAQProps {
  items: FAQItem[];
}

function useSound(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.volume = 0.35;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay blocked — ignore silently
      });
    } catch {
      // SSR / no Audio API — ignore
    }
  }, [src]);

  return play;
}

export default function CourseFAQ({ items }: CourseFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const playOpen = useSound('/sfx/menu-open.mp3');
  const playClose = useSound('/sfx/menu-close.mp3');

  function toggle(i: number) {
    if (openIndex === i) {
      setOpenIndex(null);
      playClose();
    } else {
      setOpenIndex(i);
      playOpen();
    }
  }

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">FAQ</h2>
      <dl className="space-y-3">
        {items.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <TiltCard
              key={i}
              className={[
                'rounded-xl border transition-all duration-300 dark:backdrop-blur-md',
                isOpen
                  ? 'bg-white dark:bg-white/10 border-blue-400/50 dark:border-blue-500/40 shadow-[0_8px_32px_0_rgba(96,165,250,0.18)]'
                  : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/8 hover:border-blue-200 dark:hover:border-white/20',
              ].join(' ')}
            >
              <dt>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
                >
                  <span className="font-semibold text-zinc-900 dark:text-white text-base leading-snug">
                    {faq.question}
                  </span>
                  {/* Animated icon */}
                  <span
                    aria-hidden
                    className={[
                      'shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300',
                      isOpen
                        ? 'bg-blue-500/30 text-blue-300 rotate-45'
                        : 'bg-[#e9ff13]/15 text-[#e9ff13] rotate-0',
                    ].join(' ')}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="7" y1="1" x2="7" y2="13" />
                      <line x1="1" y1="7" x2="13" y2="7" />
                    </svg>
                  </span>
                </button>
              </dt>

              {/* Animated answer panel */}
              <dd
                className={[
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
                ].join(' ')}
              >
                <div
                  className="px-6 pb-5 text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: faq.answer ?? '' }}
                />
              </dd>
            </TiltCard>
          );
        })}
      </dl>
    </section>
  );
}

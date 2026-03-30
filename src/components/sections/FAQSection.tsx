'use client';

import { useRef, useState, useCallback } from 'react';
import { ArrowUpRight } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import DotMatrixStatic from '@/components/DotMatrix/DotMatrixStatic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqTitle: string;
  faqItems: FAQItem[];
  contactEmail?: string;
  faqEmailCardTitle?: string;
  faqEmailCardDescription?: string;
}

function useSound(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  return useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.volume = 0.35;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, [src]);
}

export default function FAQSection({
  faqTitle,
  faqItems,
  contactEmail,
  faqEmailCardTitle = 'Send a Message',
  faqEmailCardDescription = 'Good website tells a story that will make users fully immerse themselves operating',
}: FAQSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const faqListRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const playOpen = useSound('/sfx/menu-open.mp3');
  const playClose = useSound('/sfx/menu-close.mp3');

  function toggleFAQ(i: number) {
    if (openIndex === i) {
      setOpenIndex(null);
      playClose();
    } else {
      setOpenIndex(i);
      playOpen();
    }
  }

  useGSAP(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const faqList = faqListRef.current;
    if (!section) return;

    // 1. Headline mask-in (clip-path left to right)
    if (headline) {
      gsap.set(headline, { clipPath: 'inset(0 100% 0 0)' });
      gsap.to(headline, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1.2,
        },
      });
    }

    // 2. FAQ items stagger reveal (each card slides up + fades in)
    if (faqList) {
      const cards = faqList.querySelectorAll<HTMLElement>('[data-faq-card]');
      gsap.set(cards, { opacity: 0, y: 32 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: faqList,
          start: 'top 85%',
          end: 'top 40%',
          scrub: 1,
        },
      });
    }

    // 3. Contact & Send Message cards - move in from Y with offset
    const contactCards = section.querySelectorAll<HTMLElement>('[data-contact-card]');
    contactCards.forEach((card, i) => {
      const yOffset = 48 + i * 24; // First card 48px, second 72px offset
      gsap.set(card, { opacity: 0, y: yOffset });
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          end: 'top 55%',
          scrub: 1.2,
        },
      });
    });

  }, [faqItems.length]);

  return (
    <section ref={sectionRef} id="faq" className="mb-24 max-w-6xl mx-auto px-4 pt-[50px]">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="w-12 h-px bg-primary/60" />
          <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">FAQ</span>
        </div>
        <div
          ref={headlineRef}
          className="overflow-hidden will-change-[clip-path]"
          style={{ clipPath: 'inset(0 100% 0 0)' }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white break-words">
            {faqTitle}
          </h2>
        </div>
      </header>

      <div ref={faqListRef} className="space-y-3">
        {faqItems.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={`${faq.question.slice(0, 40)}-${index}`} data-faq-card>
            <TiltCard
              className={[
                'rounded-xl border transition-all duration-300 dark:backdrop-blur-md',
                isOpen
                  ? 'bg-white dark:bg-white/10 border-primary/50 dark:border-primary/40 shadow-[0_8px_32px_0_rgba(163,230,53,0.12)]'
                  : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/8 hover:border-primary/30 dark:hover:border-primary/20',
              ].join(' ')}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              >
                <span className="text-lg font-bold text-black dark:text-white leading-snug">
                  {faq.question}
                </span>
                <span
                  aria-hidden
                  className={[
                    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                    isOpen
                      ? 'bg-primary/20 text-primary rotate-45'
                      : 'bg-primary/10 text-primary rotate-0',
                  ].join(' ')}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="7" y1="1" x2="7" y2="13" />
                    <line x1="1" y1="7" x2="13" y2="7" />
                  </svg>
                </span>
              </button>
              <div
                className={[
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
                ].join(' ')}
              >
                <div
                  className="px-6 pb-5 text-zinc-600 dark:text-zinc-400 prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                  suppressHydrationWarning
                />
              </div>
            </TiltCard>
          </div>
          );
        })}
      </div>

      {contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) && (
        <div
          className="mt-16 relative overflow-hidden"
          style={{ backgroundColor: '#011627', isolation: 'isolate' }}
        >
          <DotMatrixStatic color="#a3e635" dotSize={2} spacing={20} opacity={0.08} className="-z-10" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/10">
            <span className="text-[10px] font-unbounded font-black uppercase tracking-[0.4em] text-zinc-500">
              Contact
            </span>
            <span className="text-[10px] font-unbounded tracking-widest text-zinc-600 tabular-nums">01 channels</span>
          </div>

          <div data-contact-card>
              <a
                href={`mailto:${contactEmail}`}
                className="group flex items-start gap-5 md:gap-8 px-6 md:px-10 py-8 md:py-10 border-b border-white/10 hover:bg-white/5 transition-colors duration-300"
              >
                <span className="shrink-0 pt-1 text-[10px] font-unbounded font-black text-zinc-600 tabular-nums">01</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-unbounded uppercase tracking-[0.3em] text-zinc-500 mb-3">
                    {faqEmailCardTitle}
                  </p>
                  <p className="text-2xl md:text-4xl lg:text-5xl font-unbounded font-black text-white group-hover:text-primary transition-colors duration-300 break-all">
                    {contactEmail}
                  </p>
                </div>
                <ArrowUpRight
                  size={20}
                  className="shrink-0 mt-2 text-zinc-600 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                />
              </a>
          </div>
        </div>
      )}
    </section>
  );
}

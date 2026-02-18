'use client';

import { useRef, useState, useCallback } from 'react';
import { Phone, Mail, ArrowRight } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
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
  contactPhone?: string;
  contactEmail?: string;
  faqPhoneCardTitle?: string;
  faqPhoneCardDescription?: string;
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
  contactPhone,
  contactEmail,
  faqPhoneCardTitle = 'Contact Me',
  faqPhoneCardDescription = "Ready to discuss your project? I'm here to answer any questions and provide personalized solutions for your business needs.",
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
          <span className="w-12 h-px bg-zinc-300 dark:bg-zinc-800" />
          <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">FAQ</span>
        </div>
        <div
          ref={headlineRef}
          className="overflow-hidden will-change-[clip-path]"
          style={{ clipPath: 'inset(0 100% 0 0)' }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white">
            {faqTitle}
          </h2>
        </div>
      </header>

      <div ref={faqListRef} className="space-y-3">
        {faqItems.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} data-faq-card>
            <TiltCard
              className={[
                'rounded-xl border transition-all duration-300 dark:backdrop-blur-md',
                isOpen
                  ? 'bg-white dark:bg-white/10 border-blue-400/50 dark:border-blue-500/40 shadow-[0_8px_32px_0_rgba(96,165,250,0.18)]'
                  : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/8 hover:border-blue-200 dark:hover:border-white/20',
              ].join(' ')}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
              >
                <span className="text-lg font-bold text-black dark:text-white leading-snug">
                  {faq.question}
                </span>
                <span
                  aria-hidden
                  className={[
                    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                    isOpen
                      ? 'bg-blue-500/30 text-blue-500 dark:text-blue-300 rotate-45'
                      : 'bg-blue-100 text-blue-500 dark:bg-[#e9ff13]/15 dark:text-[#e9ff13] rotate-0',
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
                  isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
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

      {(contactPhone || contactEmail) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {contactPhone && (
            <div data-contact-card>
            <TiltCard className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-transparent rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6">
                  <Phone size={24} className="text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">
                  {faqPhoneCardTitle}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {faqPhoneCardDescription}
                </p>
              </div>
              <a
                href={`tel:${contactPhone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 text-zinc-900 dark:text-white font-bold mt-8 group/link hover:text-primary transition-colors"
              >
                {contactPhone}
                <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform shrink-0" />
              </a>
            </TiltCard>
            </div>
          )}

          {contactEmail && (
            <div data-contact-card>
            <TiltCard className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-transparent rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6">
                  <Mail size={24} className="text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">
                  {faqEmailCardTitle}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {faqEmailCardDescription}
                </p>
              </div>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 text-zinc-900 dark:text-white font-bold mt-8 group/link hover:text-primary transition-colors"
              >
                {contactEmail}
                <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform shrink-0" />
              </a>
            </TiltCard>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

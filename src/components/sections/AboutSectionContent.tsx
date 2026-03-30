'use client';

import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const CHAR_DATA_ATTR = 'data-char';

function splitTextIntoChars(element: HTMLElement): void {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.textContent?.trim()) textNodes.push(node as Text);
  }
  textNodes.forEach((node) => {
    const text = node.textContent ?? '';
    const fragment = document.createDocumentFragment();
    for (const char of text) {
      const span = document.createElement('span');
      span.style.display = 'inline';
      span.style.opacity = '0';
      span.setAttribute(CHAR_DATA_ATTR, '');
      span.textContent = char;
      fragment.appendChild(span);
    }
    node.parentNode?.replaceChild(fragment, node);
  });
}

interface AboutSectionContentProps {
  title: string;
  contentHtml: string;
}

export default function AboutSectionContent({ title, contentHtml }: AboutSectionContentProps) {
  const t = useTranslations('nav');
  const stickyRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const sticky = stickyRef.current;
    const headline = headlineRef.current;
    const prose = proseRef.current;
    const arrow = arrowRef.current;
    if (!sticky || !headline || !prose) return;

    const section = sticky.closest('section');
    if (!section) return;

    gsap.set(headline, { clipPath: 'inset(0 100% 0 0)' });
    gsap.to(headline, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 45%', scrub: 1.2 },
    });

    gsap.set(prose, { clipPath: 'inset(100% 0 0 0)' });
    gsap.to(prose, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 70%', end: 'top 5%', scrub: 1.5 },
    });

    const proseInner = prose.querySelector('[data-prose-inner]');
    if (proseInner) {
      splitTextIntoChars(proseInner as HTMLElement);
      const chars = prose.querySelectorAll('[data-char]');
      gsap.set(chars, { opacity: 0 });
      gsap.to(chars, {
        opacity: 1,
        duration: 0.03,
        stagger: 0.02,
        ease: 'power1.out',
        scrollTrigger: { trigger: section, start: 'top 55%', end: 'top 15%', scrub: 0.8 },
      });
    }

    if (arrow) {
      gsap.to(arrow, { x: 6, duration: 0.7, repeat: -1, yoyo: true, ease: 'power1.inOut' });
    }
  }, []);

  return (
    <div
      ref={stickyRef}
      className="lg:col-span-7 lg:col-start-6 relative z-10 lg:sticky lg:top-[15vh] self-start"
    >
      <div className="bg-primary p-8 md:p-12 lg:p-16 lg:-ml-20 min-h-full flex flex-col justify-center">
        <div
          ref={headlineRef}
          className="overflow-hidden will-change-[clip-path] mb-6"
          style={{ clipPath: 'inset(0 100% 0 0)' }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-unbounded font-black text-primary-foreground leading-tight">
            {title}
          </h2>
        </div>
        {contentHtml?.trim() && (
          <div
            ref={proseRef}
            className="overflow-hidden will-change-[clip-path] mb-8"
            style={{ clipPath: 'inset(100% 0 0 0)' }}
          >
            <div
              data-prose-inner
              className="prose prose-lg max-w-none text-primary-foreground/80 [&>p]:mb-4 [&>p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        )}
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-primary-foreground font-bold uppercase tracking-widest text-sm hover:gap-4 transition-all group"
        >
          {t('about')}
          <svg
            ref={arrowRef}
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

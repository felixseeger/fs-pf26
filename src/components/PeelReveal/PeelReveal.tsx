'use client';

import './PeelReveal.css';
import { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MASK_LAYER_COUNT = 1;
const DEFAULT_IMAGE = '/peel-reveal/peel-reveal-img.jpg';

export interface PeelRevealProps {
  /** Image revealed underneath (peeled) – back layer */
  imagePeeled?: string;
  /** Image that peels away (top/mask layers) */
  imagePeel?: string;
  /** Fallback: single image for both layers when imagePeeled/imagePeel not set */
  imageSrc?: string;
  /** Mask image URL for peel layers (ACF about_mask_image) */
  maskImageUrl?: string;
  /** Alt text for the main image */
  imageAlt?: string;
  /** Headline text (split into words for animation) */
  headline?: string;
  /** Left intro label (e.g. "Signal") */
  leftIntroText?: string;
  /** Right intro label (e.g. "Motion") */
  rightIntroText?: string;
  /** Optional section header lines (replaces default "Signal type" copy) */
  sectionHeader?: string[];
  /** Optional section footer lines */
  sectionFooter?: string[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

const DEFAULT_MASK = '/peel-reveal/peel-reveal-img-mask.png';

export default function PeelReveal({
  imagePeeled,
  imagePeel,
  imageSrc,
  maskImageUrl,
  imageAlt = 'Peel reveal',
  headline = 'The uniform holds no allegiance',
  leftIntroText = 'Signal',
  rightIntroText = 'Motion',
  sectionHeader = ['Signal type: Neutral', 'Module ID: Nrmlss_001'],
  sectionFooter = ['Status: Detached'],
}: PeelRevealProps) {
  const peelRevealContainerRef = useRef<HTMLDivElement>(null);

  const underneathSrc = imagePeeled ?? imageSrc ?? DEFAULT_IMAGE;
  const peelSrc = imagePeel ?? imageSrc ?? DEFAULT_IMAGE;
  const maskUrl = maskImageUrl?.trim() || DEFAULT_MASK;

  const headlineWords = useMemo(
    () => stripHtml(headline).split(/\s+/).filter(Boolean),
    [headline]
  );

  useEffect(() => {
    const container = peelRevealContainerRef.current;
    if (!container) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const ctx = gsap.context(() => {
      timer = setTimeout(() => {
        const section = container.querySelector('.peel-reveal');
        if (!section) return;

        const imageContainer = section.querySelector('.peel-reveal-img-container');
        const underneathLayer = imageContainer?.querySelector('.pr-img:not(.mask)');
        const introTexts = Array.from(section.querySelectorAll('.peel-reveal-intro-text'));
        const maskLayers = Array.from(section.querySelectorAll('.mask'));
        const words = Array.from(section.querySelectorAll('.peel-reveal-word'));

        if (!imageContainer) return;

        if (words.length > 0) {
          gsap.set(words, { opacity: 0 });
        }

        maskLayers.forEach((layer) => {
          gsap.set(layer, { scale: 1 });
        });
        if (underneathLayer) {
          gsap.set(underneathLayer, { opacity: 0 });
        }
        gsap.set(imageContainer, { scale: 0 });

        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${typeof window !== 'undefined' ? window.innerHeight * 4 : 3000}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;

            gsap.set(imageContainer, { scale: progress });

            if (progress >= 0.25 && progress <= 0.9) {
              const borderRadiusProgress = (progress - 0.25) / 0.65;
              const borderRadiusValue = 3 * (1 - borderRadiusProgress);
              gsap.set(imageContainer, {
                borderRadius: `${borderRadiusValue}rem`,
              });
            } else if (progress < 0.25) {
              gsap.set(imageContainer, { borderRadius: '3rem' });
            } else if (progress > 0.9) {
              gsap.set(imageContainer, { borderRadius: '0rem' });
            }

            maskLayers.forEach((layer) => {
              const layerProgress = Math.min(progress / 0.9, 1);
              const currentScale = 1 - layerProgress;
              gsap.set(layer, { scale: Math.max(currentScale, 0) });
            });

            if (underneathLayer) {
              const layerProgress = Math.min(progress / 0.9, 1);
              gsap.set(underneathLayer, { opacity: layerProgress });
            }

            if (progress <= 0.9 && introTexts.length >= 2) {
              const textProgress = progress / 0.9;
              const moveDistance = typeof window !== 'undefined' ? window.innerWidth * 0.55 : 600;
              gsap.set(introTexts[0], { x: -textProgress * moveDistance });
              gsap.set(introTexts[1], { x: textProgress * moveDistance });
            }

            if (words.length > 0) {
              if (progress >= 0.6 && progress <= 0.9) {
                const headerProgress = (progress - 0.6) / 0.3;
                const totalWords = words.length;

                words.forEach((word, i) => {
                  const wordStartDelay = i / totalWords;
                  const wordEndDelay = (i + 1) / totalWords;
                  let wordOpacity = 0;

                  if (headerProgress >= wordEndDelay) {
                    wordOpacity = 1;
                  } else if (headerProgress >= wordStartDelay) {
                    const wordProgress =
                      (headerProgress - wordStartDelay) / (wordEndDelay - wordStartDelay);
                    wordOpacity = wordProgress;
                  }

                  gsap.set(word, { opacity: wordOpacity });
                });
              } else if (progress < 0.6) {
                gsap.set(words, { opacity: 0 });
              } else if (progress > 0.9) {
                gsap.set(words, { opacity: 1 });
              }
            }
          },
        });
      }, 500);
    }, container);

    return () => {
      if (timer) clearTimeout(timer);
      ctx.revert();
    };
  }, [headlineWords.length]);

  return (
    <div className="peel-reveal-container" ref={peelRevealContainerRef}>
      <section
        className="peel-reveal"
        style={{ ['--peel-mask-image' as string]: `url(${maskUrl})` }}
      >
        {sectionHeader.length > 0 && (
          <div className="section-header">
            {sectionHeader.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
        {sectionFooter.length > 0 && (
          <div className="section-footer">
            {sectionFooter.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
        <div className="peel-reveal-img-container">
          <div className="pr-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={underneathSrc} alt={imageAlt} />
          </div>
          {Array.from({ length: MASK_LAYER_COUNT }).map((_, i) => (
            <div key={i} className="pr-img mask">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={peelSrc} alt="" />
            </div>
          ))}
          <div className="peel-reveal-header">
            <h1>
              {headlineWords.map((word, i) => (
                <span key={i} className="peel-reveal-word">
                  {word}{' '}
                </span>
              ))}
            </h1>
          </div>
        </div>
        <div className="peel-reveal-intro-text-container">
          <div className="peel-reveal-intro-text">
            <h1>{leftIntroText}</h1>
          </div>
          <div className="peel-reveal-intro-text">
            <h1>{rightIntroText}</h1>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface AboutSectionImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export default function AboutSectionImage({ src, alt, priority }: AboutSectionImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const wrapper = wrapperRef.current;
    const image = imageRef.current;
    if (!wrapper || !image) return;

    gsap.set(image, { clipPath: 'inset(0 100% 0 0)' });

    gsap.to(image, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 85%',
        end: 'top 40%',
        scrub: 1.2,
      },
    });
  });

  return (
    <div ref={wrapperRef} className="lg:col-span-5 relative h-[400px] lg:h-[70vh]">
      <div
        ref={imageRef}
        className="absolute inset-0 lg:-left-20 xl:-left-32 overflow-hidden will-change-[clip-path]"
        style={{ clipPath: 'inset(0 100% 0 0)' }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={priority}
        />
      </div>
    </div>
  );
}

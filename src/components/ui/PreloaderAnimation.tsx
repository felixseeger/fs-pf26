'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import LiquidGradientBackground from './LiquidGradientBackground';

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

const ORBIT_PATHS = [
  { id: 'loader-orbit-1', d: 'M 500,-275 A 775,775 0 0,1 500,1275 A 775,775 0 0,1 500,-275 A 775,775 0 0,1 500,1275 A 775,775 0 0,1 500,-275 A 775,775 0 0,1 500,1275 A 775,775 0 0,1 499.99,-275' },
  { id: 'loader-orbit-2', d: 'M 500,-200 A 700,700 0 0,1 500,1200 A 700,700 0 0,1 500,-200 A 700,700 0 0,1 500,1200 A 700,700 0 0,1 500,-200 A 700,700 0 0,1 500,1200 A 700,700 0 0,1 499.99,-200' },
  { id: 'loader-orbit-3', d: 'M 500,-125 A 625,625 0 0,1 500,1125 A 625,625 0 0,1 500,-125 A 625,625 0 0,1 500,1125 A 625,625 0 0,1 500,-125 A 625,625 0 0,1 500,1125 A 625,625 0 0,1 499.99,-125' },
  { id: 'loader-orbit-4', d: 'M 500,-50 A 550,550 0 0,1 500,1050 A 550,550 0 0,1 500,-50 A 550,550 0 0,1 500,1050 A 550,550 0 0,1 500,-50 A 550,550 0 0,1 500,1050 A 550,550 0 0,1 499.99,-50' },
  { id: 'loader-orbit-5', d: 'M 500,25 A 475,475 0 0,1 500,975 A 475,475 0 0,1 500,25 A 475,475 0 0,1 500,975 A 475,475 0 0,1 500,25 A 475,475 0 0,1 500,975 A 475,475 0 0,1 499.99,25' },
  { id: 'loader-orbit-6', d: 'M 500,100 A 400,400 0 0,1 500,900 A 400,400 0 0,1 500,100 A 400,400 0 0,1 500,900 A 400,400 0 0,1 500,100 A 400,400 0 0,1 500,900 A 400,400 0 0,1 499.99,100' },
  { id: 'loader-orbit-7', d: 'M 500,175 A 325,325 0 0,1 500,825 A 325,325 0 0,1 500,175 A 325,325 0 0,1 500,825 A 325,325 0 0,1 500,175 A 325,325 0 0,1 500,825 A 325,325 0 0,1 499.99,175' },
  { id: 'loader-orbit-8', d: 'M 500,250 A 250,250 0 0,1 500,750 A 250,250 0 0,1 500,250 A 250,250 0 0,1 500,750 A 250,250 0 0,1 500,250 A 250,250 0 0,1 500,750 A 250,250 0 0,1 499.99,250' },
];

const START_OFFSETS = [30, 31, 33, 32, 30, 31, 33, 32];
const START_TEXT_LENGTHS = [300, 280, 240, 260, 290, 200, 210, 190];
const TARGET_TEXT_LENGTHS = [4000, 3500, 3250, 3000, 2500, 2000, 1500, 1250];
const ORBIT_RADII = [775, 700, 625, 550, 475, 400, 325, 250];

export interface PreloaderAnimationProps {
  orbitLabels?: string[];
  backgroundColor?: string;
  textColor?: string;
  counterDuration?: number;
  onComplete?: () => void;
}

export default function PreloaderAnimation({
  orbitLabels = DEFAULT_LABELS,
  backgroundColor = '#d1d9b8',
  textColor = '#0f0f0f',
  counterDuration = 4,
  onComplete,
}: PreloaderAnimationProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [counter, setCounter] = useState(0);

  const labels = orbitLabels.slice(0, 8);
  while (labels.length < 8) labels.push(DEFAULT_LABELS[labels.length]);

  useEffect(() => {
    const loader = loaderRef.current;
    const svg = svgRef.current;
    if (!loader || !svg) return;

    const textPaths = svg.querySelectorAll('textPath');
    if (textPaths.length === 0) return;

    const maxOrbitRadius = ORBIT_RADII[0];
    const maxAnimDuration = 1.25;
    const minAnimDuration = 1;

    textPaths.forEach((textPath, index) => {
      const animationDelay = (textPaths.length - 1 - index) * 0.1;
      const currentOrbitRadius = ORBIT_RADII[index];
      const currentDuration =
        minAnimDuration +
        (currentOrbitRadius / maxOrbitRadius) * (maxAnimDuration - minAnimDuration);
      const pathLength = 2 * Math.PI * currentOrbitRadius * 3;
      const startLen = START_TEXT_LENGTHS[index];
      const textLengthIncrease = TARGET_TEXT_LENGTHS[index] - startLen;
      const offsetAdjustment = (textLengthIncrease / 2 / pathLength) * 100;
      const targetOffset = START_OFFSETS[index] - offsetAdjustment;

      gsap.to(textPath, {
        attr: {
          textLength: TARGET_TEXT_LENGTHS[index],
          startOffset: `${targetOffset}%`,
        },
        duration: currentDuration,
        delay: animationDelay,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        repeatDelay: 0,
      });
    });

    let loaderRotation = 0;
    function animateRotation() {
      const spinDirection = Math.random() < 0.5 ? 1 : -1;
      loaderRotation += 25 * spinDirection;
      gsap.to(svg, {
        rotation: loaderRotation,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: animateRotation,
      });
    }
    animateRotation();

    const count = { value: 0 };
    gsap.to(count, {
      value: 100,
      duration: counterDuration,
      delay: 1,
      ease: 'power1.out',
      onUpdate: () => setCounter(Math.floor(count.value)),
      onComplete: () => {
        gsap.to(loader.querySelector('.counter'), {
          opacity: 0,
          duration: 0.5,
          delay: 1,
        });
      },
    });

    const orbitTextElements = svg.querySelectorAll('.orbit-text');
    gsap.set(orbitTextElements, { opacity: 0 });
    const orbitTextsReversed = Array.from(orbitTextElements).reverse();

    gsap.to(orbitTextsReversed, {
      opacity: 1,
      duration: 0.75,
      stagger: 0.125,
      ease: 'power1.out',
    });

    const totalDelay = 1 + counterDuration + 1 + 1;
    gsap.to(orbitTextsReversed, {
      opacity: 0,
      duration: 0.75,
      stagger: 0.1,
      delay: totalDelay - 0.75,
      ease: 'power1.out',
      onComplete: () => {
        gsap.to(loader, {
          opacity: 0,
          duration: 1,
          onComplete: () => {
            onComplete?.();
          },
        });
      },
    });

    return () => {
      gsap.killTweensOf([svg, count, orbitTextElements, loader]);
    };
  }, [counterDuration, onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center w-full h-svh"
      style={{
        color: textColor,
        willChange: 'opacity',
      }}
    >
      <LiquidGradientBackground className="absolute inset-0 z-0 w-full h-full pointer-events-none" />
      <div className="relative z-10 flex items-center justify-center w-full h-full">
      <svg
        ref={svgRef}
        viewBox="-425 -425 1850 1850"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[85%] h-[85%] max-md:w-full max-md:h-full"
      >
        {ORBIT_PATHS.map(({ id, d }) => (
          <path key={id} id={id} d={d} fill="none" />
        ))}
        {labels.map((label, i) => (
          <text key={i} className="orbit-text fill-current uppercase text-[2.75rem] max-md:text-[3rem] font-medium">
            <textPath href={`#${ORBIT_PATHS[i].id}`} startOffset={`${START_OFFSETS[i]}%`} textLength={START_TEXT_LENGTHS[i]}>
              {label}
            </textPath>
          </text>
        ))}
      </svg>
      <div className="counter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-current">
        <p>{counter}</p>
      </div>
      </div>
    </div>
  );
}

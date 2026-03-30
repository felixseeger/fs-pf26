'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – gsap ships Flip.js (uppercase) but flip.d.ts (lowercase); runtime path is correct
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Flip);

type ClutterMode = 'chaos' | 'cleanup' | 'notebook';

interface ClutterItem {
  id: string;
  src: string;
  size: number;
}

interface ArrangementEntry {
  x: number;
  y: number;
  rotation: number;
}

interface ArrangementLayout {
  header: { x: number; y: number; center: boolean };
  items: (ArrangementEntry & { id: string })[];
}

const ITEMS: ClutterItem[] = [
  { id: 'music', src: '/img/about-clutter/music.png', size: 325 },
  { id: 'appicon', src: '/img/about-clutter/appicon.png', size: 100 },
  { id: 'cd', src: '/img/about-clutter/cd.png', size: 400 },
  { id: 'cursor', src: '/img/about-clutter/cursor.png', size: 125 },
  { id: 'dialog', src: '/img/about-clutter/dialog.png', size: 300 },
  { id: 'folder', src: '/img/about-clutter/folder.png', size: 150 },
  { id: 'lighter', src: '/img/about-clutter/lighter.png', size: 225 },
  { id: 'macmini', src: '/img/about-clutter/macmini.png', size: 250 },
  { id: 'paper', src: '/img/about-clutter/paper.png', size: 375 },
  { id: 'passport', src: '/img/about-clutter/passport.png', size: 250 },
  { id: 'portrait', src: '/img/about-clutter/portrait.png', size: 375 },
];

const ARRANGEMENTS: Record<ClutterMode, ArrangementLayout> = {
  chaos: {
    header: { x: 50, y: 47.5, center: true },
    items: [
      { id: 'music', x: -2.5, y: -2.5, rotation: -15 },
      { id: 'appicon', x: 20, y: 15, rotation: 5 },
      { id: 'cd', x: 72.5, y: 5, rotation: 0 },
      { id: 'cursor', x: 72.5, y: 75, rotation: 0 },
      { id: 'dialog', x: 80, y: 60, rotation: 15 },
      { id: 'folder', x: 90, y: 50, rotation: 5 },
      { id: 'lighter', x: 2.5, y: 45, rotation: -10 },
      { id: 'macmini', x: 9.5, y: 55, rotation: 15 },
      { id: 'paper', x: 5, y: 15, rotation: 10 },
      { id: 'passport', x: -2.5, y: 65, rotation: -35 },
      { id: 'portrait', x: 65, y: 20, rotation: -5 },
    ],
  },
  cleanup: {
    header: { x: 70, y: 37.5, center: false },
    items: [
      { id: 'music', x: 76.5, y: -5, rotation: 0 },
      { id: 'appicon', x: 64.5, y: 6, rotation: 0 },
      { id: 'cd', x: 0, y: 47.5, rotation: 0 },
      { id: 'cursor', x: 63.5, y: 23, rotation: 0 },
      { id: 'dialog', x: 34.5, y: 59, rotation: 0 },
      { id: 'folder', x: 24.5, y: 33, rotation: 0 },
      { id: 'lighter', x: -6, y: 3.5, rotation: 0 },
      { id: 'macmini', x: 82.5, y: 66, rotation: 0 },
      { id: 'paper', x: 9, y: -3.5, rotation: 0 },
      { id: 'passport', x: 60, y: 65.5, rotation: 0 },
      { id: 'portrait', x: 36.5, y: 5.5, rotation: 0 },
    ],
  },
  notebook: {
    header: { x: 50, y: 47.5, center: true },
    items: [
      { id: 'music', x: 45, y: 0.5, rotation: 20 },
      { id: 'appicon', x: 65, y: 70, rotation: 25 },
      { id: 'cd', x: 27.5, y: 15, rotation: 10 },
      { id: 'cursor', x: 75, y: 35, rotation: 0 },
      { id: 'dialog', x: 30, y: 57.5, rotation: 10 },
      { id: 'folder', x: 25, y: 40, rotation: 10 },
      { id: 'lighter', x: 30, y: 7.5, rotation: 30 },
      { id: 'macmini', x: 50, y: 50, rotation: -5 },
      { id: 'paper', x: 10, y: 10, rotation: -30 },
      { id: 'passport', x: 16.5, y: 50, rotation: -20 },
      { id: 'portrait', x: 57.5, y: 20, rotation: 10 },
    ],
  },
};

const MODE_ICONS: Record<ClutterMode, React.ReactNode> = {
  chaos: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  cleanup: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  notebook: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

interface CreativeClutterProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function CreativeClutter({ title, subtitle, className = '' }: CreativeClutterProps) {
  const deskRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activeMode, setActiveMode] = useState<ClutterMode>('chaos');
  const activeModeRef = useRef<ClutterMode>('chaos');

  const setItemRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  const setLayout = useCallback((mode: ClutterMode) => {
    const desk = deskRef.current;
    const header = headerRef.current;
    if (!desk || !header) return;

    const deskWidth = desk.offsetWidth;
    const deskHeight = desk.offsetHeight;
    const layout = ARRANGEMENTS[mode];

    const isMobile = deskWidth < 1000;
    const offsetX = isMobile
      ? header.offsetWidth / 2
      : layout.header.center
        ? header.offsetWidth / 2
        : 0;
    const offsetY = isMobile
      ? header.offsetHeight / 2
      : layout.header.center
        ? header.offsetHeight / 2
        : 0;
    const headerX = isMobile ? 50 : layout.header.x;
    const headerY = isMobile ? 47.5 : layout.header.y;

    gsap.set(header, {
      x: (headerX / 100) * deskWidth - offsetX,
      y: (headerY / 100) * deskHeight - offsetY,
      rotation: 0,
    });

    layout.items.forEach(({ id, x, y, rotation }) => {
      const el = itemRefs.current.get(id);
      if (!el) return;
      const item = ITEMS.find((i) => i.id === id);
      if (!item) return;
      gsap.set(el, {
        x: (x / 100) * deskWidth,
        y: (y / 100) * deskHeight,
        width: item.size,
        height: item.size,
        rotation,
      });
    });
  }, []);

  const switchMode = useCallback(
    (mode: ClutterMode) => {
      if (mode === activeModeRef.current) return;

      const header = headerRef.current;
      const itemEls = ITEMS.map((i) => itemRefs.current.get(i.id)).filter(Boolean) as HTMLDivElement[];
      const flipTargets = header ? [header, ...itemEls] : itemEls;

      const state = Flip.getState(flipTargets);
      setLayout(mode);

      Flip.from(state, {
        duration: 1.25,
        ease: 'power3.inOut',
        stagger: { amount: 0.1, from: 'center' },
        absolute: true,
      });

      activeModeRef.current = mode;
      setActiveMode(mode);
    },
    [setLayout],
  );

  useGSAP(() => {
    setLayout('chaos');
  }, { scope: deskRef });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setLayout(activeModeRef.current), 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [setLayout]);

  return (
    <section className={`relative w-full h-svh max-w-350 mx-auto ${className}`}>
      <div ref={deskRef} className="relative w-full h-full overflow-x-hidden">
        {/* Header */}
        <div
          ref={headerRef}
          className="absolute w-[min(25rem,90vw)] text-center flex flex-col gap-3 pointer-events-none z-10"
        >
          <h1 className="font-[family-name:var(--font-unbounded)] text-[clamp(1.75rem,4vw,4rem)] font-semibold tracking-tight leading-none text-zinc-900 dark:text-white break-words">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[0.95rem] leading-relaxed text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Clutter Items */}
        {ITEMS.map((item) => (
          <div
            key={item.id}
            ref={setItemRef(item.id)}
            className="absolute will-change-[top,left,transform]"
          >
            <Image
              src={item.src}
              alt=""
              width={item.size}
              height={item.size}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        ))}

        {/* Mode Switches */}
        <div className="fixed bottom-[7.5svh] left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {(Object.keys(ARRANGEMENTS) as ClutterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => switchMode(mode)}
              className={`w-12 h-12 text-lg flex justify-center items-center rounded-lg border transition-all duration-500 cursor-pointer active:scale-90 ${
                activeMode === mode
                  ? 'bg-zinc-200 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white'
                  : 'bg-[#f5f2ed] dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
              }`}
              aria-label={`Switch to ${mode} layout`}
            >
              {MODE_ICONS[mode]}
            </button>
          ))}
        </div>

        {/* Mobile overlay */}
        <div className="absolute inset-0 bg-[#f5f2ed]/50 dark:bg-zinc-900/50 pointer-events-none hidden max-[1000px]:block" />
      </div>
    </section>
  );
}

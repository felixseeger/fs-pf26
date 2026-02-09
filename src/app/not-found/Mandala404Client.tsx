'use client';

import Link from 'next/link';
import MandalaBackground from '@/components/ui/MandalaBackground';

export interface Mandala404ClientProps {
  title?: string;
  message?: string;
  buttonText?: string;
  buttonLink?: string;
  primaryColor?: string;
  bgColor?: string;
}

const DEFAULT_TITLE = '404';
const DEFAULT_MESSAGE = 'The page you are looking for does not exist or has been moved.';
const DEFAULT_BUTTON = 'Back to home';
const DEFAULT_LINK = '/';
const DEFAULT_PRIMARY = '#ffffff';
const DEFAULT_BG = '#000000';

export default function Mandala404Client({
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
  buttonText = DEFAULT_BUTTON,
  buttonLink = DEFAULT_LINK,
  primaryColor = DEFAULT_PRIMARY,
  bgColor = DEFAULT_BG,
}: Mandala404ClientProps) {
  return (
    <div
      className="fixed inset-0 z-9999 flex flex-col justify-center items-center min-h-svh w-full overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <MandalaBackground />
      <div
        className="relative z-10 flex flex-col justify-center items-center text-center px-6 max-w-xl"
        style={{ color: primaryColor }}
      >
        <h1
          className="text-6xl md:text-8xl font-black tracking-tight mb-4"
          style={{ color: primaryColor, textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)' }}
        >
          {title}
        </h1>
        <p
          className="text-lg md:text-xl font-light tracking-wide leading-relaxed opacity-90 mb-10"
          style={{ color: primaryColor, textShadow: '0 0 20px rgba(0,0,0,0.9)' }}
        >
          {message}
        </p>
        <Link
          href={buttonLink}
          className="inline-block px-10 py-4 text-sm tracking-[0.25em] uppercase border transition-all duration-500 hover:bg-white/10"
          style={{
            color: primaryColor,
            borderColor: `rgba(255,255,255,0.3)`,
          }}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}

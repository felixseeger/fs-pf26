'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder during SSR to avoid hydration mismatch
    return (
      <div style={{ width: 40, height: 55 }} />
    );
  }

  // Single logo with invert filter for light mode
  // Logo is white, so invert it to black for light mode
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={40}
      height={55}
      priority
      className={resolvedTheme === 'light' ? 'invert' : ''}
    />
  );
}

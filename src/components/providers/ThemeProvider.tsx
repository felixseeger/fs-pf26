'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { ReactNode, useEffect } from 'react';

// Configuration for day/night hours
const DAY_START_HOUR = 6;  // 6:00 AM
const NIGHT_START_HOUR = 18; // 6:00 PM

function getTimeBasedTheme(): 'light' | 'dark' {
  const hour = new Date().getHours();
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'light' : 'dark';
}

function TimeBasedThemeInitializer() {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Always set time-based theme on initial load
    const timeBasedTheme = getTimeBasedTheme();
    setTheme(timeBasedTheme);
  }, []); // Only run once on mount

  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <TimeBasedThemeInitializer />
      {children}
    </NextThemesProvider>
  );
}

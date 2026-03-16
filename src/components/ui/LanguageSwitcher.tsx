'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';

// Map locale codes to flag-icons country codes (fi-xx)
// Change fi-gb → fi-us if you prefer the US flag for English
const FLAG: Record<string, string> = {
  de: 'de',
  en: 'gb',
};

const LOCALES = ['de', 'en'] as const;

interface Props {
  locale: string;
  className?: string;
}

export default function LanguageSwitcher({ locale, className = '' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(target: string) {
    if (target === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: target });
    });
  }

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      {LOCALES.map((loc) => {
        const isActive = loc === locale;
        return (
          <button
            key={loc}
            onClick={() => switchTo(loc)}
            disabled={isPending || isActive}
            aria-label={`Switch to ${loc.toUpperCase()}`}
            aria-pressed={isActive}
            className={[
              'inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-unbounded font-black tracking-widest uppercase transition-all',
              isActive
                ? 'opacity-100 border border-foreground/30 bg-foreground/5'
                : 'opacity-40 hover:opacity-80 border border-transparent hover:border-foreground/20',
              isPending ? 'cursor-wait' : '',
            ].join(' ')}
          >
            <span
              className={`fi fi-${FLAG[loc]} fis rounded-[2px]`}
              aria-hidden="true"
              style={{ fontSize: '1rem' }}
            />
            <span>{loc.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}

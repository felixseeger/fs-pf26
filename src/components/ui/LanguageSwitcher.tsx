'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';

interface Props {
  locale: string;
  className?: string;
}

export default function LanguageSwitcher({ locale, className = '' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const otherLocale = locale === 'de' ? 'en' : 'de';

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: otherLocale });
    });
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={`Switch language to ${otherLocale.toUpperCase()}`}
      className={`text-xs font-unbounded font-black tracking-widest uppercase px-2.5 py-1 rounded border border-foreground/20 hover:border-foreground/60 transition-colors disabled:opacity-50 ${className}`}
    >
      {otherLocale.toUpperCase()}
    </button>
  );
}

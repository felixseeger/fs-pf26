'use client';

import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Optional class for the nav element */
  className?: string;
  /** Separator between items; default is ChevronRight icon */
  separator?: React.ReactNode;
}

const LABEL_MAP: Record<string, { de: string; en: string }> = {
  home: { de: 'Startseite', en: 'Home' },
  courses: { de: 'Kurse', en: 'Courses' },
  portfolio: { de: 'Portfolio', en: 'Portfolio' },
  blog: { de: 'Blog', en: 'Blog' },
  services: { de: 'Leistungen', en: 'Services' },
  about: { de: 'Über mich', en: 'About' },
  'über mich': { de: 'Über mich', en: 'About' },
  'ueber mich': { de: 'Über mich', en: 'About' },
  contact: { de: 'Kontakt', en: 'Contact' },
  resume: { de: 'Lebenslauf', en: 'Resume' },
  'sign up': { de: 'Anmeldung', en: 'Sign up' },
  success: { de: 'Erfolg', en: 'Success' },
};

function localizeLabel(name: string, locale: string): string {
  const key = name.trim().toLowerCase();
  const entry = LABEL_MAP[key];
  if (!entry) return name;
  return locale === 'de' ? entry.de : entry.en;
}

export default function Breadcrumb({ items, className = '', separator }: BreadcrumbProps) {
  if (!items.length) return null;
  const locale = useLocale();

  const defaultSeparator = <ChevronRight className="w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden />;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const sep = separator ?? defaultSeparator;
          const displayName = localizeLabel(item.name, locale);

          return (
            <li key={item.path + index} className="flex items-center gap-x-1">
              {index > 0 && <span className="flex shrink-0">{sep}</span>}
              {isLast ? (
                <span aria-current="page" className="font-medium text-zinc-900 dark:text-white">
                  {displayName}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

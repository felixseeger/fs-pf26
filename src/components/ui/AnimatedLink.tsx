'use client';

import { Link as LocaleLink } from '@/i18n/navigation';
import { usePageTransition } from '@/components/providers/PageTransitionProvider';
import type { PageTransitionType } from '@/lib/page-transitions';
import type { ComponentProps } from 'react';

export interface AnimatedLinkProps extends ComponentProps<typeof LocaleLink> {
  /** Transition to use for this link. Omit to use the default. */
  transition?: PageTransitionType;
  /** If true, use normal navigation without transition (e.g. external or hash) */
  disableTransition?: boolean;
}

/**
 * Link that triggers a GSAP page transition before navigating.
 * Wrap the app in PageTransitionProvider and use this in place of Link where you want transitions.
 */
export default function AnimatedLink({
  href,
  transition,
  disableTransition = false,
  onClick,
  ...rest
}: AnimatedLinkProps) {
  const ctx = usePageTransition();
  const isExternal =
    typeof href === 'string' && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'));
  const isHash = typeof href === 'string' && (href.startsWith('#') || href.match(/^\/#/));
  const useTransition = !disableTransition && !isExternal && !isHash && ctx;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    if (useTransition && typeof href === 'string') {
      e.preventDefault();
      ctx.navigate(href, transition);
    }
  };

  return <LocaleLink href={href} onClick={handleClick} {...rest} />;
}

'use client';

import NextLink from 'next/link';
import { usePageTransition } from '@/components/providers/PageTransitionProvider';
import type { PageTransitionType } from '@/lib/page-transitions';

export interface AnimatedLinkProps extends React.ComponentProps<typeof NextLink> {
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
  const isHash = typeof href === 'string' && href.startsWith('#');
  const useTransition = !disableTransition && !isExternal && !isHash && ctx;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    if (useTransition && typeof href === 'string') {
      e.preventDefault();
      ctx.navigate(href, transition);
    }
  };

  return <NextLink href={href} onClick={handleClick} {...rest} />;
}

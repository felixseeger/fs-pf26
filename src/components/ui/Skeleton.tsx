'use client';

import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use shimmer animation instead of pulse */
  shimmer?: boolean;
}

/**
 * Base skeleton placeholder. Use for text lines, images, or custom shapes.
 */
export function Skeleton({ className, shimmer, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-md skeleton-bg',
        shimmer ? 'skeleton-shimmer' : 'animate-pulse',
        className
      )}
      {...props}
    />
  );
}

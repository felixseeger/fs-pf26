import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Re-export locale-aware Link, redirect, useRouter, usePathname
export const { Link, redirect, useRouter, usePathname, getPathname } =
  createNavigation(routing);

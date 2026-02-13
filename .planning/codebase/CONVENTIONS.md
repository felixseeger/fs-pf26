# Coding Conventions

**Analysis Date:** 2026-02-11

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `PostCard.tsx`, `CookieConsentBanner.tsx`, `LiquidGradientBackground.tsx`)
- Utility modules: camelCase (e.g., `content.ts`, `date.ts`, `image.ts`, `cookies.ts`)
- WordPress API modules: camelCase (e.g., `posts.ts`, `pages.ts`, `portfolio.ts`, `menus.ts`)
- Page routes: `page.tsx` in Next.js App Router directories (e.g., `src/app/blog/[slug]/page.tsx`)
- Client wrappers: PascalCase with `Client` suffix (e.g., `ContactPageClient.tsx`, `PreloaderClient.tsx`, `Mandala404Client.tsx`)
- Data files: camelCase (e.g., `src/data/services.ts`)
- Barrel files: `index.ts` for re-exports

**Functions:**
- Use camelCase for all functions: `getPosts`, `getPostBySlug`, `formatDate`, `stripHtml`
- WordPress API functions: prefix with `get` or `fetch` (e.g., `getPortfolioItems`, `fetchWordPress`, `fetchCustomEndpoint`)
- Utility functions: verb-first descriptive names (e.g., `truncateText`, `buildUrl`, `handleApiError`)
- React components: PascalCase function names matching file name (e.g., `export default function PostCard`)
- Event handlers in components: `handle` prefix (e.g., `handleSubmit`, `handleChange`, `handleMouseMove`, `handleMouseLeave`)

**Variables:**
- Use camelCase: `featuredImage`, `menuItems`, `selectedIndex`, `isSubmitting`
- State variables: descriptive boolean prefixes `is`/`has`/`show` (e.g., `isOpen`, `hasConsented`, `showBanner`, `showSettings`)
- Constants: UPPER_SNAKE_CASE for module-level config (e.g., `CONSENT_COOKIE_NAME`, `CONSENT_VERSION`, `DEFAULT_PLACEHOLDER`, `WORDPRESS_API_URL`, `WP_REST_BASE`)
- Refs: descriptive `Ref` suffix (e.g., `headerRef`, `logoWrapperRef`, `cardRef`, `emblaRef`)

**Types:**
- Interfaces: PascalCase, prefixed `WP` for WordPress data types (e.g., `WPPost`, `WPPage`, `WPMenuItem`, `WPCategory`)
- Component props: PascalCase with `Props` suffix (e.g., `PostCardProps`, `PostListProps`, `ContactSectionProps`, `TiltCardProps`)
- Custom field types: PascalCase with `MetaBox` suffix (e.g., `HomepageMetaBox`, `ContactPageMetaBox`, `ResumeMetaBox`)
- Type aliases: PascalCase (e.g., `DateInput`, `QueryParams`, `HomepageACF`)
- Enums/unions: inline string unions preferred over enums (e.g., `'idle' | 'success' | 'error'`)

## Code Style

**Formatting:**
- No Prettier config file; formatting is handled by ESLint and editor defaults
- Use 2-space indentation (inferred from all source files)
- Use single quotes for strings in TypeScript files
- Use double quotes for JSX attribute values
- Trailing commas in multi-line structures
- Semicolons at end of statements

**Linting:**
- ESLint 9 with flat config at `eslint.config.mjs`
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- ESLint is ignored during builds (`next.config.ts`: `eslint: { ignoreDuringBuilds: true }`)
- TypeScript strict mode enabled in `tsconfig.json`

**TypeScript:**
- Strict mode enabled
- Target: ES2018
- Module resolution: bundler
- `noEmit: true` (Next.js handles compilation)
- Path alias: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. React/Next.js framework imports (`import React from 'react'`, `import Image from 'next/image'`, `import Link from 'next/link'`)
2. Third-party library imports (`framer-motion`, `gsap`, `embla-carousel-react`, `lucide-react`)
3. Internal imports using `@/` path alias (`@/lib/wordpress`, `@/components/ui/TiltCard`, `@/types/wordpress`)
4. Relative imports for sibling files (`./api`, `./globals.css`)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use `@/` for cross-directory imports; use relative paths only within the same module directory (e.g., `./api` within `src/lib/wordpress/`)

**Import Style:**
- Named imports for specific exports: `import { getPosts, getPortfolioItems } from '@/lib/wordpress'`
- Default imports for components: `import PostCard from '@/components/blog/PostCard'`
- Type-only imports when importing only types: `import type { NextConfig } from 'next'`
- Barrel re-exports in `index.ts` files: `export * from './posts'`

## Error Handling

**WordPress API Layer (`src/lib/wordpress/`):**
- Every API function wraps in try/catch
- On error, log with `console.error` and return safe default (empty array `[]` or `null`)
- Never throw from API functions; callers receive fallback data
- Pattern:
```typescript
export async function getSomething(): Promise<WPThing[]> {
  try {
    const data = await fetchWordPress<WPThing[]>('/endpoint', { _embed: true });
    return data;
  } catch (error) {
    console.error('Error fetching something:', error);
    return [];
  }
}
```

**Core fetch function (`src/lib/wordpress/api.ts`):**
- `fetchWordPress<T>()` throws `ApiError` with status, statusText, and url
- `handleApiError()` provides detailed console logging with troubleshooting steps for 404s
- `suppressErrorLogging` option for expected failures (e.g., 404 when CPT not registered)
- 502 errors get minimal logging (WordPress server down)

**Page-level error handling (`src/app/page.tsx`, `src/app/blog/[slug]/page.tsx`):**
- Pages use try/catch around data fetching
- Store error in local state variable
- Display user-friendly error message in UI
- Use `notFound()` from Next.js for missing content
- Pattern:
```typescript
let error: string | null = null;
try {
  data = await fetchData();
} catch (err) {
  error = err instanceof Error ? err.message : "Failed to fetch content";
  console.error("Error fetching content:", err);
}
```

**Client component error handling:**
- Form submission errors: track with state (`'idle' | 'success' | 'error'`)
- Display inline error messages with `role="alert"` for accessibility

## Logging

**Framework:** `console` (no external logging library)

**Patterns:**
- `console.log` for WordPress API request/response logging in `src/lib/wordpress/api.ts`
- `console.error` for error reporting in all API functions
- `console.warn` for non-critical issues (e.g., missing categories, multiple slug matches)
- Suppress logging flag available via `suppressErrorLogging` option on fetch calls

## Comments

**When to Comment:**
- Module-level file description at top of every `src/lib/wordpress/*.ts` file
- Section dividers with `// =====` comment blocks to organize related functions in utility files
- Inline comments for non-obvious logic (e.g., URL deduplication, WordPress data fallback chains)
- `/* */` block comments for JSX section labels (e.g., `{/* Hero Section */}`, `{/* Contact Form */}`)

**JSDoc/TSDoc:**
- JSDoc comments on all exported functions in `src/lib/` modules
- Include `@param`, `@returns`, `@template`, `@throws`, `@example` tags
- Pattern:
```typescript
/**
 * Get all posts with pagination
 * @param perPage - Number of posts per page (default: 10)
 * @param page - Page number (default: 1)
 */
export async function getPosts(perPage: number = 10, page: number = 1): Promise<WPPost[]> {
```

**Section Dividers:**
- Use `// =============================================================================` blocks in utility files
- Group related functions under section headings (e.g., `// HTML Processing`, `// Date Formatting`, `// Image Handling`)

## Function Design

**Size:** Functions are typically 5-30 lines. Larger components (100-300 lines) are acceptable for page components and complex UI.

**Parameters:**
- Use default parameter values: `perPage: number = 10`, `fallback: string = DEFAULT_PLACEHOLDER`
- Accept options objects for complex configurations: `options: FetchOptions = {}`
- Use TypeScript generics for type-safe API fetching: `fetchWordPress<T>()`

**Return Values:**
- API functions return `Promise<T[]>` (arrays) or `Promise<T | null>` (single items)
- Utility functions return primitive types (string, number, boolean)
- Components return JSX.Element or null

## Module Design

**Exports:**
- One default export per component file (the component itself)
- Named exports for utility functions and types
- Barrel file re-exports via `index.ts` (e.g., `src/lib/wordpress/index.ts`, `src/components/blog/index.ts`)

**Barrel Files:**
- `src/lib/wordpress/index.ts`: Re-exports all WordPress API functions via `export * from './posts'`
- `src/components/blog/index.ts`: Re-exports blog components via `export { default as PostCard } from './PostCard'`

## Component Patterns

**Server vs Client Components:**
- Pages (`page.tsx`) are Server Components by default (async, fetch data directly)
- Interactive components use `'use client'` directive at top of file
- Client components marked with `'use client'`: `Header.tsx`, `CookieConsentBanner.tsx`, `ContactSection.tsx`, `TiltCard.tsx`, `PortfolioCarousel.tsx`, all providers
- Server components: `Footer.tsx`, `PostCard.tsx`, all `page.tsx` files

**State Management:**
- React `useState` for local component state
- React Context for cross-component state (cookie consent via `CookieConsentProvider`, theme via `ThemeProvider`)
- No external state management library (no Redux, Zustand, etc.)
- Custom hooks co-located with providers: `useCookieConsent()` in `CookieConsentProvider.tsx`

**Mounted Pattern:**
- Many client components track mount state to avoid hydration mismatches:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
if (!mounted) return null;
```

**suppressHydrationWarning:**
- Extensively used on elements that may differ between server and client rendering
- Applied to wrapper divs, dynamic content containers, and theme-dependent elements

## Styling Conventions

**Framework:** Tailwind CSS v4 with `@tailwindcss/postcss` plugin

**Approach:**
- Utility-first Tailwind classes directly in JSX
- `cn()` utility from `src/lib/utils.ts` for conditional class merging (using `clsx` + `tailwind-merge`)
- Custom CSS classes in `src/app/globals.css` for complex effects (glass morphism, tilt card, Lenis scroll)
- CSS custom properties for theming (HSL color values in `:root` and `.dark`)

**Dark Mode:**
- Class-based dark mode (`.dark` class on `<html>`)
- Pattern: `text-zinc-600 dark:text-zinc-400`, `bg-white dark:bg-zinc-900`
- Managed by `next-themes` ThemeProvider with time-based auto-switching

**Color System:**
- Semantic color tokens: `primary`, `primary-foreground`, `secondary`, `muted`, `accent`, `destructive`, `background`, `foreground`
- Direct Tailwind colors for one-off uses: `text-zinc-600`, `bg-blue-100`, `text-red-800`

**Typography:**
- Headings: `font-unbounded` (Unbounded font family)
- Body text: `font-poppins` (Poppins font family)
- Code/mono: `font-geist-mono` (Geist Mono)
- Font sizes via Tailwind: `text-xs`, `text-sm`, `text-lg`, `text-4xl`, etc.
- Responsive sizing: `text-4xl md:text-5xl lg:text-6xl`

**Layout:**
- Max width containers: `max-w-6xl mx-auto px-4` (most sections), `max-w-4xl` (blog posts), `max-w-7xl` (header)
- Grid layouts: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Flexbox for inline layouts: `flex items-center gap-4`

**Animation:**
- Framer Motion for component enter/exit: `<AnimatePresence>`, `<motion.div>`
- GSAP for complex scroll-triggered animations (header, hero)
- CSS transitions for hover effects: `transition-colors`, `transition-transform`, `transition-all`
- Lenis for smooth scrolling (`src/components/layout/SmoothScroll.tsx`)

## Accessibility Conventions

- Skip-to-content link in root layout (`src/app/layout.tsx`)
- `aria-label` on all interactive elements without visible text (buttons, icon links)
- `aria-hidden` on decorative SVG icons
- `role="dialog"` and `aria-modal="true"` on modal overlays
- `aria-expanded` on toggle buttons (mobile menu)
- `aria-busy` on form submit buttons during loading
- `aria-describedby` linking error messages to form buttons
- Semantic HTML: `<article>`, `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<time>`
- `aria-label` on `<nav>` elements (e.g., `"Main navigation"`, `"Secondary navigation"`)

---

*Convention analysis: 2026-02-11*

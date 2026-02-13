# Architecture

**Analysis Date:** 2025-02-11

## Pattern Overview

**Overall:** Headless CMS (WordPress backend) + Static Site Generation (Next.js App Router frontend)

**Key Characteristics:**
- Statically exported Next.js site (`output: 'export'` in `next.config.ts`) deployed as plain HTML/CSS/JS to hosting
- All content fetched from a WordPress REST API at build time via `generateStaticParams()` on dynamic routes
- WordPress serves as a headless content backend only (no frontend rendering); custom fields via ACF/Meta Box
- Server Components fetch data; Client Components handle interactivity (animations, carousels, theme toggling)
- DSGVO-compliant cookie consent system integrated at the provider level

## Layers

**Presentation Layer (Pages):**
- Purpose: Route definitions and server-side data fetching; compose page-level UI from section components
- Location: `src/app/`
- Contains: Next.js App Router pages (`page.tsx`), layouts (`layout.tsx`), and colocated client components
- Depends on: WordPress API layer (`src/lib/wordpress/`), Section & UI components (`src/components/`)
- Used by: Next.js router (entry points for all routes)

**Component Layer:**
- Purpose: Reusable UI building blocks organized by domain and function
- Location: `src/components/`
- Contains: React components (both Server and Client components) split into `blog/`, `layout/`, `portfolio/`, `providers/`, `scripts/`, `sections/`, `ui/`
- Depends on: Types (`src/types/`), Utilities (`src/lib/utils/`, `src/lib/utils.ts`), WordPress lib for data types
- Used by: Pages in `src/app/`

**Data Access Layer (WordPress API):**
- Purpose: Typed fetch functions for all WordPress REST API endpoints
- Location: `src/lib/wordpress/`
- Contains: Modular API functions per content type (posts, pages, portfolio, authors, taxonomies, menus, services)
- Depends on: `WORDPRESS_API_URL` environment variable, TypeScript types (`src/types/wordpress.ts`)
- Used by: Page components for SSR/SSG data fetching

**Utility Layer:**
- Purpose: Pure helper functions for content processing, dates, images, cookies
- Location: `src/lib/utils/`, `src/lib/utils.ts`, `src/lib/cookies.ts`, `src/lib/portfolio-utils.ts`
- Contains: HTML processing, date formatting, image helpers, cookie consent, Tailwind `cn()` utility
- Depends on: Nothing (pure functions) or `clsx`/`tailwind-merge`
- Used by: Components and pages throughout

**Type Definitions:**
- Purpose: TypeScript interfaces for WordPress REST API responses and component props
- Location: `src/types/wordpress.ts` (primary, comprehensive), `src/lib/types/wordpress.ts` (legacy duplicate)
- Contains: `WPPost`, `WPPage`, `WPPortfolioItem`, `HomepageMetaBox`, `ContactPageMetaBox`, `ResumeMetaBox`, menu/category types, etc.
- Depends on: Nothing
- Used by: All layers

**Static Data:**
- Purpose: Fallback/default data for components when WordPress data is unavailable
- Location: `src/data/`
- Contains: `services.ts` (default service items with Lucide icons)
- Depends on: Lucide React icons
- Used by: Services section components as fallback

## Data Flow

**Build-Time Static Generation (Primary Flow):**

1. `next build` triggers all page components and `generateStaticParams()` functions
2. `generateStaticParams()` in dynamic routes (e.g., `src/app/blog/[slug]/page.tsx`) calls WordPress API to get all slugs
3. For each slug, the page's `default export` async function fetches full content via `src/lib/wordpress/` functions
4. `fetchWordPress<T>()` in `src/lib/wordpress/api.ts` makes HTTP GET to `WORDPRESS_API_URL/wp-json/wp/v2/{endpoint}`
5. WordPress returns JSON; data is typed and passed as props to React components
6. Components render to static HTML in `out/` directory

**Homepage Data Assembly:**

1. `src/app/page.tsx` calls `Promise.all([getPosts(6), getPortfolioItems(12), getHomePage()])`
2. `getHomePage()` tries: (a) custom `/front-page` endpoint, (b) slug "homepage", (c) slug "home"
3. Custom fields extracted from `page.meta_box || page.acf` (supports both Meta Box and ACF plugins)
4. Fields drive conditional rendering of About, Services, FAQ, Contact, and Blog sections

**Client-Side Interactivity:**

1. Client Components (marked `'use client'`) hydrate after initial static HTML load
2. Theme: `ThemeProvider` (next-themes) auto-selects light/dark based on time of day (6AM-6PM = light)
3. Cookie consent: `CookieConsentProvider` manages DSGVO consent state via browser cookies
4. Animations: GSAP (Header scroll animation), Framer Motion (transitions, mobile menu), Lenis (smooth scroll)
5. Carousels: Embla Carousel (homepage hero, portfolio detail)
6. 3D: Three.js via React Three Fiber (maintenance page scene, hero scene)

**State Management:**
- No global state library; state managed via React Context providers:
  - `ThemeProvider` in `src/components/providers/ThemeProvider.tsx` (dark/light mode)
  - `CookieConsentProvider` in `src/components/providers/CookieConsentProvider.tsx` (consent settings)
- Local component state via `useState`/`useEffect` for UI interactions
- Session storage for preloader shown-once flag (`homePreloaderShown`)

## Key Abstractions

**`fetchWordPress<T>()`:**
- Purpose: Central typed fetch function for all WordPress REST API calls
- Location: `src/lib/wordpress/api.ts`
- Pattern: Generic function with `cache: 'no-store'`, URL building, error handling with `ApiError` type
- All domain modules (`posts.ts`, `pages.ts`, `portfolio.ts`, etc.) are thin wrappers around this

**`fetchCustomEndpoint<T>()`:**
- Purpose: Convenience wrapper for non-standard WP REST endpoints (custom plugin routes)
- Location: `src/lib/wordpress/api.ts`
- Pattern: Calls `fetchWordPress` with `skipRestBase: true` to use `/wp-json/{custom}` paths

**WordPress Page with Custom Fields (ACF/Meta Box):**
- Purpose: Page content + structured custom field data from WordPress
- Location: Type defined in `src/types/wordpress.ts` as `WPPage`
- Pattern: `page.meta_box ?? page.acf` accessor pattern used everywhere to support both plugin types
- Typed via union: `HomepageMetaBox & ContactPageMetaBox & ResumeMetaBox & AboutPageMetaBox & LoadingPageMetaBox & NotFoundPageMetaBox`

**Static Params with Fallback:**
- Purpose: Ensure static export succeeds even when WordPress is unreachable
- Examples: `src/app/blog/[slug]/page.tsx`, `src/app/[slug]/page.tsx`, `src/app/portfolio/[slug]/page.tsx`
- Pattern: `generateStaticParams()` catches API errors, returns sentinel slug (e.g., `__no-posts__`); page renders graceful fallback for sentinel slugs

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Font loading (Geist, Geist Mono, Unbounded, Poppins), metadata, provider wrapping (ThemeProvider > CookieConsentProvider > SmoothScroll), Header/Footer, skip-to-content link

**Homepage:**
- Location: `src/app/page.tsx`
- Triggers: Route `/`
- Responsibilities: Fetches posts, portfolio items, homepage custom fields; renders Hero, About, Selected Works, Services, FAQ, Contact, Blog sections wrapped in `HomePreloaderWrapper`

**Dynamic Page Route:**
- Location: `src/app/[slug]/page.tsx`
- Triggers: Any top-level slug that is a WordPress page (e.g., `/privacy-policy`, `/impressum`)
- Responsibilities: Generic WordPress page rendering with featured image and prose content

**Blog Routes:**
- Location: `src/app/blog/page.tsx` (listing), `src/app/blog/[slug]/page.tsx` (detail)
- Triggers: `/blog`, `/blog/{slug}`

**Portfolio Routes:**
- Location: `src/app/portfolio/page.tsx` (grid with filter), `src/app/portfolio/[slug]/page.tsx` (detail with carousel)
- Triggers: `/portfolio`, `/portfolio/{slug}`

**Category Route:**
- Location: `src/app/category/[slug]/page.tsx`
- Triggers: `/category/{slug}`

**Special Pages:**
- `src/app/about/page.tsx` - About page with Trust section (fetches page by slug "about")
- `src/app/contact/page.tsx` - Contact page (server) + `ContactPageClient.tsx` (client form)
- `src/app/resume/page.tsx` - Resume/CV page with hardcoded data + WordPress title
- `src/app/loading/page.tsx` - Preloader experience page (standalone layout)
- `src/app/maintenance/page.tsx` - Maintenance page with 3D scene (standalone layout)
- `src/app/not-found/Mandala404Client.tsx` - Custom 404 page component

**WordPress API Base:**
- Location: `src/lib/wordpress/api.ts`
- Triggers: Import from any data-fetching module
- Responsibilities: Validates `WORDPRESS_API_URL`, exports `fetchWordPress()`, `buildUrl()`, error handling

## Error Handling

**Strategy:** Defensive fail-soft with console logging; pages show graceful degradation rather than crashes

**Patterns:**
- **API Layer**: Every function in `src/lib/wordpress/*.ts` wraps fetches in try/catch, logs error, returns empty array `[]` or `null`
- **Static Params Fallback**: `generateStaticParams()` includes `.catch(() => [])` and sentinel slugs to prevent build failures
- **Page Level**: Pages check for `null` data and call `notFound()` or render fallback UI
- **Custom Error Types**: `ApiError` interface extends `Error` with `status`, `statusText`, `url` fields in `src/lib/wordpress/api.ts`
- **502 Suppression**: WordPress-unavailable (502) errors get minimal logging to avoid noisy output during local dev
- **Verbose 404 Debugging**: 404 errors from WordPress API trigger detailed troubleshooting guide in console

## Cross-Cutting Concerns

**Theming:**
- `next-themes` with class-based dark mode (`html.dark`)
- CSS custom properties for all colors defined in `src/app/globals.css` (`:root` for light, `html.dark` for dark)
- Time-based auto-theme: `ThemeProvider` in `src/components/providers/ThemeProvider.tsx` sets light (6AM-6PM) or dark
- Manual toggle available in Header component

**Smooth Scrolling:**
- Lenis library initialized in `src/components/layout/SmoothScroll.tsx` (wraps all page content)
- CSS support in `src/app/globals.css` (`.lenis.lenis-smooth`, `.lenis-stopped`, etc.)

**Animation:**
- GSAP with ScrollTrigger for Header homepage animation (`src/components/layout/Header.tsx`)
- Framer Motion for page transitions, mobile menu, and micro-interactions
- CSS custom properties for tilt card effect (`.tilt-card`)

**Cookie Consent (DSGVO):**
- `CookieConsentProvider` context in `src/components/providers/CookieConsentProvider.tsx`
- Cookie utilities in `src/lib/cookies.ts`
- Banner UI: `src/components/ui/CookieConsentBanner.tsx`
- Settings button: `src/components/ui/CookieSettingsButton.tsx`

**Logging:**
- `console.log` for successful API requests (URL, response status, item count)
- `console.error` for API failures with structured context
- `console.warn` for non-critical issues (e.g., missing category, WordPress server down)

**Validation:**
- TypeScript strict mode (`strict: true` in `tsconfig.json`)
- No runtime validation library; relies on TypeScript types and manual null checks

**Build & Deployment:**
- Static export to `out/` directory
- FTP deployment via `scripts/deploy-ftp.mjs` and `scripts/deploy.mjs`
- Production env preparation: `scripts/prepare-live-env.mjs` reads from `conf/start.md`
- Production monitoring: `scripts/monitor-production.mjs`

---

*Architecture analysis: 2025-02-11*

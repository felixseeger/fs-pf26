# Codebase Structure

**Analysis Date:** 2025-02-11

## Directory Layout

```
fs-pf26-main/
├── conf/                       # Deployment and environment configuration docs
├── out/                        # Generated static export (build output, gitignored)
├── public/                     # Static assets served at root (logos, videos, 3D models)
├── scripts/                    # Node.js deployment, monitoring, and env prep scripts
├── src/                        # All application source code
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── [slug]/             # Dynamic catch-all WordPress page route
│   │   ├── about/              # About page
│   │   ├── blog/               # Blog listing and detail pages
│   │   │   └── [slug]/         # Blog post detail
│   │   ├── category/           # Category listing pages
│   │   │   └── [slug]/         # Category detail
│   │   ├── contact/            # Contact page (server + client components)
│   │   ├── loading/            # Preloader experience (standalone layout)
│   │   ├── maintenance/        # Maintenance page with 3D scene (standalone layout)
│   │   ├── not-found/          # Custom 404 page component
│   │   ├── portfolio/          # Portfolio listing and detail pages
│   │   │   └── [slug]/         # Portfolio item detail
│   │   ├── resume/             # Resume/CV page
│   │   ├── globals.css         # Global styles, CSS variables, Tailwind theme
│   │   ├── layout.tsx          # Root layout (fonts, providers, Header, Footer)
│   │   └── page.tsx            # Homepage
│   ├── components/             # Reusable React components
│   │   ├── blog/               # Blog-specific components (PostCard, PostList, etc.)
│   │   ├── layout/             # Layout components (Header, Footer, Hero, SmoothScroll)
│   │   ├── portfolio/          # Portfolio components (Grid, Card, Carousel, Filter)
│   │   ├── providers/          # React Context providers (Theme, CookieConsent)
│   │   ├── scripts/            # Conditional script loading (analytics)
│   │   ├── sections/           # Page section components (Contact, Trust, Services, SelectedWorks)
│   │   ├── ui/                 # Generic UI components (CookieConsentBanner, TiltCard, ScrollToTop, etc.)
│   │   └── HomePreloaderWrapper.tsx  # Preloader wrapper for homepage
│   ├── data/                   # Static fallback data
│   │   └── services.ts         # Default services list with Lucide icons
│   ├── lib/                    # Shared libraries and utilities
│   │   ├── types/              # Legacy type definitions (duplicate of src/types/)
│   │   │   └── wordpress.ts    # Legacy WordPress types (prefer src/types/wordpress.ts)
│   │   ├── utils/              # Domain-specific utility modules
│   │   │   ├── content.ts      # HTML processing, truncation, reading time
│   │   │   ├── date.ts         # Date formatting, relative time, comparisons
│   │   │   ├── image.ts        # Image URL handling, dimensions, placeholders
│   │   │   └── wordpress.ts    # WordPress-specific helpers (featured image, author, excerpt)
│   │   ├── wordpress/          # WordPress REST API client modules
│   │   │   ├── api.ts          # Core fetch function, URL builder, error handling
│   │   │   ├── authors.ts      # Author API functions
│   │   │   ├── index.ts        # Barrel export for all WordPress modules
│   │   │   ├── menus.ts        # Menu/navigation API functions
│   │   │   ├── pages.ts        # Pages API functions (incl. getHomePage)
│   │   │   ├── portfolio.ts    # Portfolio CPT API functions
│   │   │   ├── posts.ts        # Posts API functions
│   │   │   ├── services.ts     # Services CPT API functions
│   │   │   └── taxonomies.ts   # Categories and tags API functions
│   │   ├── cookies.ts          # Cookie consent utility functions (DSGVO)
│   │   ├── portfolio-utils.ts  # Portfolio category extraction and filtering
│   │   └── utils.ts            # Tailwind cn() merge utility
│   └── types/                  # Primary TypeScript type definitions
│       └── wordpress.ts        # All WordPress API types, custom field types, component props
├── tests/                      # Test specifications
├── uploads/                    # Media uploads for WordPress content migration
├── wordpress-*.php             # PHP snippets for WordPress backend customization
├── .env.example                # Environment variable template
├── dns-fix.js                  # DNS resolution fix for local WordPress dev
├── next.config.ts              # Next.js configuration (static export, image patterns)
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS config (Tailwind CSS)
├── tsconfig.json               # TypeScript configuration
└── pnpm-lock.yaml              # pnpm lockfile
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router - all routes, pages, and layouts
- Contains: `page.tsx` (route pages), `layout.tsx` (nested layouts), colocated client components
- Key files: `layout.tsx` (root layout with all providers), `page.tsx` (homepage), `globals.css` (theme variables)

**`src/components/blog/`:**
- Purpose: Blog-specific presentation components
- Contains: `PostCard.tsx`, `PostList.tsx`, `PostMeta.tsx`, `AuthorCard.tsx`, `CategoryList.tsx`, `EmptyState.tsx`, `FeaturedImage.tsx`, `PostListSkeleton.tsx`

**`src/components/layout/`:**
- Purpose: Structural layout components used across the site
- Contains: `Header.tsx` (with GSAP animation), `Footer.tsx` (with WP menu), `SmoothScroll.tsx` (Lenis), `HomepageHero.tsx` (Embla carousel), `HomepageHeroCarousel.tsx`, `BlogHero.tsx`, `CategoryPageHero.tsx`, `HeroThreeScene.tsx` (Three.js), `MobileMenu.tsx`, `ThemeLogo.tsx`

**`src/components/portfolio/`:**
- Purpose: Portfolio display and filtering components
- Contains: `PortfolioCard.tsx`, `PortfolioGrid.tsx`, `PortfolioGridWithFilter.tsx`, `PortfolioCategoryFilter.tsx`, `PortfolioCarousel.tsx` (Embla + lightbox)

**`src/components/providers/`:**
- Purpose: React Context providers wrapping the app
- Contains: `ThemeProvider.tsx` (next-themes + time-based auto), `CookieConsentProvider.tsx` (DSGVO consent), `UnhandledRejectionHandler.tsx`

**`src/components/sections/`:**
- Purpose: Large page sections used primarily on the homepage and about page
- Contains: `ContactSection.tsx`, `TrustSection.tsx`, `SelectedWorksSection.tsx`, `ServicesSection.tsx`

**`src/components/ui/`:**
- Purpose: Generic, reusable UI primitives
- Contains: `CookieConsentBanner.tsx`, `CookieSettingsButton.tsx`, `ErrorMessage.tsx`, `LiquidGradientBackground.tsx` (canvas), `LoadingSkeleton.tsx`, `MandalaBackground.tsx` (canvas), `PreloaderAnimation.tsx`, `ScrollToTop.tsx`, `ThemeToggle.tsx`, `TiltCard.tsx`

**`src/lib/wordpress/`:**
- Purpose: WordPress REST API client layer - all data fetching
- Contains: One module per content type, barrel-exported through `index.ts`
- Key files: `api.ts` (core `fetchWordPress<T>()`), `pages.ts` (includes `getHomePage()` with fallback logic)

**`src/lib/utils/`:**
- Purpose: Domain-specific pure utility functions
- Contains: `content.ts` (HTML/text processing), `date.ts` (formatting), `image.ts` (URL/dimension helpers), `wordpress.ts` (WP-specific content helpers)

**`src/types/`:**
- Purpose: Primary TypeScript type definitions for the application
- Contains: `wordpress.ts` - comprehensive types for all WordPress content types, custom fields (ACF/Meta Box), and component props

**`conf/`:**
- Purpose: Deployment configuration and documentation
- Contains: `DEPLOYMENT.md`, `LIVE-vs-LOCAL-comparison.md`, `start.md` (production backend URL)

**`scripts/`:**
- Purpose: Node.js scripts for deployment and operations
- Contains: `deploy-ftp.mjs` (FTP upload), `deploy.mjs` (deployment), `prepare-live-env.mjs` (env file generation), `monitor-production.mjs` (health checks), `ftp.env.example`

**`uploads/`:**
- Purpose: Media assets for WordPress content migration
- Contains: Portfolio project images organized by project name
- Generated: No (manually placed)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout - fonts, providers, Header/Footer shell
- `src/app/page.tsx`: Homepage - fetches and composes all homepage sections
- `src/lib/wordpress/api.ts`: WordPress API base - validates env, exports core fetch

**Configuration:**
- `next.config.ts`: Static export mode, ESLint bypass, remote image patterns for WordPress
- `tsconfig.json`: Strict mode, `@/*` path alias mapping to `./src/*`
- `postcss.config.mjs`: Tailwind CSS PostCSS plugin
- `src/app/globals.css`: CSS custom properties (HSL color tokens), dark mode, glass utilities, Lenis CSS
- `.env.example`: Required `WORDPRESS_API_URL` variable template

**Core Logic:**
- `src/lib/wordpress/api.ts`: `fetchWordPress<T>()`, `fetchCustomEndpoint<T>()`, `buildUrl()`, `handleApiError()`
- `src/lib/wordpress/pages.ts`: `getHomePage()` with triple-fallback strategy (front-page endpoint, "homepage" slug, "home" slug)
- `src/lib/wordpress/portfolio.ts`: `getPortfolioItems()`, `extractImagesFromContent()`
- `src/lib/cookies.ts`: DSGVO cookie consent read/write/clear
- `src/lib/portfolio-utils.ts`: Category extraction from embedded terms, client-side filtering

**Styling:**
- `src/app/globals.css`: All theme tokens, dark mode overrides, glass effects, tilt card CSS, Lenis integration
- Tailwind utility classes used inline throughout components

**Testing:**
- `tests/portfolio-carousel.test.spec.md`: Test specification (markdown, not executable)

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention within route directories)
- Layouts: `layout.tsx` (Next.js convention)
- Components: PascalCase (e.g., `PostCard.tsx`, `HomepageHero.tsx`, `PortfolioGridWithFilter.tsx`)
- Colocated client components: PascalCase, often suffixed with `Client` (e.g., `ContactPageClient.tsx`, `PreloaderClient.tsx`, `MaintenanceScene.tsx`)
- Lib modules: camelCase or kebab-case (e.g., `api.ts`, `portfolio-utils.ts`, `cookies.ts`)
- Utility modules: camelCase (e.g., `content.ts`, `date.ts`, `image.ts`)
- Type files: camelCase (e.g., `wordpress.ts`)
- Scripts: kebab-case with `.mjs` extension (e.g., `deploy-ftp.mjs`, `monitor-production.mjs`)

**Directories:**
- Route segments: kebab-case (e.g., `blog/`, `not-found/`)
- Dynamic segments: `[slug]/` (Next.js convention)
- Component groups: kebab-case (e.g., `blog/`, `layout/`, `ui/`, `providers/`, `sections/`)

**Exports:**
- Components: default export with PascalCase name
- API functions: named exports with camelCase (e.g., `getPosts`, `getPageBySlug`, `fetchWordPress`)
- Types: named exports with PascalCase prefixed with `WP` for WordPress types (e.g., `WPPost`, `WPPage`, `WPPortfolioItem`)
- Utilities: named exports with camelCase (e.g., `formatDate`, `stripHtml`, `cn`)

## Where to Add New Code

**New Page Route:**
- Create directory under `src/app/{route-name}/`
- Add `page.tsx` (async server component that fetches data)
- If client interactivity needed, create colocated `{Name}Client.tsx` with `'use client'` directive
- If standalone layout needed (no Header/Footer), add `layout.tsx` in the route directory
- Add `generateStaticParams()` with `.catch(() => [])` fallback for dynamic routes
- Add `generateMetadata()` for SEO

**New WordPress Content Type:**
- Add type interface to `src/types/wordpress.ts`
- Create new module `src/lib/wordpress/{content-type}.ts` using `fetchWordPress<T>()` from `api.ts`
- Add export to `src/lib/wordpress/index.ts`
- Use in page components

**New Reusable Component:**
- Determine category: `blog/`, `portfolio/`, `layout/`, `sections/`, `ui/`
- Create `src/components/{category}/{ComponentName}.tsx`
- Use PascalCase filename matching component name
- Add `'use client'` directive only if component needs interactivity (state, effects, event handlers)
- Import types from `src/types/wordpress.ts`

**New Section Component:**
- Create in `src/components/sections/{SectionName}.tsx`
- Accept props for WordPress custom field data
- Follow pattern: receive data as props, render conditionally, use Tailwind for styling

**New Utility Function:**
- General-purpose: add to appropriate file in `src/lib/utils/` (`content.ts`, `date.ts`, `image.ts`)
- WordPress-specific: add to `src/lib/utils/wordpress.ts`
- New utility domain: create `src/lib/utils/{domain}.ts`
- Tailwind helpers: add to `src/lib/utils.ts`

**New Provider/Context:**
- Create in `src/components/providers/{Name}Provider.tsx`
- Export provider component and `use{Name}()` hook
- Add to provider tree in `src/app/layout.tsx`

**New WordPress Custom Fields:**
- Add field type interface to `src/types/wordpress.ts`
- Add to union type on `WPPage.acf` and `WPPage.meta_box`
- Access in pages via `page.meta_box ?? page.acf` pattern

**New Deployment Script:**
- Create in `scripts/{script-name}.mjs`
- Add npm script to `package.json` under `scripts`

## Special Directories

**`out/`:**
- Purpose: Static export build output (HTML, CSS, JS, assets)
- Generated: Yes (by `next build`)
- Committed: No (should be gitignored, deployed via FTP scripts)

**`.next/`:**
- Purpose: Next.js build cache and dev server artifacts
- Generated: Yes
- Committed: No

**`uploads/`:**
- Purpose: Media files for migration to WordPress backend
- Generated: No (manually managed)
- Committed: Yes

**`conf/`:**
- Purpose: Deployment configuration docs and backend URL
- Generated: No
- Committed: Yes
- Key file: `start.md` - used by `prepare-live-env.mjs` to generate `.env.production.local`

**`public/`:**
- Purpose: Static files served at site root
- Contains: `logo-dark.svg`, `logo-light.svg`, `logo.png`, `fs-pf-26.mp4` (hero video), `portrait.glb` (3D model), SVG icons
- Generated: No
- Committed: Yes

**`.planning/`:**
- Purpose: GSD planning and codebase analysis documents
- Generated: By tooling
- Committed: Varies

**`.claude/`:**
- Purpose: Claude Code configuration
- Generated: By tooling
- Committed: Yes

---

*Structure analysis: 2025-02-11*

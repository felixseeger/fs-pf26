# External Integrations

**Analysis Date:** 2025-02-11

## APIs & External Services

**WordPress REST API (Primary Data Source):**
- Purpose: Headless CMS providing all content (posts, pages, portfolio, menus, taxonomies, services, custom fields)
- SDK/Client: Native `fetch()` wrapped in `src/lib/wordpress/api.ts` (`fetchWordPress<T>()`)
- Auth: Public read-only REST API (no authentication required)
- Base URL env var: `WORDPRESS_API_URL`
- REST base path: `/wp-json/wp/v2`
- Custom endpoint: `/wp-json/wp/v2/front-page` (requires PHP plugin: `wordpress-front-page-api.php`)

**WordPress API Modules:**
- `src/lib/wordpress/api.ts` - Core fetch utility (`fetchWordPress<T>()`, `fetchCustomEndpoint<T>()`, `buildUrl()`, error handling)
- `src/lib/wordpress/posts.ts` - `getPosts()`, `getPostBySlug()`, `getPostsByCategory()`
- `src/lib/wordpress/pages.ts` - `getPages()`, `getPageBySlug()`, `getPageById()`, `getHomePage()`
- `src/lib/wordpress/portfolio.ts` - `getPortfolioItems()`, `getPortfolioItemBySlug()`, `getPortfolioAttachments()`, `extractImagesFromContent()`
- `src/lib/wordpress/taxonomies.ts` - `getCategories()`, `getCategoryBySlug()`, `getCategoryById()`, `getTags()`, `getTagBySlug()`, `getTagById()`
- `src/lib/wordpress/menus.ts` - `getMenuItems()`, `getNavigations()` (uses WP v2 navigation endpoint)
- `src/lib/wordpress/authors.ts` - `getAuthors()`, `getAuthorById()`, `getAuthorBySlug()`, `getPostsByAuthor()`
- `src/lib/wordpress/services.ts` - `getServices()`, `getServiceBySlug()` (custom post type)
- `src/lib/wordpress/index.ts` - Barrel re-export of all modules

**WordPress REST Endpoints Used:**
| Endpoint | Module | Purpose |
|----------|--------|---------|
| `/wp/v2/posts` | posts.ts | Blog posts |
| `/wp/v2/pages` | pages.ts | Static pages |
| `/wp/v2/portfolio` | portfolio.ts | Portfolio CPT |
| `/wp/v2/services` | services.ts | Services CPT |
| `/wp/v2/categories` | taxonomies.ts | Post categories |
| `/wp/v2/tags` | taxonomies.ts | Post tags |
| `/wp/v2/users` | authors.ts | Author profiles |
| `/wp/v2/navigation` | menus.ts | Block navigation menus |
| `/wp/v2/media` | portfolio.ts | Media attachments |
| `/wp/v2/front-page` | pages.ts | Custom: static front page ID |

**Google Analytics (Conditional):**
- Purpose: Website analytics tracking
- Implementation: `src/components/scripts/ConditionalScript.tsx` (`GoogleAnalytics` component)
- SDK: Google Tag Manager script loaded dynamically via `document.createElement('script')`
- Auth: Measurement ID passed as prop (not yet configured in layout)
- Consent-gated: Only loads when user grants `analytics` cookie consent
- DSGVO compliance: `anonymize_ip: true` enabled

## Data Storage

**Databases:**
- None directly accessed by the Next.js frontend
- All data comes from WordPress REST API (WordPress uses MySQL/MariaDB on the backend)

**File Storage:**
- WordPress Media Library (accessed via WP REST API `/wp/v2/media`)
- Remote image hosting: `fs26-back.felixseeger.de/wp-content/uploads/**`
- Local static assets: `public/` directory (e.g., `portrait.glb` 3D model)
- No direct file storage service (S3, Cloudflare R2, etc.)

**Caching:**
- No explicit caching layer
- All WordPress API requests use `cache: 'no-store'` (no caching in `src/lib/wordpress/api.ts`)
- Static export means all data is fetched at build time and baked into HTML

## Authentication & Identity

**Auth Provider:**
- None for the frontend (public website)
- WordPress REST API is accessed without authentication (public endpoints only)
- No user login, registration, or session management on the frontend

**Cookie Consent (DSGVO/GDPR):**
- Custom implementation (no third-party service)
- Provider: `src/components/providers/CookieConsentProvider.tsx`
- Utilities: `src/lib/cookies.ts`
- Categories: `essential` (always on), `analytics`, `marketing`, `preferences`
- Cookie name: `cookie_consent`
- Consent version: `1.0` (forces re-consent on version change)
- Expiry: 365 days
- Clears known tracking cookies on rejection: `_ga`, `_gid`, `_gat`, `_fbp`, `_fbc`, `_gcl_au`

## Theme & Dark Mode

**Provider:**
- `next-themes` ^0.4.6
- Implementation: `src/components/providers/ThemeProvider.tsx`
- Strategy: Class-based (`attribute="class"`)
- Default: `dark`
- Auto-switching: Time-based (light 6:00-18:00, dark 18:00-6:00), set on mount
- System preference: Disabled (`enableSystem={false}`)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Bugsnag, or similar)
- Console logging in WordPress API error handler (`src/lib/wordpress/api.ts`)
- Detailed 404 troubleshooting output in console

**Logs:**
- `console.log` / `console.error` / `console.warn` throughout WordPress API layer
- No structured logging framework
- API requests log: URL, response status, data count

**Production Monitoring:**
- Custom script: `scripts/monitor-production.mjs`
- Checks: Frontend reachability, content presence, WordPress REST API types, posts count, homepage source
- Output: JSON (`--json` flag) or human-readable
- Invoked via: `pnpm monitor` / `pnpm monitor:json` / `pnpm monitor:insecure`

## CI/CD & Deployment

**Hosting:**
- Static files served from: `fs26-front.felixseeger.de` (shared hosting via KAS Server/All-Inkl)
- WordPress backend: `fs26-back.felixseeger.de` (separate subdomain)

**CI Pipeline:**
- None detected (no `.github/workflows/`, no `Jenkinsfile`, no `vercel.json`)
- Manual deployment via `pnpm deploy`

**Deploy Method:**
- FTP/FTPS upload via `basic-ftp` package
- Script: `scripts/deploy-ftp.mjs`
- Credentials source (in priority order):
  1. `.env.ftp` (KEY=VALUE format)
  2. `conf/ftp.env`
  3. `conf/start.md` (structured markdown format)
- FTP host: `w0105bd5.kasserver.com` (from `scripts/ftp.env.example`)
- Remote path: `/fs26-front.felixseeger.de/`
- Supports FTPS (implicit on port 990, explicit otherwise), plain FTP via `FTP_SECURE=false`

**Build Output:**
- Static export to `out/` directory
- Pre-build: `scripts/prepare-live-env.mjs` generates `.env.production.local` from `conf/start.md`

## WordPress Backend Requirements

**Custom Post Types (expected in WordPress):**
- `portfolio` - Portfolio items (accessed at `/wp/v2/portfolio`)
- `services` - Service listings (accessed at `/wp/v2/services`)

**Custom Fields Framework:**
- Supports both Meta Box and ACF (Advanced Custom Fields) / SCF (Secure Custom Fields)
- Fields accessed via `meta_box` or `acf` property on WP pages
- Type definitions: `src/types/wordpress.ts` (`HomepageMetaBox`, `ContactPageMetaBox`, `ResumeMetaBox`, `AboutPageMetaBox`, `LoadingPageMetaBox`, `NotFoundPageMetaBox`)

**Homepage Custom Fields (`HomepageMetaBox`):**
- Hero: `hero_title`, `hero_subtitle`, `hero_background`
- About: `about_title`, `about_content`, `about_image`
- Services: `services_title`, `services[]` (title, description, icon)
- FAQ: `faq_title`, `faq_items[]` (question, answer)
- Contact: `contact_title`, `contact_content`, `contact_email`, `contact_phone`, `contact_office_city`, `contact_office_country`
- Social: `social_links[]` (platform, url)

**Custom REST Endpoint:**
- Plugin file: `wordpress-front-page-api.php` (must be added to theme `functions.php`)
- Registers: `GET /wp-json/wp/v2/front-page`
- Returns: `{ id: number }` of the static front page
- Fallback if not installed: Fetches page by slug `homepage` or `home`

**WordPress Permalinks:**
- Must be set to anything other than "Plain" (REST API requirement)
- REST API must not be disabled by security plugins

## Environment Configuration

**Required env vars:**
- `WORDPRESS_API_URL` - WordPress backend base URL (no trailing slash). Example: `https://fs26-back.felixseeger.de`

**Optional env vars:**
- `NEXT_IMAGE_UNOPTIMIZED` - Set to `true` for static export (auto-set by `prepare-live-env.mjs`)

**FTP credentials (for deployment only):**
- `FTP_HOST` / `FTP_HOSTNAME` - FTP server hostname
- `FTP_USER` / `FTP_USERNAME` - FTP username
- `FTP_PASSWORD` / `FTP_PASS` - FTP password
- `FTP_PATH` / `FTP_REMOTE_PATH` - Remote upload path (default: `/`)
- `FTP_PORT` - FTP port (default: `21`)
- `FTP_SECURE` - Set to `false` for plain FTP
- `FTP_VERBOSE` - Set to `1` for verbose FTP logging

**Secrets location:**
- `.env.local` - Local development (gitignored via `.env*` pattern)
- `.env.production.local` - Production build (auto-generated, gitignored)
- `.env.ftp` or `conf/ftp.env` - FTP credentials (gitignored)
- `conf/start.md` - Contains backend URL, FTP credentials (entire `conf/` directory gitignored)

## Webhooks & Callbacks

**Incoming:**
- None. No API routes in the Next.js app (static export mode does not support API routes)
- Contact form submission is currently a simulated stub (`src/components/sections/ContactSection.tsx` line 49: `await new Promise(resolve => setTimeout(resolve, 1000))`)

**Outgoing:**
- None. All data flow is pull-based (fetch from WordPress REST API at build time)

## 3D Assets

**GLTF Models:**
- `public/portrait.glb` - 3D portrait model loaded in `src/components/layout/HeroThreeScene.tsx`
- Loaded via `@react-three/drei` `useGLTF` hook with preloading

**WebGL Shaders:**
- Custom liquid gradient fragment shader in `src/components/ui/LiquidGradientBackground.tsx`
- Uses touch/mouse input for interactive distortion via canvas-based `TouchTexture` class

## Google Fonts

**Loaded via `next/font/google` in `src/app/layout.tsx`:**
- Geist Sans (variable: `--font-geist-sans`)
- Geist Mono (variable: `--font-geist-mono`)
- Unbounded (variable: `--font-unbounded`) - Used for headings
- Poppins weights 300-800 (variable: `--font-poppins`) - Used for body text

---

*Integration audit: 2025-02-11*

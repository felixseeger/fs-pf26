# Codebase Concerns

**Analysis Date:** 2025-02-11

## Tech Debt

**Contact Form Submissions are Simulated (Not Functional):**
- Issue: Both contact forms use `await new Promise(resolve => setTimeout(resolve, 1000))` instead of an actual API call. Submissions are faked - data is never sent anywhere.
- Files: `src/components/sections/ContactSection.tsx` (line 49), `src/app/contact/ContactPageClient.tsx` (line 99)
- Impact: Users filling out contact forms receive a "Message Sent!" confirmation but no message is actually sent. This is a critical user-facing gap.
- Fix approach: Implement a real form submission endpoint. Options: (a) WordPress REST API endpoint for form submissions, (b) Serverless function / API route (not available with `output: 'export'`), (c) Third-party form service (Formspree, Basin, etc.), or (d) `mailto:` link as interim fix.

**Duplicate WordPress Type Definitions:**
- Issue: WordPress types are defined in two places with overlapping but divergent content. `src/types/wordpress.ts` (358 lines) has full types including ACF/Meta Box fields, while `src/lib/types/wordpress.ts` (161 lines) has a simpler subset. The project imports from `src/types/wordpress.ts` in most places.
- Files: `src/types/wordpress.ts`, `src/lib/types/wordpress.ts`
- Impact: Confusion about which type file to use. Divergence risk when adding new types. The `src/lib/types/wordpress.ts` version of `WPPage` lacks `acf`/`meta_box` fields.
- Fix approach: Delete `src/lib/types/wordpress.ts` and ensure all imports use `@/types/wordpress`. The `src/lib/types/` version appears to be an earlier iteration.

**Hardcoded Resume Data:**
- Issue: The resume page contains a large block of hardcoded work experience, education, and skill data instead of reading from WordPress ACF/Meta Box fields.
- Files: `src/app/resume/page.tsx` (lines 78-150)
- Impact: Content updates require code changes and redeployment. The `ResumeMetaBox` type exists in `src/types/wordpress.ts` but is not used by the resume page.
- Fix approach: Read `page.meta_box` or `page.acf` resume fields, falling back to current hardcoded data if fields are empty.

**Hardcoded Contact Page Data:**
- Issue: Contact page has extensive hardcoded fallback data including physical address, phone number, email, service options, and repeated feature text ("We Give Unparalleled Flexibility" x4).
- Files: `src/app/contact/page.tsx` (lines 16-53)
- Impact: The duplicated feature text looks like placeholder content. Address and phone data should come from WordPress only.
- Fix approach: Remove or improve fallback data. The repeated feature strings are clearly placeholders that should be replaced.

**Hardcoded Navigation Links:**
- Issue: Header navigation links are hardcoded rather than sourced from WordPress menus.
- Files: `src/components/layout/Header.tsx` (lines 17-22)
- Impact: Adding or reordering nav items requires code changes. The codebase already has `getMenuItems()` in `src/lib/wordpress/menus.ts` but the Header does not use it (the Footer does).
- Fix approach: Fetch primary navigation from WordPress and fall back to hardcoded links if unavailable, following the same pattern as `src/components/layout/Footer.tsx`.

**Hardcoded Social Media Links (Placeholder URLs):**
- Issue: Footer social links point to root domains (`https://twitter.com`, `https://github.com`, `https://linkedin.com`) instead of actual profile URLs.
- Files: `src/components/layout/Footer.tsx` (lines 96, 107, 118)
- Impact: Social links are non-functional for users. They navigate to the platform homepages, not the owner's profiles.
- Fix approach: Use social links from WordPress ACF `social_links` field (already typed in `HomepageMetaBox`) or hardcode actual profile URLs.

**ESLint Disabled During Builds:**
- Issue: `next.config.ts` sets `eslint: { ignoreDuringBuilds: true }`, meaning lint errors do not prevent builds.
- Files: `next.config.ts` (line 5)
- Impact: Broken lint rules go unnoticed in production builds. Potential for code quality regression.
- Fix approach: Remove `ignoreDuringBuilds: true` and fix any lint errors that surface.

**Excessive `suppressHydrationWarning` Usage:**
- Issue: 82 occurrences of `suppressHydrationWarning` across 17 files. Many are on static elements like `<div>`, `<section>`, and `<header>` where hydration mismatches should not occur.
- Files: `src/app/page.tsx` (21 occurrences), `src/components/sections/ContactSection.tsx` (18), `src/components/layout/Footer.tsx` (7), and 14 other files
- Impact: Masks real hydration bugs. The attribute should only be needed on elements with dynamic client-side content (e.g., theme-dependent content). Overuse indicates an underlying hydration issue that was suppressed rather than fixed.
- Fix approach: Remove `suppressHydrationWarning` from static elements. Keep only where truly needed (e.g., `<html>` tag for theme provider, elements with `Date.now()`). Investigate and fix the root cause of hydration mismatches.

**Untracked Debug/Test Files in Root:**
- Issue: Several debug/test files exist in the project root that are not gitignored: `homepage_response.json`, `homepage_check.json`, `homepage_embed.json`, `deploy-test-homepage.png` (1.8MB), `C:devfs-pf26homepage_response.json` (malformed filename from a path error).
- Files: Root directory: `homepage_response.json`, `homepage_check.json`, `homepage_embed.json`, `deploy-test-homepage.png`, `C:devfs-pf26homepage_response.json`
- Impact: Clutter in root directory. The PNG is 1.8MB of wasted space. The `C:devfs-pf26...` filename suggests a bug in a script that used a Windows path as a filename.
- Fix approach: Add these to `.gitignore` or delete them. At minimum, add `*.json` debug files and test screenshots to gitignore.

**Dual Package Lockfiles:**
- Issue: Both `package-lock.json` and `pnpm-lock.yaml` exist in the project root.
- Files: `package-lock.json`, `pnpm-lock.yaml`
- Impact: Ambiguity about which package manager is canonical. Risk of dependency drift between lockfiles.
- Fix approach: Choose one package manager (pnpm based on scripts using `pnpm`). Delete `package-lock.json` and add it to `.gitignore`.

## Known Bugs

**Menu HTML Parsing via Regex is Fragile:**
- Symptoms: Navigation menus parsed from WordPress block content using regex may miss items or break on nested/complex HTML structures.
- Files: `src/lib/wordpress/menus.ts` (lines 44-73, `parseNavigationHTML()`)
- Trigger: WordPress block editor producing navigation HTML that doesn't match the regex pattern `/<a[^>]*href="([^"]*)"[^>]*>(?:<span[^>]*>)?([^<]+)(?:<\/span>)?<\/a>/g`
- Workaround: Falls back to empty array; Footer shows hardcoded links.

**`as any` Type Assertion in FeaturedImage:**
- Symptoms: Unsafe type cast to access nested caption data from WordPress API response.
- Files: `src/components/blog/FeaturedImage.tsx` (line 89)
- Trigger: Always present. The `featuredMedia` object is cast to `any` to access `caption.rendered`.
- Workaround: Works in practice but bypasses type safety.

## Security Considerations

**Extensive Use of `dangerouslySetInnerHTML` with WordPress Content:**
- Risk: Cross-Site Scripting (XSS) if WordPress content contains malicious scripts. WordPress content is rendered as raw HTML in 25+ locations across the codebase.
- Files: `src/app/blog/[slug]/page.tsx` (lines 104, 137), `src/app/[slug]/page.tsx` (lines 83, 103), `src/app/about/page.tsx` (lines 37, 43), `src/app/page.tsx` (lines 87, 184), `src/components/blog/PostList.tsx` (lines 160, 165, 240, 245), `src/components/blog/PostCard.tsx` (lines 46, 52), `src/components/portfolio/PortfolioCard.tsx` (lines 48, 55), `src/app/portfolio/[slug]/page.tsx` (lines 125, 144), `src/components/layout/HomepageHero.tsx` (lines 199, 204), `src/components/layout/HomepageHeroCarousel.tsx` (line 118), `src/components/sections/SelectedWorksSection.tsx` (line 59), `src/app/resume/page.tsx` (lines 156, 278)
- Current mitigation: WordPress sanitizes output by default. Content comes from a trusted CMS backend. The codebase also uses `html-react-parser` in `src/lib/utils/content.ts` but it is not used for the main content rendering.
- Recommendations: Use `html-react-parser` (already installed) with a DOMPurify or sanitization step instead of `dangerouslySetInnerHTML`. At minimum, sanitize title fields that use `dangerouslySetInnerHTML` (titles should never contain HTML tags in practice).

**Inline Script in Layout for Unhandled Rejection Suppression:**
- Risk: Inline script in `<body>` uses `dangerouslySetInnerHTML` to inject JavaScript. While the script is authored by the developer, this pattern bypasses CSP protections.
- Files: `src/app/layout.tsx` (lines 59-63)
- Current mitigation: Script content is static and controlled.
- Recommendations: Use a nonce-based CSP if deploying behind a server, or move to the `UnhandledRejectionHandler` component (which already exists at `src/components/providers/UnhandledRejectionHandler.tsx`). The inline script appears redundant with the component.

**FTP Deployment with `rejectUnauthorized: false`:**
- Risk: TLS certificate validation is disabled for FTP deployment, making it vulnerable to MITM attacks.
- Files: `scripts/deploy-ftp.mjs` (line 102)
- Current mitigation: Deployment is a developer-initiated action, not automated.
- Recommendations: Use proper TLS certificate validation or switch to SFTP/SCP deployment.

**WordPress API URL Exposed in Console Logs:**
- Risk: Every API request logs the full URL including the WordPress backend hostname to the console.
- Files: `src/lib/wordpress/api.ts` (lines 164, 176, 202-204)
- Current mitigation: Static export means these logs only appear during build time, not in production browsers.
- Recommendations: Reduce log verbosity. Use `debug` level logging or remove in production builds.

## Performance Bottlenecks

**Multiple WebGL/Three.js Instances Running Simultaneously:**
- Problem: `LiquidGradientBackground` creates a full Three.js WebGL renderer with shader on every page (it is in the Header). `MandalaBackground` creates a separate raw WebGL context. `MaintenanceScene` (470 lines) creates another Three.js scene with post-processing. On the homepage, the Header's `LiquidGradientBackground` runs alongside any page-specific Three.js content.
- Files: `src/components/ui/LiquidGradientBackground.tsx` (431 lines), `src/components/ui/MandalaBackground.tsx` (179 lines), `src/app/maintenance/MaintenanceScene.tsx` (470 lines)
- Cause: Each component creates its own WebGL context and runs its own `requestAnimationFrame` loop. `LiquidGradientBackground` specifically requests `powerPreference: 'high-performance'` and runs at full frame rate.
- Improvement path: Add GPU detection and disable WebGL backgrounds on low-end devices. Use `IntersectionObserver` to pause animation loops when off-screen. Consider sharing a single Three.js renderer. Add a reduced-motion media query check.

**No API Response Caching:**
- Problem: All WordPress API calls use `cache: 'no-store'`, meaning every build-time request fetches fresh data.
- Files: `src/lib/wordpress/api.ts` (line 27, `DEFAULT_FETCH_OPTIONS`)
- Cause: Explicit no-cache policy to ensure fresh data during builds.
- Improvement path: For static export, caching doesn't matter at runtime (pages are pre-rendered). But during builds with many pages, redundant fetches to the same endpoints slow down builds. Add request deduplication or in-memory caching during builds.

**Large CSS Bundle with `!important` Overrides:**
- Problem: Dark mode CSS variables all use `!important` declarations, increasing specificity and making overrides difficult.
- Files: `src/app/globals.css` (lines 66-80+)
- Cause: Competing specificity between Tailwind dark mode and theme provider.
- Improvement path: Fix the specificity issue at the source (likely the `@custom-variant dark` directive) instead of using `!important`.

## Fragile Areas

**Homepage Data Loading:**
- Files: `src/app/page.tsx`, `src/lib/wordpress/pages.ts` (`getHomePage()`)
- Why fragile: Homepage content depends on a chain of fallbacks: (1) custom `/front-page` endpoint, (2) page with slug "homepage", (3) page with slug "home". The `acf` fields are accessed via `homePage?.meta_box || homePage?.acf` - if WordPress switches field plugin, data structure may change.
- Safe modification: Always test with both Meta Box and ACF field structures. Ensure fallback slugs exist.
- Test coverage: None. No automated tests exist.

**Header GSAP Animation (Home Page Only):**
- Files: `src/components/layout/Header.tsx` (lines 47-220)
- Why fragile: 170+ lines of imperative GSAP animation with pixel-precise positioning (`x: -255`, `x: 255`, `x: -350`, etc.). Depends on 7 refs all being present. Only runs on desktop (`window.innerWidth >= 768`) and only on homepage (`pathname === '/'`). Any layout change to the header breaks animations.
- Safe modification: Test on multiple screen sizes. Any change to nav link count or header structure requires recalculating all GSAP position values.
- Test coverage: None.

**Static Export with Dynamic Route Fallbacks:**
- Files: `src/app/blog/[slug]/page.tsx`, `src/app/[slug]/page.tsx`, `src/app/portfolio/[slug]/page.tsx`, `src/app/category/[slug]/page.tsx`
- Why fragile: `generateStaticParams()` uses `.catch(() => [])` and generates dummy slugs like `__no-posts__`, `__no-pages__`, `__no-items__` when the WordPress API is unavailable at build time. A build without WordPress produces a broken site with only fallback pages.
- Safe modification: Always ensure WordPress backend is running during builds. The fallback slug approach is a workaround for Next.js static export requirements.
- Test coverage: None.

**WordPress Custom Field Access Pattern:**
- Files: `src/app/page.tsx` (line 33), `src/app/contact/page.tsx` (line 63)
- Why fragile: Custom fields are accessed as `page.meta_box || page.acf` - a single pattern handles both Meta Box and ACF plugins. Fields are then accessed without type narrowing (e.g., `acf.about_content`, `acf.services`). Switching WordPress field plugins or renaming fields silently breaks sections.
- Safe modification: Add runtime validation for required fields. Log warnings when expected fields are missing.
- Test coverage: None.

## Scaling Limits

**Static Export Architecture:**
- Current capacity: Handles the current portfolio/blog site well. All pages pre-rendered at build time.
- Limit: Cannot add dynamic features (user comments, real-time search, authenticated areas, form submission APIs) without changing the architecture. `output: 'export'` in `next.config.ts` means no API routes, no middleware, no server-side rendering.
- Scaling path: Switch to server-rendered Next.js (remove `output: 'export'`) if dynamic features are needed. Or use external services (Formspree for forms, Algolia for search) with static export.

**WordPress as Sole Data Source:**
- Current capacity: Works for a single-author portfolio/blog site.
- Limit: All content fetches hit the WordPress REST API. No CDN caching layer. Build times scale linearly with content volume (each page = API call).
- Scaling path: Add WPGraphQL for batched queries. Use ISR (Incremental Static Regeneration) instead of full static export.

## Dependencies at Risk

**Three.js + React Three Fiber (Heavy Bundle):**
- Risk: Three.js adds ~600KB to the client bundle. Used only for decorative background effects (gradient, mandala, maintenance scene). High cost for visual flair.
- Impact: Increased initial load time, especially on mobile. Three separate components import Three.js independently.
- Migration plan: Replace with CSS animations or lightweight canvas-based alternatives for gradient backgrounds. Keep Three.js only if the 3D maintenance scene is essential.

**GSAP (Animation Library):**
- Risk: GSAP licensing changed in recent versions. The free tier has restrictions for some use cases. Currently using `^3.12.5`.
- Impact: Header animation depends entirely on GSAP + ScrollTrigger. Would need full rewrite to replace.
- Migration plan: Framer Motion (already installed) could replace most GSAP usage. The scroll-triggered header animation is the main blocker.

## Missing Critical Features

**No Contact Form Backend:**
- Problem: Contact forms simulate submission but never send data anywhere.
- Blocks: Users cannot actually contact the site owner through the website.

**No Test Suite:**
- Problem: Zero automated tests. The `tests/` directory contains only a markdown spec file (`portfolio-carousel.test.spec.md`). No test runner is configured (no Jest, Vitest, or Playwright config).
- Blocks: Cannot verify functionality after changes. Regression risk on every code change.

**No Error Boundary:**
- Problem: No React Error Boundary components. If a component throws during render, the entire page crashes.
- Blocks: Graceful degradation when WordPress data is malformed or missing.

**No Sitemap or robots.txt Generation:**
- Problem: No sitemap.xml or robots.txt is generated during build.
- Blocks: SEO discovery by search engines. Important for a portfolio/blog site.

## Test Coverage Gaps

**Entire Codebase is Untested:**
- What's not tested: All components, API functions, utility functions, pages, and data transformations.
- Files: Every file in `src/`
- Risk: Any refactoring, dependency update, or feature addition can break existing functionality without warning.
- Priority: High. Start with unit tests for `src/lib/wordpress/*.ts` API functions and `src/lib/utils/*.ts` utility functions, then add component tests for critical UI (PostList, Header, ContactSection).

---

*Concerns audit: 2025-02-11*

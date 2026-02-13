# Product Requirements Document (PRD) – fs-pf26

Short PRD for TestSprite frontend testing. Upload this file when the TestSprite Configuration page asks for a PRD.

---

## Application overview

- **Name:** fs-pf26  
- **Stack:** Next.js 15 (App Router) frontend, headless WordPress backend.  
- **Default URL (dev):** `http://localhost:3000`

---

## Pages and routes to test

| Route | Description |
|-------|-------------|
| `/` | Homepage – hero, services, portfolio teaser, CTA. |
| `/about` | About page – trust/team content. |
| `/contact` | Contact page – form or contact info. |
| `/blog` | Blog listing – posts from WordPress. |
| `/blog/[slug]` | Single blog post. |
| `/category/[slug]` | Category archive (blog). |
| `/portfolio` | Portfolio listing. |
| `/portfolio/[slug]` | Single portfolio item (project detail). |
| `/resume` | Resume/CV page. |
| `/loading` | Loading/preloader experience. |
| `/maintenance` | Maintenance-style page (if linked). |
| 404 | Custom not-found page. |

---

## Features and behavior

- **Navigation:** Main menu and footer links; all main routes should be reachable and render without client errors.
- **Theming:** Optional dark/light mode (next-themes); UI should work in both.
- **Content:** Homepage, about, blog, portfolio content comes from WordPress API; pages should handle loading and empty states.
- **Media:** Images and optional video (e.g. hero); no broken images or layout shifts.
- **Forms:** Contact page – form fields and submit (if present); no console errors on submit.
- **Cookie consent:** If a banner exists, dismiss/accept should work.
- **Responsiveness:** Layout should be usable on viewports from mobile to desktop; no horizontal scroll or overlapping critical UI.
- **Accessibility:** Key actions (navigation, buttons, links) should be keyboard and screen-reader friendly where applicable.

---

## Out of scope for frontend TestSprite run

- WordPress admin or backend API directly.
- Authentication/login (no test account needed).
- Static export or production build verification (use dev server URL).

---

## Success criteria

- All listed routes load with HTTP 200 (or expected redirect).
- No uncaught JavaScript errors on main user flows (home, about, blog, portfolio, contact).
- Navigation between main pages works; back/forward where applicable.
- Critical content and CTAs are visible and interactive.

# Services Page: UI & ACF Plan

**Source:** `docs/services_page_copy.md`  
**Goal:** Elevate services from "generic commodities" to "strategic business drivers."  
**Tone:** Professional, Results-Oriented, Modern.

---

## 1. Page model

- **Content holder:** WordPress **Page** with slug **`services`**.
- **Route:** Frontend `/services` fetches this page via `getPageBySlug('services')` and renders sections from ACF.
- **Optional:** Below the marketing sections, the existing **Service CPT grid** can still be shown (list of individual service offerings).

---

## 2. UI sections (in order)

| Section            | Purpose                         | ACF group / fields |
|--------------------|---------------------------------|--------------------|
| **Hero**           | Main page header above the fold | `hero_headline`, `hero_subheadline` |
| **Trust**          | "Why Work With Me" differentiator| `trust_headline`, `trust_body`, `trust_items` (repeater) |
| **CTA**            | Global call-to-action block     | `cta_headline`, `cta_button_text`, `cta_button_link` |

---

## 3. ACF field groups and fields

### 3.1 Field group

- **Title:** Services Page
- **Location:** Page (post type `page`). The field group appears on all pages; use it on the page with slug **`services`** so the frontend can load it via `getPageBySlug('services')`.
- **Tabs:** Hero | Trust | CTA (for easier editing).

### 3.2 Hero (tab: Hero)

| Field key (name)     | Type     | Notes |
|----------------------|----------|--------|
| `hero_headline`      | Text     | Main headline (e.g. "Digital Products That Drive Business Growth."). |
| `hero_subheadline`   | Textarea | Supporting line; allow line breaks. |

### 3.3 Trust – "Why Work With Me" (tab: Trust)

| Field key (name) | Type    | Notes |
|------------------|---------|--------|
| `trust_headline` | Text    | Section headline (e.g. "More Than Just a Freelancer."). |
| `trust_body`     | WYSIWYG | Intro paragraph before the list. |
| `trust_items`    | Repeater| List of differentiators. Subfields: `title`, `description`. |

- **Repeater subfields:**
  - `title` (Text) – e.g. "Full-Stack Expertise"
  - `description` (Text or Textarea) – e.g. "I understand the whole picture, from design to database."

### 3.4 Global CTA (tab: CTA)

| Field key (name)   | Type | Notes |
|--------------------|------|--------|
| `cta_headline`     | Text | e.g. "Ready to Build Something Great?" |
| `cta_button_text`  | Text | Button label (e.g. "Start Your Project"). |
| `cta_button_link`   | URL  | Optional; default can be `#contact` or `/contact`. |

---

## 4. Front-end usage

- **Data:** `const page = await getPageBySlug('services'); const acf = page?.acf;`
- **Hero:** `acf.hero_headline`, `acf.hero_subheadline` → replace current hardcoded Services header.
- **Trust:** `acf.trust_headline`, `acf.trust_body` (HTML), `acf.trust_items[]` (each `title`, `description`).
- **CTA:** `acf.cta_headline`, `acf.cta_button_text`, `acf.cta_button_link` (fallback to `/contact` or `#contact` if empty).

---

## 5. TypeScript

- Extend `WPPage['acf']` (or page ACF union) with a **ServicesPageACF** interface:  
  `hero_headline`, `hero_subheadline`, `trust_headline`, `trust_body`, `trust_items` (array of `{ title: string; description: string }`), `cta_headline`, `cta_button_text`, `cta_button_link`.

---

## 6. Default content

- See **`docs/services-page-default-content.json`** for copy keyed by ACF field name, ready to paste or import into the Services page in WordPress.

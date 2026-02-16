# Service Single Page (Subpage): UI & ACF Plan

**Source:** `docs/services_subpages_copy.md`  
**Scope:** Individual service pages (e.g. `/services/ux-ui-design`, `/services/web-development`).  
**Tone:** Professional, Expert, Results-Oriented.

---

## 1. Content model

- **Content holder:** WordPress **Service** post type (CPT `service`), one post per service; slug = URL segment (e.g. `ux-ui-design`, `web-development`).
- **Route:** Frontend `/services/[slug]` loads the service via `getServiceItemBySlug(slug)` and renders sections from ACF. Existing fields (`service_title`, `service_text`, `service_features`, etc.) stay for backward compatibility; new ACF drives the sales-style layout below.

---

## 2. UI sections (in order)

| Section | Purpose | ACF fields |
|--------|----------|------------|
| **Hero** | Headline + subheadline above the fold | `hero_headline`, `hero_subheadline` |
| **Problem** | "The Problem" block | `problem_headline`, `problem_body` |
| **Solution** | "The Solution" block | `solution_headline`, `solution_body` |
| **Process / Features** | Variable section (My Process, Key Features, Use Cases, etc.) | `process_section_title`, `process_items` (repeater: title, description) |
| **Deliverables** | Bullet list of deliverables | `deliverables` (repeater: item_text) |
| **CTA** | Single primary button | `cta_button_text`, `cta_button_link` |

Optional: keep existing **Duration**, **Pricing**, **What's Included** (service_duration, service_pricing, service_features) above or below these sections when filled.

---

## 3. ACF field group and fields

### 3.1 Field group

- **Title:** Service Subpage (Sales Layout)
- **Location:** Post Type is equal to **Service**.
- **Tabs:** Hero | Problem | Solution | Process / Features | Deliverables | CTA.

### 3.2 Hero (tab)

| Name | Type | Notes |
|------|------|--------|
| `hero_headline` | Text | Main headline (e.g. "Design That Converts Visitors into Customers."). Fallback: `service_title` or post title. |
| `hero_subheadline` | Textarea | Supporting line under the headline. |

### 3.3 Problem (tab)

| Name | Type | Notes |
|------|------|--------|
| `problem_headline` | Text | Section heading (default "The Problem."). |
| `problem_body` | WYSIWYG | Body copy. |

### 3.4 Solution (tab)

| Name | Type | Notes |
|------|------|--------|
| `solution_headline` | Text | Section heading (default "The Solution."). |
| `solution_body` | WYSIWYG | Body copy. |

### 3.5 Process / Features (tab)

| Name | Type | Notes |
|------|------|--------|
| `process_section_title` | Text | Section title (e.g. "My Process", "Key Features", "Use Cases", "What We Cover", "What's Included", "Perfect For"). |
| `process_items` | Repeater | Rows: `title` (Text), `description` (Textarea, optional). For simple bullets, use only title. |

### 3.6 Deliverables (tab)

| Name | Type | Notes |
|------|------|--------|
| `deliverables` | Repeater | Single subfield `item_text` (Text). One row per deliverable. |

### 3.7 CTA (tab)

| Name | Type | Notes |
|------|------|--------|
| `cta_button_text` | Text | Button label (e.g. "Audit My Current Design", "Discuss Your Web Project"). |
| `cta_button_link` | URL | Optional; default `/contact`. |

---

## 4. Front-end usage

- **Data:** `service` from `getServiceItemBySlug(slug)`; `acf = service.acf`.
- **Hero:** Prefer `acf.hero_headline` / `acf.hero_subheadline`; if empty, use `acf.service_title` / post title and optional excerpt.
- **Problem / Solution:** Render when headline or body present; use `dangerouslySetInnerHTML` for body.
- **Process:** When `process_section_title` or `process_items` has rows, render section with title and list (title + description per row).
- **Deliverables:** List `acf.deliverables[].item_text`.
- **CTA:** Use `acf.cta_button_text` and `acf.cta_button_link` (fallback `/contact`). If empty, show global CTA (e.g. "Get a Quote" / "Start Your Project").

---

## 5. TypeScript

- Extend **WPServiceItem['acf']** with: `hero_headline`, `hero_subheadline`, `problem_headline`, `problem_body`, `solution_headline`, `solution_body`, `process_section_title`, `process_items` (array of `{ title?: string; description?: string }`), `deliverables` (array of `{ item_text?: string }`), `cta_button_text`, `cta_button_link`.

---

## 6. Default content

- **`docs/services-subpages-default-content.json`** contains one object per service (keyed by `slug`), with all ACF fields filled from `services_subpages_copy.md`, for pasting or importing per service in WordPress.

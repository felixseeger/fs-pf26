# Courses Post Type: UI & ACF Plan

Based on **docs/sales_page_copy.md** (Intro to AI Agents sales page).

---

## 1. UI Structure (Sections → Front-end)

| Section | Purpose | ACF block/group |
|--------|----------|------------------|
| **Page meta** | Goal, CTA label, price type | `course_goal`, `primary_cta_text`, `price_type`, `price_amount` |
| **Hero** | Above the fold: headline, subheadline, CTA, visual | Hero group |
| **Trust bar** | Social proof line + logos | Trust bar group |
| **Problem** | “Chat Trap” – headline + body | Problem group |
| **Solution** | “Intern” analogy – headline + body | Solution group |
| **Transformation** | “What you’ll build” – headline + feature grid | Transformation group (repeater) |
| **Curriculum** | Module list | Curriculum repeater |
| **FAQ** | Q&A | FAQ repeater |
| **Offer** | Price anchor, includes, guarantee, final CTA | Offer group |

---

## 2. ACF Field Groups Overview

**Location:** Post type = `course`

**Field groups:**

1. **Course settings** (page goal, primary CTA, price)
2. **Hero** – headline, subheadline, CTA text, CTA subtext, visual (image/video)
3. **Trust bar** – text, logo repeater (image + optional link)
4. **Problem** – headline, body (WYSIWYG)
5. **Solution** – headline, body (WYSIWYG)
6. **Transformation** – headline, repeater (title + description)
7. **Curriculum** – repeater (module number, title, description)
8. **FAQ** – repeater (question, answer)
9. **Offer** – headline, price, currency, “includes” repeater, guarantee heading, guarantee text, final CTA text

---

## 3. Field Naming Convention

- All keys: `field_course_<section>_<name>` (e.g. `field_course_hero_headline`).
- Group key: `group_course_sales_page`.
- Repeater sub_fields use unique keys (e.g. `field_course_faq_question`).

---

## 4. Default Content

Default copy is in **docs/courses-default-content.json**, keyed by ACF field name so you can:

- Manually paste into ACF in WP admin, or
- Use as reference for a one-time import script.

---

## 5. Front-end Rendering Notes

- **Hero:** Full-width; CTA button uses `hero_cta_text` + `hero_cta_subtext`; visual left/right or stacked on mobile.
- **Trust bar:** Single line of text + logo strip (from repeater).
- **Problem / Solution:** Two-column or stacked; body supports WYSIWYG (lists, bold).
- **Transformation:** Grid of cards from repeater (title + description).
- **Curriculum:** Numbered list or accordion from repeater.
- **FAQ:** Accordion or simple Q&A list.
- **Offer:** Price prominent; “includes” as checklist; guarantee + final CTA button.

---

## 6. Files Delivered

| File | Purpose |
|------|--------|
| **docs/acf-courses-fields.json** | ACF field group definition (import via ACF “Tools → Import” or sync). |
| **docs/courses-default-content.json** | Copy from sales_page_copy.md by field name for paste/import. |
| **docs/courses-ui-acf-plan.md** | This plan. |

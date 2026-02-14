# Portfolio Posts – ACF Fields & UI Plan

This document plans ACF fields and editor UI for **Portfolio Posts**, aligned with your current "Portfolio Page Sections" field group and the Next.js app.

---

## 1. Current ACF State (from your setup)

- **Field group:** Portfolio Page Sections  
- **Structure:**
  - **`portfolio_slider`** (Group) – parent container
  - **`portfolio_slider_media`** (Repeater) – inside the group
    - **`media_type`** (Checkbox)
    - **`media_image`** (Image)

**Important:** Because `portfolio_slider_media` lives inside the `portfolio_slider` group, the REST API exposes it as:

`acf.portfolio_slider.portfolio_slider_media`

The app currently reads `acf.portfolio_slider_media` (no group). So you can either:

- **Option A:** Move `portfolio_slider_media` out of the group to the field group root (so it becomes `acf.portfolio_slider_media`), or  
- **Option B:** Keep the group and update the app to use `acf.portfolio_slider?.portfolio_slider_media`.

The plan below assumes the repeater stays where it is and the app will be updated to read from the group (Option B). If you prefer Option A, only the “where to read” path in code changes; the field list stays the same.

---

## 2. Media: Carousel Images + Content Video

### 2.1 Carousel (existing repeater: `portfolio_slider_media`)

Use the repeater for the hero carousel (images and, later, videos).

| Field name       | Type    | Purpose |
|------------------|---------|--------|
| `media_type`     | **Select** (recommended) or Checkbox | "Image" vs "Video" per row. **Choices:** `image` \| `video`. Default: `image`. |
| `media_image`    | **Image** | Image for this slide. **Return format:** Array. Show when `media_type` = Image. |
| `media_video`    | **File** or **URL** (new) | Video for this slide. **File types:** mp4, webm, mov. **Return:** Array or URL. Show when `media_type` = Video. |
| `media_video_poster` | **Image** (optional) | Poster image for video. Show when `media_type` = Video. |
| `media_caption`  | **Text** (optional) | Caption under the slide. |

**UI in WordPress:**

- Repeater layout: **Block** (or Table if you prefer).
- For each row, editor chooses Image or Video; conditional logic shows either image + caption or video + poster + caption.
- "Add row" to add more carousel items; drag to reorder.

**Checkbox vs Select for `media_type`:**  
If you keep **Checkbox**, use one checkbox e.g. "This slide is a video" (checked = video, unchecked = image). The app already supports `media_type === true` for video. If you prefer a clearer UI, switch to **Select** with choices `image` and `video`.

### 2.2 Content video (single video below or within content)

One optional video that is not part of the carousel (e.g. "Project video" or "Content video").

**Placement:** Either inside the same "Portfolio Page Sections" group or as a sibling to `portfolio_slider`.

| Field name        | Type    | Purpose |
|-------------------|---------|--------|
| `portfolio_video` | **File** or **URL** or **oEmbed** | Single project/content video. **Return:** URL or file array. Optional. |

**UI:** One field, e.g. "Content video (optional)". If you use oEmbed, editors can paste YouTube/Vimeo URLs.

**Display in app:** After or before the main content block (e.g. one `<video>` or embed block). Logic: if `portfolio_video` has a URL, render it; otherwise ignore.

---

## 3. Text: Portfolio Title and Portfolio Text

WordPress already provides:

- **Post title** → used as the main heading on the project page.
- **Post content** → used as the main body (prose block).

So you have two approaches.

### 3.1 Option A – Use only WordPress title and content (no ACF text fields)

- **Title:** Post title (standard WP field).
- **Text:** Post content (Gutenberg block editor).
- No extra ACF fields; the app keeps using `item.title.rendered` and `item.content.rendered`.

### 3.2 Option B – ACF overrides for title and/or intro text

Use ACF when you want a **different** title or a **short intro** on the front while keeping the full story in the block editor.

| Field name          | Type    | Purpose |
|---------------------|---------|--------|
| `portfolio_title`   | **Text** (optional) | Override for the main heading. If empty, use post title. |
| `portfolio_text`   | **Textarea** or **WYSIWYG** (optional) | Short intro or summary. If used, the app can show this above or instead of the first part of the content. |

**UI:**  
- "Portfolio title (optional – overrides post title)".  
- "Portfolio text (optional – intro/summary)".

**App logic:**

- **Title:** `item.acf?.portfolio_title ?? item.title?.rendered`.
- **Text:** If you use it as intro: render `portfolio_text` then `content.rendered`, or use it in a specific block (e.g. under the hero carousel).

Recommendation: only add these if you really need an override or a separate intro; otherwise Option A is simpler.

---

## 4. Suggested ACF Structure (summary)

**Field group:** Portfolio Page Sections  
**Location:** Portfolio post type.

```
Portfolio Page Sections
├── portfolio_slider (Group) [existing]
│   └── portfolio_slider_media (Repeater) [existing]
│       ├── media_type (Select: image | video) [adjust from Checkbox if desired]
│       ├── media_image (Image) [existing]
│       ├── media_video (File or URL) [NEW – for video slides]
│       ├── media_video_poster (Image, optional) [NEW]
│       └── media_caption (Text, optional) [NEW]
│
├── portfolio_video (File or URL or oEmbed, optional) [NEW – content video]
├── portfolio_title (Text, optional) [NEW – override post title]
└── portfolio_text (Textarea/WYSIWYG, optional) [NEW – intro/summary]
```

Keep **Show in REST API** ON for the field group so the Next.js app can read these via `acf` on the portfolio endpoint.

---

## 5. App changes to align with this plan

1. **Read slider from group**  
   Use `item.acf?.portfolio_slider?.portfolio_slider_media` (and fallback to `item.acf?.portfolio_slider_media` for backward compatibility if you ever flatten the structure).

2. **Video in carousel**  
   When `media_type` is video, use `media_video` (and optionally `media_video_poster`) in the carousel component; keep using `media_image` for image slides.

3. **Content video**  
   If `portfolio_video` is present, render a video or embed block (e.g. after the carousel or before the main content).

4. **Title and text**  
   If you add `portfolio_title` / `portfolio_text`: use `portfolio_title` when set, else post title; use `portfolio_text` where you decide (e.g. intro paragraph).

---

## 6. UI summary for editors

| Section        | What editors see |
|----------------|-------------------|
| **Portfolio Slider** | Group with one repeater. Each row: choose Image or Video, then set image (or video + poster), optional caption. Reorder rows for carousel order. |
| **Content video**    | One optional field for the main project video. |
| **Portfolio title**  | Optional override for the page heading. |
| **Portfolio text**   | Optional intro/summary text. |

Standard **Post title** and **Post content** stay as the main title and body unless overridden or supplemented by the ACF fields above.

If you tell me whether you prefer Option A or B for title/text and whether the repeater stays inside the group, I can outline the exact code changes (paths and types) next.

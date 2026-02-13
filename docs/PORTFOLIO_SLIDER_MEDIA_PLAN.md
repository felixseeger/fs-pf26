# Portfolio Slider Image and Video Input Fields - Implementation Plan

## Overview
Add dedicated ACF/Meta Box fields for portfolio slider media (images and videos) to give editors explicit control over what appears in the hero carousel, separate from featured image, content images, and attachments.

---

## 1. WordPress Field Structure

### 1.1 ACF/Meta Box Field: `portfolio_slider_media`

**Field Type:** Repeater Field  
**Field Key:** `portfolio_slider_media`  
**Field Name:** Portfolio Slider Media  
**Description:** Images and videos displayed in the portfolio project hero carousel.

**Sub-fields:**

#### Sub-field 1: `media_type`
- **Type:** Select
- **Choices:**
  - `image` (default)
  - `video`
- **Default:** `image`
- **Required:** Yes

#### Sub-field 2: `media_image`
- **Type:** Image
- **Conditional Logic:** Show if `media_type` == `image`
- **Return Format:** Image Array (id, url, alt, width, height)
- **Required:** Yes (when media_type is image)

#### Sub-field 3: `media_video`
- **Type:** File (or URL)
- **Conditional Logic:** Show if `media_type` == `video`
- **Return Format:** File Array (id, url, mime_type, filesize) OR URL String
- **File Types:** mp4, webm, mov, m4v
- **Required:** Yes (when media_type is video)

#### Sub-field 4: `media_video_poster` (optional)
- **Type:** Image
- **Conditional Logic:** Show if `media_type` == `video`
- **Return Format:** Image Array (id, url, alt)
- **Description:** Poster/thumbnail image for video (shown before play)
- **Required:** No

#### Sub-field 5: `media_alt_text` (optional)
- **Type:** Text
- **Description:** Alt text for images or description for videos
- **Required:** No

#### Sub-field 6: `media_caption` (optional)
- **Type:** Textarea
- **Description:** Caption displayed below media in carousel
- **Required:** No

---

## 2. TypeScript Type Definitions

### 2.1 Update `src/types/wordpress.ts`

```typescript
// Add to WPPortfolioItem.acf interface
export interface PortfolioSliderMediaItem {
  media_type: 'image' | 'video';
  media_image?: ACFImage | number | false;
  media_video?: {
    id: number;
    url: string;
    mime_type: string;
    filesize?: number;
  } | string | false; // Can be file object or URL string
  media_video_poster?: ACFImage | number | false;
  media_alt_text?: string;
  media_caption?: string;
}

export interface WPPortfolioItem extends Omit<WPPost, 'categories' | 'tags'> {
  project_categories?: number[];
  project_tags?: number[];
  acf?: {
    project_gallery?: {
      id: number;
      url: string;
      alt: string;
      width?: number;
      height?: number;
    }[];
    portfolio_slider_media?: PortfolioSliderMediaItem[];
  };
}
```

---

## 3. Data Processing & Mapping

### 3.1 Create `src/lib/wordpress/portfolio-media.ts`

**Purpose:** Extract and normalize slider media from portfolio items.

```typescript
import { WPPortfolioItem, PortfolioSliderMediaItem, ACFImage } from '@/types/wordpress';

export interface SliderMediaItem {
  type: 'image' | 'video';
  url: string;
  altText?: string;
  posterUrl?: string; // For videos
  caption?: string;
  mimeType?: string; // For videos
}

/**
 * Extract slider media from portfolio item ACF field.
 * Returns normalized array of images and videos.
 */
export function getPortfolioSliderMedia(item: WPPortfolioItem): SliderMediaItem[] {
  const sliderMedia = item.acf?.portfolio_slider_media;
  if (!sliderMedia || !Array.isArray(sliderMedia) || sliderMedia.length === 0) {
    return [];
  }

  return sliderMedia
    .map((media): SliderMediaItem | null => {
      if (media.media_type === 'image') {
        const image = media.media_image;
        if (!image || (typeof image === 'object' && !image.url)) return null;
        
        const url = typeof image === 'string' 
          ? image 
          : typeof image === 'object' && 'url' in image 
            ? image.url 
            : null;
        const altText = media.media_alt_text || 
          (typeof image === 'object' && 'alt' in image ? image.alt : undefined);

        if (!url) return null;

        return {
          type: 'image',
          url,
          altText,
          caption: media.media_caption,
        };
      } else if (media.media_type === 'video') {
        const video = media.media_video;
        if (!video) return null;

        const url = typeof video === 'string' 
          ? video 
          : typeof video === 'object' && 'url' in video 
            ? video.url 
            : null;
        const mimeType = typeof video === 'object' && 'mime_type' in video 
          ? video.mime_type 
          : undefined;

        if (!url) return null;

        const poster = media.media_video_poster;
        const posterUrl = poster && typeof poster === 'object' && 'url' in poster 
          ? poster.url 
          : undefined;

        return {
          type: 'video',
          url,
          altText: media.media_alt_text,
          posterUrl,
          caption: media.media_caption,
          mimeType,
        };
      }
      return null;
    })
    .filter((item): item is SliderMediaItem => item !== null);
}

/**
 * Fallback: Get images from existing sources (featured, content, attachments).
 * Used when portfolio_slider_media is empty.
 */
export function getPortfolioFallbackImages(
  item: WPPortfolioItem,
  featuredImage: FeaturedMedia | null,
  contentImages: { url: string; altText: string }[],
  attachmentImages: { url: string; altText: string }[]
): SliderMediaItem[] {
  const allImages: SliderMediaItem[] = [];

  if (featuredImage?.source_url) {
    allImages.push({
      type: 'image',
      url: featuredImage.source_url,
      altText: featuredImage.alt_text,
    });
  }

  allImages.push(...contentImages.map(img => ({
    type: 'image' as const,
    url: img.url,
    altText: img.altText,
  })));

  allImages.push(...attachmentImages.map(img => ({
    type: 'image' as const,
    url: img.url,
    altText: img.altText,
  })));

  // Deduplicate by URL
  const seen = new Set<string>();
  return allImages.filter(img => {
    const baseUrl = img.url.replace(/-(\d+)x(\d+)\.(jpg|jpeg|png|webp|gif)/i, '.$3');
    if (seen.has(baseUrl)) return false;
    seen.add(baseUrl);
    return true;
  });
}
```

---

## 4. Component Updates

### 4.1 Update `PortfolioCarousel` Component

**File:** `src/components/portfolio/PortfolioCarousel.tsx`

**Changes:**
1. Update `CarouselImage` interface to `CarouselMedia` supporting both images and videos
2. Add video rendering with `<video>` element
3. Handle video poster images
4. Support video autoplay, controls, loop options
5. Update lightbox to handle videos (yet-another-react-lightbox supports videos)

```typescript
interface CarouselMedia {
  type: 'image' | 'video';
  url: string;
  altText?: string;
  posterUrl?: string; // For videos
  caption?: string;
  mimeType?: string; // For videos
}

interface PortfolioCarouselProps {
  media: CarouselMedia[];
}
```

**Rendering Logic:**
- Images: Use `<img>` tag (current behavior)
- Videos: Use `<video>` tag with:
  - `poster={posterUrl}` if available
  - `controls` for user interaction
  - `preload="metadata"` for performance
  - `playsInline` for mobile
  - Optional autoplay/mute/loop based on props

---

## 5. Page Integration

### 5.1 Update `src/app/portfolio/[slug]/page.tsx`

**Priority Order:**
1. **First:** Use `portfolio_slider_media` if available and non-empty
2. **Fallback:** Use existing chain (featured → content → attachments)

**Implementation:**
```typescript
import { getPortfolioSliderMedia, getPortfolioFallbackImages } from '@/lib/wordpress/portfolio-media';

// In component:
const sliderMedia = getPortfolioSliderMedia(item);
const carouselMedia = sliderMedia.length > 0
  ? sliderMedia
  : getPortfolioFallbackImages(item, featuredImage, contentImages, attachmentImages);
```

---

## 6. WordPress Setup Instructions

### 6.1 ACF Field Group Setup

**Field Group Name:** Portfolio Slider Media  
**Location Rules:**
- Post Type is equal to `portfolio`

**Field Configuration:**
- Use Repeater field with sub-fields as defined in Section 1.1
- Set minimum rows: 0 (optional field)
- Set maximum rows: 20 (reasonable limit)

### 6.2 Meta Box Alternative

If using Meta Box instead of ACF:
- Create Group: `portfolio_slider_media`
- Add Repeater field with same structure
- Use `meta_box` instead of `acf` in TypeScript types

---

## 7. Display Priority & Fallback Chain

```
1. portfolio_slider_media (ACF/Meta Box) ← NEW, highest priority
   ↓ (if empty)
2. Featured Image (WordPress featured_media)
   ↓ (if empty)
3. Images extracted from Gutenberg content
   ↓ (if empty)
4. WordPress attachments (media library)
```

**Rationale:** Give editors explicit control via slider media field, but maintain backward compatibility with existing projects.

---

## 8. Video Considerations

### 8.1 Supported Formats
- **Primary:** MP4 (H.264) - best browser support
- **Optional:** WebM, MOV, M4V
- **Hosting:** WordPress media library or external URLs (YouTube, Vimeo, self-hosted)

### 8.2 Performance
- Videos should be optimized (compressed, appropriate resolution)
- Use poster images to avoid loading video until user interaction
- Consider lazy loading for videos beyond first slide

### 8.3 Accessibility
- Provide alt text/descriptions for videos
- Ensure video controls are accessible
- Support keyboard navigation

---

## 9. Implementation Checklist

- [ ] Add TypeScript types (`PortfolioSliderMediaItem`, update `WPPortfolioItem`)
- [ ] Create `portfolio-media.ts` utility functions
- [ ] Update `PortfolioCarousel` to support videos
- [ ] Update portfolio `[slug]` page to use slider media
- [ ] Test with ACF field group in WordPress
- [ ] Test fallback chain when slider media is empty
- [ ] Test video playback (autoplay, controls, poster)
- [ ] Test lightbox with videos
- [ ] Update documentation (WordPress setup guide)

---

## 10. Future Enhancements

- **Video Autoplay Options:** Per-video or global setting
- **Video Loop:** Per-video loop setting
- **External Video Support:** YouTube/Vimeo embed URLs
- **Video Captions:** SRT/VTT file support
- **Media Ordering:** Drag-and-drop reordering in WordPress
- **Bulk Upload:** Upload multiple images/videos at once

---

## Notes

- Keep backward compatibility: existing portfolios without slider media should still work
- Slider media field is optional: if empty, fall back to current behavior
- Video support in lightbox depends on `yet-another-react-lightbox` capabilities (may need alternative for videos)

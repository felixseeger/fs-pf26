# DisplayCarousel Component

A React/TypeScript component that renders a 3D CRT monitor display with glitch effects for showcasing image galleries. Designed for WordPress ACF course gallery integration.

## Quick Start

### Installation

The component is located at:
```
src/components/courses/DisplayCarousel.tsx
```

### Basic Usage

```tsx
import { DisplayCarousel } from '@/components/courses/DisplayCarousel';

export default function MyComponent() {
  const images = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ];

  return <DisplayCarousel images={images} />;
}
```

### With WordPress ACF Data

```tsx
import { getCourseBySlug } from '@/lib/wordpress/course';
import { DisplayCarousel } from '@/components/courses/DisplayCarousel';

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  const galleryImages = course.acf?.courses_gallery || [];

  return <DisplayCarousel images={galleryImages} />;
}
```

### With the useCourseGallery Hook

```tsx
'use client';

import { useCourseGallery } from '@/lib/hooks/useCourseGallery';
import { DisplayCarousel } from '@/components/courses/DisplayCarousel';

export default function CourseSection({ course }) {
  const { images, isLoading, error } = useCourseGallery(course.acf?.courses_gallery);

  if (error) return <div>Error loading gallery</div>;
  if (isLoading) return <div>Loading...</div>;

  return <DisplayCarousel images={images} />;
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `images` | `Array<string \| ACFImage>` | Yes | — | Array of image URLs or WordPress ACFImage objects |
| `defaultImage` | `string` | No | First image | Initial image to display |
| `modelPath` | `string` | No | `/monitor.glb` | Path to the 3D monitor model (GLTF/GLB format) |
| `className` | `string` | No | — | Additional CSS classes for styling the container |

## Image Format Support

### URL Strings
```tsx
<DisplayCarousel images={[
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
]} />
```

### ACFImage Objects (WordPress)
```tsx
<DisplayCarousel images={[
  {
    ID: 123,
    id: 123,
    url: 'https://example.com/image.jpg',
    alt: 'Image alt text',
    title: 'Image Title',
    width: 1200,
    height: 800,
    sizes: { /* ... */ }
  }
]} />
```

### Mixed Arrays
```tsx
<DisplayCarousel images={[
  'https://example.com/image1.jpg',
  acfImageObject,
  'https://example.com/image3.jpg'
]} />
```

The component automatically converts all formats to usable URLs.

## Features

### 3D CRT Display
- Realistic monitor model rendered with Three.js
- Perspective-correct 60° viewing angle
- Soft ambient lighting with directional key light
- Physically-based tone mapping (ACESFilmicToneMapping)

### Visual Effects
- **Glitch Animation**: Triggered on image change with intensity fade
- **Chromatic Aberration**: RGB channel separation for retro look
- **Scanlines**: Horizontal CRT scan line effect
- **Vignette**: Dark edges to focus attention on center
- **Pixel Grid**: Subtle pixelation effect
- **Noise**: Analog TV grain effect
- **Dynamic Displacement**: Glitch-induced image distortion

### Interaction
- **Mouse Tracking**: 3D monitor rotates based on cursor position
- **Gallery Navigation**: Hover over bottom gallery thumbnails to switch images
- **Smooth Interpolation**: GSAP-powered smooth mouse tracking (150ms lead)
- **Responsive Design**: Automatically adapts to container width and aspect ratio

### Performance
- **Texture Caching**: Images cached in memory for smooth navigation
- **Lazy Loading**: Textures load on-demand as gallery items are hovered
- **Efficient Cleanup**: All event listeners and animation frames properly cleaned up
- **Responsive Sizing**: Canvas automatically resizes on window resize

## Styling

### Container Classes (Tailwind)

```tsx
<DisplayCarousel 
  images={images}
  className="w-full lg:w-4/5 mx-auto"
/>
```

Common styling utilities:
- `w-full` - Full width container
- `h-96` / `h-screen` - Height control (component maintains aspect ratio)
- `mx-auto` - Center horizontally
- `rounded-lg` - Add border radius
- `shadow-2xl` - Add shadow

### Customize in Code

The component uses inline styles for Three.js canvas. To customize:

1. **Background**: Modify canvas background color (line ~130 in DisplayCarousel.tsx)
2. **Lighting**: Adjust light intensities and positions (lines ~150-180)
3. **Camera Position**: Modify camera.position (line ~120)
4. **Glitch Effect**: Adjust GSAP animation duration (line ~270)

## Interaction Patterns

### Mouse Tracking
- Horizontal movement (X-axis): Rotates monitor left/right (~±0.3 radians)
- Vertical movement (Y-axis): Rotates monitor up/down (~±0.15 radians)
- Smooth interpolation with 150ms lead using GSAP

### Image Switching
1. Hover over gallery thumbnail at bottom
2. Glitch animation triggers (intensity 1.0 → 0 over 0.75s)
3. New image texture loads and displays

### Gallery UI
```tsx
<ul className="flex gap-2 justify-center flex-wrap">
  {displayImages.map((img, index) => (
    <li
      key={index}
      onMouseOver={() => setDisplayImage(getImageUrl(img))}
      className="cursor-pointer hover:opacity-75 transition-opacity"
    >
      {/* Thumbnail */}
    </li>
  ))}
</ul>
```

## Technical Details

### Three.js Setup
- **Scene**: Standard Scene with fog
- **Camera**: PerspectiveCamera with 30° FOV
- **Renderer**: WebGLRenderer with antialias and alpha
- **Tone Mapping**: ACESFilmicToneMapping for realistic colors
- **Lighting**:
  - Ambient light (0.5 intensity) for base illumination
  - Directional light (1.2 intensity) from front-top-right
  - Point light (0.8 intensity) for accent fill

### Shader System
- **Vertex Shader**: Passes UV coordinates and viewport projection
- **Fragment Shader**: Implements 13-uniform effect system
  - `map`: Main texture sampler
  - `glitchIntensity`: Controls effect strength (0-1)
  - `glitchAmount`: Noise amount for glitch displacement
  - `time`: Float for animation
  - `iResolution`: Canvas size for pixel grid calculations
  - `imageAspect`: Image aspect ratio for correct scaling

### Texture Caching
```typescript
const textureCacheRef = useRef<Record<string, THREE.Texture>>({});

// Load with cache
const loadTexture = (src: string) => {
  if (textureCacheRef.current[src]) {
    return textureCacheRef.current[src];
  }
  // Load new texture and cache
};
```

### Animation Loop
```typescript
const animate = () => {
  requestAnimationFrame(animate);
  
  // Update timer
  timerRef.current.update();
  
  // Update uniforms
  displayMaterialRef.current.uniforms.time.value = elapsed;
  
  // Update shader effects
  // ... glitch animation, mouse tracking, etc.
  
  // Render
  rendererRef.current?.render(sceneRef.current, cameraRef.current);
};
```

## Integration with WordPress

### Course ACF Field Structure
```php
// In WordPress: courses_gallery field (Array)
[
  {
    "ID": 123,
    "id": 123,
    "url": "https://site.com/image.jpg",
    "alt": "Description",
    "title": "Image Title",
    "width": 1200,
    "height": 800,
    "sizes": { /* ... */ }
  },
  // ... more images
]
```

### Fetching Course Data
```tsx
import { getCourseBySlug } from '@/lib/wordpress/course';

const course = await getCourseBySlug('course-slug');
const gallery = course.acf?.courses_gallery || [];
```

## Performance Guidelines

### Image Recommendations
- **Optimal Size**: 1200x800px (16:9 aspect ratio)
- **Max Size**: 4096x2160px (4K)
- **File Size**: Keep under 2MB per image
- **Format**: JPG preferred for photography, PNG for graphics

### Gallery Size Recommendations
| # of Images | Recommended | Notes |
|-------------|------------|-------|
| 1-5 | ✅ Excellent | No performance concerns |
| 6-10 | ✅ Good | Smooth experience on all devices |
| 11-20 | ⚠️ Monitor | May use 20-50MB VRAM depending on image size |
| 20+ | 🔴 Consider lazy loading | Implement off-canvas preloading |

### Device Performance
- **Desktop (2021+)**: Full quality, all effects
- **Laptop (integrated GPU)**: Reduce texture resolution or shader quality
- **Mobile**: Consider disabling glitch effects or using lower resolution textures

### Memory Usage
Each texture cached in VRAM:
- 1200x800 image ≈ 3.8MB VRAM
- 2400x1600 image ≈ 15.4MB VRAM

Example: 10 images at 1200x800 ≈ 38MB VRAM

## Troubleshooting

### DisplayCarousel doesn't render
**Check**: 
- Pass `images` prop as non-empty array
- Container has width and height defined
- No JavaScript errors in console

**Fix**:
```tsx
<div className="w-full h-screen">
  <DisplayCarousel images={images} />
</div>
```

### 3D Model doesn't load
**Check**:
- File exists at `/public/models/monitor.glb`
- GLTF file is valid (test in online viewer)
- Network tab shows successful load

**Fix**:
- Upload `/monitor.glb` to public folder
- Or pass custom path: `modelPath="/custom/monitor.glb"`

### Images appear blurry
**Check**:
- Image resolution is 1200x800 minimum
- Browser zoom isn't applied
- WebGL anisotropic filtering is enabled

**Fix**:
```tsx
// In LoadTexture function, anisotropic filtering 
// is already enabled (line ~220)
texture.magFilter = THREE.LinearFilter;
texture.minFilter = THREE.LinearMipmapLinearFilter;
```

### Glitch effect doesn't trigger
**Check**:
- Hover working on gallery items
- Browser DevTools console has no errors
- GSAP is properly imported

**Fix**: Check that gallery items are rendering:
```tsx
console.log('Gallery items:', displayImages);
```

### Performance is sluggish
**Check**:
- Number of images in gallery
- Image file sizes
- Browser GPU acceleration enabled

**Fix**:
- Reduce image resolution
- Limit gallery to 10 images
- Disable glitch effect for testing:
  ```tsx
  // Comment out GSAP animation in setDisplayImage
  // Modify glitchIntensity uniform directly instead
  ```

### Textures not caching
**Check**:
- Multiple rapid image switches
- Browser memory limit reached

**Fix**: Component manages caching automatically. If memory issues:
```tsx
// Clear some cache manually if needed
// (Note: This requires extending component)
Object.keys(textureCacheRef.current).forEach(key => {
  if (Math.random() < 0.5) {
    delete textureCacheRef.current[key];
  }
});
```

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |
| iOS Safari | 14+ | ⚠️ Works, may need optimization |
| Android Chrome | 90+ | ⚠️ Works, may need optimization |

**Requirements**:
- WebGL 2.0 support
- ES2020+ JavaScript
- CSS Grid support

## Advanced Usage

### Custom Model
```tsx
<DisplayCarousel 
  images={images}
  modelPath="/custom/mymonitor.glb"
/>
```

### Styling with external CSS
```tsx
<div className="my-carousel-wrapper">
  <DisplayCarousel images={images} className="my-carousel" />
</div>
```

```css
.my-carousel-wrapper {
  border: 3px solid #333;
  padding: 20px;
  border-radius: 12px;
}

.my-carousel canvas {
  display: block;
  border-radius: 8px;
}
```

### Conditional Rendering with Hook
```tsx
import { useCourseGallery } from '@/lib/hooks/useCourseGallery';

export function CourseGallerySection({ course }) {
  const { images, isLoading, error } = useCourseGallery(
    course.acf?.courses_gallery
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorFallback error={error} />;
  if (!images.length) return <EmptyState />;

  return <DisplayCarousel images={images} />;
}
```

## Dependencies

```json
{
  "react": "^18.0.0",
  "three": "^0.183.2",
  "gsap": "^3.14.2"
}
```

All dependencies are already in your project's `package.json`.

## File Structure

```
src/
├── components/
│   └── courses/
│       └── DisplayCarousel.tsx              // Main component
├── lib/
│   ├── hooks/
│   │   └── useCourseGallery.ts             // Integration hooks
│   └── wordpress/
│       ├── course.ts                        // Course API functions
│       └── api.ts                           // Base WordPress API
├── types/
│   └── wordpress.ts                         // Type definitions
└── app/
    └── courses/
        ├── [slug]/
        │   └── page.tsx                     // Use DisplayCarousel here
        └── [slug]/page-with-carousel.example.tsx // Reference implementation
```

## FAQ

**Q: Can I use this with non-WordPress images?**
A: Yes! Just pass URLs or any object with a `url` property.

**Q: Does it work with next/image optimization?**
A: The component requires direct URLs. Use `src={image.url}` from optimized sources rather than `next/image` for now.

**Q: Can I disable specific effects?**
A: Yes, modify shader uniforms in the fragment shader (bottom of DisplayCarousel.tsx).

**Q: How do I adjust animation speed?**
A: Modify GSAP duration on line ~270:
```tsx
gsap.to(glitchIntensityRef.current, {
  value: 0,
  duration: 1.5  // Change from 0.75
});
```

**Q: Is this SEO-friendly?**
A: The 3D display is rendered on canvas, not in DOM. For SEO, include alt text in markdown or structured data above the component.

---

**Last Updated**: 2025-02-09  
**Component Status**: Production Ready ✅  
**Tested With**: Next.js 14+, React 18+, Three.js 0.183.2, GSAP 3.14.2

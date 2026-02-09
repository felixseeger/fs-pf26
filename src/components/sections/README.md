# Services Section Component

A responsive services showcase section with hover effects, scroll-triggered animations, and WordPress integration.

## Features

- ✅ Responsive grid layout (1/2/3 columns)
- ✅ 6 default service cards with icons
- ✅ Smooth hover animations (background changes to primary yellow)
- ✅ Text color inversion on hover
- ✅ Scroll-triggered entrance animations with stagger effect
- ✅ Dark mode support
- ✅ WordPress REST API integration
- ✅ Fallback to static data

## Usage

### Basic Usage (Static Data)

```tsx
import ServicesSection from '@/components/sections/ServicesSection';

export default function Page() {
  return (
    <div>
      <ServicesSection />
    </div>
  );
}
```

### Custom Services

```tsx
import ServicesSection from '@/components/sections/ServicesSection';
import { Code2, Palette, Smartphone } from 'lucide-react';

const customServices = [
  {
    id: 'web',
    icon: Code2,
    title: 'Web Development',
    description: 'Custom web applications built with React and Next.js',
  },
  {
    id: 'design',
    icon: Palette,
    title: 'Design',
    description: 'Beautiful UI/UX design that converts',
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Native and cross-platform mobile solutions',
  },
];

export default function Page() {
  return <ServicesSection services={customServices} />;
}
```

### With WordPress Integration (Server Component)

```tsx
import ServicesSection from '@/components/sections/ServicesSection';
import { getServices } from '@/lib/wordpress';
import { defaultServices } from '@/data/services';

// Map WordPress services to component format
function mapWPServicesToProps(wpServices) {
  // Icon mapping (WordPress icon names to Lucide components)
  const iconMap = {
    Code2: Code2,
    Palette: Palette,
    Smartphone: Smartphone,
    TrendingUp: TrendingUp,
    Rocket: Rocket,
    Headphones: Headphones,
  };

  return wpServices.map(service => ({
    id: service.slug,
    icon: iconMap[service.acf?.icon] || Code2,
    title: service.title.rendered,
    description: service.acf?.short_description || service.excerpt?.rendered || '',
  }));
}

export default async function Page() {
  let services = defaultServices; // Fallback

  try {
    const wpServices = await getServices(6);
    if (wpServices.length > 0) {
      services = mapWPServicesToProps(wpServices);
    }
  } catch (error) {
    console.error('Failed to fetch services:', error);
  }

  return <ServicesSection services={services} />;
}
```

### Adding to Homepage

```tsx
// src/app/page.tsx
import ServicesSection from '@/components/sections/ServicesSection';

export default async function Home() {
  return (
    <div>
      <HomepageHero />

      {/* Services Section */}
      <ServicesSection />

      {/* Blog Section */}
      <PostList posts={posts} />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `services` | `Service[]` | `defaultServices` | Array of service objects |
| `className` | `string` | `''` | Additional CSS classes |

### Service Object

```typescript
interface Service {
  id: string;           // Unique identifier
  icon: LucideIcon;     // Lucide React icon component
  title: string;        // Service title
  description: string;  // Service description
}
```

## Available Lucide Icons

Common icons used in the default services:
- `Code2` - Web Development
- `Palette` - UI/UX Design
- `Smartphone` - Mobile Apps
- `TrendingUp` - Digital Strategy
- `Rocket` - Brand Identity
- `Headphones` - Support & Maintenance

Browse all icons: https://lucide.dev/icons/

## Styling

The component uses Tailwind CSS with the following key styles:

### Background Colors
- Light mode: `bg-zinc-100` (card), `bg-white` (section)
- Dark mode: `bg-zinc-900` (card), `bg-black` (section)
- Hover: `bg-primary` (both modes - yellow lime)

### Text Colors
- Default: `text-zinc-900` (light), `text-white` (dark)
- Hover: `text-black` (both modes)
- Description: `text-zinc-600` (light), `text-zinc-400` (dark)
- Hover description: `text-black/70` (both modes)

### Animations
- Entrance: Fade in + slide up from 20px below
- Stagger delay: 0.1s per card
- Trigger: When card enters viewport (once only)
- Hover transitions: 300ms duration

## WordPress Setup

### 1. Register Custom Post Type

Add to your theme's `functions.php` or use the provided `wordpress-services-setup.php`:

```php
function register_services_post_type() {
  register_post_type('services', [
    'labels' => [
      'name' => 'Services',
      'singular_name' => 'Service',
    ],
    'public' => true,
    'show_in_rest' => true,
    'rest_base' => 'services',
    'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields', 'page-attributes'],
    'menu_icon' => 'dashicons-admin-tools',
  ]);
}
add_action('init', 'register_services_post_type');
```

### 2. Add ACF Fields (Optional)

If using Advanced Custom Fields:
- **icon** (Text): Lucide icon name (e.g., "Code2")
- **short_description** (Textarea): Brief description (150 chars)

### 3. Add Services in WordPress

Create 6 services with:
- Title
- Description (excerpt or ACF short_description)
- Icon (ACF field)
- Menu Order (for sorting)

### 4. Test API Endpoint

```
http://your-site.local/wp-json/wp/v2/services
```

## Accessibility

- ✅ Semantic HTML (`<section>`, `<h2>`, `<h3>`)
- ✅ Proper heading hierarchy
- ✅ Keyboard accessible (hover states work on focus)
- ✅ ARIA-compliant markup
- ✅ Reduced motion support (via Framer Motion)

## Performance

- ✅ Client component for animations
- ✅ Scroll-triggered animations (only animate when visible)
- ✅ `viewport={{ once: true }}` prevents re-animations
- ✅ CSS transitions for hover states (GPU-accelerated)
- ✅ No layout shift (fixed card heights)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- iOS Safari 14.5+
- Android Chrome 90+

## Examples

### Full Page Example

```tsx
import ServicesSection from '@/components/sections/ServicesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';

export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>

      {/* Services */}
      <ServicesSection />

      {/* Testimonials */}
      <TestimonialsSection />
    </div>
  );
}
```

### Custom Styling

```tsx
<ServicesSection
  className="bg-gradient-to-b from-white to-zinc-100 dark:from-black dark:to-zinc-900"
/>
```

## Troubleshooting

### Services not appearing
- Check WordPress custom post type is registered
- Verify `show_in_rest` is `true`
- Test REST API endpoint directly
- Check console for errors

### Icons not showing
- Verify icon import: `import { IconName } from 'lucide-react'`
- Check icon name spelling (case-sensitive)
- Ensure icon is available in Lucide React

### Hover effects not working
- Check Tailwind `group` and `group-hover:` classes
- Verify dark mode classes are correct
- Test in different browsers

### Animations not triggering
- Verify Framer Motion is installed: `npm list framer-motion`
- Check viewport intersection observer support
- Test with `viewport={{ once: false }}` for debugging

## Related Components

- `TestimonialsSection` - Customer testimonials showcase
- `FAQAccordion` - Frequently asked questions
- `PostList` - Blog posts display

## File Structure

```
src/
├── components/
│   └── sections/
│       ├── ServicesSection.tsx       # Main component
│       └── README.md                 # This file
├── data/
│   └── services.ts                   # Fallback static data
├── lib/
│   └── wordpress/
│       ├── services.ts               # WordPress API integration
│       └── index.ts                  # Exports
└── wordpress-services-setup.php      # WordPress setup code
```

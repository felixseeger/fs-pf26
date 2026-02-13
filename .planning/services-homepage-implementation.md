# Services Posts Implementation Plan for Homepage Services Grid

## Overview
Replace hardcoded services in `ServicesSection` component with WordPress services posts fetched from the REST API.

## Current State Analysis

### Existing Components
1. **`src/components/sections/ServicesSection.tsx`**
   - Currently uses hardcoded `defaultServices` array
   - Uses Lucide React icons (`Code2`, `Palette`, etc.)
   - Displays services in a 3-column grid with tilt card effect

2. **`src/components/services/ServiceGrid.tsx`**
   - Already exists and displays WordPress services
   - Uses different styling (more detailed cards)
   - Handles ACF image icons and featured images

3. **`src/app/page.tsx`**
   - Currently has a services section using ACF repeater fields from homepage (`acf.services`)
   - Uses different component structure

### WordPress Integration
- ✅ Services post type exists (`/services`)
- ✅ API functions exist (`getServiceItems`, `getServiceItemBySlug`)
- ✅ ACF fields partially defined in TypeScript types
- ✅ REST API exposes ACF fields

## Implementation Plan

### Phase 1: Update ServicesSection Component

**File: `src/components/sections/ServicesSection.tsx`**

**Changes:**
1. Remove hardcoded `defaultServices` array
2. Update `Service` interface to support both Lucide icons and image URLs
3. Add icon mapping function for Lucide icon names
4. Support both icon types:
   - Lucide icon name (string) → Map to Lucide component
   - Image URL (ACFImage or string) → Display as `<img>`

**Updated Interface:**
```typescript
interface Service {
  id: string;
  iconUrl?: string; // Image URL from services_gallery or featured image
  iconAlt?: string; // Alt text for icon
  title: string;
  description: string;
  slug?: string; // For linking to service detail page
}
```

**Icon Handling Logic:**
```typescript
// Use services_gallery (ACFImage) - same logic as ServiceGrid.tsx
const servicesGallery = service.acf?.services_gallery;
const featuredImage = service._embedded?.['wp:featuredmedia']?.[0];

const iconImageUrl = servicesGallery && typeof servicesGallery === 'object' && 'url' in servicesGallery 
  ? (servicesGallery as ACFImage).url 
  : featuredImage?.source_url;

const iconImageAlt = servicesGallery && typeof servicesGallery === 'object' && 'alt' in servicesGallery
  ? (servicesGallery as ACFImage).alt
  : featuredImage?.alt_text;
```

### Phase 2: Update Homepage to Fetch Services

**File: `src/app/page.tsx`**

**Changes:**
1. Import `getServiceItems` from `@/lib/wordpress/services`
2. Fetch services in the page component
3. Map WordPress services to `ServicesSection` format
4. Replace current services section with updated `ServicesSection` component

**Mapping Function:**
```typescript
function mapWPServicesToComponent(services: WPServiceItem[]): Service[] {
  return services.map(service => {
    const acf = service.acf;
    const featuredImage = service._embedded?.['wp:featuredmedia']?.[0];
    const servicesGallery = acf?.services_gallery;
    
    // Use services_gallery if available, otherwise fallback to featured image
    const iconImageUrl = servicesGallery && typeof servicesGallery === 'object' && 'url' in servicesGallery 
      ? (servicesGallery as ACFImage).url 
      : featuredImage?.source_url;
    
    const iconImageAlt = servicesGallery && typeof servicesGallery === 'object' && 'alt' in servicesGallery
      ? (servicesGallery as ACFImage).alt
      : featuredImage?.alt_text;
    
    return {
      id: service.slug,
      iconUrl: iconImageUrl,
      iconAlt: iconImageAlt || service.title.rendered,
      title: service.title.rendered,
      description: acf?.service_short_description || 
                   service.excerpt?.rendered?.replace(/<[^>]*>/g, '') || 
                   '',
      slug: service.slug,
    };
  });
}
```

### Phase 3: Update ServicesSection Component Rendering

**File: `src/components/sections/ServicesSection.tsx`**

**Icon Rendering Logic:**
```typescript
{service.iconUrl ? (
  <div className="mb-6 w-12 h-12 service-icon">
    <img
      src={service.iconUrl}
      alt={service.iconAlt || `${service.title} icon`}
      className="w-full h-full object-contain"
    />
  </div>
) : (
  // Fallback: Use Lucide icon if no image available
  <div className="mb-6 text-primary group-hover:text-black dark:group-hover:text-black transition-colors duration-300">
    <Icon className="w-12 h-12" strokeWidth={1.5} />
  </div>
)}
```

**Add Link to Service Detail Page:**
```typescript
<TiltCard
  className="group p-8 rounded-2xl ... cursor-pointer"
  onClick={() => service.slug && router.push(`/services/${service.slug}`)}
>
```

### Phase 4: ACF Field Configuration

## Required ACF Fields for Services Post Type

### Field Group: Service Details
**Location Rule:** Post Type is equal to `services`

### Fields:

1. **Services Gallery** (`services_gallery`) ✅ Already exists
   - **Field Type:** Image
   - **Field Name:** `services_gallery`
   - **Return Format:** Image Array
   - **Instructions:** Upload service icon/image (SVG or PNG recommended)
   - **Note:** This field is already configured and working on the Services page

2. **Short Description** (`service_short_description`)
   - **Field Type:** Textarea
   - **Field Name:** `service_short_description`
   - **Instructions:** Brief description for service card (max 150 characters)
   - **Character Limit:** 150
   - **Required:** No (falls back to excerpt)

3. **Service Duration** (`service_duration`) - Optional
   - **Field Type:** Text
   - **Field Name:** `service_duration`
   - **Instructions:** e.g., "2-4 weeks", "Ongoing"

4. **Service Pricing** (`service_pricing`) - Optional
   - **Field Type:** Text
   - **Field Name:** `service_pricing`
   - **Instructions:** e.g., "Starting at €500", "Custom Quote"

5. **Service Features** (`service_features`) - Optional
   - **Field Type:** Repeater
   - **Sub Fields:**
     - Feature Text (Text)
   - **Instructions:** List of features included in this service

### Alternative: Use Meta Box Instead of ACF

If using Meta Box plugin, create similar fields:
- `service_icon` (Image or Text)
- `service_short_description` (Textarea)
- `service_duration` (Text)
- `service_pricing` (Text)
- `service_features` (Group/Repeater)

## Implementation Steps

### Step 1: Update TypeScript Types
- ✅ Already defined in `src/types/wordpress.ts`:
  ```typescript
  acf?: {
    service_icon?: ACFImage | string | false;
    service_short_description?: string;
    service_features?: string[];
    service_pricing?: string;
    service_duration?: string;
  };
  ```

### Step 2: Update ServicesSection Component
- Modify to accept WordPress services
- Add icon type detection and rendering
- Add link to service detail pages

### Step 3: Update Homepage
- Fetch services using `getServiceItems()`
- Map WordPress services to component format
- Replace current services section

### Step 4: WordPress Configuration
- Configure ACF fields in WordPress admin
- Create service posts with required fields
- Test API response

### Step 5: Testing
- Verify services display correctly
- Test icon rendering (both Lucide and images)
- Test links to service detail pages
- Test fallback behavior (missing fields)

## Fallback Behavior

1. **No services fetched:** Use empty array (show nothing or placeholder)
2. **Missing icon:** Don't display icon
3. **Missing description:** Use excerpt, or empty string
4. **Missing slug:** Don't make card clickable

## Migration Notes

- Current homepage uses `acf.services` repeater field
- New implementation uses services post type
- Both can coexist during migration
- Consider keeping ACF repeater as fallback

## Files to Modify

1. `src/components/sections/ServicesSection.tsx` - Main component update
2. `src/app/page.tsx` - Fetch and pass services
3. WordPress Admin - Configure ACF fields

## Files to Create

None (all infrastructure exists)

## Testing Checklist

- [ ] Services fetch correctly from WordPress API
- [ ] Icons display (both Lucide and images)
- [ ] Descriptions show correctly
- [ ] Links navigate to service detail pages
- [ ] Fallbacks work when fields are missing
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Dark mode styling works
- [ ] Hover effects work correctly
- [ ] Loading states handled gracefully

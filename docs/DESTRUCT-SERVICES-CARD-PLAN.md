# DestructServicesCard Implementation Plan

## Overview

Refactor the physics-destroy hover effect (reference at `http://localhost:5173/`) into a React component `DestructServicesCard.tsx` and integrate it into the Homepage Services section. On hover, **Deliverables** (from WordPress `acf.deliverables`) explode from behind the card to in front using Matter.js physics.

## Reference Analysis

**Source:** `physics-destroy_hover-effect/`
- **script.js**: Matter.js physics + GSAP animations
- **index.html**: `.service` cards with `data-tags` (comma-separated labels)
- **Effect**: On hover → card expands, images slide up, tags drop from above with gravity
- **Dependencies**: `matter-js`, `gsap`

## Data Flow

| Source | Field | Target |
|--------|-------|--------|
| `WPServiceItem.acf?.deliverables` | `ServiceDeliverableItem[]` with `item_text` | `Service.deliverables?: string[]` |
| `mapWPServicesToSection()` | Extracts `deliverables` from WP | Passed to `ServicesSection` |

## Implementation Steps

### 1. Extend Service interface
- Add `deliverables?: string[]` to `Service` in `ServicesSection.tsx`
- Update `mapWPServicesToSection()` in `page.tsx` to include `acf?.deliverables?.map(d => d.item_text).filter(Boolean)`

### 2. Install matter-js
```bash
npm install matter-js
```

### 3. Create DestructServicesCard.tsx
- **Location:** `src/components/services/DestructServicesCard.tsx`
- **Props:** `children`, `deliverables: string[]`, `className?`, `slug?` (for Link)
- **Behavior:**
  - Wraps card content in a container with `position: relative; overflow: visible`
  - On `mouseenter`: spawn physics bodies for each deliverable
  - Deliverables start **behind** the card (below center, `z-index: 0`)
  - Apply upward/outward impulse to "explode" them
  - Gravity pulls them down; they settle in front (`z-index: 10`)
  - Sync DOM elements with Matter.js body positions via `requestAnimationFrame`
  - On `mouseleave`: fade out tags, cleanup engine, cancel RAF
- **Styling:** Pill-shaped tags matching site theme (primary color, dark mode support)

### 4. Integrate into ServicesSection
- When `service.deliverables?.length > 0`: wrap card in `DestructServicesCard` with `deliverables={service.deliverables}`
- When no deliverables: keep existing `TiltCard` (no physics)
- Preserve existing Link, Image, title, description, "Read more" layout

## Z-Index & Layering

- Card base: `z-index: 1`
- Tags container: `z-index: 10`, `pointer-events: none`
- Tags explode from behind (initial Y above card top) → fall in front of card

## Fallback

- Services without `deliverables` from WP: use `TiltCard` only (current behavior)
- Empty `deliverables`: same as no deliverables

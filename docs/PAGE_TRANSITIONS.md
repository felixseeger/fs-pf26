# GSAP Page Transitions

Creative page transitions run when navigating between routes. The overlay covers the viewport, then reveals the new page.

## Setup

- **Layout**: The app is wrapped in `PageTransitionProvider` (see `src/app/layout.tsx`).
- **Links**: Use `AnimatedLink` instead of `next/link` for internal links where you want a transition. The Header nav already uses `AnimatedLink`.

## Transition types

Defined in `src/lib/page-transitions.ts`. Default is `slideRight`.

| Type          | Description                                      |
|---------------|--------------------------------------------------|
| `fade`        | Overlay fades in, then fades out                 |
| `slideRight`  | Overlay slides in from the left, exits to the right |
| `slideLeft`   | Overlay slides in from the right, exits left     |
| `slideUp`     | Overlay slides up from bottom                    |
| `slideDown`   | Overlay slides down from top                     |
| `wipeRight`   | Clip-path wipe from left edge                    |
| `wipeLeft`    | Clip-path wipe from right edge                   |
| `scaleIn`     | Overlay scales from center (back ease)           |
| `blur`        | Backdrop blur + fade                             |
| `curtain`     | Two panels close from left/right, then open      |
| `diamond`     | Clip-path expands from center to full screen     |

## Usage

### AnimatedLink (per-link transition)

```tsx
import AnimatedLink from '@/components/ui/AnimatedLink';

<AnimatedLink href="/portfolio">Portfolio</AnimatedLink>
<AnimatedLink href="/about" transition="blur">About</AnimatedLink>
<AnimatedLink href="/external" disableTransition>External</AnimatedLink>
```

- **`transition`** – Override the default for this link.
- **`disableTransition`** – Use normal navigation (e.g. external or PDF).

### Programmatic navigation

```tsx
import { usePageTransition } from '@/components/providers/PageTransitionProvider';

const { navigate, setDefaultTransition } = usePageTransition();

navigate('/contact');
navigate('/portfolio', 'scaleIn');
setDefaultTransition('blur');
```

### Changing the default transition

In `layout.tsx`:

```tsx
<PageTransitionProvider defaultTransition="slideRight">
```

Or at runtime via `usePageTransition().setDefaultTransition('blur')`.

## Adding a new preset

1. In `src/lib/page-transitions.ts`:
   - Add the key to `PageTransitionType`.
   - Add an entry to `PAGE_TRANSITION_PRESETS` with `setInitial`, `enter`, and `exit` (each receives the overlay element and optional duration).
2. Use `data-transition="curtain"`-style markup in the overlay only when the preset needs extra DOM (e.g. curtain’s left/right panels). The provider already handles `curtain`; for others the overlay is a single div.

## Behaviour

- **Enter**: User clicks an `AnimatedLink` → overlay animates in (covers page) → `router.push(href)`.
- **Exit**: When the new route is active (pathname updated), overlay animates out and resets.
- Hash/same-path navigation (e.g. `/#about`) still runs enter then exit so the overlay doesn’t stay.
- External and `#`-only links use normal navigation (no overlay).

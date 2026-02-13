# Testing Patterns

**Analysis Date:** 2026-02-11

## Test Framework

**Runner:**
- No test runner is configured or installed
- No `jest.config.*`, `vitest.config.*`, or similar config files exist in the project root
- No test-related dependencies in `package.json` (no Jest, Vitest, React Testing Library, etc.)
- No `test` script in `package.json`

**Planned (not implemented):**
- Jest + jsdom was planned per `tests/portfolio-carousel.test.spec.md` and `TESTING_SUMMARY.md`
- React Testing Library was planned as the component testing approach

**Assertion Library:**
- Not installed

**Run Commands:**
```bash
# No test commands exist. When tests are set up, use:
pnpm test              # Run all tests (not configured)
pnpm test:watch        # Watch mode (not configured)
pnpm test:coverage     # Coverage (not configured)
```

## Test File Organization

**Location:**
- One test specification file exists: `tests/portfolio-carousel.test.spec.md` (markdown spec, not executable)
- No actual executable test files (`.test.ts`, `.test.tsx`, `.spec.ts`) exist in the project

**Naming (per planned convention):**
- `[component-name].test.spec.md` for specifications
- `[component-name].test.tsx` for actual tests (when implemented)

**Structure:**
```
tests/                              # Planned top-level test directory
  portfolio-carousel.test.spec.md   # Test specification (markdown only)
```

## Test Structure

**No executable tests exist.** The specification document at `tests/portfolio-carousel.test.spec.md` outlines the intended structure:

**Planned Suite Organization:**
```typescript
// Pattern from tests/portfolio-carousel.test.spec.md
describe('PortfolioCarousel', () => {
  describe('Component Initialization', () => {
    it('should return null when images array is empty', () => {
      const { container } = render(<PortfolioCarousel images={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Image Rendering', () => {
    it('should render all provided images', () => {
      const images = [
        { url: '/img1.jpg', altText: 'Image 1' },
        { url: '/img2.jpg', altText: 'Image 2' },
      ];
      render(<PortfolioCarousel images={images} />);
      expect(screen.getAllByRole('img')).toHaveLength(2);
    });
  });
});
```

**Planned Patterns:**
- Setup: React Testing Library `render()` for component mounting
- Teardown: Not specified (RTL auto-cleans)
- Assertion: Jest matchers + `@testing-library/jest-dom` custom matchers

## Mocking

**Framework:** Not installed. Jest mocking was planned.

**Planned Patterns:**
```typescript
// From tests/portfolio-carousel.test.spec.md
const scrollMock = jest.fn();
const scrollRef = { current: { scrollTo: scrollMock, offsetWidth: 800 } };

fireEvent.click(nextButton);
await waitFor(() => {
  expect(scrollMock).toHaveBeenCalledWith({
    left: 800,
    behavior: 'smooth'
  });
});
```

**What Would Need Mocking:**
- `next/image` component (Next.js Image)
- `next/navigation` (`usePathname`, `useRouter`, `notFound`)
- `next-themes` (`useTheme`)
- `embla-carousel-react` (carousel API)
- `framer-motion` (animation components)
- `gsap` (GSAP animations)
- `fetch` calls to WordPress REST API
- `window.addEventListener` for keyboard events
- `document.cookie` for cookie consent

**What NOT to Mock:**
- Pure utility functions in `src/lib/utils/` (test directly)
- Type definitions
- CSS class application (test via class assertions)

## Fixtures and Factories

**Test Data:**
```typescript
// WordPress post fixture pattern (from test spec):
const mockPortfolioItem = {
  id: 56,
  slug: 'quigo-stencil',
  acf: [],
  _embedded: {
    'wp:featuredmedia': [{
      source_url: 'http://example.com/image.jpg',
      alt_text: 'Test image'
    }]
  }
};

// Carousel image fixture:
const mockImages = [
  { url: '/img1.jpg', altText: 'Image 1' },
  { url: '/img2.jpg', altText: 'Image 2' },
  { url: '/img3.jpg', altText: 'Image 3' }
];
```

**Location:**
- No fixtures directory exists
- Test data is defined inline in the spec file

## Coverage

**Requirements:** None enforced. No coverage tooling configured.

**Planned Coverage Targets (from TESTING_SUMMARY.md):**
- Code review coverage: claimed 100% for PortfolioCarousel
- Runtime testing: core scenarios only
- Unit test coverage: 0%
- E2E test coverage: 0%

**View Coverage:**
```bash
# Not configured. When set up:
pnpm test:coverage
```

## Test Types

**Unit Tests:**
- Not implemented
- Planned scope: Component rendering, props handling, state management, utility functions
- Recommended approach: Jest + React Testing Library

**Integration Tests:**
- Not implemented
- No integration test patterns defined

**E2E Tests:**
- Not implemented
- Playwright MCP directory exists (`.playwright-mcp/`) with console log files, suggesting some manual browser testing was done via Playwright MCP tool
- No Playwright config, no Playwright test files
- E2E scenarios outlined in `tests/portfolio-carousel.test.spec.md` (visual appearance, navigation, touch/swipe, keyboard, responsive, dark mode)

## Common Patterns

**Async Testing (planned):**
```typescript
it('should scroll to next slide when next arrow clicked', async () => {
  render(<PortfolioCarousel images={images} />);
  const nextButton = screen.getByLabelText('Next slide');
  fireEvent.click(nextButton);
  await waitFor(() => {
    expect(scrollMock).toHaveBeenCalled();
  });
});
```

**Error Testing (planned):**
```typescript
it('should return null when images is undefined', () => {
  const { container } = render(<PortfolioCarousel images={undefined} />);
  expect(container.firstChild).toBeNull();
});
```

## Recommended Test Setup (When Implementing)

**Install Dependencies:**
```bash
pnpm add -D jest @types/jest ts-jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Create `jest.config.ts`:**
```typescript
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);
```

**Create `jest.setup.ts`:**
```typescript
import '@testing-library/jest-dom';
```

**Add Scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Recommended Test File Location:**
- Co-locate with source: `src/components/portfolio/__tests__/PortfolioCarousel.test.tsx`
- Or top-level mirror: `tests/components/portfolio/PortfolioCarousel.test.tsx`

## Priority Test Targets

**High Priority (pure logic, easy to test):**
- `src/lib/utils/content.ts` - HTML stripping, truncation, slug utilities
- `src/lib/utils/date.ts` - Date formatting, relative time
- `src/lib/utils/image.ts` - URL handling, dimension calculations
- `src/lib/utils/wordpress.ts` - WordPress data extraction helpers
- `src/lib/cookies.ts` - Cookie consent management
- `src/lib/portfolio-utils.ts` - Category extraction, filtering
- `src/lib/wordpress/api.ts` - URL building, error handling (mock fetch)
- `src/lib/wordpress/portfolio.ts` - `extractImagesFromContent()` (pure function)

**Medium Priority (component rendering):**
- `src/components/blog/PostCard.tsx` - Renders post data correctly
- `src/components/portfolio/PortfolioCarousel.tsx` - Image display, navigation
- `src/components/ui/CookieConsentBanner.tsx` - Consent flow
- `src/components/sections/ContactSection.tsx` - Form validation, submission

**Low Priority (complex integrations):**
- `src/components/layout/Header.tsx` - GSAP animations, scroll triggers
- `src/components/ui/LiquidGradientBackground.tsx` - Canvas/WebGL rendering
- `src/components/layout/HeroThreeScene.tsx` - Three.js scene

## Existing Verification Approaches

While no automated tests exist, the codebase uses these verification methods:

1. **TypeScript strict mode** - Catches type errors at compile time (`tsconfig.json`: `strict: true`)
2. **ESLint** - Catches common code quality issues (`eslint.config.mjs`)
3. **Next.js build** - Static analysis during `next build` (TypeScript errors are NOT ignored: `typescript: { ignoreBuildErrors: false }`)
4. **Manual browser testing** - Evidence of Playwright MCP console logs in `.playwright-mcp/`
5. **Manual curl testing** - Commands documented in `TESTING_SUMMARY.md`
6. **Production monitoring** - `scripts/monitor-production.mjs` script for runtime checks

---

*Testing analysis: 2026-02-11*

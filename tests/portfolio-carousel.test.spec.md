# PortfolioCarousel Component Test Specification

## Component Under Test
**File:** `/src/components/portfolio/PortfolioCarousel.tsx`

**Purpose:** Display portfolio images in an interactive carousel with smooth scrolling and navigation controls.

---

## Test Suite 1: Component Initialization

### Test 1.1: Returns null when images array is empty
```typescript
it('should return null when images array is empty', () => {
  const { container } = render(<PortfolioCarousel images={[]} />);
  expect(container.firstChild).toBeNull();
});
```

### Test 1.2: Returns null when images prop is undefined
```typescript
it('should return null when images is undefined', () => {
  const { container } = render(<PortfolioCarousel images={undefined} />);
  expect(container.firstChild).toBeNull();
});
```

### Test 1.3: Renders when single image provided
```typescript
it('should render carousel with single image', () => {
  const images = [{ url: '/test.jpg', altText: 'Test Image' }];
  const { container } = render(<PortfolioCarousel images={images} />);
  expect(container.firstChild).not.toBeNull();
});
```

---

## Test Suite 2: Image Rendering

### Test 2.1: Renders correct number of images
```typescript
it('should render all provided images', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' },
    { url: '/img3.jpg', altText: 'Image 3' }
  ];
  render(<PortfolioCarousel images={images} />);
  expect(screen.getAllByRole('img')).toHaveLength(3);
});
```

### Test 2.2: Uses provided alt text
```typescript
it('should use provided alt text for images', () => {
  const images = [{ url: '/test.jpg', altText: 'Custom Alt Text' }];
  render(<PortfolioCarousel images={images} />);
  expect(screen.getByAltText('Custom Alt Text')).toBeInTheDocument();
});
```

### Test 2.3: Uses fallback alt text when not provided
```typescript
it('should use fallback alt text when altText is missing', () => {
  const images = [{ url: '/test.jpg' }];
  render(<PortfolioCarousel images={images} />);
  expect(screen.getByAltText('Project image 1')).toBeInTheDocument();
});
```

### Test 2.4: First image has priority loading
```typescript
it('should set priority prop on first image', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  const { container } = render(<PortfolioCarousel images={images} />);
  const firstImg = container.querySelector('img[alt="Image 1"]');
  // Verify Next.js Image component priority prop
  expect(firstImg?.closest('div')).toHaveAttribute('data-priority', 'true');
});
```

---

## Test Suite 3: Navigation Controls - Single Image

### Test 3.1: Hides navigation arrows for single image
```typescript
it('should not show navigation arrows when only one image', () => {
  const images = [{ url: '/test.jpg', altText: 'Test' }];
  render(<PortfolioCarousel images={images} />);
  expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Next slide')).not.toBeInTheDocument();
});
```

### Test 3.2: Hides navigation dots for single image
```typescript
it('should not show navigation dots when only one image', () => {
  const images = [{ url: '/test.jpg', altText: 'Test' }];
  render(<PortfolioCarousel images={images} />);
  expect(screen.queryByLabelText(/Go to slide/)).not.toBeInTheDocument();
});
```

---

## Test Suite 4: Navigation Controls - Multiple Images

### Test 4.1: Shows navigation arrows for multiple images
```typescript
it('should show navigation arrows when multiple images', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  render(<PortfolioCarousel images={images} />);
  expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
  expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
});
```

### Test 4.2: Previous arrow disabled on first slide
```typescript
it('should disable previous arrow on first slide', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  render(<PortfolioCarousel images={images} />);
  const prevButton = screen.getByLabelText('Previous slide');
  expect(prevButton).toBeDisabled();
});
```

### Test 4.3: Next arrow enabled on first slide
```typescript
it('should enable next arrow on first slide', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  render(<PortfolioCarousel images={images} />);
  const nextButton = screen.getByLabelText('Next slide');
  expect(nextButton).not.toBeDisabled();
});
```

### Test 4.4: Renders correct number of navigation dots
```typescript
it('should render navigation dots equal to number of images', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' },
    { url: '/img3.jpg', altText: 'Image 3' }
  ];
  render(<PortfolioCarousel images={images} />);
  expect(screen.getAllByLabelText(/Go to slide \d+/)).toHaveLength(3);
});
```

---

## Test Suite 5: Navigation Interaction

### Test 5.1: Clicking next arrow scrolls to next slide
```typescript
it('should scroll to next slide when next arrow clicked', async () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  render(<PortfolioCarousel images={images} />);
  const nextButton = screen.getByLabelText('Next slide');

  const scrollMock = jest.fn();
  const scrollRef = { current: { scrollTo: scrollMock, offsetWidth: 800 } };

  fireEvent.click(nextButton);
  // Verify scrollTo was called with correct parameters
  await waitFor(() => {
    expect(scrollMock).toHaveBeenCalledWith({
      left: 800,
      behavior: 'smooth'
    });
  });
});
```

### Test 5.2: Clicking previous arrow scrolls to previous slide
```typescript
it('should scroll to previous slide when previous arrow clicked', async () => {
  // Similar to Test 5.1 but for previous button
  // Start on slide 2, click previous, should scroll to slide 1
});
```

### Test 5.3: Clicking dot navigates to specific slide
```typescript
it('should navigate to specific slide when dot clicked', async () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' },
    { url: '/img3.jpg', altText: 'Image 3' }
  ];
  render(<PortfolioCarousel images={images} />);
  const thirdDot = screen.getByLabelText('Go to slide 3');

  fireEvent.click(thirdDot);
  // Verify navigation to third slide
});
```

---

## Test Suite 6: Active State Management

### Test 6.1: First slide active on initial render
```typescript
it('should have first slide active initially', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  render(<PortfolioCarousel images={images} />);
  const firstDot = screen.getByLabelText('Go to slide 1');
  expect(firstDot).toHaveClass('bg-white', 'w-6'); // Active state classes
});
```

### Test 6.2: Active state updates on scroll
```typescript
it('should update active state when user scrolls', () => {
  // Mock scroll event and verify activeIndex updates
});
```

### Test 6.3: Next arrow disables on last slide
```typescript
it('should disable next arrow when on last slide', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  const { container } = render(<PortfolioCarousel images={images} />);

  // Simulate being on last slide
  // activeIndex should be 1 (images.length - 1)
  const nextButton = screen.getByLabelText('Next slide');
  // After scrolling to last slide, next button should be disabled
});
```

---

## Test Suite 7: Styling & Responsive Behavior

### Test 7.1: Has correct container classes
```typescript
it('should have carousel container with correct styling', () => {
  const images = [{ url: '/test.jpg', altText: 'Test' }];
  const { container } = render(<PortfolioCarousel images={images} />);
  const carousel = container.querySelector('.snap-x.snap-mandatory');
  expect(carousel).toBeInTheDocument();
  expect(carousel).toHaveClass('rounded-2xl', 'shadow-2xl');
});
```

### Test 7.2: Has scrollbar hidden classes
```typescript
it('should hide scrollbar with multiple methods', () => {
  const images = [{ url: '/test.jpg', altText: 'Test' }];
  const { container } = render(<PortfolioCarousel images={images} />);
  const carousel = container.querySelector('.scrollbar-hide');
  expect(carousel).toBeInTheDocument();
});
```

### Test 7.3: Has correct aspect ratio classes
```typescript
it('should have responsive aspect ratio classes', () => {
  const images = [{ url: '/test.jpg', altText: 'Test' }];
  const { container } = render(<PortfolioCarousel images={images} />);
  const carousel = container.querySelector('[class*="aspect-"]');
  expect(carousel?.className).toContain('aspect-[16/9]');
  expect(carousel?.className).toContain('md:aspect-[21/9]');
});
```

---

## Test Suite 8: Accessibility

### Test 8.1: Navigation buttons have proper aria labels
```typescript
it('should have aria labels on navigation buttons', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  render(<PortfolioCarousel images={images} />);
  expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
  expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
});
```

### Test 8.2: Navigation dots have proper aria labels
```typescript
it('should have aria labels on navigation dots', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  render(<PortfolioCarousel images={images} />);
  expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
  expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
});
```

### Test 8.3: Images have alt text
```typescript
it('should have alt text on all images', () => {
  const images = [
    { url: '/img1.jpg', altText: 'Image 1' },
    { url: '/img2.jpg', altText: 'Image 2' }
  ];
  render(<PortfolioCarousel images={images} />);
  const imgs = screen.getAllByRole('img');
  imgs.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });
});
```

---

## Test Suite 9: Integration with Portfolio Page

### Test 9.1: Displays ACF gallery when available
```typescript
it('should display ACF gallery images when provided', async () => {
  // Mock portfolio item with ACF gallery
  const mockItem = {
    acf: {
      project_gallery: [
        { id: 1, url: '/gallery1.jpg', alt: 'Gallery 1' },
        { id: 2, url: '/gallery2.jpg', alt: 'Gallery 2' }
      ]
    }
  };

  // Render portfolio page with this data
  // Verify carousel shows 2 images from gallery
});
```

### Test 9.2: Falls back to featured image when no ACF gallery
```typescript
it('should display featured image when no ACF gallery', async () => {
  const mockItem = {
    acf: [],
    _embedded: {
      'wp:featuredmedia': [{
        source_url: '/featured.jpg',
        alt_text: 'Featured Image'
      }]
    }
  };

  // Render portfolio page
  // Verify carousel shows featured image
});
```

### Test 9.3: Returns null when no images available
```typescript
it('should return null when no images available', () => {
  const mockItem = {
    acf: [],
    _embedded: {}
  };

  // Render portfolio page
  // Verify carousel is not rendered
});
```

---

## E2E Test Scenarios (Playwright/Cypress)

### E2E 1: Visual appearance on load
- Navigate to portfolio detail page
- Verify carousel is visible
- Verify image loads without errors
- Take screenshot for visual regression

### E2E 2: Arrow navigation flow
- Navigate to portfolio with multiple images
- Verify previous arrow is disabled
- Click next arrow
- Verify scroll animation occurs
- Verify active dot changes
- Verify previous arrow becomes enabled
- Continue to last slide
- Verify next arrow becomes disabled

### E2E 3: Dot navigation
- Navigate to portfolio with multiple images
- Click on third dot
- Verify carousel jumps to third slide
- Verify active dot is third dot
- Verify correct arrow states

### E2E 4: Touch/swipe on mobile
- Set viewport to mobile size
- Navigate to portfolio page
- Swipe left on carousel
- Verify slide advances
- Verify active state updates

### E2E 5: Keyboard navigation
- Navigate to portfolio page
- Tab to carousel
- Use arrow keys to navigate
- Verify accessibility

### E2E 6: Responsive behavior
- Test at various breakpoints (mobile, tablet, desktop)
- Verify aspect ratio changes at md breakpoint
- Verify navigation controls remain functional
- Verify images scale appropriately

### E2E 7: Dark mode
- Navigate to portfolio page
- Toggle dark mode
- Verify carousel styling updates
- Verify navigation controls remain visible
- Verify no contrast issues

---

## Performance Tests

### Perf 1: First image loads quickly
- Measure time to first image render
- Should be < 1 second on good connection

### Perf 2: Smooth scrolling animation
- Measure frame rate during scroll
- Should maintain 60fps

### Perf 3: Large gallery performance
- Test with 20+ images
- Verify no lag in navigation
- Verify memory usage remains reasonable

---

## Setup Instructions

### Install Testing Dependencies
```bash
pnpm add -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom @testing-library/user-event
```

### Configure Jest
Create `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

Create `jest.setup.js`:
```javascript
import '@testing-library/jest-dom';
```

### Add Test Script to package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Current Test Status

As of 2026-02-03:
- ✅ Component code reviewed
- ✅ Logic verified correct
- ✅ Rendering confirmed working
- ❌ No unit tests implemented
- ❌ No E2E tests implemented
- ❌ No visual regression tests

**Priority:** Implement Test Suites 1-4 first (core functionality)

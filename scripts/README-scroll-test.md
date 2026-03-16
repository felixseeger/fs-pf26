# Scroll Debug Test

Tests homepage scroll in a real browser.

## Run

```bash
# Ensure dev server is running on port 3003
pnpm run dev

# In another terminal
pnpm run test:scroll
```

## Requirements

- Dev server at `http://localhost:3003`
- WordPress API configured in `.env.local` (otherwise homepage may return 500)

## Output

- Console: scroll state, body/html styles, scrollHeight vs clientHeight
- Screenshot: `scripts/scroll-debug.png` (full page)

## Interpreting Results

- **scrollHeight === clientHeight** → Page not scrollable (content = viewport height)
- **Response status: 500** → Server error; check WordPress API / .env
- **Has #main-content: false** → Layout not rendered (error page)

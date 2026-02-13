# Live production environment monitoring

This project uses **conf/start.md** for live URLs and a **monitor script** so you (or MCP tools) can verify a successful build and that WordPress data is available.

---

## 1. URLs (conf/start.md)

- **frontend:** Live Next.js site (e.g. `https://fs26-front.felixseeger.de`).
- **backend:** WordPress REST API (e.g. `http://fs26-back.felixseeger.de`).

Both are read by `scripts/prepare-live-env.mjs` (backend) and `scripts/monitor-production.mjs` (both).

---

## 2. Run the monitor (CLI)

After deploy, verify production:

```bash
pnpm run monitor
```

- **Exit 0:** Frontend reachable with expected content; WordPress API up and types available.
- **Exit 1:** One or more checks failed; script prints issues.

If the live host uses a generic TLS cert (e.g. `*.kasserver.com`), run with:

```bash
node scripts/monitor-production.mjs --insecure
# or: MONITOR_INSECURE=1 pnpm run monitor
```

JSON report only (for MCP/automation):

```bash
pnpm run monitor:json
# With TLS skip: node scripts/monitor-production.mjs --json --insecure
```

Output is a single JSON object with `ok`, `frontend`, `backend`, `issues`, `summary`.

---

## 3. Verify with MCP (Cursor browser)

To confirm the live site in the browser:

1. Open the frontend URL from **conf/start.md** (e.g. `https://fs26-front.felixseeger.de`).
2. Take a snapshot and check for:
   - Main content (e.g. “Felix Seeger”, hero, sections).
   - No blank or “Error loading content” where WordPress content should be.

Example prompt in Cursor: *“Open https://fs26-front.felixseeger.de and take a snapshot to verify the homepage shows WordPress content.”*

---

## 4. No WordPress data on production

The Next.js app uses **static export**: all WordPress data is fetched **at build time**. If the live site shows no CMS content:

1. **Run the monitor**  
   `pnpm run monitor`  
   It reports whether the backend is reachable and if a **homepage source** exists.

2. **Homepage source**  
   The homepage needs one of:
   - **Static front page** in WordPress (Settings → Reading) **and** the `wordpress-front-page-api.php` snippet added to your theme (registers `/wp/v2/front-page`), or  
   - A page with slug **`homepage`** or **`home`** (About/Services/FAQ/Contact come from that page’s ACF/Meta Box fields).

3. **Rebuild and redeploy**  
   After fixing WordPress (front page or page slug), run:
   ```bash
   pnpm run deploy
   ```
   so the new build fetches the correct data and uploads it.

4. **Backend reachable at build time**  
   Build runs on your machine; it must be able to reach `WORDPRESS_API_URL` (from `conf/start.md` via `pnpm run deploy:prepare`). If the backend was down during build, the exported HTML may have empty sections.

---

## 5. Monitor checks (reference)

| Check | Meaning |
|-------|--------|
| Frontend reachable | GET frontend URL returns 200. |
| Frontend has content | Response HTML contains e.g. “Felix Seeger” or `id="main-content"` or `__NEXT_DATA__`. |
| Backend reachable | GET `backend/wp-json/wp/v2/types` returns 200. |
| REST types OK | Response is valid JSON with post types. |
| Homepage source | One of `front-page`, `slug:homepage`, `slug:home`, or `none` (none = no CMS homepage data). |

If **homepage source** is `none`, the build can still succeed but the homepage will not show About/Services/FAQ/Contact from WordPress until you add a front page or a page with slug `homepage`/`home` and redeploy.

**If the monitor passes but the live site still shows no WordPress content:** the API is fine; the **WordPress pages have empty fields**. See **[WORDPRESS_CONTENT_CHECKLIST.md](WORDPRESS_CONTENT_CHECKLIST.md)** for which page is the homepage source, which page is the About page, and which fields to fill. After filling and saving in WordPress, run `pnpm run deploy` and hard-refresh the live site.

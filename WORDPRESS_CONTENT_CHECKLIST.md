# WordPress content checklist – why the frontend shows no data

If the **monitor** says "Frontend and backend reachable; WordPress data available" but the **live site** (or a page in WP admin) shows no CMS content, the API is fine – the **pages in WordPress have no content** in the fields the frontend uses.

---

## 1. Two different pages

| Page in WordPress | Used for | Where it appears on the frontend |
|-------------------|----------|-----------------------------------|
| **Homepage source** (slug `homepage` or `home`, or **static front page**) | Homepage sections | Homepage: About block, Services, FAQ, Contact section |
| **About page** (slug `about`) | About page | `/about`: main content + "Trusted by" / clients |

The screenshot you shared (post 1968 with "Kontaktperson", "Über uns – Vertrauen", "Standorte", "Team", "Karriere") is the **About** page. Those fields are for the About page only. If they are empty, the About page on the frontend will have no trust/locations/team/career blocks.

---

## 2. Homepage (so the start page has data)

Next.js loads the homepage from **one** of these (in order):

1. The page set as **static front page** in WordPress (Settings → Reading), if the `wordpress-front-page-api.php` snippet is active, or  
2. A page with slug **`homepage`**, or  
3. A page with slug **`home`**.

That page must have the **homepage** custom fields filled (Meta Box "Homepage Sections" or ACF with the same field names). Minimum to see content:

- **About:** `about_title`, `about_content` (and optionally `about_image`)
- **Services:** `services_title`, `services` (repeater: title, icon, description)
- **FAQ:** `faq_title`, `faq_items` (repeater: question, answer)
- **Contact:** `contact_title`, `contact_content`, `contact_email`, `contact_phone` (and optional office/CTA fields)

If this page is empty, the homepage will render but without these sections.

---

## 3. About page (post 1968 in your screenshot)

The **About** page (slug `about`) uses:

- **Main content:** block editor (the big "Schreibe Text oder wähle einen Block aus" area). If this is empty, the About page has no intro text.
- **Trust section:** `trust_section_title`, `trust_clients` (repeater: **name**, optional **image**).  
  In the admin these appear as "Über uns – Vertrauen" / "Trusted By" / "Clients". If `trust_clients` is empty, the "Trusted by" block on `/about` does not show.

Other blocks (Kontaktperson, Standorte, Team, Karriere) may be used by other templates or future features; the current frontend **About** page only uses the main content and the Trust section (`trust_section_title` + `trust_clients`).

---

## 4. What to do

1. **Homepage:**  
   - Open the page that is your **homepage source** (static front page, or the page with slug `homepage` or `home`).  
   - Fill **Homepage Sections** (Meta Box) or the same-named ACF fields (about, services, FAQ, contact).  
   - Save.

2. **About page (e.g. post 1968):**  
   - Add main content in the block editor.  
   - In "Über uns – Vertrauen" / Trust section, add at least one client (**name** required; image optional).  
   - Save.

3. **Redeploy:**  
   Data is baked in at **build time**. After saving in WordPress, run:
   ```bash
   pnpm run deploy
   ```
   Then check the live site again (hard refresh if needed).

---

## 5. Quick check in WordPress

- **Homepage source:** Settings → Reading → "Eine statische Seite" → "Startseite" = the page whose fields feed the homepage.  
  Or ensure you have a page with slug **homepage** or **home** and fill its homepage fields.
- **About:** Edit the page with slug **about** (e.g. post 1968); fill main content and Trust section so the frontend shows text and "Trusted by" clients.

Once these are filled and you redeploy, the frontend will show the WordPress data.

---

## 6. Courses (no course posts fetched)

The frontend calls the WordPress REST API for the **Course** post type. If `/courses` shows "No courses published yet", either there are no published Course posts or the CPT is **not exposed to the REST API**.

**Diagnose from this repo (optional):**

```bash
node scripts/diagnose-courses.mjs
```

This checks your backend’s `wp/v2/types` for a `course` type and tries both `/courses` and `/course`. If it reports "Course CPT: NOT REGISTERED in REST API", the fix is below.

**Do this in WordPress:**

1. **Expose the Course post type to the REST API**  
   Where the Course post type is registered (theme `functions.php`, plugin, or code snippet), ensure:
   - `'show_in_rest' => true`
   - Optionally set `'rest_base' => 'courses'` or `'rest_base' => 'course'` (the frontend tries both).

   Example when registering the CPT:
   ```php
   register_post_type('course', [
     'label'       => 'Courses',
     'public'      => true,
     'show_in_rest'=> true,
     'rest_base'   => 'courses',
     // ... other args
   ]);
   ```

2. **Check the route**  
   Open in the browser:  
   `https://your-wp-site.com/wp-json/wp/v2/`  
   You should see either `"courses"` or `"course"` in the list of namespaces/routes. If it’s missing, the CPT is still not in the REST API.

3. **Publish at least one Course**  
   Create or edit a Course post and set status to **Published**.

4. **Resave permalinks**  
   WordPress → Settings → Permalinks → click **Save** (no need to change anything).

5. **Redeploy or restart dev**  
   Then reload `/courses` on the frontend.

---

## 7. Services page (ACF not showing on frontend)

The frontend fetches the **Page** with slug **`services`** and uses its ACF for Hero, Trust, and CTA. If those sections still show fallback text or are missing:

1. **Page exists and slug is `services`**  
   Create or edit a Page, set the slug to **services** (URL slug), and publish it.

2. **Field group location**  
   The “Services Page” ACF field group must be assigned to **Page** and (if your ACF supports it) to the specific “Services” page. Fill Hero, Trust, and CTA fields on that page and save.

3. **Show in REST API**  
   Edit the “Services Page” field group in ACF → set **Show in REST API** to **Yes**. Without this, the REST response for the page will not include the `acf` object.

4. **Redeploy or restart dev**  
   Rebuild or restart so the app fetches the page again; then reload `/services`.

---

## 8. Service single pages (e.g. /services/ux-ui-design) – no content on live

Service **single** pages (e.g. `/services/ux-ui-design`) get their content from the WordPress **Services** custom post type at **build time**. The CPT is registered as **`services`** (plural). If the live site shows empty content or only the title:

1. **ACF field group must target post type `services` (plural)**  
   The “Service Subpage (Sales Layout)” field group must be assigned to **Post Type is equal to `services`** (not `service`). If it was set to `service` (singular), the fields never attach and the REST API returns empty `acf`.  
   In ACF: edit the field group → Location → Post Type **equals** **Services** (or `services`). Save. Re-import `docs/acf-service-subpage-fields.json` if needed; its location value is `services`.

2. **Show in REST API**  
   For that field group, set **Show in REST API** to **Yes** so the `acf` object is included in `/wp-json/wp/v2/services?slug=...`.

3. **Fill and save each Service post**  
   Edit each Service (e.g. “UX/UI Design”) and fill Hero, Problem, Solution, Process/Key Features/Use Cases, Deliverables, CTA. Save.

4. **Redeploy**  
   Content is baked in at build time. After changing WordPress, run `pnpm run deploy` and hard-refresh the live site.

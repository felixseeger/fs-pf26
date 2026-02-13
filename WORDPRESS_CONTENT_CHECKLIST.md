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

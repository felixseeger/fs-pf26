# Footer content – editable in WordPress

The site footer is driven by the **same WordPress page** used for the homepage (static front page, or a page with slug `homepage` / `home`). Add the following ACF or Meta Box fields to that page so the footer can be edited in WordPress.

## Field list

| Field key / name       | Type     | Description |
|------------------------|----------|-------------|
| `footer_about_title`   | Text     | Heading for the first column (e.g. "About"). |
| `footer_about_text`    | Textarea | Short about text in the first footer column. |
| `footer_connect_title`| Text     | Heading for the Connect/social column (e.g. "Connect"). |
| `footer_text`         | Textarea | Copyright / legal line. Use `{{year}}` for the current year (e.g. "© {{year}} Your Name."). Line breaks are preserved. |
| `social_links`        | Repeater | Social links. Each row: `platform` (select: `twitter`, `github`, `linkedin`, `instagram`, `facebook`) and `url` (URL). |

## Quick Links and Legal

- **Quick Links** uses the **Secondary Navigation** menu (Appearance → Menus). Create a menu whose slug or title matches "secondary-navigation" (or "secondary") and add your links.
- **Legal** column: Create a navigation menu whose slug or title matches **"footer-legal"** (or "legal") and add your legal pages (Impressum, Privacy, Terms, etc.). If no such menu exists, the app fetches WordPress pages by slug and shows any that exist, in this order: `impressum`, `imprint`, `privacy-policy`, `datenschutz`, `terms`, `impress`.

## Fallbacks

If the footer fields are left empty, the Next.js app uses default text and example social icons so the layout still works.

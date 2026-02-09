# Headless WordPress Next.js Blog Setup

## WordPress Setup Instructions

### 1. Prerequisite: Install Plugins

For this project to work, you must install the following plugins on your WordPress site:

1. **WP-REST-API V2 Menus** (Required for menu endpoints)
   - This enables the `/wp-json/wp-api-menus/v2/` endpoints.

2. **Any Security Plugins?**
   - Ensure they do not block REST API access.

No custom PHP code is required if you use these plugins.

### 2. Create and Assign Menus

After installing the plugins:

1. Go to **Appearance → Menus** in WordPress admin
2. Create a new menu called "Primary Navigation"
3. Click "Manage Locations" tab
4. Assign "Primary Navigation" to "Primary Navigation" location
5. Create another menu called "Secondary Navigation"
6. Assign it to "Secondary Navigation" location
7. Add menu items to each menu (Pages, Posts, Custom Links)
8. Save your menus

### 3. Verify Menu Endpoints

Test that menus are working with the plugin:

```bash
curl http://headless-wpnext-blog.local/wp-json/wp-api-menus/v2/menu-locations/primary-navigation
curl http://headless-wpnext-blog.local/wp-json/wp-api-menus/v2/menu-locations/secondary-navigation
```

### 4. Categories

Categories are automatically available via the WordPress REST API. You can:

- **Get all categories:** `GET /wp-json/wp/v2/categories`
- **Get posts by category:** Use the `getPostsByCategory()` function in your code

## Next.js Development

### Environment Variables

The `.env.local` file contains:

```env
WORDPRESS_API_URL=http://headless-wpnext-blog.local
NEXT_IMAGE_UNOPTIMIZED=true
```

### Running the Development Server

```bash
pnpm dev
```

### Available Functions

#### Posts
- `getPosts(perPage?, page?)` - Get all posts
- `getPostBySlug(slug)` - Get single post by slug
- `getPostsByCategory(categorySlug, perPage?, page?)` - Get posts by category

#### Pages
- `getPages(perPage?, page?)` - Get all pages
- `getPageBySlug(slug)` - Get single page by slug

#### Menus
- `getMenu(location)` - Get menu by location (`primary-navigation` or `secondary-navigation`)
- `getMenus()` - Get all menus

#### Categories
- `getCategories()` - Get all categories with post counts

### Troubleshooting

#### Featured Images Not Showing

Images from `.local` domains require unoptimized mode. This is already configured in `.env.local`:
```
NEXT_IMAGE_UNOPTIMIZED=true
```

#### Menus Not Loading

1. Verify the PHP code is added to `functions.php`
2. Check menus are created and assigned in WordPress
3. Test endpoints with curl commands above
4. Check server logs for error messages

#### Categories Not Loading

Categories should work by default. Test with:
```bash
curl http://headless-wpnext-blog.local/wp-json/wp/v2/categories
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with header/footer
│   ├── page.tsx             # Homepage with blog posts
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx     # Individual blog post
│   └── [slug]/
│       └── page.tsx         # WordPress pages
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # Header with primary navigation
│   │   ├── Footer.tsx       # Footer with secondary navigation
│   │   └── BlogHero.tsx     # Hero section component
│   └── blog/
│       ├── PostCard.tsx     # Blog post card
│       ├── PostList.tsx     # Grid of post cards
│       └── EmptyState.tsx   # Empty state component
├── lib/
│   └── wordpress.ts         # WordPress API functions
└── types/
    └── wordpress.ts         # TypeScript types
```

## Features

- ✅ Server-side rendering (SSR)
- ✅ Featured images
- ✅ Dynamic blog posts and pages
- ✅ WordPress menus integration
- ✅ Categories support
- ✅ TypeScript types
- ✅ Dark mode support
- ✅ Responsive design

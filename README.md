This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Backend (WordPress)

Content is fetched from a headless WordPress backend. **You must set the backend URL** or the app will throw on startup and no data will be loaded.

- **Development:** Copy `.env.example` to `.env.local` and set `WORDPRESS_API_URL` to your WordPress URL (e.g. `http://localhost:10010` or `http://fs26-back.felixseeger.de`). No trailing slash.
- **Production build:** Run `node scripts/prepare-live-env.mjs` before `pnpm build` (or use `pnpm run deploy`, which does prepare → build → FTP).
- If you see **no data** in the app: (1) Confirm `WORDPRESS_API_URL` is set and correct. (2) Ensure the WordPress site is running and the REST API is reachable (e.g. open `WORDPRESS_API_URL/wp-json/wp/v2/types` in a browser). (3) Check the terminal for "WordPress API response status" and any error logs.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# fs-pf26

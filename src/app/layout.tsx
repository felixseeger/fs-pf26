// Minimal root layout — required by Next.js so that non-locale routes (api/,
// manifest, robots, sitemap) still have a document root.
// The real <html>/<body> shell and all providers live in [locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

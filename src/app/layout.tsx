import { Geist, Geist_Mono, Unbounded, Poppins } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Minimal root layout — required by Next.js so that non-locale routes (api/,
// manifest, robots, sitemap) still have a document root.
// Locale-specific providers/content live in [locale]/layout.tsx.
// Font CSS-variables are set on <html> so globals.css can access them on html/body.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

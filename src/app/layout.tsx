import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CookieConsentProvider } from "@/components/providers/CookieConsentProvider";
import SmoothScroll from "@/components/layout/SmoothScroll";
import ScrollToTop from "@/components/ui/ScrollToTop";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import CookieSettingsButton from "@/components/ui/CookieSettingsButton";

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

export const metadata: Metadata = {
  title: {
    default: "Felix Seeger",
    template: "%s | Felix Seeger",
  },
  description: "Personal website and blog of Felix Seeger",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Felix Seeger",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} ${poppins.variable} font-poppins antialiased flex flex-col min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* Inline script runs before Next.js so we suppress Event rejections first */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('unhandledrejection',function(e){var r=e.reason;if(r&&(r instanceof Event||(r.constructor&&r.constructor.name==='Event')||(r instanceof Error&&r.message==='[object Event]')))e.preventDefault();},true);`,
          }}
        />
        <ThemeProvider>
          <CookieConsentProvider>
            <SmoothScroll>
              <Header />
              <main className="grow" id="main-content">{children}</main>
              <Footer />
              <ScrollToTop threshold={400} />
            </SmoothScroll>
            <CookieConsentBanner />
            <CookieSettingsButton />
          </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

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
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";
import { getSiteUrl, SITE_NAME } from "@/lib/site-config";
import JsonLd from "@/components/seo/JsonLd";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getHomePage } from "@/lib/wordpress";

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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Web design, development, and digital strategy. Felix Seeger helps businesses grow with custom websites and high-performance frontends. Get in touch for a project quote.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch homepage ACF fields for WhatsApp config (build-time)
  const homepage = await getHomePage().catch(() => null);
  const acf = homepage?.acf ?? homepage?.meta_box;

  const waPhone = acf?.whatsapp_phone?.trim() || '';

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
        <JsonLd />
        <ThemeProvider>
          <CookieConsentProvider>
            <PageTransitionProvider defaultTransition="slideRight">
            <SmoothScroll>
              <a href="#main-content" className="skip-link bg-primary text-primary-foreground">
                Skip to main content
              </a>
              <Header />
              <main className="grow" id="main-content">{children}</main>
              <Footer />
              <ScrollToTop threshold={400} />
            </SmoothScroll>
            </PageTransitionProvider>
            <CookieConsentBanner />
            <CookieSettingsButton />
            {waPhone && (
              <WhatsAppButton
                phone={waPhone}
                message={acf?.whatsapp_message?.trim() || undefined}
                contactName={acf?.whatsapp_contact_name?.trim() || undefined}
                contactRole={acf?.whatsapp_contact_role?.trim() || undefined}
                headerText={acf?.whatsapp_header_text?.trim() || undefined}
              />
            )}
          </CookieConsentProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

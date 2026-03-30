import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CookieConsentProvider } from "@/components/providers/CookieConsentProvider";
import { TamboProvider } from "@/components/providers/TamboProvider";
import SmoothScroll from "@/components/layout/SmoothScroll";
import ScrollToTop from "@/components/ui/ScrollToTop";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import CookieSettingsButton from "@/components/ui/CookieSettingsButton";
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";
import { ShopCartProvider } from "@/components/providers/ShopCartProvider";
import { getSiteUrl, SITE_NAME } from "@/lib/site-config";
import JsonLd from "@/components/seo/JsonLd";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import PlausibleAnalytics from "@/components/analytics/PlausibleAnalytics";
import { getHomePage } from "@/lib/wordpress";
import { getMenuItems } from "@/lib/wordpress/menus";
import { toFrontendHref } from "@/lib/site-config";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Web design, development, and digital strategy. Felix Seeger helps businesses grow with custom websites and high-performance frontends. Get in touch for a project quote.",
  openGraph: {
    type: "website",
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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Reject unknown locales
  if (!routing.locales.includes(locale as "de" | "en")) {
    notFound();
  }

  // Ensure server helpers and client provider use the route locale.
  setRequestLocale(locale);

  // Fetch messages for NextIntlClientProvider
  const messages = await getMessages({ locale });

  // Fetch primary navigation from WordPress (Polylang: primary-navigation / primary-navigation-en).
  // Try "primary-navigation" first; if it returns fewer than 3 items (incomplete menu),
  // also try "quick-links" (a common alternative slug) and take whichever is richer.
  const toNavItem = (item: { title: string; url: string }) => ({
    name: item.title,
    href: toFrontendHref(item.url).href,
  });

  const [wpPrimary, wpQuick] = await Promise.all([
    getMenuItems('primary-navigation', locale).catch(() => []),
    getMenuItems('quick-links', locale).catch(() => []),
  ]);

  const primaryRaw  = wpPrimary.map(toNavItem).filter(i => i.name && i.href);
  const quickRaw    = wpQuick.map(toNavItem).filter(i => i.name && i.href);

  // Use whichever source has more items; require at least 3 to override the
  // hardcoded translation fallback defined in Header.tsx.
  const primaryNavItems =
    primaryRaw.length >= quickRaw.length && primaryRaw.length >= 3
      ? primaryRaw
      : quickRaw.length >= 3
        ? quickRaw
        : [];

  // Fetch homepage ACF fields for WhatsApp config (build-time)
  const homepage = await getHomePage({ lang: locale }).catch(() => null);
  const acf = homepage?.acf ?? homepage?.meta_box;
  const waPhone = acf?.whatsapp_phone?.trim() || "";

  const tamboProjectId =
    process.env.NEXT_PUBLIC_TAMBO_PROJECT_ID || "p_zez4rMPZ.d5ac95";

  const ogLocale = locale === "de" ? "de_DE" : "en_US";

  return (
    <>
      {/* Suppress unhandled Event rejections before Next.js hydration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.addEventListener('unhandledrejection',function(e){var r=e.reason;if(r&&(r instanceof Event||(r.constructor&&r.constructor.name==='Event')||(r instanceof Error&&r.message==='[object Event]')))e.preventDefault();},true);`,
        }}
      />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <JsonLd />
        <TamboProvider>
          <ThemeProvider>
            <ShopCartProvider>
              <CookieConsentProvider>
                <PageTransitionProvider defaultTransition="slideRight">
                  <SmoothScroll>
                    <div
                      className="scroll-smooth font-poppins antialiased flex flex-col min-h-screen bg-background text-foreground"
                    >
                      <a
                        href="#main-content"
                        className="skip-link bg-primary text-primary-foreground"
                      >
                        Skip to main content
                      </a>
                      <Header locale={locale} navItems={primaryNavItems.length > 0 ? primaryNavItems : undefined} />
                      <main className="grow" id="main-content">
                        {children}
                      </main>
                      <Footer locale={locale} />
                    </div>
                    <ScrollToTop threshold={400} />
                  </SmoothScroll>
                </PageTransitionProvider>
                <CookieConsentBanner />
                <CookieSettingsButton />
                {waPhone && (
                  <WhatsAppButton
                    phone={waPhone}
                    message={acf?.whatsapp_message?.trim() || undefined}
                    contactName={
                      acf?.whatsapp_contact_name?.trim() || undefined
                    }
                    contactRole={
                      acf?.whatsapp_contact_role?.trim() || undefined
                    }
                    headerText={
                      acf?.whatsapp_header_text?.trim() || undefined
                    }
                  />
                )}
              </CookieConsentProvider>
            </ShopCartProvider>
          </ThemeProvider>
        </TamboProvider>
      </NextIntlClientProvider>
      <SpeedInsights />
      <PlausibleAnalytics />
      {tamboProjectId && (
        <Script
          src={`https://cdn.tambo.co/${tamboProjectId}.js`}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}

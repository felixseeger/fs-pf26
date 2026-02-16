import type { Metadata } from "next";
import { getPortfolioItems, getHomePage, getServiceItems } from "@/lib/wordpress";
import { WPPortfolioItem, WPPage, ACFImage, WPServiceItem } from "@/types/wordpress";
import { getCanonicalUrl } from "@/lib/site-config";
import HomepageHero from "@/components/layout/HomepageHero";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/') },
};
import SelectedWorksSection from "@/components/sections/SelectedWorksSection";
import AboutSectionImage from "@/components/sections/AboutSectionImage";
import AboutSectionContent from "@/components/sections/AboutSectionContent";
import ServicesSection, { Service } from "@/components/sections/ServicesSection";
import FAQSection from "@/components/sections/FAQSection";
import NewsletterCollect from "@/components/ui/NewsletterCollect";
import HomePreloaderWrapper from "@/components/HomePreloaderWrapper";

import { getServiceIconUrl } from '@/lib/service-icons';

function mapWPServicesToSection(services: WPServiceItem[]): Service[] {
  return services.map((service) => {
    const featuredImage = service._embedded?.['wp:featuredmedia']?.[0];
    const servicesGallery = service.acf?.services_gallery;
    const wpIconUrl = servicesGallery && typeof servicesGallery === 'object' && 'url' in servicesGallery
      ? (servicesGallery as ACFImage).url
      : featuredImage?.source_url;
    const iconUrl = getServiceIconUrl(service.slug, wpIconUrl);
    const iconAlt = servicesGallery && typeof servicesGallery === 'object' && 'alt' in servicesGallery
      ? (servicesGallery as ACFImage).alt
      : featuredImage?.alt_text;
    const description = service.acf?.service_short_description
      || (service.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || '');
    return {
      id: service.slug,
      iconUrl: iconUrl || undefined,
      iconAlt: iconAlt || service.title.rendered,
      title: service.title.rendered,
      description,
      slug: service.slug,
    };
  });
}

export default async function Home() {
  let portfolioItems: WPPortfolioItem[] = [];
  let homePage: WPPage | null = null;

  let serviceItems: WPServiceItem[] = [];

  try {
    const [portfolioData, homePageData, servicesData] = await Promise.all([
      getPortfolioItems(12),
      getHomePage(),
      getServiceItems(24),
    ]);
    portfolioItems = portfolioData || [];
    homePage = homePageData;
    serviceItems = servicesData || [];
  } catch (err) {
    console.error("Error fetching content:", err);
  }

  // Extract custom fields from homepage (supports both Meta Box and ACF)
  const acf = homePage?.meta_box || homePage?.acf;

  // Featured image from the homepage (fallback for about_image)
  const homeFeaturedImage = homePage?._embedded?.['wp:featuredmedia']?.[0];

  return (
    <HomePreloaderWrapper>
      <div className="min-h-screen bg-white font-sans dark:bg-background" suppressHydrationWarning>
      {/* Hero Section with Portfolio Items */}
      <HomepageHero items={portfolioItems} />

      <div className="py-24 overflow-hidden" role="region" aria-label="Homepage content" suppressHydrationWarning>
        {/* About Section - from WordPress ACF */}
        {acf?.about_content && (
          <section id="about" className="mb-24" suppressHydrationWarning>
            <div className="max-w-6xl mx-auto px-4 relative" suppressHydrationWarning>
              {/* Layout: image + sticky content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[600px] lg:pt-[8vh] lg:items-start" suppressHydrationWarning>

                {/* Image Column - unmask on scroll */}
                {(() => {
                  const aboutImageUrl = acf.about_image
                    ? typeof acf.about_image === 'string'
                      ? acf.about_image
                      : typeof acf.about_image === 'object' && 'url' in acf.about_image
                        ? (acf.about_image as ACFImage).url
                        : null
                    : homeFeaturedImage?.source_url || null;
                  const aboutImageAlt = acf.about_image && typeof acf.about_image === 'object' && 'alt' in acf.about_image
                    ? (acf.about_image as ACFImage).alt || 'About image'
                    : homeFeaturedImage?.alt_text || 'About image';
                  return aboutImageUrl ? (
                    <AboutSectionImage
                      src={aboutImageUrl}
                      alt={aboutImageAlt}
                      priority
                    />
                  ) : null;
                })()}

                {/* Content Column - sticky, text reveals on scroll */}
                <AboutSectionContent
                  title={acf.about_title || 'Unlock Revenue Growth for Your Business'}
                  contentHtml={acf.about_content}
                />
              </div>
            </div>
          </section>
        )}

        {/* Selected Works - Masonry Portfolio Grid */}
        <SelectedWorksSection items={portfolioItems} maxItems={6} />

        {/* Services Section - from WordPress services post type (services_gallery icons) */}
        <ServicesSection
          services={
            serviceItems.length > 0
              ? mapWPServicesToSection(serviceItems)
              : undefined
          }
        />

        {/* FAQ Section - from WordPress ACF */}
        {acf?.faq_items && acf.faq_items.length > 0 && (
          <FAQSection
            faqTitle={acf.faq_title || 'Frequently Asked Questions'}
            faqItems={acf.faq_items}
            contactPhone={acf.contact_phone}
            contactEmail={acf.contact_email}
            faqPhoneCardTitle={acf.faq_phone_card_title}
            faqPhoneCardDescription={acf.faq_phone_card_description}
            faqEmailCardTitle={acf.faq_email_card_title}
            faqEmailCardDescription={acf.faq_email_card_description}
          />
        )}

        {/* Newsletter Signup */}
        <section className="max-w-3xl mx-auto px-4 mt-24">
          <NewsletterCollect
            variant="card"
            group="blog"
            source="homepage"
            title="Stay in the loop"
            description="Get weekly insights on AI, web development, and building digital products. No spam, unsubscribe anytime."
            ctaText="Subscribe"
          />
        </section>

      </div>
    </div>
    </HomePreloaderWrapper>
  );
}

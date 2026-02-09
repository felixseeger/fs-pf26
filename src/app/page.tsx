import { getPosts, getPortfolioItems, getHomePage } from "@/lib/wordpress";
import PostList from "@/components/blog/PostList";
import { WPPost, WPPortfolioItem, WPPage, ACFImage } from "@/types/wordpress";
import HomepageHero from "@/components/layout/HomepageHero";
import ContactSection from "@/components/sections/ContactSection";
import TiltCard from "@/components/ui/TiltCard";
import Image from "next/image";
import { Phone, Mail, ArrowRight } from "lucide-react";

export default async function Home() {
  let posts: WPPost[] = [];
  let portfolioItems: WPPortfolioItem[] = [];
  let homePage: WPPage | null = null;
  let error: string | null = null;

  try {
    const [postsData, portfolioData, homePageData] = await Promise.all([
      getPosts(6),
      getPortfolioItems(5),
      getHomePage()
    ]);
    posts = postsData || [];
    portfolioItems = portfolioData || [];
    homePage = homePageData;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch content";
    console.error("Error fetching content:", err);
  }

  // Extract custom fields from homepage (supports both Meta Box and ACF)
  const acf = homePage?.meta_box || homePage?.acf;

  // Featured image from the homepage (fallback for about_image)
  const homeFeaturedImage = homePage?._embedded?.['wp:featuredmedia']?.[0];

  return (
    <div className="min-h-screen bg-white font-sans dark:bg-black" suppressHydrationWarning>
      {/* Hero Section with Portfolio Items */}
      <HomepageHero items={portfolioItems} />

      <main className="py-24 overflow-hidden" suppressHydrationWarning>
        {/* About Section - from WordPress ACF */}
        {acf?.about_content && (
          <section id="about" className="mb-24" suppressHydrationWarning>
            <div className="max-w-6xl mx-auto px-4 relative" suppressHydrationWarning>
              {/* Layout container with overlap effect */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[600px]" suppressHydrationWarning>

                {/* Image Column - extends beyond container */}
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
                    <div className="lg:col-span-5 relative" suppressHydrationWarning>
                      <div className="relative h-[400px] lg:h-full lg:absolute lg:inset-0 lg:-left-20 xl:-left-32" suppressHydrationWarning>
                        <Image
                          src={aboutImageUrl}
                          alt={aboutImageAlt}
                          fill
                          className="object-cover object-center"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Content Column - Primary colored block with overlap */}
                <div className="lg:col-span-7 lg:col-start-6 relative z-10" suppressHydrationWarning>
                  <div className="bg-primary p-8 md:p-12 lg:p-16 lg:-ml-20 min-h-full flex flex-col justify-center" suppressHydrationWarning>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-unbounded font-black text-primary-foreground mb-6 leading-tight">
                      {acf.about_title || 'Unlock Revenue Growth for Your Business'}
                    </h2>
                    <div
                      className="prose prose-lg max-w-none text-primary-foreground/80 mb-8 [&>p]:mb-4 [&>p]:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: acf.about_content }}
                      suppressHydrationWarning
                    />
                    <a
                      href="/about"
                      className="inline-flex items-center gap-2 text-primary-foreground font-bold uppercase tracking-widest text-sm hover:gap-4 transition-all group"
                    >
                      More About Me
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services Section - from WordPress ACF */}
        {acf?.services && acf.services.length > 0 && (
          <section id="services" className="mb-24 max-w-6xl mx-auto px-4" suppressHydrationWarning>
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4" suppressHydrationWarning>
                <span className="w-12 h-px bg-zinc-300 dark:bg-zinc-800" />
                <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">Services</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white">
                {acf.services_title || 'What I Do'}
              </h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning>
              {acf.services.map((service, index) => {
                // Get icon URL from string or ACFImage object
                const iconUrl = service.icon
                  ? typeof service.icon === 'string'
                    ? service.icon
                    : (service.icon as ACFImage).url
                  : null;

                return (
                  <TiltCard
                    key={index}
                    className="service-card p-8 bg-zinc-100 dark:bg-zinc-900 rounded-2xl group hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {iconUrl && (
                      <div className="mb-6 w-12 h-12 service-icon" suppressHydrationWarning>
                        <img
                          src={iconUrl}
                          alt={`${service.title} icon`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {service.description}
                    </p>
                  </TiltCard>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQ Section - from WordPress ACF */}
        {acf?.faq_items && acf.faq_items.length > 0 && (
          <section id="faq" className="mb-24 max-w-6xl mx-auto px-4" suppressHydrationWarning>
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4" suppressHydrationWarning>
                <span className="w-12 h-px bg-zinc-300 dark:bg-zinc-800" />
                <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">FAQ</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white">
                {acf.faq_title || 'Frequently Asked Questions'}
              </h2>
            </header>
            <div className="space-y-4" suppressHydrationWarning>
              {acf.faq_items.map((faq, index) => (
                <TiltCard key={index} className="rounded-lg">
                  <details className="group p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg h-full">
                    <summary className="flex justify-between items-center cursor-pointer list-none text-lg font-bold text-black dark:text-white">
                      {faq.question}
                      <span className="ml-4 text-2xl group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <div
                      className="mt-4 text-zinc-600 dark:text-zinc-400 prose dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                      suppressHydrationWarning
                    />
                  </details>
                </TiltCard>
              ))}
            </div>

            {/* FAQ Contact CTA Cards */}
            {(acf.contact_phone || acf.contact_email) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12" suppressHydrationWarning>
                {acf.contact_phone && (
                  <TiltCard className="bg-zinc-800 dark:bg-zinc-900 rounded-2xl p-8 flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6">
                        <Phone size={24} className="text-primary-foreground" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-3">
                        {acf.faq_phone_card_title || 'Contact Me'}
                      </h3>
                      <p className="text-zinc-400 leading-relaxed">
                        {acf.faq_phone_card_description || "Ready to discuss your project? I'm here to answer any questions and provide personalized solutions for your business needs."}
                      </p>
                    </div>
                    <a
                      href={`tel:${acf.contact_phone.replace(/\s/g, '')}`}
                      className="inline-flex items-center gap-2 text-white font-bold mt-8 group/link hover:text-primary transition-colors"
                    >
                      {acf.contact_phone}
                      <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </TiltCard>
                )}

                {acf.contact_email && (
                  <TiltCard className="bg-zinc-800 dark:bg-zinc-900 rounded-2xl p-8 flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6">
                        <Mail size={24} className="text-primary-foreground" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-3">
                        {acf.faq_email_card_title || 'Send a Message'}
                      </h3>
                      <p className="text-zinc-400 leading-relaxed">
                        {acf.faq_email_card_description || 'Good website tells a story that will make users fully immerse themselves operating'}
                      </p>
                    </div>
                    <a
                      href={`mailto:${acf.contact_email}`}
                      className="inline-flex items-center gap-2 text-white font-bold mt-8 group/link hover:text-primary transition-colors"
                    >
                      {acf.contact_email}
                      <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </TiltCard>
                )}
              </div>
            )}
          </section>
        )}

        {/* Contact Section - from WordPress ACF */}
        {(acf?.contact_content || acf?.contact_email) && (
          <ContactSection
            contact_title={acf.contact_title}
            contact_content={acf.contact_content}
            contact_email={acf.contact_email}
            contact_phone={acf.contact_phone}
            contact_office_city={acf.contact_office_city}
            contact_office_country={acf.contact_office_country}
            contact_cta_title={acf.contact_cta_title}
            contact_cta_description={acf.contact_cta_description}
            contact_cta_badge={acf.contact_cta_badge}
            contact_privacy_policy_url={acf.contact_privacy_policy_url}
            contact_submit_button_text={acf.contact_submit_button_text}
          />
        )}

        {/* Blog Section */}
        <div className="max-w-6xl mx-auto px-4" suppressHydrationWarning>
          <header className="mb-16">
            <div className="flex items-center gap-4 mb-4" suppressHydrationWarning>
              <span className="w-12 h-px bg-zinc-300 dark:bg-zinc-800" />
              <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">The Journal</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white">
              Latest Thoughts
            </h2>
          </header>

          {/* Error message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                Error loading content: {error}
              </p>
            </div>
          )}

          {/* Posts Grid */}
          {!error && <PostList posts={posts} />}
        </div>
      </main>
    </div>
  );
}

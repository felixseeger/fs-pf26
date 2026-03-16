import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getAllServiceItems, getPageBySlug } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ServiceGrid from '@/components/services/ServiceGrid';
import DotMatrixStatic from '@/components/DotMatrix/DotMatrixStatic';

export const metadata: Metadata = {
    title: 'Services',
    description: 'Web design, development, and digital strategy. Book a consultation or request a quote for your project.',
    alternates: { canonical: getCanonicalUrl('/services') },
};

const FALLBACK_HEADLINE = 'My Services.';
const FALLBACK_SUBHEADLINE = 'Comprehensive digital solutions tailored to your needs. From concept to execution, I deliver high-quality work that drives results.';

export default async function ServicesPage() {
    const [servicesPage, services] = await Promise.all([
        getPageBySlug('services'),
        getAllServiceItems(),
    ]);

    const acf = servicesPage?.acf;
    const heroHeadline = acf?.hero_headline?.trim() || FALLBACK_HEADLINE;
    const heroSubheadline = acf?.hero_subheadline?.trim() || FALLBACK_SUBHEADLINE;
    const hasTrust = acf?.trust_headline?.trim() || acf?.trust_body || (acf?.trust_items && acf.trust_items.length > 0);
    const hasCta = acf?.cta_headline?.trim() || acf?.cta_button_text?.trim();
    const ctaLink = acf?.cta_button_link?.trim() || '/contact';

    return (
        <div className="min-h-screen bg-white dark:bg-background relative overflow-hidden" suppressHydrationWarning>
            <DotMatrixStatic color="#3b82f6" dotSize={2} spacing={20} opacity={0.18} className="absolute inset-0 -z-10" />
            <main className="max-w-6xl mx-auto px-6 pt-36 pb-20 relative">
                <div className="mb-8">
                    <Breadcrumb items={getBreadcrumbItems('/services')} />
                </div>
                <header className="max-w-3xl mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">
                        {heroHeadline === FALLBACK_HEADLINE ? (
                            <>
                                My <span className="text-blue-600 dark:text-blue-500">Services.</span>
                            </>
                        ) : (
                            heroHeadline
                        )}
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                        {heroSubheadline}
                    </p>
                </header>

                {hasTrust && (
                    <section className="max-w-3xl mb-20" aria-labelledby="trust-heading">
                        {acf?.trust_headline?.trim() && (
                            <h2 id="trust-heading" className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
                                {acf.trust_headline}
                            </h2>
                        )}
                        {acf?.trust_body && (
                            <div
                                className="prose prose-lg dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 mb-8"
                                dangerouslySetInnerHTML={{ __html: acf.trust_body }}
                            />
                        )}
                        {acf?.trust_items && acf.trust_items.length > 0 && (
                            <ul className="space-y-4 list-none pl-0">
                                {acf.trust_items.map((item, i) => (
                                    <li key={i} className="flex flex-col gap-1">
                                        {item.title && (
                                            <span className="font-semibold text-zinc-900 dark:text-white">
                                                {item.title}
                                            </span>
                                        )}
                                        {item.description && (
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                {item.description}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                <ServiceGrid services={services} />

                {hasCta && (
                    <section className="mt-20 pt-16 border-t border-zinc-200 dark:border-zinc-800 text-center" aria-labelledby="cta-heading">
                        {acf?.cta_headline?.trim() && (
                            <h2 id="cta-heading" className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-6">
                                {acf.cta_headline}
                            </h2>
                        )}
                        {acf?.cta_button_text?.trim() && (
                            <Link
                                href={ctaLink}
                                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                {acf.cta_button_text}
                            </Link>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}

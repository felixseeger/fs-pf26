import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ContactPageClient from './ContactPageClient';

async function getContactPageForLocale(locale?: string) {
    const lang = locale || 'de';

    const localeCandidates = lang === 'de'
        ? [
            await getPageBySlug('kontakt', lang),
            await getPageBySlug('contact', lang),
        ]
        : [
            await getPageBySlug('contact', lang),
            await getPageBySlug('kontakt', lang),
        ];

    const fallbackCandidates = lang === 'de'
        ? [
            await getPageBySlug('kontakt'),
            await getPageBySlug('contact'),
        ]
        : [
            await getPageBySlug('contact'),
            await getPageBySlug('kontakt'),
        ];

    const scorePage = (page: Awaited<ReturnType<typeof getPageBySlug>>): number => {
        if (!page) return -1;
        let score = 0;
        if (typeof page.featured_media === 'number' && page.featured_media > 0) score += 10;

        const acfObj = page.acf && typeof page.acf === 'object' && !Array.isArray(page.acf) ? page.acf : null;
        const metaObj = page.meta_box && typeof page.meta_box === 'object' && !Array.isArray(page.meta_box) ? page.meta_box : null;
        if (acfObj && Object.keys(acfObj).length > 0) score += 5;
        if (metaObj && Object.keys(metaObj).length > 0) score += 5;

        return score;
    };

    const pickBest = (candidates: Array<Awaited<ReturnType<typeof getPageBySlug>>>) => {
        let best = null as Awaited<ReturnType<typeof getPageBySlug>>;
        let bestScore = -1;
        for (const candidate of candidates) {
            const s = scorePage(candidate);
            if (s > bestScore) {
                best = candidate;
                bestScore = s;
            }
        }
        return best;
    };

    // Always prefer locale-specific pages first to avoid mixed-language UI.
    const localeBest = pickBest(localeCandidates);
    if (localeBest) return localeBest;

    const fallbackBest = pickBest(fallbackCandidates);
    if (fallbackBest) return fallbackBest;

    // Last resort: keep previous behavior across all candidates.
    const allCandidates = [...localeCandidates, ...fallbackCandidates];
    let best = null as Awaited<ReturnType<typeof getPageBySlug>>;
    let bestScore = -1;
    for (const candidate of allCandidates) {
        const s = scorePage(candidate);
        if (s > bestScore) {
            best = candidate;
            bestScore = s;
        }
    }

    return best;
}

function getLocalizedContactTitle(locale: string, rawTitle?: string) {
    const isDe = locale === 'de';
    const title = rawTitle?.replace(/<[^>]*>/g, '').trim();

    if (!title) return isDe ? 'Kontakt' : 'Contact';
    if (isDe) return title;

    const normalized = title.toLowerCase();
    if (normalized === 'kontakt') return 'Contact';

    return title;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const page = await getContactPageForLocale(locale);
    const isDe = locale === 'de';
    if (!page) {
        return {
            title: isDe ? 'Kontakt' : 'Contact',
            description: isDe
                ? 'Nimm Kontakt auf fuer Projektanfragen, Angebote und Zusammenarbeit. Felix Seeger - Duesseldorf. Kontaktformular und Kontaktdaten.'
                : 'Get in touch for project inquiries, quotes, and collaboration. Felix Seeger - Duesseldorf. Contact form and details.',
            alternates: { canonical: getCanonicalUrl('/contact') },
        };
    }
    return {
        title: getLocalizedContactTitle(locale, page.title.rendered),
        description: isDe
            ? 'Nimm Kontakt auf fuer Projektanfragen, Angebote und Zusammenarbeit. Felix Seeger - Duesseldorf. Kontaktformular und Kontaktdaten.'
            : 'Get in touch for project inquiries, quotes, and collaboration. Felix Seeger - Duesseldorf. Contact form and details.',
        alternates: { canonical: getCanonicalUrl('/contact') },
    };
}

function getDefaultContactData(locale: string) {
    const isDe = locale === 'de';

    return {
        headquarters: {
            title: isDe ? 'Standort' : 'Headquarters',
            address: 'Schanzenstr. 26, 40549 Düsseldorf, Germany',
            mapUrl: 'https://maps.google.com/?q=Schanzenstr.+26,+40549+Düsseldorf',
        },
        email: {
            title: isDe ? 'E-Mail-Adresse' : 'Email Address',
            addresses: ['mail@felixseeger.de'],
        },
        phone: {
            title: isDe ? 'Telefonnummer' : 'Phone Number',
            numbers: ['+49 123 456 789'],
        },
        form: {
            heading: isDe ? 'Hast du ein Projekt\nim Kopf?' : 'Have Any Project\non Your Mind?',
            subheading: isDe
                ? 'Grossartig! Ich freue mich auf deine Nachricht und starte gern mit dir etwas Starkes.'
                : "Great! We're excited to hear from you and let's start something",
            image: '/felix.png',
        },
        serviceOptions: isDe
            ? [
                { value: 'ui-design', label: 'UI/UX Design' },
                { value: 'web-development', label: 'Webentwicklung' },
                { value: 'branding', label: 'Branding' },
                { value: 'illustration', label: 'Illustration' },
                { value: 'animation', label: 'Animation' },
                { value: 'other', label: 'Sonstiges' },
            ]
            : [
                { value: 'ui-design', label: 'UI/UX Design' },
                { value: 'web-development', label: 'Web Development' },
                { value: 'branding', label: 'Branding' },
                { value: 'illustration', label: 'Illustration' },
                { value: 'animation', label: 'Animation' },
                { value: 'other', label: 'Other' },
            ],
        heardFromOptions: isDe ? ['Google-Suche', 'Social Media', 'Empfehlung'] : ['Google Search', 'Social Media', 'Referral'],
        privacyPolicyUrl: '/privacy-policy',
        submitButtonText: isDe ? 'NACHRICHT SENDEN' : 'SEND MESSAGE',
        features: isDe
            ? [
                'Maximale Flexibilitaet fuer dein Projekt',
                'Maximale Flexibilitaet fuer dein Projekt',
                'Maximale Flexibilitaet fuer dein Projekt',
                'Maximale Flexibilitaet fuer dein Projekt',
            ]
            : [
                'We Give Unparalleled Flexibility',
                'We Give Unparalleled Flexibility',
                'We Give Unparalleled Flexibility',
                'We Give Unparalleled Flexibility',
            ],
        showFeatureBanner: true,
    };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const page = await getContactPageForLocale(locale);
    const defaultContactData = getDefaultContactData(locale);

    if (!page) {
        notFound();
    }

    // Normalize custom fields: some WP setups return `acf` as [] (truthy) when empty.
    // In that case we must still fall back to `meta_box` object data.
    const acfObject = page.acf && typeof page.acf === 'object' && !Array.isArray(page.acf)
        ? page.acf
        : null;
    const metaBoxObject = page.meta_box && typeof page.meta_box === 'object' && !Array.isArray(page.meta_box)
        ? page.meta_box
        : null;
    const acf = acfObject || metaBoxObject || {};

    const getWordPressOrigin = (): string => {
        const apiBase = (process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '').trim();
        if (!apiBase) return '';
        try {
            return new URL(apiBase.replace(/\/+$/, '')).origin;
        } catch {
            return '';
        }
    };

    const normalizeImageUrl = (raw: unknown): string | null => {
        if (typeof raw !== 'string') return null;
        const url = raw.trim();
        if (!url) return null;

        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
            return url;
        }
        if (url.startsWith('//')) {
            return `https:${url}`;
        }

        const wpOrigin = getWordPressOrigin();
        if (url.startsWith('/')) {
            return wpOrigin ? `${wpOrigin}${url}` : url;
        }
        if (/^wp-content\//i.test(url)) {
            return wpOrigin ? `${wpOrigin}/${url}` : `/${url}`;
        }

        // Handle protocol-less full domains like fs26-back.felixseeger.de/wp-content/...
        if (/^[a-z0-9.-]+\.[a-z]{2,}\/.*$/i.test(url)) {
            return `https://${url}`;
        }

        return url.startsWith('/') ? url : `/${url}`;
    };

    // Helper to get ACF image URL
    const getImageUrl = (image: unknown, featuredImage?: { source_url?: string }): string => {
        // First check for contact_image ACF field
        if (image && typeof image === 'object' && image !== null && 'url' in image) {
            const normalized = normalizeImageUrl((image as { url: string }).url);
            if (normalized) return normalized;
        }
        // Fallback to featured image
        if (featuredImage?.source_url) {
            const normalized = normalizeImageUrl(featuredImage.source_url);
            if (normalized) return normalized;
        }
        return defaultContactData.form.image;
    };

    // Helper to extract emails from repeater or use single email
    const getEmails = (): string[] => {
        if (acf.email_addresses?.length) {
            return acf.email_addresses.map((item: { email?: string } | string) =>
                typeof item === 'string' ? item : item.email || ''
            ).filter(Boolean);
        }
        if (acf.contact_email) return [acf.contact_email];
        return defaultContactData.email.addresses;
    };

    // Helper to extract phone numbers from repeater or use single phone
    const getPhoneNumbers = (): string[] => {
        if (acf.phone_numbers?.length) {
            return acf.phone_numbers.map((item: { phone?: string } | string) =>
                typeof item === 'string' ? item : item.phone || ''
            ).filter(Boolean);
        }
        if (acf.contact_phone) return [acf.contact_phone];
        return defaultContactData.phone.numbers;
    };

    // Helper to extract heard from options from repeater
    const getHeardFromOptions = (): string[] => {
        if (acf.heard_from_options?.length) {
            return acf.heard_from_options.map((item: { option?: string } | string) =>
                typeof item === 'string' ? item : item.option || ''
            ).filter(Boolean);
        }
        return defaultContactData.heardFromOptions;
    };

    // Build full address from city/country if no headquarters_address
    const getAddress = (): string => {
        if (acf.headquarters_address) {
            return acf.headquarters_address.replace(/\r\n/g, ', ').replace(/\n/g, ', ');
        }
        const city = acf.contact_office_city || '';
        const country = acf.contact_office_country || '';
        if (city || country) {
            return [city, country].filter(Boolean).join(', ');
        }
        return defaultContactData.headquarters.address;
    };

    const featuredImage = page._embedded?.['wp:featuredmedia']?.[0];

    // Build contact data from custom fields with fallbacks
    const contactData = {
        contactTitle: acf.contact_title || undefined,
        pageTitle: getLocalizedContactTitle(locale, page.title?.rendered),
        headquarters: {
            title: acf.headquarters_title || defaultContactData.headquarters.title,
            address: getAddress(),
            mapUrl: (() => {
                const url = String(acf.headquarters_map_url || defaultContactData.headquarters.mapUrl);
                return /^https?:\/\//i.test(url) ? url : defaultContactData.headquarters.mapUrl;
            })(),
        },
        email: {
            title: acf.email_title || defaultContactData.email.title,
            addresses: getEmails(),
        },
        phone: {
            title: acf.phone_title || defaultContactData.phone.title,
            numbers: getPhoneNumbers(),
        },
        form: {
            heading: acf.form_heading?.replace(/\\n/g, '\n') || defaultContactData.form.heading,
            subheading: acf.form_subheading || defaultContactData.form.subheading,
            image: getImageUrl(acf.contact_image, featuredImage),
        },
        serviceOptions: acf.service_options?.length ? acf.service_options : defaultContactData.serviceOptions,
        heardFromOptions: getHeardFromOptions(),
        privacyPolicyUrl: (() => {
            const url = String(acf.contact_privacy_policy_url || acf.privacy_policy_url || defaultContactData.privacyPolicyUrl);
            return /^(https?:\/\/|\/)/.test(url) ? url : defaultContactData.privacyPolicyUrl;
        })(),
        submitButtonText: acf.contact_submit_button_text || acf.submit_button_text || defaultContactData.submitButtonText,
        features: acf.feature_highlights?.map((f: { text?: string } | string) =>
            typeof f === 'string' ? f : f.text || ''
        ).filter(Boolean) || defaultContactData.features,
        showFeatureBanner: acf.show_feature_banner === true || (acf.show_feature_banner as unknown) === '1' || defaultContactData.showFeatureBanner,
        // CTA Card data (bonus)
        cta: {
            title: acf.contact_cta_title || '',
            description: acf.contact_cta_description || '',
            badge: acf.contact_cta_badge || '',
        },
    };

    return (
        <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
            <article className="max-w-6xl mx-auto pt-36 pb-24 px-6 lg:px-10" suppressHydrationWarning>
                <div className="mb-8">
                    <Breadcrumb items={getBreadcrumbItems('/contact')} />
                </div>
                <ContactPageClient contactData={contactData} />
            </article>
        </div>
    );
}

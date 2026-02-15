import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import ContactPageClient from './ContactPageClient';

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPageBySlug('contact');
    if (!page) return { title: 'Contact', alternates: { canonical: getCanonicalUrl('/contact') } };
    return {
        title: page.title.rendered.replace(/<[^>]*>/g, '').trim() || 'Contact',
        description: 'Get in touch for project inquiries, quotes, and collaboration. Felix Seeger — Düsseldorf. Contact form and details.',
        alternates: { canonical: getCanonicalUrl('/contact') },
    };
}

// Default fallback data
const defaultContactData = {
    headquarters: {
        title: 'Headquarters',
        address: 'Schanzenstr. 26, 40549 Düsseldorf, Germany',
        mapUrl: 'https://maps.google.com/?q=Schanzenstr.+26,+40549+Düsseldorf',
    },
    email: {
        title: 'Email Address',
        addresses: ['mail@felixseeger.de'],
    },
    phone: {
        title: 'Phone Number',
        numbers: ['+49 123 456 789'],
    },
    form: {
        heading: 'Have Any Project\non Your Mind?',
        subheading: "Great! We're excited to hear from you and let's start something",
        image: '/images/contact-image.jpg',
    },
    serviceOptions: [
        { value: 'ui-design', label: 'UI/UX Design' },
        { value: 'web-development', label: 'Web Development' },
        { value: 'branding', label: 'Branding' },
        { value: 'illustration', label: 'Illustration' },
        { value: 'animation', label: 'Animation' },
        { value: 'other', label: 'Other' },
    ],
    heardFromOptions: ['Google Search', 'Social Media', 'Referral'],
    privacyPolicyUrl: '/privacy-policy',
    submitButtonText: 'SEND MESSAGE',
    features: [
        'We Give Unparalleled Flexibility',
        'We Give Unparalleled Flexibility',
        'We Give Unparalleled Flexibility',
        'We Give Unparalleled Flexibility',
    ],
    showFeatureBanner: true,
};

export default async function ContactPage() {
    const page = await getPageBySlug('contact');

    if (!page) {
        notFound();
    }

    // Get custom fields from ACF or Meta Box
    const acf = page.acf || page.meta_box || {};

    // Helper to get ACF image URL
    const getImageUrl = (image: unknown, featuredImage?: { source_url?: string }): string => {
        // First check for contact_image ACF field
        if (image && typeof image === 'object' && image !== null && 'url' in image) {
            return (image as { url: string }).url;
        }
        // Fallback to featured image
        if (featuredImage?.source_url) {
            return featuredImage.source_url;
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

    // CF7 form ID: from ACF or env (for API route fallback)
    const cf7FormId = acf.cf7_form_id ?? process.env.CONTACT_FORM_7_ID ?? undefined;

    // Build contact data from custom fields with fallbacks
    const contactData = {
        contactTitle: acf.contact_title || undefined,
        cf7FormId: cf7FormId ? String(cf7FormId) : undefined,
        headquarters: {
            title: acf.headquarters_title || defaultContactData.headquarters.title,
            address: getAddress(),
            mapUrl: acf.headquarters_map_url || defaultContactData.headquarters.mapUrl,
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
        privacyPolicyUrl: acf.contact_privacy_policy_url || acf.privacy_policy_url || defaultContactData.privacyPolicyUrl,
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

    return <ContactPageClient contactData={contactData} />;
}

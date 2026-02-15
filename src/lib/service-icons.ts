/**
 * Fallback icon URLs for services without WordPress icon (services_gallery or featured image).
 * Keys are lowercase; slug is matched case-insensitively and by prefix (e.g. "concept-design" -> concept).
 */
const SLUG_ICON_FALLBACKS: Record<string, string> = {
    concept: '/icons/concept.svg',
    seo: '/icons/seo.svg',
};

function getFallbackIconBySlug(slug: string | undefined): string | undefined {
    if (!slug || typeof slug !== 'string') return undefined;
    const lower = slug.toLowerCase().trim();
    if (SLUG_ICON_FALLBACKS[lower]) return SLUG_ICON_FALLBACKS[lower];
    if (lower.startsWith('concept')) return SLUG_ICON_FALLBACKS.concept;
    if (lower.startsWith('seo')) return SLUG_ICON_FALLBACKS.seo;
    return undefined;
}

export function getServiceIconUrl(slug: string | undefined, wpIconUrl: string | null | undefined): string | undefined {
    const wp = (typeof wpIconUrl === 'string' && wpIconUrl.trim()) ? wpIconUrl : undefined;
    if (wp) return wp;
    return getFallbackIconBySlug(slug);
}

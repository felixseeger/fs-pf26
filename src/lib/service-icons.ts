/**
 * Fallback icon URLs for services without WordPress icon (services_gallery or featured image).
 * Keys are lowercase; slug is matched case-insensitively and by prefix (e.g. "concept-design" -> concept).
 */
const SLUG_ICON_FALLBACKS: Record<string, string> = {
    concept: '/icons/concept.svg',
    seo: '/icons/seo.svg',
    '3d-opengl': '/icons/3d-opengl.svg',
};

function getFallbackIconBySlug(slug: string | undefined): string | undefined {
    if (!slug || typeof slug !== 'string') return undefined;
    const lower = slug.toLowerCase().trim();
    if (SLUG_ICON_FALLBACKS[lower]) return SLUG_ICON_FALLBACKS[lower];
    if (lower.startsWith('concept')) return SLUG_ICON_FALLBACKS.concept;
    if (lower.startsWith('seo')) return SLUG_ICON_FALLBACKS.seo;
    if (lower.startsWith('3d') || lower.includes('opengl')) return SLUG_ICON_FALLBACKS['3d-opengl'];
    return undefined;
}

/** WordPress backend origin for resolving relative image URLs (server-side). */
function getWordPressOrigin(): string {
    const base =
        typeof process !== 'undefined' && process.env.WORDPRESS_API_URL
            ? process.env.WORDPRESS_API_URL
            : typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WORDPRESS_API_URL
              ? process.env.NEXT_PUBLIC_WORDPRESS_API_URL
              : '';
    if (!base) return '';
    try {
        return new URL(base.replace(/\/+$/, '')).origin;
    } catch {
        return '';
    }
}

/**
 * Returns a valid icon URL: prefers WordPress icon, resolves relative URLs, then falls back to slug-based local icon.
 */
export function getServiceIconUrl(slug: string | undefined, wpIconUrl: string | null | undefined): string | undefined {
    let wp: string | undefined;
    if (typeof wpIconUrl === 'string' && wpIconUrl.trim()) {
        const trimmed = wpIconUrl.trim();
        if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
            const origin = getWordPressOrigin();
            wp = origin ? `${origin}${trimmed}` : trimmed;
        } else {
            wp = trimmed;
        }
    } else {
        wp = undefined;
    }
    if (wp) return wp;
    return getFallbackIconBySlug(slug);
}

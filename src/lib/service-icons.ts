/**
 * Fallback icon URLs for services without WordPress icon (services_gallery or featured image).
 * Add slug -> /public path mappings here.
 */
export const SLUG_ICON_FALLBACKS: Record<string, string> = {
    concept: '/icons/concept.svg',
    seo: '/icons/seo.svg',
};

export function getServiceIconUrl(slug: string | undefined, wpIconUrl: string | null | undefined): string | undefined {
    if (wpIconUrl) return wpIconUrl;
    if (slug && SLUG_ICON_FALLBACKS[slug]) return SLUG_ICON_FALLBACKS[slug];
    return undefined;
}

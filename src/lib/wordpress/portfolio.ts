/**
 * Portfolio module for WordPress REST API
 * Handles all portfolio-related API functions
 */

import { WPPortfolioItem, FeaturedMedia } from '@/types/wordpress';
import { fetchWordPress } from './api';

/**
 * Get all portfolio items with pagination
 * @param perPage - Number of items per page (default: 12)
 * @param page - Page number (default: 1)
 */
export async function getPortfolioItems(
    perPage: number = 12,
    page: number = 1
): Promise<WPPortfolioItem[]> {
    try {
        const portfolio = await fetchWordPress<WPPortfolioItem[]>('/portfolio', {
            _embed: true,
            per_page: perPage,
            page,
            orderby: 'date',
            order: 'desc',
        }, { suppressErrorLogging: true }); // 404 if CPT not registered; live backend may have 0 items until migrated
        return Array.isArray(portfolio) ? portfolio : [];
    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        return [];
    }
}

/**
 * Get a single portfolio item by slug
 * @param slug - Portfolio item slug
 */
export async function getPortfolioItemBySlug(slug: string): Promise<WPPortfolioItem | null> {
    try {
        const portfolio = await fetchWordPress<WPPortfolioItem[]>('/portfolio', {
            slug,
            _embed: true,
        });
        if (portfolio.length > 1) {
            console.warn(`Multiple portfolio items found for slug '${slug}':`, portfolio.map(p => p.id));
        }
        return portfolio.length > 0 ? portfolio[0] : null;
    } catch (error) {
        console.error(`Error fetching portfolio item by slug '${slug}':`, error);
        return null;
    }
}

/**
 * Get all image attachments for a portfolio item
 * @param postId - The portfolio post ID
 */
export async function getPortfolioAttachments(postId: number): Promise<FeaturedMedia[]> {
    try {
        const attachments = await fetchWordPress<FeaturedMedia[]>('/media', {
            parent: postId,
            per_page: 20,
            orderby: 'date',
            order: 'asc',
        });
        return attachments;
    } catch (error) {
        console.error(`Error fetching attachments for portfolio item ${postId}:`, error);
        return [];
    }
}

/**
 * Extract image URLs from Gutenberg content
 * @param content - The HTML content string
 */
export function extractImagesFromContent(content: string): { url: string; altText: string }[] {
    if (!content) return [];
    
    // Match src and alt from img tags
    // Updated regex to handle potentially messy attributes and ensure we get clean URLs
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    const altRegex = /alt=["']([^"']*)["']/;
    
    const images: { url: string; altText: string }[] = [];
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
        let url = match[1];
        
        // Remove WordPress image size suffixes (e.g., -1024x768.jpg) 
        // to help with deduplication against original attachments
        const cleanUrl = url.replace(/-(\d+)x(\d+)\.(jpg|jpeg|png|webp|gif)/i, '.$3');
        
        const altMatch = match[0].match(altRegex);
        const altText = altMatch ? altMatch[1] : '';
        
        // Avoid duplicates in the extraction itself
        if (!images.find(img => img.url === cleanUrl || img.url === url)) {
            images.push({ url: cleanUrl, altText });
        }
    }
    
    return images;
}

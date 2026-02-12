/**
 * Services module for WordPress REST API
 * Handles all service-related API functions
 */

import { WPServiceItem, FeaturedMedia } from '@/types/wordpress';
import { fetchWordPress } from './api';

/**
 * Get all service items with pagination
 * @param perPage - Number of items per page (default: 12)
 * @param page - Page number (default: 1)
 */
export async function getServiceItems(
    perPage: number = 100,
    page: number = 1
): Promise<WPServiceItem[]> {
    try {
        const services = await fetchWordPress<WPServiceItem[]>('/services', {
            _embed: true,
            per_page: perPage,
            page,
            orderby: 'menu_order',
            order: 'asc',
        }, { suppressErrorLogging: true });
        return Array.isArray(services) ? services : [];
    } catch (error) {
        console.error('Error fetching service items:', error);
        return [];
    }
}

/**
 * Get a single service item by slug
 * @param slug - Service item slug
 */
export async function getServiceItemBySlug(slug: string): Promise<WPServiceItem | null> {
    try {
        const services = await fetchWordPress<WPServiceItem[]>('/services', {
            slug,
            _embed: true,
        });
        if (services.length > 1) {
            console.warn(`Multiple service items found for slug '${slug}':`, services.map(s => s.id));
        }
        return services.length > 0 ? services[0] : null;
    } catch (error) {
        console.error(`Error fetching service item by slug '${slug}':`, error);
        return null;
    }
}

/**
 * Get all image attachments for a service item
 * @param postId - The service post ID
 */
export async function getServiceAttachments(postId: number): Promise<FeaturedMedia[]> {
    try {
        const attachments = await fetchWordPress<FeaturedMedia[]>('/media', {
            parent: postId,
            per_page: 20,
            orderby: 'date',
            order: 'asc',
        });
        return attachments;
    } catch (error) {
        console.error(`Error fetching attachments for service item ${postId}:`, error);
        return [];
    }
}

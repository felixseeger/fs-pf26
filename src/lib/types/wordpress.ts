/**
 * WordPress REST API TypeScript type definitions
 * Centralized types for headless WordPress integration
 */

// =============================================================================
// Core Content Types
// =============================================================================

export interface RenderedContent {
  rendered: string;
  protected?: boolean;
}

export interface FeaturedMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details?: {
    width: number;
    height: number;
    sizes?: {
      [key: string]: {
        source_url: string;
        width: number;
        height: number;
      };
    };
  };
}

export interface Author {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls?: {
    [key: string]: string;
  };
}

// =============================================================================
// Post Types
// =============================================================================

export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: RenderedContent;
  content: RenderedContent;
  excerpt: RenderedContent;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: unknown[];
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Author[];
    'wp:featuredmedia'?: FeaturedMedia[];
    'wp:term'?: WPCategory[][];
  };
}

// =============================================================================
// Page Types
// =============================================================================

export interface WPPage {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: RenderedContent;
  content: RenderedContent;
  excerpt: RenderedContent;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  menu_order: number;
  template: string;
  meta: unknown[];
  parent: number;
  _embedded?: {
    author?: Author[];
    'wp:featuredmedia'?: FeaturedMedia[];
  };
}

// =============================================================================
// Menu Types
// =============================================================================

export interface WPMenuItem {
  ID: number;
  title: string;
  url: string;
  target: string;
  classes: string[];
  menu_order: number;
  object: string;
  object_id: number;
  parent: number;
  type: string;
  type_label: string;
  child_items?: WPMenuItem[];
}

export interface WPMenu {
  term_id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  items: WPMenuItem[];
}

// =============================================================================
// Category Types
// =============================================================================

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
  link: string;
}

// =============================================================================
// Component Prop Types
// =============================================================================

export interface PostCardProps {
  post: WPPost;
}

export interface PostListProps {
  posts: WPPost[];
}

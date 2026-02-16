// WordPress REST API response types

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

/** ACF file field return (array format) */
export interface ACFFile {
  id?: number;
  url?: string;
  filename?: string;
  alt?: string;
}

export interface PortfolioSliderMediaItem {
  media_type?: boolean | string; // Checkbox (true/false) or select ('image'/'video')
  media_image?: ACFImage | number | string | false;
  media_video?: ACFFile | string | number | false; // File or URL
  media_video_poster?: ACFImage | number | string | false;
  media_caption?: string;
}

export interface WPPortfolioItem extends Omit<WPPost, 'categories' | 'tags'> {
  // Common CPT fields
  project_categories?: number[];
  project_tags?: number[];
  acf?: {
    project_gallery?: {
      id: number;
      url: string;
      alt: string;
      width?: number;
      height?: number;
    }[];
    /** Slider media at root (if repeater not inside a group) */
    portfolio_slider_media?: PortfolioSliderMediaItem[];
    /** Slider media inside Portfolio Slider group (current ACF structure) */
    portfolio_slider?: {
      portfolio_slider_media?: PortfolioSliderMediaItem[];
    };
    /** Optional content/project video (URL or file) */
    portfolio_video?: string | ACFFile | false;
    /** Optional override for post title on front end */
    portfolio_title?: string;
    /** Optional intro/summary text */
    portfolio_text?: string;
  };
}

// Service subpage (sales layout) repeater items
export interface ServiceProcessItem {
  title?: string;
  description?: string;
}

export interface ServiceDeliverableItem {
  item_text?: string;
}

export interface ServiceKeyFeatureItem {
  item_text?: string;
  /** Alternate sub-field names (e.g. from feature_lists repeater) */
  text?: string;
  feature?: string;
  title?: string;
  /** ACF repeater sub-fields from features_items group */
  features_title?: string;
  features_description?: string;
}

export interface ServiceUseCaseItem {
  item_text?: string;
}

export interface WPServiceItem extends Omit<WPPost, 'categories' | 'tags'> {
  // Services CPT fields (legacy + sales layout)
  service_categories?: number[];
  service_tags?: number[];
  acf?: {
    services_gallery?: ACFImage | false;
    service_icon?: ACFImage | string | false;
    service_title?: string;
    service_text?: string;
    service_short_description?: string;
    service_features?: string[];
    service_pricing?: string;
    service_duration?: string;
    // Service subpage (sales layout)
    hero_headline?: string;
    hero_subheadline?: string;
    problem_headline?: string;
    problem_body?: string;
    solution_headline?: string;
    solution_body?: string;
    process_section_title?: string;
    process_items?: ServiceProcessItem[];
    key_features_title?: string;
    key_features?: ServiceKeyFeatureItem[];
    /** Alternate: features_section_title (same as key_features_title) */
    features_section_title?: string;
    /** Alternate: features_items (same as key_features) */
    features_items?: ServiceKeyFeatureItem[];
    /** Alternate: feature_lists (used on some services e.g. UI/UI Design, Brand Identity, 3D) */
    feature_lists?: ServiceKeyFeatureItem[];
    /** Alternate: feature_lists section title */
    feature_lists_title?: string;
    use_cases_title?: string;
    use_cases?: ServiceUseCaseItem[];
    /** Alternate: use_cases_items (same as use_cases) */
    use_cases_items?: ServiceUseCaseItem[];
    deliverables?: ServiceDeliverableItem[];
    cta_button_text?: string;
    cta_button_link?: string;
  };
}

// Course sales page ACF (post type: course)
export interface CourseTrustBarLogo {
  logo_image?: ACFImage | number | false;
  logo_url?: string;
}

export interface CourseTransformationItem {
  title?: string;
  description?: string;
}

export interface CourseCurriculumModule {
  module_number?: string;
  title?: string;
  description?: string;
}

export interface CourseFAQItem {
  question?: string;
  answer?: string;
}

export interface CourseOfferInclude {
  item_text?: string;
}

export interface CourseACF {
  course_goal?: string;
  primary_cta_text?: string;
  price_type?: string;
  price_amount?: number;
  price_currency?: string;
  hero_headline?: string;
  hero_subheadline?: string;
  hero_cta_text?: string;
  hero_cta_subtext?: string;
  hero_visual?: ACFImage | number | false;
  /** ACF Gallery: array of image objects (return format "array") or attachment IDs */
  courses_gallery?: (ACFImage | number)[];
  trust_bar_text?: string;
  trust_bar_logos?: CourseTrustBarLogo[];
  problem_headline?: string;
  problem_body?: string;
  solution_headline?: string;
  solution_body?: string;
  transformation_headline?: string;
  transformation_items?: CourseTransformationItem[];
  curriculum_modules?: CourseCurriculumModule[];
  faq_items?: CourseFAQItem[];
  offer_headline?: string;
  offer_includes?: CourseOfferInclude[];
  offer_guarantee_heading?: string;
  offer_guarantee_text?: string;
  offer_final_cta?: string;
}

export interface WPCourseItem extends Omit<WPPost, 'categories' | 'tags'> {
  acf?: CourseACF;
}

// Meta Box Field Types for Homepage
export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon?: string | ACFImage; // Can be URL string or ACF image object
}

export interface SocialLink {
  platform: 'twitter' | 'github' | 'linkedin' | 'instagram' | 'facebook';
  url: string;
}

// SCF/ACF Image field type
export interface ACFImage {
  ID: number;
  id: number;
  url: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  sizes: {
    thumbnail: string;
    medium: string;
    large: string;
    [key: string]: string | number;
  };
}

export interface HomepageMetaBox {
  // Hero Section
  hero_title?: string;
  hero_subtitle?: string;
  hero_background?: ACFImage | number | false;
  // About Section
  about_title?: string;
  about_content?: string;
  about_image?: ACFImage | number | false;
  // Services Section
  services_title?: string;
  services?: ServiceItem[] | null;
  // FAQ Section
  faq_title?: string;
  faq_items?: FAQItem[] | null;
  faq_phone_card_title?: string;
  faq_phone_card_description?: string;
  faq_email_card_title?: string;
  faq_email_card_description?: string;
  // Contact Section
  contact_title?: string;
  contact_content?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_office_city?: string;
  contact_office_country?: string;
  // Contact CTA Card
  contact_cta_title?: string;
  contact_cta_description?: string;
  contact_cta_badge?: string;
  // Contact Form Settings
  contact_form_shortcode?: string;
  contact_privacy_policy_url?: string;
  contact_submit_button_text?: string;
  // WhatsApp Chat Widget
  whatsapp_phone?: string;
  whatsapp_message?: string;
  whatsapp_contact_name?: string;
  whatsapp_contact_role?: string;
  whatsapp_header_text?: string;
  // Footer (editable in WordPress via Homepage / Front Page ACF or Meta Box)
  footer_image?: ACFImage | number | false;
  footer_about_title?: string;
  footer_about_text?: string;
  footer_quick_links_title?: string;
  footer_quick_links_menu?: string;
  footer_legal_title?: string;
  footer_legal_menu?: string;
  footer_connect_title?: string;
  footer_text?: string;
  social_links?: SocialLink[];
}

// About page – Trust section (SCF / Meta Box)
export interface TrustClientItem {
  name: string;
  image?: { id: number; url: string; alt: string } | null;
}

export interface AboutPageMetaBox {
  trust_section_title?: string;
  trust_clients?: TrustClientItem[];
}

// Loading page – Preloader (SCF / Meta Box)
export interface LoadingPageMetaBox {
  loading_orbit_labels?: string[];
  loading_background_color?: string;
  loading_text_color?: string;
  loading_counter_duration?: number;
  loading_redirect_url?: string;
  loading_hero_heading?: string;
  loading_hero_image?: { id: number; url: string; alt: string } | null;
}

// 404 / Not Found page (SCF / Meta Box)
export interface NotFoundPageMetaBox {
  notfound_title?: string;
  notfound_message?: string;
  notfound_button_text?: string;
  notfound_button_link?: string;
  notfound_bg_color?: string;
  notfound_primary_color?: string;
}

// Services page (Page with slug "services") – Hero, Trust, CTA ACF
export interface ServicesPageTrustItem {
  title?: string;
  description?: string;
}

export interface ServicesPageACF {
  hero_headline?: string;
  hero_subheadline?: string;
  trust_headline?: string;
  trust_body?: string;
  trust_items?: ServicesPageTrustItem[];
  cta_headline?: string;
  cta_button_text?: string;
  cta_button_link?: string;
}

// Legacy ACF support (alias)
export type HomepageACF = HomepageMetaBox;

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
  // Custom fields (ACF or Meta Box)
  acf?: HomepageACF & ContactPageMetaBox & ResumeMetaBox & AboutPageMetaBox & LoadingPageMetaBox & NotFoundPageMetaBox & ServicesPageACF;
  meta_box?: HomepageMetaBox & ContactPageMetaBox & ResumeMetaBox & AboutPageMetaBox & LoadingPageMetaBox & NotFoundPageMetaBox;
  _embedded?: {
    author?: Author[];
    'wp:featuredmedia'?: FeaturedMedia[];
  };
}

// Component prop types

export interface PostCardProps {
  post: WPPost;
}

export interface PostListProps {
  posts: WPPost[];
}

// WordPress Menu Types
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

// WordPress Category Types
export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
  link: string;
}

// Contact Page Types
export interface ContactInfoCard {
  title: string;
  content: string; // Can be address, email, or phone
  action_text: string;
  action_url: string;
}

export interface ServiceOption {
  value: string;
  label: string;
}

export interface FeatureHighlight {
  text: string;
}

export interface ContactPageMetaBox {
  // Contact section title (above contact info cards)
  contact_title?: string;
  // Contact Info Cards
  headquarters_title?: string;
  headquarters_address?: string;
  headquarters_map_url?: string;
  email_title?: string;
  email_addresses?: Array<{ email?: string } | string>;
  phone_title?: string;
  phone_numbers?: Array<{ phone?: string } | string>;
  // Form Section
  form_heading?: string;
  form_subheading?: string;
  form_image?: ACFImage | number | false;
  // Contact Image (for contact page)
  contact_image?: ACFImage | number | false;
  // Service Options for dropdown
  service_options?: ServiceOption[];
  // How did you hear options
  heard_from_options?: Array<{ option?: string } | string>;
  // Privacy Policy
  privacy_policy_url?: string;
  submit_button_text?: string;
  // Feature Banner
  feature_highlights?: Array<FeatureHighlight | string>;
  show_feature_banner?: boolean;
  // Contact Form 7
  cf7_form_id?: number | string;
}

// Resume/Lebenslauf Types
export interface ResumeEducationItem {
  date_range: string;
  degree: string;
  institution: string;
}

export interface ResumeWorkItem {
  date_range: string;
  job_title: string;
  company: string;
  location?: string;
  responsibilities: string[];
}

export interface ResumeFreelanceInfo {
  date_range: string;
  clients: string;
}

export interface ResumeLanguageSkill {
  language: string;
  level: string;
}

export interface ResumePersonalInfo {
  name: string;
  birthdate?: string;
  email: string;
  address_line1?: string;
  address_line2?: string;
}

export interface ResumeMetaBox {
  // About section
  about_me?: string;
  // Education section
  education?: ResumeEducationItem[];
  // Work Experience section
  work_experience?: ResumeWorkItem[];
  // Freelance section
  freelance?: ResumeFreelanceInfo;
  // Language Skills
  language_skills?: ResumeLanguageSkill[];
  // Social Media
  social_media_links?: string[];
  // Interests
  interests?: string[];
  // Personal Info
  personal?: ResumePersonalInfo;
}

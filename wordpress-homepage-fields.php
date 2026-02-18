<?php
/**
 * Plugin Name: Homepage Custom Fields
 * Description: Adds custom fields for homepage sections (About, Services, FAQ, Contact) - Works with Meta Box
 * Version: 1.0
 * Author: Felix Seeger
 */

// Prevent direct access
if (!defined('ABSPATH')) exit;

/**
 * Register Meta Box fields for Homepage
 */
add_filter('rwmb_meta_boxes', function($meta_boxes) {

    $meta_boxes[] = [
        'title'      => 'Homepage Sections',
        'id'         => 'homepage_sections',
        'post_types' => ['page'],
        'context'    => 'normal',
        'priority'   => 'high',
        // Show on front page
        'include'    => [
            'is_front_page' => true,
        ],
        'fields'     => [

            // =====================
            // HERO SECTION
            // =====================
            [
                'type' => 'heading',
                'name' => '🎯 Hero Section',
                'desc' => 'Main hero/banner section at the top of the page',
            ],
            [
                'name' => 'Hero Title',
                'id'   => 'hero_title',
                'type' => 'text',
                'size' => 60,
            ],
            [
                'name' => 'Hero Subtitle',
                'id'   => 'hero_subtitle',
                'type' => 'textarea',
                'rows' => 3,
            ],
            [
                'name' => 'Hero CTA Button Text',
                'id'   => 'hero_cta_text',
                'type' => 'text',
            ],
            [
                'name' => 'Hero CTA Button Link',
                'id'   => 'hero_cta_link',
                'type' => 'url',
            ],

            // =====================
            // HERO CAROUSEL — FIRST SLIDE
            // =====================
            [
                'type' => 'heading',
                'name' => '🎬 Hero Carousel — First Slide',
                'desc' => 'Custom text displayed on the animated first (pixelated video) slide of the hero carousel.',
            ],
            [
                'name' => 'First Slide Title',
                'id'   => 'hero_slide_title',
                'type' => 'text',
                'size' => 60,
                'placeholder' => 'e.g. Felix Seeger',
                'desc' => 'Large headline rendered as the pixelated text animation on the first slide.',
            ],
            [
                'name' => 'First Slide Tagline / Badge',
                'id'   => 'hero_slide_badge',
                'type' => 'text',
                'size' => 60,
                'placeholder' => 'e.g. Portfolio',
                'desc' => 'Small pill/badge text that appears above the title (same as category pills on portfolio slides).',
            ],
            [
                'name' => 'First Slide Subtitle',
                'id'   => 'hero_slide_subtitle',
                'type' => 'textarea',
                'rows' => 3,
                'placeholder' => 'e.g. Web design, development, and digital strategy.',
                'desc' => 'Short description line below the title.',
            ],
            [
                'name' => 'First Slide CTA — Primary Label',
                'id'   => 'hero_slide_cta_primary_label',
                'type' => 'text',
                'placeholder' => 'e.g. View Portfolio',
            ],
            [
                'name' => 'First Slide CTA — Primary URL',
                'id'   => 'hero_slide_cta_primary_url',
                'type' => 'url',
                'placeholder' => '/portfolio',
            ],
            [
                'name' => 'Scroll Hint Text',
                'id'   => 'hero_start_text',
                'type' => 'text',
                'placeholder' => 'Scroll to explore',
                'desc' => 'Small label on the scroll-down hint button at the bottom of the hero',
            ],

            // =====================
            // ABOUT SECTION
            // =====================
            [
                'type' => 'heading',
                'name' => '👤 About Section',
            ],
            [
                'name' => 'About Title',
                'id'   => 'about_title',
                'type' => 'text',
            ],
            [
                'name' => 'About Content',
                'id'   => 'about_content',
                'type' => 'wysiwyg',
                'options' => [
                    'textarea_rows' => 8,
                    'media_buttons' => true,
                ],
            ],
            [
                'name' => 'About Image',
                'id'   => 'about_image',
                'type' => 'single_image',
            ],

            // =====================
            // SERVICES SECTION
            // =====================
            [
                'type' => 'heading',
                'name' => '⚙️ Services Section',
            ],
            [
                'name' => 'Services Section Title',
                'id'   => 'services_title',
                'type' => 'text',
            ],
            [
                'name'       => 'Services',
                'id'         => 'services',
                'type'       => 'group',
                'clone'      => true,
                'sort_clone' => true,
                'add_button' => '+ Add Service',
                'fields'     => [
                    [
                        'name'    => 'Service Title',
                        'id'      => 'title',
                        'type'    => 'text',
                        'columns' => 6,
                    ],
                    [
                        'name'    => 'Icon Name',
                        'id'      => 'icon',
                        'type'    => 'text',
                        'columns' => 6,
                        'desc'    => 'e.g., "code", "palette", "rocket", "globe"',
                    ],
                    [
                        'name' => 'Description',
                        'id'   => 'description',
                        'type' => 'textarea',
                        'rows' => 3,
                    ],
                ],
            ],

            // =====================
            // FAQ SECTION
            // =====================
            [
                'type' => 'heading',
                'name' => '❓ FAQ Section',
            ],
            [
                'name' => 'FAQ Section Title',
                'id'   => 'faq_title',
                'type' => 'text',
            ],
            [
                'name'       => 'FAQ Items',
                'id'         => 'faq_items',
                'type'       => 'group',
                'clone'      => true,
                'sort_clone' => true,
                'add_button' => '+ Add FAQ',
                'fields'     => [
                    [
                        'name' => 'Question',
                        'id'   => 'question',
                        'type' => 'text',
                    ],
                    [
                        'name'    => 'Answer',
                        'id'      => 'answer',
                        'type'    => 'wysiwyg',
                        'options' => [
                            'textarea_rows' => 5,
                            'media_buttons' => false,
                        ],
                    ],
                ],
            ],

            // =====================
            // CONTACT SECTION
            // =====================
            [
                'type' => 'heading',
                'name' => '📧 Contact Section',
            ],
            [
                'name' => 'Contact Section Title',
                'id'   => 'contact_title',
                'type' => 'text',
            ],
            [
                'name' => 'Contact Content',
                'id'   => 'contact_content',
                'type' => 'wysiwyg',
                'options' => [
                    'textarea_rows' => 5,
                    'media_buttons' => false,
                ],
            ],
            [
                'name' => 'Contact Email',
                'id'   => 'contact_email',
                'type' => 'email',
            ],
            [
                'name' => 'Contact Phone',
                'id'   => 'contact_phone',
                'type' => 'text',
            ],
        ],
    ];

    return $meta_boxes;
});

/**
 * Expose Meta Box fields to WordPress REST API
 */
add_action('rest_api_init', function() {
    register_rest_field('page', 'meta_box', [
        'get_callback' => function($object) {
            // Check if Meta Box is active
            if (!function_exists('rwmb_meta')) {
                return null;
            }

            $default_fields = [
                // Hero
                'hero_title', 'hero_subtitle', 'hero_cta_text', 'hero_cta_link',
                // About
                'about_title', 'about_content', 'about_image',
                // Services
                'services_title', 'services',
                // FAQ
                'faq_title', 'faq_items',
                // Contact
                'contact_title', 'contact_content', 'contact_email', 'contact_phone',
            ];
            $fields = apply_filters('fs_pf26_rest_meta_box_fields', $default_fields);

            $meta = [];
            foreach ($fields as $field) {
                $value = rwmb_meta($field, '', $object['id']);
                if (!empty($value)) {
                    // Handle image fields
                    if (in_array($field, ['about_image', 'hero_background', 'loading_hero_image']) && is_numeric($value)) {
                        $meta[$field] = [
                            'id'  => $value,
                            'url' => wp_get_attachment_url($value),
                            'alt' => get_post_meta($value, '_wp_attachment_image_alt', true),
                        ];
                    } elseif ($field === 'loading_orbit_labels' && is_array($value)) {
                        $meta[$field] = array_values(array_filter(array_map(function ($row) {
                            return isset($row['label']) ? trim((string) $row['label']) : '';
                        }, $value)));
                    } elseif ($field === 'trust_clients' && is_array($value)) {
                        // Resolve image (ID or array from Meta Box) to { id, url, alt } for each client
                        $meta[$field] = array_map(function ($row) {
                            $out = [ 'name' => isset($row['name']) ? (string) $row['name'] : '' ];
                            $img = isset($row['image']) ? $row['image'] : null;
                            $out['image'] = null;
                            if (!empty($img)) {
                                if (is_numeric($img)) {
                                    $out['image'] = [
                                        'id'  => (int) $img,
                                        'url' => wp_get_attachment_url($img) ?: '',
                                        'alt' => (string) get_post_meta($img, '_wp_attachment_image_alt', true),
                                    ];
                                } elseif (is_array($img)) {
                                    $id = isset($img['ID']) ? (int) $img['ID'] : (isset($img['id']) ? (int) $img['id'] : 0);
                                    $url = isset($img['url']) ? $img['url'] : (isset($img['full_url']) ? $img['full_url'] : ($id ? wp_get_attachment_url($id) : ''));
                                    $out['image'] = $url ? [
                                        'id'  => $id,
                                        'url' => $url,
                                        'alt' => isset($img['alt']) ? (string) $img['alt'] : ($id ? (string) get_post_meta($id, '_wp_attachment_image_alt', true) : ''),
                                    ] : null;
                                }
                            }
                            return $out;
                        }, $value);
                    } else {
                        $meta[$field] = $value;
                    }
                }
            }

            return !empty($meta) ? $meta : null;
        },
        'schema' => null,
    ]);
});

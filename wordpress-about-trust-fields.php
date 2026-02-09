<?php
/**
 * Plugin Name: About Page – Trust Section (Custom Fields)
 * Description: Adds Trust section fields for the About page (clients / trusted-by). Works with Meta Box.
 * Version: 1.0
 * Author: Felix Seeger
 */

if (!defined('ABSPATH')) exit;

/**
 * Register Meta Box for About page – Trust section
 */
add_filter('rwmb_meta_boxes', function ($meta_boxes) {
    $meta_boxes[] = [
        'title'      => 'Trust Section',
        'id'         => 'about_trust_section',
        'post_types' => ['page'],
        'context'    => 'normal',
        'priority'   => 'high',
        'include'    => [
            'slug' => ['about'],
        ],
        'fields'     => [
            [
                'type' => 'heading',
                'name' => 'Trusted By / Clients',
                'desc' => 'List of client or partner names. On hover, the optional image is shown in the preview area.',
            ],
            [
                'name' => 'Section Title',
                'id'   => 'trust_section_title',
                'type' => 'text',
                'std'  => 'Trusted Us',
                'desc' => 'e.g. "Trusted Us", "Clients", "They Trust Us"',
            ],
            [
                'name'       => 'Clients / Partners',
                'id'         => 'trust_clients',
                'type'       => 'group',
                'clone'      => true,
                'sort_clone' => true,
                'add_button' => '+ Add client',
                'fields'     => [
                    [
                        'name' => 'Name',
                        'id'   => 'name',
                        'type' => 'text',
                        'desc' => 'Display name (e.g. "Native Instruments", "Oura")',
                    ],
                    [
                        'name' => 'Image (optional)',
                        'id'   => 'image',
                        'type' => 'single_image',
                        'desc' => 'Image shown in the preview on hover. Leave empty for text-only.',
                    ],
                ],
            ],
        ],
    ];

    return $meta_boxes;
});

/**
 * Activate Trust section fields for REST API
 * (Merged into page.meta_box in the REST response)
 */
add_filter('fs_pf26_rest_meta_box_fields', function ($fields) {
    return array_merge((array) $fields, [
        'trust_section_title',
        'trust_clients',
    ]);
});

<?php
/**
 * Plugin Name: 404 / Not Found Page (Custom Fields)
 * Description: Custom fields for the 404 experience (mandala background, title, message, colors). Works with Meta Box.
 * Version: 1.0
 * Author: Felix Seeger
 */

if (!defined('ABSPATH')) exit;

/**
 * Register Meta Box for Not Found (404) settings page
 * Create a page with slug "not-found" to configure the 404 experience.
 */
add_filter('rwmb_meta_boxes', function ($meta_boxes) {
    $meta_boxes[] = [
        'title'      => '404 Page',
        'id'         => 'not_found_404',
        'post_types' => ['page'],
        'context'    => 'normal',
        'priority'   => 'high',
        'include'    => [
            'slug' => ['not-found', '404'],
        ],
        'fields'     => [
            [
                'type' => 'heading',
                'name' => 'Copy',
            ],
            [
                'name' => 'Title',
                'id'   => 'notfound_title',
                'type' => 'text',
                'std'  => '404',
                'desc' => 'Main heading (e.g. 404 or "Page not found")',
            ],
            [
                'name' => 'Message',
                'id'   => 'notfound_message',
                'type' => 'textarea',
                'std'  => 'The page you are looking for does not exist or has been moved.',
                'rows' => 3,
            ],
            [
                'name' => 'Button text',
                'id'   => 'notfound_button_text',
                'type' => 'text',
                'std'  => 'Back to home',
            ],
            [
                'name' => 'Button link',
                'id'   => 'notfound_button_link',
                'type' => 'url',
                'std'  => '/',
            ],
            [
                'type' => 'heading',
                'name' => 'Colors (mandala background)',
            ],
            [
                'name' => 'Background color',
                'id'   => 'notfound_bg_color',
                'type' => 'color',
                'std'  => '#000000',
            ],
            [
                'name' => 'Text / primary color',
                'id'   => 'notfound_primary_color',
                'type' => 'color',
                'std'  => '#ffffff',
            ],
        ],
    ];

    return $meta_boxes;
});

/**
 * Activate 404 fields for REST API
 */
add_filter('fs_pf26_rest_meta_box_fields', function ($fields) {
    return array_merge((array) $fields, [
        'notfound_title',
        'notfound_message',
        'notfound_button_text',
        'notfound_button_link',
        'notfound_bg_color',
        'notfound_primary_color',
    ]);
});

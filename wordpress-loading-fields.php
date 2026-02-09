<?php
/**
 * Plugin Name: Loading Page – Preloader (Custom Fields)
 * Description: Custom fields for the Loading page (orbit labels, colors, counter, redirect). Works with Meta Box.
 * Version: 1.0
 * Author: Felix Seeger
 */

if (!defined('ABSPATH')) exit;

/**
 * Register Meta Box for Loading page – Preloader
 */
add_filter('rwmb_meta_boxes', function ($meta_boxes) {
    $meta_boxes[] = [
        'title'      => 'Preloader / Loading',
        'id'         => 'loading_preloader',
        'post_types' => ['page'],
        'context'    => 'normal',
        'priority'   => 'high',
        'include'    => [
            'slug' => ['loading'],
        ],
        'fields'     => [
            [
                'type' => 'heading',
                'name' => 'Orbit labels',
                'desc' => 'Up to 8 labels shown on the circular orbits (inner to outer). Leave empty to use defaults.',
            ],
            [
                'name'       => 'Orbit labels',
                'id'         => 'loading_orbit_labels',
                'type'       => 'group',
                'clone'      => true,
                'sort_clone' => true,
                'max_clone'  => 8,
                'add_button' => '+ Add label',
                'fields'     => [
                    [
                        'name' => 'Label',
                        'id'   => 'label',
                        'type' => 'text',
                        'desc' => 'e.g. Developer, Frontend, Creative',
                    ],
                ],
            ],
            [
                'type' => 'heading',
                'name' => 'Appearance & timing',
            ],
            [
                'name' => 'Background color',
                'id'   => 'loading_background_color',
                'type' => 'color',
                'std'  => '#d1d9b8',
                'desc' => 'Loader background (default: #d1d9b8)',
            ],
            [
                'name' => 'Text color',
                'id'   => 'loading_text_color',
                'type' => 'color',
                'std'  => '#0f0f0f',
            ],
            [
                'name' => 'Counter duration (seconds)',
                'id'   => 'loading_counter_duration',
                'type' => 'number',
                'std'  => 4,
                'min'  => 1,
                'max'  => 15,
                'step' => 0.5,
            ],
            [
                'type' => 'heading',
                'name' => 'After load',
            ],
            [
                'name' => 'Redirect URL',
                'id'   => 'loading_redirect_url',
                'type' => 'url',
                'desc' => 'If set, redirect here when preloader finishes. Leave empty to show the message below.',
            ],
            [
                'name' => 'Post-load message',
                'id'   => 'loading_hero_heading',
                'type' => 'text',
                'std'  => 'Your content begins here',
                'desc' => 'Shown after preloader (when no redirect URL).',
            ],
            [
                'name' => 'Post-load background image',
                'id'   => 'loading_hero_image',
                'type' => 'single_image',
                'desc' => 'Optional full-screen image behind the message.',
            ],
        ],
    ];

    return $meta_boxes;
});

/**
 * Activate Loading page fields for REST API
 */
add_filter('fs_pf26_rest_meta_box_fields', function ($fields) {
    return array_merge((array) $fields, [
        'loading_orbit_labels',
        'loading_background_color',
        'loading_text_color',
        'loading_counter_duration',
        'loading_redirect_url',
        'loading_hero_heading',
        'loading_hero_image',
    ]);
});

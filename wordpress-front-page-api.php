<?php
/**
 * Expose WordPress static front page ID via REST API
 *
 * Add to theme functions.php or use a code snippets plugin.
 * Next.js uses this to load homepage sections when slug "homepage"/"home" is not used.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('wp/v2', '/front-page', [
        'methods'             => 'GET',
        'callback'            => function () {
            $page_id = (int) get_option('page_on_front', 0);
            if ($page_id < 1) {
                return new WP_Error(
                    'no_front_page',
                    'No static front page set (Settings → Reading).',
                    ['status' => 404]
                );
            }
            return rest_ensure_response(['id' => $page_id]);
        },
        'permission_callback' => '__return_true',
    ]);
});

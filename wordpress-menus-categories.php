/**
 * Register Menu Locations and Make Categories Public
 * 
 * Add this code to your WordPress theme's functions.php file
 * or use a code snippets plugin.
 */

// Register menu locations
function register_headless_menus() {
    register_nav_menus([
        'primary-navigation' => __('Primary Navigation', 'textdomain'),
        'secondary-navigation' => __('Secondary Navigation', 'textdomain'),
    ]);
}
add_action('after_setup_theme', 'register_headless_menus');

// Make categories publicly accessible with post counts
add_action('rest_api_init', function () {
    // Add custom endpoint for categories with counts
    register_rest_route('wp/v2', '/categories-with-counts', [
        'methods' => 'GET',
        'callback' => function ($request) {
            $args = [
                'taxonomy' => 'category',
                'hide_empty' => false,
                'orderby' => 'name',
                'order' => 'ASC',
            ];
            
            $categories = get_terms($args);
            
            if (is_wp_error($categories)) {
                return new WP_Error('no_categories', 'No categories found', ['status' => 404]);
            }
            
            $result = array_map(function ($cat) {
                return [
                    'id' => $cat->term_id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'description' => $cat->description,
                    'count' => $cat->count,
                    'parent' => $cat->parent,
                    'link' => get_term_link($cat),
                ];
            }, $categories);
            
            return rest_ensure_response($result);
        },
        'permission_callback' => '__return_true',
    ]);
});

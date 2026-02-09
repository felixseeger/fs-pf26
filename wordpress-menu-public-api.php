/**
 * Make WordPress Menus Publicly Accessible via REST API
 * 
 * Add this code to your WordPress theme's functions.php file
 * or use a code snippets plugin.
 */

// Make nav menu items public
add_filter('rest_nav_menu_item_query', function ($args, $request) {
    // Allow public access to menu items
    unset($args['author']);
    return $args;
}, 10, 2);

// Allow reading menu items without authentication
add_filter('rest_prepare_nav_menu_item', function ($response, $item, $request) {
    return $response;
}, 10, 3);

// Make menu locations public
add_action('rest_api_init', function () {
    register_rest_route('wp/v2', '/menu-locations-public', [
        'methods' => 'GET',
        'callback' => function () {
            $locations = get_nav_menu_locations();
            $result = [];
            
            foreach ($locations as $location => $menu_id) {
                if ($menu_id) {
                    $menu = wp_get_nav_menu_object($menu_id);
                    if ($menu) {
                        $result[$location] = [
                            'id' => $menu_id,
                            'slug' => $menu->slug,
                            'name' => $menu->name,
                        ];
                    }
                }
            }
            
            return rest_ensure_response($result);
        },
        'permission_callback' => '__return_true',
    ]);
    
    // Public endpoint for menu items by location
    register_rest_route('wp/v2', '/menu-by-location/(?P<location>[a-zA-Z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => function ($request) {
            $location = $request->get_param('location');
            $locations = get_nav_menu_locations();
            
            if (!isset($locations[$location])) {
                return new WP_Error('menu_not_found', 'Menu location not found', ['status' => 404]);
            }
            
            $menu_id = $locations[$location];
            $menu_items = wp_get_nav_menu_items($menu_id);
            
            if (!$menu_items) {
                return [];
            }
            
            $items = array_map(function ($item) {
                return [
                    'ID' => $item->ID,
                    'title' => $item->title,
                    'url' => $item->url,
                    'target' => $item->target,
                    'menu_order' => $item->menu_order,
                    'parent' => $item->menu_item_parent,
                    'object' => $item->object,
                    'object_id' => $item->object_id,
                    'type' => $item->type,
                ];
            }, $menu_items);
            
            return rest_ensure_response($items);
        },
        'permission_callback' => '__return_true',
    ]);
});

<?php
/**
 * Public Menu REST API Endpoints
 *
 * Add this code to your WordPress theme's functions.php file
 * or use a code snippets plugin like "Code Snippets".
 */

add_action('rest_api_init', function () {
    // List all menus (public)
    register_rest_route('custom/v1', '/menus', [
        'methods' => 'GET',
        'callback' => function () {
            $menus = wp_get_nav_menus();

            $result = array_map(function ($menu) {
                return [
                    'id' => $menu->term_id,
                    'name' => $menu->name,
                    'slug' => $menu->slug,
                    'count' => $menu->count,
                ];
            }, $menus);

            return rest_ensure_response($result);
        },
        'permission_callback' => '__return_true',
    ]);

    // Get menu items by menu name or slug (public)
    register_rest_route('custom/v1', '/menus/(?P<menu>[a-zA-Z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => function ($request) {
            $menu_param = $request->get_param('menu');

            // Try to get menu by slug first, then by name
            $menu = wp_get_nav_menu_object($menu_param);

            if (!$menu) {
                // Try case-insensitive name match
                $menus = wp_get_nav_menus();
                foreach ($menus as $m) {
                    if (strtolower($m->name) === strtolower($menu_param) ||
                        strtolower($m->slug) === strtolower($menu_param)) {
                        $menu = $m;
                        break;
                    }
                }
            }

            if (!$menu) {
                return new WP_Error(
                    'menu_not_found',
                    'Menu not found: ' . $menu_param,
                    ['status' => 404]
                );
            }

            $menu_items = wp_get_nav_menu_items($menu->term_id);

            if (!$menu_items) {
                return rest_ensure_response([]);
            }

            $items = array_map(function ($item) {
                return [
                    'ID' => $item->ID,
                    'title' => $item->title,
                    'url' => $item->url,
                    'target' => $item->target ?: '',
                    'classes' => $item->classes ?: [],
                    'menu_order' => $item->menu_order,
                    'parent' => (int) $item->menu_item_parent,
                    'object' => $item->object,
                    'object_id' => (int) $item->object_id,
                    'type' => $item->type,
                    'type_label' => $item->type_label,
                ];
            }, $menu_items);

            return rest_ensure_response($items);
        },
        'permission_callback' => '__return_true',
    ]);
});

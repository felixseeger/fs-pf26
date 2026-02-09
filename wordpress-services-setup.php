<?php
/**
 * Services Custom Post Type Registration
 *
 * Add this code to your WordPress theme's functions.php file
 * or create a custom plugin with this code.
 *
 * This registers a 'services' custom post type that will be
 * accessible via the WordPress REST API at:
 * /wp-json/wp/v2/services
 */

/**
 * Register Services Custom Post Type
 */
function fs_register_services_post_type() {
    $labels = array(
        'name'                  => _x('Services', 'Post type general name', 'fs-portfolio'),
        'singular_name'         => _x('Service', 'Post type singular name', 'fs-portfolio'),
        'menu_name'             => _x('Services', 'Admin Menu text', 'fs-portfolio'),
        'name_admin_bar'        => _x('Service', 'Add New on Toolbar', 'fs-portfolio'),
        'add_new'               => __('Add New', 'fs-portfolio'),
        'add_new_item'          => __('Add New Service', 'fs-portfolio'),
        'new_item'              => __('New Service', 'fs-portfolio'),
        'edit_item'             => __('Edit Service', 'fs-portfolio'),
        'view_item'             => __('View Service', 'fs-portfolio'),
        'all_items'             => __('All Services', 'fs-portfolio'),
        'search_items'          => __('Search Services', 'fs-portfolio'),
        'parent_item_colon'     => __('Parent Services:', 'fs-portfolio'),
        'not_found'             => __('No services found.', 'fs-portfolio'),
        'not_found_in_trash'    => __('No services found in Trash.', 'fs-portfolio'),
        'featured_image'        => _x('Service Icon Image', 'Overrides the "Featured Image" phrase', 'fs-portfolio'),
        'set_featured_image'    => _x('Set service icon', 'Overrides the "Set featured image" phrase', 'fs-portfolio'),
        'remove_featured_image' => _x('Remove service icon', 'Overrides the "Remove featured image" phrase', 'fs-portfolio'),
        'use_featured_image'    => _x('Use as service icon', 'Overrides the "Use as featured image" phrase', 'fs-portfolio'),
        'archives'              => _x('Service archives', 'The post type archive label', 'fs-portfolio'),
        'insert_into_item'      => _x('Insert into service', 'Overrides the "Insert into post" phrase', 'fs-portfolio'),
        'uploaded_to_this_item' => _x('Uploaded to this service', 'Overrides the "Uploaded to this post" phrase', 'fs-portfolio'),
        'filter_items_list'     => _x('Filter services list', 'Screen reader text for the filter links', 'fs-portfolio'),
        'items_list_navigation' => _x('Services list navigation', 'Screen reader text for the pagination', 'fs-portfolio'),
        'items_list'            => _x('Services list', 'Screen reader text for the items list', 'fs-portfolio'),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true, // IMPORTANT: Enables REST API
        'rest_base'          => 'services',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        'query_var'          => true,
        'rewrite'            => array('slug' => 'services'),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 20,
        'menu_icon'          => 'dashicons-admin-tools',
        'supports'           => array(
            'title',
            'editor',
            'excerpt',
            'thumbnail',
            'custom-fields',
            'page-attributes', // Enables menu_order for sorting
        ),
    );

    register_post_type('services', $args);
}
add_action('init', 'fs_register_services_post_type');

/**
 * Add Custom Fields support to REST API
 * This makes ACF fields available in the REST API response
 */
function fs_services_rest_api_custom_fields() {
    register_rest_field(
        'services',
        'acf',
        array(
            'get_callback' => function($post) {
                // If using ACF plugin
                if (function_exists('get_fields')) {
                    return get_fields($post['id']);
                }
                // If not using ACF, return custom fields
                return get_post_meta($post['id']);
            },
            'update_callback' => null,
            'schema' => array(
                'description' => __('Advanced Custom Fields', 'fs-portfolio'),
                'type' => 'object',
            ),
        )
    );
}
add_action('rest_api_init', 'fs_services_rest_api_custom_fields');

/**
 * Flush rewrite rules on theme activation
 * Run this once after adding the code
 */
function fs_rewrite_flush() {
    fs_register_services_post_type();
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'fs_rewrite_flush');

?>

<!--
=================================================================
RECOMMENDED ACF FIELDS FOR SERVICES
=================================================================

If you're using Advanced Custom Fields (ACF), create a field group
with these fields for the Services post type:

Field Group: Service Details
Location: Post Type is equal to services

Fields:
1. Icon Name
   - Field Name: icon
   - Field Type: Text
   - Instructions: Lucide icon name (e.g., 'Code2', 'Palette', 'Smartphone')
   - Default: Code2

2. Short Description
   - Field Name: short_description
   - Field Type: Textarea
   - Instructions: Brief description for card display
   - Character Limit: 150

=================================================================
SAMPLE DATA TO ADD
=================================================================

After registering the post type, add these 6 services in WordPress:

1. Title: Web Development
   Icon: Code2
   Short Description: Custom websites and web applications built with modern technologies for optimal performance and scalability.
   Order: 0

2. Title: UI/UX Design
   Icon: Palette
   Short Description: User-centered design solutions that create engaging and intuitive digital experiences across all platforms.
   Order: 1

3. Title: Mobile Apps
   Icon: Smartphone
   Short Description: Native and cross-platform mobile applications that deliver seamless user experiences on iOS and Android.
   Order: 2

4. Title: Digital Strategy
   Icon: TrendingUp
   Short Description: Strategic planning and consulting to help your business thrive in the digital landscape and reach your goals.
   Order: 3

5. Title: Brand Identity
   Icon: Rocket
   Short Description: Comprehensive branding solutions that establish a strong and memorable market presence for your business.
   Order: 4

6. Title: Support & Maintenance
   Icon: Headphones
   Short Description: Ongoing support and maintenance to keep your digital products running smoothly and up-to-date.
   Order: 5

=================================================================
TESTING THE REST API
=================================================================

After setup, test the endpoint:
http://your-wordpress-site.local/wp-json/wp/v2/services

Expected response:
[
  {
    "id": 123,
    "title": {
      "rendered": "Web Development"
    },
    "content": {
      "rendered": "<p>Full description...</p>"
    },
    "excerpt": {
      "rendered": "<p>Short excerpt...</p>"
    },
    "menu_order": 0,
    "acf": {
      "icon": "Code2",
      "short_description": "Custom websites and web applications..."
    }
  }
]

-->

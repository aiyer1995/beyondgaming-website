<?php
/**
 * Plugin Name: BG Customer Login
 * Description: REST API endpoint for headless customer login (supports email or username)
 * Version: 2.0
 */

add_action('rest_api_init', function () {
    register_rest_route('bg/v1', '/login', [
        'methods'  => 'POST',
        'callback' => 'bg_customer_login',
        'permission_callback' => '__return_true',
    ]);
});

function bg_customer_login(WP_REST_Request $request) {
    $identifier = $request->get_param('email'); // accepts email or username
    $password   = $request->get_param('password');

    if (empty($identifier) || empty($password)) {
        return new WP_REST_Response(['error' => 'Email/username and password required'], 400);
    }

    // wp_authenticate accepts both username and email
    $user = wp_authenticate($identifier, $password);

    if (is_wp_error($user)) {
        // If login with identifier failed and it doesn't look like an email, try as-is
        // If it looks like an email but failed, also try finding user by email
        if (strpos($identifier, '@') !== false) {
            $wp_user = get_user_by('email', $identifier);
            if ($wp_user) {
                $user = wp_authenticate($wp_user->user_login, $password);
            }
        }

        if (is_wp_error($user)) {
            return new WP_REST_Response(['error' => 'Invalid credentials'], 401);
        }
    }

    // Find matching WooCommerce customer
    $customer_id = $user->ID;

    // Verify this user is a customer (has customer role or is admin)
    if (!in_array('customer', $user->roles) && !in_array('administrator', $user->roles)) {
        return new WP_REST_Response(['error' => 'Invalid credentials'], 401);
    }

    return new WP_REST_Response([
        'customer_id' => $customer_id,
        'email'       => $user->user_email,
        'first_name'  => $user->first_name,
        'last_name'   => $user->last_name,
    ], 200);
}

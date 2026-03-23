<?php
/**
 * Plugin Name: BG Forgot Password
 * Description: REST API endpoint for headless forgot password flow
 * Version: 1.0
 */

add_action('rest_api_init', function () {
    register_rest_route('bg/v1', '/forgot-password', [
        'methods' => 'POST',
        'callback' => 'bg_handle_forgot_password',
        'permission_callback' => '__return_true',
    ]);
});

function bg_handle_forgot_password($request) {
    $email = sanitize_email($request->get_param('email'));

    if (empty($email) || !is_email($email)) {
        return new WP_REST_Response(['message' => 'Please enter a valid email address.'], 400);
    }

    $user = get_user_by('email', $email);

    if (!$user) {
        // Don't reveal whether email exists — always return success
        return new WP_REST_Response(['success' => true], 200);
    }

    // Generate reset key
    $key = get_password_reset_key($user);

    if (is_wp_error($key)) {
        return new WP_REST_Response(['message' => 'Could not generate reset link. Please try again.'], 500);
    }

    // Build reset URL pointing to WordPress
    $reset_url = network_site_url("wp-login.php?action=rp&key=$key&login=" . rawurlencode($user->user_login), 'login');

    // Send email
    $subject = 'Password Reset - Beyond Gaming';
    $message = "Hi " . $user->first_name . ",\n\n";
    $message .= "We received a request to reset your password for your Beyond Gaming account.\n\n";
    $message .= "Click the link below to set a new password:\n";
    $message .= $reset_url . "\n\n";
    $message .= "If you didn't request this, you can safely ignore this email.\n\n";
    $message .= "— Beyond Gaming Team";

    $sent = wp_mail($user->user_email, $subject, $message);

    if (!$sent) {
        return new WP_REST_Response(['message' => 'Failed to send email. Please try again.'], 500);
    }

    return new WP_REST_Response(['success' => true], 200);
}

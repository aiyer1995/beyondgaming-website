<?php
/**
 * Plugin Name: BG Grading Submissions
 * Description: Stores grading form submissions and shows them in the WooCommerce dashboard.
 * Version: 1.0
 * Author: Beyond Gaming
 */
if (!defined('ABSPATH')) exit;

/* ─── Custom Post Type ─── */
add_action('init', function () {
    register_post_type('bg_grading_sub', [
        'labels' => [
            'name'          => 'Grading Submissions',
            'singular_name' => 'Grading Submission',
        ],
        'public'          => false,
        'show_ui'         => false,
        'supports'        => ['title'],
        'capability_type' => 'post',
    ]);
});

/* ─── REST Endpoint ─── */
add_action('rest_api_init', function () {
    register_rest_route('bg/v1', '/grading-submissions', [
        'methods'             => 'POST',
        'callback'            => 'bg_handle_grading_submission',
        'permission_callback' => '__return_true',
    ]);
});

function bg_handle_grading_submission(WP_REST_Request $request) {
    $params = $request->get_json_params();

    $required = ['first_name', 'last_name', 'email', 'phone', 'order_number', 'cards'];
    foreach ($required as $field) {
        if (empty($params[$field])) {
            return new WP_REST_Response(['message' => "Missing field: $field"], 400);
        }
    }

    if (!is_array($params['cards']) || count($params['cards']) === 0) {
        return new WP_REST_Response(['message' => 'At least one card is required'], 400);
    }

    $title = sprintf(
        '#%s - %s %s',
        sanitize_text_field($params['order_number']),
        sanitize_text_field($params['first_name']),
        sanitize_text_field($params['last_name'])
    );

    $post_id = wp_insert_post([
        'post_type'   => 'bg_grading_sub',
        'post_title'  => $title,
        'post_status' => 'publish',
    ]);

    if (is_wp_error($post_id)) {
        return new WP_REST_Response(['message' => 'Failed to save submission'], 500);
    }

    update_post_meta($post_id, '_bg_first_name',   sanitize_text_field($params['first_name']));
    update_post_meta($post_id, '_bg_last_name',    sanitize_text_field($params['last_name']));
    update_post_meta($post_id, '_bg_email',        sanitize_email($params['email']));
    update_post_meta($post_id, '_bg_phone',        sanitize_text_field($params['phone']));
    update_post_meta($post_id, '_bg_order_number', sanitize_text_field($params['order_number']));

    $sanitized_cards = [];
    foreach ($params['cards'] as $card) {
        $sanitized_cards[] = [
            'card_name' => sanitize_text_field($card['cardName'] ?? ''),
            'category'  => sanitize_text_field($card['category'] ?? ''),
        ];
    }
    update_post_meta($post_id, '_bg_cards', $sanitized_cards);

    return new WP_REST_Response(['id' => $post_id, 'message' => 'Submission saved'], 201);
}

/* ─── Admin Menu ─── */
add_action('admin_menu', function () {
    add_submenu_page(
        'woocommerce',
        'Grading Submissions',
        'Grading Submissions',
        'manage_woocommerce',
        'bg-grading-submissions',
        'bg_grading_submissions_page'
    );
});

function bg_grading_submissions_page() {
    // Detail view
    if (!empty($_GET['submission_id'])) {
        bg_grading_submission_detail(intval($_GET['submission_id']));
        return;
    }

    // List view
    $paged = max(1, intval($_GET['paged'] ?? 1));
    $query = new WP_Query([
        'post_type'      => 'bg_grading_sub',
        'posts_per_page' => 20,
        'paged'          => $paged,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ]);

    echo '<div class="wrap">';
    echo '<h1>Grading Form Submissions</h1>';

    if (!$query->have_posts()) {
        echo '<p>No submissions yet.</p></div>';
        return;
    }

    echo '<table class="widefat striped" style="margin-top:15px">';
    echo '<thead><tr>';
    echo '<th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>Order #</th><th>Cards</th><th></th>';
    echo '</tr></thead><tbody>';

    while ($query->have_posts()) {
        $query->the_post();
        $id         = get_the_ID();
        $first      = get_post_meta($id, '_bg_first_name', true);
        $last       = get_post_meta($id, '_bg_last_name', true);
        $email      = get_post_meta($id, '_bg_email', true);
        $phone      = get_post_meta($id, '_bg_phone', true);
        $order_num  = get_post_meta($id, '_bg_order_number', true);
        $cards      = get_post_meta($id, '_bg_cards', true);
        $card_count = is_array($cards) ? count($cards) : 0;
        $date       = get_the_date('M j, Y g:i A');
        $detail_url = admin_url("admin.php?page=bg-grading-submissions&submission_id=$id");

        echo "<tr>";
        echo "<td>$date</td>";
        echo "<td><strong>" . esc_html("$first $last") . "</strong></td>";
        echo "<td><a href='mailto:" . esc_attr($email) . "'>" . esc_html($email) . "</a></td>";
        echo "<td>" . esc_html($phone) . "</td>";
        echo "<td><strong>" . esc_html($order_num) . "</strong></td>";
        echo "<td>$card_count card(s)</td>";
        echo "<td><a href='" . esc_url($detail_url) . "' class='button button-small'>View</a></td>";
        echo "</tr>";
    }

    echo '</tbody></table>';

    // Pagination
    $total_pages = $query->max_num_pages;
    if ($total_pages > 1) {
        echo '<div class="tablenav bottom"><div class="tablenav-pages">';
        echo paginate_links([
            'base'    => add_query_arg('paged', '%#%'),
            'format'  => '',
            'current' => $paged,
            'total'   => $total_pages,
        ]);
        echo '</div></div>';
    }

    wp_reset_postdata();
    echo '</div>';
}

function bg_grading_submission_detail($post_id) {
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'bg_grading_sub') {
        echo '<div class="wrap"><h1>Submission Not Found</h1></div>';
        return;
    }

    $first     = get_post_meta($post_id, '_bg_first_name', true);
    $last      = get_post_meta($post_id, '_bg_last_name', true);
    $email     = get_post_meta($post_id, '_bg_email', true);
    $phone     = get_post_meta($post_id, '_bg_phone', true);
    $order_num = get_post_meta($post_id, '_bg_order_number', true);
    $cards     = get_post_meta($post_id, '_bg_cards', true);
    $date      = get_the_date('M j, Y g:i A', $post_id);
    $back_url  = admin_url('admin.php?page=bg-grading-submissions');

    echo '<div class="wrap">';
    echo '<a href="' . esc_url($back_url) . '">&larr; Back to Submissions</a>';
    echo '<h1>Submission: ' . esc_html($post->post_title) . '</h1>';

    echo '<table class="widefat" style="max-width:600px;margin-top:15px">';
    echo '<tr><th style="width:140px">Date</th><td>' . esc_html($date) . '</td></tr>';
    echo '<tr><th>Name</th><td>' . esc_html("$first $last") . '</td></tr>';
    echo '<tr><th>Email</th><td><a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a></td></tr>';
    echo '<tr><th>Phone</th><td>' . esc_html($phone) . '</td></tr>';
    echo '<tr><th>Order Number</th><td><strong>' . esc_html($order_num) . '</strong></td></tr>';
    echo '</table>';

    if (is_array($cards) && count($cards) > 0) {
        echo '<h2 style="margin-top:20px">Cards (' . count($cards) . ')</h2>';
        echo '<table class="widefat striped" style="max-width:600px">';
        echo '<thead><tr><th>#</th><th>Card Name</th><th>Category</th></tr></thead><tbody>';
        foreach ($cards as $i => $card) {
            echo '<tr>';
            echo '<td>' . ($i + 1) . '</td>';
            echo '<td>' . esc_html($card['card_name'] ?? '') . '</td>';
            echo '<td>' . esc_html($card['category'] ?? '') . '</td>';
            echo '</tr>';
        }
        echo '</tbody></table>';
    }

    echo '</div>';
}

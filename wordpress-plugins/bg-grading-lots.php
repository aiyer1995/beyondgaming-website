<?php
/**
 * Plugin Name: Grade Date Settings
 * Description: Manage grading lot dates from WooCommerce dashboard. Exposes REST API at /wp-json/bg/v1/grading-lots
 * Version: 1.0
 * Author: Beyond Gaming
 */

if (!defined('ABSPATH')) exit;

// Add menu under WooCommerce
add_action('admin_menu', function () {
    add_submenu_page(
        'woocommerce',
        'Grading Lots',
        'Grading Lots',
        'manage_woocommerce',
        'bg-grading-lots',
        'bg_grading_lots_page'
    );
});

// Register settings
add_action('admin_init', function () {
    register_setting('bg_grading_lots', 'bg_active_lot');
    register_setting('bg_grading_lots', 'bg_next_lot');
    register_setting('bg_grading_lots', 'bg_in_progress_lots');
});

// Settings page
function bg_grading_lots_page() {
    $active = get_option('bg_active_lot', 'None');
    $next = get_option('bg_next_lot', 'March 15th - 25th 2026');
    $in_progress = get_option('bg_in_progress_lots', 'Nov 2025 / Jan 2026');
    ?>
    <div class="wrap">
        <h1>Grading Lot Manager</h1>
        <p>Update lot dates here. Changes appear on the website instantly.</p>
        <form method="post" action="options.php">
            <?php settings_fields('bg_grading_lots'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="bg_active_lot">Currently Active Lot</label>
                    </th>
                    <td>
                        <input type="text" id="bg_active_lot" name="bg_active_lot"
                               value="<?php echo esc_attr($active); ?>"
                               class="regular-text"
                               placeholder="e.g. March 15th - 25th 2026 (or None)" />
                        <p class="description">Enter "None" if no lot is currently active.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="bg_next_lot">Next Scheduled Lot</label>
                    </th>
                    <td>
                        <input type="text" id="bg_next_lot" name="bg_next_lot"
                               value="<?php echo esc_attr($next); ?>"
                               class="regular-text"
                               placeholder="e.g. April 5th - 15th 2026" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="bg_in_progress_lots">In Progress Lots</label>
                    </th>
                    <td>
                        <input type="text" id="bg_in_progress_lots" name="bg_in_progress_lots"
                               value="<?php echo esc_attr($in_progress); ?>"
                               class="regular-text"
                               placeholder="e.g. Nov 2025 / Jan 2026" />
                        <p class="description">Separate multiple lots with " / "</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Lot Dates'); ?>
        </form>
    </div>
    <?php
}

// REST API endpoint (public, no auth needed)
add_action('rest_api_init', function () {
    register_rest_route('bg/v1', '/grading-lots', [
        'methods'  => 'GET',
        'callback' => function () {
            return new WP_REST_Response([
                'active_lot'      => get_option('bg_active_lot', 'None'),
                'next_lot'        => get_option('bg_next_lot', ''),
                'in_progress_lots' => get_option('bg_in_progress_lots', ''),
            ], 200);
        },
        'permission_callback' => '__return_true',
    ]);
});

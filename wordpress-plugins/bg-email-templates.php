<?php
/**
 * Plugin Name: BG Email Templates
 * Description: Custom WooCommerce email templates matching Beyond Gaming branding
 * Version: 3.0
 */

// Set WooCommerce email options (colors, header image)
add_action('admin_init', 'bg_set_email_options');
function bg_set_email_options() {
    $options = [
        'woocommerce_email_base_color'            => '#581c87',
        'woocommerce_email_background_color'       => '#f3f0f7',
        'woocommerce_email_body_background_color'  => '#ffffff',
        'woocommerce_email_text_color'             => '#374151',
        'woocommerce_email_header_image'           => content_url('/uploads/2025/11/BG-New-2.png'),
        'woocommerce_email_footer_text'            => '{site_title} | For Collectors. By Collectors.',
    ];
    foreach ($options as $key => $value) {
        update_option($key, $value);
    }
}

// Custom CSS overrides
add_filter('woocommerce_email_styles', 'bg_custom_email_styles', 20);
function bg_custom_email_styles($css) {
    $css .= '
        #wrapper {
            background-color: #f3f0f7 !important;
            width: 100% !important;
        }

        #wrapper > table {
            width: 100% !important;
        }

        #template_container {
            border: none !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            width: 600px !important;
            max-width: 100% !important;
            margin: 0 auto !important;
        }

        #template_body,
        #body_content,
        #body_content_inner {
            width: 100% !important;
        }

        #body_content > table {
            width: 100% !important;
        }

        #template_container {
            border-radius: 0 !important;
        }

        #template_header {
            background-color: #1a0030 !important;
            border-bottom: 3px solid #d4a843 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            font-size: 0 !important;
            line-height: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
        }

        #template_header h1 {
            display: none !important;
        }

        #template_header_image {
            background-color: #1a0030 !important;
            padding: 28px 0 0 0 !important;
            margin: 0 !important;
            border: none !important;
        }

        #template_header_image td {
            background-color: #1a0030 !important;
            padding: 28px 48px 8px 48px !important;
        }

        #template_header_image p {
            margin: 0 !important;
            padding: 0 !important;
        }

        #template_header_image img {
            max-width: 300px !important;
            width: 300px !important;
            margin: 0 auto !important;
            display: block !important;
        }

        #template_header_image + div,
        #template_header_image + tbody,
        #template_header_image + tr {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        /* Order table styling */
        .td {
            border: 1px solid #f3f0f7 !important;
        }

        .order_item td,
        .order_item th {
            border: 1px solid #f3f0f7 !important;
            padding: 12px !important;
        }

        thead .td,
        thead th,
        .order_item_table thead th,
        h2 + table thead th,
        table.td thead th {
            background-color: #f9f5ff !important;
            color: #581c87 !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            font-size: 11px !important;
            letter-spacing: 1px !important;
            padding: 12px !important;
            border: 1px solid #f3f0f7 !important;
        }

        tfoot th,
        tfoot td {
            border: 1px solid #f3f0f7 !important;
            padding: 12px !important;
        }

        tfoot th {
            color: #1a0030 !important;
            font-weight: 700 !important;
        }

        #body_content h2 {
            color: #1a0030 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            font-weight: 800 !important;
        }

        #body_content h3 {
            color: #581c87 !important;
        }

        #body_content p,
        #body_content td {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }

        #body_content a {
            color: #7c3aed !important;
            font-weight: 600 !important;
        }

        address {
            background-color: #f9f5ff !important;
            border-radius: 8px !important;
            padding: 12px !important;
        }

        #template_footer {
            border-top: 2px solid #f3f0f7 !important;
        }

        #template_footer #credit {
            color: #9ca3af !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            font-size: 12px !important;
        }

        #template_footer #credit a {
            color: #7c3aed !important;
            font-weight: 600 !important;
        }
    ';
    return $css;
}

// Inject email heading into body content (above "Hi Name,")
add_action('woocommerce_email_before_order_table', 'bg_inject_email_heading', 1, 4);
add_action('woocommerce_before_email_content', 'bg_inject_email_heading_generic', 1);
function bg_inject_email_heading($order = null, $sent_to_admin = false, $plain_text = false, $email = null) {
    if ($plain_text) return;
    if ($email && !empty($email->heading)) {
        // Already handled
    }
}

// Use output buffering to prepend heading
add_action('woocommerce_email_header', 'bg_capture_heading', 20, 2);
function bg_capture_heading($email_heading, $email = null) {
    echo '<h1 style="color: #1a0030; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 800; margin: 0 0 20px 0; padding: 0;">' . wp_kses_post($email_heading) . '</h1>';
}

// Add "Need Help?" box after order table
add_action('woocommerce_email_after_order_table', 'bg_email_after_order_content', 10, 4);
function bg_email_after_order_content($order, $sent_to_admin, $plain_text, $email) {
    if ($sent_to_admin || $plain_text) return;

    echo '<div style="background-color: #f9f5ff; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #d4a843;">
        <p style="margin: 0 0 8px 0; color: #1a0030; font-weight: 700; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">Need Help?</p>
        <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">
            Reach us on WhatsApp at <strong style="color: #374151;">+91 9372443237</strong> or email us at <a href="mailto:contact@beyondgaming.in" style="color: #7c3aed; font-weight: 600; text-decoration: none;">contact@beyondgaming.in</a>
        </p>
    </div>';
}

// Custom footer with social links
add_filter('woocommerce_email_footer_text', 'bg_custom_footer_text');
function bg_custom_footer_text($footer_text) {
    return 'Beyond Ventures LLP (Beyond Gaming) | For Collectors. By Collectors.<br/><a href="https://beyondgaming.in">beyondgaming.in</a> &nbsp;|&nbsp; <a href="https://instagram.com/beyond__gaming">Instagram</a> &nbsp;|&nbsp; <a href="https://wa.me/919372443237">WhatsApp</a><br/><br/>&copy; ' . date('Y') . ' Beyond Ventures LLP. All Rights Reserved.';
}

// Remove default "Thanks again" text
add_filter('gettext', 'bg_replace_email_strings', 20, 3);
function bg_replace_email_strings($translated, $text, $domain) {
    if ($domain === 'woocommerce') {
        if (strpos($text, 'Thanks again') !== false || strpos($translated, 'contact@beyondgaming.com') !== false) {
            return '';
        }
    }
    return $translated;
}

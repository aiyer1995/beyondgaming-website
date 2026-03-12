<?php
/**
 * Plugin Name: BG Email Templates
 * Description: Custom WooCommerce email templates matching Beyond Gaming branding
 * Version: 1.0
 */

// Override WooCommerce email styles
add_filter('woocommerce_email_styles', 'bg_custom_email_styles', 20);
function bg_custom_email_styles($css) {
    $css .= '
        /* Beyond Gaming Email Theme */
        #wrapper {
            background-color: #f3f0f7 !important;
            padding: 40px 0 !important;
        }

        #template_container {
            background-color: #ffffff !important;
            border: none !important;
            border-radius: 16px !important;
            box-shadow: 0 4px 24px rgba(26, 0, 48, 0.08) !important;
            overflow: hidden !important;
        }

        #template_header {
            background: linear-gradient(135deg, #1a0030 0%, #581c87 50%, #6b21a8 100%) !important;
            border-bottom: 3px solid #d4a843 !important;
            border-radius: 0 !important;
            padding: 36px 48px !important;
            text-align: center !important;
        }

        #template_header h1 {
            color: #ffffff !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 24px !important;
            font-weight: 800 !important;
            letter-spacing: 0.5px !important;
            margin: 0 !important;
            text-shadow: none !important;
        }

        #template_header_image {
            padding: 24px 0 0 0 !important;
            text-align: center !important;
        }

        #template_header_image img {
            max-width: 180px !important;
            height: auto !important;
        }

        #body_content {
            background-color: #ffffff !important;
            padding: 36px 48px !important;
        }

        #body_content table td {
            padding: 12px 0 !important;
        }

        #body_content table td td {
            padding: 12px !important;
        }

        #body_content p,
        #body_content td {
            color: #374151 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.7 !important;
        }

        #body_content h2 {
            color: #1a0030 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 20px !important;
            font-weight: 800 !important;
            border-bottom: 2px solid #f3f0f7 !important;
            padding-bottom: 12px !important;
            margin-bottom: 16px !important;
        }

        #body_content h3 {
            color: #581c87 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 16px !important;
            font-weight: 700 !important;
        }

        /* Order table */
        .td {
            color: #374151 !important;
            border: 1px solid #f3f0f7 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }

        .order_item_table th {
            background-color: #f9f5ff !important;
            color: #581c87 !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            font-size: 11px !important;
            letter-spacing: 1px !important;
        }

        tfoot th {
            color: #1a0030 !important;
            font-weight: 700 !important;
        }

        /* Links */
        #body_content a {
            color: #7c3aed !important;
            font-weight: 600 !important;
            text-decoration: none !important;
        }

        #body_content a:hover {
            color: #581c87 !important;
            text-decoration: underline !important;
        }

        /* Addresses */
        address {
            color: #6b7280 !important;
            font-style: normal !important;
            line-height: 1.8 !important;
            border-color: #f3f0f7 !important;
            padding: 16px !important;
            background-color: #f9f5ff !important;
            border-radius: 12px !important;
        }

        /* Footer */
        #template_footer {
            border-top: 2px solid #f3f0f7 !important;
            padding: 24px 48px !important;
        }

        #template_footer #credit {
            color: #9ca3af !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.6 !important;
            text-align: center !important;
        }

        #template_footer #credit a {
            color: #7c3aed !important;
            font-weight: 600 !important;
        }

        /* Button-like styling for order status */
        .order-status {
            display: inline-block !important;
            padding: 4px 12px !important;
            border-radius: 20px !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            text-transform: capitalize !important;
        }
    ';
    return $css;
}

// Set email base colors
add_filter('woocommerce_email_base_color', function() { return '#581c87'; });
add_filter('woocommerce_email_background_color', function() { return '#f3f0f7'; });
add_filter('woocommerce_email_body_background_color', function() { return '#ffffff'; });
add_filter('woocommerce_email_text_color', function() { return '#374151'; });

// Add logo to email header
add_filter('woocommerce_email_header', 'bg_email_header_logo', 5);
function bg_email_header_logo($email_heading) {
    $logo_url = home_url('/wp-content/uploads/2025/11/BG-New-2.png');
    echo '<div style="text-align: center; padding: 20px 0 10px 0;">
        <img src="' . esc_url($logo_url) . '" alt="Beyond Gaming" style="max-width: 180px; height: auto;" />
    </div>';
}

// Custom footer text
add_filter('woocommerce_email_footer_text', 'bg_custom_footer_text');
function bg_custom_footer_text($footer_text) {
    return 'Beyond Ventures LLP (Beyond Gaming) | For Collectors. By Collectors.<br/>
    <a href="https://beyondgaming.in">beyondgaming.in</a> |
    <a href="https://instagram.com/beyond__gaming">Instagram</a> |
    <a href="https://wa.me/919909611611">WhatsApp</a><br/><br/>
    &copy; ' . date('Y') . ' Beyond Ventures LLP. All Rights Reserved.';
}

// Add custom content after order details
add_action('woocommerce_email_after_order_table', 'bg_email_after_order_content', 10, 4);
function bg_email_after_order_content($order, $sent_to_admin, $plain_text, $email) {
    if ($sent_to_admin || $plain_text) return;

    echo '<div style="background: linear-gradient(135deg, #f9f5ff 0%, #faf5f0 100%); border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #d4a843;">
        <p style="margin: 0 0 8px 0; color: #1a0030; font-weight: 700; font-size: 14px;">Need Help?</p>
        <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
            Reach us on WhatsApp at <strong style="color: #374151;">+91 9909611611</strong> or email us at <strong style="color: #374151;">support@beyondgaming.in</strong>
        </p>
    </div>';
}

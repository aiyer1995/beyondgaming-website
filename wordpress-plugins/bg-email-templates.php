<?php
/**
 * Plugin Name: BG Email Templates
 * Description: Custom WooCommerce email templates matching Beyond Gaming branding
 * Version: 2.0
 */

// Set email colors via WooCommerce settings programmatically
add_action('init', 'bg_set_email_colors');
function bg_set_email_colors() {
    $options = [
        'woocommerce_email_base_color'       => '#581c87',
        'woocommerce_email_background_color'  => '#f3f0f7',
        'woocommerce_email_body_background_color' => '#ffffff',
        'woocommerce_email_text_color'        => '#374151',
        'woocommerce_email_header_image'      => home_url('/wp-content/uploads/2025/11/BG-New-2.png'),
    ];
    foreach ($options as $key => $value) {
        if (get_option($key) !== $value) {
            update_option($key, $value);
        }
    }
}

// Override WooCommerce email styles with inline-friendly CSS
add_filter('woocommerce_email_styles', 'bg_custom_email_styles', 20);
function bg_custom_email_styles($css) {
    $css .= '
        #wrapper {
            background-color: #f3f0f7 !important;
        }

        #template_container {
            border: none !important;
            border-radius: 12px !important;
            overflow: hidden !important;
        }

        #template_header {
            background-color: #1a0030 !important;
            border-bottom: 3px solid #d4a843 !important;
        }

        #template_header h1 {
            color: #ffffff !important;
        }

        #template_header_image {
            background-color: #1a0030 !important;
            margin: 0 !important;
            padding: 20px 0 0 0 !important;
        }

        #template_header_image p {
            margin: 0 !important;
        }

        #template_header_image img {
            max-width: 180px !important;
        }

        #body_content h2 {
            color: #1a0030 !important;
        }

        #body_content h3 {
            color: #581c87 !important;
        }

        #body_content a {
            color: #7c3aed !important;
        }

        address {
            background-color: #f9f5ff !important;
            border-radius: 8px !important;
            padding: 12px !important;
        }

        #template_footer #credit {
            text-align: center !important;
        }
    ';
    return $css;
}

// Replace the entire email header with custom branded one
remove_action('woocommerce_email_header', array(WC()->mailer(), 'email_header'));
add_action('woocommerce_email_header', 'bg_custom_email_header', 10, 2);
function bg_custom_email_header($email_heading, $email = null) {
    $logo_url = home_url('/wp-content/uploads/2025/11/BG-New-2.png');
    ?>
    <!DOCTYPE html>
    <html <?php language_attributes(); ?>>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=<?php bloginfo('charset'); ?>" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><?php echo get_bloginfo('name', 'display'); ?></title>
    </head>
    <body <?php echo is_rtl() ? 'rightmargin' : 'leftmargin'; ?>="0" marginwidth="0" topmargin="0" marginheight="0" offset="0">
        <div id="wrapper" dir="<?php echo is_rtl() ? 'rtl' : 'ltr'; ?>" style="background-color: #f3f0f7; margin: 0; padding: 40px 0; width: 100%; -webkit-text-size-adjust: none;">
            <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
                <tr>
                    <td align="center" valign="top">
                        <table border="0" cellpadding="0" cellspacing="0" width="600" id="template_container" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(26,0,48,0.08);">
                            <!-- Logo -->
                            <tr>
                                <td align="center" valign="top" style="background-color: #1a0030; padding: 28px 48px 12px 48px;">
                                    <img src="<?php echo esc_url($logo_url); ?>" alt="Beyond Gaming" style="max-width: 180px; height: auto; display: block; margin: 0 auto;" />
                                </td>
                            </tr>
                            <!-- Header -->
                            <tr>
                                <td align="center" valign="top" style="background-color: #1a0030; padding: 8px 48px 28px 48px; border-bottom: 3px solid #d4a843;">
                                    <h1 style="color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0; letter-spacing: 0.3px;">
                                        <?php echo wp_kses_post($email_heading); ?>
                                    </h1>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="600" id="template_body">
                                        <tr>
                                            <td valign="top" id="body_content" style="background-color: #ffffff;">
                                                <table border="0" cellpadding="20" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td valign="top" style="padding: 36px 48px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.7; color: #374151;">
                                                            <div id="body_content_inner">
    <?php
}

// Replace the entire email footer with custom branded one
remove_action('woocommerce_email_footer', array(WC()->mailer(), 'email_footer'));
add_action('woocommerce_email_footer', 'bg_custom_email_footer');
function bg_custom_email_footer($email = null) {
    ?>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td align="center" valign="top" style="border-top: 2px solid #f3f0f7; padding: 28px 48px;">
                                    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.8; color: #9ca3af; margin: 0; text-align: center;">
                                        Beyond Ventures LLP (Beyond Gaming) | For Collectors. By Collectors.<br/>
                                        <a href="https://beyondgaming.in" style="color: #7c3aed; text-decoration: none; font-weight: 600;">beyondgaming.in</a> &nbsp;|&nbsp;
                                        <a href="https://instagram.com/beyond__gaming" style="color: #7c3aed; text-decoration: none; font-weight: 600;">Instagram</a> &nbsp;|&nbsp;
                                        <a href="https://wa.me/919909611611" style="color: #7c3aed; text-decoration: none; font-weight: 600;">WhatsApp</a><br/><br/>
                                        &copy; <?php echo date('Y'); ?> Beyond Ventures LLP. All Rights Reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    <?php
}

// Add custom content after order details
add_action('woocommerce_email_after_order_table', 'bg_email_after_order_content', 10, 4);
function bg_email_after_order_content($order, $sent_to_admin, $plain_text, $email) {
    if ($sent_to_admin || $plain_text) return;

    echo '<div style="background-color: #f9f5ff; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #d4a843;">
        <p style="margin: 0 0 8px 0; color: #1a0030; font-weight: 700; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">Need Help?</p>
        <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">
            Reach us on WhatsApp at <strong style="color: #374151;">+91 9909611611</strong> or email us at <a href="mailto:contact@beyondgaming.in" style="color: #7c3aed; font-weight: 600; text-decoration: none;">contact@beyondgaming.in</a>
        </p>
    </div>';
}

// Remove default "Thanks again" text that references wrong email
add_filter('gettext', 'bg_replace_email_strings', 20, 3);
function bg_replace_email_strings($translated, $text, $domain) {
    if ($domain === 'woocommerce') {
        if (strpos($text, 'Thanks again') !== false || strpos($text, 'please contact us at') !== false) {
            return '';
        }
    }
    return $translated;
}

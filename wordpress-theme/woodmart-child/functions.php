<?php
/**
 * Beyond Gaming — Woodmart Child Theme
 *
 * Brand customization layer on top of Woodmart. Loads parent + child
 * stylesheets, registers helpers for the bg-grading-lots plugin,
 * injects the floating WhatsApp button and Geist webfont, and exposes
 * an environment-driven maintenance mode flag.
 *
 * Keep this file thin: theme overrides should live in style.css.
 * Functional WP behavior lives here.
 */

if (!defined('ABSPATH')) {
    exit;
}

/* ─────────────────────────────────────────────────────────────
   1. ENQUEUE STYLES & SCRIPTS
   ───────────────────────────────────────────────────────────── */
add_action('wp_enqueue_scripts', function () {
    // Parent (Woodmart)
    wp_enqueue_style(
        'woodmart-parent-style',
        get_template_directory_uri() . '/style.css',
        [],
        wp_get_theme(get_template())->get('Version')
    );

    // Child overrides — load AFTER parent so our rules win
    wp_enqueue_style(
        'beyondgaming-child-style',
        get_stylesheet_uri(),
        ['woodmart-parent-style'],
        wp_get_theme()->get('Version')
    );

    // Geist webfont (the design system font from the Next.js build)
    wp_enqueue_style(
        'beyondgaming-geist',
        'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&display=swap',
        [],
        null
    );

    // Custom JS — Alpine.js + small enhancements
    wp_enqueue_script(
        'beyondgaming-alpine',
        'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js',
        [],
        '3.13.0',
        true
    );

    wp_enqueue_script(
        'beyondgaming-custom',
        get_stylesheet_directory_uri() . '/assets/js/bg-custom.js',
        [],
        wp_get_theme()->get('Version'),
        true
    );
}, 20);

/* ─────────────────────────────────────────────────────────────
   2. FLOATING WHATSAPP BUTTON
   Mirrors the floating button from the Next.js site. Outputs
   into wp_footer so it appears on every page automatically.
   ───────────────────────────────────────────────────────────── */
add_action('wp_footer', function () {
    ?>
    <a href="https://api.whatsapp.com/message/T6PFEF2VAFMVP1?autoload=1&app_absent=0"
       target="_blank"
       rel="noopener noreferrer"
       class="bg-whatsapp-fab"
       aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
        </svg>
    </a>
    <?php
});

/* ─────────────────────────────────────────────────────────────
   3. GRADING LOTS HELPERS
   Convenience functions for templates that need lot data from
   the bg-grading-lots plugin. No REST hop — direct option read.
   Use these inside `page-grading.php` or any page template.
   ───────────────────────────────────────────────────────────── */
function bg_get_active_lot() {
    return get_option('bg_active_lot', 'None');
}

function bg_get_next_lot() {
    return get_option('bg_next_lot', '');
}

function bg_get_in_progress_lots() {
    return get_option('bg_in_progress_lots', '');
}

/**
 * Shortcode: [bg_grading_lots]
 *
 * Renders the live grading lots panel anywhere a shortcode can
 * be used (page builder text blocks, page content, widgets).
 * Pulls live data from the bg-grading-lots plugin options.
 */
add_shortcode('bg_grading_lots', function () {
    $active = esc_html(bg_get_active_lot());
    $next   = esc_html(bg_get_next_lot());
    $in_progress = esc_html(bg_get_in_progress_lots());

    ob_start();
    ?>
    <div class="bg-grading-lots glass" style="border-radius:24px;padding:32px;max-width:680px;margin:0 auto;">
        <h3 style="margin:0 0 20px 0;font-size:14px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--bg-purple-700);">
            Grading Lots
        </h3>
        <div style="display:grid;grid-template-columns:1fr;gap:16px;">
            <div>
                <p style="margin:0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;">Currently Active</p>
                <p style="margin:4px 0 0 0;font-size:18px;font-weight:800;color:var(--bg-ink-deep);"><?php echo $active; ?></p>
            </div>
            <div>
                <p style="margin:0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;">Next Scheduled Lot</p>
                <p style="margin:4px 0 0 0;font-size:18px;font-weight:800;color:var(--bg-ink-deep);"><?php echo $next; ?></p>
            </div>
            <div>
                <p style="margin:0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;">In Progress</p>
                <p style="margin:4px 0 0 0;font-size:18px;font-weight:800;color:var(--bg-ink-deep);"><?php echo $in_progress; ?></p>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
});

/* ─────────────────────────────────────────────────────────────
   4. MAINTENANCE MODE
   Mirror of the Next.js MAINTENANCE_MODE env var. Set the
   `BG_MAINTENANCE_MODE` constant in wp-config.php to true to
   lock the storefront behind a branded under-construction page.
   Admins logged into wp-admin always bypass.
   ───────────────────────────────────────────────────────────── */
add_action('template_redirect', function () {
    if (!defined('BG_MAINTENANCE_MODE') || !BG_MAINTENANCE_MODE) {
        return;
    }
    if (is_user_logged_in() && current_user_can('manage_options')) {
        return;
    }
    if (is_admin() || (defined('DOING_AJAX') && DOING_AJAX)) {
        return;
    }

    status_header(503);
    nocache_headers();
    header('Content-Type: text/html; charset=utf-8');
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Under Maintenance — Beyond Gaming</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;700;800;900&display=swap">
        <style>
            html, body { margin: 0; padding: 0; height: 100%; font-family: "Geist", -apple-system, sans-serif; }
            body {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1a0030 0%, #350361 50%, #4a0e7a 100%);
                color: #ffffff;
                padding: 32px;
            }
            .box { max-width: 560px; text-align: center; }
            .eyebrow { color: #fbbf24; font-size: 12px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 16px; }
            h1 { font-size: 48px; font-weight: 900; margin: 0 0 16px 0; line-height: 1.1; }
            p { color: rgba(255, 255, 255, 0.8); font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; }
            .gold { background: linear-gradient(135deg, #fbbf24, #f59e0b, #fcd34d); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
            .wa {
                display: inline-flex; align-items: center; gap: 8px;
                background: #25D366; color: #ffffff; text-decoration: none;
                font-weight: 700; padding: 12px 24px; border-radius: 12px;
            }
        </style>
    </head>
    <body>
        <div class="box">
            <p class="eyebrow">Scheduled Maintenance</p>
            <h1>We&rsquo;ll Be Right <span class="gold">Back</span></h1>
            <p>Beyond Gaming is undergoing some upgrades. Please check back in a little while.</p>
            <a class="wa" href="https://api.whatsapp.com/message/T6PFEF2VAFMVP1?autoload=1&app_absent=0">Chat on WhatsApp</a>
        </div>
    </body>
    </html>
    <?php
    exit;
}, 0);

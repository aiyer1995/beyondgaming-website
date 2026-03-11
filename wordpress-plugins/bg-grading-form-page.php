<?php
/**
 * Renders the grading form shortcode on a clean page at /bg-grading-form/
 * Add this as a Code Snippet (Run everywhere) on your WordPress site.
 */

add_action('template_redirect', function () {
    if (rtrim($_SERVER['REQUEST_URI'], '/') !== '/bg-grading-form') return;

    // Allow iframe embedding from any origin
    header('X-Frame-Options: ALLOWALL');
    remove_action('send_headers', 'send_frame_options_header');
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grading Form</title>
        <?php wp_head(); ?>
        <style>
            body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; }
            #wpadminbar, header, footer, .site-header, .site-footer { display: none !important; }
        </style>
    </head>
    <body>
        <div style="max-width: 700px; margin: 0 auto;">
            <?php echo do_shortcode('[custom_form]'); ?>
        </div>
        <?php wp_footer(); ?>
    </body>
    </html>
    <?php
    exit;
});

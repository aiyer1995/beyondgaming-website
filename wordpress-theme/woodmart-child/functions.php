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

    // Child stylesheet — version is the file's mtime so the
    // browser cache busts every time we upload a new build.
    $child_css_path = get_stylesheet_directory() . '/style.css';
    wp_enqueue_style(
        'beyondgaming-child-style',
        get_stylesheet_uri(),
        ['woodmart-parent-style'],
        file_exists($child_css_path) ? filemtime($child_css_path) : wp_get_theme()->get('Version')
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

    // Custom JS — version is the file's mtime so the browser
    // cache busts every time we upload a new build.
    $child_js_path = get_stylesheet_directory() . '/assets/js/bg-custom.js';
    wp_enqueue_script(
        'beyondgaming-custom',
        get_stylesheet_directory_uri() . '/assets/js/bg-custom.js',
        [],
        file_exists($child_js_path) ? filemtime($child_js_path) : wp_get_theme()->get('Version'),
        true
    );
}, 20);

/* ─────────────────────────────────────────────────────────────
   1d. CUSTOM MOBILE BOTTOM BAR
   Replaces Woodmart's stock sticky toolbar with a 3-item bar
   matching the Beyond Gaming iOS app: Home / Shop / Account.
   Dark purple background, gold active state, outlined icons,
   honors iOS safe area. CSS lives in section 19 of style.css.
   The matching Woodmart toolbar is hidden via CSS so they
   never overlap.
   ───────────────────────────────────────────────────────────── */
add_action('wp_footer', function () {
    if (is_admin()) {
        return;
    }

    // Determine which item is active for the gold highlight
    $is_home    = is_front_page() || is_home();
    $is_shop    = function_exists('is_shop')
        ? (is_shop() || is_product_category() || is_product_tag() || is_product())
        : false;
    $is_cart    = function_exists('is_cart') ? is_cart() : false;
    $is_account = function_exists('is_account_page')
        ? (is_account_page() && !$is_cart)
        : false;

    $home_class    = 'bg-bottom-bar__item' . ($is_home ? ' is-active' : '');
    $shop_class    = 'bg-bottom-bar__item' . ($is_shop ? ' is-active' : '');
    $cart_class    = 'bg-bottom-bar__item' . ($is_cart ? ' is-active' : '');
    $account_class = 'bg-bottom-bar__item' . ($is_account ? ' is-active' : '');

    // Live cart count for the badge
    $cart_count = 0;
    if (function_exists('WC') && WC()->cart) {
        $cart_count = WC()->cart->get_cart_contents_count();
    }
    ?>
    <nav class="bg-bottom-bar" role="navigation" aria-label="Mobile primary navigation">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="<?php echo esc_attr($home_class); ?>">
            <span class="bg-bottom-bar__icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.06l-.22-.22V19.5a2.25 2.25 0 0 1-2.25 2.25h-3a.75.75 0 0 1-.75-.75v-5.25a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0-.75.75v5.25a.75.75 0 0 1-.75.75h-3A2.25 2.25 0 0 1 4.2 19.5v-6.13l-.22.22a.75.75 0 1 1-1.06-1.06l8.55-8.69Z"/></svg>
            </span>
            <span class="bg-bottom-bar__label">Home</span>
        </a>
        <a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/shop/')); ?>" class="<?php echo esc_attr($shop_class); ?>">
            <span class="bg-bottom-bar__icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </span>
            <span class="bg-bottom-bar__label">Shop</span>
        </a>
        <a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('cart') : home_url('/cart/')); ?>" class="<?php echo esc_attr($cart_class); ?>">
            <span class="bg-bottom-bar__icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <?php if ($cart_count > 0): ?>
                    <span class="bg-bottom-bar__badge"><?php echo esc_html($cart_count); ?></span>
                <?php endif; ?>
            </span>
            <span class="bg-bottom-bar__label">Cart</span>
        </a>
        <a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/my-account/')); ?>" class="<?php echo esc_attr($account_class); ?>">
            <span class="bg-bottom-bar__icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="bg-bottom-bar__label">Account</span>
        </a>
    </nav>
    <?php
}, 60);

/* ─────────────────────────────────────────────────────────────
   1c. SIMPLE MOBILE HERO
   Direct port of the Beyond Gaming React Native app's home
   hero (src/app/(tabs)/index.tsx). Renders a tight gradient
   hero card with the brand tagline, headline, and a single
   gold CTA button. Used to replace the heavier desktop hero
   on mobile (≤1024px) where the desktop hero is too dense.

   Rendering strategy:
   - Render the section in wp_footer with display:none so it's
     always available in the DOM regardless of theme template
   - bg-custom.js moves it to be a sibling BEFORE .bg-hero
   - style.css section 18 unhides it on mobile + hides .bg-hero
   ───────────────────────────────────────────────────────────── */
add_action('wp_footer', function () {
    if (!is_front_page()) {
        return;
    }
    ?>
    <section id="bg-hero-mobile" class="bg-hero-mobile" style="display:none" aria-label="Beyond Gaming hero">
        <p class="bg-hero-mobile__label">For collectors. By collectors.</p>
        <h1 class="bg-hero-mobile__title">India's Leading<br>Collectibles Shop</h1>
        <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="bg-hero-mobile__button">
            Explore Shop&nbsp;&nbsp;<span aria-hidden="true">&rarr;</span>
        </a>
        <a href="<?php echo esc_url(home_url('/grading/')); ?>" class="bg-hero-mobile__button bg-hero-mobile__button--glass">
            Grading Services
        </a>
    </section>
    <?php
}, 1);

/* ─────────────────────────────────────────────────────────────
   1a-2. RIP IT LIVE — floating live-events banner
   Shows up to 3 in-stock products from the `rip-ship` category.
   Rendered twice (identical content) into two containers:
     - #bg-riplive-float  : frosted-glass card. bg-custom.js drops
                            it inside .bg-hero (right side); CSS
                            reveals it desktop-only (≥1025px).
     - #bg-riplive-mobile : full-width block. bg-custom.js drops it
                            right after #bg-hero-mobile; CSS reveals
                            it mobile-only (≤1024px).
   The ✕ close is wired in bg-custom.js and remembered for the
   browser session (sessionStorage), so it returns next visit.
   ───────────────────────────────────────────────────────────── */
add_action('wp_footer', function () {
    if (!is_front_page() || !function_exists('wc_get_product')) {
        return;
    }

    $query = new WP_Query([
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => 3,
        'orderby'        => 'menu_order title',
        'order'          => 'ASC',
        'no_found_rows'  => true,
        'tax_query'      => [[
            'taxonomy' => 'product_cat',
            'field'    => 'slug',
            'terms'    => 'rip-ship',
        ]],
        'meta_query'     => [[
            'key'   => '_stock_status',
            'value' => 'instock',
        ]],
    ]);

    if (!$query->have_posts()) {
        return;
    }

    // Renders the event rows; rewinds the loop so it can be
    // output into both the desktop and mobile containers.
    $render_events = function () use ($query) {
        while ($query->have_posts()) {
            $query->the_post();
            global $product;
            if (!$product instanceof WC_Product) {
                continue;
            }
            $permalink = get_permalink();
            $title     = get_the_title();
            $image     = get_the_post_thumbnail_url(get_the_ID(), 'thumbnail');
            if (!$image) {
                $image = wc_placeholder_img_src('thumbnail');
            }
            $regular = $product->get_regular_price();
            $sale    = $product->get_sale_price();
            if ($sale !== '' && $sale !== null && (float) $sale < (float) $regular) {
                $price_html = '<del>' . wc_price($regular) . '</del> <ins>' . wc_price($sale) . '</ins>';
            } else {
                $price_html = wc_price($product->get_price());
            }
            ?>
            <a class="bg-riplive__event" href="<?php echo esc_url($permalink); ?>">
                <span class="bg-riplive__thumb">
                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>" loading="lazy" />
                </span>
                <span class="bg-riplive__event-body">
                    <span class="bg-riplive__event-title"><?php echo esc_html($title); ?></span>
                    <span class="bg-riplive__event-price"><?php echo wp_kses_post($price_html); ?></span>
                </span>
                <span class="bg-riplive__event-cta" aria-hidden="true">&rarr;</span>
            </a>
            <?php
        }
        $query->rewind_posts();
    };

    $all_url = esc_url(home_url('/product-category/rip-ship/'));
    ?>
    <aside id="bg-riplive-float" class="bg-riplive bg-riplive--float" aria-label="Rip It Live events">
        <button type="button" class="bg-riplive__close" aria-label="Hide live events">&times;</button>
        <div class="bg-riplive__head">
            <span class="bg-riplive__live"><span class="bg-riplive__live-dot"></span>Live</span>
            <span class="bg-riplive__heading">RIP IT LIVE Events</span>
        </div>
        <div class="bg-riplive__events"><?php $render_events(); ?></div>
        <a class="bg-riplive__all" href="<?php echo $all_url; ?>">View all events &rarr;</a>
    </aside>

    <section id="bg-riplive-mobile" class="bg-riplive bg-riplive--mobile" aria-label="Rip It Live events">
        <button type="button" class="bg-riplive__close" aria-label="Hide live events">&times;</button>
        <div class="bg-riplive__head">
            <span class="bg-riplive__live"><span class="bg-riplive__live-dot"></span>Live</span>
            <span class="bg-riplive__heading">RIP IT LIVE Events</span>
        </div>
        <div class="bg-riplive__events"><?php $render_events(); ?></div>
        <a class="bg-riplive__all" href="<?php echo $all_url; ?>">View all events &rarr;</a>
    </section>
    <?php
    wp_reset_postdata();
}, 2);

/* ─────────────────────────────────────────────────────────────
   1b. FALLBACK MOBILE MENU
   Woodmart 7.x's mobileNavigation.min.js fails to bind a click
   handler to .wd-header-mobile-nav (verified via DOM inspection
   on this site — only the button container exists, no dropdown
   panel is created on click). To work around it, render an
   independent mobile menu panel in the footer and let
   bg-custom.js toggle a body class to show/hide it.

   Uses the existing "main-nav" theme location (Woodmart's
   primary menu). Falls back to any registered menu if that
   slot is empty.
   ───────────────────────────────────────────────────────────── */
add_action('wp_footer', function () {
    if (is_admin()) {
        return;
    }
    ?>
    <aside class="bg-mobile-menu" id="bg-mobile-menu" role="navigation" aria-label="Mobile menu" aria-hidden="true">
        <div class="bg-mobile-menu__backdrop" data-bg-mobile-menu-close></div>
        <div class="bg-mobile-menu__panel">
            <!-- Brand header — uses the same logo as the iOS app
                 (https://beyondgaming.in/wp-content/uploads/2025/11/BG-New-2.png). -->
            <div class="bg-mobile-menu__header">
                <img
                    src="https://beyondgaming.in/wp-content/uploads/2025/11/BG-New-2.png"
                    alt="Beyond Gaming"
                    class="bg-mobile-menu__logo"
                    width="240"
                    height="60"
                />
            </div>

            <!-- Section title — matches the iOS app's "CATEGORIES" / "SERVICES" / "HELP" small caps -->
            <p class="bg-mobile-menu__section-title">Browse</p>

            <?php
            // Pull by literal menu name "Main menu" so this is
            // independent of theme location assignments. Falls
            // back through a few likely names, then to the first
            // registered menu, just to be safe.
            $menu_args = [
                'container'  => false,
                'menu_class' => 'bg-mobile-menu__list',
                'fallback_cb' => false,
                'depth'      => 3,
            ];
            $menu_name_candidates = ['Main Menu', 'Main menu', 'main menu', 'Mobile Menu'];
            $picked = false;
            foreach ($menu_name_candidates as $name) {
                if (wp_get_nav_menu_object($name)) {
                    wp_nav_menu(array_merge($menu_args, ['menu' => $name]));
                    $picked = true;
                    break;
                }
            }
            if (!$picked) {
                // Last-resort fallback: first registered menu
                $menus = wp_get_nav_menus();
                if (!empty($menus)) {
                    wp_nav_menu(array_merge($menu_args, ['menu' => $menus[0]->term_id]));
                }
            }
            ?>

            <!-- Help section — mirrors the iOS app's HELP block with WhatsApp, Email, Instagram -->
            <p class="bg-mobile-menu__section-title">Help</p>
            <ul class="bg-mobile-menu__list bg-mobile-menu__list--help">
                <li class="menu-item bg-mobile-menu__help-item">
                    <a href="https://api.whatsapp.com/message/T6PFEF2VAFMVP1?autoload=1&app_absent=0" target="_blank" rel="noopener noreferrer">
                        <span class="bg-mobile-menu__icon bg-mobile-menu__icon--whatsapp" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
                        </span>
                        WhatsApp
                    </a>
                </li>
                <li class="menu-item bg-mobile-menu__help-item">
                    <a href="mailto:contact@beyondgaming.in?subject=Query%20-%20Beyond%20Gaming">
                        <span class="bg-mobile-menu__icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </span>
                        Email Us
                    </a>
                </li>
                <li class="menu-item bg-mobile-menu__help-item">
                    <a href="https://instagram.com/beyondgaming.in" target="_blank" rel="noopener noreferrer">
                        <span class="bg-mobile-menu__icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </span>
                        Instagram
                    </a>
                </li>
            </ul>
        </div>
    </aside>
    <?php
}, 50);

/* ─────────────────────────────────────────────────────────────
   2. FLOATING WHATSAPP BUTTON
   Mirrors the floating button from the Next.js site. To turn
   it off (e.g. if you re-enable Woodmart's built-in chat
   widget), set BG_DISABLE_WHATSAPP_FAB to true in wp-config.
   ───────────────────────────────────────────────────────────── */
if (!defined('BG_DISABLE_WHATSAPP_FAB') || !BG_DISABLE_WHATSAPP_FAB) {
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
}

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
 * Resolve a product's category tree into the three labels the
 * product card needs: game, product type, and language.
 *
 * The catalog nests categories two levels deep, e.g.
 *
 *   Pokémon TCG                     <- game
 *     └ Packs / Blisters            <- type
 *   Bandai TCG
 *     └ One Piece TCG               <- game
 *         └ Booster Boxes (OP)      <- type
 *   TCG Products
 *     └ Japanese TCG                <- language
 *
 * so all three are derived from the tree rather than matched
 * against hardcoded names. The full term list is fetched once
 * per request and cached in a static.
 *
 * Returns ['game' => string, 'type' => string, 'language' => string]
 * with empty strings for anything that can't be resolved.
 */
function bg_pcard_labels($product_id) {
    static $all = null;

    // Umbrella categories that group other categories but never
    // describe a product on their own.
    //
    // featured-item belongs here for a second reason: it is
    // top-level, so the game test below would otherwise accept it
    // and a promoted Pokémon card would head its bar with
    // "Featured / Special Sets". The badge on the image already
    // says that, and the bar is the only place the game is named.
    $umbrella = ['tcg-products-all-languages', 'bandai-tcg', 'pre-orders',
                 'sale', 'uncategorized', 'featured-item'];
    $lang_parent_slug = 'tcg-products-all-languages';

    if ($all === null) {
        $terms = get_terms([
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
        ]);
        $all = [];
        if (!is_wp_error($terms)) {
            foreach ($terms as $t) {
                $all[$t->term_id] = $t;
            }
        }
    }

    $lang_parent_id = 0;
    foreach ($all as $t) {
        if ($t->slug === $lang_parent_slug) {
            $lang_parent_id = $t->term_id;
            break;
        }
    }

    $mine = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);
    if (is_wp_error($mine) || empty($mine)) {
        return ['game' => '', 'type' => '', 'language' => ''];
    }

    $game = null;
    $language = null;
    $candidates = [];

    foreach ($mine as $id) {
        if (!isset($all[$id])) continue;
        $term = $all[$id];

        // Language lives under the "TCG Products" umbrella.
        if ($lang_parent_id && $term->parent === $lang_parent_id) {
            $language = $term;
            continue;
        }

        if (in_array($term->slug, $umbrella, true)) continue;

        // A game is either top-level (Pokémon TCG, Other TCG,
        // Supplies & Merch) or sits directly under Bandai TCG
        // (One Piece TCG, DragonBall TCG).
        $parent_slug = ($term->parent && isset($all[$term->parent]))
            ? $all[$term->parent]->slug
            : '';
        if ($term->parent === 0 || $parent_slug === 'bandai-tcg') {
            // Prefer the most specific game: One Piece beats a
            // bare top-level entry if both somehow matched.
            if ($game === null || $parent_slug === 'bandai-tcg') {
                $game = $term;
            }
            continue;
        }

        $candidates[] = $term;
    }

    // Type = whichever remaining category is a child of the game.
    $type = null;
    if ($game) {
        foreach ($candidates as $c) {
            if ($c->parent === $game->term_id) {
                $type = $c;
                break;
            }
        }
    }

    // Fallbacks: a product with no game category (e.g. a bare
    // "Graded Slabs" item) still gets a bar label from whatever
    // real category it does have.
    if (!$game && !empty($candidates)) {
        $game = array_shift($candidates);
    }
    if (!$type && !empty($candidates)) {
        $type = $candidates[0];
    }

    $clean = function ($term, $strip_tcg = false) {
        if (!$term) return '';
        $name = html_entity_decode($term->name, ENT_QUOTES, 'UTF-8');
        // Drop the "(OP)" / "(DB)" disambiguators — the bar above
        // the chip already names the game.
        $name = trim(preg_replace('/\s*\([A-Z]{2,3}\)\s*$/', '', $name));
        if ($strip_tcg) {
            $name = trim(preg_replace('/\s+TCG$/i', '', $name));
        }
        return $name;
    };

    return [
        'game'     => $clean($game),
        'type'     => $clean($type),
        'language' => $clean($language, true),
    ];
}

/**
 * Shortcode: [bg_new_arrivals]
 *
 * Renders the New Arrivals product grid for the homepage.
 * Fetches recent published WooCommerce products and outputs
 * them with the brand product card markup. Excludes products
 * in the "grading" category (matches the Next.js logic).
 *
 * Usage: [bg_new_arrivals limit="8"]
 */
add_shortcode('bg_new_arrivals', function ($atts) {
    $atts = shortcode_atts([
        'limit'        => 8,
        // graded-slabs-singles is excluded by default because those
        // products have their own homepage carousel above New
        // Arrivals; listing them in both would duplicate the row.
        // Keeping it here rather than in the page's shortcode call
        // means the split survives anyone editing that widget.
        'exclude_cats' => 'grading,graded-slabs-singles',
        'include_cats' => '',
        'layout'       => 'grid',
        // Products in this category lead the grid, styled as
        // featured. Set featured_count="0" to switch the promotion
        // off without unpicking the category.
        'featured_cat'   => 'featured-item',
        'featured_count' => 4,
    ], $atts);

    if (!class_exists('WooCommerce')) {
        return '';
    }

    // The card CTAs use WooCommerce's native AJAX add-to-cart.
    // Its script is only enqueued automatically on shop/product
    // pages, so request it explicitly — this shortcode usually
    // runs on the homepage, where it would otherwise be absent
    // and every CTA would fall back to a full page reload.
    if (get_option('woocommerce_enable_ajax_add_to_cart') === 'yes') {
        wp_enqueue_script('wc-add-to-cart');
    }

    $args = [
        'post_type'      => 'product',
        'posts_per_page' => intval($atts['limit']),
        'post_status'    => 'publish',
        'orderby'        => 'date',
        'order'          => 'DESC',
        // Hide out-of-stock products. Uses the WC stock status
        // post meta which is set by WooCommerce on every save.
        'meta_query'     => [
            [
                'key'     => '_stock_status',
                'value'   => 'instock',
                'compare' => '=',
            ],
        ],
    ];

    // product_cat is hierarchical and tax_query defaults to
    // include_children, so both clauses cover subcategories too —
    // excluding a parent excludes everything beneath it.
    $split = function ($csv) {
        return array_filter(array_map('trim', explode(',', (string) $csv)), 'strlen');
    };
    $include = $split($atts['include_cats']);
    $exclude = $split($atts['exclude_cats']);

    // Asking for a category explicitly beats the default exclusions,
    // which name graded-slabs-singles. The two clauses are ANDed, so
    // without this the carousel would ask for exactly the category it
    // was also told to skip and always come back empty.
    $exclude = array_diff($exclude, $include);

    $tax_query = [];

    if ($include) {
        $tax_query[] = [
            'taxonomy' => 'product_cat',
            'field'    => 'slug',
            'terms'    => array_values($include),
            'operator' => 'IN',
        ];
    }

    if ($exclude) {
        $tax_query[] = [
            'taxonomy' => 'product_cat',
            'field'    => 'slug',
            'terms'    => array_values($exclude),
            'operator' => 'NOT IN',
        ];
    }

    // Featured products lead the grid. They are pulled in their own
    // pass rather than sorted to the front, because "newest first"
    // and "featured first" are different orders and a single query
    // can only honour one of them.
    //
    // Skipped when the caller asked for specific categories — that
    // is the carousel, which is already one curated row and has
    // nothing to promote within it.
    $featured_ids   = [];
    $featured_cat   = trim((string) $atts['featured_cat']);
    $featured_count = max(0, intval($atts['featured_count']));

    if ($featured_count > 0 && $featured_cat !== '' && !$include) {
        $featured_args = $args;
        $featured_args['posts_per_page'] = $featured_count;

        $featured_tax = [[
            'taxonomy' => 'product_cat',
            'field'    => 'slug',
            'terms'    => [$featured_cat],
            'operator' => 'IN',
        ]];
        if ($exclude) {
            $featured_tax[] = [
                'taxonomy' => 'product_cat',
                'field'    => 'slug',
                'terms'    => array_values($exclude),
                'operator' => 'NOT IN',
            ];
            $featured_tax['relation'] = 'AND';
        }
        $featured_args['tax_query'] = $featured_tax;

        $featured_ids = get_posts($featured_args + ['fields' => 'ids']);
    }

    // Whatever is left after the featured run fills the rest. The
    // featured category is excluded wholesale, not just the ids
    // already shown, so a promoted product never reappears further
    // down the grid stripped of its styling.
    $args['posts_per_page'] = max(0, intval($atts['limit']) - count($featured_ids));

    if ($featured_ids) {
        $tax_query[] = [
            'taxonomy' => 'product_cat',
            'field'    => 'slug',
            'terms'    => [$featured_cat],
            'operator' => 'NOT IN',
        ];
    }

    if ($tax_query) {
        if (count($tax_query) > 1) {
            $tax_query['relation'] = 'AND';
        }
        $args['tax_query'] = $tax_query;
    }

    $rest_ids = $args['posts_per_page'] > 0 ? get_posts($args + ['fields' => 'ids']) : [];
    $ordered  = array_merge($featured_ids, $rest_ids);

    if (!$ordered) {
        return '';
    }

    $featured_lookup = array_flip($featured_ids);

    $is_carousel = ($atts['layout'] === 'carousel');

    ob_start();

    if ($is_carousel) {
        // The track scrolls natively — swipe on touch, arrows on
        // desktop (wired up in bg-custom.js). The arrows are marked
        // hidden until that script confirms the track overflows, so
        // a short row doesn't show dead controls.
        ?>
        <div class="bg-carousel" data-bg-carousel>
            <button type="button" class="bg-carousel__nav bg-carousel__nav--prev" aria-label="Previous products" hidden>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div class="bg-carousel__track">
        <?php
    } else {
        ?>
        <div class="bg-new-arrivals-grid">
        <?php
    }

    foreach ($ordered as $pid) {
        $card_product = wc_get_product($pid);
        if (!$card_product) continue;
        bg_render_pcard(
            $card_product,
            '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
            isset($featured_lookup[$pid])
        );
    }

    if ($is_carousel) {
        ?>
            </div>
            <button type="button" class="bg-carousel__nav bg-carousel__nav--next" aria-label="Next products" hidden>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
            <?php // Dots are built by bg-custom.js, which is the only
                  // thing that knows how many cards fit per page. ?>
            <div class="bg-carousel__dots" role="tablist" aria-label="Carousel pages"></div>
        </div>
        <?php
    } else {
        ?>
        </div>
        <?php
    }

    return ob_get_clean();
});

/**
 * Renders one .bg-pcard.
 *
 * Single source of truth for the card, shared by [bg_new_arrivals],
 * [bg_recently_viewed] and the WooCommerce loop template at
 * woocommerce/content-product.php. Echoes rather than returns, so
 * callers buffer it themselves.
 *
 * @param WC_Product $product
 * @param string     $sizes   Value for the image sizes attribute.
 *                            Defaults to the 2/3/4-up grid that all
 *                            three callers lay out.
 */
function bg_render_pcard($product, $sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw', $featured = false) {
    if (!$product instanceof WC_Product) {
        return;
    }

    // Global low-stock threshold (WC setting), used as fallback when
    // a product carries no _low_stock_amount of its own. Read once —
    // this runs for every card on the page.
    static $global_low_threshold = null;
    if ($global_low_threshold === null) {
        $global_low_threshold = (int) get_option('woocommerce_notify_low_stock_amount', 2);
    }

    $pid       = $product->get_id();
    $permalink = get_permalink($pid);
    $title     = get_the_title($pid);
    // The blurred backdrop is only ever seen out of focus, so
    // the 300px 'medium' file is plenty and keeps it cheap.
    $image     = get_the_post_thumbnail_url($pid, 'medium');
    if (!$image) {
        $image = wc_placeholder_img_src('medium');
    }
    // The foreground image is a different problem: the well is
    // ~250-330 CSS px, which is 500-660 real pixels on a retina
    // screen, so a 300px file renders visibly soft. Hand it to
    // wp_get_attachment_image() off the full size instead — it
    // builds a srcset from every registered size that shares the
    // original's aspect ratio (so no hard-cropped variants sneak
    // in) and the sizes hint below, which mirrors the grid, lets
    // the browser pick the smallest file that still looks sharp.
    $thumb_id  = get_post_thumbnail_id($pid);

    // A cut-out product shot on a transparent background lets the
    // blurred backdrop bleed through the subject, which reads as
    // grubby rather than atmospheric. Those images want flat white
    // instead. Deciding it properly means decoding the file to look
    // for a populated alpha channel, which is far too expensive per
    // card, so go by format: JPEG cannot carry alpha, everything
    // else might. Opaque PNGs get white too, but they are almost
    // always packshots already sitting on white, so that is the
    // right answer for them anyway.
    $flat_bg = !in_array(get_post_mime_type($thumb_id), ['image/jpeg', 'image/jpg'], true);

    $labels = bg_pcard_labels($pid);

    // Meta line pairs the game with the print language —
    // the catalog carries no condition attribute, and for
    // sealed product the language is the useful signal.
    $meta_bits = array_filter([$labels['game'], $labels['language']]);
    $meta_line = implode(' · ', $meta_bits);

    // Build price HTML manually with wc_price() — bypasses
    // the woocommerce_get_price_html filter that Woodmart
    // hooks to append stock status, which would otherwise
    // duplicate the stock indicator I render below.
    $regular = $product->get_regular_price();
    $sale    = $product->get_sale_price();
    if ($sale !== '' && $sale < $regular) {
        $price_html = '<del>' . wc_price($regular) . '</del> <ins>' . wc_price($sale) . '</ins>';
    } else {
        $price_html = wc_price($product->get_price());
    }

    // Stock label. [bg_new_arrivals] filters to in-stock products,
    // but the shop archives and the related-products grid do not, so
    // the sold-out and backorder states have to be handled here too.
    if (!$product->is_in_stock()) {
        $stock_label = 'Sold Out';
        $stock_class = 'bg-pcard__stock--out';
    } elseif ($product->is_on_backorder()) {
        $stock_label = 'Backorder';
        $stock_class = 'bg-pcard__stock--low';
    } else {
        $stock_label = 'In Stock';
        $stock_class = 'bg-pcard__stock--in';
        if ($product->managing_stock()) {
            $qty = (int) $product->get_stock_quantity();
            $product_low = (int) $product->get_low_stock_amount();
            $threshold = $product_low > 0 ? $product_low : $global_low_threshold;
            if ($qty > 0 && $qty <= $threshold) {
                $stock_label = 'Low Stock';
                $stock_class = 'bg-pcard__stock--low';
            }
        }
    }

    // Simple in-stock products get WooCommerce's native AJAX
    // add-to-cart; anything variable or unpurchasable falls
    // back to a link through to the product page.
    $ajax_cart = $product->is_type('simple')
        && $product->is_purchasable()
        && $product->is_in_stock();
    ?>
    <article class="bg-pcard<?php echo $product->is_in_stock() ? '' : ' bg-pcard--out'; ?><?php echo $featured ? ' bg-pcard--featured' : ''; ?>">
        <?php if ($labels['game']): ?>
            <div class="bg-pcard__bar">
                <span class="bg-pcard__game"><?php echo esc_html($labels['game']); ?></span>
                <?php if ($labels['type']): ?>
                    <span class="bg-pcard__type">/ <?php echo esc_html($labels['type']); ?></span>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <div class="bg-pcard__media<?php echo $flat_bg ? ' bg-pcard__media--flat' : ''; ?>">
            <?php if (!$flat_bg): ?>
                <span class="bg-pcard__backdrop"
                      style="background-image:url('<?php echo esc_url($image); ?>')"
                      aria-hidden="true"></span>
            <?php endif; ?>
            <?php if ($thumb_id): ?>
                <?php echo wp_get_attachment_image($thumb_id, 'full', false, [
                    'class'   => 'bg-pcard__img',
                    'alt'     => $title,
                    'loading' => 'lazy',
                    'sizes'   => $sizes,
                ]); ?>
            <?php else: ?>
                <img class="bg-pcard__img" src="<?php echo esc_url($image); ?>"
                     alt="<?php echo esc_attr($title); ?>" loading="lazy" />
            <?php endif; ?>
            <?php if ($featured): ?>
                <span class="bg-pcard__badge">
                    <svg class="bg-pcard__badge-star" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26 6.6.72-4.9 4.62 1.32 6.4L12 16.9l-5.92 3.1 1.32-6.4L2.5 8.98l6.6-.72L12 2z"/></svg>
                    Featured
                </span>
            <?php endif; ?>
            <span class="bg-pcard__stock <?php echo esc_attr($stock_class); ?>">
                <span class="bg-pcard__stock-dot"></span>
                <?php echo esc_html($stock_label); ?>
            </span>
        </div>

        <div class="bg-pcard__body">
            <h3 class="bg-pcard__title">
                <a class="bg-pcard__link" href="<?php echo esc_url($permalink); ?>">
                    <?php echo esc_html($title); ?>
                </a>
            </h3>
            <?php if ($meta_line): ?>
                <p class="bg-pcard__meta"><?php echo esc_html($meta_line); ?></p>
            <?php endif; ?>

            <div class="bg-pcard__foot">
                <span class="bg-pcard__price"><?php echo wp_kses_post($price_html); ?></span>
                <?php if ($ajax_cart): ?>
                    <a href="<?php echo esc_url($product->add_to_cart_url()); ?>"
                       class="bg-pcard__cta add_to_cart_button ajax_add_to_cart"
                       data-product_id="<?php echo esc_attr($pid); ?>"
                       data-quantity="1"
                       data-product_sku="<?php echo esc_attr($product->get_sku()); ?>"
                       rel="nofollow"
                       aria-label="<?php echo esc_attr('Add ' . $title . ' to cart'); ?>">
                        <?php echo esc_html__('Add', 'beyondgaming'); ?>
                    </a>
                <?php else: ?>
                    <a href="<?php echo esc_url($permalink); ?>" class="bg-pcard__cta">
                        <?php echo esc_html__('View', 'beyondgaming'); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </article>
    <?php
}

/**
 * Shortcode: [bg_product_description]
 *
 * Renders the current product's WooCommerce long description
 * inside a brand-styled .bg-info-card. Auto-pulls from
 * $product->get_description() — no manual content needed.
 *
 * Drop into Elementor's Shortcode widget on the product page
 * template.
 *
 * Usage:
 *   [bg_product_description]
 *   [bg_product_description title="About the Product"]
 *   [bg_product_description title="Product Story" empty_text=""]
 *
 * Attributes:
 *   title       — header text (default: "About the Product")
 *   empty_text  — what to show if the description is empty
 *                 (default: nothing — the whole card is hidden)
 */
add_shortcode('bg_product_description', function ($atts) {
    $atts = shortcode_atts([
        'title'      => 'About the Product',
        'empty_text' => '',
    ], $atts);

    if (!function_exists('wc_get_product')) {
        return '';
    }

    // Get the current product. Works inside the loop on a
    // single product page; falls back to the queried object
    // if the loop hasn't started yet.
    global $product;
    if (!$product instanceof WC_Product) {
        $obj = get_queried_object();
        if ($obj instanceof WP_Post && $obj->post_type === 'product') {
            $product = wc_get_product($obj->ID);
        }
    }
    if (!$product instanceof WC_Product) {
        return '';
    }

    // Pull the long description (Woo's main description field).
    // Run it through the_content filter so shortcodes and
    // oEmbeds inside the description still expand.
    $description = $product->get_description();
    if (empty($description)) {
        if (empty($atts['empty_text'])) {
            return '';
        }
        $description = '<p>' . esc_html($atts['empty_text']) . '</p>';
    } else {
        $description = apply_filters('the_content', $description);
    }

    ob_start();
    ?>
    <div class="bg-info-card">
        <h2 class="bg-info-card__title"><?php echo esc_html($atts['title']); ?></h2>
        <div class="bg-info-card__body">
            <?php echo $description; // already filtered ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
});

/**
 * Shared layout helper for legal pages (Terms, Privacy,
 * Shipping, Refund). Direct port of the <Section> component
 * used by every legal page in the Beyond Gaming Next.js
 * project at /Users/adityaiyer/beyondgaming/src/app/.
 *
 * Renders a brand-styled card-list of policy sections with
 * a centered eyebrow + title header at the top.
 *
 * Used by [bg_terms_conditions], [bg_privacy_policy],
 * [bg_shipping_policy], [bg_refund_policy].
 *
 * $args = [
 *   'title'    => 'Terms & Conditions',
 *   'eyebrow'  => 'Legal',
 *   'updated'  => '01 / 01 / 2026',  // optional
 *   'intro'    => '<p>...</p>',       // optional purple callout
 *   'sections' => [
 *     ['title' => '1) Business Details', 'body' => '<p>...</p>'],
 *     ...
 *   ],
 * ]
 */
function bg_render_legal_page($args) {
    $args = wp_parse_args($args, [
        'title'    => '',
        'eyebrow'  => 'Legal',
        'updated'  => '',
        'intro'    => '',
        'sections' => [],
    ]);

    ob_start();
    ?>
    <div class="bg-legal-page">
        <div class="bg-legal-page__header">
            <?php if (!empty($args['eyebrow'])): ?>
                <p class="bg-legal-page__eyebrow"><?php echo esc_html($args['eyebrow']); ?></p>
            <?php endif; ?>
            <h1 class="bg-legal-page__title"><?php echo esc_html($args['title']); ?></h1>
            <?php if (!empty($args['updated'])): ?>
                <p class="bg-legal-page__updated">Last Updated: <?php echo esc_html($args['updated']); ?></p>
            <?php endif; ?>
        </div>

        <?php if (!empty($args['intro'])): ?>
            <div class="bg-legal-page__intro">
                <?php echo $args['intro']; // trusted markup ?>
            </div>
        <?php endif; ?>

        <div class="bg-legal-page__sections">
            <?php foreach ($args['sections'] as $section): ?>
                <div class="bg-legal-page__section">
                    <h2 class="bg-legal-page__section-title"><?php echo esc_html($section['title']); ?></h2>
                    <div class="bg-legal-page__section-body">
                        <?php echo $section['body']; // trusted markup ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Shortcode: [bg_terms_conditions]
 *
 * Renders the Terms & Conditions page content (verbatim port
 * of /Users/adityaiyer/beyondgaming/src/app/terms-conditions/
 * page.tsx) inside the brand-styled .bg-legal-page wrapper.
 */
add_shortcode('bg_terms_conditions', function () {
    return bg_render_legal_page([
        'title'   => 'Terms & Conditions',
        'eyebrow' => 'Legal',
        'updated' => '01 / 01 / 2026',
        'sections' => [
            [
                'title' => '1) Business Details',
                'body'  => '<p><strong>Legal Entity:</strong> Beyond Ventures LLP</p>'
                    . '<p><strong>Address:</strong> 2004 Skywalk Tower, 20th Floor, Tank Lane, Orlem, Near Surana Hospital, Malad West, Mumbai &#8211; 400067</p>'
                    . '<p><strong>Email:</strong> contact@beyondgaming.in</p>'
                    . '<p><strong>Phone/WhatsApp:</strong> +91 9372443237</p>',
            ],
            [
                'title' => '2) Policies',
                'body'  => '<p>Usage governed by:</p>'
                    . '<ul><li>Privacy Policy</li><li>Shipping Policy</li><li>Return &amp; Refund Policy</li></ul>'
                    . '<p>If there is any conflict between these Terms and a Policy, the relevant Policy will prevail for that subject.</p>',
            ],
            [
                'title' => '3) Eligibility &amp; User Responsibilities',
                'body'  => '<ul>'
                    . '<li>Users must be 18+ or supervised by a parent/legal guardian</li>'
                    . '<li>Must provide accurate information for orders</li>'
                    . '<li>Prohibited: malware introduction, unauthorized access, scraping, service disruption</li>'
                    . '</ul>',
            ],
            [
                'title' => '4) Product Nature (TCG &amp; Collectibles)',
                'body'  => '<p>We sell trading cards, sealed packs/boxes, singles, graded cards, accessories, and supplies.</p>'
                    . '<p>Packs/boxes contain randomized contents. We do not guarantee pull rates, chase cards, rarity outcomes, specific contents, grading outcomes, or monetary value.</p>',
            ],
            [
                'title' => '5) Product Listings, Images &amp; Condition Notes',
                'body'  => '<ul>'
                    . '<li>Images are representative; packaging/artwork varies by manufacturer</li>'
                    . '<li>Raw singles condition assessments are subjective</li>'
                    . '<li>Graded slabs follow grading company standards</li>'
                    . '</ul>',
            ],
            [
                'title' => '6) Pricing, Taxes &amp; Availability',
                'body'  => '<ul>'
                    . '<li>Prices displayed in INR</li>'
                    . '<li>GST applies as shown at checkout</li>'
                    . '<li>Stock availability not guaranteed until order processed</li>'
                    . '<li>Pricing errors may result in order cancellation and refund</li>'
                    . '</ul>',
            ],
            [
                'title' => '7) Orders, Acceptance &amp; Cancellations',
                'body'  => '<ul>'
                    . '<li>Order placement is an offer to purchase; acceptance occurs at processing/dispatch</li>'
                    . '<li>Company may refuse orders due to stock, pricing errors, address issues, payment verification, fraud suspicion</li>'
                    . '<li>Cancellation terms governed by Return &amp; Refund Policy</li>'
                    . '</ul>',
            ],
            [
                'title' => '8) Pre-Orders',
                'body'  => '<ul>'
                    . '<li>Release dates and delivery timelines are estimates</li>'
                    . '<li>May change due to supplier/manufacturer logistics</li>'
                    . '<li>Limited allocation; unfulfillable orders handled per Return &amp; Refund Policy</li>'
                    . '<li>Cancellation terms per Return &amp; Refund Policy and product disclosures</li>'
                    . '</ul>',
            ],
            [
                'title' => '9) Payments',
                'body'  => '<ul>'
                    . '<li>Processed via secure third-party gateways</li>'
                    . '<li>Company not responsible for bank failures, gateway downtime, or technical issues beyond control</li>'
                    . '<li>May request additional verification for high-value/suspicious transactions</li>'
                    . '</ul>',
            ],
            [
                'title' => '10) Shipping &amp; Delivery',
                'body'  => '<p>All shipping methods, timelines, delivery exceptions, address responsibilities, failed delivery handling, and damage/tampering claims governed by Shipping Policy and Return &amp; Refund Policy.</p>',
            ],
            [
                'title' => '11) Returns, Replacements &amp; Refunds',
                'body'  => '<p>All return/refund eligibility, exclusions (opened/tampered sealed products, randomized items, singles, slabs, mystery items), conditions, proof requirements, and processing timelines governed by Return &amp; Refund Policy.</p>',
            ],
            [
                'title' => '12) Mystery Boxes / Bundles',
                'body'  => '<p>Mystery products are curated/randomized by nature. Any rules for value guarantees, exclusions, and refundability governed by Return &amp; Refund Policy and product disclosures.</p>',
            ],
            [
                'title' => '13) Rip &amp; Ship / Live Breaks',
                'body'  => '<p>Specific rules for finality after opening, shipping confirmation, claim windows, and proof requirements detailed on product pages and governed by applicable policies.</p>',
            ],
            [
                'title' => '14) Promotions &amp; Discounts',
                'body'  => '<ul>'
                    . '<li>Promotions have separate terms, may be modified/withdrawn</li>'
                    . '<li>Discount codes non-redeemable for cash</li>'
                    . '<li>Gift cards/store credit subject to specific terms at issuance</li>'
                    . '</ul>',
            ],
            [
                'title' => '15) Intellectual Property',
                'body'  => '<p>All Website content, branding, logos, designs, and materials owned or licensed by us are protected. You may not copy, reuse, reproduce, distribute, or exploit without written permission.</p>'
                    . '<p>Third-party trademarks used for identification/resale purposes only.</p>',
            ],
            [
                'title' => '16) Prohibited Use',
                'body'  => '<p>Users must not:</p>'
                    . '<ul>'
                    . '<li>Attempt unauthorized system/server/database access</li>'
                    . '<li>Introduce malware, run bots/scrapers, disrupt Website</li>'
                    . '<li>Impersonate others, submit false information, engage in fraud</li>'
                    . '<li>Violate applicable law or third-party rights</li>'
                    . '</ul>',
            ],
            [
                'title' => '17) Disclaimer',
                'body'  => '<p>The Website is provided on an &ldquo;as is&rdquo; basis. We do not guarantee uninterrupted availability or error-free listings.</p>'
                    . '<p>Manufacturer variations not always grounds for return unless Policy-covered.</p>',
            ],
            [
                'title' => '18) Limitation of Liability',
                'body'  => '<p>We are not liable for indirect or consequential damages. Our total liability for any claim related to an order is limited to the amount paid for that specific order.</p>',
            ],
            [
                'title' => '19) Indemnity',
                'body'  => '<p>Users indemnify Beyond Ventures LLP from claims, damages, and expenses arising from Terms breach, Website misuse, or law/rights violations.</p>',
            ],
            [
                'title' => '20) Force Majeure',
                'body'  => '<p>Company not responsible for delays/failures from uncontrollable events: courier disruptions, natural events, strikes, governmental actions, outages.</p>',
            ],
            [
                'title' => '21) Changes to these Terms',
                'body'  => '<p>Terms may be updated anytime with revised &ldquo;Last Updated&rdquo; date. Continued use indicates acceptance.</p>',
            ],
            [
                'title' => '22) Governing Law &amp; Jurisdiction',
                'body'  => '<p>Governed by Indian law. Mumbai, Maharashtra courts have jurisdiction subject to applicable consumer protection laws.</p>',
            ],
            [
                'title' => '23) Grievances &amp; Complaints',
                'body'  => '<p><strong>Grievance Officer:</strong> Erik Nanda</p>'
                    . '<p><strong>Email:</strong> contact@beyondgaming.in</p>'
                    . '<p><strong>Phone:</strong> +91 93724 43237</p>'
                    . '<p><strong>Address:</strong> 2004 Skywalk Tower, 20th Floor, Tank Lane, Orlem, Near Surana Hospital, Malad West, Mumbai &#8211; 400067</p>',
            ],
        ],
    ]);
});

/**
 * Shortcode: [bg_privacy_policy]
 *
 * Verbatim port of /Users/adityaiyer/beyondgaming/src/app/
 * privacy-policy/page.tsx.
 */
add_shortcode('bg_privacy_policy', function () {
    return bg_render_legal_page([
        'title'   => 'Privacy Policy',
        'eyebrow' => 'Legal',
        'sections' => [
            [
                'title' => 'Overview',
                'body'  => '<p>This privacy policy outlines how Beyond Gaming utilizes and safeguards any information provided by users when accessing its website.</p>'
                    . '<p>Beyond Gaming is dedicated to safeguarding your privacy. Any information requested on this website will be used solely in accordance with this privacy statement.</p>'
                    . '<p>Beyond Gaming may revise this policy periodically by updating this page. Users are encouraged to check this page regularly to stay informed about any changes.</p>',
            ],
            [
                'title' => 'Information Collected',
                'body'  => '<p>We gather the following types of data:</p>'
                    . '<ul>'
                    . '<li>Name and job title</li>'
                    . '<li>Contact information such as email address</li>'
                    . '<li>Demographic details like postcode, preferences, and interests</li>'
                    . '<li>Other information pertinent to customer surveys or offers</li>'
                    . '</ul>',
            ],
            [
                'title' => 'Information Usage',
                'body'  => '<p>The gathered information is utilized for:</p>'
                    . '<ul>'
                    . '<li>Internal record keeping</li>'
                    . '<li>Enhancing products and services</li>'
                    . '<li>Periodically sending promotional emails regarding new products, special offers, or other relevant information to the provided email address</li>'
                    . '<li>Conducting market research via email, phone, fax, or mail to customize website content based on user interests</li>'
                    . '</ul>',
            ],
            [
                'title' => 'Security',
                'body'  => '<p>Beyond Gaming ensures the security of user information through appropriate measures to prevent unauthorized access or disclosure.</p>',
            ],
            [
                'title' => 'Cookie Usage',
                'body'  => '<p>A cookie is a small file stored on the user&apos;s computer hard drive upon permission. Cookies help analyze web traffic and notify users about site visits. They enable web applications to customize operations based on user preferences.</p>'
                    . '<p>The site employs traffic log cookies to identify frequently visited pages, enhancing website content. This information is used for statistical analysis before being removed from the system.</p>'
                    . '<p>Cookies do not provide access to your computer or personal information beyond the data you choose to share. You can choose to accept or decline cookies through your browser settings.</p>',
            ],
            [
                'title' => 'Links to Other Websites',
                'body'  => '<p>Our website may contain links to other websites of interest. However, once you use these links to leave our site, we do not have any control over those external websites. We cannot be responsible for the protection and privacy of any information you provide while visiting such sites, and they are not governed by this privacy statement.</p>',
            ],
            [
                'title' => 'Controlling Your Personal Information',
                'body'  => '<p>You may choose to restrict the collection or use of your personal information:</p>'
                    . '<ul>'
                    . '<li>If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by emailing us at <a href="mailto:contact@beyondgaming.in">contact@beyondgaming.in</a></li>'
                    . '<li>We will not sell, distribute, or lease your personal information to third parties unless required by law</li>'
                    . '</ul>',
            ],
        ],
    ]);
});

/**
 * Shortcode: [bg_shipping_policy]
 *
 * Verbatim port of /Users/adityaiyer/beyondgaming/src/app/
 * shipping-delivery-policy/page.tsx.
 */
add_shortcode('bg_shipping_policy', function () {
    return bg_render_legal_page([
        'title'   => 'Shipping &amp; Delivery Policy',
        'eyebrow' => 'Legal',
        'sections' => [
            [
                'title' => '1. Shipping Details',
                'body'  => '<p>We carefully package all items using bubble mailers and high-quality cardboard boxes to ensure safe delivery. As collectors ourselves who order online frequently, we understand the importance of secure packaging.</p>',
            ],
            [
                'title' => '2. Order Processing Time',
                'body'  => '<p>Orders are dispatched within two working days (Monday to Friday). You will receive email and SMS notifications with tracking numbers.</p>'
                    . '<p>If you don&apos;t receive tracking information within two days, please contact us via Instagram or at <a href="mailto:contact@beyondgaming.in">contact@beyondgaming.in</a>.</p>',
            ],
            [
                'title' => '3. Estimated Delivery Time',
                'body'  => '<p>Private courier services through Ship Rocket typically deliver within 3&#8211;5 days. If issues occur, packages may be sent via Delhivery, Maruti Couriers, DTDC, or Professional Couriers instead.</p>'
                    . '<div class="bg-legal-page__alert">'
                    . '<p><strong>Important:</strong> Cash on delivery (COD) is not available &mdash; all orders require prepayment through the payment gateway.</p>'
                    . '</div>',
            ],
            [
                'title' => '4. Refund &amp; Cancellation Policy',
                'body'  => '<p>Trading card sales are final due to price volatility. Detailed product images are provided before purchase. Exceptions exist for same-day requests with sealed, original condition items.</p>'
                    . '<p>A 10% restocking fee applies to non-error returns. Refunds process within 2 days if approved.</p>',
            ],
            [
                'title' => '5. Shipping Refund',
                'body'  => '<p>Multiple orders from one customer may qualify for excess shipping refunds. A flat &#8377;40 packaging fee is deducted if items are already packed before processing returns.</p>',
            ],
            [
                'title' => '6. International Pre-Orders',
                'body'  => '<p>Fixed pricing applies per agreement between Beyond Gaming and the customer. Customers bear all freight and customs charges with proof provided.</p>'
                    . '<p>Beyond Gaming is not responsible for packages opened during customs inspections.</p>',
            ],
            [
                'title' => '7. Domestic Pre-Orders',
                'body'  => '<p>Fixed pricing applies per agreement for locally sourced products.</p>',
            ],
        ],
    ]);
});

/**
 * Shortcode: [bg_refund_policy]
 *
 * Verbatim port of /Users/adityaiyer/beyondgaming/src/app/
 * cancellation-refund-policy/page.tsx. Includes the purple
 * intro callout above the section list.
 */
add_shortcode('bg_refund_policy', function () {
    return bg_render_legal_page([
        'title'   => 'Cancellation &amp; Refund Policy',
        'eyebrow' => 'Legal',
        'intro'   => '<p>Beyond Gaming believes in helping its customers as far as possible, and has therefore a liberal cancellation policy.</p>',
        'sections' => [
            [
                'title' => '1. Cancellation Timing',
                'body'  => '<p>Orders can only be cancelled immediately after placement. However, cancellation requests cannot be honored once vendors have begun shipping the items.</p>',
            ],
            [
                'title' => '2. Perishable Items',
                'body'  => '<p>We do not accept cancellations for perishable goods like flowers or food, but will offer refunds or replacements if quality issues are documented.</p>',
            ],
            [
                'title' => '3. Damaged Items',
                'body'  => '<p>Customers must report defective or damaged products to customer service within 2 days of receipt. The merchant verifies the claim before processing.</p>',
            ],
            [
                'title' => '4. Quality Concerns',
                'body'  => '<p>If products don&apos;t match website descriptions or customer expectations, notification must occur within 2 days of delivery for appropriate resolution.</p>',
            ],
            [
                'title' => '5. Warranty Claims',
                'body'  => '<p>Products with manufacturer warranties should be directed to the manufacturer for warranty-related issues.</p>',
            ],
            [
                'title' => '6. Refund Processing',
                'body'  => '<p>Approved refunds take 6&#8211;8 days to process.</p>',
            ],
            [
                'title' => '7. Undelivered Packages',
                'body'  => '<p>When packages are returned undelivered, both original and return shipping charges are deducted before refunding the balance.</p>',
            ],
            [
                'title' => '8. Cancellation Fees',
                'body'  => '<p>Approved cancellations or non-deliveries incur a 10% restocking fee deduction from the refund amount.</p>',
            ],
        ],
    ]);
});

/**
 * AJAX handler for [bg_contact_us] form submissions.
 *
 * Receives POSTed contact form data, validates it, and sends
 * the message via wp_mail() so the email leaves the WordPress
 * server directly (no client-side mailto: required).
 *
 * The site admin should ideally configure an SMTP plugin
 * (e.g., WP Mail SMTP) for reliable delivery — Hostinger's
 * default mail() can land in spam.
 *
 * Endpoint: POST /wp-admin/admin-ajax.php?action=bg_contact_submit
 * Returns:  application/json { success: bool, message: string }
 */
function bg_handle_contact_submit() {
    // ── Nonce check ──
    if (
        !isset($_POST['_bg_contact_nonce']) ||
        !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_bg_contact_nonce'])), 'bg_contact_submit')
    ) {
        wp_send_json(['success' => false, 'message' => 'Security check failed. Please refresh the page and try again.'], 403);
    }

    // ── Honeypot (bots fill this; humans don't see it) ──
    if (!empty($_POST['website_url'])) {
        // Pretend it succeeded so bots don't retry
        wp_send_json(['success' => true, 'message' => 'Thanks!']);
    }

    // ── Sanitize inputs ──
    $name    = isset($_POST['name'])    ? sanitize_text_field(wp_unslash($_POST['name']))    : '';
    $email   = isset($_POST['email'])   ? sanitize_email(wp_unslash($_POST['email']))        : '';
    $phone   = isset($_POST['phone'])   ? sanitize_text_field(wp_unslash($_POST['phone']))   : '';
    $message = isset($_POST['message']) ? sanitize_textarea_field(wp_unslash($_POST['message'])) : '';
    $send_to = isset($_POST['send_to']) ? sanitize_email(wp_unslash($_POST['send_to']))      : '';

    // ── Required field check ──
    if (empty($name) || empty($email) || empty($phone) || empty($message)) {
        wp_send_json(['success' => false, 'message' => 'Please fill in all fields.'], 400);
    }
    if (!is_email($email)) {
        wp_send_json(['success' => false, 'message' => 'Please enter a valid email address.'], 400);
    }

    // Fall back to admin email if no send_to (or invalid one)
    if (empty($send_to) || !is_email($send_to)) {
        $send_to = get_option('admin_email');
    }

    // ── Rate limit (1 submission per IP per 30 seconds) ──
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $key = 'bg_contact_rate_' . md5($ip);
    if (get_transient($key)) {
        wp_send_json(['success' => false, 'message' => 'Please wait a few seconds before submitting again.'], 429);
    }
    set_transient($key, 1, 30);

    // ── Build the email ──
    $site_name = wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES);
    $subject   = sprintf('[%s] New contact form submission from %s', $site_name, $name);

    $body  = "You have a new contact form submission from " . $site_name . ":\n\n";
    $body .= "Name:    " . $name . "\n";
    $body .= "Email:   " . $email . "\n";
    $body .= "Phone:   " . $phone . "\n\n";
    $body .= "Message:\n" . $message . "\n\n";
    $body .= "—\n";
    $body .= "Sent from: " . home_url('/') . "\n";
    $body .= "Submitted: " . current_time('mysql') . "\n";

    // Set Reply-To to the visitor's address so the admin can
    // hit Reply and respond directly. From: stays as the site
    // admin so it passes SPF/DKIM (assuming SMTP is configured).
    $headers = [
        'Content-Type: text/plain; charset=UTF-8',
        'Reply-To: ' . $name . ' <' . $email . '>',
    ];

    // ── Send ──
    $sent = wp_mail($send_to, $subject, $body, $headers);

    if (!$sent) {
        wp_send_json([
            'success' => false,
            'message' => 'Sorry, we couldn\'t send your message. Please email us directly at ' . $send_to . '.',
        ], 500);
    }

    wp_send_json([
        'success' => true,
        'message' => 'Thanks! Your message has been sent. We\'ll get back to you soon.',
    ]);
}
add_action('wp_ajax_bg_contact_submit', 'bg_handle_contact_submit');
add_action('wp_ajax_nopriv_bg_contact_submit', 'bg_handle_contact_submit');

/**
 * Shortcode: [bg_contact_us]
 *
 * Direct port of the Beyond Gaming Next.js website's contact
 * page (/Users/adityaiyer/beyondgaming/src/app/contact/page.tsx).
 *
 * Two-column layout: contact info cards (left) + contact form
 * (right). On mobile, stacks to one column. The form submits
 * via AJAX to admin-ajax.php → wp_mail() so the email leaves
 * the WordPress server directly (no client-side mailto opener).
 *
 * Drop into any WordPress page or Elementor Shortcode widget.
 *
 * Usage:
 *   [bg_contact_us]
 *   [bg_contact_us title="Get in Touch" subtitle="We'd love to hear from you."]
 *   [bg_contact_us email="hello@example.com" phone="+91 9000000000"]
 *
 * Attributes (all optional, defaults match Beyond Gaming):
 *   title       — page title
 *   subtitle    — supporting text under the title
 *   email       — contact email
 *   phone       — contact phone
 *   instagram   — instagram handle (without the @)
 *   website     — website URL (display text)
 *   address     — multi-line address; use \n for line breaks
 *   org         — legal entity name shown above the address
 *   send_to     — where the mailto form sends to (defaults to
 *                 the `email` attribute)
 */
add_shortcode('bg_contact_us', function ($atts) {
    $atts = shortcode_atts([
        'title'     => 'Contact Us',
        'subtitle'  => 'Have a question? We\'d love to hear from you.',
        'email'     => 'contact@beyondgaming.in',
        'phone'     => '+91 9372443237',
        'instagram' => 'beyondgaming.in',
        'website'   => 'beyondgaming.in',
        'org'       => 'Beyond Ventures LLP (Beyond Gaming)',
        'address'   => "2004 Skywalk Tower, 20th Floor,\nTank Lane, Orlem,\nNear Surana Hospital,\nMalad West,\nMumbai – 400067",
        'send_to'   => '',
    ], $atts);

    if (empty($atts['send_to'])) {
        $atts['send_to'] = $atts['email'];
    }

    // Build phone tel: link from raw input (strip non-digits + keep +)
    $phone_tel = preg_replace('/[^0-9+]/', '', $atts['phone']);

    // Format the address as escaped HTML lines
    $address_lines = array_map('trim', preg_split('/\\n|\r/', $atts['address']));
    $address_lines = array_filter($address_lines, function ($l) { return $l !== ''; });

    ob_start();
    ?>
    <section class="bg-contact-us">
        <div class="bg-contact-us__header">
            <h1 class="bg-contact-us__title"><?php echo esc_html($atts['title']); ?></h1>
            <p class="bg-contact-us__subtitle"><?php echo esc_html($atts['subtitle']); ?></p>
        </div>

        <div class="bg-contact-us__grid">
            <!-- LEFT: contact info -->
            <div class="bg-contact-us__info-col">
                <div class="bg-contact-us__info-card">
                    <h3 class="bg-contact-us__info-heading">Get in Touch</h3>
                    <ul class="bg-contact-us__info-list">
                        <?php if (!empty($atts['email'])): ?>
                        <li class="bg-contact-us__info-item">
                            <span class="bg-contact-us__info-icon" aria-hidden="true">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </span>
                            <div class="bg-contact-us__info-body">
                                <p class="bg-contact-us__info-label">Email</p>
                                <a href="mailto:<?php echo esc_attr($atts['email']); ?>" class="bg-contact-us__info-link">
                                    <?php echo esc_html($atts['email']); ?>
                                </a>
                            </div>
                        </li>
                        <?php endif; ?>

                        <?php if (!empty($atts['instagram'])): ?>
                        <li class="bg-contact-us__info-item">
                            <span class="bg-contact-us__info-icon" aria-hidden="true">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </span>
                            <div class="bg-contact-us__info-body">
                                <p class="bg-contact-us__info-label">Instagram</p>
                                <a href="https://instagram.com/<?php echo esc_attr($atts['instagram']); ?>" target="_blank" rel="noopener noreferrer" class="bg-contact-us__info-link">
                                    @<?php echo esc_html($atts['instagram']); ?>
                                </a>
                            </div>
                        </li>
                        <?php endif; ?>

                        <?php if (!empty($atts['website'])): ?>
                        <li class="bg-contact-us__info-item">
                            <span class="bg-contact-us__info-icon" aria-hidden="true">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                            </span>
                            <div class="bg-contact-us__info-body">
                                <p class="bg-contact-us__info-label">Website</p>
                                <a href="https://<?php echo esc_attr($atts['website']); ?>" target="_blank" rel="noopener noreferrer" class="bg-contact-us__info-link">
                                    <?php echo esc_html($atts['website']); ?>
                                </a>
                            </div>
                        </li>
                        <?php endif; ?>

                        <?php if (!empty($atts['phone'])): ?>
                        <li class="bg-contact-us__info-item">
                            <span class="bg-contact-us__info-icon" aria-hidden="true">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            </span>
                            <div class="bg-contact-us__info-body">
                                <p class="bg-contact-us__info-label">Phone</p>
                                <a href="tel:<?php echo esc_attr($phone_tel); ?>" class="bg-contact-us__info-link">
                                    <?php echo esc_html($atts['phone']); ?>
                                </a>
                            </div>
                        </li>
                        <?php endif; ?>
                    </ul>
                </div>

                <?php if (!empty($address_lines)): ?>
                <div class="bg-contact-us__address-card">
                    <h3 class="bg-contact-us__address-heading">Our Address</h3>
                    <address class="bg-contact-us__address-body">
                        <?php if (!empty($atts['org'])): ?>
                            <strong class="bg-contact-us__address-org"><?php echo esc_html($atts['org']); ?></strong><br>
                        <?php endif; ?>
                        <?php
                        $count = count($address_lines);
                        foreach (array_values($address_lines) as $i => $line) {
                            echo esc_html($line);
                            if ($i < $count - 1) echo '<br>';
                        }
                        ?>
                    </address>
                </div>
                <?php endif; ?>
            </div>

            <!-- RIGHT: contact form -->
            <div class="bg-contact-us__form-col">
                <div class="bg-contact-us__form-card">
                    <form
                        class="bg-contact-us__form"
                        data-bg-contact-form
                        data-bg-contact-ajax-url="<?php echo esc_url(admin_url('admin-ajax.php')); ?>"
                    >
                        <input type="hidden" name="action" value="bg_contact_submit" />
                        <input type="hidden" name="_bg_contact_nonce" value="<?php echo esc_attr(wp_create_nonce('bg_contact_submit')); ?>" />
                        <input type="hidden" name="send_to" value="<?php echo esc_attr($atts['send_to']); ?>" />
                        <!-- Honeypot — hidden from real users via CSS,
                             bots tend to fill it in and we silently
                             drop their submissions. -->
                        <input type="text" name="website_url" value="" tabindex="-1" autocomplete="off" class="bg-contact-us__hp" aria-hidden="true" />

                        <div class="bg-contact-us__form-row">
                            <label class="bg-contact-us__label" for="bg-contact-name">Name</label>
                            <input id="bg-contact-name" type="text" name="name" required class="bg-contact-us__input" autocomplete="name" />
                        </div>
                        <div class="bg-contact-us__form-row">
                            <label class="bg-contact-us__label" for="bg-contact-email">Email</label>
                            <input id="bg-contact-email" type="email" name="email" required class="bg-contact-us__input" autocomplete="email" />
                        </div>
                        <div class="bg-contact-us__form-row">
                            <label class="bg-contact-us__label" for="bg-contact-phone">Phone Number</label>
                            <input id="bg-contact-phone" type="tel" name="phone" required class="bg-contact-us__input" autocomplete="tel" />
                        </div>
                        <div class="bg-contact-us__form-row">
                            <label class="bg-contact-us__label" for="bg-contact-message">Message</label>
                            <textarea id="bg-contact-message" name="message" rows="5" required class="bg-contact-us__textarea"></textarea>
                        </div>
                        <button type="submit" class="bg-contact-us__submit" data-bg-contact-submit>
                            <span data-bg-contact-submit-label>Send Message</span>
                        </button>
                        <div class="bg-contact-us__error" data-bg-contact-error hidden></div>
                    </form>
                    <div class="bg-contact-us__success" data-bg-contact-success hidden>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <h3>Thank you!</h3>
                        <p data-bg-contact-success-msg>Your message has been sent. We'll get back to you soon.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
    (function () {
        document.querySelectorAll('[data-bg-contact-form]').forEach(function (form) {
            if (form.dataset.bgContactBound) return;
            form.dataset.bgContactBound = '1';

            var ajaxUrl = form.getAttribute('data-bg-contact-ajax-url') || '';
            var card = form.closest('.bg-contact-us__form-card');
            var submitBtn = form.querySelector('[data-bg-contact-submit]');
            var submitLabel = form.querySelector('[data-bg-contact-submit-label]');
            var errorBox = form.querySelector('[data-bg-contact-error]');
            var successBox = card ? card.querySelector('[data-bg-contact-success]') : null;
            var successMsg = card ? card.querySelector('[data-bg-contact-success-msg]') : null;

            function showError(message) {
                if (!errorBox) return;
                errorBox.textContent = message;
                errorBox.removeAttribute('hidden');
            }
            function hideError() {
                if (!errorBox) return;
                errorBox.textContent = '';
                errorBox.setAttribute('hidden', 'hidden');
            }
            function setBusy(busy) {
                if (submitBtn) submitBtn.disabled = busy;
                if (submitLabel) submitLabel.textContent = busy ? 'Sending…' : 'Send Message';
            }

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                hideError();
                setBusy(true);

                var formData = new FormData(form);

                fetch(ajaxUrl, {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: formData,
                })
                    .then(function (res) {
                        return res.json().then(function (json) {
                            return { ok: res.ok, json: json };
                        });
                    })
                    .then(function (result) {
                        setBusy(false);
                        if (result.ok && result.json && result.json.success) {
                            if (successMsg && result.json.message) {
                                successMsg.textContent = result.json.message;
                            }
                            if (successBox) {
                                form.style.display = 'none';
                                successBox.removeAttribute('hidden');
                            }
                        } else {
                            var msg = (result.json && result.json.message)
                                ? result.json.message
                                : 'Something went wrong. Please try again.';
                            showError(msg);
                        }
                    })
                    .catch(function () {
                        setBusy(false);
                        showError('Network error. Please check your connection and try again.');
                    });
            });
        });
    })();
    </script>
    <?php
    return ob_get_clean();
});

/**
 * Shortcode: [bg_recently_viewed]
 *
 * NAME RETAINED for backwards compat with existing Elementor
 * placements — but this now renders WooCommerce RELATED
 * products (products that share categories or tags with the
 * current product) as a brand-styled grid. Heading defaults
 * to "You May Also Like / More to Explore" matching the
 * Beyond Gaming Next.js storefront.
 *
 * Drop into Elementor's Shortcode widget at the bottom of the
 * product template — auto-hides when there are no related
 * products to show.
 *
 * Reuses the .bg-product-card markup from [bg_new_arrivals] so
 * the grid items visually match the rest of the storefront.
 *
 * Usage:
 *   [bg_recently_viewed]
 *   [bg_recently_viewed limit="6"]
 *   [bg_recently_viewed title="You May Also Like" eyebrow="More to Explore"]
 *
 * Attributes:
 *   limit    — max products to show (default 8)
 *   title    — main heading (default "You May Also Like")
 *   eyebrow  — small uppercase eyebrow text above the heading
 *              (default "More to Explore")
 */
add_shortcode('bg_recently_viewed', function ($atts) {
    $atts = shortcode_atts([
        'limit'   => 8,
        'title'   => 'You May Also Like',
        'eyebrow' => 'More to Explore',
    ], $atts);

    if (!class_exists('WooCommerce') || !function_exists('wc_get_related_products')) {
        return '';
    }

    // Resolve current product. Required — related-product
    // discovery is keyed off this product's categories/tags.
    global $product;
    if (!$product instanceof WC_Product) {
        $obj = get_queried_object();
        if ($obj instanceof WP_Post && $obj->post_type === 'product') {
            $product = wc_get_product($obj->ID);
        }
    }
    if (!$product instanceof WC_Product) {
        return '';
    }

    $limit = max(1, intval($atts['limit']));
    // wc_get_related_products(product_id, limit, exclude)
    $related_ids = wc_get_related_products(
        $product->get_id(),
        $limit,
        [$product->get_id()]
    );
    if (empty($related_ids)) {
        return '';
    }

    $args = [
        'post_type'      => 'product',
        'post__in'       => $related_ids,
        'orderby'        => 'rand',
        'posts_per_page' => $limit,
        'post_status'    => 'publish',
        'no_found_rows'  => true,
    ];
    $query = new WP_Query($args);
    if (!$query->have_posts()) {
        return '';
    }

    ob_start();
    ?>
    <section class="bg-related-products">
        <div class="bg-related-products__heading">
            <?php if (!empty($atts['eyebrow'])): ?>
                <p class="bg-related-products__eyebrow"><?php echo esc_html($atts['eyebrow']); ?></p>
            <?php endif; ?>
            <h2 class="bg-related-products__title"><?php echo esc_html($atts['title']); ?></h2>
        </div>
        <div class="bg-new-arrivals-grid bg-related-products__grid">
        <?php
        while ($query->have_posts()) {
            $query->the_post();
            global $product;
            if (!$product instanceof WC_Product) continue;

            bg_render_pcard($product);
        }
        wp_reset_postdata();
        ?>
        </div>
    </section>
    <?php
    return ob_get_clean();
});

/**
 * Shortcode: [bg_product_page]
 *
 * Complete on-brand product page renderer. Drop this single
 * shortcode into Elementor's Shortcode widget on your product
 * template and it replaces the entire product summary area
 * with a layout matching the Beyond Gaming Next.js website
 * (src/app/shop/[slug]/page.tsx).
 *
 * Renders, in order:
 *   1. Breadcrumb (Home → Shop → Category → Product)
 *   2. Two-column grid:
 *        Left  → image gallery (sticky on desktop)
 *        Right → category badges, title, gradient price,
 *                stock dot, short description, qty selector,
 *                add to cart button, trust badges, SKU/cats meta
 *   3. Full description card (long description)
 *
 * Backwards compat: also registered as `bg_product_summary`
 * so existing Elementor placements keep working.
 *
 * Usage:
 *   [bg_product_page]
 *
 * Notes:
 * - Simple products get a working AJAX add-to-cart form.
 * - Variable/grouped/external fall back to a "Configure on
 *   Product Page" CTA link.
 */
function bg_render_product_page() {
    if (!function_exists('wc_get_product')) {
        return '';
    }

    global $product;
    if (!$product instanceof WC_Product) {
        $obj = get_queried_object();
        if ($obj instanceof WP_Post && $obj->post_type === 'product') {
            $product = wc_get_product($obj->ID);
        }
    }
    if (!$product instanceof WC_Product) {
        return '';
    }

    // ── Gallery: featured + additional images ──
    $image_ids = $product->get_gallery_image_ids();
    $main_image_id = $product->get_image_id();
    if ($main_image_id) {
        array_unshift($image_ids, $main_image_id);
    }
    $image_ids = array_unique(array_filter($image_ids));
    $images = [];
    foreach ($image_ids as $id) {
        $src = wp_get_attachment_image_url($id, 'large');
        if (!$src) continue;
        $alt = get_post_meta($id, '_wp_attachment_image_alt', true);
        if (empty($alt)) {
            $alt = $product->get_name();
        }
        $images[] = ['src' => $src, 'alt' => $alt];
    }
    if (empty($images)) {
        $images[] = [
            'src' => wc_placeholder_img_src('large'),
            'alt' => $product->get_name(),
        ];
    }

    // ── Stock label + brand color class ──
    $stock_status = $product->get_stock_status();
    $stock_label  = 'In Stock';
    $stock_class  = 'is-in';
    if ($stock_status === 'outofstock') {
        $stock_label = 'Out of Stock';
        $stock_class = 'is-out';
    } elseif ($stock_status === 'onbackorder') {
        $stock_label = 'On Backorder';
        $stock_class = 'is-backorder';
    } elseif ($product->managing_stock()) {
        $qty = (int) $product->get_stock_quantity();
        $product_low = (int) $product->get_low_stock_amount();
        $threshold = $product_low > 0 ? $product_low : (int) get_option('woocommerce_notify_low_stock_amount', 2);
        if ($qty > 0 && $qty <= $threshold) {
            $stock_label = 'Only ' . $qty . ' left';
            $stock_class = 'is-low';
        }
    }
    $stock_qty_remaining = null;
    if ($product->managing_stock() && $stock_status === 'instock') {
        $stock_qty_remaining = (int) $product->get_stock_quantity();
    }

    // ── Price HTML (brand: skip Woodmart's get_price_html
    // filter so Woodmart doesn't append a duplicate stock label) ──
    $regular = $product->get_regular_price();
    $sale    = $product->get_sale_price();
    $on_sale = $product->is_on_sale();
    if ($on_sale && $sale !== '' && $sale !== null) {
        $price_html = '<ins>' . wc_price($sale) . '</ins>';
        $price_html .= '<del>' . wc_price($regular) . '</del>';
    } else {
        $price_html = wc_price($product->get_price());
    }

    // ── Short and long descriptions ──
    $short = $product->get_short_description();
    if (!empty($short)) {
        $short = apply_filters('woocommerce_short_description', $short);
    }
    $long = $product->get_description();
    if (!empty($long)) {
        $long = apply_filters('the_content', $long);
    }

    // ── Categories ──
    $categories = wc_get_product_terms($product->get_id(), 'product_cat', ['fields' => 'all']);

    // ── Add-to-cart form values ──
    $is_simple_purchasable =
        $product->is_type('simple') &&
        $product->is_purchasable() &&
        $product->is_in_stock();
    $product_id = $product->get_id();
    $max_qty    = $product->get_max_purchase_quantity();
    if ($max_qty < 0) {
        $max_qty = 99;
    }

    ob_start();
    ?>
    <div class="bg-product-page">

        <!-- ─── BREADCRUMB ─── -->
        <nav class="bg-product-page__breadcrumb" aria-label="Breadcrumb">
            <a href="<?php echo esc_url(home_url('/')); ?>">Home</a>
            <span class="bg-product-page__breadcrumb-sep" aria-hidden="true">›</span>
            <a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/shop/')); ?>">Shop</a>
            <?php if (!empty($categories)): ?>
                <span class="bg-product-page__breadcrumb-sep" aria-hidden="true">›</span>
                <a href="<?php echo esc_url(get_term_link($categories[0])); ?>">
                    <?php echo esc_html($categories[0]->name); ?>
                </a>
            <?php endif; ?>
            <span class="bg-product-page__breadcrumb-sep" aria-hidden="true">›</span>
            <span class="bg-product-page__breadcrumb-current"><?php echo esc_html($product->get_name()); ?></span>
        </nav>

        <!-- ─── MAIN GRID ─── -->
        <div class="bg-product-page__grid">

            <!-- LEFT: image gallery -->
            <div class="bg-product-page__gallery">
                <div class="bg-product-page__image-card">
                    <img
                        src="<?php echo esc_url($images[0]['src']); ?>"
                        alt="<?php echo esc_attr($images[0]['alt']); ?>"
                        class="bg-product-page__main-image"
                        data-bg-main-image
                        loading="eager"
                    />
                </div>
                <?php if (count($images) > 1): ?>
                    <div class="bg-product-page__thumbnails">
                        <?php foreach ($images as $i => $img): ?>
                            <button
                                type="button"
                                class="bg-product-page__thumb<?php echo $i === 0 ? ' is-active' : ''; ?>"
                                data-bg-thumb
                                data-bg-thumb-src="<?php echo esc_attr($img['src']); ?>"
                                aria-label="View image <?php echo (int) ($i + 1); ?>"
                            >
                                <img src="<?php echo esc_url($img['src']); ?>" alt="<?php echo esc_attr($img['alt']); ?>" />
                            </button>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- RIGHT: details -->
            <div class="bg-product-page__details">

                <?php if (!empty($categories)): ?>
                    <div class="bg-product-page__categories">
                        <?php foreach ($categories as $cat): ?>
                            <a href="<?php echo esc_url(get_term_link($cat)); ?>" class="bg-product-page__category-pill">
                                <?php echo esc_html($cat->name); ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <h1 class="bg-product-page__title"><?php echo esc_html($product->get_name()); ?></h1>

                <div class="bg-product-page__price-row">
                    <span class="bg-product-page__price"><?php echo wp_kses_post($price_html); ?></span>
                    <?php if ($on_sale): ?>
                        <span class="bg-product-page__sale-badge">Sale</span>
                    <?php endif; ?>
                </div>

                <div class="bg-product-page__stock <?php echo esc_attr($stock_class); ?>">
                    <span class="bg-product-page__stock-dot" aria-hidden="true"></span>
                    <span class="bg-product-page__stock-label"><?php echo esc_html($stock_label); ?></span>
                    <?php if ($stock_qty_remaining !== null && $stock_qty_remaining > 0): ?>
                        <span class="bg-product-page__stock-qty">(<?php echo (int) $stock_qty_remaining; ?> left)</span>
                    <?php endif; ?>
                </div>

                <?php if (!empty($short)): ?>
                    <div class="bg-product-page__short"><?php echo $short; ?></div>
                <?php endif; ?>

                <?php if ($is_simple_purchasable): ?>
                    <form
                        class="cart bg-product-page__form"
                        action="<?php echo esc_url(apply_filters('woocommerce_add_to_cart_form_action', $product->get_permalink())); ?>"
                        method="post"
                        enctype="multipart/form-data"
                    >
                        <div class="bg-product-page__qty quantity">
                            <button
                                type="button"
                                class="bg-product-page__qty-btn"
                                aria-label="Decrease quantity"
                                data-bg-qty="-1"
                            >−</button>
                            <input
                                type="number"
                                class="bg-product-page__qty-input qty"
                                name="quantity"
                                value="1"
                                min="1"
                                max="<?php echo esc_attr($max_qty); ?>"
                                step="1"
                                inputmode="numeric"
                                aria-label="Quantity"
                            />
                            <button
                                type="button"
                                class="bg-product-page__qty-btn"
                                aria-label="Increase quantity"
                                data-bg-qty="1"
                            >+</button>
                        </div>
                        <button
                            type="submit"
                            name="add-to-cart"
                            value="<?php echo esc_attr($product_id); ?>"
                            class="single_add_to_cart_button bg-product-page__cart-btn button alt"
                        >Add to Cart</button>
                    </form>
                <?php elseif ($product->is_in_stock()): ?>
                    <a href="<?php echo esc_url($product->get_permalink()); ?>" class="bg-product-page__cart-btn bg-product-page__cart-btn--link">
                        Configure on Product Page
                    </a>
                <?php else: ?>
                    <button type="button" class="bg-product-page__cart-btn bg-product-page__cart-btn--disabled" disabled>
                        Out of Stock
                    </button>
                <?php endif; ?>

                <!-- Trust badges (matches Next.js storefront) -->
                <div class="bg-product-page__trust">
                    <div class="bg-product-page__trust-item">
                        <span class="bg-product-page__trust-icon" aria-hidden="true">🛡️</span>
                        <p class="bg-product-page__trust-text">100% Authentic</p>
                    </div>
                    <div class="bg-product-page__trust-item">
                        <span class="bg-product-page__trust-icon" aria-hidden="true">⚡</span>
                        <p class="bg-product-page__trust-text">Ships in 1-3 Days</p>
                    </div>
                    <div class="bg-product-page__trust-item">
                        <span class="bg-product-page__trust-icon" aria-hidden="true">🔒</span>
                        <p class="bg-product-page__trust-text">Secure Payment</p>
                    </div>
                </div>

                <!-- Meta info -->
                <div class="bg-product-page__meta">
                    <?php if ($product->get_sku()): ?>
                        <p><span class="bg-product-page__meta-label">SKU:</span> <?php echo esc_html($product->get_sku()); ?></p>
                    <?php endif; ?>
                    <?php if (!empty($categories)): ?>
                        <p><span class="bg-product-page__meta-label">Categories:</span>
                            <?php
                            $cat_names = array_map(function ($c) { return $c->name; }, $categories);
                            echo esc_html(implode(', ', $cat_names));
                            ?>
                        </p>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <?php if (!empty($long)): ?>
            <div class="bg-product-page__description-card">
                <h2 class="bg-product-page__description-heading">Description</h2>
                <div class="bg-product-page__description-body"><?php echo $long; ?></div>
            </div>
        <?php endif; ?>
    </div>

    <script>
    (function () {
        // Quantity selector +/- handler
        document.querySelectorAll('.bg-product-page__form').forEach(function (form) {
            if (form.dataset.bgQtyBound) return;
            form.dataset.bgQtyBound = '1';
            var input = form.querySelector('.bg-product-page__qty-input');
            if (!input) return;
            form.querySelectorAll('[data-bg-qty]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var step = parseInt(btn.getAttribute('data-bg-qty'), 10) || 0;
                    var current = parseInt(input.value, 10) || 1;
                    var min = parseInt(input.getAttribute('min'), 10) || 1;
                    var max = parseInt(input.getAttribute('max'), 10) || 99;
                    var next = Math.min(max, Math.max(min, current + step));
                    input.value = next;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                });
            });
        });

        // Thumbnail click → swap main image
        document.querySelectorAll('.bg-product-page').forEach(function (root) {
            if (root.dataset.bgThumbsBound) return;
            root.dataset.bgThumbsBound = '1';
            var main = root.querySelector('[data-bg-main-image]');
            if (!main) return;
            root.querySelectorAll('[data-bg-thumb]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var src = btn.getAttribute('data-bg-thumb-src');
                    if (!src) return;
                    main.src = src;
                    root.querySelectorAll('[data-bg-thumb]').forEach(function (b) {
                        b.classList.toggle('is-active', b === btn);
                    });
                });
            });
        });
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('bg_product_page', 'bg_render_product_page');
add_shortcode('bg_product_summary', 'bg_render_product_page');

/**
 * Shortcode: [bg_product_short_description]
 *
 * Renders the current product's WooCommerce SHORT description
 * field (the small editor below the long description in the
 * WP product edit screen) inside a brand-styled .bg-info-card.
 *
 * Drop into Elementor's Shortcode widget on the product page
 * template.
 *
 * Usage:
 *   [bg_product_short_description]
 *   [bg_product_short_description title="Highlights"]
 *   [bg_product_short_description title="Quick Info" empty_text=""]
 *
 * Attributes:
 *   title       — header text (default: "Highlights")
 *   empty_text  — what to show if the short description is empty
 *                 (default: nothing — the whole card is hidden)
 */
add_shortcode('bg_product_short_description', function ($atts) {
    $atts = shortcode_atts([
        'title'      => 'Highlights',
        'empty_text' => '',
    ], $atts);

    if (!function_exists('wc_get_product')) {
        return '';
    }

    // Get the current product. Works inside the loop on a
    // single product page; falls back to the queried object
    // if the loop hasn't started yet.
    global $product;
    if (!$product instanceof WC_Product) {
        $obj = get_queried_object();
        if ($obj instanceof WP_Post && $obj->post_type === 'product') {
            $product = wc_get_product($obj->ID);
        }
    }
    if (!$product instanceof WC_Product) {
        return '';
    }

    // Pull the short description (the small WC field). Run it
    // through woocommerce_short_description so any embedded
    // shortcodes / oEmbeds expand the same way WC's default
    // template would render them.
    $short = $product->get_short_description();
    if (empty($short)) {
        if (empty($atts['empty_text'])) {
            return '';
        }
        $short = '<p>' . esc_html($atts['empty_text']) . '</p>';
    } else {
        $short = apply_filters('woocommerce_short_description', $short);
    }

    ob_start();
    ?>
    <div class="bg-info-card">
        <h2 class="bg-info-card__title"><?php echo esc_html($atts['title']); ?></h2>
        <div class="bg-info-card__body">
            <?php echo $short; // already filtered ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
});

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

/**
 * Shortcode: [bg_about_us]
 *
 * Direct port of /Users/adityaiyer/beyondgaming/src/app/about/
 * page.tsx — full About Us page with hero banner, team grid,
 * "What We Offer" cards, "Why Choose Us" dark callout, and a
 * gold "Start Shopping" CTA at the bottom.
 *
 * Drop into any WordPress page or Elementor Shortcode widget:
 *   [bg_about_us]
 *
 * Attributes (all optional, defaults match Beyond Gaming):
 *   banner          — banner/hero image URL
 *   img_aditya      — Aditya's headshot URL
 *   img_erik        — Erik's headshot URL
 *   img_karan       — Karan's headshot URL
 *   img_abhisek     — Abhisek's headshot URL
 *   shop_url        — URL the "Start Shopping" CTA links to
 */
add_shortcode('bg_about_us', function ($atts) {
    $atts = shortcode_atts([
        'banner'      => 'https://beyondgaming.in/wp-content/uploads/2026/04/about-team.jpg',
        'img_aditya'  => 'https://beyondgaming.in/wp-content/uploads/2026/04/team-aditya.jpg',
        'img_erik'    => 'https://beyondgaming.in/wp-content/uploads/2026/04/team-erik.jpg',
        'img_karan'   => 'https://beyondgaming.in/wp-content/uploads/2026/04/team-karan.jpg',
        'img_abhisek' => 'https://beyondgaming.in/wp-content/uploads/2026/04/team-abhisek.jpg',
        'shop_url'    => '',
    ], $atts);

    if (empty($atts['shop_url'])) {
        $atts['shop_url'] = function_exists('wc_get_page_permalink')
            ? wc_get_page_permalink('shop')
            : home_url('/shop/');
    }

    // Team data (verbatim from src/app/about/page.tsx)
    $team = [
        [
            'name'      => 'Aditya Iyer',
            'aka'       => 'ayersvault',
            'role'      => 'Partner & Co-Founder',
            'image'     => $atts['img_aditya'],
            'instagram' => 'https://instagram.com/ayersvault',
            'desc'      => "Aditya focuses on technology &amp; grading operations. He is actively involved in shaping Beyond Gaming's long-term approach to building a collector driven collectibles ecosystem in India.",
            'pos'       => 'top',
            'scale'     => '1',
        ],
        [
            'name'      => 'Erik Nanda',
            'aka'       => 'goat_tcg',
            'role'      => 'Partner & Co-Founder',
            'image'     => $atts['img_erik'],
            'instagram' => 'https://instagram.com/goat_tcg',
            'desc'      => 'Erik leads operations and execution. He is responsible for building reliable fulfilment and operational frameworks that support growth across both online and offline channels.',
            'pos'       => 'top',
            'scale'     => '1.25',
        ],
        [
            'name'      => 'Karan Oberoi',
            'aka'       => 'obbytcg',
            'role'      => 'Partner',
            'image'     => $atts['img_karan'],
            'instagram' => 'https://instagram.com/obbytcg',
            'desc'      => 'Karan leads customer engagements, major events, and community-led growth. He anchors Beyond Gaming\'s live &ldquo;Rip &amp; Ship&rdquo; experiences and plays a key role in grassroots engagement with collectors and players.',
            'pos'       => 'top',
            'scale'     => '1',
        ],
        [
            'name'      => 'Abhisek Bajaj',
            'aka'       => 'GodspeedxD',
            'role'      => 'Partner',
            'image'     => $atts['img_abhisek'],
            'instagram' => 'https://instagram.com/iamgodspeedxd',
            'desc'      => 'Abhisek leads procurement, global sourcing, and supplier partnerships. He is responsible for building reliable supply channels, managing vendor relationships, and ensuring consistent product availability.',
            'pos'       => 'center 30%',
            'scale'     => '1.10',
        ],
    ];

    $offerings = [
        ['title' => 'Pokemon TCG',        'desc' => 'English &amp; Japanese booster boxes, packs, ETBs, tins, and singles.', 'emoji' => '⚡'],
        ['title' => 'One Piece TCG',      'desc' => 'Booster boxes, special sets, and file sets from Bandai.',                'emoji' => '⚓'],
        ['title' => 'Dragon Ball TCG',    'desc' => 'The latest Dragon Ball card game products from Bandai.',                  'emoji' => '🔥'],
        ['title' => 'Graded Slabs',       'desc' => 'PSA, BGS, and CGC graded cards for serious collectors.',                  'emoji' => '🏆'],
        ['title' => 'Supplies',           'desc' => 'Sleeves, binders, toploaders, and everything to protect your collection.','emoji' => '🛡️'],
        ['title' => 'Toys & Collectibles','desc' => 'Labubu, Pop Mart, and other licensed collectible figures.',                'emoji' => '✨'],
    ];

    $why = [
        ['icon' => '🛡️', 'title' => '100% Authentic',         'desc' => 'Every product is genuine, officially licensed, and sourced from authorized distributors. No fakes, ever.'],
        ['icon' => '⚡', 'title' => 'Lightning Fast Shipping','desc' => 'All orders are shipped within 1-3 business days with tracking. Pan-India delivery.'],
        ['icon' => '❤️', 'title' => 'Community First',        'desc' => "We're collectors too. We understand the passion, the excitement, and the joy of collecting."],
    ];

    ob_start();
    ?>
    <div class="bg-about-page">

        <!-- ── 1. HERO ── -->
        <div class="bg-about-page__hero">
            <div class="bg-about-page__hero-image">
                <img src="<?php echo esc_url($atts['banner']); ?>" alt="Beyond Gaming Founders" loading="eager" />
            </div>
            <div class="bg-about-page__hero-overlay"></div>
            <div class="bg-about-page__hero-content">
                <p class="bg-about-page__hero-eyebrow">Our Story</p>
                <h1 class="bg-about-page__hero-title">About Beyond Gaming</h1>
                <p class="bg-about-page__hero-tagline">For Collectors. By Collectors.</p>
                <p class="bg-about-page__hero-desc">Beyond Gaming is India's leading one-stop collectibles shop, founded by passionate collectors who understand the thrill of the hunt. We started with a simple mission: to make authentic trading cards and collectibles accessible to fans across India.</p>
            </div>
        </div>

        <!-- ── 2. MEET THE TEAM ── -->
        <section class="bg-about-page__section">
            <div class="bg-about-page__section-head">
                <p class="bg-about-page__eyebrow">The People Behind BG</p>
                <h2 class="bg-about-page__h2">Meet The Team</h2>
            </div>
            <div class="bg-about-page__team-grid">
                <?php foreach ($team as $member): ?>
                    <div class="bg-about-page__team-card">
                        <div class="bg-about-page__team-photo">
                            <img
                                src="<?php echo esc_url($member['image']); ?>"
                                alt="<?php echo esc_attr($member['name']); ?>"
                                loading="lazy"
                                style="object-position: <?php echo esc_attr($member['pos']); ?>; transform: scale(<?php echo esc_attr($member['scale']); ?>);"
                            />
                        </div>
                        <div class="bg-about-page__team-body">
                            <h3 class="bg-about-page__team-name">
                                <?php echo esc_html($member['name']); ?>
                                <span class="bg-about-page__team-aka">/ <?php echo esc_html($member['aka']); ?></span>
                            </h3>
                            <p class="bg-about-page__team-role"><?php echo esc_html($member['role']); ?></p>
                            <p class="bg-about-page__team-desc"><?php echo $member['desc']; ?></p>
                            <a href="<?php echo esc_url($member['instagram']); ?>" target="_blank" rel="noopener noreferrer" class="bg-about-page__team-ig">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                @<?php echo esc_html($member['aka']); ?>
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>

        <!-- ── 3. WHAT WE OFFER ── -->
        <section class="bg-about-page__section">
            <div class="bg-about-page__section-head">
                <p class="bg-about-page__eyebrow">Our Products</p>
                <h2 class="bg-about-page__h2">What We Offer</h2>
            </div>
            <div class="bg-about-page__offer-grid">
                <?php foreach ($offerings as $item): ?>
                    <div class="bg-about-page__offer-card">
                        <span class="bg-about-page__offer-emoji"><?php echo $item['emoji']; ?></span>
                        <h3 class="bg-about-page__offer-title"><?php echo esc_html($item['title']); ?></h3>
                        <p class="bg-about-page__offer-desc"><?php echo $item['desc']; ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>

        <!-- ── 4. WHY CHOOSE US (dark callout) ── -->
        <div class="bg-about-page__why">
            <div class="bg-about-page__why-glow"></div>
            <div class="bg-about-page__why-inner">
                <h2 class="bg-about-page__why-title">Why Choose <span class="bg-about-page__why-title-gold">Us</span>?</h2>
                <div class="bg-about-page__why-grid">
                    <?php foreach ($why as $item): ?>
                        <div class="bg-about-page__why-card">
                            <span class="bg-about-page__why-icon"><?php echo $item['icon']; ?></span>
                            <h3 class="bg-about-page__why-card-title"><?php echo esc_html($item['title']); ?></h3>
                            <p class="bg-about-page__why-card-desc"><?php echo esc_html($item['desc']); ?></p>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- ── 5. CTA ── -->
        <div class="bg-about-page__cta-wrap">
            <a href="<?php echo esc_url($atts['shop_url']); ?>" class="bg-about-page__cta">
                Start Shopping
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
        </div>
    </div>
    <?php
    return ob_get_clean();
});

/**
 * Shortcode: [bg_grading_page]
 *
 * Direct port of /Users/adityaiyer/beyondgaming/src/app/grading/
 * page.tsx — a complete on-brand grading page with hero,
 * live lot status (from the bg-grading-lots plugin), 4-step
 * "How It Works" process, dynamic grading tier grid (from
 * the WC `grading` category), and a 5-question FAQ.
 *
 * Includes two native <dialog> modals:
 *  - Grading Form: collects first/last name, email, phone,
 *    order #, and dynamic card rows (with the same 10
 *    grading category options as the Next.js source). Posts
 *    to /wp-json/bg/v1/grading-submissions which is provided
 *    by the bg-grading-submissions plugin.
 *  - Shipping Info: shows the BG mailing address + the
 *    "where do I ship?" instructions and warnings.
 *
 * Drop into any WordPress page (or Elementor Shortcode widget):
 *   [bg_grading_page]
 *   [bg_grading_page image="https://beyondgaming.in/wp-content/uploads/2026/04/grading-promo.png"]
 *
 * Attributes:
 *   image — promo image URL shown in the desktop hero (left
 *           column). Hidden on mobile. Falls back to a
 *           placeholder if not provided.
 */
add_shortcode('bg_grading_page', function ($atts) {
    $atts = shortcode_atts([
        'image' => 'https://beyondgaming.in/wp-content/uploads/2026/01/BGPROMO-GRADING.png',
    ], $atts);

    // ── Live lot data from bg-grading-lots plugin ──
    $active_lot       = function_exists('bg_get_active_lot') ? bg_get_active_lot() : 'None';
    $next_lot         = function_exists('bg_get_next_lot') ? bg_get_next_lot() : '';
    $in_progress_lots = function_exists('bg_get_in_progress_lots') ? bg_get_in_progress_lots() : '';

    // ── Grading tier products from the `grading` category ──
    // Excludes out-of-stock items via meta_query so customers
    // never see grading tiers they can't add to cart.
    $grading_query = null;
    if (class_exists('WooCommerce')) {
        $grading_query = new WP_Query([
            'post_type'      => 'product',
            'posts_per_page' => 20,
            'post_status'    => 'publish',
            'orderby'        => 'date',
            'order'          => 'DESC',
            'tax_query'      => [[
                'taxonomy' => 'product_cat',
                'field'    => 'slug',
                'terms'    => 'grading',
            ]],
            'meta_query'     => [[
                'key'     => '_stock_status',
                'value'   => 'instock',
                'compare' => '=',
            ]],
            'no_found_rows'  => true,
        ]);
    }

    // ── Grading category dropdown options (verbatim from
    // GradingFormPopup.tsx) ──
    $grading_categories = [
        'BGS - BASE',
        'BGS - STANDARD',
        'BGS - EXPRESS',
        'PSA - VALUE BULK',
        'PSA - VALUE',
        'PSA - VALUE PLUS',
        'PSA - VALUE MAX',
        'PSA - REGULAR',
        'PSA - EXPRESS',
        'PSA - DUAL AUTO',
        'PSA - REHOLDER',
        'CGC - ECONOMY',
    ];

    ob_start();
    ?>
    <div class="bg-grading-page">

        <!-- ── 1. HEADER ── -->
        <div class="bg-grading-page__header">
            <p class="bg-grading-page__eyebrow">Beyond Grading</p>
            <h1 class="bg-grading-page__title">Grading &amp; Authentication Services</h1>
        </div>

        <!-- ── 2. HERO (desktop only) ── -->
        <div class="bg-grading-page__hero">
            <div class="bg-grading-page__hero-image">
                <img src="<?php echo esc_url($atts['image']); ?>" alt="Beyond Grading" loading="eager" />
            </div>
            <div class="bg-grading-page__features">
                <div class="bg-grading-page__feature">
                    <span class="bg-grading-page__feature-num">1.</span>
                    <h3>Informed Selection</h3>
                    <p>Choose the grading tier that is best suited for your needs.</p>
                </div>
                <div class="bg-grading-page__feature">
                    <span class="bg-grading-page__feature-num">2.</span>
                    <h3>Add-On Services</h3>
                    <p>Choose Add-On Services such as Assessment, Clean-Up and Repair.</p>
                </div>
                <div class="bg-grading-page__feature">
                    <span class="bg-grading-page__feature-num">3.</span>
                    <h3>Real Time Tracking</h3>
                    <p>Know where your Submission is in the grading cycle.</p>
                </div>
                <div class="bg-grading-page__feature">
                    <span class="bg-grading-page__feature-num">4.</span>
                    <h3>No Hidden Costs</h3>
                    <p>Know all possible costs upfront when booking your Submission.</p>
                </div>
            </div>
        </div>

        <hr class="bg-grading-page__divider">

        <!-- ── 3. LIVE LOT STATUS ── -->
        <div class="bg-grading-page__lots">
            <div class="bg-grading-page__lot-card bg-grading-page__lot-card--active">
                <div class="bg-grading-page__lot-head">
                    <span class="bg-grading-page__lot-dot bg-grading-page__lot-dot--pulse"></span>
                    <h3>Currently Active Lot</h3>
                </div>
                <p class="bg-grading-page__lot-value"><?php echo esc_html($active_lot ?: '—'); ?></p>
            </div>
            <div class="bg-grading-page__lot-card bg-grading-page__lot-card--next">
                <div class="bg-grading-page__lot-head">
                    <span class="bg-grading-page__lot-dot"></span>
                    <h3>Next Scheduled Lot</h3>
                </div>
                <p class="bg-grading-page__lot-value"><?php echo esc_html($next_lot ?: '—'); ?></p>
            </div>
            <div class="bg-grading-page__lot-card bg-grading-page__lot-card--progress">
                <div class="bg-grading-page__lot-head">
                    <span class="bg-grading-page__lot-dot"></span>
                    <h3>In Progress Lots</h3>
                </div>
                <p class="bg-grading-page__lot-value"><?php echo esc_html($in_progress_lots ?: '—'); ?></p>
            </div>
        </div>

        <!-- ── 4. HOW IT WORKS / PROCESS STEPS ── -->
        <section class="bg-grading-page__steps-section">
            <p class="bg-grading-page__eyebrow">How It Works</p>
            <h2 class="bg-grading-page__h2">Submission Process</h2>
            <div class="bg-grading-page__steps-grid">
                <div class="bg-grading-page__step">
                    <div class="bg-grading-page__step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                    <span class="bg-grading-page__step-label">Step 1</span>
                    <h3 class="bg-grading-page__step-title">Add Your Grading Sub to Cart</h3>
                    <p class="bg-grading-page__step-desc">Choose a grading tier below and add it to your cart. Select quantity based on number of cards.</p>
                </div>
                <div class="bg-grading-page__step">
                    <div class="bg-grading-page__step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                    </div>
                    <span class="bg-grading-page__step-label">Step 2</span>
                    <h3 class="bg-grading-page__step-title">Checkout</h3>
                    <p class="bg-grading-page__step-desc">Complete your order and payment for the grading service.</p>
                </div>
                <div class="bg-grading-page__step">
                    <div class="bg-grading-page__step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <span class="bg-grading-page__step-label">Step 3</span>
                    <h3 class="bg-grading-page__step-title">Fill the Grading Form</h3>
                    <p class="bg-grading-page__step-desc">Submit card details and your order number.</p>
                    <button type="button" class="bg-grading-page__step-cta" data-bg-dialog-open="bg-grading-form-dialog">
                        Grading Form
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </button>
                </div>
                <div class="bg-grading-page__step">
                    <div class="bg-grading-page__step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/></svg>
                    </div>
                    <span class="bg-grading-page__step-label">Step 4</span>
                    <h3 class="bg-grading-page__step-title">Ship Your Items</h3>
                    <p class="bg-grading-page__step-desc">Ship your cards to us securely.</p>
                    <button type="button" class="bg-grading-page__step-cta" data-bg-dialog-open="bg-grading-shipping-dialog">
                        Where do I ship?
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </button>
                </div>
            </div>
        </section>

        <!-- ── 5. GRADING TIERS ── -->
        <section class="bg-grading-page__tiers-section">
            <p class="bg-grading-page__eyebrow">Choose Your Tier</p>
            <h2 class="bg-grading-page__h2">Grading Tiers</h2>
            <p class="bg-grading-page__tier-warning">
                Kindly place a separate order for grading submissions.
                <span class="bg-grading-page__tier-warning--no">DO NOT</span>
                club with product purchases.
            </p>
            <?php if ($grading_query && $grading_query->have_posts()): ?>
                <?php
                // Group grading-tier products by grading company,
                // parsed from the title prefix ("PSA Grading : Express"
                // → PSA). Anything that isn't a known company falls
                // into an "Other" bucket rendered last.
                $tier_groups = [];
                while ($grading_query->have_posts()) {
                    $grading_query->the_post();
                    global $product;
                    if (!$product instanceof WC_Product) continue;

                    $title = get_the_title();
                    // Company = first token of the title (up to a
                    // space or colon), normalized to uppercase.
                    $company = strtoupper(strtok($title, " :"));
                    if (!in_array($company, ['PSA', 'CGC', 'BGS'], true)) {
                        $company = 'OTHER';
                    }

                    $image = get_the_post_thumbnail_url(get_the_ID(), 'medium');
                    if (!$image) {
                        $image = wc_placeholder_img_src('medium');
                    }
                    $regular = $product->get_regular_price();
                    $sale    = $product->get_sale_price();
                    if ($sale !== '' && $sale !== null && (float) $sale < (float) $regular) {
                        $price_html = '<del>' . wc_price($regular) . '</del> <ins>' . wc_price($sale) . '</ins>';
                    } else {
                        $price_html = wc_price($product->get_price());
                    }

                    $tier_groups[$company][] = [
                        'permalink'  => get_permalink(),
                        'title'      => $title,
                        'image'      => $image,
                        'price_html' => $price_html,
                    ];
                }
                wp_reset_postdata();

                // Display order + section labels. Buckets with no
                // products are skipped; unknown companies render last.
                $company_labels = [
                    'PSA'   => 'PSA',
                    'CGC'   => 'CGC',
                    'BGS'   => 'BGS',
                    'OTHER' => 'Other',
                ];
                foreach ($company_labels as $code => $label):
                    if (empty($tier_groups[$code])) continue;
                    ?>
                    <div class="bg-grading-page__tier-group">
                        <h3 class="bg-grading-page__tier-group-title"><?php echo esc_html($label); ?></h3>
                        <div class="bg-grading-page__tier-grid">
                            <?php foreach ($tier_groups[$code] as $tier): ?>
                                <a href="<?php echo esc_url($tier['permalink']); ?>" class="bg-product-card">
                                    <div class="bg-product-card__image">
                                        <img src="<?php echo esc_url($tier['image']); ?>" alt="<?php echo esc_attr($tier['title']); ?>" loading="lazy" />
                                    </div>
                                    <div class="bg-product-card__body">
                                        <h3 class="bg-product-card__title"><?php echo esc_html($tier['title']); ?></h3>
                                        <p class="bg-product-card__price"><?php echo wp_kses_post($tier['price_html']); ?></p>
                                    </div>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p class="bg-grading-page__tier-empty">Grading tiers will appear here once products are added to the &ldquo;grading&rdquo; category.</p>
            <?php endif; ?>
        </section>

        <!-- ── 6. FAQ ── -->
        <section class="bg-grading-page__faq-section">
            <p class="bg-grading-page__eyebrow bg-grading-page__eyebrow--centered">Got Questions?</p>
            <h2 class="bg-grading-page__h2 bg-grading-page__h2--centered">Frequently Asked Questions</h2>
            <div class="bg-grading-page__faq">
                <details class="bg-grading-page__faq-item">
                    <summary>What kind of cards can I currently grade with Beyond Grading?</summary>
                    <div class="bg-grading-page__faq-body">
                        <p>Beyond Grading currently accepts cards within the TCG category manufactured by the Pokemon Company, Bandai TCG, or Konami. This includes Pokemon, Dragon Ball, One Piece, Digimon, Yu-Gi-Oh!, and more. If your card is not produced by TPC, Bandai, or Konami, contact us first to confirm.</p>
                    </div>
                </details>

                <details class="bg-grading-page__faq-item">
                    <summary>I have placed my order! What next?</summary>
                    <div class="bg-grading-page__faq-body">
                        <p>Once you've placed your order, you'll receive an order number under <strong>My Account &gt; Orders</strong>. Next, fill out the <strong>GRADING FORM</strong> with your info, order number, and card details.</p>
                        <p><strong>Mailing Instructions:</strong></p>
                        <ul>
                            <li>Sleeve each card in a penny sleeve</li>
                            <li>Place in a Toploader or Card Saver, then seal in a resealable bag</li>
                            <li>Sandwich cards between cardboard for protection</li>
                            <li>Use a cardboard box with bubble wrap or a bubble mailer</li>
                        </ul>
                        <p><strong>Important:</strong> Beyond Grading is not responsible for damage during transit. We record an unboxing video of every package.</p>
                    </div>
                </details>

                <details class="bg-grading-page__faq-item">
                    <summary>What are the end to end charges?</summary>
                    <div class="bg-grading-page__faq-body">
                        <p><strong>The base charge covers:</strong></p>
                        <ul>
                            <li>Shipping to PSA/BGS/CGC for grading</li>
                            <li>Shipping back to India after grading</li>
                            <li>Customs duties and charges</li>
                            <li>Return shipping to you</li>
                        </ul>
                        <p><strong>What's Not Covered:</strong></p>
                        <p>Upcharges &mdash; when a card is submitted under a lower tier than it qualifies for. You'll receive a summary of the upcharge and must pay the difference before the card is released.</p>
                        <p><strong>Upcharge formula:</strong></p>
                        <p>(Upcharge amount - Paid tier amount) + Bank charges + Taxes</p>
                    </div>
                </details>

                <details class="bg-grading-page__faq-item">
                    <summary>What are the turnaround times?</summary>
                    <div class="bg-grading-page__faq-body">
                        <p>Turnaround times range from <strong>3 to 6 months</strong> depending on the tier.</p>
                        <p><strong>PSA Processing Times:</strong></p>
                        <ul>
                            <li>Value / Value Dual: 100-120 working days (~5-6 months)</li>
                            <li>Value Plus: 60-80 working days (~3-4 months)</li>
                            <li>Value Max: 40-50 business days (~2-3 months)</li>
                            <li>Regular: 30-40 business days (~1.5-2 months)</li>
                            <li>Re-Holder: 80 business days (~4-5 months)</li>
                        </ul>
                        <p><strong>BGS Processing Times:</strong></p>
                        <ul>
                            <li>Base: 75+ working days (~5 months)</li>
                            <li>Standard: 45 working days (~3 months)</li>
                            <li>Express: 15 working days (~1 month)</li>
                        </ul>
                        <p><strong>CGC Processing Times:</strong></p>
                        <ul>
                            <li>Economy: 45 working days (~3 months)</li>
                        </ul>
                        <p><strong>TAG Processing Times:</strong></p>
                        <ul>
                            <li>Base: 65 working days (~3-3.5 months)</li>
                            <li>Standard: 45 working days (~2-2.5 months)</li>
                            <li>Express: 30 working days (~1.5-2 months)</li>
                        </ul>
                        <p>Beyond Grading adds <strong>1 to 1.5 months</strong> for preparation and postage.</p>
                    </div>
                </details>

                <details class="bg-grading-page__faq-item">
                    <summary>What are the typical grading stages?</summary>
                    <div class="bg-grading-page__faq-body">
                        <ul>
                            <li><strong>Shipping:</strong> Cards packed and sent to PSA</li>
                            <li><strong>Order Prep:</strong> Submission reviewed, verified, logged</li>
                            <li><strong>Research &amp; ID:</strong> Cards researched for accurate label details</li>
                            <li><strong>Grading:</strong> Authentication and grading</li>
                            <li><strong>Assembly:</strong> Labels printed, card sealed in slab</li>
                            <li><strong>QA Check:</strong> Grades re-checked, labels verified</li>
                            <li><strong>Results Out:</strong> Grading results released, cards returning to India</li>
                            <li><strong>Ready to Ship:</strong> Cards arrived in India, ready to ship to you!</li>
                        </ul>
                    </div>
                </details>
            </div>
        </section>
    </div>

    <!-- ─── MODAL: GRADING FORM ─── -->
    <dialog id="bg-grading-form-dialog" class="bg-grading-dialog">
        <div class="bg-grading-dialog__inner">
            <div class="bg-grading-dialog__header">
                <div>
                    <h3>Grading Form</h3>
                    <p>Kindly fill this form after you place your Grading Order.</p>
                </div>
                <button type="button" class="bg-grading-dialog__close" data-bg-dialog-close="bg-grading-form-dialog" aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="bg-grading-dialog__body">
                <form class="bg-grading-form" data-bg-grading-form>
                    <input type="text" name="website_url" tabindex="-1" autocomplete="off" class="bg-grading-form__hp" aria-hidden="true" />

                    <div class="bg-grading-form__row">
                        <div class="bg-grading-form__field">
                            <label>First Name</label>
                            <input type="text" name="first_name" required autocomplete="given-name" />
                        </div>
                        <div class="bg-grading-form__field">
                            <label>Last Name</label>
                            <input type="text" name="last_name" required autocomplete="family-name" />
                        </div>
                    </div>
                    <div class="bg-grading-form__row">
                        <div class="bg-grading-form__field">
                            <label>Email</label>
                            <input type="email" name="email" required autocomplete="email" />
                        </div>
                        <div class="bg-grading-form__field">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" required autocomplete="tel" />
                        </div>
                    </div>
                    <div class="bg-grading-form__field">
                        <label>Order Number</label>
                        <input type="text" name="order_number" required />
                    </div>

                    <h4 class="bg-grading-form__cards-heading">Card Details</h4>
                    <div class="bg-grading-form__cards" data-bg-cards>
                        <div class="bg-grading-form__card-row" data-bg-card-row>
                            <div class="bg-grading-form__field">
                                <label>Card Name</label>
                                <input type="text" data-bg-card-name required />
                            </div>
                            <div class="bg-grading-form__field">
                                <label>Category</label>
                                <select data-bg-card-category required>
                                    <option value="">Select category…</option>
                                    <?php foreach ($grading_categories as $cat): ?>
                                        <option value="<?php echo esc_attr($cat); ?>"><?php echo esc_html($cat); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <button type="button" class="bg-grading-form__remove-card" data-bg-remove-card aria-label="Remove card">×</button>
                        </div>
                    </div>
                    <button type="button" class="bg-grading-form__add-card" data-bg-add-card>+ Add Another Card</button>

                    <div class="bg-grading-form__notice">
                        <p><strong>Important:</strong> Kindly submit clear front and back images of your cards to <strong>+91 9909611611</strong> via WhatsApp. This will help us ensure the cards arrive in the same condition and specification as shared with us.</p>
                    </div>

                    <button type="submit" class="bg-grading-form__submit" data-bg-grading-submit>
                        <span data-bg-grading-submit-label>Submit</span>
                    </button>
                    <div class="bg-grading-form__error" data-bg-grading-error hidden></div>
                </form>

                <div class="bg-grading-form__success" data-bg-grading-success hidden>
                    <div class="bg-grading-form__success-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h4>Submission Received!</h4>
                    <p>Your grading form has been submitted successfully.</p>
                    <p>Please send clear front and back images of your cards to <strong>+91 9909611611</strong> via WhatsApp.</p>
                    <button type="button" class="bg-grading-form__success-close" data-bg-dialog-close="bg-grading-form-dialog">Close</button>
                </div>
            </div>
        </div>
    </dialog>

    <!-- ─── MODAL: SHIPPING INFO ─── -->
    <dialog id="bg-grading-shipping-dialog" class="bg-grading-dialog">
        <div class="bg-grading-dialog__inner">
            <div class="bg-grading-dialog__header">
                <div>
                    <h3>Shipping Address &amp; Instructions</h3>
                    <p>Ship your cards to this address</p>
                </div>
                <button type="button" class="bg-grading-dialog__close" data-bg-dialog-close="bg-grading-shipping-dialog" aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="bg-grading-dialog__body">
                <div class="bg-grading-shipping__address">
                    <p class="bg-grading-shipping__org">Beyond Grading</p>
                    <p class="bg-grading-shipping__name">Aditya Iyer</p>
                    <p>406 Gala Mart,</p>
                    <p>Next to Gala Aria,</p>
                    <p>South Bopal, Bopal,</p>
                    <p class="bg-grading-shipping__city">Ahmedabad - 380058</p>
                    <p class="bg-grading-shipping__phone">Phone: +91 9909611611</p>
                </div>

                <h4 class="bg-grading-shipping__heading">Important points to note</h4>
                <ul class="bg-grading-shipping__list">
                    <li>Share the tracking number with us at <strong>+91 9909611611</strong> via WhatsApp.</li>
                    <li>Use a private courier — Delhivery / DTDC / Blue Dart / Tirupati / Professional Couriers are recommended.</li>
                    <li>Ensure each card is sleeved and packed in a toploader / semi-rigid holder, inside a cardboard box with protection.</li>
                    <li class="bg-grading-shipping__list-warn">Beyond Grading / Beyond Gaming is <strong>not liable</strong> for any damage in transit.</li>
                </ul>

                <button type="button" class="bg-grading-shipping__close-btn" data-bg-dialog-close="bg-grading-shipping-dialog">Got it</button>
            </div>
        </div>
    </dialog>

    <script>
    (function () {
        // Open / close native <dialog> elements
        document.querySelectorAll('[data-bg-dialog-open]').forEach(function (btn) {
            if (btn.dataset.bgBound) return;
            btn.dataset.bgBound = '1';
            btn.addEventListener('click', function () {
                var id = btn.getAttribute('data-bg-dialog-open');
                var dlg = document.getElementById(id);
                if (dlg && typeof dlg.showModal === 'function') {
                    dlg.showModal();
                }
            });
        });
        document.querySelectorAll('[data-bg-dialog-close]').forEach(function (btn) {
            if (btn.dataset.bgBound) return;
            btn.dataset.bgBound = '1';
            btn.addEventListener('click', function () {
                var id = btn.getAttribute('data-bg-dialog-close');
                var dlg = document.getElementById(id);
                if (dlg) dlg.close();
            });
        });

        // Pin grading dialogs to <body> so they escape any
        // transformed ancestor that would break position: fixed
        ['bg-grading-form-dialog', 'bg-grading-shipping-dialog'].forEach(function (id) {
            var dlg = document.getElementById(id);
            if (dlg && dlg.parentNode !== document.body) {
                document.body.appendChild(dlg);
            }
        });

        // Dynamic card rows
        document.querySelectorAll('[data-bg-grading-form]').forEach(function (form) {
            if (form.dataset.bgFormBound) return;
            form.dataset.bgFormBound = '1';

            var cardsWrap = form.querySelector('[data-bg-cards]');
            var addBtn = form.querySelector('[data-bg-add-card]');
            var template = cardsWrap.querySelector('[data-bg-card-row]').cloneNode(true);

            function refreshRemoveButtons() {
                var rows = cardsWrap.querySelectorAll('[data-bg-card-row]');
                rows.forEach(function (row) {
                    var btn = row.querySelector('[data-bg-remove-card]');
                    if (!btn) return;
                    btn.style.display = rows.length > 1 ? '' : 'none';
                });
            }
            refreshRemoveButtons();

            addBtn.addEventListener('click', function () {
                var clone = template.cloneNode(true);
                clone.querySelectorAll('input, select').forEach(function (el) {
                    if (el.tagName === 'SELECT') {
                        el.selectedIndex = 0;
                    } else {
                        el.value = '';
                    }
                });
                cardsWrap.appendChild(clone);
                refreshRemoveButtons();
            });

            cardsWrap.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-bg-remove-card]');
                if (!btn) return;
                var row = btn.closest('[data-bg-card-row]');
                if (!row) return;
                var rows = cardsWrap.querySelectorAll('[data-bg-card-row]');
                if (rows.length <= 1) return;
                row.remove();
                refreshRemoveButtons();
            });

            // Submit handler — POST JSON to the BG plugin endpoint
            var submitBtn = form.querySelector('[data-bg-grading-submit]');
            var submitLabel = form.querySelector('[data-bg-grading-submit-label]');
            var errorBox = form.querySelector('[data-bg-grading-error]');
            var successBox = form.parentNode.querySelector('[data-bg-grading-success]');

            function setBusy(busy) {
                if (submitBtn) submitBtn.disabled = busy;
                if (submitLabel) submitLabel.textContent = busy ? 'Submitting…' : 'Submit';
            }
            function showError(msg) {
                if (!errorBox) return;
                errorBox.textContent = msg;
                errorBox.removeAttribute('hidden');
            }
            function hideError() {
                if (!errorBox) return;
                errorBox.setAttribute('hidden', 'hidden');
                errorBox.textContent = '';
            }

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                hideError();

                // Honeypot
                var hp = form.querySelector('.bg-grading-form__hp');
                if (hp && hp.value) {
                    return;
                }

                var data = new FormData(form);
                var cards = [];
                form.querySelectorAll('[data-bg-card-row]').forEach(function (row) {
                    var name = row.querySelector('[data-bg-card-name]');
                    var cat = row.querySelector('[data-bg-card-category]');
                    cards.push({
                        cardName: name ? name.value.trim() : '',
                        category: cat ? cat.value.trim() : '',
                    });
                });

                var payload = {
                    first_name: (data.get('first_name') || '').toString().trim(),
                    last_name:  (data.get('last_name')  || '').toString().trim(),
                    email:      (data.get('email')      || '').toString().trim(),
                    phone:      (data.get('phone')      || '').toString().trim(),
                    order_number: (data.get('order_number') || '').toString().trim(),
                    cards: cards,
                };

                setBusy(true);
                fetch('<?php echo esc_url_raw(rest_url('bg/v1/grading-submissions')); ?>', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                    .then(function (res) {
                        return res.json().then(function (json) {
                            return { ok: res.ok, json: json };
                        });
                    })
                    .then(function (result) {
                        setBusy(false);
                        if (result.ok && result.json && result.json.id) {
                            form.style.display = 'none';
                            if (successBox) successBox.removeAttribute('hidden');
                        } else {
                            showError((result.json && result.json.message) || 'Submission failed. Please try again.');
                        }
                    })
                    .catch(function () {
                        setBusy(false);
                        showError('Network error. Please check your connection and try again.');
                    });
            });
        });
    })();
    </script>
    <?php
    return ob_get_clean();
});

/* ─────────────────────────────────────────────────────────────
   3b. CART PAGE HEADING
   Render the same "JUST DROPPED / New Arrivals" style section
   heading at the top of the cart page. Uses the existing
   .bg-section-heading classes from style.css so the typography
   is identical to the homepage section headings.
   ───────────────────────────────────────────────────────────── */
add_action('woocommerce_before_cart', function () {
    if (!function_exists('is_cart') || !is_cart()) {
        return;
    }
    if (WC()->cart && WC()->cart->is_empty()) {
        return;
    }
    ?>
    <div class="bg-section-heading bg-cart-heading">
        <p class="bg-section-heading__eyebrow">Your selection</p>
        <h1 class="bg-section-heading__title">My Cart</h1>
    </div>
    <?php
}, 5);

/* ─────────────────────────────────────────────────────────────
   3f. REMOVE "DOWNLOADS" / "BG POINTS" FROM ACCOUNT MENU
   The Downloads endpoint shows up in both the my-account
   sidebar and the header account dropdown (renamed to "BG
   Points" by some other filter). We don't use it — strip it
   from the menu items array. Priority 999 so we run after
   any Woodmart/plugin customizations.
   ───────────────────────────────────────────────────────────── */
add_filter('woocommerce_account_menu_items', function ($items) {
    unset($items['downloads']);
    return $items;
}, 999);

/* ─────────────────────────────────────────────────────────────
   3e. MY ACCOUNT PAGE HEADING
   Same pattern as the cart and checkout headings. Renders
   "YOUR ACCOUNT / My Account" at the top of the my-account
   page on EVERY subpage (dashboard, orders, addresses, etc).

   Hooks into woocommerce_account_navigation at priority 5 so
   it fires before the nav function (priority 10). The heading
   ends up as a sibling of the nav and content, inside the
   .woocommerce wrapper, on every my-account endpoint.
   ───────────────────────────────────────────────────────────── */
add_action('woocommerce_account_navigation', function () {
    if (!is_user_logged_in()) {
        return;
    }
    // Choose the title/eyebrow based on the current endpoint.
    $eyebrow = 'Your account';
    $title   = 'My Account';
    if (function_exists('is_wc_endpoint_url')) {
        if (is_wc_endpoint_url('orders') || is_wc_endpoint_url('view-order')) {
            $title = 'Your Orders';
        } elseif (is_wc_endpoint_url('edit-address')) {
            $title = 'Addresses';
        } elseif (is_wc_endpoint_url('edit-account')) {
            $title = 'Account Details';
        } elseif (is_wc_endpoint_url('downloads')) {
            $title = 'Downloads';
        } elseif (is_wc_endpoint_url('payment-methods')) {
            $title = 'Payment Methods';
        }
    }
    ?>
    <div class="bg-section-heading bg-account-heading">
        <p class="bg-section-heading__eyebrow"><?php echo esc_html($eyebrow); ?></p>
        <h1 class="bg-section-heading__title"><?php echo esc_html($title); ?></h1>
    </div>
    <?php
}, 5);

/* ─────────────────────────────────────────────────────────────
   3d. CHECKOUT TWEAKS
   - Hide the "Have a coupon? Click here to enter your code"
     notice at the top of the checkout (coupons can still be
     entered on the cart page).
   - Hide the entire shipping address section. WooCommerce
     will fall back to using the billing address as the
     shipping address automatically.
   ───────────────────────────────────────────────────────────── */

// Remove the inline coupon form from the checkout page.
add_action('init', function () {
    remove_action('woocommerce_before_checkout_form', 'woocommerce_checkout_coupon_form', 10);
});

// Tell WooCommerce the cart doesn't need a separate shipping
// address — this removes the entire shipping fields section
// AND the "Ship to a different address?" toggle. WC will reuse
// the billing address for shipping automatically.
add_filter('woocommerce_cart_needs_shipping_address', '__return_false');

// Auto-copy billing fields to shipping fields right before WC
// validates the form. We hide the shipping section above, but
// WC still validates `shipping_state`, `shipping_country`, etc.
// as required fields if the shop has shippable products. By
// populating them server-side from the billing data, the
// (hidden) shipping section passes validation and the order
// ends up with a real shipping address that matches billing.
// Without this, the user sees "Shipping State / County is a
// required field" on submit.
add_filter('woocommerce_checkout_posted_data', function ($data) {
    $fields_to_copy = [
        'first_name', 'last_name', 'company',
        'address_1', 'address_2', 'city',
        'state', 'postcode', 'country', 'phone',
    ];
    foreach ($fields_to_copy as $field) {
        $billing_key  = 'billing_' . $field;
        $shipping_key = 'shipping_' . $field;
        if (isset($data[$billing_key]) && $data[$billing_key] !== '') {
            $data[$shipping_key] = $data[$billing_key];
        }
    }
    return $data;
});

// Belt-and-braces: tell WC the customer has NOT checked "ship
// to a different address", so WC's internal logic falls back
// to using billing as shipping rather than expecting fresh
// shipping form input.
add_filter('woocommerce_ship_to_different_address_checked', '__return_false');

/* ─────────────────────────────────────────────────────────────
   3c. CHECKOUT PAGE HEADING
   Same pattern as the cart heading (3b). Renders the
   "FINAL STEP / Checkout" section heading at the top of the
   checkout page using the existing .bg-section-heading
   classes from style.css.
   ───────────────────────────────────────────────────────────── */
add_action('woocommerce_before_checkout_form', function () {
    if (!function_exists('is_checkout') || !is_checkout()) {
        return;
    }
    if (function_exists('is_wc_endpoint_url') && is_wc_endpoint_url('order-received')) {
        return;
    }
    if (WC()->cart && WC()->cart->is_empty()) {
        return;
    }
    ?>
    <div class="bg-section-heading bg-checkout-heading">
        <p class="bg-section-heading__eyebrow">Final step</p>
        <h1 class="bg-section-heading__title">Checkout</h1>
    </div>
    <?php
}, 5);

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

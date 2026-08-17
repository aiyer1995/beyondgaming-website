<?php
/**
 * Plugin Name: BG Rip & Ship
 * Description: Sells box breaks by the slot. Each box is a variation of a variable product and each slot is one unit of that variation's stock, so WooCommerce handles stock holding, cart revalidation and restock-on-refund rather than this plugin reimplementing them.
 * Version: 1.0.1
 * Author: Beyond Gaming
 *
 * Lives in a plugin rather than the child theme because it defines how a
 * product is sold and how stock is decremented — business logic, not
 * presentation. The theme calls bg_rs_render_picker() behind a
 * function_exists guard, so deactivating this leaves the product page
 * intact; the break simply stops offering the slot picker.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Bail if the child theme still carries the old copy of this code.
 *
 * Rip & Ship lived in the theme until 4.2.0, so a theme older than that
 * declares the same constants and functions. Loading both would be a
 * redeclaration fatal — which is what activating this against theme 4.1.2
 * produces, and a fatal on activation tells the user nothing about why.
 * Stop early and say so instead.
 */
if (defined('BG_RS_ENABLED') || function_exists('bg_rs_boxes')) {
    add_action('admin_notices', function () {
        echo '<div class="notice notice-error"><p><strong>BG Rip &amp; Ship:</strong> '
           . 'not loaded. The active theme still includes its own copy of this feature, '
           . 'and running both at once would be a fatal error. Update the Woodmart child '
           . 'theme to 4.2.0 or later — which removes the theme copy — then reload this page.'
           . '</p></div>';
    });
    return;
}

/* ============================================================
   RIP & SHIP — box breaks sold by the slot

   A break is one product with several identical boxes, each
   holding a fixed number of slots. A buyer takes as many slots
   as they like from whichever boxes they like: 5 from Box 1,
   8 from Box 2.

   Each box is a variation of a variable product and each slot
   is one unit of that variation's stock. That is the whole
   trick, and it is worth stating plainly because a custom
   product type is the obvious-looking alternative: overselling
   is the only real risk in a break, and WooCommerce already
   holds stock through checkout, revalidates the cart when
   stock moves under it, and puts a slot back on refund. Those
   are exactly the paths where an oversell reaches a customer,
   and none of them have to be rewritten here.

   What is custom is only the buying UI, because Woo's stock
   form sells one variation at a time and a break needs several
   in one go.
   ============================================================ */

const BG_RS_ENABLED   = '_bg_rs_enabled';
const BG_RS_BOXES     = '_bg_rs_boxes';
const BG_RS_SLOTS     = '_bg_rs_slots_per_box';
const BG_RS_PRICE     = '_bg_rs_slot_price';
const BG_RS_CAP       = '_bg_rs_capacity';
const BG_RS_ATTR      = 'box';
const BG_RS_ATTR_NAME = 'Box';

/**
 * Boxes for a break, as [variation_id => [label, left, total, price]].
 * Ordered by box number rather than variation id, so inserting a
 * box later still lists in the order a buyer expects.
 */
function bg_rs_boxes($product) {
    if (!$product instanceof WC_Product_Variable) {
        return [];
    }

    $total_slots = (int) get_post_meta($product->get_id(), BG_RS_SLOTS, true);
    $boxes = [];

    foreach ($product->get_children() as $vid) {
        $variation = wc_get_product($vid);
        if (!$variation instanceof WC_Product_Variation) continue;

        $label = $variation->get_attribute(BG_RS_ATTR);
        if ($label === '') continue;

        // Unmanaged stock would make "slots left" meaningless, so
        // such a box is treated as unavailable rather than infinite.
        $left = $variation->managing_stock() ? (int) $variation->get_stock_quantity() : 0;

        // Capacity comes off the box, not the product-level setting.
        // Reading the setting meant a box that actually held 28 was
        // advertised as "of 30" whenever the two had drifted apart:
        // the count buyers saw was wrong even though what they could
        // buy was correctly limited.
        $capacity = (int) $variation->get_meta(BG_RS_CAP);
        if ($capacity < 1) {
            $capacity = max(0, $left) + (int) $variation->get_total_sales();
        }
        if ($capacity < 1) {
            $capacity = $total_slots > 0 ? $total_slots : max(0, $left);
        }

        $boxes[$vid] = [
            'label' => $label,
            'left'  => max(0, $left),
            'total' => $capacity,
            'price' => (float) $variation->get_price(),
            'num'   => (int) preg_replace('/\D+/', '', $label),
        ];
    }

    uasort($boxes, function ($a, $b) { return $a['num'] <=> $b['num']; });

    return $boxes;
}

function bg_rs_is_break($product) {
    if (!$product instanceof WC_Product) return false;
    return get_post_meta($product->get_id(), BG_RS_ENABLED, true) === 'yes'
        && $product->is_type('variable');
}

/* ─── Admin: define the break ─── */

add_action('add_meta_boxes', function () {
    add_meta_box(
        'bg-rs-box',
        'Rip &amp; Ship — Box Break',
        'bg_rs_metabox',
        'product',
        'normal',
        'high'
    );
});

function bg_rs_metabox($post) {
    wp_nonce_field('bg_rs_save', 'bg_rs_nonce');
    $enabled = get_post_meta($post->ID, BG_RS_ENABLED, true) === 'yes';
    $boxes   = (int) get_post_meta($post->ID, BG_RS_BOXES, true);
    $slots   = (int) get_post_meta($post->ID, BG_RS_SLOTS, true);
    $price   = get_post_meta($post->ID, BG_RS_PRICE, true);
    ?>
    <style>
        .bg-rs-admin label { display:block; margin:10px 0 4px; font-weight:600; }
        .bg-rs-admin input[type=number], .bg-rs-admin input[type=text] { width:140px; }
        .bg-rs-admin .bg-rs-admin__note { color:#666; font-style:italic; margin-top:12px; }
        .bg-rs-admin .bg-rs-admin__warn { color:#996800; }
    </style>
    <div class="bg-rs-admin">
        <p>
            <label for="bg_rs_enabled">
                <input type="checkbox" id="bg_rs_enabled" name="bg_rs_enabled" value="yes" <?php checked($enabled); ?> />
                Sell this product as a box break
            </label>
        </p>

        <label for="bg_rs_boxes">Number of boxes</label>
        <input type="number" min="0" step="1" id="bg_rs_boxes" name="bg_rs_boxes" value="<?php echo esc_attr($boxes); ?>" />

        <label for="bg_rs_slots">Slots per box</label>
        <input type="number" min="1" step="1" id="bg_rs_slots" name="bg_rs_slots" value="<?php echo esc_attr($slots ?: 30); ?>" />

        <label for="bg_rs_price">Price per slot</label>
        <input type="text" id="bg_rs_price" name="bg_rs_price" value="<?php echo esc_attr($price); ?>" placeholder="e.g. 499" />

        <p class="bg-rs-admin__note">
            Saving builds one variation per box. Raising the box count
            adds boxes; raising slots per box opens more slots on the
            boxes that already exist. Neither touches slots already
            sold — lowering either number takes capacity off the unsold
            end only.
        </p>

        <p>
            <label for="bg_rs_reset">
                <input type="checkbox" id="bg_rs_reset" name="bg_rs_reset" value="yes" />
                <span class="bg-rs-admin__warn">
                    Refill every box back to full on save. Only tick this
                    for an event that has not started — it puts sold slots
                    back on sale.
                </span>
            </label>
        </p>
    </div>
    <?php
}

/** Queues a message shown once, after the redirect back to the editor. */
function bg_rs_notice($message, $type = 'success') {
    set_transient('bg_rs_notice_' . get_current_user_id(), [
        'message' => $message,
        'type'    => $type,
    ], 120);
}

add_action('admin_notices', function () {
    $key = 'bg_rs_notice_' . get_current_user_id();
    $notice = get_transient($key);
    if (!$notice) return;
    delete_transient($key);
    printf(
        '<div class="notice notice-%s is-dismissible"><p><strong>Rip &amp; Ship:</strong> %s</p></div>',
        esc_attr($notice['type']),
        esc_html($notice['message'])
    );
});

/** True when this request is saving a break with at least one box. */
function bg_rs_posted_break() {
    if (!isset($_POST['bg_rs_nonce']) || !wp_verify_nonce($_POST['bg_rs_nonce'], 'bg_rs_save')) return false;
    if (!isset($_POST['bg_rs_enabled'])) return false;
    return (int) ($_POST['bg_rs_boxes'] ?? 0) > 0;
}

// Steer WooCommerce's save rather than correct it afterwards.
//
// The type has to be variable before WC_Meta_Box_Product_Data::save()
// runs at priority 10, because that method does far more than write a
// term: it decides which class to load and which fields to persist.
// Flipping the term afterwards left WooCommerce having already saved
// the product as simple, and re-reading it in the same request handed
// back a cached WC_Product_Simple — so the variations were built
// against the wrong class and never showed up.
//
// Overwriting the posted value instead means WooCommerce builds a
// variable product through its own path, and the sync below only has
// to add boxes to a product that is already the right type.
add_action('woocommerce_process_product_meta', function () {
    if (!bg_rs_posted_break()) return;
    $_POST['product-type'] = 'variable';
}, 1);

add_action('woocommerce_process_product_meta', function ($post_id) {
    if (!isset($_POST['bg_rs_nonce']) || !wp_verify_nonce($_POST['bg_rs_nonce'], 'bg_rs_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_product', $post_id)) return;

    $enabled = isset($_POST['bg_rs_enabled']) ? 'yes' : 'no';
    update_post_meta($post_id, BG_RS_ENABLED, $enabled);

    if ($enabled !== 'yes') return;

    $boxes = max(0, (int) ($_POST['bg_rs_boxes'] ?? 0));
    $slots = max(1, (int) ($_POST['bg_rs_slots'] ?? 30));
    $price = wc_format_decimal($_POST['bg_rs_price'] ?? '');
    $reset = isset($_POST['bg_rs_reset']);

    update_post_meta($post_id, BG_RS_BOXES, $boxes);
    update_post_meta($post_id, BG_RS_SLOTS, $slots);
    update_post_meta($post_id, BG_RS_PRICE, $price);

    if ($boxes > 0) {
        bg_rs_sync_variations($post_id, $boxes, $slots, $price, $reset);

        // Report what happened. A break that silently fails to build
        // looks identical in the editor to one that worked, and the
        // only symptom is the wrong thing rendering on the front end.
        $product = wc_get_product($post_id);
        if ($product && $product->is_type('variable')) {
            $built = count(bg_rs_boxes($product));
            bg_rs_notice(sprintf(
                '%d box(es) of %d slots are live on this product.',
                $built,
                $slots
            ));
        } else {
            bg_rs_notice(
                'Could not turn this into a variable product, so no boxes were built. '
                . 'Check whether another plugin is forcing the product type.',
                'error'
            );
        }
    }
}, 20);

/**
 * Builds the Box attribute and one variation per box.
 *
 * Stock is only written for boxes being created, or when the caller
 * explicitly asks for a refill. Rewriting it on every save would put
 * already-sold slots back on the shelf every time anyone touched the
 * product — including edits that have nothing to do with the break.
 */
function bg_rs_sync_variations($product_id, $boxes, $slots, $price, $reset = false) {
    $product = wc_get_product($product_id);
    if (!$product) return;

    if (!$product->is_type('variable')) {
        wp_set_object_terms($product_id, 'variable', 'product_type');
        // wc_get_product resolves the class from the cached product
        // type, and WooCommerce has just saved this post as simple a
        // few lines earlier in the same request. Without dropping the
        // cache the re-read hands back another WC_Product_Simple and
        // every variation below is attached to the wrong class.
        clean_post_cache($product_id);
        $product = wc_get_product($product_id);
        if (!$product || !$product->is_type('variable')) {
            // The caller reports this; bailing here without a word is
            // what made the original failure so hard to see.
            return;
        }
    }

    $labels = [];
    for ($i = 1; $i <= $boxes; $i++) {
        $labels[] = 'Box ' . $i;
    }

    // A local attribute rather than a global one: these values mean
    // nothing outside this product, and registering Box 1..30 as
    // site-wide terms would clutter every other product's attribute UI.
    $attribute = new WC_Product_Attribute();
    $attribute->set_name(BG_RS_ATTR_NAME);
    $attribute->set_options($labels);
    $attribute->set_position(0);
    $attribute->set_visible(true);
    $attribute->set_variation(true);

    $attributes = $product->get_attributes();
    $attributes[BG_RS_ATTR] = $attribute;
    $product->set_attributes($attributes);
    $product->save();

    // Query by parent rather than $product->get_children(), which
    // reads the variable product's own children cache and returns
    // nothing while the product is still typed simple. Any variation
    // stranded by an earlier save would then be invisible here and
    // get built a second time, leaving two Box 1s on the product.
    $child_ids = get_posts([
        'post_type'      => 'product_variation',
        'post_parent'    => $product_id,
        'post_status'    => 'any',
        'numberposts'    => -1,
        'fields'         => 'ids',
        'orderby'        => 'ID',
        'order'          => 'ASC',
    ]);

    $existing = [];
    foreach ($child_ids as $vid) {
        $variation = wc_get_product($vid);
        if (!$variation instanceof WC_Product_Variation) continue;
        $label = $variation->get_attribute(BG_RS_ATTR);
        if ($label === '' || isset($existing[$label])) continue;
        $existing[$label] = $variation;
    }

    foreach ($labels as $label) {
        $is_new = !isset($existing[$label]);
        $variation = $is_new ? new WC_Product_Variation() : $existing[$label];

        if ($is_new) {
            $variation->set_parent_id($product_id);
            $variation->set_attributes([BG_RS_ATTR => $label]);
        }

        // Brings back a box that a previous, smaller box count had
        // unpublished — and publishes any variation stranded by the
        // save-order bug above.
        $variation->set_status('publish');

        if ($price !== '') {
            $variation->set_regular_price($price);
        }

        $variation->set_manage_stock(true);

        // Capacity is how many slots the box holds; stock is how many
        // are still unsold. Keeping capacity on the variation is what
        // makes "slots per box" mean something after the boxes exist:
        // without it the only readings available are current stock,
        // which shrinks as the box sells, and the product-level
        // setting, which is just a number in a field.
        //
        // Changing the setting therefore moves capacity by the
        // difference and leaves sold slots alone — raising 28 to 30
        // opens two more slots per box rather than either doing
        // nothing or putting sold slots back on sale.
        if ($is_new || $reset) {
            $variation->set_stock_quantity($slots);
            $variation->update_meta_data(BG_RS_CAP, $slots);
        } else {
            $capacity = (int) $variation->get_meta(BG_RS_CAP);
            if ($capacity < 1) {
                // Built before capacity was recorded: infer it, so the
                // first save after this change adopts the box rather
                // than mistaking sold slots for missing ones.
                $capacity = (int) $variation->get_stock_quantity() + (int) $variation->get_total_sales();
            }
            $delta = $slots - $capacity;
            if ($delta !== 0) {
                $variation->set_stock_quantity(max(0, (int) $variation->get_stock_quantity() + $delta));
            }
            $variation->update_meta_data(BG_RS_CAP, $slots);
        }
        // A box with no slots left is sold out, not hidden — buyers
        // should still see that it filled up.
        $variation->set_stock_status((int) $variation->get_stock_quantity() > 0 ? 'instock' : 'outofstock');
        $variation->save();
    }

    // Boxes removed from the count are unpublished rather than
    // deleted, so any order that already points at one keeps
    // resolving to a real variation.
    foreach ($existing as $label => $variation) {
        if (!in_array($label, $labels, true)) {
            $variation->set_status('private');
            $variation->save();
        }
    }

    WC_Product_Variable::sync($product_id);
    wc_delete_product_transients($product_id);
}

/* ─── Front end: the slot picker ─── */

/**
 * Renders the box grid. Echoes, to match bg_render_pcard.
 */
function bg_rs_render_picker($product) {
    $boxes = bg_rs_boxes($product);
    if (!$boxes) return;

    $slot_price = 0.0;
    foreach ($boxes as $b) {
        if ($b['price'] > 0) { $slot_price = $b['price']; break; }
    }
    $total_left = array_sum(wp_list_pluck($boxes, 'left'));
    ?>
    <form class="bg-rs" method="post" data-bg-rs
          data-slot-price="<?php echo esc_attr($slot_price); ?>"
          data-currency="<?php echo esc_attr(get_woocommerce_currency_symbol()); ?>">
        <?php wp_nonce_field('bg_rs_add', 'bg_rs_add_nonce'); ?>
        <input type="hidden" name="bg_rs_product" value="<?php echo esc_attr($product->get_id()); ?>" />

        <div class="bg-rs__head">
            <span class="bg-rs__title">Pick your slots</span>
            <span class="bg-rs__left-all"><?php echo (int) $total_left; ?> slots left across <?php echo count($boxes); ?> boxes</span>
        </div>

        <div class="bg-rs__grid">
            <?php foreach ($boxes as $vid => $box):
                $full = $box['left'] < 1;
                $taken = max(0, $box['total'] - $box['left']);
                $pct = $box['total'] > 0 ? round($taken / $box['total'] * 100) : 100;
                ?>
                <div class="bg-rs__box<?php echo $full ? ' bg-rs__box--full' : ''; ?>">
                    <div class="bg-rs__box-head">
                        <span class="bg-rs__box-name"><?php echo esc_html($box['label']); ?></span>
                        <span class="bg-rs__box-left">
                            <?php if ($full): ?>
                                Sold out
                            <?php else: ?>
                                <strong><?php echo (int) $box['left']; ?></strong> of <?php echo (int) $box['total']; ?> left
                            <?php endif; ?>
                        </span>
                    </div>

                    <div class="bg-rs__meter" aria-hidden="true">
                        <span class="bg-rs__meter-fill" style="width:<?php echo (int) $pct; ?>%"></span>
                    </div>

                    <?php if ($full): ?>
                        <div class="bg-rs__sold">Filled</div>
                    <?php else: ?>
                        <div class="bg-rs__qty">
                            <button type="button" class="bg-rs__step" data-bg-rs-step="-1" aria-label="One fewer slot from <?php echo esc_attr($box['label']); ?>">&minus;</button>
                            <input
                                type="number"
                                class="bg-rs__input"
                                name="bg_rs_qty[<?php echo esc_attr($vid); ?>]"
                                value="0"
                                min="0"
                                max="<?php echo (int) $box['left']; ?>"
                                step="1"
                                inputmode="numeric"
                                aria-label="Slots from <?php echo esc_attr($box['label']); ?>"
                            />
                            <button type="button" class="bg-rs__step" data-bg-rs-step="1" aria-label="One more slot from <?php echo esc_attr($box['label']); ?>">+</button>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="bg-rs__foot">
            <div class="bg-rs__summary">
                <span class="bg-rs__count" data-bg-rs-count>No slots selected</span>
                <span class="bg-rs__total" data-bg-rs-total></span>
            </div>
            <button type="submit" class="bg-rs__submit" data-bg-rs-submit disabled>Add slots to cart</button>
        </div>
    </form>
    <?php
}

/**
 * Handles the multi-box add. Runs before the page renders so a
 * successful add can redirect straight to the cart.
 */
add_action('template_redirect', function () {
    if (empty($_POST['bg_rs_add_nonce'])) return;
    if (!wp_verify_nonce($_POST['bg_rs_add_nonce'], 'bg_rs_add')) return;
    if (!function_exists('WC') || !WC()->cart) return;

    $product_id = absint($_POST['bg_rs_product'] ?? 0);
    $product = $product_id ? wc_get_product($product_id) : null;
    if (!$product || !bg_rs_is_break($product)) return;

    $wanted = (array) ($_POST['bg_rs_qty'] ?? []);
    $boxes = bg_rs_boxes($product);
    $added = 0;

    foreach ($wanted as $vid => $qty) {
        $vid = absint($vid);
        $qty = absint($qty);
        if (!$qty || !isset($boxes[$vid])) continue;

        $variation = wc_get_product($vid);
        if (!$variation instanceof WC_Product_Variation) continue;
        // Belt and braces: add_to_cart validates stock too, but
        // checking here keeps the notice specific to the box.
        if ($qty > $boxes[$vid]['left']) {
            wc_add_notice(sprintf(
                'Only %d slot(s) left in %s.',
                $boxes[$vid]['left'],
                $boxes[$vid]['label']
            ), 'error');
            continue;
        }

        $ok = WC()->cart->add_to_cart(
            $product_id,
            $qty,
            $vid,
            ['attribute_' . BG_RS_ATTR => $boxes[$vid]['label']]
        );
        if ($ok) $added += $qty;
    }

    if ($added > 0) {
        wc_add_notice(sprintf('%d slot(s) added to your cart.', $added), 'success');
        wp_safe_redirect(wc_get_cart_url());
        exit;
    }
});


/* ─── Assets ───
   Inlined rather than shipped as files so the whole feature stays a single
   drop-in .php, matching the other bg-* plugins. Only loaded on a product
   page that is actually a break, so the weight never reaches the catalogue.
   ============================================================ */

add_action('wp_enqueue_scripts', function () {
    if (!is_singular('product') || !function_exists('wc_get_product')) {
        return;
    }
    $product = wc_get_product(get_queried_object_id());
    if (!$product || !bg_rs_is_break($product)) {
        return;
    }

    wp_register_style('bg-rip-and-ship', false, [], '1.0');
    wp_enqueue_style('bg-rip-and-ship');
    wp_add_inline_style('bg-rip-and-ship', bg_rs_inline_css());

    wp_register_script('bg-rip-and-ship', '', [], '1.0', true);
    wp_enqueue_script('bg-rip-and-ship');
    wp_add_inline_script('bg-rip-and-ship', bg_rs_inline_js());
});

function bg_rs_inline_css() {
    return <<<'BGRSCSS'
/* ============================================================
   RIP & SHIP — slot picker
   Sits in the product page's buy column, so it borrows that
   column's width rather than setting its own. Boxes wrap into
   as many columns as fit; a break can be 2 boxes or 20.
   ============================================================ */
.bg-rs {
  margin: 4px 0 8px;
}
.bg-rs__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.bg-rs__title {
  font-family: var(--bg-font-sans, system-ui, -apple-system, sans-serif), -apple-system, sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: var(--bg-ink-deep, #1a0030);
}
.bg-rs__left-all {
  font-size: 12px;
  font-weight: 600;
  color: var(--bg-purple-700, #6b11a1);
}
.bg-rs__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.bg-rs__box {
  border: 2px solid var(--bg-purple-900, #350361);
  border-radius: 14px;
  background: #ffffff;
  padding: 10px 12px 12px;
}
.bg-rs__box--full {
  border-color: #e5e7eb;
  background: #fafafa;
}
.bg-rs__box-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.bg-rs__box-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--bg-ink-deep, #1a0030);
}
.bg-rs__box-left {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
}
.bg-rs__box-left strong {
  color: var(--bg-purple-700, #6b11a1);
  font-weight: 800;
}
.bg-rs__box--full .bg-rs__box-name,
.bg-rs__box--full .bg-rs__box-left {
  color: #9ca3af;
}

/* How full the box is. Reads as progress toward a full box, so it
   fills up as slots sell rather than draining. */
.bg-rs__meter {
  height: 5px;
  border-radius: 999px;
  background: var(--bg-purple-100, #f3e8ff);
  overflow: hidden;
  margin-bottom: 10px;
}
.bg-rs__meter-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--bg-purple-600, #9215ad), var(--bg-purple-400, #c084fc));
}
.bg-rs__box--full .bg-rs__meter { background: #e5e7eb; }
.bg-rs__box--full .bg-rs__meter-fill { background: #d1d5db; }

.bg-rs__qty {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bg-rs__step {
  width: 30px !important;
  height: 30px !important;
  min-height: 0 !important;
  padding: 0 !important;
  flex: 0 0 30px;
  border: 2px solid var(--bg-purple-900, #350361) !important;
  border-radius: 9px !important;
  background: #ffffff !important;
  color: var(--bg-purple-900, #350361) !important;
  font-size: 15px !important;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.bg-rs__step:hover {
  background: var(--bg-purple-900, #350361) !important;
  color: #ffffff !important;
}
.bg-rs__input {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  height: 30px;
  padding: 0 4px !important;
  text-align: center;
  border: 2px solid var(--bg-purple-900, #350361) !important;
  border-radius: 9px !important;
  background: #ffffff !important;
  color: var(--bg-ink-deep, #1a0030) !important;
  font-family: var(--bg-font-sans, system-ui, -apple-system, sans-serif), -apple-system, sans-serif;
  font-size: 14px !important;
  font-weight: 800;
}
/* The steppers are the intended control; the spinners crowd a
   30px field and land under the buyer's thumb on mobile. */
.bg-rs__input::-webkit-outer-spin-button,
.bg-rs__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.bg-rs__input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
.bg-rs__sold {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.bg-rs__foot {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.bg-rs__summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.bg-rs__count {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}
.bg-rs__total {
  font-family: var(--bg-font-sans, system-ui, -apple-system, sans-serif), -apple-system, sans-serif;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, #9215ad, #6b11a1, #a855f7);
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
}
.bg-rs__submit {
  flex: 1 1 200px;
  min-height: 48px !important;
  padding: 12px 24px !important;
  border: 2px solid var(--bg-purple-900, #350361) !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, var(--bg-gold-400, #fbbf24), var(--bg-gold-500, #f59e0b)) !important;
  color: var(--bg-ink-deep, #1a0030) !important;
  font-family: var(--bg-font-sans, system-ui, -apple-system, sans-serif), -apple-system, sans-serif;
  font-size: 14px !important;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.bg-rs__submit:hover:not([disabled]) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(53, 3, 97, 0.25);
}
.bg-rs__submit[disabled] {
  opacity: 0.45;
  cursor: default;
  transform: none;
}
BGRSCSS;
}

function bg_rs_inline_js() {
    return <<<'BGRSJS'
// ─── Rip & Ship slot picker ───
// Steppers and a running total over a plain form. The form posts
// and works without any of this; the script only saves the buyer
// from adding up slots in their head before they commit.
(function () {
    function initPickers() {
        document.querySelectorAll('[data-bg-rs]').forEach(function (form) {
            if (form.getAttribute('data-bg-rs-bound')) return;
            form.setAttribute('data-bg-rs-bound', '1');

            var price = parseFloat(form.getAttribute('data-slot-price')) || 0;
            var symbol = form.getAttribute('data-currency') || '';
            var countEl = form.querySelector('[data-bg-rs-count]');
            var totalEl = form.querySelector('[data-bg-rs-total]');
            var submit = form.querySelector('[data-bg-rs-submit]');

            function inputs() {
                return Array.prototype.slice.call(form.querySelectorAll('.bg-rs__input'));
            }

            function clamp(input) {
                var max = parseInt(input.getAttribute('max'), 10);
                var val = parseInt(input.value, 10);
                if (isNaN(val) || val < 0) val = 0;
                if (!isNaN(max) && val > max) val = max;
                input.value = val;
                return val;
            }

            function refresh() {
                var slots = inputs().reduce(function (sum, i) { return sum + clamp(i); }, 0);

                if (countEl) {
                    countEl.textContent = slots
                        ? slots + (slots === 1 ? ' slot selected' : ' slots selected')
                        : 'No slots selected';
                }
                if (totalEl) {
                    totalEl.textContent = (slots && price)
                        ? symbol + (slots * price).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                          })
                        : '';
                }
                if (submit) submit.disabled = slots < 1;
            }

            form.addEventListener('click', function (e) {
                var step = e.target.closest ? e.target.closest('[data-bg-rs-step]') : null;
                if (!step) return;
                e.preventDefault();
                var box = step.closest('.bg-rs__box');
                var input = box && box.querySelector('.bg-rs__input');
                if (!input) return;
                input.value = (parseInt(input.value, 10) || 0) + parseInt(step.getAttribute('data-bg-rs-step'), 10);
                refresh();
            });

            form.addEventListener('input', function (e) {
                if (e.target.classList.contains('bg-rs__input')) refresh();
            });

            refresh();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPickers);
    } else {
        initPickers();
    }
    window.addEventListener('load', initPickers);
})();
BGRSJS;
}

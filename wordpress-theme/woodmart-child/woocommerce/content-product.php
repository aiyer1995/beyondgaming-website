<?php
/**
 * Product loop item — shop, category and search archives.
 *
 * Overrides Woodmart's version so every listing on the site renders
 * the same .bg-pcard used by [bg_new_arrivals] and the related-
 * products grid, instead of Woodmart's default loop card.
 *
 * The outer wrapper deliberately keeps Woodmart's own classes
 * (wd-product, wd-col, product-grid-item) and the data-id/data-loop
 * attributes: the grid layout comes from CSS custom properties set
 * on the .wd-products container and applied through .wd-col, and
 * Woodmart's AJAX pagination and filter scripts look products up by
 * those hooks. Only the card inside is ours. style.css strips the
 * parent's own card chrome from any wrapper containing a .bg-pcard
 * so the two don't stack into a card-inside-a-card.
 *
 * To revert to Woodmart's card, delete this file.
 *
 * @see bg_render_pcard() in functions.php
 */

defined('ABSPATH') || exit;

global $product, $woocommerce_loop;

if (!$product || !$product->is_visible()) {
    return;
}

// If the child theme is ever active without functions.php loading —
// or someone copies this template elsewhere — fall back to the
// parent's card rather than rendering an empty grid cell.
if (!function_exists('bg_render_pcard')) {
    wc_get_template('content-product.php');
    return;
}

$loop_index = isset($woocommerce_loop['loop']) ? (int) $woocommerce_loop['loop'] : 0;

// Archives run 2-up on mobile, 3-up on tablet and 4-up on desktop,
// matching .bg-new-arrivals-grid, so the same sizes hint applies.
?>
<div <?php wc_product_class('wd-product wd-col product-grid-item bg-pcard-cell', $product); ?>
     data-loop="<?php echo esc_attr($loop_index); ?>"
     data-id="<?php echo esc_attr($product->get_id()); ?>">
    <?php bg_render_pcard($product); ?>
</div>

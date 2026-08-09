/**
 * Beyond Gaming — Woodmart Child Theme
 * Light client-side enhancements that match the Next.js storefront feel.
 *
 * Keep this file small. Heavy interactivity should be done as Alpine.js
 * components inline in templates, not here.
 */

(function () {
    'use strict';

    // Sentinel flag — set to true at the very top of the IIFE
    // so we can verify in DevTools console that bg-custom.js
    // actually executed without throwing a syntax error.
    // Test in console: window.BG_CUSTOM_LOADED
    window.BG_CUSTOM_LOADED = true;

    // ─── 0d. Title-case the header menu items ───
    // Menu items are stored uppercase in WordPress (POKEMON,
    // ONE PIECE, etc) but the design wants Title Case (Pokemon,
    // One Piece). CSS text-transform can't convert uppercase
    // to title case, so we rewrite the text content directly.
    function titleCaseHeaderMenu() {
        var menuLinks = document.querySelectorAll(
            '[class*="whb"] .whb-header-bottom .menu-item > a, ' +
            '[class*="whb"] .wd-header-main-nav .menu-item > a, ' +
            '[class*="wd-header"] .menu-item > a'
        );
        menuLinks.forEach(function (link) {
            var titleEl =
                link.querySelector('.menu-item-title') ||
                link.querySelector('.nav-link-text') ||
                link;
            // Walk only direct text-bearing leaf if it's the link itself
            var textTarget = titleEl;
            if (titleEl === link) {
                // Find the first text node child
                for (var i = 0; i < link.childNodes.length; i++) {
                    var n = link.childNodes[i];
                    if (
                        n.nodeType === Node.TEXT_NODE &&
                        n.textContent.trim().length > 0
                    ) {
                        textTarget = n;
                        break;
                    }
                }
            }
            var originalText = (textTarget.textContent || '').trim();
            if (!originalText) return;
            // Only convert if text is fully uppercase (skip already-styled items)
            if (originalText !== originalText.toUpperCase()) return;
            var titleCase = originalText
                .toLowerCase()
                .replace(/\b\w/g, function (c) {
                    return c.toUpperCase();
                });
            textTarget.textContent = titleCase;
        });
    }
    document.addEventListener('DOMContentLoaded', titleCaseHeaderMenu);
    window.addEventListener('load', titleCaseHeaderMenu);

    // ─── 0c. Hide the text label next to the account icon ───
    // Hides BOTH the logged-out label ("LOGIN / REGISTER") and
    // the logged-in label ("MY ACCOUNT" / "Hello, Name") in the
    // account icon area. Scoped to .wd-header-account / .wd-account
    // / .wd-tools-account ONLY — does NOT touch the navigation
    // menu, so a "My Account" menu item stays visible until the
    // user removes it manually in WP admin.
    //
    // Two-pass approach so we catch labels in any HTML shape:
    //   Pass 1: hide element wrappers (span/a/div) whose text matches
    //   Pass 2: walk raw text nodes and clear matching ones (catches
    //           direct text node children of <a> with no wrapping span)
    function hideHeaderAccountText() {
        var HIDE_LABELS = [
            'login / register',
            'login/register',
            'login',
            'register',
            'my account',
            'my-account',
            'account',
            'sign in',
            'sign up',
            'sign in / sign up'
        ];
        var GREETING_RE = /^(hello|hi|welcome)[\s,]/i;
        function isHidable(text) {
            return HIDE_LABELS.indexOf(text) !== -1 || GREETING_RE.test(text);
        }
        function containsIcon(el) {
            return !!el.querySelector(
                'svg, i, img, .wd-tools-icon, [class*="icon"]'
            );
        }

        var scopes = document.querySelectorAll(
            '[class*="wd-header-account"], [class*="wd-account"], .wd-tools-account, .wd-tools-element.wd-account'
        );

        scopes.forEach(function (scope) {
            // ── Pass 1: hide wrapper elements whose text matches ──
            var elements = scope.querySelectorAll(
                'span, a, div, p, h1, h2, h3, h4, h5, h6, label, em, strong, button'
            );
            elements.forEach(function (el) {
                if (el.classList.contains('wd-tools-icon')) return;
                if (containsIcon(el)) return; // don't hide the parent of the icon
                var text = (el.textContent || '').trim().toLowerCase();
                if (isHidable(text)) {
                    el.style.setProperty('display', 'none', 'important');
                }
            });

            // ── Pass 2: clear raw text nodes (catches text directly
            // inside <a> with no wrapping element) ──
            if (typeof document.createTreeWalker === 'function') {
                var walker = document.createTreeWalker(
                    scope,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                var node;
                var toClear = [];
                while ((node = walker.nextNode())) {
                    var nodeText = (node.textContent || '').trim().toLowerCase();
                    if (isHidable(nodeText)) {
                        toClear.push(node);
                    }
                }
                toClear.forEach(function (n) {
                    n.textContent = '';
                });
            }
        });
    }
    document.addEventListener('DOMContentLoaded', hideHeaderAccountText);
    window.addEventListener('load', hideHeaderAccountText);
    setTimeout(hideHeaderAccountText, 500);
    setTimeout(hideHeaderAccountText, 1500);

    // ─── 0a. Eliminate the white gap between the header and a page heading ───
    // Woodmart + Elementor wrap the page content in several layers, each
    // of which can contribute its own top padding/margin. Walk up the DOM
    // from a target element and zero any positive top spacing on every
    // ancestor until we hit <body>. Bulletproof regardless of which
    // wrapper class the gap actually comes from.
    //
    // Used for the homepage hero (.bg-hero) AND for the cart, checkout
    // and my-account headings (.bg-cart-heading / .bg-checkout-heading /
    // .bg-account-heading) which all suffer from the same Woodmart
    // wrapper-padding problem.
    function nukeTopGap(target) {
        if (!target) return;
        var el = target.parentElement;
        while (el && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
            var cs = window.getComputedStyle(el);
            if (parseFloat(cs.paddingTop) > 0) {
                el.style.setProperty('padding-top', '0', 'important');
            }
            if (parseFloat(cs.marginTop) > 0) {
                el.style.setProperty('margin-top', '0', 'important');
            }
            el = el.parentElement;
        }
        // Also zero any space *before* the target contributed by
        // previous siblings (page title bars, breadcrumb wrappers,
        // empty Elementor sections, etc.)
        var prev = target.previousElementSibling;
        while (prev) {
            var pcs = window.getComputedStyle(prev);
            if (
                prev.offsetHeight === 0 ||
                pcs.display === 'none' ||
                prev.textContent.trim() === ''
            ) {
                prev.style.setProperty('display', 'none', 'important');
            }
            prev = prev.previousElementSibling;
        }
    }

    function nukeAllTopGaps() {
        // Homepage hero
        nukeTopGap(document.querySelector('.bg-hero'));
        // Cart / checkout / account headings — all use the same
        // .bg-section-heading + page-specific class pattern.
        nukeTopGap(document.querySelector('.bg-cart-heading'));
        nukeTopGap(document.querySelector('.bg-checkout-heading'));
        nukeTopGap(document.querySelector('.bg-account-heading'));
    }
    document.addEventListener('DOMContentLoaded', nukeAllTopGaps);
    // Run again after Elementor finishes hydrating in case it injects
    // wrappers on top of the static markup.
    window.addEventListener('load', nukeAllTopGaps);

    // ─── 0b. Force the sticky header to keep the dark gradient ───
    // Woodmart's "Sticky Header on Scroll" creates / promotes an
    // element to position:fixed when scrolled. Class names vary
    // by Woodmart version — instead of guessing, walk the DOM on
    // scroll and apply inline styles to anything that looks like
    // a sticky header.
    //
    // EXCEPTION: .whb-header-bottom is also a sticky row but it's
    // the WHITE menu row, not the dark main header. Skip it from
    // the dark paint and explicitly paint it white instead.
    var BG_HEADER_GRADIENT =
        'linear-gradient(to right, #1a0030 0%, #350361 50%, #4a0e7a 100%)';
    function paintStickyHeader() {
        var candidates = document.querySelectorAll(
            '.whb-clone, .whb-sticked, [class*="whb-sticked"], [class*="whb-clone"], [class*="whb-sticky"], [class*="wd-header-sticked"], [class*="wd-header-clone"]'
        );
        candidates.forEach(function (el) {
            // Skip the white menu row — handled below
            if (el.classList.contains('whb-header-bottom')) return;
            el.style.setProperty('background', BG_HEADER_GRADIENT, 'important');
            el.style.setProperty('background-color', '#1a0030', 'important');
            el.style.setProperty('background-image', BG_HEADER_GRADIENT, 'important');
            el.style.setProperty('border-bottom', '2px solid #fbbf24', 'important');
            el.style.setProperty('box-shadow', '0 4px 24px rgba(0,0,0,0.25)', 'important');
            // Inner rows transparent so the gradient shows through
            el.querySelectorAll(
                '.whb-row, .whb-flex-row, .whb-flex, .whb-main-header, .whb-top-bar'
            ).forEach(function (inner) {
                if (inner.classList.contains('whb-header-bottom')) return;
                inner.style.setProperty('background', 'transparent', 'important');
                inner.style.setProperty('background-color', 'transparent', 'important');
                inner.style.setProperty('background-image', 'none', 'important');
            });
        });

        // ─── Paint the .whb-header-bottom row ───
        // This needs to use inline styles with !important to beat
        // any inline style left over from a previous paint pass.
        //
        // Desktop: white, because the row is the nav strip.
        // Mobile: the nav column is hidden and the row carries only
        // the search field, so white would leave a band stranded
        // between the purple header and the purple hero. It takes
        // the header gradient there instead.
        //
        // Note this runs at all, and with 'important', so it beats
        // the matching stylesheet rules — the CSS alone cannot fix
        // the mobile colour while this function paints over it.
        var bgBottomMobile = window.matchMedia('(max-width: 1023px)').matches;
        document.querySelectorAll('.whb-header-bottom').forEach(function (row) {
            if (bgBottomMobile) {
                row.style.setProperty('background', BG_HEADER_GRADIENT, 'important');
                row.style.setProperty('background-color', '#350361', 'important');
                row.style.setProperty('background-image', BG_HEADER_GRADIENT, 'important');
                row.style.setProperty('border-bottom', '0', 'important');
            } else {
                row.style.setProperty('background', '#ffffff', 'important');
                row.style.setProperty('background-color', '#ffffff', 'important');
                row.style.setProperty('background-image', 'none', 'important');
                row.style.setProperty(
                    'border-bottom',
                    '1px solid rgba(0,0,0,0.06)',
                    'important'
                );
            }
            row.style.setProperty('border-top', '0', 'important');
            row.style.setProperty('box-shadow', 'none', 'important');
            // Inner row container transparent so the white shows through
            row.querySelectorAll(
                '.whb-flex-row, .whb-flex, .whb-header-bottom-inner, .container'
            ).forEach(function (inner) {
                inner.style.setProperty('background', 'transparent', 'important');
                inner.style.setProperty('background-color', 'transparent', 'important');
                inner.style.setProperty('background-image', 'none', 'important');
            });
        });
    }
    document.addEventListener('DOMContentLoaded', paintStickyHeader);
    window.addEventListener('load', paintStickyHeader);
    window.addEventListener('scroll', paintStickyHeader, { passive: true });
    // Crossing the 1024px breakpoint (rotation, desktop resize) flips
    // the header-bottom row between white and gradient, so repaint.
    window.addEventListener('resize', paintStickyHeader, { passive: true });

    // Also watch for the sticky header being added to the DOM after
    // scroll (Woodmart sometimes injects it lazily)
    if ('MutationObserver' in window) {
        var mo = new MutationObserver(paintStickyHeader);
        mo.observe(document.body, { childList: true, subtree: true });
    }

    // ─── 0. Hide unwanted footer widgets by heading text ───
    // Demo-content widgets (e.g. "Our Stores" with fake US cities) that
    // can't easily be removed via the footer builder. Add more titles to
    // the array as needed; matching is case-insensitive.
    var HIDE_FOOTER_WIDGETS_BY_TITLE = ['our stores', 'our store'];
    document.addEventListener('DOMContentLoaded', function () {
        var scopes = document.querySelectorAll(
            'footer, .site-footer, .footer-container, .elementor-location-footer'
        );
        scopes.forEach(function (scope) {
            var headings = scope.querySelectorAll(
                'h1, h2, h3, h4, h5, h6, .widget-title, .elementor-heading-title'
            );
            headings.forEach(function (h) {
                var text = (h.textContent || '').trim().toLowerCase();
                if (HIDE_FOOTER_WIDGETS_BY_TITLE.indexOf(text) === -1) return;
                var container =
                    h.closest('.elementor-widget') ||
                    h.closest('.elementor-column') ||
                    h.closest('.widget') ||
                    h.parentElement;
                if (container) container.style.display = 'none';
            });
        });
    });

    // ─── Mobile hamburger menu — custom fallback ───
    // Woodmart 7.x's mobileNavigation.min.js fails to bind a
    // click handler to .wd-header-mobile-nav on this site (the
    // dropdown panel element is never created in the DOM, so
    // there's no Woodmart menu element to toggle).
    //
    // Workaround: the child theme renders an independent slide-
    // in panel via wp_footer (#bg-mobile-menu in functions.php),
    // and this handler toggles a single body class to show it.
    // CSS in style.css section 17 controls the slide animation.
    function toggleBgMobileMenu(force) {
        var willOpen =
            typeof force === 'boolean'
                ? force
                : !document.body.classList.contains('bg-mobile-menu-open');
        document.body.classList.toggle('bg-mobile-menu-open', willOpen);
        var menu = document.getElementById('bg-mobile-menu');
        if (menu) {
            menu.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
        }
    }

    document.addEventListener(
        'click',
        function (e) {
            // Open: any click on the hamburger button
            var openBtn = e.target.closest(
                '.wd-header-mobile-nav > a, .wd-header-mobile-nav a'
            );
            if (openBtn) {
                e.preventDefault();
                e.stopPropagation();
                toggleBgMobileMenu();
                return;
            }
            // Close: backdrop, close button, or any link INSIDE
            // the menu panel (so tapping a nav item closes the
            // menu after navigation triggers).
            var closeEl = e.target.closest('[data-bg-mobile-menu-close]');
            if (closeEl) {
                e.preventDefault();
                toggleBgMobileMenu(false);
                return;
            }
            var menuLink = e.target.closest('#bg-mobile-menu a[href]');
            if (menuLink) {
                toggleBgMobileMenu(false);
            }
        },
        true
    );

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('bg-mobile-menu-open')) {
            toggleBgMobileMenu(false);
        }
    });

    // ─── Helper: is this link a UI toggle (menu, dropdown,
    // off-canvas, etc.) rather than a real navigation link? ───
    // Used by both the smooth-scroll handler AND the view
    // transitions handler so we don't hijack clicks meant for
    // Woodmart's mobile menu, account dropdown, search modal,
    // side cart, etc.
    function isToggleLink(link) {
        const rawHref = link.getAttribute('href');
        if (!rawHref || rawHref === '#') return true;
        if (rawHref.toLowerCase().indexOf('javascript:') === 0) return true;
        if (link.getAttribute('role') === 'button') return true;
        if (link.hasAttribute('data-toggle')) return true;
        if (link.hasAttribute('data-bs-toggle')) return true;
        if (link.hasAttribute('data-opener')) return true;
        if (link.hasAttribute('aria-haspopup')) return true;
        if (link.hasAttribute('aria-controls')) return true;
        // WooCommerce add-to-cart buttons — these are <a> elements
        // with href="?add-to-cart=ID" that WC's AJAX handler
        // intercepts. If our view-transitions handler runs first,
        // it navigates with a transition instead of letting WC
        // do the AJAX add, which breaks the cart functionality.
        if (
            link.classList.contains('add_to_cart_button') ||
            link.classList.contains('ajax_add_to_cart') ||
            link.classList.contains('single_add_to_cart_button') ||
            link.classList.contains('product_type_simple') ||
            (rawHref && rawHref.indexOf('add-to-cart') !== -1)
        ) {
            return true;
        }
        // Woodmart-specific tool/menu/off-canvas classes
        if (
            link.matches(
                '.wd-tools-icon, .wd-tool, [class*="wd-tool"], ' +
                '[class*="mobile-menu"], [class*="mobile-nav"], ' +
                '[class*="off-canvas"], [class*="side-hidden"], ' +
                '[class*="opener"], [class*="trigger"]'
            )
        ) {
            return true;
        }
        if (
            link.closest(
                '.wd-tools, [class*="wd-tools"], .whb-tools, [class*="whb-tools"], ' +
                '.wd-header, .whb-header, [class*="wd-header"], [class*="whb-header"]'
            )
        ) {
            // Inside a header tools / icons area — almost always a
            // UI toggle, not a navigation link.
            return true;
        }
        return false;
    }

    // ─── 1. Smooth in-page scrolling ───
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        if (isToggleLink(link)) return;
        const id = link.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ─── 2. Reveal-on-scroll for elements with .reveal-on-scroll ───
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-slide-up');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        document
            .querySelectorAll('.reveal-on-scroll')
            .forEach((el) => io.observe(el));
    }

    // ─── 2e. Pin checkout error notices to the top of the form ───
    // WooCommerce by default renders validation errors INSIDE
    // the customer_details column (or wherever wc_print_notices
    // happens to fire), which on a 2-column checkout layout
    // tucks them between the billing fields and the place-order
    // button — easy to miss. Move them to the very top of the
    // form so the user sees them immediately on submission.
    //
    // WC fires the `checkout_error` event on document.body via
    // jQuery after every failed AJAX checkout submission, so we
    // hook into that to relocate AND scroll into view.
    function bgPinCheckoutNoticesToTop() {
        if (typeof window.jQuery === 'undefined') return;
        if (!document.body.classList.contains('woocommerce-checkout')) return;
        var $ = window.jQuery;
        $(document.body).on('checkout_error', function () {
            var $form = $('form.checkout');
            if (!$form.length) return;
            // WC wraps validation errors in .woocommerce-NoticeGroup-checkout
            // — grab that wrapper if it exists, else fall back to
            // any standalone error/info/message element.
            var $notice = $form
                .find('.woocommerce-NoticeGroup-checkout, .woocommerce-NoticeGroup')
                .first();
            if (!$notice.length) {
                $notice = $form
                    .find('> ul.woocommerce-error, > .woocommerce-error, > .woocommerce-message, > .woocommerce-info')
                    .first();
            }
            if (!$notice.length) {
                $notice = $form
                    .find('ul.woocommerce-error, .woocommerce-error')
                    .first();
            }
            if (!$notice.length) return;
            // Move it to be the FIRST child of the form (it
            // becomes a direct grid item there, so the CSS
            // grid-column: 1 / -1 rule kicks in).
            $form.prepend($notice);
            // Smooth-scroll the user up to the notice.
            $('html, body').animate(
                { scrollTop: $notice.offset().top - 80 },
                300
            );
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bgPinCheckoutNoticesToTop);
    } else {
        bgPinCheckoutNoticesToTop();
    }

    // ─── 2d. Pin the mobile bottom bar to <body> ───
    // wp_footer renders the bottom bar inside whatever wrapper
    // the theme has open at that point (Woodmart uses
    // `.website-wrapper` which has transform/filter set on it
    // for animations). Any transformed ancestor creates a new
    // containing block for `position: fixed` children, which
    // means our `bottom: 0` ends up relative to that ancestor
    // instead of the viewport — and the bar floats halfway up
    // the page with content visible below it.
    //
    // The reliable fix is to move the bar to be a DIRECT child
    // of <body>, escaping any transformed ancestor entirely.
    function pinBottomBarToBody() {
        var bar = document.querySelector('.bg-bottom-bar');
        if (!bar) return;
        if (bar.parentNode === document.body) return;
        document.body.appendChild(bar);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', pinBottomBarToBody);
    } else {
        pinBottomBarToBody();
    }
    window.addEventListener('load', pinBottomBarToBody);

    // Same trick for the mobile menu drawer — it's also
    // position: fixed and breaks for the same reason if it
    // ends up nested under a transformed ancestor.
    function pinMobileMenuToBody() {
        var menu = document.getElementById('bg-mobile-menu');
        if (!menu) return;
        if (menu.parentNode === document.body) return;
        document.body.appendChild(menu);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', pinMobileMenuToBody);
    } else {
        pinMobileMenuToBody();
    }
    window.addEventListener('load', pinMobileMenuToBody);

    // ─── 2da. Login/Register CTA swap ───
    // On the logged-out my-account page, replace the default
    // WooCommerce register form HTML in .u-column2 with a
    // friendly "Don't have an account yet? Register" CTA.
    // Clicking "Register" reveals the original form so the
    // user can actually fill it out and submit.
    function bgInitLoginRegisterCTA() {
        if (!document.body.classList.contains('woocommerce-account')) return;
        if (document.body.classList.contains('logged-in')) return;
        var col2 = document.querySelector('.u-column2.col-2, .col-2.u-column2, .u-column2, .col-2');
        if (!col2 || col2.dataset.bgRegisterCtaInited) return;
        col2.dataset.bgRegisterCtaInited = '1';

        // Stash and hide the original children (the WC h2
        // "Register" + the description paragraph + the form).
        var originalChildren = Array.from(col2.children);
        originalChildren.forEach(function (c) {
            c.style.display = 'none';
        });

        // Build and inject the CTA
        var cta = document.createElement('div');
        cta.className = 'bg-register-cta';
        var lead = document.createElement('p');
        lead.className = 'bg-register-cta__lead';
        lead.textContent = "Don't have an account yet?";
        var link = document.createElement('a');
        link.className = 'bg-register-cta__link';
        link.href = '#bg-register';
        link.setAttribute('role', 'button');
        link.textContent = 'Register';
        cta.appendChild(lead);
        cta.appendChild(link);
        col2.appendChild(cta);

        // Click "Register" → hide CTA, show original form
        link.addEventListener('click', function (e) {
            e.preventDefault();
            cta.style.display = 'none';
            originalChildren.forEach(function (c) {
                c.style.removeProperty('display');
            });
            // Scroll to the now-revealed form on mobile
            var firstInput = col2.querySelector('form input[type="email"], form input[type="text"]');
            if (firstInput) {
                try { firstInput.focus({ preventScroll: false }); } catch (e2) {}
            }
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bgInitLoginRegisterCTA);
    } else {
        bgInitLoginRegisterCTA();
    }

    // ─── 2db. Sticky mobile header ───
    // Pin Woodmart's .whb-main-header wrapper to the top of
    // the viewport on scroll. The body gets a `bg-stuck-header`
    // class for layout, but the dark purple gradient background
    // is applied via JS as an inline style with !important
    // (highest possible specificity) — this is necessary
    // because Woodmart pastes its own `background: none
    // transparent !important` inline style on the same element,
    // which would beat any external CSS rule.
    //
    // Mobile only (≤1024px). On desktop the body class is
    // never added so the desktop header behaves normally.
    // Inject a sibling background layer that sits BEHIND the
    // (transparent) Woodmart header. This bypasses Woodmart's
    // inline `background: none transparent !important` entirely
    // — instead of fighting the cascade, we just paint a
    // gradient layer one z-index below the header. The header
    // itself stays transparent and Woodmart's content (logo,
    // hamburger, cart) renders on top of our gradient layer.
    function bgEnsureStuckHeaderBg() {
        var existing = document.getElementById('bg-stuck-header-bg');
        if (existing) return existing;
        var layer = document.createElement('div');
        layer.id = 'bg-stuck-header-bg';
        layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
        return layer;
    }

    function bgUpdateStickyHeader() {
        var isMobile = window.innerWidth <= 1024;
        var header = document.querySelector('.whb-main-header');
        if (!header) return;

        var layer = bgEnsureStuckHeaderBg();

        if (!isMobile) {
            // Desktop: remove the class, padding compensation,
            // and hide the bg layer.
            if (document.body.classList.contains('bg-stuck-header')) {
                document.body.classList.remove('bg-stuck-header');
                document.body.style.removeProperty('padding-top');
            }
            layer.style.display = 'none';
            return;
        }

        var threshold = 60; // px scroll before sticking
        var scrolled = (window.pageYOffset || document.documentElement.scrollTop || 0) > threshold;

        if (scrolled) {
            // Measure the header height so the bg layer matches
            // and the body padding-top compensates exactly.
            var h = header.offsetHeight || 64;
            if (!document.body.classList.contains('bg-stuck-header')) {
                document.body.style.paddingTop = h + 'px';
                document.body.classList.add('bg-stuck-header');
            }
            layer.style.display = 'block';
            layer.style.height = h + 'px';
        } else {
            if (document.body.classList.contains('bg-stuck-header')) {
                document.body.classList.remove('bg-stuck-header');
                document.body.style.removeProperty('padding-top');
            }
            layer.style.display = 'none';
        }
    }

    // rAF-throttled scroll handler so the function runs at most
    // once per animation frame, regardless of how many scroll
    // events Chrome mobile fires during URL bar transitions.
    var bgStickyTicking = false;
    function bgRequestStickyUpdate() {
        if (bgStickyTicking) return;
        bgStickyTicking = true;
        window.requestAnimationFrame(function () {
            bgUpdateStickyHeader();
            bgStickyTicking = false;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bgUpdateStickyHeader);
    } else {
        bgUpdateStickyHeader();
    }
    window.addEventListener('load', bgUpdateStickyHeader);
    window.addEventListener('scroll', bgRequestStickyUpdate, { passive: true });
    window.addEventListener('resize', bgRequestStickyUpdate, { passive: true });
    // Also listen to the visualViewport API which fires more
    // accurately on Chrome mobile when the URL bar collapses /
    // expands. Without this, position: fixed lags during the
    // transition and can flicker.
    if (window.visualViewport) {
        window.visualViewport.addEventListener('scroll', bgRequestStickyUpdate, { passive: true });
        window.visualViewport.addEventListener('resize', bgRequestStickyUpdate, { passive: true });
    }

    // ─── 2c. Place the simple mobile hero right before .bg-hero ───
    // The mobile hero is rendered via wp_footer with display:none
    // so it's available in the DOM regardless of theme template.
    // We move it to be a sibling immediately before the existing
    // .bg-hero, then drop the inline display:none so the CSS
    // media query (style.css section 18) can take over to show
    // it only on mobile. CSS also hides .bg-hero on mobile so
    // the two never overlap.
    function placeMobileHero() {
        if (!document.body.classList.contains('home')) return;
        var mobileHero = document.getElementById('bg-hero-mobile');
        if (!mobileHero) return;
        var existingHero = document.querySelector('.bg-hero');
        if (!existingHero) {
            // No desktop hero on this template — leave the mobile
            // hero hidden in the footer rather than risk inserting
            // it somewhere unexpected.
            return;
        }
        if (existingHero.previousElementSibling !== mobileHero) {
            existingHero.parentNode.insertBefore(mobileHero, existingHero);
        }
        mobileHero.style.removeProperty('display');
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', placeMobileHero);
    } else {
        placeMobileHero();
    }
    window.addEventListener('load', placeMobileHero);

    // ─── 2b. Move the my-account heading to the top of the
    // .woocommerce wrapper. Woodmart's account template fires
    // woocommerce_before_my_account INSIDE the content area
    // (not before the wrapper as standard WC does), so the
    // heading lands as a child of .woocommerce-MyAccount-content.
    // Move it to be a direct child of .woocommerce so the grid
    // layout can place it at row 1, full width.
    function moveAccountHeading() {
        if (!document.body.classList.contains('woocommerce-account')) return;
        var heading = document.querySelector('.bg-account-heading');
        var wrapper = document.querySelector('.woocommerce-account .woocommerce');
        if (!heading || !wrapper) return;
        if (heading.parentElement === wrapper) return;
        wrapper.insertBefore(heading, wrapper.firstChild);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', moveAccountHeading);
    } else {
        moveAccountHeading();
    }

    // ─── 3. View Transitions API for smoother in-site nav ───
    // Browsers that support it get app-like transitions on full page
    // loads. Browsers that don't fall back to normal navigation.
    if (
        'startViewTransition' in document &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a[href]');
            if (!link) return;

            // Skip UI toggles (hamburger, account dropdown,
            // off-canvas menus, etc.) — same skip list as the
            // smooth-scroll handler. Without this, view-transitions
            // hijacks clicks on Woodmart's tool icons and reloads
            // the page instead of letting them open.
            if (isToggleLink(link)) return;

            // Skip pure hash links (anchors to the same page)
            const rawHref = link.getAttribute('href');
            if (rawHref && rawHref.charAt(0) === '#') return;

            const url = new URL(link.href, window.location.href);
            // Only handle same-origin, in-site nav, and skip new-tab clicks
            if (url.origin !== window.location.origin) return;
            if (link.target === '_blank') return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (link.hasAttribute('download')) return;
            if (url.pathname === window.location.pathname && url.hash) return;

            e.preventDefault();
            document.startViewTransition(() => {
                window.location.href = link.href;
            });
        });
    }

    // ─── RIP IT LIVE — place the live-events panels + close ───
    // functions.php renders two containers in the footer:
    //   #bg-riplive-float  → moved to be the last child of .bg-hero
    //                        (positioned right via CSS, desktop only)
    //   #bg-riplive-mobile → moved right after #bg-hero-mobile
    //                        (full-width section, mobile only)
    // The ✕ hides both for the browser session (sessionStorage).
    (function () {
        var DISMISS_KEY = 'bgRipLiveDismissed';

        function isDismissed() {
            try { return sessionStorage.getItem(DISMISS_KEY) === '1'; }
            catch (e) { return false; }
        }
        function setDismissed() {
            try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
        }

        function placeRipLive() {
            if (!document.body.classList.contains('home')) return;

            var floatEl = document.getElementById('bg-riplive-float');
            var mobileEl = document.getElementById('bg-riplive-mobile');
            var hero = document.querySelector('.bg-hero');
            var mobileHero = document.getElementById('bg-hero-mobile');

            // Desktop card → last child of the hero (hero is position:relative)
            if (floatEl && hero && floatEl.parentNode !== hero) {
                hero.appendChild(floatEl);
            }
            // Mobile section → right after the mobile hero (fallback: after .bg-hero)
            if (mobileEl) {
                var ref = mobileHero || hero;
                if (ref && ref.nextElementSibling !== mobileEl) {
                    ref.parentNode.insertBefore(mobileEl, ref.nextElementSibling);
                }
            }

            if (isDismissed()) {
                if (floatEl) floatEl.classList.add('is-dismissed');
                if (mobileEl) mobileEl.classList.add('is-dismissed');
            }
        }

        function hideAll() {
            setDismissed();
            var floatEl = document.getElementById('bg-riplive-float');
            var mobileEl = document.getElementById('bg-riplive-mobile');
            if (floatEl) floatEl.classList.add('is-dismissed');
            if (mobileEl) mobileEl.classList.add('is-dismissed');
        }

        // Event-delegated close so it works after DOM moves.
        document.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.bg-riplive__close') : null;
            if (!btn) return;
            e.preventDefault();
            hideAll();
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', placeRipLive);
        } else {
            placeRipLive();
        }
        window.addEventListener('load', placeRipLive);
    })();

    // ─── Product carousel arrows ───
    // Progressive enhancement over a natively scrolling track: the
    // row already swipes without this, so the arrows only appear
    // once we can confirm there is something to scroll to. That
    // check has to re-run after images load, because until they do
    // the track's scrollWidth is too small to overflow.
    (function () {
        function initCarousels() {
            var roots = document.querySelectorAll('[data-bg-carousel]');
            roots.forEach(function (root) {
                var track = root.querySelector('.bg-carousel__track');
                var prev = root.querySelector('.bg-carousel__nav--prev');
                var next = root.querySelector('.bg-carousel__nav--next');
                if (!track || !prev || !next) return;

                function step() {
                    // One trackful, less a sliver, so the card at the
                    // seam stays partly visible as a scroll affordance.
                    return Math.max(track.clientWidth - 48, 160);
                }

                // Both ends wrap rather than dead-ending, so neither
                // arrow is ever a no-op: pressing back from the first
                // card rewinds to the last, and forward from the end
                // returns to the start.
                function go(dir) {
                    var behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                        ? 'auto'
                        : 'smooth';
                    var max = track.scrollWidth - track.clientWidth;
                    // 2px of slack for sub-pixel scroll positions, which
                    // rarely land exactly on 0 or on max.
                    var atStart = track.scrollLeft <= 2;
                    var atEnd = track.scrollLeft >= max - 2;

                    if (dir < 0 && atStart) {
                        track.scrollTo({ left: max, behavior: behavior });
                    } else if (dir > 0 && atEnd) {
                        track.scrollTo({ left: 0, behavior: behavior });
                    } else {
                        track.scrollBy({ left: dir * step(), behavior: behavior });
                    }
                }

                function sync() {
                    // 4px of slack absorbs sub-pixel layout rounding,
                    // which would otherwise report a phantom overflow.
                    var overflows = track.scrollWidth - track.clientWidth > 4;
                    prev.hidden = !overflows;
                    next.hidden = !overflows;
                }

                if (!root.getAttribute('data-bg-carousel-bound')) {
                    prev.addEventListener('click', function () { go(-1); });
                    next.addEventListener('click', function () { go(1); });
                    window.addEventListener('resize', sync, { passive: true });
                    track.querySelectorAll('img').forEach(function (img) {
                        if (!img.complete) img.addEventListener('load', sync, { once: true });
                    });
                    root.setAttribute('data-bg-carousel-bound', '1');
                }

                sync();
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCarousels);
        } else {
            initCarousels();
        }
        window.addEventListener('load', initCarousels);
    })();
})();

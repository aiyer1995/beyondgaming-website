/**
 * Beyond Gaming — Woodmart Child Theme
 * Light client-side enhancements that match the Next.js storefront feel.
 *
 * Keep this file small. Heavy interactivity should be done as Alpine.js
 * components inline in templates, not here.
 */

(function () {
    'use strict';

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

    // ─── 0a. Eliminate the white gap between the header and the homepage hero ───
    // Woodmart + Elementor wrap the page content in several layers, each
    // of which can contribute its own top padding/margin. Walk up the DOM
    // from .bg-hero and zero any positive top spacing on every ancestor
    // until we hit <body>. Bulletproof regardless of which wrapper class
    // the gap actually comes from.
    function nukeHeroTopGap() {
        var hero = document.querySelector('.bg-hero');
        if (!hero) return;
        var el = hero.parentElement;
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
        // Also zero any space *before* the hero contributed by previous
        // siblings (page title bars, breadcrumb wrappers, etc.)
        var prev = hero.previousElementSibling;
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
    document.addEventListener('DOMContentLoaded', nukeHeroTopGap);
    // Run again after Elementor finishes hydrating in case it injects
    // wrappers on top of the static markup.
    window.addEventListener('load', nukeHeroTopGap);

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

        // ─── Paint the .whb-header-bottom row WHITE explicitly ───
        // This needs to use inline styles with !important to beat
        // any inline style left over from a previous paint pass.
        document.querySelectorAll('.whb-header-bottom').forEach(function (row) {
            row.style.setProperty('background', '#ffffff', 'important');
            row.style.setProperty('background-color', '#ffffff', 'important');
            row.style.setProperty('background-image', 'none', 'important');
            row.style.setProperty(
                'border-bottom',
                '1px solid rgba(0,0,0,0.06)',
                'important'
            );
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

    // ─── 1. Smooth in-page scrolling ───
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
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
})();

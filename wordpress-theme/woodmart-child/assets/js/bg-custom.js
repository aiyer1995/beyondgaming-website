/**
 * Beyond Gaming — Woodmart Child Theme
 * Light client-side enhancements that match the Next.js storefront feel.
 *
 * Keep this file small. Heavy interactivity should be done as Alpine.js
 * components inline in templates, not here.
 */

(function () {
    'use strict';

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

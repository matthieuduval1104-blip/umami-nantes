/* ============================================================
   UMAMI — script.js v0.1
   Interactions légères : nav sticky + burger menu mobile
   ============================================================ */

(function () {
    'use strict';

    /* ---- Nav : ombre au scroll ---- */
    var nav = document.querySelector('.nav');
    if (nav) {
        window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    /* ---- Burger menu mobile ---- */
    var burger = document.querySelector('.nav__burger');
    var menu   = document.querySelector('.nav__menu');

    if (burger && menu) {
        burger.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', isOpen);
        });

        /* Fermer le menu au clic sur un lien */
        menu.querySelectorAll('.nav__link, .nav__cta').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });

        /* Fermer le menu au clic en dehors */
        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target)) {
                menu.classList.remove('is-open');
                burger.setAttribute('aria-expanded', 'false');
            }
        });
    }

})();

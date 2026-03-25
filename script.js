/* ============================================================
   UMAMI#5 — script.js v1.0
   ============================================================ */

(function () {
    'use strict';

    /* ---- Références DOM ---- */
    var trigger     = document.getElementById('menu-trigger');
    var overlay     = document.getElementById('menu-overlay');
    var btnClose    = document.getElementById('menu-close');
    var links       = document.querySelectorAll('.menu-nav__link');
    var screens     = document.querySelectorAll('.screen');
    var scrollHint  = document.getElementById('scroll-hint');
    var currentScreen = screens[0];

    /* ---- Menu : ouvrir ---- */
    function openMenu() {
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-is-open');
        btnClose.focus();
    }

    /* ---- Menu : fermer ---- */
    function closeMenu() {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-is-open');
        trigger.focus();
    }

    trigger.addEventListener('click', openMenu);
    btnClose.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
    });

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeMenu();
    });

    /* ---- Scroll hint ---- */
    if (scrollHint) {
        scrollHint.addEventListener('click', function () {
            var next = currentScreen.nextElementSibling;
            while (next && !next.classList.contains('screen')) {
                next = next.nextElementSibling;
            }
            if (next) next.scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* ---- Navigation snap ---- */
    links.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById(this.getAttribute('data-target'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            closeMenu();
        });
    });

    /* ---- Couleur adaptative du trigger + scroll hint ---- */
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.intersectionRatio >= 0.5) {
                currentScreen = entry.target;
                var isDark = entry.target.classList.contains('screen--black') || entry.target.id === 'footer';
                var isLast = entry.target.id === 'infos' || entry.target.id === 'footer';
                trigger.classList.toggle('menu-trigger--light', isDark);
                if (scrollHint) {
                    scrollHint.classList.toggle('is-hidden', isLast);
                    scrollHint.classList.toggle('scroll-hint--light', isDark);
                }
            }
        });
    }, { threshold: 0.5 });

    screens.forEach(function (s) { observer.observe(s); });

    /* Observer le footer aussi */
    var footer = document.getElementById('footer');
    if (footer) observer.observe(footer);

    /* ---- Onglets Programme (Vue générale / Samedi / Dimanche) ---- */
    var tabs    = document.querySelectorAll('.prog-tab');
    var panels  = {
        list: document.getElementById('prog-list'),
        sam:  document.getElementById('prog-sam'),
        dim:  document.getElementById('prog-dim')
    };

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var view = this.getAttribute('data-view');

            /* Désactiver tous les onglets + cacher tous les panels */
            tabs.forEach(function (t) {
                t.classList.remove('is-active');
                t.setAttribute('aria-selected', 'false');
            });
            Object.keys(panels).forEach(function (k) {
                if (panels[k]) panels[k].classList.add('is-hidden');
            });

            /* Activer l'onglet cliqué + afficher son panel */
            this.classList.add('is-active');
            this.setAttribute('aria-selected', 'true');
            if (panels[view]) panels[view].classList.remove('is-hidden');
        });
    });

    /* ---- Micro-animation hero : léger zoom au chargement ---- */
    var heroBg = document.getElementById('hero-bg');
    if (heroBg) {
        heroBg.addEventListener('load', function () {
            heroBg.style.transform = 'scale(1.04)';
            setTimeout(function () {
                heroBg.style.transform = 'scale(1)';
            }, 100);
        });
        /* Si déjà en cache */
        if (heroBg.complete) {
            setTimeout(function () { heroBg.style.transform = 'scale(1)'; }, 100);
        }
    }

    /* ---- Carte Leaflet (Infos pratiques) ---- */
    if (typeof L !== 'undefined') {
        var mapEl = document.getElementById('map');
        if (mapEl) {
            var map = L.map('map', {
                center: [47.200578632683765, -1.5643567563961212],
                zoom: 15,
                zoomControl: false,
                scrollWheelZoom: false,
                dragging: false,
                attributionControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18
            }).addTo(map);

            var pinkIcon = L.divIcon({
                html: '<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22s14-12.667 14-22C28 6.268 21.732 0 14 0z" fill="#F4A7BF" stroke="#111111" stroke-width="1.5"/><circle cx="14" cy="14" r="5" fill="white"/></svg>',
                className: '',
                iconSize: [28, 36],
                iconAnchor: [14, 36],
                popupAnchor: [0, -36]
            });

            L.marker([47.200578632683765, -1.5643567563961212], { icon: pinkIcon })
                .addTo(map)
                .bindPopup("L'Agronaute<br>2 rue du Sénégal, Nantes");
        }
    }

})();

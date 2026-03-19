/* ============================================================
   UMAMI#5 — script.js v0.5
   ============================================================ */

(function () {
    'use strict';

    /* ---- Références DOM ---- */
    var trigger  = document.getElementById('menu-trigger');
    var overlay  = document.getElementById('menu-overlay');
    var btnClose = document.getElementById('menu-close');
    var links    = document.querySelectorAll('.menu-nav__link');
    var screens  = document.querySelectorAll('.screen');

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

    /* Escape */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
    });

    /* Clic sur le fond de l'overlay */
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeMenu();
    });

    /* ---- Navigation snap ---- */
    links.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById(this.getAttribute('data-target'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            closeMenu();
        });
    });

    /* ---- Couleur adaptative du trigger ---- */
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.intersectionRatio >= 0.5) {
                var isDark = entry.target.classList.contains('screen--black');
                trigger.classList.toggle('menu-trigger--light', isDark);
            }
        });
    }, { threshold: 0.5 });

    screens.forEach(function (s) { observer.observe(s); });

    /* ---- Carte Leaflet (Infos pratiques) ---- */
    if (typeof L !== 'undefined') {
        var mapEl = document.getElementById('map');
        if (mapEl) {
            var map = L.map('map', {
                center: [47.2090, -1.5609],
                zoom: 15,
                zoomControl: false,
                scrollWheelZoom: false,
                dragging: false,
                attributionControl: false
            });

            /* Tuiles OpenStreetMap */
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18
            }).addTo(map);

            /* Marker rose personnalisé */
            var pinkIcon = L.divIcon({
                html: '<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22s14-12.667 14-22C28 6.268 21.732 0 14 0z" fill="#F4A7BF" stroke="#111111" stroke-width="1.5"/><circle cx="14" cy="14" r="5" fill="white"/></svg>',
                className: '',
                iconSize: [28, 36],
                iconAnchor: [14, 36],
                popupAnchor: [0, -36]
            });

            L.marker([47.2090, -1.5609], { icon: pinkIcon })
                .addTo(map)
                .bindPopup("L'Agronaute<br>2 rue du Sénégal, Nantes");
        }
    }

})();

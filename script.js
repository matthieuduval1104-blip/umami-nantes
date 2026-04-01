/* ============================================================
   UMAMI#5 — script.js v1.1
   ============================================================ */

(function () {
    'use strict';

    /* ---- Scroll restoration : forcer le retour au hero au reload ---- */
    /* Le browser restaure le scrollTop du div APRÈS l'exécution du script.
       On l'écrase via pageshow + rAF pour s'assurer de passer après la restauration. */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    function resetScroll() {
        var wrapper = document.querySelector('.snap-wrapper');
        if (wrapper) {
            wrapper.scrollTop = 0;
            wrapper.classList.add('is-ready'); /* révèle le wrapper après reset — évite flash */
        }
        window.scrollTo(0, 0);
    }

    window.addEventListener('pageshow', function () {
        requestAnimationFrame(resetScroll);
    });

    /* ---- Viewport height réel (iOS + navigateurs avec UI custom) ---- */
    function updateVh() {
        document.documentElement.style.setProperty('--actual-vh', window.innerHeight + 'px');
    }
    updateVh();
    window.addEventListener('resize', updateVh);

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

    /* ---- Scroll CTAs (liens hors menu avec data-target) ---- */
    document.querySelectorAll('a[data-target]:not(.menu-nav__link)').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById(this.getAttribute('data-target'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
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

    /* ---- Focus trap pour les modales ---- */
    var FOCUSABLE_SEL = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

    function trapFocus(modal) {
        var focusable = Array.from(modal.querySelectorAll(FOCUSABLE_SEL));
        if (!focusable.length) return;
        var first = focusable[0];
        var last  = focusable[focusable.length - 1];
        modal._trapHandler = function (e) {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
            }
        };
        modal.addEventListener('keydown', modal._trapHandler);
    }

    function releaseFocus(modal) {
        if (modal._trapHandler) {
            modal.removeEventListener('keydown', modal._trapHandler);
            modal._trapHandler = null;
        }
    }

    /* ---- Modales ---- */
    function closeModal(modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        releaseFocus(modal);
        document.body.classList.remove('modal-is-open');
    }

    document.querySelectorAll('[data-modal-open]').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            var id = this.getAttribute('data-modal-open');
            var modal = document.getElementById(id);
            if (!modal) return;
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            modal.setAttribute('aria-modal', 'true');
            document.body.classList.add('modal-is-open');
            var closeBtn = modal.querySelector('.modal__close');
            if (closeBtn) closeBtn.focus();
            trapFocus(modal);
        });
    });

    document.querySelectorAll('.modal').forEach(function (modal) {
        var closeBtn = modal.querySelector('.modal__close');
        if (closeBtn) closeBtn.addEventListener('click', function () { closeModal(modal); });
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(modal); });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var open = document.querySelector('.modal.is-open');
            if (open) closeModal(open);
        }
    });

    /* ---- Livrets (Ateliers, Rencontres, Programme, Kids) — générique ---- */
    function initLivret(modal) {
        var spreads = modal.querySelectorAll('.livret__spread');
        var total   = spreads.length;
        if (!total) return;

        var idx  = 0;
        var busy = false;

        var elCurrent = modal.querySelector('.livret-current');
        var elTotal   = modal.querySelector('.livret-total');
        var prevBtn   = modal.querySelector('.livret__nav--prev');
        var nextBtn   = modal.querySelector('.livret__nav--next');

        function updateCounter() {
            if (elCurrent) elCurrent.textContent = idx + 1;
        }
        function updateNav() {
            if (prevBtn) prevBtn.disabled = idx === 0;
            if (nextBtn) nextBtn.disabled = idx === total - 1;
        }

        function goTo(newIdx) {
            if (busy) return;
            newIdx = (newIdx + total) % total;
            if (newIdx === idx) return;
            busy = true;

            var direction = newIdx > idx ? 1 : -1;
            var current   = spreads[idx];
            var next      = spreads[newIdx];

            next.style.transition = 'none';
            next.classList.remove('is-active');
            if (direction < 0) { next.classList.add('is-left'); }
            else { next.classList.remove('is-left'); }
            next.offsetHeight;
            next.style.transition = '';

            next.classList.add('is-active');
            next.classList.remove('is-left');
            if (direction > 0) {
                current.classList.add('is-left');
                current.classList.remove('is-active');
            } else {
                current.classList.remove('is-active', 'is-left');
            }

            idx = newIdx;
            setTimeout(function () { busy = false; updateCounter(); updateNav(); }, 600);
        }

        function reset() {
            busy = false;
            spreads.forEach(function (s) { s.classList.remove('is-active', 'is-left'); s.style.transition = ''; });
            idx = 0;
            spreads[0].classList.add('is-active');
            updateCounter();
            updateNav();
        }

        if (elTotal) elTotal.textContent = total;
        if (prevBtn) prevBtn.addEventListener('click', function () { goTo(idx - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goTo(idx + 1); });

        var closeBtn = modal.querySelector('.livret__close');
        if (closeBtn) closeBtn.addEventListener('click', function () { closeModal(modal); setTimeout(reset, 350); });
        modal.addEventListener('click', function (e) {
            if (e.target === modal) { closeModal(modal); setTimeout(reset, 350); }
        });

        reset();
    }

    document.querySelectorAll('.modal--livret').forEach(initLivret);

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

    /* ---- Carte Leaflet — chargée en différé quand #infos entre dans le viewport ---- */
    var infosSection = document.getElementById('infos');
    var leafletLoaded = false;

    function initLeafletMap() {
        var mapEl = document.getElementById('map');
        if (!mapEl) return;
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

    function loadLeaflet() {
        if (leafletLoaded) return;
        leafletLoaded = true;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.crossOrigin = '';
        document.head.appendChild(link);
        var script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initLeafletMap;
        document.body.appendChild(script);
    }

    if (infosSection) {
        var infosObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                loadLeaflet();
                infosObserver.disconnect();
            }
        }, { threshold: 0.1 });
        infosObserver.observe(infosSection);
    }

    /* ---- Typewriter — titre hero lettre par lettre ---- */
    var titleLines = document.querySelectorAll('.hero-title__line');
    if (titleLines.length) {
        var charDelay = 0.07;   /* secondes entre chaque lettre */
        var lineGap   = 0.15;   /* pause supplémentaire entre les 2 lignes */
        var t = 0.1;            /* délai de départ */

        titleLines.forEach(function (line) {
            var text = line.textContent;
            line.textContent = '';
            for (var i = 0; i < text.length; i++) {
                var span = document.createElement('span');
                span.className = 'hero-title__char';
                span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
                span.style.animationDelay = t.toFixed(2) + 's';
                line.appendChild(span);
                t += charDelay;
            }
            t += lineGap;
        });
    }

})();

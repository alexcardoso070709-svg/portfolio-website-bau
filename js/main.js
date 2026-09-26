/* ==========================================================================
   ACVISUALS – alle Interaktionen und Animationen.
   Nachbau der Webflow-Interaktionen (IX2/IX3) der Vorlage „Ariyana Studio“
   mit GSAP 3 (+ ScrollTrigger, SplitText) und Lenis. Kein Build-Schritt.
   Jede Funktion prüft selbst, ob ihre Elemente auf der Seite existieren.
   ========================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var Split = window.SplitText;
  var hatGsap = !!(gsap && ST && Split);
  var DESKTOP = '(min-width: 992px)';      // Webflow-Breakpoint „main“
  var AB_TABLET = '(min-width: 768px)';    // „main“ + „medium“
  var lenis = null;
  var mm = null;
  window.__animFehler = [];

  if (reduziert) html.classList.add('bewegung-reduziert');

  // Führt eine Teilfunktion aus; Fehler landen still in window.__animFehler statt in der Konsole.
  function sicher(name, fn) {
    try { fn(); } catch (e) { window.__animFehler.push(name + ': ' + (e && e.message)); }
  }

  // Registriert Event-Listener, die sich über ein AbortSignal wieder entfernen lassen.
  function auf(el, typ, fn, signal) { el.addEventListener(typ, fn, signal ? { signal: signal } : undefined); }

  // Hover (und Tastatur-Fokus) spielt eine Timeline vorwärts, Verlassen spielt sie rückwärts.
  function hoverTimeline(el, tl, rueckTempo, signal) {
    var rein = function () { tl.timeScale(1).play(); };
    var raus = function () { tl.timeScale(rueckTempo || 1).reverse(); };
    auf(el, 'mouseenter', rein, signal); auf(el, 'mouseleave', raus, signal);
    auf(el, 'focusin', rein, signal); auf(el, 'focusout', raus, signal);
  }

  // Zerlegt Text in Wörter/Zeichen (SplitText) und hält ihn für Screenreader als Ganzes lesbar.
  function teile(el, art, maske) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    var opt = { type: art || 'words,chars', aria: 'none', reduceWhiteSpace: true };
    if (maske) opt.mask = maske;
    var s = new Split(el, opt);
    if (text && !el.closest('[aria-hidden="true"]')) {
      Array.prototype.forEach.call(el.children, function (k) { k.setAttribute('aria-hidden', 'true'); });
      var sr = document.createElement('span');
      sr.className = 'anim-sr';
      sr.textContent = text;
      el.appendChild(sr);
    }
    return s;
  }

  /* ---------------- Grundlagen ---------------- */

  // Farbflächen: data-bg="#hex" wird zur CSS-Variable --bg-farbe (statt Inline-Style im HTML).
  function farbflaechen() {
    $$('[data-bg]').forEach(function (el) { el.style.setProperty('--bg-farbe', el.dataset.bg); });
  }

  // Doppelte Texte (nur fürs Roll-Effekt-Design) und den Preloader vor Screenreadern verbergen.
  function doppelteTexteVerbergen() {
    $$('.preloader, .second_text, .secondary-text, .nav_link_text._2, [data-menu-text]:nth-of-type(2)').forEach(function (el) {
      el.setAttribute('aria-hidden', 'true');
    });
  }

  // Weiches Scrollen mit Lenis (wie Vorlage: lerp 0.1), gekoppelt an ScrollTrigger.
  function weichesScrollen() {
    if (reduziert || typeof window.Lenis !== 'function') return;
    if (hatGsap) {
      lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: true });
    }
  }

  /* ---------------- Menü ---------------- */

  // Vollbild-Menü: öffnen/schließen (Slide von oben), Tastatur, Fokus-Falle, inert, Esc, Scroll-Sperre.
  function vollbildMenue() {
    var menue = $('.canvas_menu');
    var oeffner = $('[data-menu-icon]');
    if (!menue || !oeffner) return;
    var schliesser = $('[menu-close-icon]', menue) || $('[menu-close-icon]');
    if (!menue.id) menue.id = 'hauptmenue';
    menue.setAttribute('role', 'dialog');
    menue.setAttribute('aria-modal', 'true');
    menue.setAttribute('aria-label', 'Hauptmenü');

    var alsKnopf = function (el, label) {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', label);
      el.setAttribute('aria-controls', menue.id);
    };
    alsKnopf(oeffner, 'Menü öffnen');
    oeffner.setAttribute('aria-expanded', 'false');
    if (schliesser) alsKnopf(schliesser, 'Menü schließen');

    var offen = false;
    var inerte = [];
    var tween = null;
    var dauer = reduziert ? 0 : 1;

    var versteckt = function (v) {
      menue.inert = v;
      menue.style.visibility = v ? 'hidden' : 'visible';
    };
    if (hatGsap) gsap.set(menue, { y: 0, yPercent: -100 });
    versteckt(true);

    var restInert = function (an) {
      if (an) {
        var el = menue;
        while (el && el.parentElement && el !== document.body) {
          Array.prototype.forEach.call(el.parentElement.children, function (g) {
            if (g !== el && !g.inert && g.tagName !== 'SCRIPT') { g.inert = true; inerte.push(g); }
          });
          el = el.parentElement;
        }
      } else {
        inerte.forEach(function (g) { g.inert = false; });
        inerte = [];
      }
    };

    var fokussierbar = function () {
      return $$('a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]', menue)
        .filter(function (e) { return e.offsetParent !== null || e === schliesser; });
    };

    var oeffnen = function () {
      if (offen) return;
      offen = true;
      versteckt(false);
      restInert(true);
      oeffner.setAttribute('aria-expanded', 'true');
      html.classList.add('menue-offen');
      if (lenis) lenis.stop();
      if (hatGsap) {
        if (tween) tween.kill();
        tween = gsap.to(menue, { yPercent: 0, duration: dauer, ease: 'power3.inOut' });
      } else {
        menue.style.transform = 'none';
      }
      var ziel = schliesser || fokussierbar()[0];
      if (ziel) setTimeout(function () { ziel.focus({ preventScroll: true }); }, 50);
    };

    var schliessen = function () {
      if (!offen) return;
      offen = false;
      restInert(false);
      oeffner.setAttribute('aria-expanded', 'false');
      html.classList.remove('menue-offen');
      if (lenis) lenis.start();
      var fertig = function () { if (!offen) versteckt(true); };
      if (hatGsap) {
        if (tween) tween.kill();
        tween = gsap.to(menue, { yPercent: -100, duration: dauer, ease: 'power3.inOut', onComplete: fertig });
      } else {
        menue.style.transform = '';
        fertig();
      }
      oeffner.focus({ preventScroll: true });
    };

    var tasten = function (fn) {
      return function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); fn(); }
      };
    };
    oeffner.addEventListener('click', oeffnen);
    oeffner.addEventListener('keydown', tasten(oeffnen));
    if (schliesser) {
      schliesser.addEventListener('click', schliessen);
      schliesser.addEventListener('keydown', tasten(schliessen));
    }

    document.addEventListener('keydown', function (e) {
      if (!offen) return;
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); schliessen(); return; }
      if (e.key !== 'Tab') return;
      var f = fokussierbar();
      if (!f.length) return;
      var erstes = f[0], letztes = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === erstes || !menue.contains(document.activeElement))) {
        e.preventDefault(); letztes.focus();
      } else if (!e.shiftKey && (document.activeElement === letztes || !menue.contains(document.activeElement))) {
        e.preventDefault(); erstes.focus();
      }
    });
  }

  // Menü-Icon-Hover: äußere Striche werden voll breit, das Icon dreht sich gerade.
  function menueIconHover() {
    var icon = $('[data-menu-icon]');
    if (!icon) return;
    var tl = gsap.timeline({ paused: true, defaults: { duration: 0.5, ease: 'power1.out' } });
    var striche = $$('[data-menu-line]', icon).filter(function (l, i, a) { return i === 0 || i === a.length - 1; });
    if (striche.length) tl.to(striche, { width: '100%' }, 0);
    var innen = $('[data-menu-inner]', icon);
    if (innen) tl.to(innen, { rotation: 0 }, 0);
    hoverTimeline(icon, tl, 1.15);
  }

  // Menü-Links: orange Fläche wächst von unten, Text rollt nach oben und weißer Text rollt nach.
  function menueLinkHover() {
    $$('.canvas_menu_link').forEach(function (link) {
      var tl = gsap.timeline({ paused: true });
      var bg = $('.canvas_menu_active_bg', link);
      var texte = $$('[data-menu-text]', link);
      if (bg) tl.fromTo(bg, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power3.inOut' }, 0);
      tl.to(link, { color: '#fff', duration: 0.5, ease: 'power1.out' }, 0);
      if (texte[0]) {
        var s = teile(texte[0]);
        tl.fromTo(s.chars, { yPercent: 0 }, { yPercent: -100, opacity: 0, duration: 0.3, stagger: { amount: 0.3 }, ease: 'power1.inOut' }, 0);
      }
      if (texte[1]) tl.fromTo(texte[1], { yPercent: 0, opacity: 0 }, { yPercent: -100, opacity: 1, duration: 0.3, ease: 'power1.inOut' }, 0.24);
      hoverTimeline(link, tl);
    });
  }

  /* ---------------- Links & Buttons ---------------- */

  // Navigations-/Footer-Links: beide Textzeilen rollen buchstabenweise nach oben.
  function linkRollen() {
    $$('[data-link]').forEach(function (link) {
      var texte = $$('[data-link-text]', link);
      if (texte.length < 2) return;
      var tl = gsap.timeline({ paused: true });
      tl.to(teile(texte[0]).chars, { yPercent: -100, duration: 0.5, stagger: { amount: 0.2 }, ease: 'power2.out' }, 0);
      tl.to(teile(texte[1]).chars, { yPercent: -100, duration: 0.5, stagger: { amount: 0.3 }, ease: 'power2.out' }, 0);
      var los = function () { if (!tl.isActive()) tl.restart(); };
      link.addEventListener('mouseenter', los);
      link.addEventListener('focus', los);
    });
  }

  // Linien-Masken im Button-Rand schließen sich (Lücken im Rahmen verschwinden).
  function maskenSchliessen(tl, masken) {
    if (!masken.length) return;
    tl.to(masken[0], { width: 0, x: -20, duration: 0.5, ease: 'back.in' }, 0);
    if (masken.length > 1) tl.to(masken.slice(1), { width: 0, x: 20, duration: 0.5, ease: 'back.in' }, 0);
  }

  // Button (Standard): Hintergrund schwarz, Text weiß und rollt, Linie wird länger, Rand schließt sich.
  function buttonPrimary() {
    $$('[data-button-primary]').forEach(function (btn) {
      var texte = $$('[data-button-text]', btn);
      var linie = $('[data-button-line]', btn);
      var tl = gsap.timeline({ paused: true });
      if (texte.length) tl.to(texte, { color: '#fff', duration: 0.3, ease: 'power1.out' }, 0);
      maskenSchliessen(tl, $$('[data-button-line-mask]', btn));
      texte.forEach(function (t) {
        tl.to(teile(t).chars, { yPercent: -100, duration: 0.35, stagger: { amount: 0.5 }, ease: 'power4.inOut' }, 0);
      });
      hoverTimeline(btn, tl);
      // Hintergrund + Linie (Webflow-IX2 „Button primary hover“), Rückweg mit 0,5 s Verzögerung.
      var bg0 = getComputedStyle(btn).backgroundColor;
      var linie0 = linie ? getComputedStyle(linie).backgroundColor : null;
      var rein = function () {
        gsap.to(btn, { backgroundColor: '#000', duration: 0.35, ease: 'power1.inOut', overwrite: 'auto' });
        if (linie) gsap.to(linie, { backgroundColor: '#fff', scaleX: 1.3, duration: 0.5, ease: 'power2.inOut', overwrite: 'auto' });
      };
      var raus = function () {
        gsap.to(btn, { backgroundColor: bg0, duration: 0.35, delay: 0.5, ease: 'power1.inOut', overwrite: 'auto' });
        if (linie) gsap.to(linie, { backgroundColor: linie0, scaleX: 1, duration: 0.5, delay: 0.5, ease: 'power3.inOut', overwrite: 'auto' });
      };
      btn.addEventListener('mouseenter', rein); btn.addEventListener('focusin', rein);
      btn.addEventListener('mouseleave', raus); btn.addEventListener('focusout', raus);
    });
  }

  // Button (Variante 2, Projekt-Karten): Linie wird 16 px, Text rollt, Rand schließt sich.
  function buttonV2() {
    $$('[data-button-primary-v2]').forEach(function (btn) {
      var tl = gsap.timeline({ paused: true });
      var linie = $('[data-button-line-v2]', btn);
      if (linie) tl.to(linie, { width: 16, duration: 0.5, ease: 'power1.out' }, 0);
      $$('[data-button-text-v2]', btn).forEach(function (t) {
        tl.to(teile(t).chars, { yPercent: -100, duration: 0.35, stagger: { amount: 0.5 }, ease: 'power3.inOut' }, 0);
      });
      maskenSchliessen(tl, $$('[data-button-line-mask-v2]', btn));
      hoverTimeline(btn, tl);
    });
  }

  // Großer CTA-Button: Text rollt, Rand schließt sich, Button schrumpft leicht (Rückweg 1,5× schneller).
  function ctaButton() {
    $$('.cta_button').forEach(function (btn) {
      var tl = gsap.timeline({ paused: true });
      $$('.cta_button_text', btn).forEach(function (t) {
        tl.to(teile(t).chars, { yPercent: -100, duration: 0.5, stagger: { amount: 0.6 }, ease: 'power2.out' }, 0);
      });
      maskenSchliessen(tl, $$('.cta_button_line_mask', btn));
      tl.to(btn, { scale: 0.9, duration: 0.31, ease: 'power2.out' }, 0);
      hoverTimeline(btn, tl, 1.5);
    });
  }

  /* ---------------- Seitenstart ---------------- */

  // Startseite: Preloader-Logo, Preloader fährt hoch, Hero-Bild zoomt auf, Hero-Texte fallen ein.
  function preloaderUndHero() {
    var pre = $('.preloader');
    var titel = $('[data-hero-title]');
    if (!pre && !titel) return;
    var tl = gsap.timeline();
    var v = pre ? 0 : -1.6; // ohne Preloader startet der Hero sofort
    var zeit = function (t) { return Math.max(0, t + v); };
    if (pre) {
      pre.setAttribute('aria-hidden', 'true');
      gsap.set(pre, { y: 0, yPercent: 0 });
      var logo = $('[data-preloader-logo]', pre);
      if (logo) tl.from(teile(logo, 'words,chars', 'chars').chars, { yPercent: -100, duration: 1, stagger: { amount: 0.4 }, ease: 'back.inOut' }, 0.05);
      tl.to(pre, { yPercent: -120, duration: 1, ease: 'power2.inOut', onComplete: function () { pre.style.visibility = 'hidden'; } }, 1.44);
    }
    var bild = $('.hero_image');
    if (bild) tl.from(bild, { scaleX: 0.3, scaleY: 0.2, duration: 1.5, ease: 'power1.inOut' }, zeit(1.6));
    [['[data-hero-title]', 2.57, 1, 0.5, 'back.inOut'],
     ['[data-hero-subtitle]', 3.46, 1, 0.5, 'back.inOut'],
     ['[data-hero-text]', 4.06, 0.8, 0.4, 'power3.out']].forEach(function (d) {
      var el = $(d[0]);
      if (el) tl.from(teile(el, 'words,chars', 'chars').chars, { yPercent: -100, duration: d[2], stagger: { amount: d[3] }, ease: d[4] }, zeit(d[1]));
    });
    var links = $('.hero_section .hero_social_links');
    if (links) tl.from(links, { opacity: 0, y: 30, duration: 0.5, ease: 'power1.out' }, zeit(4.89));
    var stat = $('.hero_section .hero_stat');
    if (stat) tl.from(stat, { opacity: 0, y: 30, duration: 0.5, ease: 'power1.out' }, zeit(5.05));
  }

  // Unterseiten: Seitentitel fällt beim Laden buchstabenweise ein, Bild-Kapsel im Titel wächst auf.
  function seitenTitel() {
    var titel = $$('[data-title]');
    if (!titel.length) return;
    var span = $('[data-image-span]');
    var istUeber = !!(span && span.classList.contains('about_hero_title_span'));
    var tl = gsap.timeline();
    titel.forEach(function (el) {
      tl.from(teile(el, 'words,chars', 'chars').chars, { yPercent: -100, opacity: 0, duration: 1, stagger: { amount: istUeber ? 0.5 : 0.3 }, ease: 'back.inOut' }, 0);
    });
    if (span) {
      if (istUeber) tl.from(span, { scale: 0, duration: 0.5, ease: 'power1.inOut' }, 0.53);
      else tl.from(span, { width: 0, duration: 0.5, ease: 'power1.inOut' }, 1);
    }
  }

  // Abschnitts-Label oben (Punkt + Text) gleitet beim Sichtbarwerden von unten ein.
  function abschnittsLabel() {
    $$('[data-w-id="fda64209-c9a2-ae54-9670-45da6393c342"]').forEach(function (el) {
      gsap.from(el, { y: 30, opacity: 0, duration: 0.5, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top bottom', once: true } });
    });
  }

  // Scroll-Hinweis-Pfeil (Leistungen) wippt dauerhaft 8 px auf und ab.
  function scrollHinweis() {
    $$('[data-w-id="6fbe3379-498c-be5e-ea75-3dee039e4b70"]').forEach(function (el) {
      gsap.to(el, { y: 8, duration: 1, ease: 'power1.inOut', yoyo: true, repeat: -1 });
    });
  }

  /* ---------------- Text-Reveals beim Scrollen ---------------- */

  // Überschriften [data-title-anim] fallen buchstabenweise ein; das Badge daneben ploppt danach auf.
  function titelReveal() {
    var benutzt = [];
    $$('[data-title-anim]').forEach(function (el) {
      var tl = gsap.timeline({ paused: true });
      tl.from(teile(el, 'words,chars', 'chars').chars, { yPercent: -100, duration: 1, stagger: { amount: 0.5 }, ease: 'back.inOut' }, 0);
      var badge = el.parentElement && $('[data-floating-badge]', el.parentElement);
      if (badge && benutzt.indexOf(badge) < 0) {
        benutzt.push(badge);
        tl.fromTo(badge, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out' }, 1);
      }
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { tl.play(); } });
    });
    // Badges ohne passende Überschrift bekommen einen eigenen Auslöser.
    $$('[data-floating-badge]').forEach(function (b) {
      if (benutzt.indexOf(b) > -1) return;
      gsap.fromTo(b, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out', scrollTrigger: { trigger: b, start: 'top 90%', once: true } });
    });
  }

  // Fließtexte [data-text-anim] fallen buchstabenweise ein (kürzer, weicher als Titel).
  function textReveal() {
    $$('[data-text-anim]').forEach(function (el) {
      var tl = gsap.timeline({ paused: true });
      tl.from(teile(el, 'words,chars', 'chars').chars, { yPercent: -100, duration: 0.8, stagger: { amount: 0.4 }, ease: 'power3.out' }, 0.2);
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { tl.play(); } });
    });
  }

  // Text [data-text-reveal] hellt beim Scrollen Wort für Wort von 30 % auf 100 % Deckkraft auf.
  function textAufhellen() {
    $$('[data-text-reveal]').forEach(function (el) {
      var s = teile(el, 'words', 'words');
      gsap.fromTo(s.words, { opacity: 0.3 }, {
        opacity: 1, duration: 0.5, ease: 'none', stagger: { each: 0.25 },
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom center', scrub: 1.2 }
      });
    });
  }

  /* ---------------- Ticker ---------------- */

  // Hilfsfunktion: Endlos-Tween läuft nur, solange sein Bereich sichtbar ist (spart Akku).
  function nurSichtbar(tweens, bereich) {
    tweens.forEach(function (t) { t.pause(); });
    ST.create({
      trigger: bereich, start: 'top bottom', end: 'bottom top',
      onToggle: function (self) { tweens.forEach(function (t) { self.isActive ? t.play() : t.pause(); }); }
    });
  }

  // Laufbänder: Kunden-Ticker, CTA-Schriftband (voll/Kontur gegenläufig), Projekt-Ticker mit drehendem Icon.
  function ticker() {
    $$('.brands_ticker').forEach(function (t) {
      var reihen = $$('.brands_ticker_row', t);
      if (reihen.length) nurSichtbar([gsap.fromTo(reihen, { xPercent: -100 }, { xPercent: 0, duration: 10, ease: 'none', repeat: -1 })], t);
    });
    $$('.cta_section').forEach(function (s) {
      var tw = [];
      var voll = $$('[data-stroke="no"]', s), kontur = $$('[data-stroke="yes"]', s);
      if (voll.length) tw.push(gsap.fromTo(voll, { xPercent: 0 }, { xPercent: -100, duration: 10, ease: 'none', repeat: -1 }));
      if (kontur.length) tw.push(gsap.fromTo(kontur, { xPercent: -100 }, { xPercent: 0, duration: 10, ease: 'none', repeat: -1 }));
      if (tw.length) nurSichtbar(tw, s);
    });
    $$('.project_ticker').forEach(function (t) {
      var tw = [];
      var items = $$('.project_ticker_item', t), icons = $$('.project_ticker_icon', t);
      if (items.length) tw.push(gsap.to(items, { xPercent: -100, duration: 15, ease: 'none', repeat: -1 }));
      if (icons.length) tw.push(gsap.to(icons, { rotation: 360, duration: 15, ease: 'none', repeat: -1 }));
      if (tw.length) nurSichtbar(tw, t);
    });
  }

  /* ---------------- Einzelne Bereiche ---------------- */

  // Startseite „Über uns“: Jahres-Leiste fährt beim Scrollen horizontal durch (Sticky-Bereich).
  function jahresTrack() {
    var track = $('.about_track');
    var leiste = track && $('.year_wrapper', track);
    if (!leiste) return;
    mm.add({ desk: DESKTOP, klein: '(max-width: 991px)' }, function (ctx) {
      if (ctx.conditions.desk) {
        gsap.fromTo(leiste, { x: 640, xPercent: 0 }, { x: 0, xPercent: -70, ease: 'none', scrollTrigger: { trigger: track, start: 'top top', end: 'bottom 130%', scrub: 0.8, invalidateOnRefresh: true } });
      } else {
        gsap.fromTo(leiste, { x: 0, xPercent: 7 }, { xPercent: -84, ease: 'none', scrollTrigger: { trigger: track, start: 'top center', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true } });
      }
    });
  }

  // Ablauf-Schritte (Desktop): Plus-Icon klappt Beschreibung auf, Titel wechselt zum Farbverlauf.
  function schritte() {
    var icons = $$('.step_icon');
    if (!icons.length) return;
    mm.add(DESKTOP, function () {
      var ac = new AbortController();
      icons.forEach(function (icon, i) {
        var eltern = icon.parentElement;
        var info = $('.step_item_info_wrap', eltern);
        var tl = gsap.timeline({ paused: true, defaults: { duration: 0.7, ease: 'back.out' } });
        if (info) {
          if (!info.id) info.id = 'schritt-info-' + (i + 1);
          gsap.set(info, { height: 0 });
          tl.to(info, { height: 'auto' }, 0);
          icon.setAttribute('aria-controls', info.id);
        }
        var titel = $$('.step_title', eltern);
        if (titel.length) tl.to(titel, { yPercent: -100 }, 0);
        var zeichen = $('.step_icon_code_embed', icon);
        if (zeichen) tl.to(zeichen, { rotation: 180 }, 0);
        var name = titel[0] ? titel[0].textContent.trim() : 'Schritt ' + (i + 1);
        icon.setAttribute('role', 'button');
        icon.setAttribute('tabindex', '0');
        icon.setAttribute('aria-expanded', 'false');
        icon.setAttribute('aria-label', 'Details zu „' + name + '“ anzeigen');
        var offen = false;
        var umschalten = function () {
          offen = !offen;
          if (offen) tl.play(); else tl.reverse();
          icon.setAttribute('aria-expanded', String(offen));
        };
        auf(icon, 'click', umschalten, ac.signal);
        auf(icon, 'keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); umschalten(); }
        }, ac.signal);
      });
      return function () {
        ac.abort();
        icons.forEach(function (icon) {
          ['role', 'tabindex', 'aria-expanded', 'aria-label', 'aria-controls'].forEach(function (a) { icon.removeAttribute(a); });
        });
      };
    });
  }

  // Ausgewählte Arbeiten: Karten liegen gestapelt und kippen beim Scrollen nacheinander nach oben weg.
  function arbeitenStapel() {
    var track = $('.work_items_track');
    var karten = track ? $$('[data-work-item]', track) : [];
    if (karten.length < 2) return;
    mm.add(AB_TABLET, function () {
      karten.forEach(function (k, j) { gsap.set(k, { y: 40 * j, scale: 1 - 0.06 * j }); });
      var tl = gsap.timeline({ defaults: { ease: 'none', duration: 0.5 }, scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
      for (var s = 0; s < karten.length - 1; s++) {
        var pos = 0.1 + s * 0.51;
        tl.to(karten[s], { yPercent: -120, rotationX: 45 }, pos);
        for (var j = s + 1; j < karten.length; j++) {
          var naechste = j === s + 1;
          tl.to(karten[j], { y: naechste ? 0 : 40 * (j - s) - 20, scale: naechste ? 1 : 1 - 0.06 * (j - s - 1) }, pos);
        }
      }
    });
  }

  // Showreel (Desktop): Video-Maske wächst beim Scrollen auf Vollbild, Texte rücken zur Mitte.
  function showreel() {
    var track = $('.showreel_track');
    var maske = track && $('.showreel_video_mask', track);
    if (!maske) return;
    mm.add(DESKTOP, function () {
      var t1 = $('.showreel_text._1', track), t2 = $('.showreel_text._2', track);
      var texte = [t1, t2].filter(Boolean);
      gsap.set(maske, { width: '50vw', height: '40vh', borderRadius: 40 });
      if (texte.length) gsap.set(texte, { x: 0, y: 0, yPercent: -50, opacity: 0 });
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: track, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      tl.to({}, { duration: 32 }, 0);
      tl.to(maske, { width: '100vw', height: '100vh', borderRadius: 0, duration: 28 }, 32);
      if (texte.length) tl.to(texte, { opacity: 1, duration: 10 }, 32);
      if (t1) tl.to(t1, { x: function () { return window.innerWidth * 0.34; }, duration: 28 }, 32);
      if (t2) tl.to(t2, { x: function () { return -window.innerWidth * 0.34; }, duration: 28 }, 32);
      tl.to({}, { duration: 40 }, 60);
    });
  }

  // Team-Kreis: Bilder fächern sich beim Sichtbarwerden auf, Kranz dreht beim Scrollen, Hover hebt Text hervor.
  function leaderKreis() {
    var sek = $('.leader_section');
    var kranz = sek && $('.leader_circle_wrapper', sek);
    if (!kranz) return;
    var bilder = $$('.leader_circle_item', kranz);
    gsap.to(kranz, { rotation: 360, ease: 'none', scrollTrigger: { trigger: sek, start: 'top bottom', end: 'bottom top', scrub: true } });
    if (bilder.length) {
      gsap.set(bilder, { x: 0, y: 0, xPercent: -50, rotation: 0 });
      var tw = null;
      var faechern = function () {
        if (tw) tw.kill();
        tw = gsap.to(bilder, { rotation: function (i) { return i === 0 ? 0 : -(360 - 36 * i); }, duration: 1, ease: 'power2.inOut' });
      };
      var zurueck = function () { if (tw) tw.kill(); gsap.set(bilder, { rotation: 0 }); };
      ST.create({ trigger: bilder[0], start: 'top bottom', end: 'bottom top', onEnter: faechern, onEnterBack: faechern, onLeave: zurueck, onLeaveBack: zurueck });
    }
    var inhalt = $('.leader_section_content', sek);
    if (!inhalt) return;
    mm.add(DESKTOP, function () {
      var ac = new AbortController();
      auf(inhalt, 'mouseenter', function () {
        gsap.to(inhalt, { opacity: 1, duration: 0.5, overwrite: 'auto' });
        gsap.to(kranz, { scale: 0.8, duration: 0.5, ease: 'power3.inOut', overwrite: 'auto' });
      }, ac.signal);
      auf(inhalt, 'mouseleave', function () {
        gsap.to(inhalt, { opacity: 0.5, duration: 0.5, overwrite: 'auto' });
        gsap.to(kranz, { scale: 1, duration: 0.5, ease: 'power3.inOut', overwrite: 'auto' });
      }, ac.signal);
      return function () { ac.abort(); gsap.set(inhalt, { clearProps: 'opacity' }); gsap.set(kranz, { scale: 1 }); };
    });
  }

  // Karten-Fächer (Desktop): Karten fliegen gedreht von rechts ein; Hover hebt eine Karte hervor.
  function slideCards() {
    var gruppen = $$('[data-slide-cards]');
    if (!gruppen.length) return;
    // Verschiebung der anderen Karten in vw je nach Hover-Karte (aus Webflow-IX2).
    var tabelle = [[0, 7, 5, 5], [-10, 0, 8, 8], [-15, -8, 0, 10], [-10, -8, -10, 0]];
    mm.add(DESKTOP, function () {
      var ac = new AbortController();
      gruppen.forEach(function (g) {
        var karten = $$('[data-slide-card]', g);
        if (!karten.length) return;
        gsap.from(karten, { x: function () { return window.innerWidth; }, rotation: 40, transformOrigin: '100% 100%', duration: 1, stagger: { amount: 0.4 }, ease: 'back.out', scrollTrigger: { trigger: g, start: 'top center', once: true } });
        karten.forEach(function (karte, i) {
          var basis = karte.classList.contains('card_two') ? 5 : -3;
          auf(karte, 'mouseenter', function () {
            gsap.to(karte, { scale: 1.1, rotation: 0, duration: 0.8, ease: 'back.out', overwrite: 'auto' });
            karten.forEach(function (andere, j) {
              if (j === i) return;
              var vw = tabelle[i] && tabelle[i][j] !== undefined ? tabelle[i][j] : (j < i ? -8 : 8);
              gsap.to(andere, { x: window.innerWidth * vw / 100, duration: 0.8, ease: 'back.out', overwrite: 'auto' });
            });
          }, ac.signal);
          auf(karte, 'mouseleave', function () {
            gsap.to(karte, { scale: 1, rotation: basis, duration: 0.6, ease: 'back.out', overwrite: 'auto' });
            karten.forEach(function (andere, j) {
              if (j !== i) gsap.to(andere, { x: 0, duration: 0.6, ease: 'back.out', overwrite: 'auto' });
            });
          }, ac.signal);
        });
      });
      return function () { ac.abort(); };
    });
  }

  // Kennzahlen: Ziffern-Spalten rollen wie ein Zählwerk auf den Endwert, Suffix blendet danach ein.
  function zaehler() {
    $$('[data-counter]').forEach(function (z) {
      var tl = gsap.timeline({ paused: true });
      var oben = $$('.stats_column.is-align-top', z), unten = $$('.stats_column.is-align-bottom', z), suffix = $$('.stats_column.is-suffix', z);
      if (oben.length) tl.from(oben, { yPercent: -90, duration: 2, ease: 'power3.inOut' }, 0);
      if (unten.length) tl.from(unten, { yPercent: 90, duration: 2, ease: 'power3.inOut' }, 0);
      if (suffix.length) tl.from(suffix, { yPercent: 20, opacity: 0, duration: 0.5, ease: 'power2.out' }, 1.94);
      ST.create({ trigger: z, start: 'top bottom', once: true, onEnter: function () { tl.play(); } });
    });
  }

  // Über uns „Warum wir“ (Desktop): Karten schrumpfen beim Scrollen nacheinander auf ein Drittel.
  function warumTrack() {
    var track = $('.why_choose_track');
    var items = track ? $$('.why_choose_item', track) : [];
    if (!items.length) return;
    mm.add(DESKTOP, function () {
      gsap.to(items, { width: '32.5%', duration: 0.5, ease: 'none', stagger: { each: 0.5 }, scrollTrigger: { trigger: track, start: 'top top', end: 'bottom 130%', scrub: 0.8 } });
    });
  }

  // Über uns Team (Desktop): Teamkarten 2–4 steigen beim Scrollen versetzt von unten auf.
  function teamTrack() {
    var track = $('.track');
    var karten = track ? $$('.team_card', track).slice(1) : [];
    if (!karten.length) return;
    mm.add(DESKTOP, function () {
      gsap.from(karten, { opacity: 0, yPercent: 100, duration: 0.5, ease: 'none', stagger: { each: 0.5 }, scrollTrigger: { trigger: track, start: 'top top', end: 'bottom 130%', scrub: 0.8 } });
    });
  }

  // Leistungen (Desktop): großes Video fällt beim Scrollen klein von oben ein und wächst auf volle Größe.
  function serviceVideo() {
    var w = $('.service_video_wrapper');
    if (!w) return;
    mm.add(DESKTOP, function () {
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom 10%', scrub: 1.2 } });
      tl.fromTo(w, { opacity: 0, yPercent: -100, scale: 0.1 }, { opacity: 1, yPercent: 0, scale: 0.1, duration: 1 }, 0);
      tl.to(w, { scale: 1, duration: 0.8 }, 1.05);
    });
  }

  // Projekt-Detail: halbtransparente Schleier über dem Zitat gleiten beim Scrollen nacheinander weg.
  function projektZitat() {
    $$('.project_quote').forEach(function (q) {
      var schleier = $$('.project_quote_overlay', q);
      if (!schleier.length) return;
      gsap.to(schleier, { xPercent: 100, duration: 0.5, ease: 'none', stagger: { each: 0.5 }, scrollTrigger: { trigger: q, start: 'top 70%', end: 'bottom 70%', scrub: 1.5 } });
    });
  }

  /* ---------------- Ohne GSAP-Abhängigkeit ---------------- */

  // Tabs (Kontakt): Klick/Pfeiltasten wechseln den Reiter; ARIA-Rollen und -Zustände werden gepflegt.
  function tabs() {
    $$('.w-tabs').forEach(function (box, b) {
      var links = $$('.w-tab-link', box);
      var panes = $$('.w-tab-pane', box);
      if (!links.length) return;
      var menue = $('.w-tab-menu', box);
      if (menue) menue.setAttribute('role', 'tablist');
      var paneZu = function (l) {
        return panes.filter(function (p) { return p.dataset.wTab === l.dataset.wTab; })[0];
      };
      var dauerRein = (parseInt(box.dataset.durationIn, 10) || 300) / 1000;
      var aktivieren = function (link, fokus) {
        links.forEach(function (l) {
          var an = l === link;
          l.classList.toggle('w--current', an);
          l.setAttribute('aria-selected', String(an));
          l.setAttribute('tabindex', an ? '0' : '-1');
        });
        var ziel = paneZu(link);
        panes.forEach(function (p) {
          var an = p === ziel;
          var war = p.classList.contains('w--tab-active');
          p.classList.toggle('w--tab-active', an);
          if (an && !war && hatGsap && !reduziert) gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: dauerRein, ease: 'power1.out' });
        });
        box.dataset.current = link.dataset.wTab || '';
        if (fokus) link.focus();
        if (hatGsap) ST.refresh();
      };
      links.forEach(function (l, i) {
        l.setAttribute('role', 'tab');
        if (!l.id) l.id = 'reiter-' + (b + 1) + '-' + (i + 1);
        var p = paneZu(l);
        if (p) {
          if (!p.id) p.id = 'bereich-' + (b + 1) + '-' + (i + 1);
          p.setAttribute('role', 'tabpanel');
          p.setAttribute('aria-labelledby', l.id);
          l.setAttribute('aria-controls', p.id);
        }
        l.addEventListener('click', function (e) { e.preventDefault(); aktivieren(l); });
        l.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = links[(i + 1) % links.length];
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = links[(i - 1 + links.length) % links.length];
          else if (e.key === 'Home') n = links[0];
          else if (e.key === 'End') n = links[links.length - 1];
          else if (e.key === ' ') n = l;
          if (n) { e.preventDefault(); aktivieren(n, true); }
        });
      });
      var start = links.filter(function (l) { return l.classList.contains('w--current'); })[0] || links[0];
      aktivieren(start);
    });
  }

  // Hintergrund-Videos: laufen nur, solange sie sichtbar sind; Play/Pause-Knopf; bei reduzierter Bewegung kein Autoplay.
  function videos() {
    var alle = $$('video');
    if (!alle.length) return;
    var beobachter = 'IntersectionObserver' in window ? new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (!v.__nutzerPause) spielen(v); } else if (!v.paused) v.pause();
      });
    }, { rootMargin: '100px 0px' }) : null;

    function spielen(v) {
      try {
        var p = v.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (e) { /* Video nicht abspielbar – still ignorieren */ }
    }

    alle.forEach(function (v) {
      v.muted = true;
      v.setAttribute('playsinline', '');
      v.__nutzerPause = reduziert;
      if (reduziert || beobachter) {
        v.autoplay = false;
        v.removeAttribute('autoplay');
        if (!v.paused) v.pause();
      }
      v.addEventListener('error', function () {}, true);
      var knopf = v.id ? document.querySelector('[aria-controls="' + v.id + '"]') : null;
      var status = function () {
        if (!knopf) return;
        var laeuft = !v.paused;
        var teile2 = knopf.children;
        if (teile2.length >= 2) { teile2[0].hidden = !laeuft; teile2[1].hidden = laeuft; }
        knopf.setAttribute('aria-label', laeuft ? 'Video pausieren' : 'Video abspielen');
      };
      v.addEventListener('play', status);
      v.addEventListener('pause', status);
      if (knopf) {
        knopf.addEventListener('click', function (e) {
          e.preventDefault();
          if (v.paused) { v.__nutzerPause = false; spielen(v); } else { v.__nutzerPause = true; v.pause(); }
        });
      }
      status();
      if (beobachter) beobachter.observe(v);
    });
  }

  /* ---------------- Start ---------------- */

  // Nach Laden von Schriften/Bildern die Scroll-Positionen neu berechnen.
  function neuBerechnen() {
    var timer = null;
    var spaeter = function () { clearTimeout(timer); timer = setTimeout(function () { ST.refresh(); }, 200); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(spaeter);
    $$('img[loading="lazy"]').forEach(function (img) { if (!img.complete) img.addEventListener('load', spaeter, { once: true }); });
  }

  function start() {
    sicher('farbflaechen', farbflaechen);
    sicher('doppelteTexte', doppelteTexteVerbergen);
    if (hatGsap) {
      gsap.registerPlugin(ST, Split);
      gsap.config({ nullTargetWarn: false });
      ST.config({ ignoreMobileResize: true });
      mm = gsap.matchMedia();
    }
    sicher('weichesScrollen', weichesScrollen);
    sicher('vollbildMenue', vollbildMenue);
    sicher('tabs', tabs);
    sicher('videos', videos);

    if (hatGsap && !reduziert) {
      [preloaderUndHero, seitenTitel, abschnittsLabel, scrollHinweis, titelReveal, textReveal, textAufhellen,
       menueIconHover, menueLinkHover, linkRollen, buttonPrimary, buttonV2, ctaButton, ticker, jahresTrack,
       schritte, arbeitenStapel, showreel, leaderKreis, slideCards, zaehler, warumTrack, teamTrack,
       serviceVideo, projektZitat, neuBerechnen].forEach(function (fn) { sicher(fn.name || 'anim', fn); });
    }
    // Startzustände sind gesetzt – versteckte Elemente freigeben (CSS: html.js:not(.anim-bereit)).
    html.classList.add('anim-bereit');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

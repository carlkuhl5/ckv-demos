/* ==========================================================================
   Common Ground — site behaviour
   Built by CKV Media. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     CONFIG — the two things to set before launch.
     1. FORM_ENDPOINT: paste the POST endpoint for the team inbox
        (Formspree, Basin, Netlify Forms, or a custom handler).
        While it is left as the placeholder, forms fall back to opening a
        pre-filled email to TEAM_EMAIL so nothing is ever lost.
     2. GA4_ID: paste the GA4 measurement ID (G-XXXXXXXXXX).
        Analytics only load after the visitor accepts the consent banner.
     ---------------------------------------------------------------------- */
  var FORM_ENDPOINT = 'REPLACE_WITH_FORM_ENDPOINT';
  var GA4_ID        = 'REPLACE_WITH_GA4_ID';
  var TEAM_EMAIL    = 'info@ourcommonground.co';

  var CONSENT_KEY = 'cg-consent-v1';
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ analytics */
  window.dataLayer = window.dataLayer || [];

  function track(name, params) {
    var payload = Object.assign({ event: name }, params || {});
    window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }
  window.cgTrack = track;

  function loadAnalytics() {
    if (!GA4_ID || GA4_ID.indexOf('REPLACE') === 0) return;
    if (document.getElementById('ga4-src')) return;
    var s = document.createElement('script');
    s.async = true;
    s.id = 'ga4-src';
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { anonymize_ip: true });
  }

  /* -------------------------------------------------------- consent banner */
  function initConsent() {
    var el = document.getElementById('consent');
    if (!el) return;
    var stored = null;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) { /* private mode */ }

    if (stored === 'granted') { loadAnalytics(); return; }
    if (stored === 'denied') return;

    el.classList.add('is-open');

    function decide(value) {
      try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* ignore */ }
      el.classList.remove('is-open');
      if (value === 'granted') loadAnalytics();
    }
    var ok = el.querySelector('[data-consent="accept"]');
    var no = el.querySelector('[data-consent="decline"]');
    if (ok) ok.addEventListener('click', function () { decide('granted'); });
    if (no) no.addEventListener('click', function () { decide('denied'); });
  }

  /* -------------------------------------------------------------- nav menu */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    var header = document.querySelector('.site-header');
    if (!toggle || !nav || !header) return;

    var desktopQ = window.matchMedia('(min-width: 1024px)');

    // Pin the panel to the header's actual bottom edge, so the review ribbon
    // (or any banner above the header) never sits on top of the menu.
    function placePanel() {
      if (desktopQ.matches) {
        nav.style.removeProperty('top');
        nav.style.removeProperty('height');
        return;
      }
      var bottom = Math.max(0, Math.round(header.getBoundingClientRect().bottom));
      nav.style.top = bottom + 'px';
      nav.style.height = 'calc(100dvh - ' + bottom + 'px)';
    }

    function setOpen(open) {
      if (open) placePanel();
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        var first = nav.querySelector('a, button');
        if (first) first.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset when we cross into the desktop layout.
    var onChange = function (e) { if (e.matches) setOpen(false); else placePanel(); };
    if (desktopQ.addEventListener) desktopQ.addEventListener('change', onChange);
    else if (desktopQ.addListener) desktopQ.addListener(onChange);

    window.addEventListener('resize', function () {
      if (document.body.classList.contains('nav-open')) placePanel();
    });
  }

  /* ----------------------------------------------------------- scroll reveal */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = (entry.target.dataset.revealDelay || '0') + 'ms';
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------- gallery */
  function initGallery() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var dialog = document.getElementById('lightbox');
    if (!buttons.length || !dialog || typeof dialog.showModal !== 'function') return;

    var imgEl = dialog.querySelector('[data-lb-img]');
    var capEl = dialog.querySelector('[data-lb-cap]');
    var index = 0;

    function show(i) {
      index = (i + buttons.length) % buttons.length;
      var src = buttons[index].dataset.full;
      var alt = buttons[index].dataset.alt || '';
      imgEl.src = src;
      imgEl.alt = alt;
      capEl.textContent = alt;
      dialog.querySelector('[data-lb-count]').textContent = (index + 1) + ' / ' + buttons.length;
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        show(i);
        dialog.showModal();
        track('gallery_open', { image_index: i + 1 });
      });
    });

    dialog.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
    dialog.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
    dialog.querySelector('.lb-close').addEventListener('click', function () { dialog.close(); });

    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', function () {
      var btn = buttons[index];
      if (btn) btn.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------------------------ forms */
  function labelFor(field, form) {
    var lbl = form.querySelector('label[for="' + field.id + '"]');
    if (!lbl) return field.name;
    return lbl.textContent.replace(/\*|\(required\)/g, '').trim();
  }

  function buildMailto(form, data) {
    var subject = form.dataset.subject || 'Website enquiry';
    var lines = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.name === 'cg_hp' || el.name === 'cg_t' || el.type === 'submit') return;
      var value = el.type === 'checkbox' ? (el.checked ? 'Yes' : 'No') : el.value;
      if (!value) return;
      lines.push(labelFor(el, form) + ': ' + value);
    });
    void data;
    return 'mailto:' + TEAM_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function initForms() {
    var forms = document.querySelectorAll('form[data-form]');
    Array.prototype.forEach.call(forms, function (form) {
      var started = Date.now();
      var status = form.querySelector('.form-status');
      var submit = form.querySelector('[type="submit"]');

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.reportValidity()) return;

        // Spam traps: a hidden field no human fills, and a minimum fill time.
        var hp = form.querySelector('[name="cg_hp"]');
        if (hp && hp.value) return;
        if (Date.now() - started < 2500) {
          show('err', 'That submitted a little too quickly. Please try once more.');
          started = Date.now() - 2500;
          return;
        }

        var data = new FormData(form);
        data.append('_page', window.location.pathname);
        data.append('_subject', form.dataset.subject || 'Website enquiry');

        var formName = form.dataset.form;
        track('form_submit', { form_name: formName });

        if (!FORM_ENDPOINT || FORM_ENDPOINT.indexOf('REPLACE') === 0) {
          // No endpoint configured yet — hand off to the visitor's mail client
          // so the enquiry still reaches the team inbox.
          window.location.href = buildMailto(form, data);
          show('ok', 'Your email app is opening with this message ready to send to ' +
            TEAM_EMAIL + '. If nothing opened, email us directly and we\'ll pick it up.');
          return;
        }

        if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = 'Sending…'; }

        fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        }).then(function (res) {
          if (!res.ok) throw new Error('Bad response');
          form.reset();
          started = Date.now();
          show('ok', form.dataset.success ||
            'Thank you — your message is on its way. We usually reply within one business day.');
          track('form_success', { form_name: formName });
        }).catch(function () {
          show('err', 'Something went wrong sending that. Please email ' + TEAM_EMAIL +
            ' or call us and we\'ll sort it out.');
        }).then(function () {
          if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label || 'Send'; }
        });
      });

      function show(kind, message) {
        if (!status) return;
        status.className = 'form-status ' + (kind === 'ok' ? 'is-ok' : 'is-err');
        status.textContent = message;
        status.setAttribute('role', 'status');
        status.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }

  /* ------------------------------------------------------- outbound tracking */
  function initTracking() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-track]');
      if (!el) return;
      track(el.dataset.track, { link_url: el.getAttribute('href') || '', link_text: (el.textContent || '').trim().slice(0, 60) });
    });
  }

  /* ----------------------------------------------------------------- boot */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initNav();
    initReveal();
    initGallery();
    initForms();
    initTracking();
    initConsent();
  });
})();

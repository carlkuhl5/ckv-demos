/* RyanJGrimes.com — demo build. CKV Media. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
        toggle.focus();
      }
    });
  }

  /* ---------- Disclosure ("See more" proof points) ---------- */
  document.querySelectorAll('[data-disclosure]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    var moreLabel = btn.getAttribute('data-label-more') || 'See more';
    var lessLabel = btn.getAttribute('data-label-less') || 'See less';
    var text = btn.querySelector('.disclosure-text');

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.setAttribute('data-open', String(!open));
      panel.hidden = false;
      if (text) text.textContent = open ? moreLabel : lessLabel;
    });
  });

  /* ---------- Video testimonial cards ----------
     Desktop: load on scroll into view, play muted on hover.
     Touch:   tap to play / pause.
     Click:   would open the full video with sound in the full build.   */
  var cards = document.querySelectorAll('[data-vid]');
  if (cards.length) {
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var load = function (card) {
      var v = card.querySelector('video');
      if (!v || v.dataset.loaded === '1') return v;
      var src = v.getAttribute('data-src');
      if (src) {
        v.setAttribute('src', src);
        v.load();
      }
      v.dataset.loaded = '1';
      return v;
    };

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            load(en.target);
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '200px' });
      cards.forEach(function (c) { io.observe(c); });
    } else {
      cards.forEach(load);
    }

    var play = function (card) {
      var v = load(card);
      if (!v || !v.getAttribute('src')) return;
      card.classList.add('is-playing');
      var p = v.play();
      if (p && p.catch) p.catch(function () { card.classList.remove('is-playing'); });
    };
    var stop = function (card) {
      var v = card.querySelector('video');
      card.classList.remove('is-playing');
      if (v && !v.paused) { v.pause(); v.currentTime = 0; }
    };

    cards.forEach(function (card) {
      if (canHover && !reduceMotion) {
        card.addEventListener('mouseenter', function () { play(card); });
        card.addEventListener('mouseleave', function () { stop(card); });
        card.addEventListener('focus', function () { play(card); });
        card.addEventListener('blur', function () { stop(card); });
      }
      card.addEventListener('click', function () {
        if (card.classList.contains('is-playing')) { stop(card); } else { play(card); }
      });
    });
  }

  /* ---------- Video sign-up form (demo: nothing is sent) ---------- */
  var form = document.getElementById('video-form');
  if (form) {
    var live = document.querySelector('.form-live');
    var thanks = document.getElementById('thanks');

    var setError = function (input, message) {
      var field = input.closest('.field');
      var err = field ? field.querySelector('.err') : null;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (err) {
        err.textContent = message || '';
        err.classList.toggle('show', !!message);
      }
      return !message;
    };

    var validate = function (input) {
      var v = input.value.trim();
      if (!v) return setError(input, (input.dataset.label || 'This field') + ' is required.');
      if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        return setError(input, 'Enter an email address we can send the link to.');
      }
      if (input.type === 'tel' && (v.replace(/\D/g, '').length < 10)) {
        return setError(input, 'Enter a phone number with area code.');
      }
      return setError(input, '');
    };

    var inputs = Array.prototype.slice.call(form.querySelectorAll('input[required]'));
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('.hp input') && form.querySelector('.hp input').value) return;

      var ok = true;
      var firstBad = null;
      inputs.forEach(function (input) {
        if (!validate(input)) { ok = false; if (!firstBad) firstBad = input; }
      });
      if (!ok) { if (firstBad) firstBad.focus(); return; }

      // Demo only: nothing is sent, stored or emailed.
      if (live) live.setAttribute('data-hidden', 'true');
      if (thanks) {
        thanks.classList.add('show');
        thanks.setAttribute('tabindex', '-1');
        thanks.focus({ preventScroll: true });
        thanks.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      ro.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
})();

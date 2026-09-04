/* carlkuhl.org — interactions. No dependencies. ~7KB min. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return RM.matches; };

  /* ---------- Nav: stuck state on scroll ---------- */
  var nav = $('.nav'), ticking = false;
  function onScroll() {
    if (nav) nav.classList.toggle('is-stuck', (window.scrollY || 0) > 24);
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = $('.burger'), menu = $('#menu');
  if (burger && menu) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
      menu.setAttribute('aria-hidden', String(!open));
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    $$('#menu a').forEach(function (a, i) { a.style.setProperty('--i', i); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = $$('[data-reveal]');
  if (revealables.length) {
    if (!('IntersectionObserver' in window) || reduced()) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
      revealables.forEach(function (el) {
        // auto-stagger direct siblings that share a parent group
        var g = el.closest('[data-stagger]');
        if (g && !el.style.getPropertyValue('--d')) {
          var sibs = $$('[data-reveal]', g);
          el.style.setProperty('--d', (sibs.indexOf(el) * 0.085) + 's');
        }
        io.observe(el);
      });
    }
  }

  /* ---------- Count-up stats ---------- */
  var nums = $$('[data-count]');
  if (nums.length && 'IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.dataset.count), t0 = null, dur = 1400;
        nio.unobserve(el);
        if (reduced()) { el.textContent = String(target); return; }
        (function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
          el.textContent = String(Math.round(target * e));
          if (p < 1) requestAnimationFrame(step);
        })();
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { n.textContent = '0'; nio.observe(n); });
  }

  /* ---------- Video facade (no 3rd-party script until click) ---------- */
  $$('.vid[data-video]').forEach(function (el) {
    el.addEventListener('click', function () {
      var id = el.dataset.video;
      if (!id || id.charAt(0) === '{') { return; } // unresolved placeholder — do nothing
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = el.dataset.title || 'Video player';
      f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.loading = 'lazy';
      el.innerHTML = '';
      el.appendChild(f);
    });
  });

  /* ---------- Library filter + search ---------- */
  $$('[data-filterset]').forEach(function (set) {
    var items = $$('[data-tags]', set);
    var chips = $$('.chip', set);
    var input = $('input[type="search"]', set);
    var empty = $('.empty', set);
    var counter = $('[data-count-out]', set);
    var active = 'all';

    function apply() {
      var q = (input && input.value || '').trim().toLowerCase();
      var shown = 0;
      items.forEach(function (it) {
        var tags = (it.dataset.tags || '').toLowerCase();
        var text = (it.dataset.search || it.textContent || '').toLowerCase();
        var ok = (active === 'all' || tags.indexOf(active) > -1) && (!q || text.indexOf(q) > -1);
        it.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (counter) counter.textContent = shown;
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', 'true');
        active = (c.dataset.filter || 'all').toLowerCase();
        apply();
      });
    });
    if (input) {
      var t; input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(apply, 120); });
    }
    apply();
  });

  /* ---------- Sticky CTA (shows once hero passes, hides at the form) ---------- */
  var sticky = $('.sticky');
  if (sticky && 'IntersectionObserver' in window) {
    var anchor = $(sticky.dataset.hideAt || '#nothing');
    var past = false, atForm = false;
    var render = function () { sticky.classList.toggle('is-on', past && !atForm); };
    var top = $('.hero, .phero');
    if (top) new IntersectionObserver(function (e) {
      past = !e[0].isIntersecting; render();
    }, { threshold: 0 }).observe(top);
    if (anchor) new IntersectionObserver(function (e) {
      atForm = e[0].isIntersecting; render();
    }, { threshold: 0 }).observe(anchor);
  }

  /* ---------- Copy-to-clipboard ---------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.dataset.copy);
      if (!src) return;
      var txt = src.innerText.trim();
      var done = function () {
        var old = btn.querySelector('span').textContent;
        btn.classList.add('is-done');
        btn.querySelector('span').textContent = 'Copied';
        setTimeout(function () {
          btn.classList.remove('is-done');
          btn.querySelector('span').textContent = old;
        }, 1800);
      };
      if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(done, function(){}); }
      else {
        var ta = document.createElement('textarea');
        ta.value = txt; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- Forms: inline validation, honeypot, no-reload submit ---------- */
  $$('form[data-form]').forEach(function (form) {
    var success = document.getElementById(form.dataset.success || '');
    var submit = form.querySelector('[type="submit"]');

    function fieldOf(input) { return input.closest('.field'); }
    function validate(input) {
      var wrap = fieldOf(input);
      if (!wrap) return true;
      var ok = input.checkValidity();
      wrap.classList.toggle('is-bad', !ok);
      var err = wrap.querySelector('.err');
      if (err && !ok) err.textContent = input.validationMessage;
      input.setAttribute('aria-invalid', String(!ok));
      return ok;
    }
    $$('input, select, textarea', form).forEach(function (i) {
      if (i.classList.contains('hp-input')) return;
      i.addEventListener('blur', function () { if (i.value) validate(i); });
      i.addEventListener('input', function () {
        var w = fieldOf(i); if (w && w.classList.contains('is-bad')) validate(i);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('.hp-input');
      if (hp && hp.value) return;                       // bot
      var bad = null;
      $$('input, select, textarea', form).forEach(function (i) {
        if (i.classList.contains('hp-input')) return;
        if (!validate(i) && !bad) bad = i;
      });
      if (bad) { bad.focus(); bad.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); return; }

      var action = form.getAttribute('action') || '';
      var show = function () {
        if (!success) return;
        form.hidden = true;
        success.classList.add('is-on');
        success.setAttribute('tabindex', '-1');
        success.focus();
        success.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
      };
      if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = 'Sending…'; }

      if (!action || action.charAt(0) === '#') { setTimeout(show, 450); return; }  // no endpoint wired yet
      fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw 0; show(); })
        .catch(function () {
          if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label; }
          var note = form.querySelector('[data-form-error]');
          if (note) note.hidden = false;
        });
    });
  });

  /* ---------- Current-year stamps ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

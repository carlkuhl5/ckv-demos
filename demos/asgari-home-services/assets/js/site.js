(function () {
  'use strict';

  // Analytics stub. GA4 snippet is wired in at launch; events are queued in dataLayer.
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    window.dataLayer.push(Object.assign({ event: name }, params || {}));
    if (window.console && console.debug) console.debug('[track]', name, params || '');
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-track]');
    if (t) track(t.getAttribute('data-track'), { href: t.getAttribute('href') });
  });

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus();
      }
    });
  }

  // Before / after sliders
  document.querySelectorAll('[data-ba]').forEach(initBA);
  function initBA(root) {
    var stage = root.querySelector('.ba-stage');
    var range = root.querySelector('.ba-range');
    function set() { stage.style.setProperty('--pos', range.value + '%'); }
    range.addEventListener('input', set); set();
  }

  // Gallery filter
  var grid = document.getElementById('work-grid');
  if (grid) {
    var cards = grid.querySelectorAll('.work-card');
    var empty = document.getElementById('work-empty');
    var btns = document.querySelectorAll('.chip-btn');
    var preset = new URLSearchParams(location.search).get('service');
    function apply(f) {
      var n = 0;
      cards.forEach(function (c) {
        var show = f === 'all' || c.dataset.svc === f;
        c.hidden = !show; if (show) n++;
      });
      empty.hidden = n > 0;
      btns.forEach(function (b) {
        var on = b.dataset.filter === f;
        b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on);
      });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.filter); }); });
    if (preset) apply(preset);

    // Lightbox
    var lb = document.getElementById('lightbox');
    var slot = document.getElementById('lb-slot');
    var lastFocus = null;
    function open(id, trigger) {
      var p = window.PROJECTS[id]; if (!p) return;
      lastFocus = trigger;
      var uid = 'ba-lb';
      slot.innerHTML =
        '<div class="ba" data-ba><div class="ba-stage">' +
        '<img class="ba-after" src="assets/img/p/' + p.kind + '-after.svg" alt="' + p.title + ' after" width="800" height="600">' +
        '<div class="ba-before-clip"><img class="ba-before" src="assets/img/p/' + p.kind + '-before.svg" alt="' + p.title + ' before" width="800" height="600"></div>' +
        '<span class="ba-tag ba-tag-before">Before</span><span class="ba-tag ba-tag-after">After</span>' +
        '<div class="ba-handle" aria-hidden="true"><span></span></div></div>' +
        '<label class="sr-only" for="' + uid + '">Drag to compare before and after</label>' +
        '<input id="' + uid + '" class="ba-range" type="range" min="0" max="100" value="50"></div>';
      initBA(slot.firstChild);
      document.getElementById('lb-title').textContent = p.title;
      document.getElementById('lb-note').textContent = p.note;
      lb.hidden = false; document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    }
    function close() {
      lb.hidden = true; document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lightbox]'); if (b) open(b.dataset.lightbox, b);
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // simple focus trap
        var f = lb.querySelectorAll('button,a,input');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // Estimate form
  var form = document.getElementById('estimate-form');
  if (form) {
    var q = new URLSearchParams(location.search).get('service');
    if (q) { var sel = document.getElementById('f-svc'); if ([].some.call(sel.options, function (o) { return o.value === q; })) sel.value = q; }

    var rules = {
      'f-name': function (v) { return v.trim().length < 2 ? 'Please enter your name.' : ''; },
      'f-phone': function (v) { return v.replace(/\D/g, '').length < 10 ? 'Enter a 10-digit phone number.' : ''; },
      'f-email': function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.'; },
      'f-addr': function (v) { return v.trim().length < 5 ? 'Enter your address or ZIP code.' : ''; },
      'f-svc': function (v) { return v ? '' : 'Choose a service.'; },
      'f-desc': function (v) { return v.trim().length < 10 ? 'Tell us a little about the project.' : ''; }
    };
    function check(id) {
      var el = document.getElementById(id), msg = rules[id](el.value);
      var err = form.querySelector('.err[data-for="' + id + '"]');
      err.textContent = msg; err.hidden = !msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) el.setAttribute('aria-describedby', 'err-' + id), err.id = 'err-' + id;
      return !msg;
    }
    Object.keys(rules).forEach(function (id) {
      document.getElementById(id).addEventListener('blur', function () { check(id); });
    });

    // Photo previews (max 5)
    var files = document.getElementById('f-photos'), thumbs = document.getElementById('thumbs');
    var photoErr = form.querySelector('.err[data-for="f-photos"]');
    files.addEventListener('change', function () {
      thumbs.innerHTML = ''; photoErr.hidden = true;
      var list = [].slice.call(files.files);
      if (list.length > 5) { photoErr.textContent = 'Please choose up to 5 photos. Showing the first 5.'; photoErr.hidden = false; list = list.slice(0, 5); }
      list.forEach(function (f) {
        var li = document.createElement('li'), im = document.createElement('img');
        im.alt = f.name; im.src = URL.createObjectURL(f); li.appendChild(im); thumbs.appendChild(li);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.website.value) return; // honeypot tripped: silently drop
      var firstBad = null;
      Object.keys(rules).forEach(function (id) { if (!check(id) && !firstBad) firstBad = id; });
      if (firstBad) { document.getElementById(firstBad).focus(); return; }
      track('generate_lead', { form: 'estimate', service: form.service.value });
      var confirm = document.getElementById('confirm');
      document.getElementById('confirm-text').textContent =
        'Thanks, ' + form.name.value.trim().split(' ')[0] + '. We will reach out by ' +
        form.contact.value + ' about your project.';
      form.hidden = true; confirm.hidden = false; confirm.focus();
      window.scrollTo({ top: confirm.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
    });
  }

  // Review page
  var rv = document.getElementById('rv-link');
  if (rv) {
    var url = 'https://g.page/r/ASGARI-REVIEW-LINK';
    rv.textContent = url;
    document.getElementById('copy-review').addEventListener('click', function (e) {
      var txt = rv.parentNode.textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { e.target.textContent = 'Copied'; });
    });
  }
})();

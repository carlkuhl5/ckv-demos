/* Streamline Industries demo — nav, hero cycling, scroll tour,
   gallery lightbox, testimonial hover-play, contact form. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------- nav */
  var toggle = $(".nav-toggle");
  var nav = $(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------- hero screen cycling */
  $$("[data-cycle]").forEach(function (stack) {
    var shots = $$(".scr", stack);
    if (shots.length < 2) return;
    var i = 0, timer = null;
    var delay = parseInt(stack.getAttribute("data-cycle"), 10) || 4200;

    function show(n) {
      shots[i].classList.remove("on");
      i = (n + shots.length) % shots.length;
      shots[i].classList.add("on");
      var cap = stack.parentNode.parentNode.querySelector("[data-cycle-cap]");
      if (cap) cap.textContent = shots[i].getAttribute("data-name") || "";
    }
    function start() {
      if (reduce.matches || timer) return;
      timer = setInterval(function () { show(i + 1); }, delay);
    }
    function stop() { clearInterval(timer); timer = null; }

    show(0);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.2 }).observe(stack);
    } else { start(); }
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });
  });

  /* ------------------------------------------------- scroll tour */
  $$("[data-tour]").forEach(function (tour) {
    var steps = $$(".tour-step", tour);
    var stages = $$("[data-tour-stage]", tour);
    if (!steps.length || !stages.length) return;
    var frames = $$("[data-frame]", tour);
    var shots = [];
    stages.forEach(function (st) { shots = shots.concat($$(".scr", st)); });
    var byKey = {};
    shots.forEach(function (s) { byKey[s.getAttribute("data-key")] = s; });

    function activate(step) {
      steps.forEach(function (s) { s.classList.toggle("is-active", s === step); });
      var key = step.getAttribute("data-key");
      var shot = byKey[key];
      shots.forEach(function (s) { s.classList.toggle("on", s === shot); });
      // a phone screen belongs in the phone frame, not the laptop
      frames.forEach(function (f) { f.classList.toggle("frame-on", !!shot && f.contains(shot)); });
      var cap = $("[data-tour-cap]", tour);
      if (cap && shot) cap.textContent = shot.getAttribute("data-name") || "";
    }

    var current = steps[0];
    activate(current);

    // whichever step sits closest to the middle of the viewport wins
    function pick() {
      if (window.innerWidth < 980) return;
      var mid = window.innerHeight * 0.48;
      var best = null, bestD = Infinity;
      for (var i = 0; i < steps.length; i++) {
        var r = steps[i].getBoundingClientRect();
        var d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (d < bestD) { bestD = d; best = steps[i]; }
      }
      if (best && best !== current) { current = best; activate(best); }
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; pick(); });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    pick();

    // pointer and keyboard both jump straight to a step
    steps.forEach(function (s) {
      function go() { if (window.innerWidth >= 980) { current = s; activate(s); } }
      s.addEventListener("focusin", go);
      s.addEventListener("mouseenter", go);
    });
  });

  /* ------------------------------------------------- lightbox */
  var lb = $("#lightbox");
  if (lb) {
    var lbImg = $("img", lb), lbCap = $(".lb-cap", lb), lastFocus = null;
    function openLb(src, cap, alt) {
      lastFocus = document.activeElement;
      lbImg.src = src;
      lbImg.alt = alt || cap || "";
      lbCap.textContent = cap || "";
      // a landscape Dashboard screen shrunk to phone width is unreadable,
      // so let it render wider and pan instead
      lb.classList.toggle("wide", /dash-home|pipeline|ai-parts|benchmarks|call-kpis|conversion/.test(src));
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      $(".lb-close", lb).focus();
    }
    function closeLb() {
      lb.classList.remove("open");
      lbImg.removeAttribute("src");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    $$("[data-zoom]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLb(btn.getAttribute("data-zoom"), btn.getAttribute("data-cap"),
               btn.getAttribute("data-alt"));
      });
    });
    // any inline screen can be tapped to read it full size — matters on a phone,
    // where a Dashboard screen is otherwise too small to read
    document.addEventListener("click", function (e) {
      var img = e.target.closest ? e.target.closest(".tour-shot img, .fr-shot img, .split-shot img") : null;
      if (!img) return;
      openLb(img.getAttribute("src"), img.getAttribute("data-name") || "",
             img.getAttribute("alt"));
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.closest(".lb-close")) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("open")) closeLb();
    });
  }

  /* --------------------------------- testimonial hover/tap to play */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  $$(".vcard").forEach(function (card) {
    var vid = $("video", card);
    function play() {
      card.classList.add("playing");
      if (vid) { vid.muted = true; var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
    }
    function stop() {
      card.classList.remove("playing");
      if (vid) { vid.pause(); vid.currentTime = 0; }
    }
    if (fine.matches) {
      card.addEventListener("mouseenter", play);
      card.addEventListener("mouseleave", stop);
      card.addEventListener("focusin", play);
      card.addEventListener("focusout", stop);
    }
    card.addEventListener("click", function () {
      if (card.classList.contains("playing") && vid) {
        vid.muted = !vid.muted;              // click turns the sound on
        card.classList.toggle("sound", !vid.muted);
      } else if (card.classList.contains("playing")) {
        stop();
      } else {
        play();
      }
    });
  });

  /* ------------------------------------------------- contact form */
  var form = $("#contact-form");
  if (form) {
    var card = form.closest(".form-card");
    var rules = {
      name: function (v) { return v.trim().length > 1 || "Please enter your name."; },
      email: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address.";
      },
      phone: function (v) {
        var d = v.replace(/\D/g, "");
        return (d.length >= 10 && d.length <= 15) || "Please enter a phone number with at least 10 digits.";
      },
      company: function (v) { return v.trim().length > 1 || "Please enter your company."; },
      message: function (v) { return v.trim().length > 4 || "Tell us a little about what you need."; }
    };

    function check(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var res = rule(input.value);
      var field = input.closest(".field");
      var msg = $(".msg", field);
      if (res === true) {
        field.classList.remove("err");
        input.removeAttribute("aria-invalid");
        return true;
      }
      field.classList.add("err");
      input.setAttribute("aria-invalid", "true");
      if (msg) msg.textContent = res;
      return false;
    }

    $$("input, textarea", form).forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.value) check(input);
      });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("err")) check(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();                           // the demo sends nothing
      if (form.elements.website && form.elements.website.value) return; // honeypot
      var started = parseInt(form.getAttribute("data-t") || "0", 10);
      if (started && Date.now() - started < 2500) return;               // too fast to be human
      var ok = true, first = null;
      $$("input[required], textarea[required]", form).forEach(function (input) {
        if (!check(input)) { ok = false; first = first || input; }
      });
      if (!ok) { first.focus(); return; }
      card.classList.add("sent");
      var thanks = $(".thanks", card);
      thanks.classList.add("show");
      thanks.setAttribute("tabindex", "-1");
      thanks.focus();
    });
    form.setAttribute("data-t", String(Date.now()));
  }

  /* ---------------------------------------- active nav + year */
  var y = $("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();

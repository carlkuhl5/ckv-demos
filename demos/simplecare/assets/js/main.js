// Simple Care Services LLC — site interactions (residential improvements, Louisville KY)
(function () {
  "use strict";

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  var backdrop = document.querySelector(".nav-backdrop");

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (backdrop) backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (backdrop) backdrop.classList.toggle("open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    if (backdrop) backdrop.addEventListener("click", closeNav);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* Mobile services dropdown (tap to expand) */
  document.querySelectorAll(".has-dropdown > a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.innerWidth > 1023) return;
      var parent = link.parentElement;
      var isOpen = parent.classList.contains("open");
      if (!isOpen) {
        e.preventDefault();
        document.querySelectorAll(".has-dropdown.open").forEach(function (el) { el.classList.remove("open"); });
        parent.classList.add("open");
      }
    });
  });

  /* Header shadow on scroll */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Generic form handling (contact, careers, referrals) ---------- */
  function validateField(field) {
    var group = field.closest(".form-group");
    if (!group) return true;
    var valid = field.checkValidity();
    group.classList.toggle("invalid", !valid);
    return valid;
  }

  document.querySelectorAll("form[data-simple-form]").forEach(function (form) {
    var honeypot = form.querySelector(".honeypot-field input");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (honeypot && honeypot.value) {
        // Silently drop likely spam submissions.
        return;
      }

      var fields = form.querySelectorAll("input, select, textarea");
      var allValid = true;
      fields.forEach(function (field) {
        if (field.closest(".honeypot-field")) return;
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        var firstInvalid = form.querySelector(".form-group.invalid input, .form-group.invalid select, .form-group.invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var wrap = form.closest(".form-wrap");
      if (wrap) {
        wrap.classList.add("submitted");
        var success = wrap.querySelector(".form-success");
        if (success) {
          success.classList.add("visible");
          success.setAttribute("tabindex", "-1");
          success.focus();
        }
      }
    });

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.closest(".honeypot-field")) return;
        validateField(field);
      });
    });
  });

  /* ---------- Testimonials filter (testimonials page) ---------- */
  var filterBar = document.querySelector("[data-testimonial-filter]");
  if (filterBar) {
    var filterButtons = filterBar.querySelectorAll("button");
    var cards = document.querySelectorAll("[data-testimonial-service]");
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        var value = btn.getAttribute("data-filter");
        cards.forEach(function (card) {
          var show = value === "all" || card.getAttribute("data-testimonial-service") === value;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }
})();

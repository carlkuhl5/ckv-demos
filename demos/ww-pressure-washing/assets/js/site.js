/* W&W Pressure Washing — front-of-site behaviour.
   No dependencies, deferred, ~4KB. Everything degrades to working HTML
   if JS fails (PRD Section 8 — Core Web Vitals + WCAG 2.1 AA). */
(function () {
  "use strict";

  /* ------------------------------------------------------ mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var backdrop = document.querySelector(".nav-backdrop");
  var nav = document.querySelector(".main-nav");

  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setNav(!document.body.classList.contains("nav-open"));
    });
  }
  if (backdrop) backdrop.addEventListener("click", function () { setNav(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });
  if (nav) {
    nav.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      // let the sub-menu parent expand rather than navigate on small screens
      if (a && !a.closest(".has-dropdown > a")) setNav(false);
    });
  }

  /* ------------------------------------------- before / after sliders */
  document.querySelectorAll(".ba").forEach(function (ba) {
    var range = ba.querySelector(".ba-range");
    if (!range) return;

    function apply(v) { ba.style.setProperty("--pos", v + "%"); }
    apply(range.value);
    range.addEventListener("input", function () { apply(range.value); });

    // dragging anywhere on the image, not just the native thumb
    function fromPointer(e) {
      var r = ba.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var pct = Math.max(0, Math.min(100, (x / r.width) * 100));
      range.value = pct;
      apply(pct);
    }
    var dragging = false;
    ba.addEventListener("pointerdown", function (e) {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      fromPointer(e);
    });
    ba.addEventListener("pointermove", function (e) { if (dragging) fromPointer(e); });
    ba.addEventListener("pointerup", function () { dragging = false; });
    ba.addEventListener("pointercancel", function () { dragging = false; });
  });

  /* ------------------------------------------------- gallery filtering */
  var filterBar = document.querySelector(".filters");
  if (filterBar) {
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var count = document.querySelector("[data-gallery-count]");

    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      var want = btn.dataset.filter;

      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });

      var shown = 0;
      items.forEach(function (item) {
        var match = want === "all" || item.dataset.category === want;
        item.hidden = !match;
        if (match) shown++;
      });
      if (count) {
        count.textContent = shown + (shown === 1 ? " project" : " projects");
      }
    });
  }

  /* --------------------------------------------------- file input UI */
  document.querySelectorAll(".file-drop input[type=file]").forEach(function (input) {
    input.addEventListener("change", function () {
      var out = document.getElementById(input.dataset.namesTarget);
      if (!out) return;
      var n = input.files.length;
      out.textContent = n === 0 ? "" :
        n === 1 ? input.files[0].name : n + " photos selected";
    });
  });

  /* --------------------------------------------------- the quote form */
  /* PRD 6.1: submits without page reload, shows a confirmation, honeypot
     spam trap, and hands the lead to the owner CRM. In this demo the CRM
     handoff is a localStorage write; in production it is the form endpoint
     posting straight into the CRM's lead table. */
  var form = document.getElementById("quote-form");
  if (form) {
    var successBox = document.getElementById("quote-success");

    function fieldOf(el) { return el.closest(".field"); }

    function validate(el) {
      var wrap = fieldOf(el);
      if (!wrap) return true;
      var ok = el.checkValidity();
      wrap.classList.toggle("has-error", !ok);
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      var err = wrap.querySelector(".error");
      if (err && !ok) {
        err.textContent = el.validity.valueMissing
          ? (el.dataset.msgRequired || "This field is required.")
          : (el.dataset.msgInvalid || "Please check this entry.");
      }
      return ok;
    }

    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("blur", function () {
        if (el.value !== "" || el.required) validate(el);
      });
      el.addEventListener("input", function () {
        var wrap = fieldOf(el);
        if (wrap && wrap.classList.contains("has-error")) validate(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot — bots fill hidden fields, humans never see them
      if (form.querySelector("[name=company_website]").value !== "") return;

      var fields = Array.prototype.slice.call(
        form.querySelectorAll("input[required], select[required], textarea[required]")
      );
      var valid = fields.map(validate).every(Boolean);
      if (!valid) {
        var bad = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (bad) { bad.focus(); bad.scrollIntoView({ block: "center", behavior: "smooth" }); }
        return;
      }

      var data = new FormData(form);
      var photos = form.querySelector("input[type=file]");
      var lead = {
        id: "L" + Date.now().toString(36).toUpperCase(),
        name: (data.get("name") || "").trim(),
        phone: (data.get("phone") || "").trim(),
        email: (data.get("email") || "").trim(),
        address: (data.get("address") || "").trim(),
        zip: (data.get("zip") || "").trim(),
        service: data.get("service") || "",
        contactPref: data.get("contact_pref") || "Phone",
        message: (data.get("message") || "").trim(),
        photoCount: photos && photos.files ? photos.files.length : 0,
        source: "Website form",
        stage: "New",
        createdAt: new Date().toISOString()
      };

      try {
        var key = "ww_crm_inbound";
        var queue = JSON.parse(localStorage.getItem(key) || "[]");
        queue.push(lead);
        localStorage.setItem(key, JSON.stringify(queue));
      } catch (err) {
        /* private browsing — the demo CRM just won't show this one */
      }

      var btn = form.querySelector("[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      // stands in for the network round-trip to the form endpoint
      setTimeout(function () {
        form.classList.add("submitted");
        if (successBox) {
          successBox.classList.add("show");
          successBox.setAttribute("tabindex", "-1");
          successBox.focus();
          successBox.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }, 550);
    });
  }

  /* ------------------------------------------- current year in footer */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

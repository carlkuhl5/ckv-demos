/* Louisville Podcast Studio — site behaviour
   No dependencies. Everything degrades to working HTML without JS. */
(function () {
  "use strict";

  var d = document;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- analytics ---------------- */

  function track(name, params) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, params || {}));
      if (typeof window.gtag === "function") window.gtag("event", name, params || {});
    } catch (e) {}
  }
  window.lpsTrack = track;

  d.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track]");
    if (!el) return;
    track(el.getAttribute("data-track"), {
      label: el.getAttribute("data-track-label") || el.textContent.trim().slice(0, 60),
      page: location.pathname
    });
  });

  /* ---------------- mobile nav ---------------- */

  var toggle = d.querySelector(".nav-toggle");
  var nav = d.getElementById("primary-nav");

  if (toggle && nav) {
    var header = d.querySelector(".site-header");

    var close = function () {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      nav.classList.remove("open");
      d.documentElement.style.overflow = "";
    };

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (!open && header) {
        /* Anchor the panel under whatever the header's real bottom edge is. */
        d.documentElement.style.setProperty(
          "--hdr-bottom", Math.round(header.getBoundingClientRect().bottom) + "px"
        );
      }
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", !open ? "Close menu" : "Open menu");
      nav.classList.toggle("open", !open);
      d.documentElement.style.overflow = !open ? "hidden" : "";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        close();
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) close();
    });
  }

  /* ---------------- reveal on scroll ---------------- */

  var reveals = Array.prototype.slice.call(d.querySelectorAll(".reveal"));

  function revealAll() {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  if (reveals.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      revealAll();
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          /* Reveal anything intersecting, and anything the viewport has
             already scrolled past — a fast flick or an anchor jump can skip
             the intersecting frame entirely. */
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -40px 0px", threshold: 0 });

      reveals.forEach(function (el) { io.observe(el); });

      /* Belt and braces: anything still hidden after the page settles is
         shown regardless. Content must never be stuck invisible. */
      var sweep = function () {
        reveals.forEach(function (el) {
          if (el.classList.contains("in")) return;
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      };
      window.addEventListener("scroll", sweep, { passive: true });
      window.addEventListener("resize", sweep, { passive: true });
      window.addEventListener("load", sweep);
      setTimeout(revealAll, 2500);
    }
  }

  /* ---------------- blog filters ---------------- */

  var filterBar = d.querySelector("[data-filters]");
  if (filterBar) {
    var cards = Array.prototype.slice.call(d.querySelectorAll("[data-cat]"));
    var empty = d.querySelector("[data-filter-empty]");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      var cat = btn.getAttribute("data-filter");
      filterBar.querySelectorAll(".filter").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      var shown = 0;
      cards.forEach(function (card) {
        var match = cat === "all" || card.getAttribute("data-cat") === cat;
        card.classList.toggle("hide", !match);
        if (match) shown++;
      });
      if (empty) empty.classList.toggle("hide", shown > 0);
    });
  }

  /* ---------------- request form ---------------- */

  /* Preselect a membership tier or service from ?tier= / ?service= and focus
     the form when the page is opened from a "Get started" / "Ask about this"
     button elsewhere on the site. */
  function presetFromQuery() {
    var q = new URLSearchParams(location.search);
    var tier = q.get("tier");
    var service = q.get("service");
    var loc = q.get("location");

    if (tier) {
      var tierInput = d.querySelector('input[name="tier"][value="' + CSS.escape(tier) + '"]');
      if (tierInput) tierInput.checked = true;
      var interest = d.querySelector('select[name="interest"]');
      if (interest && interest.querySelector('option[value="Membership"]')) {
        interest.value = "Membership";
      }
    }
    if (service) {
      var sel = d.querySelector('select[name="service"]');
      if (sel) {
        Array.prototype.slice.call(sel.options).forEach(function (o) {
          if (o.value.toLowerCase() === service.toLowerCase()) sel.value = o.value;
        });
      }
      var interest2 = d.querySelector('select[name="interest"]');
      if (interest2 && interest2.querySelector('option[value="Services"]')) {
        interest2.value = "Services";
      }
    }
    if (loc) {
      var locInput = d.querySelector('input[name="location"][value="' + CSS.escape(loc) + '"]');
      if (locInput) locInput.checked = true;
    }
    /* Say out loud what came across, so the choice made on another page is
       visible rather than buried in a pre-ticked radio further down. */
    var note = d.querySelector("[data-preset]");
    if (note && (tier || service)) {
      var label = "";
      if (tier) {
        var chip = d.querySelector('input[name="tier"][value="' + CSS.escape(tier) + '"]');
        var name = chip && chip.nextElementSibling
          ? chip.nextElementSibling.textContent.trim()
          : tier;
        label = "Starting the <b>" + name + "</b> membership. Fill in the rest and we " +
                "will come back to you with times.";
      } else {
        label = "Asking about <b>" + service.replace(/\+/g, " ") + "</b>. Add your " +
                "details and we will reply with a quote.";
      }
      note.querySelector("[data-preset-text]").innerHTML = label;
      note.hidden = false;
      note.classList.remove("hide");
    }

    if ((tier || service || loc) && location.hash) {
      var target = d.querySelector(location.hash);
      if (target) {
        setTimeout(function () {
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        }, 60);
      }
    }
  }
  if (d.querySelector("form[data-form]")) presetFromQuery();

  function validate(form) {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (input) {
      var field = input.closest(".field") || input.closest("fieldset");
      var valid = input.checkValidity() && String(input.value).trim() !== "";
      if (field) field.classList.toggle("invalid", !valid);
      if (!valid && ok) {
        input.focus();
        ok = false;
      }
    });
    return ok;
  }

  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (!String(value).trim()) return;
      data[key] = data[key] ? data[key] + ", " + value : value;
    });
    return data;
  }

  function labelFor(form, key) {
    var el = form.querySelector('[name="' + key + '"]');
    if (!el) return key;
    var fs = el.closest("fieldset");
    if (fs && fs.querySelector("legend")) return fs.querySelector("legend").textContent.trim();
    var field = el.closest(".field");
    if (field && field.querySelector("label")) {
      return field.querySelector("label").textContent.replace("*", "").trim();
    }
    return key;
  }

  function mailtoFallback(form, data) {
    var to = form.getAttribute("data-mailto");
    var subject = form.getAttribute("data-subject") || "Website enquiry";
    var lines = Object.keys(data).map(function (k) {
      return labelFor(form, k) + ": " + data[k];
    });
    lines.push("", "Sent from louisvillepodcast.studio");
    var href =
      "mailto:" + to +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    window.location.href = href;
  }

  /* The status panel is a sibling of the form's card, not of the form, so
     walk up until we find it. */
  function statusFor(form) {
    var node = form;
    while (node && node !== d.body) {
      var found = node.parentNode && node.parentNode.querySelector(".form-status");
      if (found) return found;
      node = node.parentNode;
    }
    return null;
  }

  function showStatus(form, mailed) {
    var status = statusFor(form);
    if (!status) return;
    if (mailed) {
      var alt = status.getAttribute("data-mailto-message");
      if (alt) status.querySelector("[data-status-body]").textContent = alt;
    }
    status.classList.add("show");
    status.setAttribute("tabindex", "-1");
    status.focus({ preventScroll: true });
    status.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  }

  d.querySelectorAll("form[data-form]").forEach(function (form) {
    form.setAttribute("novalidate", "");

    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field, fieldset");
      if (field && field.classList.contains("invalid")) field.classList.remove("invalid");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;

      var kind = form.getAttribute("data-form");
      var data = collect(form);
      var endpoint = form.getAttribute("data-endpoint");
      var btn = form.querySelector('[type="submit"]');

      track(kind === "newsletter" ? "newsletter_signup" : "request_form_submit", {
        form: kind,
        tier: data.tier || "",
        service: data.service || "",
        location: data.location || ""
      });

      /* No form service wired up yet (see README). Hand the enquiry to the
         visitor's mail client so nothing is silently lost. */
      if (!endpoint) {
        mailtoFallback(form, data);
        form.reset();
        showStatus(form, true);
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.dataset.label = btn.textContent;
        btn.textContent = "Sending…";
      }

      fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("bad status");
          form.reset();
          showStatus(form, false);
        })
        .catch(function () {
          mailtoFallback(form, data);
          showStatus(form, true);
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = btn.dataset.label;
          }
        });
    });
  });

  /* ---------------- marquee duplication ---------------- */

  d.querySelectorAll(".marquee-track").forEach(function (track) {
    if (reduced) return;
    track.innerHTML = track.innerHTML + track.innerHTML;
  });

  /* ---------------- current-year ---------------- */

  d.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

/* =========================================================================
   Association of the Louisville Orchestra — site behaviour
   -------------------------------------------------------------------------
   DEMO NOTE. Every checkout on this build is a front-end simulation. On the
   real site the same flows post to a Laravel application and settle through
   Stripe under the ALO's own account (PRD Section 11 — Stack), with card
   fields hosted by Stripe so no card data ever reaches the ALO's servers.
   What is real here is the *shape* of each flow, which is the thing the PRD
   is actually about: one uninterrupted path per transaction, price always
   visible, totals that update live, and no handoff to a second system to pay.
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  var USD2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function money(n) { return n % 1 === 0 ? USD.format(n) : USD2.format(n); }

  /* ------------------------------------------------------------- nav */
  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $(".main-nav");
    var backdrop = $(".nav-backdrop");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("open", open);
      if (backdrop) backdrop.classList.toggle("show", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open && window.innerWidth < 1040 ? "hidden" : "";
    }
    toggle.addEventListener("click", function () {
      setOpen(nav.classList.contains("open") === false);
    });
    if (backdrop) backdrop.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setOpen(false); closePanels(); }
    });

    // Dropdowns need no JS: CSS opens them on hover for pointers and on
    // :focus-within for keyboards. This only closes a panel a touch user has
    // opened by tapping, which otherwise stays open until they tap elsewhere.
    function closePanels() {
      $$(".nav-item.open").forEach(function (li) { li.classList.remove("open"); });
    }
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-item")) closePanels();
    });
  }

  /* ---------------------------------------------------------- reveal */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    // Only now, with the observer about to be attached, is it safe to hide
    // anything. Everything below is guaranteed to get its "in" class back.
    document.documentElement.classList.add("js-reveal");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });

    // Belt and braces. IntersectionObserver does not fire while a page's
    // rendering is suppressed — a background tab, a hidden pane, some print
    // paths — and a reveal that never fires is content the reader never sees.
    // This sweep runs on a plain timer and on scroll, independent of the
    // observer, so nothing can stay stuck at opacity 0.
    function sweep() {
      var pending = false;
      items.forEach(function (el) {
        if (el.classList.contains("in")) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 1.25) {
          el.classList.add("in");
        } else { pending = true; }
      });
      if (!pending) {
        window.removeEventListener("scroll", onScroll);
        clearInterval(timer);
      }
    }
    var onScroll = function () { requestAnimationFrame(sweep); };
    var timer = setInterval(sweep, 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(sweep, 900);
  }

  /* -------------------------------------------------------- steppers */
  function initSteppers() {
    $$(".stepper").forEach(function (st) {
      var input = $("input", st);
      var dec = $('[data-step="-1"]', st);
      var inc = $('[data-step="1"]', st);
      var min = parseInt(input.min || "1", 10);
      var max = parseInt(input.max || "99", 10);

      function clamp(v) { return Math.max(min, Math.min(max, isNaN(v) ? min : v)); }
      function set(v) {
        input.value = clamp(v);
        if (dec) dec.disabled = input.value <= min;
        if (inc) inc.disabled = input.value >= max;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (dec) dec.addEventListener("click", function () { set(parseInt(input.value, 10) - 1); });
      if (inc) inc.addEventListener("click", function () { set(parseInt(input.value, 10) + 1); });
      input.addEventListener("change", function () { set(parseInt(input.value, 10)); });
      set(parseInt(input.value, 10));
    });
  }

  /* ------------------------------------------------------- countdown */
  // PRD Section 08 — "a countdown appears when [the drawing] is within 30 days."
  // Outside that window the drawing date is published but the ticker is not
  // shown, so it means something when it does appear.
  function initCountdown() {
    var el = $("[data-countdown]");
    if (!el) return;
    var target = new Date(el.getAttribute("data-countdown") + "T19:00:00");
    var within = parseInt(el.getAttribute("data-countdown-within") || "30", 10);
    var daysOut = Math.ceil((target - new Date()) / 86400000);

    if (daysOut > within) {
      el.classList.add("countdown-pending");
      el.innerHTML = '<p><strong>' + daysOut + ' days</strong> until the drawing. ' +
        'The live countdown starts ' + within + ' days out.</p>';
      return;
    }

    function tick() {
      var ms = target - new Date();
      if (ms <= 0) {
        el.innerHTML = '<div><span class="n">—</span><span class="l">Drawing held</span></div>';
        return;
      }
      var d = Math.floor(ms / 86400000);
      var h = Math.floor(ms / 3600000) % 24;
      var m = Math.floor(ms / 60000) % 60;
      var s = Math.floor(ms / 1000) % 60;
      var parts = [[d, "Days"], [h, "Hours"], [m, "Minutes"], [s, "Seconds"]];
      el.innerHTML = parts.map(function (p) {
        return '<div><span class="n">' + p[0] + '</span><span class="l">' + p[1] + "</span></div>";
      }).join("");
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ----------------------------------------------------- live totals */
  /* A form marked data-checkout recalculates its own summary on every input.
     Line items are declared in the markup, so the summary can never drift
     from the form the way two hand-built Wix pages drift from each other. */
  function initCheckouts() {
    $$("[data-checkout]").forEach(function (form) {
      var kind = form.getAttribute("data-checkout");
      var linesEl = $("[data-summary-lines]", form.closest("[data-checkout-root]") || document);
      var totalEl = $("[data-summary-total]", form.closest("[data-checkout-root]") || document);
      var deductEl = $("[data-summary-deductible]", form.closest("[data-checkout-root]") || document);
      var submitEl = $("[data-submit-label]", form.closest("[data-checkout-root]") || document);

      function lines() {
        var out = [];

        if (kind === "membership") {
          var tier = $('input[name="tier"]:checked', form);
          if (tier) {
            out.push({
              label: tier.getAttribute("data-label") + " membership",
              amount: parseFloat(tier.value),
              note: tier.getAttribute("data-term")
            });
          }
          var gift = $('input[name="gift"]', form);
          if (gift && gift.checked) out.push({ label: "Gift membership — recipient named below", amount: 0 });
        }

        if (kind === "event") {
          var price = parseFloat(form.getAttribute("data-price"));
          var qtyEl = $('input[name="qty"]', form);
          var qty = qtyEl ? parseInt(qtyEl.value, 10) || 1 : 1;
          out.push({ label: form.getAttribute("data-event") + " × " + qty, amount: price * qty });
        }

        if (kind === "raffle") {
          var single = parseFloat(form.getAttribute("data-single"));
          var bundlePrice = parseFloat(form.getAttribute("data-bundle-price"));
          var bundleQty = parseInt(form.getAttribute("data-bundle-qty"), 10);
          var n = parseInt(($('input[name="tickets"]', form) || {}).value, 10) || 0;
          // Bundle math the officer currently does by hand in an email thread.
          var bundles = Math.floor(n / bundleQty);
          var singles = n % bundleQty;
          if (bundles) out.push({ label: bundles + " × book of " + bundleQty, amount: bundles * bundlePrice });
          if (singles) out.push({ label: singles + " × single ticket", amount: singles * single });
          if (!n) out.push({ label: "No tickets selected", amount: 0 });
          // Display-only line. The book price above is ALREADY discounted, so
          // this must not be subtracted again — it is what the buyer avoided
          // paying, not a further reduction.
          var saved = n * single - (bundles * bundlePrice + singles * single);
          if (saved > 0) {
            out.push({ label: "Book pricing saved you", amount: saved, info: true });
          }
        }

        if (kind === "yac") {
          var fee = parseFloat(form.getAttribute("data-fee"));
          var divs = $$('input[name="division"]:checked', form);
          divs.forEach(function (d) {
            out.push({ label: d.getAttribute("data-label"), amount: fee });
          });
          if (!divs.length) out.push({ label: "No division selected", amount: 0 });
        }

        if (kind === "donate") {
          var amt = 0;
          var picked = $('input[name="amount"]:checked', form);
          if (picked && picked.value === "custom") {
            amt = parseFloat(($('input[name="custom"]', form) || {}).value) || 0;
          } else if (picked) {
            amt = parseFloat(picked.value);
          }
          var monthly = $('input[name="monthly"]', form);
          var recurring = monthly && monthly.checked;
          out.push({
            label: recurring ? "Monthly gift" : "One-time gift",
            amount: amt,
            note: recurring ? "Charged every month until you cancel" : null
          });
          var tribute = $('input[name="tribute"]', form);
          if (tribute && tribute.checked) {
            var who = ($('input[name="honoree"]', form) || {}).value;
            out.push({ label: "Remember with Music" + (who ? " — " + who : ""), amount: 0 });
          }
        }
        return out;
      }

      function render() {
        var ls = lines();
        // `info` lines are shown but never counted — see the raffle's book
        // pricing note, which reports a saving already priced into the line
        // above it.
        var total = ls.reduce(function (a, l) { return l.info ? a : a + l.amount; }, 0);

        if (linesEl) {
          linesEl.innerHTML = ls.map(function (l) {
            var amt = l.info ? "&minus;" + money(l.amount)
                             : (l.amount === 0 ? "Included" : money(l.amount));
            return "<li" + (l.info ? ' class="line-info"' : "") + "><span>" + l.label +
              (l.note ? '<br><small class="muted">' + l.note + "</small>" : "") +
              "</span><span>" + amt + "</span></li>";
          }).join("");
        }
        if (totalEl) totalEl.textContent = money(total);

        // PRD Section 07 — the deductibility figure appears on the checkout
        // itself, not only in a paragraph on one page.
        if (deductEl) {
          var pct = parseFloat(deductEl.getAttribute("data-deductible-pct") || "100");
          deductEl.textContent = money(total * pct / 100);
        }
        if (submitEl) {
          var verb = submitEl.getAttribute("data-verb") || "Pay";
          submitEl.textContent = total > 0 ? verb + " " + money(total) : verb;
        }

        var monthlyEl = $('input[name="monthly"]', form);
        var recurLabel = $("[data-recurring-suffix]", form.closest("[data-checkout-root]") || document);
        if (recurLabel) recurLabel.hidden = !(monthlyEl && monthlyEl.checked);
      }

      form.addEventListener("input", render);
      form.addEventListener("change", render);
      render();

      // Custom-amount field only matters when "Other" is the chosen level.
      var customWrap = $("[data-custom-wrap]", form);
      if (customWrap) {
        form.addEventListener("change", function () {
          var picked = $('input[name="amount"]:checked', form);
          customWrap.hidden = !(picked && picked.value === "custom");
          if (!customWrap.hidden) { var i = $("input", customWrap); if (i) i.focus(); }
        });
      }

      // Conditional blocks: [data-reveal-when="checkboxName"]
      $$("[data-reveal-when]", form).forEach(function (block) {
        var name = block.getAttribute("data-reveal-when");
        function sync() {
          var box = $('input[name="' + name + '"]', form);
          block.hidden = !(box && box.checked);
        }
        form.addEventListener("change", sync);
        sync();
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validate(form)) return;
        showReceipt(form, kind, lines());
      });
    });
  }

  /* -------------------------------------------------- YAC repertoire */
  /* PRD Section 09: "An applicant entering more than one division adds a
     division to the same application and pays $30 per division in one
     transaction, rather than resubmitting the full form." Each checked
     division reveals its own repertoire block on the same page. */
  function initDivisions() {
    var form = $('[data-checkout="yac"]');
    if (!form) return;
    function sync() {
      $$("[data-division-block]", form).forEach(function (block) {
        var slug = block.getAttribute("data-division-block");
        var box = $('input[name="division"][data-slug="' + slug + '"]', form);
        block.hidden = !(box && box.checked);
        $$("input,select,textarea", block).forEach(function (f) { f.disabled = block.hidden; });
      });
      var any = $$('input[name="division"]:checked', form).length;
      var empty = $("[data-divisions-empty]", form);
      if (empty) empty.hidden = any > 0;
    }
    form.addEventListener("change", sync);
    sync();
  }

  /* ------------------------------------------------------ validation */
  function validate(form) {
    var firstBad = null;
    $$("[required]", form).forEach(function (f) {
      if (f.disabled) return;
      var wrap = f.closest(".field") || f.closest("fieldset");
      var ok = f.type === "checkbox" ? f.checked : String(f.value || "").trim() !== "";
      if (ok && f.type === "email") ok = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(f.value);
      if (wrap) wrap.classList.toggle("invalid", !ok);
      if (!ok && !firstBad) firstBad = f;
    });
    // Radio/checkbox groups marked data-require-one
    $$("[data-require-one]", form).forEach(function (group) {
      var name = group.getAttribute("data-require-one");
      var any = $$('input[name="' + name + '"]:checked', form).length > 0;
      group.classList.toggle("invalid", !any);
      var err = $(".err", group);
      if (err) err.style.display = any ? "none" : "block";
      if (!any && !firstBad) firstBad = $('input[name="' + name + '"]', form);
    });
    if (firstBad) {
      firstBad.focus({ preventScroll: true });
      firstBad.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      return false;
    }
    return true;
  }

  /* --------------------------------------------------------- receipt */
  /* Stands in for the emailed confirmation the PRD requires within 60 seconds
     (Section 07 — Confirmation). Rendered inline so the demo can show what
     the buyer actually receives, including the next-step link. */
  var RECEIPTS = {
    membership: {
      title: "You're a member.",
      body: "A receipt naming your tier, the amount, the term, and your renewal date is on its way to your inbox — with a link to the event calendar so your first A la Carte booking is one tap away.",
      next: ["events.html", "See what's coming up"]
    },
    event: {
      title: "Your seats are reserved.",
      body: "Your confirmation includes the venue address and your host's contact details. Your name is already on the host's list — nobody has to email it over.",
      next: ["events.html", "Back to the season"]
    },
    raffle: {
      title: "Tickets purchased.",
      body: "Your sequential ticket numbers are in your confirmation email. They are also in the organizer's export, so the drawing does not depend on anyone's inbox.",
      next: ["events/bourbon-raffle.html", "Back to the raffle"]
    },
    yac: {
      title: "Application submitted.",
      body: "You and your parent or guardian both receive a confirmation listing every division entered, the amount paid, and what happens next. Your repertoire files are attached to the application itself.",
      next: ["young-artists.html", "Back to the competition"]
    },
    donate: {
      title: "Thank you.",
      body: "Your receipt states the ALO's 501(c)(3) status and EIN, the amount, and that no goods or services were provided in exchange — everything your accountant needs, without a phone call.",
      next: ["index.html", "Back to the home page"]
    }
  };

  function showReceipt(form, kind, ls) {
    var cfg = RECEIPTS[kind] || RECEIPTS.donate;
    var root = form.closest("[data-checkout-root]") || form.parentNode;
    var total = ls.reduce(function (a, l) { return a + l.amount; }, 0);
    var ref = "ALO-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);

    var rows = ls.filter(function (l) { return l.amount !== 0 && !l.info; }).map(function (l) {
      return "<li><span>" + l.label + "</span><span>" + money(l.amount) + "</span></li>";
    }).join("");

    root.innerHTML =
      '<div class="card receipt" tabindex="-1" style="max-width:640px;margin:0 auto">' +
        '<span class="pill pill-open" style="margin-bottom:1rem">Confirmed</span>' +
        "<h2>" + cfg.title + "</h2>" +
        "<p>" + cfg.body + "</p>" +
        '<ul class="summary-lines" style="margin-top:1.4rem">' + rows +
          "<li><span>Reference</span><span>" + ref + "</span></li></ul>" +
        '<div class="summary-total"><span class="t">Total charged</span><span class="v">' + money(total) + "</span></div>" +
        '<div class="demo-note" style="margin-top:0">' +
          '<span class="tag">Demo</span>' +
          "<p><strong>No payment was processed.</strong> On the live site this step is a Stripe " +
          "charge under the ALO's own account, and the confirmation email leaves within a minute. " +
          "Nothing here is reconciled by hand.</p></div>" +
        '<a class="btn btn-outline" href="' + cfg.next[0] + '">' + cfg.next[1] + "</a>" +
      "</div>";

    var card = $(".receipt", root);
    card.focus();
    card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  /* --------------------------------------------------------- filters */
  /* Past-events archive: filter by season without a page load. */
  function initFilters() {
    $$("[data-filter-group]").forEach(function (group) {
      var targetSel = group.getAttribute("data-filter-target");
      group.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-filter]");
        if (!btn) return;
        var val = btn.getAttribute("data-filter");
        $$("[data-filter]", group).forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("btn-dark", on);
          b.classList.toggle("btn-outline", !on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        $$(targetSel).forEach(function (sec) {
          sec.hidden = val !== "all" && sec.getAttribute("data-season") !== val;
        });
      });
    });
  }

  /* ------------------------------------------------ deep-link prefill */
  /* The tier cards on /membership link to /membership/join.html?tier=lifetime,
     and the contact CTAs link to /contact.html?topic=events. Honour those, so
     a visitor who chose on the previous page does not choose again. */
  function initPrefill() {
    var params = new URLSearchParams(window.location.search);

    var tier = params.get("tier");
    if (tier) {
      var radio = $('input[name="tier"][data-slug="' + CSS.escape(tier) + '"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
        radio.closest(".choice").scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth", block: "center"
        });
      }
    }

    var topic = params.get("topic");
    if (topic) {
      var sel = $("#topic");
      if (sel && $('option[value="' + CSS.escape(topic) + '"]', sel)) {
        sel.value = topic;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    var amount = params.get("amount");
    if (amount) {
      var amt = $('input[name="amount"][value="' + CSS.escape(amount) + '"]');
      if (amt) {
        amt.checked = true;
        amt.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  /* ------------------------------------------------------------ init */
  function boot() {
    initNav();
    initReveal();
    initSteppers();
    initCountdown();
    initCheckouts();
    initDivisions();
    initFilters();
    initPrefill();
    var y = $("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();

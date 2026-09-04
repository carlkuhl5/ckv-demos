/* =========================================================================
   Board admin — PRD Section 10.
   Renders from the JSON payload the build embeds, filters client-side, and
   exports real CSV files. On the live build the same views are server-rendered
   from the Laravel application with role-based access enforced server-side —
   the role switcher here is a demonstration of the shape, not the security.
   ========================================================================= */
(function () {
  "use strict";

  var el = document.getElementById("admin-data");
  if (!el) return;
  var DB = JSON.parse(el.textContent);

  var USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  var NUM = new Intl.NumberFormat("en-US");
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function money(n) { return USD.format(n); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  /* ------------------------------------------------- role-based access */
  // PRD: "A committee chair sees their own area and nothing else they can break."
  var ROLES = {
    admin: { tabs: null, note: "" },
    membership: {
      tabs: ["dashboard", "members", "orders"],
      note: "Signed in as VP Membership. This role sees the roster and the orders behind it. " +
            "Competition applications and the audit trail are not available to it."
    },
    education: {
      tabs: ["dashboard", "yac"],
      note: "Signed in as VP Education. This role sees competition applications, including " +
            "student and guardian records. Those records are visible to no other role and are " +
            "excluded from every marketing export."
    },
    events: {
      tabs: ["dashboard", "events", "orders"],
      note: "Signed in as VP Ways &amp; Means. This role publishes and edits events and sees " +
            "ticket and raffle orders. Member records are not available to it."
    }
  };

  function applyRole(role) {
    var cfg = ROLES[role] || ROLES.admin;
    var banner = $("#role-banner");
    banner.hidden = !cfg.note;
    if (cfg.note) $("p", banner).innerHTML = cfg.note;

    $$(".tab").forEach(function (t) {
      var allowed = !cfg.tabs || cfg.tabs.indexOf(t.dataset.tab) > -1;
      t.disabled = !allowed;
      t.title = allowed ? "" : "Not available to this role";
    });
    var cur = $(".tab.active");
    if (cur && cur.disabled) show(cfg.tabs[0]);
  }

  /* ------------------------------------------------------------- tabs */
  function show(key) {
    $$(".tab").forEach(function (t) {
      var on = t.dataset.tab === key;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".panel").forEach(function (p) {
      var on = p.dataset.panel === key;
      p.classList.toggle("active", on);
      p.hidden = !on;
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () { if (!t.disabled) show(t.dataset.tab); });
  });
  $$("[data-goto]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); show(a.dataset.goto); });
  });

  /* -------------------------------------------------------- dashboard */
  function ordersSince(days) {
    if (days >= 9999) return DB.orders;
    var cut = daysAgo(days);
    return DB.orders.filter(function (o) { return o.date >= cut; });
  }

  function renderDashboard() {
    var days = parseInt($("#range").value, 10);
    var rows = ordersSince(days);
    var total = rows.reduce(function (a, o) { return a + o.amount; }, 0);

    var bySource = {};
    rows.forEach(function (o) { bySource[o.type] = (bySource[o.type] || 0) + o.amount; });
    var pairs = Object.keys(bySource).map(function (k) { return [k, bySource[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; });
    var max = pairs.length ? pairs[0][1] : 1;

    $("#revenue-chart").innerHTML = '<div class="bars">' + pairs.map(function (p, i) {
      return '<div class="bar-row" style="--i:' + i + '"><span class="k">' + esc(p[0]) + "</span>" +
        '<span class="bar-track"><i></i></span>' +
        '<span class="v">' + money(p[1]) + "</span></div>";
    }).join("") + "</div>";
    // Set the widths on the next frame so the bars animate out from zero
    // rather than being painted at their final length.
    grow("#revenue-chart", pairs.map(function (p) { return Math.max(2, p[1] / max * 100); }));

    var label = days >= 9999 ? "All time" : "Last " + days + " days";
    $$("[data-range-label]").forEach(function (n) { n.textContent = label; });

    set("revenue", "", rows.length + " transactions · " + label);
    countTo($('[data-tile="revenue"]'), total, money);
    set("members", "", DB.counts.lapsed + " lapsed, not yet renewed");
    countTo($('[data-tile="members"]'), DB.counts.active, function (v) { return NUM.format(Math.round(v)); });
    set("expiring", "", "Automated reminders already sent");
    countTo($('[data-tile="expiring"]'), DB.counts.expiring, function (v) { return NUM.format(Math.round(v)); });
    set("apps", "", money(DB.apps.reduce(function (a, x) { return a + x.paid; }, 0)) + " in entry fees collected");
    countTo($('[data-tile="apps"]'), DB.apps.length, function (v) { return NUM.format(Math.round(v)); });

    ["active", "expiring", "lapsed"].forEach(function (k) {
      var n = $('[data-stat="' + k + '"]');
      if (n) n.textContent = NUM.format(DB.counts[k]);
    });

    // membership mix
    var mix = {};
    DB.members.forEach(function (m) { mix[m.tier] = (mix[m.tier] || 0) + 1; });
    var mp = Object.keys(mix).map(function (k) { return [k, mix[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; });
    var mmax = mp[0][1];
    $("#member-mix").innerHTML = '<div class="bars" style="margin-bottom:1.1rem">' + mp.map(function (p, i) {
      return '<div class="bar-row" style="--i:' + i + '"><span class="k">' + esc(p[0]) + "</span>" +
        '<span class="bar-track"><i></i></span>' +
        '<span class="v">' + p[1] + "</span></div>";
    }).join("") + "</div>";
    grow("#member-mix", mp.map(function (p) { return Math.max(2, p[1] / mmax * 100); }));

    $("#recent-orders").innerHTML = DB.orders.slice(0, 8).map(function (o) {
      return "<tr><td>" + fmtDate(o.date) + '</td><td><span class="tag">' + esc(o.type) +
        "</span></td><td>" + esc(o.name) + "</td><td>" + esc(o.detail) +
        '</td><td class="num">' + money(o.amount) + "</td></tr>";
    }).join("");
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function grow(sel, widths) {
    var bars = $$(sel + " .bar-track i");
    function apply() { bars.forEach(function (b, i) { b.style.width = widths[i] + "%"; }); }
    if (reduceMotion) { apply(); return; }
    // Double rAF is the reliable way to let the browser record the 0-width
    // starting style before we change it. But rAF never fires in a hidden
    // document, and a chart of zero-width bars is not an acceptable resting
    // state — so a timer backstops it. Applying twice is harmless.
    requestAnimationFrame(function () { requestAnimationFrame(apply); });
    setTimeout(apply, 250);
  }

  // Tile figures count up, for the same reason the public hero stats do: the
  // board looks at the number instead of past it.
  function countTo(el, target, format) {
    if (reduceMotion || !isFinite(target)) { el.textContent = format(target); return; }
    var start = null, dur = 900;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = format(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = format(target);
    }
    requestAnimationFrame(frame);
  }

  function set(key, value, sub) {
    var v = $('[data-tile="' + key + '"]');
    var s = $('[data-tile-sub="' + key + '"]');
    if (v) v.textContent = value;
    if (s) s.textContent = sub;
  }

  /* ---------------------------------------------------------- members */
  function filteredMembers() {
    var q = $("#m-search").value.trim().toLowerCase();
    var tier = $("#m-tier").value;
    var status = $("#m-status").value;
    var interest = $("#m-interest").value;
    return DB.members.filter(function (m) {
      if (tier && m.tier !== tier) return false;
      if (status && m.status !== status) return false;
      if (interest && m.interests.indexOf(interest) < 0) return false;
      if (q && (m.name + " " + m.email).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  var INT_LABEL = { fundraising: "Fundraising", education: "Education / YAC",
                    hospitality: "Hospitality", membership: "Membership",
                    communications: "Communications" };

  function renderMembers() {
    var rows = filteredMembers();
    $("#m-count").textContent = rows.length + " of " + DB.members.length + " members";
    $("#members-body").innerHTML = rows.length ? rows.slice(0, 200).map(function (m) {
      return "<tr><td class='mono'>" + m.id + "</td><td>" + esc(m.name) +
        '<br><span class="muted small">' + esc(m.email) + "</span></td><td>" + esc(m.tier) +
        '</td><td><span class="tag tag-' + m.status + '">' + m.status + "</span></td><td>" +
        fmtDate(m.joined) + "</td><td>" + (m.expiry ? fmtDate(m.expiry) : "—") + "</td><td>" +
        (m.interests.length
          ? m.interests.map(function (i) { return '<span class="tag">' + INT_LABEL[i] + "</span>"; }).join("")
          : '<span class="muted small">—</span>') +
        "</td></tr>";
    }).join("") : '<tr><td colspan="7" class="empty">No members match those filters.</td></tr>';
  }

  /* ----------------------------------------------------------- orders */
  function filteredOrders() {
    var q = $("#o-search").value.trim().toLowerCase();
    var type = $("#o-type").value;
    var days = parseInt($("#o-range").value, 10);
    return ordersSince(days).filter(function (o) {
      if (type && o.type !== type) return false;
      if (q && (o.name + " " + o.detail + " " + o.ref + " " + o.id).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  function renderOrders() {
    var rows = filteredOrders();
    var total = rows.reduce(function (a, o) { return a + o.amount; }, 0);
    $("#o-count").textContent = rows.length + " orders · " + money(total);
    $("#orders-body").innerHTML = rows.length ? rows.slice(0, 250).map(function (o) {
      return '<tr><td class="mono">' + o.id + "</td><td>" + fmtDate(o.date) +
        '</td><td><span class="tag">' + esc(o.type) + "</span></td><td>" + esc(o.name) +
        "</td><td>" + esc(o.detail) + '</td><td class="num">' + money(o.amount) +
        '</td><td class="mono">' + o.ref + "</td></tr>";
    }).join("") : '<tr><td colspan="7" class="empty">No orders match those filters.</td></tr>';
  }

  /* ----------------------------------------------------------- events */
  function renderEvents() {
    $("#events-body").innerHTML = DB.events.map(function (e) {
      var tbd = !e.date;
      var pct = e.capacity ? Math.round(e.sold / e.capacity * 100) : 0;
      var cap = tbd ? '<span class="muted">—</span>' :
        '<span class="mini-bar' + (pct >= 100 ? " full" : "") + '"><i style="--w:' + pct + '%"></i></span>' +
        e.sold + " / " + e.capacity;
      var label = { open: "Selling", few: "Nearly full", soldout: "Sold out", tbd: "Date TBD" }[e.status];
      return "<tr><td><strong>" + esc(e.title) + "</strong></td><td>" +
        (tbd ? '<span class="muted">TBD</span>' : fmtDate(e.date)) + "</td><td>" + esc(e.host) +
        '</td><td class="num">' + (e.price ? money(e.price) : "—") + "</td><td>" + cap +
        '</td><td><span class="tag tag-' + (e.status === "soldout" ? "out" : e.status) + '">' +
        label + "</span></td><td>" +
        (tbd ? '<span class="muted small">—</span>'
             : '<a href="#" data-attendees="' + e.slug + '">Export list</a>') +
        "</td></tr>";
    }).join("");
  }

  /* -------------------------------------------------------------- yac */
  function filteredApps() {
    var q = $("#a-search").value.trim().toLowerCase();
    var div = $("#a-div").value;
    return DB.apps.filter(function (a) {
      if (div && a.divisions.indexOf(div) < 0) return false;
      if (q && (a.student + " " + a.school + " " + a.teacher).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  function renderApps() {
    var rows = filteredApps();
    $("#a-count").textContent = rows.length + " of " + DB.apps.length + " applications";
    $("#apps-body").innerHTML = rows.length ? rows.map(function (a) {
      return '<tr><td class="mono">' + a.id + "</td><td>" + esc(a.student) + "</td><td>" + a.grade +
        "</td><td>" + esc(a.school) + "</td><td>" +
        a.divisions.map(function (d) { return '<span class="tag">' + esc(d) + "</span>"; }).join("") +
        '</td><td class="small">' + esc(a.work) + "</td><td>" +
        '<a href="#" data-file="' + a.id + '">' + a.files + " file" + (a.files > 1 ? "s" : "") + "</a>" +
        '</td><td class="num">' + money(a.paid) + '</td><td><span class="tag tag-' +
        (a.status === "Complete" ? "active" : "expiring") + '">' + a.status + "</span></td></tr>";
    }).join("") : '<tr><td colspan="9" class="empty">No applications match those filters.</td></tr>';
  }

  /* ------------------------------------------------------------ audit */
  function renderAudit() {
    $("#audit-body").innerHTML = DB.audit.map(function (a) {
      var d = new Date(a.when);
      return "<tr><td>" + d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        ", " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) +
        "</td><td>" + esc(a.who) + "</td><td><strong>" + esc(a.action) +
        '</strong></td><td class="mono">' + esc(a.target) + '</td><td class="small">' +
        esc(a.detail) + "</td></tr>";
    }).join("");
  }

  /* ------------------------------------------------------------- CSV */
  // PRD Section 10 — "Exports everywhere. The treasurer's monthly
  // reconciliation is a download, not a request."
  function csv(rows) {
    return rows.map(function (r) {
      return r.map(function (c) {
        var s = String(c == null ? "" : c);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(",");
    }).join("\r\n");
  }

  function download(name, text) {
    var blob = new Blob(["﻿" + text], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Downloaded " + name);
  }

  var EXPORTS = {
    members: function () {
      return ["alo-roster.csv", csv([["ID", "Name", "Email", "Tier", "Amount", "Status",
        "Joined", "Renews", "Interests"]].concat(filteredMembers().map(function (m) {
          return [m.id, m.name, m.email, m.tier, m.amount, m.status, m.joined, m.expiry,
            m.interests.map(function (i) { return INT_LABEL[i]; }).join("; ")];
        })))];
    },
    orders: function () {
      return ["alo-orders.csv", csv([["Reference", "Date", "Type", "Name", "Detail",
        "Amount", "Stripe reference"]].concat(filteredOrders().map(function (o) {
          return [o.id, o.date, o.type, o.name, o.detail, o.amount, o.ref];
        })))];
    },
    apps: function () {
      return ["alo-yac-applications.csv", csv([["ID", "Student", "Grade", "School",
        "Divisions", "Repertoire", "Teacher", "Files", "Paid", "Status", "Received"]]
        .concat(filteredApps().map(function (a) {
          return [a.id, a.student, a.grade, a.school, a.divisions.join("; "), a.work,
            a.teacher, a.files, a.paid, a.status, a.received];
        })))];
    },
    events: function () {
      return ["alo-events.csv", csv([["Event", "Date", "Host", "Price", "Capacity", "Sold",
        "Status"]].concat(DB.events.map(function (e) {
          return [e.title, e.date || "TBD", e.host, e.price || "", e.capacity || "",
            e.sold, e.status];
        })))];
    },
    revenue: function () {
      var days = parseInt($("#range").value, 10);
      var rows = ordersSince(days);
      var by = {};
      rows.forEach(function (o) {
        by[o.type] = by[o.type] || { n: 0, total: 0 };
        by[o.type].n++;
        by[o.type].total += o.amount;
      });
      var out = [["Source", "Transactions", "Total"]];
      Object.keys(by).forEach(function (k) { out.push([k, by[k].n, by[k].total.toFixed(2)]); });
      out.push([]);
      out.push(["Range", days >= 9999 ? "All time" : "Last " + days + " days"]);
      out.push(["Total", rows.length, rows.reduce(function (a, o) { return a + o.amount; }, 0).toFixed(2)]);
      return ["alo-revenue.csv", csv(out)];
    }
  };

  $$("[data-export]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var fn = EXPORTS[btn.dataset.export];
      if (!fn) return;
      var out = fn();
      download(out[0], out[1]);
    });
  });

  /* ------------------------------------------------------------ toast */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-attendees],[data-file],[data-new-event]");
    if (!a) return;
    e.preventDefault();
    if (a.hasAttribute("data-new-event")) {
      toast("Demo — on the live admin this opens the event form. No developer involved.");
    } else if (a.hasAttribute("data-attendees")) {
      var ev = DB.events.filter(function (x) { return x.slug === a.dataset.attendees; })[0];
      var rows = [["Name", "Seats", "Email", "Phone", "Dietary notes"]];
      var people = DB.orders.filter(function (o) {
        return o.type === "Tickets" && o.detail.indexOf(ev.title) === 0;
      });
      people.forEach(function (o) {
        var q = (o.detail.match(/× (\d+)/) || [0, 1])[1];
        rows.push([o.name, q, o.name.toLowerCase().replace(/ /g, ".") + "@example.com",
          "(502) 555-0100", ""]);
      });
      download("attendees-" + ev.slug + ".csv", csv(rows));
    } else {
      toast("Demo — uploaded repertoire opens here, in the record, for the judging panel.");
    }
  });

  /* ------------------------------------------------------------- init */
  ["#range"].forEach(function (s) { $(s).addEventListener("change", renderDashboard); });
  ["#m-search", "#m-tier", "#m-status", "#m-interest"].forEach(function (s) {
    $(s).addEventListener("input", renderMembers);
  });
  ["#o-search", "#o-type", "#o-range"].forEach(function (s) {
    $(s).addEventListener("input", renderOrders);
  });
  ["#a-search", "#a-div"].forEach(function (s) {
    $(s).addEventListener("input", renderApps);
  });
  $("#role").addEventListener("change", function () { applyRole(this.value); });

  renderDashboard();
  renderMembers();
  renderOrders();
  renderEvents();
  renderApps();
  renderAudit();
  applyRole("admin");
})();

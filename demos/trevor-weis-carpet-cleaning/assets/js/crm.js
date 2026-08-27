/* ==========================================================================
   Trevor Weis Carpet Cleaning — Owner CRM (demo)

   PRD Section 6. This is a PREVIEW BUILD: the interface and data model are
   real, but nothing leaves the browser. Records live in memory (seeded on
   load) and leads submitted on the public quote form arrive through
   localStorage. CSV export is genuinely generated client-side.

   In the production build the lead inbox becomes an API-backed table (the
   quote form posts straight into it) and notifications fire server-side —
   see PRD Section 7, "Notifications."
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------ icons */
  var I = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 4h13l2.5 9v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    users: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M21 20v-1.5a4 4 0 0 0-3-3.9"/><path d="M16 4a3.5 3.5 0 0 1 0 6.9"/>',
    bell: '<path d="M18 9a6 6 0 0 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9z"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.1a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M11 16 15 12l-4-4"/><path d="M15 12H4"/>',
    note: '<path d="M5 3h9l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
    hardhat: '<path d="M4 15a8 8 0 0 1 16 0"/><path d="M2 15h20"/><path d="M12 15V8"/>'
  };
  function ic(n, s) {
    return '<svg viewBox="0 0 24 24" width="' + (s || 18) + '" height="' + (s || 18) +
      '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' + (I[n] || "") + "</svg>";
  }

  /* ------------------------------------------------------------ helpers */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  var DAY = 86400000;
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  function d(off) { return new Date(TODAY.getTime() + off * DAY); }
  function fdate(dt) {
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function fdateLong(dt) {
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function ago(dt) {
    var days = Math.round((TODAY - dt) / DAY);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days > 1 && days < 7) return days + " days ago";
    return fdate(dt);
  }
  function initials(n) {
    return n.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }
  function toISO(dt) { return dt.toISOString().slice(0, 10); }
  function fromISO(s) {
    var p = s.split("-").map(Number);
    var dt = new Date(p[0], p[1] - 1, p[2]); dt.setHours(0, 0, 0, 0);
    return Math.round((dt - TODAY) / DAY);
  }

  var STATUSES = ["New", "Contacted", "Booked", "Closed"];
  function stClass(s) { return "stg-" + s.toLowerCase(); }
  function srcClass(s) {
    return s === "Website form" ? "src-website"
      : s === "Referral" ? "src-referral" : "src-manual";
  }

  /* PLACEHOLDER crew — swap for Trevor's real employee names/logins. */
  var EMPLOYEES = ["Trevor Weis", "Jake Combs", "Chris Adkins"];

  /* --------------------------------------------------------- seed data */
  var leads = [
    { id: "L204", name: "Marissa Cole", phone: "(502) 555-0161", email: "mcole@example.com",
      address: "118 Bardstown Rd", zip: "40204", service: "Carpet Cleaning", size: "3 rooms",
      source: "Website form", status: "New", created: -0.3,
      message: "Two bedrooms and the living room. Pet stains in the hallway.", notes: [] },
    { id: "L203", name: "Derek Simms", phone: "(502) 555-0147", email: "dsimms@example.com",
      address: "42 Goss Ave", zip: "40217", service: "Stair Cleaning", size: "14 steps + landing",
      source: "Website form", status: "New", created: -0.8,
      message: "Just the stairs and the upstairs landing.", notes: [] },
    { id: "L201", name: "Whitney Combs", phone: "(502) 555-0119", email: "wcombs@example.com",
      address: "900 Baxter Ave", zip: "40204", service: "Upholstery Cleaning", size: "Sectional sofa",
      source: "Manual entry", status: "Contacted", created: -2,
      message: "", notes: [{ t: "Left a voicemail, texted asking for a photo of the fabric.", off: -1 }] },
    { id: "L198", name: "Owen Pruitt", phone: "(502) 555-0132", email: "opruitt@example.com",
      address: "27 Rosewood Ave", zip: "40206", service: "Carpet Cleaning", size: "Whole house, ~1,800 sq ft",
      source: "Website form", status: "Contacted", created: -3,
      message: "Moving in next month, want it done before furniture arrives.",
      notes: [{ t: "Quoted over the phone. Waiting to hear back on a move-in date.", off: -2 }] },
    { id: "L192", name: "Angela Ford", phone: "(502) 555-0155", email: "aford@example.com",
      address: "615 Ellison Ave", zip: "40222", service: "Carpet Cleaning", size: "4 rooms + hallway",
      source: "Referral", status: "Booked", created: -6,
      message: "", notes: [{ t: "Booked for Thursday morning, 9am window.", off: -5 }] },
    { id: "L188", name: "Marcus Whitfield", phone: "(502) 555-0128", email: "mwhitfield@example.com",
      address: "233 Vernon Ave", zip: "40208", service: "Carpet + Upholstery", size: "2 rooms + loveseat",
      source: "Website form", status: "Booked", created: -9,
      message: "", notes: [{ t: "Booked. Gate code is 2210.", off: -8 }] },
    { id: "L172", name: "Renee Castillo", phone: "(502) 555-0171", email: "rcastillo@example.com",
      address: "511 Cherokee Rd", zip: "40204", service: "Carpet Cleaning", size: "3 bedrooms + stairs",
      source: "Website form", status: "Closed", created: -14, customerId: "C1",
      message: "", notes: [{ t: "Cleaned and converted to a customer record.", off: -14 }] },
    { id: "L165", name: "Hank Dubois", phone: "(502) 555-0166", email: "hdubois@example.com",
      address: "1400 Bardstown Rd #3", zip: "40204", service: "Upholstery Cleaning", size: "Sectional + loveseat",
      source: "Manual entry", status: "Closed", created: -40, customerId: "C2",
      message: "", notes: [] },
    { id: "L150", name: "Priya Nair", phone: "(502) 555-0142", email: "pnair@example.com",
      address: "82 Trevilian Way", zip: "40222", service: "Carpet Cleaning", size: "Whole house",
      source: "Referral", status: "Closed", created: -70, customerId: "C3",
      message: "", notes: [] }
  ];

  var customers = [
    { id: "C1", name: "Renee Castillo", phone: "(502) 555-0171", email: "rcastillo@example.com",
      address: "511 Cherokee Rd, Louisville, KY 40204", fromLead: "L172", nextFollowUp: 5,
      history: [{ off: -14, service: "Carpet Cleaning",
        note: "3 bedrooms + stairs. Heavy pet traffic in the hallway lightened well; recommended a re-clean in 6 months for that spot." }] },
    { id: "C2", name: "Hank Dubois", phone: "(502) 555-0166", email: "hdubois@example.com",
      address: "1400 Bardstown Rd #3, Louisville, KY 40204", fromLead: "L165", nextFollowUp: -3,
      history: [{ off: -40, service: "Upholstery Cleaning",
        note: "Sectional + loveseat. Coffee stains lifted fully, one pen mark stayed — flagged before starting." }] },
    { id: "C3", name: "Priya Nair", phone: "(502) 555-0142", email: "pnair@example.com",
      address: "82 Trevilian Way, Louisville, KY 40222", fromLead: "L150", nextFollowUp: -20,
      history: [
        { off: -70, service: "Carpet Cleaning", note: "Whole-house annual clean." },
        { off: -370, service: "Carpet Cleaning",
          note: "First visit — recommended an annual clean to keep the traffic lanes from setting in." }
      ] }
  ];

  var state = { view: "dashboard", leadFilter: "all", drawer: null };

  /* -------------------------------- pull in leads from the public form */
  function ingest() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem("twcc_crm_inbound") || "[]"); }
    catch (e) { return 0; }
    if (!raw.length) return 0;
    var known = {};
    leads.forEach(function (l) { known[l.id] = 1; });
    var added = 0;
    raw.forEach(function (l) {
      if (known[l.id]) return;
      leads.unshift({
        id: l.id, name: l.name || "(no name)", phone: l.phone || "",
        email: l.email || "", address: l.address || "", zip: l.zip || "",
        service: l.service || "—", size: l.size || "",
        source: "Website form", status: "New", createdAbs: new Date(l.createdAt), created: 0,
        message: l.message || "", notes: [], fresh: true
      });
      added++;
    });
    return added;
  }
  function createdDate(r) { return r.createdAbs || d(r.created); }

  /* ------------------------------------------------------------- toast */
  function toast(msg, iconName) {
    var wrap = $(".toast-wrap");
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = ic(iconName || "check", 17) + "<div>" + msg + "</div>";
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0"; el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 320);
    }, 3600);
  }

  /* ------------------------------------------------------- derivations */
  function newLeads() { return leads.filter(function (r) { return r.status === "New"; }); }
  function openLeads() {
    return leads.filter(function (r) { return r.status === "New" || r.status === "Contacted"; });
  }
  function dueCustomers() {
    return customers.filter(function (c) { return typeof c.nextFollowUp === "number" && c.nextFollowUp <= 0; })
      .sort(function (a, b) { return a.nextFollowUp - b.nextFollowUp; });
  }
  function sortedCustomers() {
    return customers.slice().sort(function (a, b) {
      var ad = typeof a.nextFollowUp === "number" ? a.nextFollowUp : 9999;
      var bd = typeof b.nextFollowUp === "number" ? b.nextFollowUp : 9999;
      return ad - bd;
    });
  }
  function lastService(c) {
    if (!c.history.length) return null;
    return c.history.slice().sort(function (a, b) { return b.off - a.off; })[0];
  }

  /* ------------------------------------------------------ view: shell */
  var NAV = [
    ["dashboard", "Dashboard", "grid"],
    ["leads", "Leads", "inbox"],
    ["customers", "Customers", "users"]
  ];

  function renderNav() {
    var n = newLeads().length;
    var due = dueCustomers().length;
    $(".crm-nav").innerHTML = NAV.map(function (item) {
      var id = item[0], label = item[1], iname = item[2];
      var count = id === "leads" ? n : id === "customers" ? due : 0;
      var pill = count ? '<span class="pill">' + count + "</span>" : "";
      return "<li><button type=\"button\" data-view=\"" + id + "\"" +
        (state.view === id ? ' aria-current="page"' : "") + ">" +
        ic(iname, 19) + "<span>" + label + "</span>" + pill + "</button></li>";
    }).join("");
  }

  var TITLES = { dashboard: "Dashboard", leads: "Leads", customers: "Customers" };

  /* --------------------------------------------------- view renderers */
  function leadRow(r) {
    var bits = [esc(r.service)];
    if (r.zip) bits.push("ZIP " + esc(r.zip));
    if (r.assignedTo) bits.push("Assigned: " + esc(r.assignedTo));
    bits.push(ago(createdDate(r)));
    var opts = STATUSES.map(function (s) {
      return "<option" + (s === r.status ? " selected" : "") + ">" + s + "</option>";
    }).join("");
    return "<li><div class=\"row\" style=\"cursor:default\">" +
      "<button class=\"row\" type=\"button\" data-rec=\"" + r.id + "\" style=\"padding:0;flex:1;min-width:0\">" +
      '<span class="mark">' + esc(initials(r.name)) + "</span>" +
      '<span class="grow"><span class="name">' + esc(r.name) + "</span>" +
      '<span class="meta">' + bits.map(function (b) { return "<span>" + b + "</span>"; }).join("") +
      "</span></span></button>" +
      '<span class="side">' +
      '<span class="badge ' + srcClass(r.source) + '">' + esc(r.source) + "</span>" +
      "<select class=\"status-select\" data-status-for=\"" + r.id + "\" aria-label=\"Status for " + esc(r.name) + "\">" + opts + "</select>" +
      "</span></div></li>";
  }

  function viewDashboard() {
    var n = newLeads().length;
    var open = openLeads().length;
    var due = dueCustomers();

    var kpis = [
      ["New leads", n, n ? "Waiting on a first reply" : "All caught up", "inbox", false],
      ["Open leads", open, "New + Contacted, not yet closed", "trending", false],
      ["Follow-ups due", due.length, due.length ? "Needs a check-in call" : "Nothing overdue", "bell", due.length > 0],
      ["Customers", customers.length, "Total on file", "users", false]
    ].map(function (k) {
      return '<div class="kpi' + (k[4] ? " warn" : "") + '"><div class="top"><span class="ic">' + ic(k[3], 17) + "</span>" +
        "<h3>" + k[0] + "</h3></div>" +
        '<div class="num">' + k[1] + "</div>" +
        '<div class="sub' + (k[4] ? " warn" : "") + '">' + k[2] + "</div></div>";
    }).join("");

    var recent = leads.slice().sort(function (a, b) {
      return createdDate(b) - createdDate(a);
    }).slice(0, 5).map(leadRow).join("");

    var dueHtml = due.length
      ? "<ul class=\"row-list\">" + due.map(function (c) {
        var days = Math.abs(c.nextFollowUp);
        return "<li class=\"overdue\"><button class=\"row\" type=\"button\" data-cust=\"" + c.id + "\">" +
          '<span class="mark">' + esc(initials(c.name)) + "</span>" +
          '<span class="grow"><span class="name">' + esc(c.name) + "</span>" +
          '<span class="meta"><span class="overdue-text">' +
          (c.nextFollowUp === 0 ? "Due today" : days + "d overdue") + "</span><span>" +
          esc((lastService(c) || {}).service || "") + "</span></span></span>" +
          '<span class="chev">' + ic("chev", 16) + "</span></button></li>";
      }).join("") + "</ul>"
      : '<div class="empty">' + ic("check", 30) + "<p>No follow-ups due right now.</p></div>";

    return '<header><h2 class="visually-hidden">Dashboard</h2></header>' +
      '<div class="notice">' + ic("info", 17) +
      "<div><strong>Preview build.</strong> Everything here is live and clickable, but the data " +
      "is sample data held in your browser. Submit the quote form on the public site and the lead " +
      "shows up in the inbox below.</div></div>" +
      '<div class="kpi-grid">' + kpis + "</div>" +
      '<div class="panel"><div class="panel-head"><h2>Latest leads</h2><span class="spacer"></span>' +
      '<button class="btn btn-outline btn-sm" data-view="leads" type="button">All leads</button></div>' +
      '<div class="panel-body flush"><ul class="row-list">' + recent + "</ul></div></div>" +
      '<div class="panel"><div class="panel-head"><h2>Follow-ups due</h2><span class="spacer"></span>' +
      '<button class="btn btn-outline btn-sm" data-view="customers" type="button">All customers</button></div>' +
      '<div class="panel-body flush">' + dueHtml + "</div></div>";
  }

  function viewLeads() {
    var f = state.leadFilter;
    var list = leads.filter(function (r) {
      if (f === "all") return true;
      if (f === "open") return r.status === "New" || r.status === "Contacted";
      return r.status === f;
    });
    var chips = [["all", "All"], ["open", "Open"], ["New", "New"], ["Contacted", "Contacted"],
      ["Booked", "Booked"], ["Closed", "Closed"]]
      .map(function (c) {
        return '<button class="chip" type="button" data-filter="' + esc(c[0]) + '" aria-pressed="' +
          (f === c[0]) + '">' + c[1] + "</button>";
      }).join("");

    var body = list.length
      ? '<ul class="row-list">' + list.map(leadRow).join("") + "</ul>"
      : '<div class="empty">' + ic("inbox", 30) + "<p>No leads match this filter.</p></div>";

    return "<header><h2 class=\"visually-hidden\">Leads</h2>" +
      "<p>Every quote request lands here the moment it is submitted, newest first. Change the " +
      "status right from the list, or open a lead to see the full message and promote it to a " +
      "customer record.</p></header>" +
      '<div class="toolbar">' + chips + '<span class="spacer"></span>' +
      '<button class="btn btn-primary btn-sm" type="button" data-action="new-lead">' +
      ic("plus", 15) + " Add lead</button></div>" +
      '<div class="panel"><div class="panel-body flush">' + body + "</div></div>";
  }

  function viewCustomers() {
    var list = sortedCustomers();
    var rows = list.map(function (c) {
      var last = lastService(c);
      var overdue = typeof c.nextFollowUp === "number" && c.nextFollowUp <= 0;
      return "<tr data-cust=\"" + c.id + "\"" + (overdue ? ' class="overdue"' : "") + ">" +
        '<td class="who">' + esc(c.name) + "</td>" +
        "<td>" + esc(c.phone) + "</td>" +
        "<td>" + (last ? esc(last.service) + " · " + fdate(d(last.off)) : "—") + "</td>" +
        "<td>" + (typeof c.nextFollowUp === "number"
          ? (overdue
            ? '<span class="badge overdue-pill">' + (c.nextFollowUp === 0 ? "Due today" : Math.abs(c.nextFollowUp) + "d overdue") + "</span>"
            : fdate(d(c.nextFollowUp)))
          : "—") + "</td></tr>";
    }).join("");

    return "<header><h2 class=\"visually-hidden\">Customers</h2>" +
      "<p>Every lead that turns into a job becomes a customer record — contact details, full " +
      "service history, job notes, and a follow-up date you set yourself. Customers with an " +
      "overdue follow-up sort to the top.</p></header>" +
      '<div class="toolbar"><span class="spacer"></span>' +
      '<button class="btn btn-outline btn-sm" type="button" data-action="export-csv">' +
      ic("download", 15) + " Export CSV</button></div>" +
      '<div class="panel"><div class="panel-body flush"><div class="tbl-wrap"><table class="tbl">' +
      "<thead><tr><th>Customer</th><th>Phone</th><th>Last service</th><th>Follow-up</th></tr></thead><tbody>" +
      (rows || '<tr><td colspan="4"><div class="empty">' + ic("users", 30) +
        "<p>No customers yet — promote a lead to get started.</p></div></td></tr>") +
      "</tbody></table></div></div></div>";
  }

  var VIEWS = { dashboard: viewDashboard, leads: viewLeads, customers: viewCustomers };

  function render() {
    $(".crm-top h1").textContent = TITLES[state.view];
    $("#crm-view").innerHTML = VIEWS[state.view]();
    renderNav();
    $(".crm-content").scrollTop = 0;
  }

  /* ------------------------------------------------------ lead drawer */
  function leadPhotoThumbs(r, kind) {
    var arr = (r.photos && r.photos[kind]) || [];
    if (!arr.length) return "";
    return arr.map(function (url, i) {
      return '<div class="photo-thumb"><img src="' + url + '" alt="' + kind + ' photo">' +
        '<button type="button" data-remove-photo="' + r.id + "|" + kind + "|" + i +
        '" aria-label="Remove photo">' + ic("x", 10) + "</button></div>";
    }).join("");
  }

  function openLeadDrawer(id) {
    var r = leads.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    state.drawer = { type: "lead", id: id };

    var notes = (r.notes || []).length
      ? '<ul class="note-list">' + r.notes.map(function (n) {
        return "<li>" + esc(n.t) + '<span class="when">' + ago(d(n.off)) + "</span></li>";
      }).join("") + "</ul>"
      : '<p style="color:var(--slate-400);font-size:.9rem;margin:0">No notes yet.</p>';

    var assignOpts = '<option value="">Unassigned</option>' + EMPLOYEES.map(function (e) {
      return "<option" + (e === r.assignedTo ? " selected" : "") + ">" + esc(e) + "</option>";
    }).join("");

    var actions = [];
    if (r.status !== "Closed") {
      actions.push('<button class="btn btn-forest" type="button" data-finish="' + r.id + '">' +
        ic("check", 16) + " Mark job finished</button>");
    }
    if (!r.customerId) {
      actions.push('<button class="btn btn-primary" type="button" data-promote="' + r.id + '">Promote to customer</button>');
    } else {
      actions.push('<button class="btn btn-outline" type="button" data-cust="' + r.customerId + '">View customer record</button>');
    }
    actions.push('<a class="btn btn-outline" href="tel:' + r.phone.replace(/[^\d+]/g, "") + '">' + ic("phone", 16) + " Call</a>");

    $(".drawer-head").innerHTML =
      '<div><h2>' + esc(r.name) + "</h2>" +
      '<div class="sub">' + esc(r.service) + (r.zip ? " · ZIP " + esc(r.zip) : "") + "</div></div>" +
      '<button class="drawer-close" type="button" aria-label="Close">' + ic("x", 20) + "</button>";

    $(".drawer-body").innerHTML =
      '<div class="dl">' +
      "<dt>Status</dt><dd><span class=\"badge " + stClass(r.status) + "\">" + esc(r.status) + "</span></dd>" +
      "<dt>Phone</dt><dd><a href=\"tel:" + r.phone.replace(/[^\d+]/g, "") + "\">" + esc(r.phone) + "</a></dd>" +
      (r.email ? "<dt>Email</dt><dd><a href=\"mailto:" + esc(r.email) + "\">" + esc(r.email) + "</a></dd>" : "") +
      "<dt>Address</dt><dd>" + esc(r.address) + (r.zip ? ", " + esc(r.zip) : "") + "</dd>" +
      "<dt>Size</dt><dd>" + esc(r.size || "—") + "</dd>" +
      "<dt>Source</dt><dd><span class=\"badge " + srcClass(r.source) + "\">" + esc(r.source) + "</span></dd>" +
      "<dt>Received</dt><dd>" + ago(createdDate(r)) + "</dd>" +
      "</dl>" +
      (r.message ? '<div class="sub-head">What they said</div><p style="font-size:.94rem;color:var(--slate)">' +
        esc(r.message) + "</p>" : "") +
      '<div class="sub-head">' + ic("hardhat", 14) + ' Assigned To</div>' +
      '<select class="status-select assign-select" data-assign-for="' + r.id + '" aria-label="Assigned to for ' + esc(r.name) + '">' + assignOpts + "</select>" +
      '<div class="sub-head">' + ic("camera", 14) + ' Job Photos</div>' +
      '<div class="job-photos">' +
      '<div><span class="photo-col-label">Before</span>' +
      '<label class="photo-upload-btn">' + ic("camera", 16) + ' Add photos' +
      '<input type="file" accept="image/*" multiple capture="environment" data-photo-input="' + r.id + '" data-photo-kind="before" hidden></label>' +
      '<div class="photo-thumbs" data-photo-thumbs="' + r.id + '-before">' + leadPhotoThumbs(r, "before") + "</div>" +
      "</div>" +
      '<div><span class="photo-col-label">After</span>' +
      '<label class="photo-upload-btn">' + ic("camera", 16) + ' Add photos' +
      '<input type="file" accept="image/*" multiple capture="environment" data-photo-input="' + r.id + '" data-photo-kind="after" hidden></label>' +
      '<div class="photo-thumbs" data-photo-thumbs="' + r.id + '-after">' + leadPhotoThumbs(r, "after") + "</div>" +
      "</div>" +
      "</div>" +
      '<div class="sub-head">Notes</div>' + notes;

    $(".drawer-foot").innerHTML = actions.join("");
    $(".drawer").classList.add("open");
    $(".drawer-backdrop").classList.add("open");
    $(".drawer").setAttribute("aria-hidden", "false");
    $(".drawer-close").focus();
  }

  /* -------------------------------------------------- customer drawer */
  function openCustomerDrawer(id) {
    var c = customers.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    state.drawer = { type: "customer", id: id };

    var hist = c.history.length
      ? '<ul class="history-list">' + c.history.slice().sort(function (a, b) { return b.off - a.off; })
        .map(function (h) {
          var before = (h.photos && h.photos.before) || [];
          var after = (h.photos && h.photos.after) || [];
          var photoHtml = "";
          if (before.length) {
            photoHtml += '<div class="thumb-row"><span class="thumb-label">Before</span>' +
              before.map(function (u) { return '<img src="' + u + '" alt="Before photo">'; }).join("") + "</div>";
          }
          if (after.length) {
            photoHtml += '<div class="thumb-row"><span class="thumb-label">After</span>' +
              after.map(function (u) { return '<img src="' + u + '" alt="After photo">'; }).join("") + "</div>";
          }
          return "<li><div style=\"flex:1;min-width:0\"><span class=\"svc\">" + esc(h.service) +
            (h.assignedTo ? " · " + esc(h.assignedTo) : "") + "</span>" +
            (h.note ? '<span class="note">' + esc(h.note) + "</span>" : "") + photoHtml + "</div>" +
            '<span class="when">' + fdate(d(h.off)) + "</span></li>";
        }).join("") + "</ul>"
      : '<p style="color:var(--slate-400);font-size:.9rem;margin:0">No service history yet.</p>';

    var overdue = typeof c.nextFollowUp === "number" && c.nextFollowUp <= 0;
    var fuValue = typeof c.nextFollowUp === "number" ? toISO(d(c.nextFollowUp)) : "";

    $(".drawer-head").innerHTML =
      '<div><h2>' + esc(c.name) + "</h2>" +
      '<div class="sub">Customer since ' + fdateLong(d((lastService(c) || { off: 0 }).off)) + "</div></div>" +
      '<button class="drawer-close" type="button" aria-label="Close">' + ic("x", 20) + "</button>";

    $(".drawer-body").innerHTML =
      '<div class="dl">' +
      "<dt>Phone</dt><dd><a href=\"tel:" + c.phone.replace(/[^\d+]/g, "") + "\">" + esc(c.phone) + "</a></dd>" +
      (c.email ? "<dt>Email</dt><dd><a href=\"mailto:" + esc(c.email) + "\">" + esc(c.email) + "</a></dd>" : "") +
      "<dt>Address</dt><dd>" + esc(c.address) + "</dd>" +
      "</dl>" +
      '<div class="sub-head">Follow-up reminder</div>' +
      '<div class="followup-row">' +
      '<input type="date" value="' + fuValue + '" data-followup="' + c.id + '" aria-label="Next follow-up date">' +
      (overdue ? '<span class="badge overdue-pill">' +
        (c.nextFollowUp === 0 ? "Due today" : Math.abs(c.nextFollowUp) + "d overdue") + "</span>" : "") +
      "</div>" +
      '<div class="sub-head">Service history</div>' + hist +
      '<div class="sub-head">Add a job note</div>' +
      '<div class="note-add"><textarea id="cust-note-input" placeholder="e.g. Re-cleaned the hallway runner, pet stain fully lifted this time." ' +
      'aria-label="New job note"></textarea>' +
      '<button class="btn btn-primary btn-sm" type="button" data-add-note="' + c.id + '" style="align-self:flex-start">Add</button></div>';

    $(".drawer-foot").innerHTML =
      '<a class="btn btn-outline" href="tel:' + c.phone.replace(/[^\d+]/g, "") + '">' + ic("phone", 16) + " Call</a>" +
      '<a class="btn btn-outline" href="mailto:' + esc(c.email) + '">' + ic("mail", 16) + " Email</a>";

    $(".drawer").classList.add("open");
    $(".drawer-backdrop").classList.add("open");
    $(".drawer").setAttribute("aria-hidden", "false");
    $(".drawer-close").focus();
  }

  function closeDrawer() {
    $(".drawer").classList.remove("open");
    $(".drawer-backdrop").classList.remove("open");
    $(".drawer").setAttribute("aria-hidden", "true");
    state.drawer = null;
  }

  /* ------------------------------------------------------------- modal */
  function openModal(html) {
    $(".modal").innerHTML = html;
    $(".modal-backdrop").classList.add("open");
    var f = $(".modal input, .modal select");
    if (f) f.focus();
  }
  function closeModal() { $(".modal-backdrop").classList.remove("open"); }

  function newLeadModal() {
    openModal(
      '<div class="modal-head"><h2>Add a lead</h2></div>' +
      '<div class="modal-body">' +
      '<p style="color:var(--slate);font-size:.9rem;margin:0 0 1rem">For a call, a text, or ' +
      "someone stopping you at a job site.</p>" +
      '<form id="new-lead-form">' +
      '<div class="field"><label for="nl-name">Name</label><input id="nl-name" required></div>' +
      '<div class="field"><label for="nl-phone">Phone</label><input id="nl-phone" type="tel" required></div>' +
      '<div class="field"><label for="nl-addr">Address</label><input id="nl-addr"></div>' +
      '<div class="field"><label for="nl-zip">ZIP</label><input id="nl-zip" inputmode="numeric"></div>' +
      '<div class="field"><label for="nl-svc">Service</label><select id="nl-svc">' +
      '<option>Carpet Cleaning</option><option>Upholstery Cleaning</option>' +
      '<option>Stair Cleaning</option><option>Other</option></select></div>' +
      '<div class="field"><label for="nl-note">Note</label><textarea id="nl-note"></textarea></div>' +
      "</form></div>" +
      '<div class="modal-foot">' +
      '<button class="btn btn-outline" type="button" data-close-modal>Cancel</button>' +
      '<button class="btn btn-primary" type="button" data-save-lead>Save lead</button></div>'
    );
  }

  /* ------------------------------------------------------------ export */
  function exportCsv() {
    var cols = ["Name", "Phone", "Email", "Address", "Last Service", "Last Service Date", "Next Follow-up"];
    var rows = sortedCustomers().map(function (c) {
      var last = lastService(c);
      return [
        c.name, c.phone, c.email || "", c.address,
        last ? last.service : "", last ? toISO(d(last.off)) : "",
        typeof c.nextFollowUp === "number" ? toISO(d(c.nextFollowUp)) : ""
      ];
    });
    function q(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
    var csv = [cols.map(q).join(",")].concat(rows.map(function (r) { return r.map(q).join(","); })).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "customers.csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast(rows.length + " customer" + (rows.length === 1 ? "" : "s") + " exported to <strong>customers.csv</strong>.", "download");
  }

  /* ---------------------------------------------------- lead -> customer */
  function historyEntryFromLead(lead) {
    var entry = { off: 0, service: lead.service, note: lead.message || "" };
    if (lead.assignedTo) entry.assignedTo = lead.assignedTo;
    var before = (lead.photos && lead.photos.before) || [];
    var after = (lead.photos && lead.photos.after) || [];
    if (before.length || after.length) {
      entry.photos = { before: before.slice(), after: after.slice() };
    }
    return entry;
  }
  function attachCustomerFromLead(lead) {
    var cid = "C" + (customers.length + 1);
    customers.push({
      id: cid, name: lead.name, phone: lead.phone, email: lead.email,
      address: lead.address + (lead.zip ? ", Louisville, KY " + lead.zip : ""),
      fromLead: lead.id, nextFollowUp: 180,
      history: [historyEntryFromLead(lead)]
    });
    lead.customerId = cid;
    return cid;
  }

  /* ------------------------------------------------------------ events */
  document.addEventListener("click", function (e) {
    var t = e.target;

    var navBtn = t.closest("[data-view]");
    if (navBtn) { state.view = navBtn.dataset.view; render(); return; }

    var recBtn = t.closest("[data-rec]");
    if (recBtn) { openLeadDrawer(recBtn.dataset.rec); return; }

    var custBtn = t.closest("[data-cust]");
    if (custBtn) { closeDrawer(); setTimeout(function () { openCustomerDrawer(custBtn.dataset.cust); }, 180); return; }

    if (t.closest(".drawer-close") || t.closest(".drawer-backdrop")) { closeDrawer(); return; }

    var filt = t.closest("[data-filter]");
    if (filt) { state.leadFilter = filt.dataset.filter; render(); return; }

    var promote = t.closest("[data-promote]");
    if (promote) {
      var lead = leads.filter(function (x) { return x.id === promote.dataset.promote; })[0];
      attachCustomerFromLead(lead);
      lead.status = "Closed";
      toast(esc(lead.name) + " is now a customer.", "check");
      closeDrawer();
      state.view = "customers"; render();
      return;
    }

    var finish = t.closest("[data-finish]");
    if (finish) {
      var flead = leads.filter(function (x) { return x.id === finish.dataset.finish; })[0];
      flead.status = "Closed";
      if (flead.customerId) {
        var fcust = customers.filter(function (x) { return x.id === flead.customerId; })[0];
        fcust.history.unshift(historyEntryFromLead(flead));
      } else {
        attachCustomerFromLead(flead);
      }
      toast("Job marked finished for <strong>" + esc(flead.name) + "</strong> — added to their service history.", "check");
      closeDrawer();
      state.view = "customers"; render();
      var fcid = flead.customerId;
      setTimeout(function () { openCustomerDrawer(fcid); }, 180);
      return;
    }

    var rmPhoto = t.closest("[data-remove-photo]");
    if (rmPhoto) {
      var parts = rmPhoto.dataset.removePhoto.split("|");
      var plead = leads.filter(function (x) { return x.id === parts[0]; })[0];
      if (plead && plead.photos && plead.photos[parts[1]]) {
        plead.photos[parts[1]].splice(Number(parts[2]), 1);
      }
      openLeadDrawer(plead.id);
      return;
    }

    if (t.closest('[data-action="new-lead"]')) { newLeadModal(); return; }
    if (t.closest('[data-action="export-csv"]')) { exportCsv(); return; }

    if (t.closest("[data-close-modal]") || t === $(".modal-backdrop")) { closeModal(); return; }

    if (t.closest("[data-save-lead]")) {
      var name = $("#nl-name").value.trim();
      var phone = $("#nl-phone").value.trim();
      if (!name || !phone) { toast("Name and phone are required.", "info"); return; }
      leads.unshift({
        id: "L" + Date.now().toString(36).toUpperCase().slice(-4),
        name: name, phone: phone, email: "",
        address: $("#nl-addr").value.trim(), zip: $("#nl-zip").value.trim(),
        service: $("#nl-svc").value, size: "", source: "Manual entry", status: "New",
        created: 0, message: $("#nl-note").value.trim(), notes: []
      });
      closeModal();
      state.view = "leads"; render();
      toast("Lead saved.", "check");
      return;
    }

    var addNote = t.closest("[data-add-note]");
    if (addNote) {
      var custId = addNote.dataset.addNote;
      var input = $("#cust-note-input");
      var text = input ? input.value.trim() : "";
      if (!text) { toast("Write a note first.", "info"); return; }
      var cust = customers.filter(function (x) { return x.id === custId; })[0];
      cust.history.unshift({ off: 0, service: (lastService(cust) || {}).service || "Job note", note: text });
      toast("Note added.", "check");
      openCustomerDrawer(custId);
      if (state.view === "customers") render();
      return;
    }

    if (t.closest("[data-logout]")) {
      $(".crm").hidden = true;
      $(".crm-login").hidden = false;
      document.body.style.overflow = "";
      return;
    }
  });

  document.addEventListener("change", function (e) {
    var sel = e.target.closest("[data-status-for]");
    if (sel) {
      var lead = leads.filter(function (x) { return x.id === sel.dataset.statusFor; })[0];
      lead.status = sel.value;
      toast(esc(lead.name) + " moved to <strong>" + esc(lead.status) + "</strong>.", "check");
      if (state.view === "dashboard") render();
      return;
    }
    var fu = e.target.closest("[data-followup]");
    if (fu) {
      var cust = customers.filter(function (x) { return x.id === fu.dataset.followup; })[0];
      cust.nextFollowUp = fu.value ? fromISO(fu.value) : null;
      toast("Follow-up date updated for " + esc(cust.name) + ".", "check");
      openCustomerDrawer(cust.id);
      return;
    }

    var assign = e.target.closest("[data-assign-for]");
    if (assign) {
      var alead = leads.filter(function (x) { return x.id === assign.dataset.assignFor; })[0];
      alead.assignedTo = assign.value || null;
      toast(assign.value
        ? esc(alead.name) + " assigned to <strong>" + esc(assign.value) + "</strong>."
        : "Unassigned " + esc(alead.name) + ".", "check");
      return;
    }

    var photoInput = e.target.closest("[data-photo-input]");
    if (photoInput) {
      var pid = photoInput.dataset.photoInput;
      var kind = photoInput.dataset.photoKind;
      var plead2 = leads.filter(function (x) { return x.id === pid; })[0];
      if (!plead2 || !photoInput.files || !photoInput.files.length) return;
      plead2.photos = plead2.photos || { before: [], after: [] };
      var files = Array.prototype.slice.call(photoInput.files);
      var remaining = files.length;
      files.forEach(function (file) {
        var url = URL.createObjectURL(file);
        plead2.photos[kind].push(url);
        remaining--;
        if (remaining === 0) {
          toast(files.length + " " + kind + " photo" + (files.length === 1 ? "" : "s") +
            " added for <strong>" + esc(plead2.name) + "</strong>.", "camera");
          openLeadDrawer(pid);
        }
      });
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if ($(".modal-backdrop").classList.contains("open")) closeModal();
    else if (state.drawer) closeDrawer();
  });

  /* ------------------------------------------------------------- login */
  var loginForm = $("#crm-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      $(".crm-login").hidden = true;
      $(".crm").hidden = false;
      var added = ingest();
      render();
      if (added) {
        toast(added + " new lead" + (added > 1 ? "s" : "") +
          " from the website form " + (added > 1 ? "are" : "is") + " at the top of your inbox.", "inbox");
      }
    });
  }

  var search = $("#crm-search-input");
  if (search) {
    search.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        toast("Search runs across leads and customers in the production build.", "search");
      }
    });
  }
})();

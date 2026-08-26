/* ==========================================================================
   W&W Pressure Washing — Owner CRM (demo)

   PRD Section 7. This is a PREVIEW BUILD: the interface, data model, and
   flows are real, but nothing leaves the browser. Records live in memory
   (seeded on load), leads submitted on the public site arrive through
   localStorage, and "send"/"charge" actions resolve locally.

   In the production build these become API calls: form endpoint -> leads
   table, Meta Leads API webhook -> leads table, and the chosen payment
   processor (still TBD per PRD Section 12) behind the invoice actions.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------ icons */
  var I = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 4h13l2.5 9v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    users: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M21 20v-1.5a4 4 0 0 0-3-3.9"/><path d="M16 4a3.5 3.5 0 0 1 0 6.9"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
    receipt: '<path d="M6 2h12a1 1 0 0 1 1 1v18l-3-2-2 2-2-2-2 2-2-2-3 2V3a1 1 0 0 1 1-1z"/><path d="M9 8h6M9 12h6"/>',
    dollar: '<path d="M12 2v20"/><path d="M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.8 7 7s2 3 5 3.6 5 1.4 5 3.7-2.2 3.7-5 3.7-5-1.2-5-3.2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9 2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2 2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9 2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.5 1z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.1a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    send: '<path d="M21 3 10.5 13.5"/><path d="M21 3 14.5 21l-4-8-8-4z"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M11 16 15 12l-4-4"/><path d="M15 12H4"/>',
    note: '<path d="M5 3h9l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/>',
    bell: '<path d="M18 9a6 6 0 0 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9z"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
    upload: '<path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/><path d="M12 15V3.5"/><path d="m7.5 8 4.5-4.5L16.5 8"/>'
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
  function money(n) {
    return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0 });
  }
  function fdate(dt) {
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function ago(dt) {
    var days = Math.round((TODAY - dt) / DAY);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    return fdate(dt);
  }
  function initials(n) {
    return n.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  var STAGES = ["New", "Contacted", "Quoted", "Scheduled", "Completed", "Invoiced", "Paid"];
  function stageClass(s) { return "stg-" + s.toLowerCase(); }
  function srcClass(s) {
    return s === "Website form" ? "src-website"
      : s === "Meta Lead Ad" ? "src-meta"
        : s === "Referral" ? "src-referral" : "src-manual";
  }

  /* --------------------------------------------------------- seed data */
  /* Representative pipeline so every view has something real in it. */
  var records = [
    { id: "L1042", name: "Marcus Webb", phone: "(812) 555-0117", email: "mwebb@example.com",
      address: "412 Silver Creek Rd", town: "New Albany", service: "Driveway Cleaning",
      source: "Website form", stage: "New", value: 0, created: -0.2,
      message: "Driveway hasn't been done since we bought the place. Lots of black streaking on the shaded half.",
      photos: 2, notes: [] },
    { id: "L1041", name: "Danielle Prather", phone: "(812) 555-0164", email: "dprather@example.com",
      address: "88 Watt St", town: "Jeffersonville", service: "Gutter Cleaning",
      source: "Meta Lead Ad", stage: "New", value: 0, created: -0.6,
      message: "Saw the ad. Gutters are overflowing at the back corner.", photos: 0, notes: [] },
    { id: "L1039", name: "Ray Ortiz", phone: "(812) 555-0138", email: "rortiz@example.com",
      address: "1207 Eastern Blvd", town: "Clarksville", service: "Walkway & Sidewalk Cleaning",
      source: "Website form", stage: "Contacted", value: 0, created: -2,
      message: "Front walk and the side path to the shed.", photos: 1,
      notes: [{ t: "Called, left voicemail. Texted as follow-up.", off: -1 }] },
    { id: "L1036", name: "Joanna Reese", phone: "(812) 555-0193", email: "jreese@example.com",
      address: "55 N Main St", town: "Scottsburg", service: "Driveway Cleaning",
      source: "Meta Lead Ad", stage: "Contacted", value: 0, created: -3,
      message: "", photos: 0,
      notes: [{ t: "Spoke Tues — wants a price before end of month.", off: -2 }] },
    { id: "L1034", name: "Tina Alcott", phone: "(812) 555-0125", email: "talcott@example.com",
      address: "9 Hunters Ridge", town: "Sellersburg", service: "Driveway + Walkway",
      source: "Manual entry", stage: "Quoted", value: 385, created: -4,
      message: "Called in from a yard sign.", photos: 0,
      notes: [{ t: "Quoted $385 for driveway + front walk. Sending text to confirm.", off: -3 }] },
    { id: "L1031", name: "Greg Nunn", phone: "(812) 555-0148", email: "gnunn@example.com",
      address: "740 Old Hwy 135", town: "Corydon", service: "Gutter Cleaning",
      source: "Meta Lead Ad", stage: "Quoted", value: 240, created: -5,
      message: "Two-story, gutters plus the face.", photos: 3,
      notes: [{ t: "Quoted $240 including exterior brightening.", off: -4 }] },
    { id: "L1028", name: "Priya Raman", phone: "(812) 555-0172", email: "praman@example.com",
      address: "63 Knobs View Dr", town: "Floyds Knobs", service: "Driveway Cleaning",
      source: "Website form", stage: "Scheduled", value: 310, created: -7, scheduled: 2,
      message: "", photos: 2,
      notes: [{ t: "Booked for the morning slot. Gate code 4417.", off: -5 }] },
    { id: "L1026", name: "Hollis Property Mgmt", phone: "(812) 555-0109", email: "ops@example.com",
      address: "300 Pearl St — 4 units", town: "New Albany", service: "Walkway & Sidewalk Cleaning",
      source: "Manual entry", stage: "Scheduled", value: 780, created: -9, scheduled: 3,
      commercial: true, message: "Recurring quarterly if the first one goes well.", photos: 0,
      notes: [{ t: "Walkways across all four buildings. Invoice to the office, not the site.", off: -8 }] },
    { id: "L1023", name: "Dean Kohler", phone: "(812) 555-0155", email: "dkohler@example.com",
      address: "22 Wolf Run", town: "Georgetown", service: "Driveway Cleaning",
      source: "Website form", stage: "Completed", value: 295, created: -12, scheduled: -1,
      message: "", photos: 2, gallery: "driveway-2",
      notes: [{ t: "Oil spot by the garage lightened but didn't fully lift — told him up front.", off: -1 }] },
    { id: "L1019", name: "Sam Whitlow", phone: "(812) 555-0181", email: "swhitlow@example.com",
      address: "104 River Rd", town: "Charlestown", service: "Gutter Cleaning",
      source: "Referral", stage: "Invoiced", value: 265, created: -16, scheduled: -4,
      message: "", photos: 2, gallery: "gutter-1",
      invoice: { no: "INV-1019", status: "Unpaid", due: 6 }, notes: [] },
    { id: "L1015", name: "Curtis Lane", phone: "(812) 555-0132", email: "clane@example.com",
      address: "7 Lanesville Pike", town: "Lanesville", service: "Driveway Cleaning",
      source: "Website form", stage: "Invoiced", value: 360, created: -34, scheduled: -24,
      message: "", photos: 2, gallery: "driveway-3",
      invoice: { no: "INV-1015", status: "Overdue", due: -9 },
      notes: [{ t: "Second reminder sent.", off: -3 }] },
    { id: "L1011", name: "Ana Fuentes", phone: "(812) 555-0146", email: "afuentes@example.com",
      address: "18 Spring St", town: "Jeffersonville", service: "Walkway & Sidewalk Cleaning",
      source: "Website form", stage: "Paid", value: 340, created: -22, scheduled: -12,
      message: "", photos: 2, gallery: "walkway-1",
      invoice: { no: "INV-1011", status: "Paid", due: -5 }, notes: [] },
    { id: "L1008", name: "Bill Teague", phone: "(812) 555-0177", email: "bteague@example.com",
      address: "455 Cross Rd", town: "Salem", service: "Driveway Cleaning",
      source: "Manual entry", stage: "Paid", value: 420, created: -28, scheduled: -18,
      message: "", photos: 2, gallery: "driveway-1", followUp: 12,
      invoice: { no: "INV-1008", status: "Paid", due: -11 }, notes: [] }
  ];

  /* Job photo pairs the owner has uploaded from the field. */
  var photos = [
    { id: "P1", rec: "L1023", slug: "driveway-2", label: "Dean Kohler — driveway", off: -1, featured: true },
    { id: "P2", rec: "L1019", slug: "gutter-1", label: "Sam Whitlow — gutters", off: -4, featured: true },
    { id: "P3", rec: "L1011", slug: "walkway-1", label: "Ana Fuentes — front walk", off: -12, featured: true },
    { id: "P4", rec: "L1008", slug: "driveway-1", label: "Bill Teague — driveway", off: -18, featured: false },
    { id: "P5", rec: "L1015", slug: "driveway-3", label: "Curtis Lane — driveway + apron", off: -24, featured: false },
    { id: "P6", rec: "L1011", slug: "walkway-2", label: "Ana Fuentes — patio", off: -12, featured: false }
  ];

  var settings = {
    notifyLead: true, notifyPayment: true, followUps: true,
    metaConnected: true, processor: null
  };

  var state = { view: "dashboard", leadFilter: "all", drawer: null };

  /* -------------------------------- pull in leads from the public form */
  function ingest() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem("ww_crm_inbound") || "[]"); }
    catch (e) { return 0; }
    if (!raw.length) return 0;
    var known = {};
    records.forEach(function (r) { known[r.id] = 1; });
    var added = 0;
    raw.forEach(function (l) {
      if (known[l.id]) return;
      records.unshift({
        id: l.id, name: l.name || "(no name)", phone: l.phone || "",
        email: l.email || "", address: l.address || "",
        town: l.zip ? "ZIP " + l.zip : "", service: l.service || "—",
        source: "Website form", stage: "New", value: 0,
        createdAbs: new Date(l.createdAt), created: 0,
        message: l.message || "", photos: l.photoCount || 0, notes: [], fresh: true
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
  function byStage(s) { return records.filter(function (r) { return r.stage === s; }); }
  function newLeads() { return records.filter(function (r) { return r.stage === "New"; }); }
  function invoices() {
    return records.filter(function (r) { return r.invoice; })
      .sort(function (a, b) { return (b.scheduled || 0) - (a.scheduled || 0); });
  }
  function outstanding() {
    return invoices().filter(function (r) { return r.invoice.status !== "Paid"; })
      .reduce(function (t, r) { return t + r.value; }, 0);
  }
  function collected() {
    return invoices().filter(function (r) { return r.invoice.status === "Paid"; })
      .reduce(function (t, r) { return t + r.value; }, 0);
  }
  function upcoming() {
    return records.filter(function (r) {
      return typeof r.scheduled === "number" && r.scheduled >= 0;
    }).sort(function (a, b) { return a.scheduled - b.scheduled; });
  }
  function clients() {
    return records.filter(function (r) {
      return STAGES.indexOf(r.stage) >= STAGES.indexOf("Scheduled");
    });
  }

  /* ------------------------------------------------------ view: shell */
  var NAV = [
    ["dashboard", "Dashboard", "grid", false],
    ["leads", "Leads", "inbox", false],
    ["pipeline", "Pipeline", "trending", false],
    ["schedule", "Schedule", "calendar", false],
    ["clients", "Clients", "users", true],
    ["photos", "Job Photos", "camera", true],
    ["invoices", "Invoices", "receipt", false],
    ["money", "Money", "dollar", true],
    ["settings", "Settings", "settings", true]
  ];

  function renderNav() {
    var n = newLeads().length;
    $(".crm-nav").innerHTML = NAV.map(function (item) {
      var id = item[0], label = item[1], iname = item[2], secondary = item[3];
      var pill = (id === "leads" && n) ? '<span class="pill">' + n + "</span>" : "";
      return '<li' + (secondary ? ' class="secondary"' : "") + '>' +
        '<button type="button" data-view="' + id + '"' +
        (state.view === id ? ' aria-current="page"' : "") + ">" +
        ic(iname, 19) + "<span>" + label + "</span>" + pill + "</button></li>";
    }).join("");
  }

  var TITLES = {
    dashboard: "Dashboard", leads: "Leads", pipeline: "Pipeline", schedule: "Schedule",
    clients: "Clients", photos: "Job Photos", invoices: "Invoices", money: "Money",
    settings: "Settings"
  };

  /* --------------------------------------------------- view renderers */
  function rowFor(r) {
    var bits = [];
    if (r.town) bits.push(esc(r.town));
    bits.push(esc(r.service));
    bits.push(ago(createdDate(r)));
    return '<li><button class="row" type="button" data-rec="' + r.id + '">' +
      '<span class="mark">' + esc(initials(r.name)) + "</span>" +
      '<span class="grow"><span class="name">' + esc(r.name) + "</span>" +
      '<span class="meta">' + bits.map(function (b) { return "<span>" + b + "</span>"; }).join("") +
      "</span></span>" +
      '<span class="side">' +
      '<span class="badge ' + srcClass(r.source) + '">' + esc(r.source) + "</span>" +
      '<span class="badge ' + stageClass(r.stage) + '">' + esc(r.stage) + "</span>" +
      (r.value ? '<span class="amount">' + money(r.value) + "</span>" : "") +
      "</span>" +
      '<span class="chev">' + ic("chev", 16) + "</span>" +
      "</button></li>";
  }

  function viewDashboard() {
    var n = newLeads().length;
    var week = upcoming().filter(function (r) { return r.scheduled <= 7; });
    var od = invoices().filter(function (r) { return r.invoice.status === "Overdue"; });

    var kpis = [
      ["New leads", n, n ? "Waiting on a first reply" : "All caught up", "inbox", n > 0],
      ["Jobs this week", week.length, week.length ? "Next: " + fdate(d(week[0].scheduled)) : "Nothing booked", "calendar", false],
      ["Outstanding", money(outstanding()), od.length ? od.length + " overdue" : "All current", "receipt", false],
      ["Collected (30d)", money(collected()), "Across " + invoices().filter(function (r) { return r.invoice.status === "Paid"; }).length + " paid invoices", "dollar", true]
    ].map(function (k) {
      return '<div class="kpi"><div class="top"><span class="ic">' + ic(k[3], 17) + "</span>" +
        "<h3>" + k[0] + "</h3></div>" +
        '<div class="num">' + k[1] + "</div>" +
        '<div class="sub' + (k[4] ? " up" : "") + '">' + k[2] + "</div></div>";
    }).join("");

    var recent = records.slice().sort(function (a, b) {
      return createdDate(b) - createdDate(a);
    }).slice(0, 5).map(rowFor).join("");

    var todayJobs = upcoming().filter(function (r) { return r.scheduled <= 3; });
    var sched = todayJobs.length
      ? '<ul class="row-list">' + todayJobs.map(function (r) {
        return '<li><button class="row" type="button" data-rec="' + r.id + '">' +
          '<span class="mark">' + fdate(d(r.scheduled)).split(" ")[1] + "</span>" +
          '<span class="grow"><span class="name">' + esc(r.name) + "</span>" +
          '<span class="meta"><span>' + esc(r.service) + "</span><span>" + esc(r.town) + "</span></span></span>" +
          '<span class="side"><span class="amount">' + money(r.value) + "</span></span>" +
          '<span class="chev">' + ic("chev", 16) + "</span></button></li>";
      }).join("") + "</ul>"
      : '<div class="empty">' + ic("calendar", 30) + "<p>Nothing booked in the next few days.</p></div>";

    return '<header><h2 class="visually-hidden">Dashboard</h2></header>' +
      '<div class="notice">' + ic("info", 17) +
      "<div><strong>Preview build.</strong> Everything here is live and clickable, but the data " +
      "is sample data held in your browser. Submit the quote form on the public site and the lead " +
      "shows up in this inbox.</div></div>" +
      '<div class="kpi-grid">' + kpis + "</div>" +
      '<div class="panel"><div class="panel-head"><h2>Latest activity</h2><span class="spacer"></span>' +
      '<button class="btn btn-outline btn-sm" data-view="leads" type="button">All leads</button></div>' +
      '<div class="panel-body flush"><ul class="row-list">' + recent + "</ul></div></div>" +
      '<div class="panel"><div class="panel-head"><h2>Coming up</h2><span class="spacer"></span>' +
      '<button class="btn btn-outline btn-sm" data-view="schedule" type="button">Full schedule</button></div>' +
      '<div class="panel-body flush">' + sched + "</div></div>";
  }

  function viewLeads() {
    var f = state.leadFilter;
    var list = records.filter(function (r) {
      if (f === "all") return true;
      if (f === "open") return STAGES.indexOf(r.stage) < STAGES.indexOf("Completed");
      return r.source === f;
    });
    var chips = [["all", "All"], ["open", "Open"], ["Website form", "Website"],
      ["Meta Lead Ad", "Meta ads"], ["Manual entry", "Manual"], ["Referral", "Referral"]]
      .map(function (c) {
        return '<button class="chip" type="button" data-filter="' + esc(c[0]) + '" aria-pressed="' +
          (f === c[0]) + '">' + c[1] + "</button>";
      }).join("");

    var body = list.length
      ? '<ul class="row-list">' + list.map(rowFor).join("") + "</ul>"
      : '<div class="empty">' + ic("inbox", 30) + "<p>No leads match this filter.</p></div>";

    return "<header><h2 class=\"visually-hidden\">Leads</h2>" +
      "<p>Every lead lands here automatically — the website quote form, Facebook and Instagram " +
      "lead ads, and anything you key in yourself after a phone call.</p></header>" +
      '<div class="toolbar">' + chips + '<span class="spacer"></span>' +
      '<button class="btn btn-primary btn-sm" type="button" data-action="new-lead">' +
      ic("plus", 15) + " Add lead</button></div>" +
      '<div class="panel"><div class="panel-body flush">' + body + "</div></div>";
  }

  function viewPipeline() {
    var cols = STAGES.map(function (s) {
      var items = byStage(s);
      var cards = items.map(function (r) {
        return '<button class="board-card" type="button" data-rec="' + r.id + '">' +
          '<span class="name">' + esc(r.name) + "</span>" +
          '<span class="svc">' + esc(r.service) + "</span>" +
          '<span class="foot"><span class="badge ' + srcClass(r.source) + '">' + esc(r.source) + "</span>" +
          (r.value ? '<span class="amount">' + money(r.value) + "</span>" : "") +
          "</span></button>";
      }).join("");
      return '<div class="board-col"><h3>' + s + '<span class="n">' + items.length + "</span></h3>" +
        '<div class="board-cards">' + (cards ||
          '<p style="font-size:.8rem;color:#8496a9;padding:4px 4px 10px;margin:0">Empty</p>') +
        "</div></div>";
    }).join("");

    return "<header><h2 class=\"visually-hidden\">Pipeline</h2>" +
      "<p>Every lead from first contact to paid. Open a card to move it to the next stage.</p></header>" +
      '<div class="board">' + cols + "</div>";
  }

  function viewSchedule() {
    var start = new Date(TODAY.getTime() - TODAY.getDay() * DAY);
    var days = [];
    for (var i = 0; i < 7; i++) {
      var dt = new Date(start.getTime() + i * DAY);
      var off = Math.round((dt - TODAY) / DAY);
      var jobs = records.filter(function (r) { return r.scheduled === off; });
      var isToday = off === 0;
      days.push('<div class="day' + (isToday ? " today" : "") + '">' +
        "<h3>" + dt.toLocaleDateString("en-US", { weekday: "short" }) +
        "<b>" + dt.getDate() + "</b></h3>" +
        '<div class="day-jobs">' + (jobs.length ? jobs.map(function (r) {
          var done = STAGES.indexOf(r.stage) >= STAGES.indexOf("Completed");
          return '<button class="job-chip' + (done ? " done" : "") + '" type="button" data-rec="' +
            r.id + '"><strong>' + esc(r.name) + "</strong><span>" + esc(r.service) + "</span></button>";
        }).join("") : "") + "</div></div>");
    }
    var next = upcoming();
    return "<header><h2 class=\"visually-hidden\">Schedule</h2>" +
      "<p>This week at a glance. Assign a date from any lead and it appears here.</p></header>" +
      '<div class="panel"><div class="panel-body"><div class="week">' + days.join("") + "</div></div></div>" +
      '<div class="panel"><div class="panel-head"><h2>Next up</h2></div><div class="panel-body flush">' +
      (next.length ? '<ul class="row-list">' + next.map(rowFor).join("") + "</ul>"
        : '<div class="empty">' + ic("calendar", 30) + "<p>Nothing scheduled yet.</p></div>") +
      "</div></div>";
  }

  function viewClients() {
    var list = clients();
    var rows = list.map(function (r) {
      var jobs = 1 + (r.followUp ? 1 : 0);
      return "<tr data-rec=\"" + r.id + "\">" +
        '<td class="who">' + esc(r.name) + (r.commercial ? ' <span class="badge src-manual">Commercial</span>' : "") + "</td>" +
        "<td>" + esc(r.town) + "</td>" +
        "<td>" + esc(r.service) + "</td>" +
        "<td>" + (typeof r.scheduled === "number" ? fdate(d(r.scheduled)) : "—") + "</td>" +
        '<td class="num">' + money(r.value) + "</td>" +
        '<td><span class="badge ' + stageClass(r.stage) + '">' + r.stage + "</span></td></tr>";
    }).join("");

    return "<header><h2 class=\"visually-hidden\">Clients</h2>" +
      "<p>Every lead that turned into work becomes a client record — contact details, address, " +
      "job history, notes, and all the photos from past visits in one place.</p></header>" +
      '<div class="panel"><div class="panel-body flush"><div class="tbl-wrap"><table class="tbl">' +
      "<thead><tr><th>Client</th><th>Town</th><th>Service</th><th>Last job</th>" +
      "<th class=\"num\">Value</th><th>Stage</th></tr></thead><tbody>" +
      (rows || '<tr><td colspan="6"><div class="empty">' + ic("users", 30) +
        "<p>No clients yet.</p></div></td></tr>") +
      "</tbody></table></div></div></div>";
  }

  function viewPhotos() {
    var cards = photos.map(function (p) {
      return '<div class="photo-card">' +
        '<div class="photo-pair">' +
        '<figure><img src="../assets/img/photos/ba-' + p.slug + '-before.jpg" alt="Before" loading="lazy"><figcaption>Before</figcaption></figure>' +
        '<figure><img src="../assets/img/photos/ba-' + p.slug + '-after.jpg" alt="After" loading="lazy"><figcaption>After</figcaption></figure>' +
        "</div>" +
        '<div class="photo-meta"><div class="name">' + esc(p.label) + "</div>" +
        '<div class="when">' + ago(d(p.off)) + "</div>" +
        '<button class="feature-toggle" type="button" data-photo="' + p.id + '" aria-pressed="' +
        p.featured + '"><span>' + (p.featured ? "On the website" : "Feature on website") +
        '</span><span class="sw" aria-hidden="true"></span></button>' +
        "</div></div>";
    }).join("");

    return "<header><h2 class=\"visually-hidden\">Job Photos</h2>" +
      "<p>Upload before and after pairs from your phone the moment a job wraps. Flip the switch " +
      "on any pair and it publishes straight to the public gallery — no separate upload, no " +
      "developer involved.</p></header>" +
      '<div class="toolbar"><button class="btn btn-primary btn-sm" type="button" data-action="upload">' +
      ic("upload", 15) + " Upload from this job</button>" +
      '<span class="spacer"></span><span style="font-size:.85rem;color:var(--slate-400)">' +
      photos.filter(function (p) { return p.featured; }).length + " of " + photos.length +
      " showing on the website</span></div>" +
      '<div class="photo-grid">' + cards + "</div>";
  }

  function viewInvoices() {
    var list = invoices();
    var rows = list.map(function (r) {
      var iv = r.invoice;
      var due = d(iv.due);
      return "<tr data-rec=\"" + r.id + "\">" +
        '<td class="who">' + iv.no + "</td>" +
        "<td>" + esc(r.name) + "</td>" +
        "<td>" + esc(r.service) + "</td>" +
        "<td>" + fdate(due) + (iv.status === "Overdue" ?
          ' <span style="color:var(--danger);font-weight:600">' +
          Math.abs(iv.due) + "d late</span>" : "") + "</td>" +
        '<td class="num">' + money(r.value) + "</td>" +
        '<td><span class="badge st-' + iv.status.toLowerCase() + '">' + iv.status + "</span></td></tr>";
    }).join("");

    var completed = byStage("Completed");
    var ready = completed.length
      ? '<ul class="row-list">' + completed.map(rowFor).join("") + "</ul>"
      : '<div class="empty">' + ic("check", 30) + "<p>Nothing waiting to be invoiced.</p></div>";

    return "<header><h2 class=\"visually-hidden\">Invoices</h2>" +
      "<p>Build an invoice off a finished job, send it by text or email, and let the client pay " +
      "by card from the link. Status flips to paid on its own when the money lands.</p></header>" +
      '<div class="panel"><div class="panel-head"><h2>Ready to invoice</h2></div>' +
      '<div class="panel-body flush">' + ready + "</div></div>" +
      '<div class="panel"><div class="panel-head"><h2>All invoices</h2></div>' +
      '<div class="panel-body flush"><div class="tbl-wrap"><table class="tbl">' +
      "<thead><tr><th>Invoice</th><th>Client</th><th>Service</th><th>Due</th>" +
      "<th class=\"num\">Amount</th><th>Status</th></tr></thead><tbody>" + rows +
      "</tbody></table></div></div></div>";
  }

  function viewMoney() {
    var paid = collected();
    var unpaidList = invoices().filter(function (r) { return r.invoice.status === "Unpaid"; });
    var odList = invoices().filter(function (r) { return r.invoice.status === "Overdue"; });
    var unpaid = unpaidList.reduce(function (t, r) { return t + r.value; }, 0);
    var od = odList.reduce(function (t, r) { return t + r.value; }, 0);
    var total = paid + unpaid + od || 1;
    var pipelineValue = records.filter(function (r) {
      return ["Quoted", "Scheduled"].indexOf(r.stage) >= 0;
    }).reduce(function (t, r) { return t + r.value; }, 0);

    var kpis = [
      ["Collected", money(paid), "Invoices marked paid", "dollar"],
      ["Awaiting payment", money(unpaid), unpaidList.length + " invoice(s) out", "receipt"],
      ["Overdue", money(od), odList.length + " past due", "clock"],
      ["In the pipeline", money(pipelineValue), "Quoted + scheduled work", "trending"]
    ].map(function (k) {
      return '<div class="kpi"><div class="top"><span class="ic">' + ic(k[3], 17) + "</span>" +
        "<h3>" + k[0] + "</h3></div><div class=\"num\">" + k[1] + "</div>" +
        '<div class="sub">' + k[2] + "</div></div>";
    }).join("");

    return "<header><h2 class=\"visually-hidden\">Money</h2>" +
      "<p>A running view of what is outstanding versus what has actually been collected.</p></header>" +
      '<div class="kpi-grid">' + kpis + "</div>" +
      '<div class="panel"><div class="panel-head"><h2>Where the money sits</h2></div>' +
      '<div class="panel-body">' +
      '<div class="bar">' +
      '<i class="paid" style="width:' + (paid / total * 100) + '%"></i>' +
      '<i class="unpaid" style="width:' + (unpaid / total * 100) + '%"></i>' +
      '<i class="overdue" style="width:' + (od / total * 100) + '%"></i></div>' +
      '<div class="legend">' +
      '<span><i style="background:var(--ok)"></i>Collected ' + money(paid) + "</span>" +
      '<span><i style="background:var(--warn)"></i>Awaiting ' + money(unpaid) + "</span>" +
      '<span><i style="background:var(--danger)"></i>Overdue ' + money(od) + "</span>" +
      "</div></div></div>" +
      '<div class="notice">' + ic("info", 17) +
      "<div><strong>Payment processor not selected yet.</strong> Per the PRD this is still open " +
      "(Stripe, Square, or another). The invoicing module is built so the processor drops in " +
      "behind it — picking one later does not mean rebuilding this.</div></div>";
  }

  function viewSettings() {
    function row(key, name, desc) {
      return '<div class="set-row"><div class="grow"><span class="name">' + name +
        '</span><div class="desc">' + desc + '</div></div>' +
        '<button class="switch" type="button" role="switch" data-setting="' + key +
        '" aria-checked="' + settings[key] + '" aria-label="' + name + '"></button></div>';
    }
    return '<header><h2 class="visually-hidden">Settings</h2>' +
      '<p>Owner account. Single-user for now — the data model already supports adding crew ' +
      'logins later without a rebuild.</p></header>' +

      '<div class="panel"><div class="panel-head"><h2>' + ic("bell", 17) + ' Notifications</h2></div>' +
      '<div class="panel-body flush">' +
      row("notifyLead", "Text me when a new lead comes in",
        "Website form or Meta ad — you get a text so you never have to remember to check.") +
      row("notifyPayment", "Notify me when an invoice is paid",
        "A quick confirmation the moment the money clears.") +
      row("followUps", "Remind me about repeat customers",
        "Flags a past client when it has been about a year since their last clean.") +
      '</div></div>' +

      '<div class="panel"><div class="panel-head"><h2>' + ic("globe", 17) + ' Connections</h2></div>' +
      '<div class="panel-body flush">' +
      '<div class="set-row"><div class="grow"><span class="name">Meta Lead Ads</span>' +
      '<div class="desc">Facebook and Instagram lead forms flow straight into this inbox.</div></div>' +
      '<span class="badge st-paid">' + ic("check", 12) + ' Connected</span></div>' +
      '<div class="set-row"><div class="grow"><span class="name">Payment processor</span>' +
      '<div class="desc">Needed before invoices can be paid by card. Still to be chosen.</div></div>' +
      '<span class="badge st-draft">Not set up</span></div>' +
      '<div class="set-row"><div class="grow"><span class="name">Website quote form</span>' +
      '<div class="desc">Submissions on the public site create a lead here automatically.</div></div>' +
      '<span class="badge st-paid">' + ic("check", 12) + ' Connected</span></div>' +
      '</div></div>' +

      '<div class="panel"><div class="panel-head"><h2>' + ic("users", 17) + ' Account</h2></div>' +
      '<div class="panel-body flush">' +
      '<div class="set-row"><div class="grow"><span class="name">Owner</span>' +
      '<div class="desc">Single sign-in. Crew accounts can be added in a later phase.</div></div>' +
      '<span class="badge src-manual">1 user</span></div>' +
      '</div></div>' +

      '<div class="notice">' + ic("info", 17) +
      '<div><strong>Demo note:</strong> toggles here change the interface but do not send anything. ' +
      'Wired up in the production build.</div></div>';
  }

  var VIEWS = {
    dashboard: viewDashboard, leads: viewLeads, pipeline: viewPipeline,
    schedule: viewSchedule, clients: viewClients, photos: viewPhotos,
    invoices: viewInvoices, money: viewMoney, settings: viewSettings
  };

  function render() {
    $(".crm-top h1").textContent = TITLES[state.view];
    $("#crm-view").innerHTML = VIEWS[state.view]();
    renderNav();
    $(".crm-content").scrollTop = 0;
  }

  /* ------------------------------------------------------------ drawer */
  function openDrawer(id) {
    var r = records.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    state.drawer = id;

    var si = STAGES.indexOf(r.stage);
    var track = STAGES.map(function (s, i) {
      return '<span class="stage-step ' + (i < si ? "done" : i === si ? "now" : "") + '">' + s + "</span>";
    }).join("");

    var notes = (r.notes || []).length
      ? '<ul class="note-list">' + r.notes.map(function (n) {
        return "<li>" + esc(n.t) + '<span class="when">' + ago(d(n.off)) + "</span></li>";
      }).join("") + "</ul>"
      : '<p style="color:var(--slate-400);font-size:.9rem;margin:0">No notes yet.</p>';

    var tl = [];
    tl.push({ i: "inbox", t: "Lead created — " + r.source, w: ago(createdDate(r)) });
    if (si >= 1) tl.push({ i: "phone", t: "First contact made", w: ago(d(r.created + 1)) });
    if (si >= 2) tl.push({ i: "note", t: "Quote sent — " + money(r.value), w: ago(d(r.created + 2)) });
    if (typeof r.scheduled === "number") {
      tl.push({ i: "calendar", t: "Job " + (r.scheduled >= 0 ? "scheduled for " : "carried out ") +
        fdate(d(r.scheduled)), w: r.scheduled >= 0 ? "Upcoming" : ago(d(r.scheduled)) });
    }
    if (r.invoice) {
      tl.push({ i: "receipt", t: "Invoice " + r.invoice.no + " — " + r.invoice.status,
        w: "Due " + fdate(d(r.invoice.due)) });
    }
    var timeline = '<ul class="timeline">' + tl.reverse().map(function (e) {
      return '<li><span class="dot">' + ic(e.i, 14) + "</span><div>" + e.t +
        '<span class="when">' + e.w + "</span></div></li>";
    }).join("") + "</ul>";

    var pics = photos.filter(function (p) { return p.rec === r.id; });
    var picHtml = pics.length
      ? '<div class="photo-grid" style="grid-template-columns:1fr">' + pics.map(function (p) {
        return '<div class="photo-card"><div class="photo-pair">' +
          '<figure><img src="../assets/img/photos/ba-' + p.slug + '-before.jpg" alt="Before" loading="lazy"><figcaption>Before</figcaption></figure>' +
          '<figure><img src="../assets/img/photos/ba-' + p.slug + '-after.jpg" alt="After" loading="lazy"><figcaption>After</figcaption></figure>' +
          '</div><div class="photo-meta"><button class="feature-toggle" type="button" data-photo="' +
          p.id + '" aria-pressed="' + p.featured + '"><span>' +
          (p.featured ? "On the website" : "Feature on website") +
          '</span><span class="sw" aria-hidden="true"></span></button></div></div>';
      }).join("") + "</div>"
      : '<p style="color:var(--slate-400);font-size:.9rem;margin:0">' +
        (r.photos ? r.photos + " photo(s) attached to the enquiry." : "No job photos yet.") + "</p>";

    var next = si < STAGES.length - 1 ? STAGES[si + 1] : null;
    var actions = [];
    if (next) {
      actions.push('<button class="btn btn-primary" type="button" data-advance="' + r.id +
        '">Move to ' + next + "</button>");
    }
    actions.push('<a class="btn btn-outline" href="tel:' + r.phone.replace(/[^\d+]/g, "") + '">' +
      ic("phone", 16) + " Call</a>");
    if (r.invoice && r.invoice.status !== "Paid") {
      actions.push('<button class="btn btn-navy" type="button" data-paid="' + r.id + '">Mark paid</button>');
    }

    $(".drawer-head").innerHTML =
      '<div><h2>' + esc(r.name) + "</h2>" +
      '<div class="sub">' + esc(r.service) + " · " + esc(r.town || "") + "</div></div>" +
      '<button class="drawer-close" type="button" aria-label="Close">' + ic("x", 20) + "</button>";

    $(".drawer-body").innerHTML =
      '<div class="stage-track">' + track + "</div>" +
      '<div class="sub-head">Contact</div>' +
      "<dl class=\"dl\">" +
      "<dt>Phone</dt><dd><a href=\"tel:" + r.phone.replace(/[^\d+]/g, "") + "\">" + esc(r.phone) + "</a></dd>" +
      (r.email ? "<dt>Email</dt><dd><a href=\"mailto:" + esc(r.email) + "\">" + esc(r.email) + "</a></dd>" : "") +
      "<dt>Address</dt><dd>" + esc(r.address) + (r.town ? ", " + esc(r.town) : "") + "</dd>" +
      "<dt>Source</dt><dd><span class=\"badge " + srcClass(r.source) + "\">" + esc(r.source) + "</span></dd>" +
      (r.value ? "<dt>Job value</dt><dd>" + money(r.value) + "</dd>" : "") +
      (r.followUp ? "<dt>Follow-up</dt><dd>Remind in " + r.followUp + " months</dd>" : "") +
      "</dl>" +
      (r.message ? '<div class="sub-head">What they said</div><p style="font-size:.94rem;color:var(--slate)">' +
        esc(r.message) + "</p>" : "") +
      '<div class="sub-head">Job photos</div>' + picHtml +
      '<div class="sub-head">Notes</div>' + notes +
      '<div class="sub-head">History</div>' + timeline;

    $(".drawer-foot").innerHTML = actions.join("");
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
      '<div class="field"><label for="nl-town">Town</label><input id="nl-town"></div>' +
      '<div class="field"><label for="nl-svc">Service</label><select id="nl-svc">' +
      '<option>Driveway Cleaning</option><option>Walkway &amp; Sidewalk Cleaning</option>' +
      '<option>Gutter Cleaning</option><option>More than one</option></select></div>' +
      '<div class="field"><label for="nl-note">Note</label><textarea id="nl-note"></textarea></div>' +
      "</form></div>" +
      '<div class="modal-foot">' +
      '<button class="btn btn-outline" type="button" data-close-modal>Cancel</button>' +
      '<button class="btn btn-primary" type="button" data-save-lead>Save lead</button></div>'
    );
  }

  /* ------------------------------------------------------------ events */
  document.addEventListener("click", function (e) {
    var t = e.target;

    var navBtn = t.closest("[data-view]");
    if (navBtn) { state.view = navBtn.dataset.view; render(); return; }

    var recBtn = t.closest("[data-rec]");
    if (recBtn) { openDrawer(recBtn.dataset.rec); return; }

    if (t.closest(".drawer-close") || t.closest(".drawer-backdrop")) { closeDrawer(); return; }

    var filt = t.closest("[data-filter]");
    if (filt) { state.leadFilter = filt.dataset.filter; render(); return; }

    var adv = t.closest("[data-advance]");
    if (adv) {
      var r = records.filter(function (x) { return x.id === adv.dataset.advance; })[0];
      var i = STAGES.indexOf(r.stage);
      if (i < STAGES.length - 1) {
        r.stage = STAGES[i + 1];
        if (r.stage === "Scheduled" && typeof r.scheduled !== "number") r.scheduled = 2;
        if (r.stage === "Invoiced" && !r.invoice) {
          r.invoice = { no: "INV-" + r.id.slice(1), status: "Unpaid", due: 14 };
          toast("Invoice <strong>" + r.invoice.no + "</strong> created and sent to " +
            esc(r.name) + ".", "send");
        } else if (r.stage === "Paid") {
          if (r.invoice) r.invoice.status = "Paid";
          toast("Payment recorded for <strong>" + esc(r.name) + "</strong>.", "check");
        } else {
          toast(esc(r.name) + " moved to <strong>" + r.stage + "</strong>.", "check");
        }
      }
      render(); openDrawer(r.id); return;
    }

    var mp = t.closest("[data-paid]");
    if (mp) {
      var rec = records.filter(function (x) { return x.id === mp.dataset.paid; })[0];
      rec.invoice.status = "Paid"; rec.stage = "Paid";
      toast("Marked <strong>" + rec.invoice.no + "</strong> as paid.", "check");
      render(); openDrawer(rec.id); return;
    }

    var pt = t.closest("[data-photo]");
    if (pt) {
      var p = photos.filter(function (x) { return x.id === pt.dataset.photo; })[0];
      p.featured = !p.featured;
      pt.setAttribute("aria-pressed", String(p.featured));
      $("span", pt).textContent = p.featured ? "On the website" : "Feature on website";
      toast(p.featured
        ? "Pushed to the public before &amp; after gallery."
        : "Removed from the public gallery.", p.featured ? "check" : "x");
      if (state.view === "photos") { render(); }
      return;
    }

    var sw = t.closest("[data-setting]");
    if (sw) {
      var k = sw.dataset.setting;
      settings[k] = !settings[k];
      sw.setAttribute("aria-checked", String(settings[k]));
      return;
    }

    if (t.closest('[data-action="new-lead"]')) { newLeadModal(); return; }

    if (t.closest('[data-action="upload"]')) {
      toast("On a phone this opens the camera roll. Pick a before and an after and it " +
        "attaches to the job.", "camera");
      return;
    }

    if (t.closest("[data-close-modal]") || t === $(".modal-backdrop")) { closeModal(); return; }

    if (t.closest("[data-save-lead]")) {
      var name = $("#nl-name").value.trim();
      var phone = $("#nl-phone").value.trim();
      if (!name || !phone) { toast("Name and phone are required.", "info"); return; }
      records.unshift({
        id: "L" + Date.now().toString(36).toUpperCase().slice(-4),
        name: name, phone: phone, email: "",
        address: $("#nl-addr").value.trim(), town: $("#nl-town").value.trim(),
        service: $("#nl-svc").value, source: "Manual entry", stage: "New",
        value: 0, created: 0, message: $("#nl-note").value.trim(), photos: 0, notes: []
      });
      closeModal();
      state.view = "leads"; render();
      toast("Lead saved.", "check");
      return;
    }

    if (t.closest("[data-logout]")) {
      $(".crm").hidden = true;
      $(".crm-login").hidden = false;
      document.body.style.overflow = "";
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

  /* search is decorative in the preview build */
  var search = $("#crm-search-input");
  if (search) {
    search.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        toast("Search runs across leads, clients, and invoices in the production build.", "search");
      }
    });
  }
})();

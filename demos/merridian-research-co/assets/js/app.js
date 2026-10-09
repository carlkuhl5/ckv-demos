import { PRODUCTS, FEATURED, byId, normalize, money } from './products.js';
import { drawLabel, drawVialStill } from './label.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

const isMobile = matchMedia('(max-width: 760px)').matches;
const labelCache = new Map();
const labelFor = (p) => {
  if (!labelCache.has(p.id)) labelCache.set(p.id, drawLabel(p, isMobile ? 1024 : 2048));
  return labelCache.get(p.id);
};

// ---------- toast ----------
let toastTimer;
function toast(msg) {
  const el = $('[data-toast]');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- featured cards ----------
function stockClass(p) {
  return p.stock === 'Sold out' ? 'out' : p.stock === 'Low stock' ? 'low' : '';
}
function renderCards() {
  $('[data-cards]').innerHTML = FEATURED.map((id) => {
    const p = byId(id);
    return `
      <article class="card">
        ${p.placeholder ? '<span class="tag">Placeholder</span>' : ''}
        <div class="vial-slot" aria-hidden="true"><canvas data-still="${p.id}"></canvas></div>
        <div class="card-body">
          <div class="card-top">
            <h3 class="card-name">${p.name}</h3>
            <span class="card-strength">${p.strength.toUpperCase()}</span>
          </div>
          <div class="card-meta">
            <span>${money(p.price)}</span>
            <span class="stock ${stockClass(p)}">${p.stock}</span>
          </div>
          <button class="btn btn--primary" type="button" data-add="${p.id}" ${p.stock === 'Sold out' ? 'disabled' : ''}>
            Add<span class="hide-sm">&nbsp;to cart</span>
          </button>
        </div>
      </article>`;
  }).join('');
}

function paintStills() {
  $$('canvas[data-still]').forEach((c) => {
    const p = byId(c.dataset.still);
    drawVialStill(c, p, labelFor(p));
  });
  const spot = $('[data-still-spot]');
  if (spot) drawVialStill(spot, byId(current), labelFor(byId(current)));
}

// ---------- spotlight / switcher ----------
let current = 'klow';
let vials = null;

function renderSwitcher() {
  $('[data-switcher]').innerHTML = PRODUCTS.map(
    (p) => `<button type="button" role="tab" aria-selected="${p.id === current}" data-switch="${p.id}">${p.name}</button>`
  ).join('');
}
function renderSpec(p) {
  $('[data-spot-name]').innerHTML = `${p.name} <span>${p.strength.toUpperCase()}</span>`;
  const rows = [['Compound', p.name], ['Strength', p.strength], ...Object.entries(p.specs)];
  $('[data-spec-table]').innerHTML = rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('');
  $('[data-spot-price]').textContent = money(p.price);
  const st = $('[data-spot-stock]');
  st.textContent = p.stock;
  st.className = `stock ${stockClass(p)}`;
  const add = $('[data-spot-add]');
  add.disabled = p.stock === 'Sold out';
  add.textContent = p.stock === 'Sold out' ? 'Sold out' : 'Add to cart';
}
function selectProduct(id) {
  if (id === current) return;
  current = id;
  const p = byId(id);
  $$('[data-switch]').forEach((b) => b.setAttribute('aria-selected', b.dataset.switch === id));
  const table = $('[data-spec-table]');
  table.classList.add('fading');
  setTimeout(() => {
    renderSpec(p);
    table.classList.remove('fading');
  }, 450);
  if (vials) vials.switchTo(p);
  else {
    const spot = $('[data-still-spot]');
    drawVialStill(spot, p, labelFor(p));
  }
}

// ---------- cart ----------
const SHIP_FREE = 200; // placeholder threshold
const SHIP_FLAT = 12; // placeholder flat rate
let cart = store.get('mr-cart', []);
let discount = null;

function saveCart() {
  store.set('mr-cart', cart);
  renderCart();
}
function addToCart(id, qty = 1, open = true) {
  const p = byId(id);
  if (!p || p.stock === 'Sold out') return;
  const line = cart.find((l) => l.id === id);
  if (line) line.qty += qty;
  else cart.push({ id, qty });
  saveCart();
  const badge = $('[data-cart-count]');
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
  if (open) openPanel('cart');
}
function renderCart() {
  const count = cart.reduce((a, l) => a + l.qty, 0);
  const badge = $('[data-cart-count]');
  badge.textContent = count;
  badge.toggleAttribute('data-zero', count === 0);
  $('[data-cart-count-label]').textContent = count ? `(${count})` : '';
  const empty = cart.length === 0;
  $('[data-cart-empty]').hidden = !empty;
  $('[data-cart-foot]').hidden = empty;
  $('[data-cart-lines]').innerHTML = cart
    .map((l) => {
      const p = byId(l.id);
      return `<li class="cart-line">
        <canvas data-line-still="${p.id}" aria-hidden="true"></canvas>
        <div>
          <div class="name">${p.name}</div>
          <div class="meta">${p.strength} · ${p.specs.Lot}</div>
          <div class="qty" role="group" aria-label="Quantity for ${p.name}">
            <button type="button" data-qty="${p.id}" data-d="-1" aria-label="Decrease">−</button>
            <span>${l.qty}</span>
            <button type="button" data-qty="${p.id}" data-d="1" aria-label="Increase">+</button>
          </div>
        </div>
        <div class="line-right">
          <span>${money(p.price * l.qty)}</span>
          <button type="button" class="link-btn" data-remove="${p.id}">Remove</button>
        </div>
      </li>`;
    })
    .join('');
  $$('[data-line-still]').forEach((c) => {
    const p = byId(c.dataset.lineStill);
    drawVialStill(c, p, labelFor(p));
  });

  const subtotal = cart.reduce((a, l) => a + byId(l.id).price * l.qty, 0);
  const disc = discount ? subtotal * discount.pct : 0;
  const after = subtotal - disc;
  const ship = after >= SHIP_FREE || after === 0 ? 0 : SHIP_FLAT;
  $('[data-subtotal]').textContent = money(subtotal);
  $('[data-discount-row]').hidden = !discount;
  $('[data-discount-amt]').textContent = discount ? `−${money(disc)} (${discount.code})` : '';
  $('[data-shipping]').textContent = ship ? money(ship) : 'Free';
  $('[data-total]').textContent = money(after + ship);
  const left = Math.max(0, SHIP_FREE - after);
  $('[data-ship-meter]').innerHTML = `${left > 0 ? `${money(left)} away from free shipping` : 'Free shipping unlocked'} <span class="tag">Placeholder rates</span><div class="bar"><i style="width:${Math.min(100, (after / SHIP_FREE) * 100)}%"></i></div>`;
}

// ---------- panels ----------
let lastFocus = null;
function openPanel(name) {
  closePanels();
  const el = $(`[data-panel="${name}"]`);
  if (!el) return;
  lastFocus = document.activeElement;
  el.hidden = false;
  if (name === 'menu') $('.menu-btn').setAttribute('aria-expanded', 'true');
  if (name === 'search') {
    const input = $('[data-search-input]');
    input.value = '';
    renderSearch('');
    input.focus();
  } else {
    el.querySelector('button, a, input')?.focus();
  }
}
function closePanels() {
  $$('[data-panel]').forEach((p) => (p.hidden = true));
  $('.menu-btn').setAttribute('aria-expanded', 'false');
  lastFocus?.focus?.();
  lastFocus = null;
}

function renderSearch(q) {
  const n = normalize(q);
  const hits = n ? PRODUCTS.filter((p) => normalize(p.name + p.category).includes(n)) : PRODUCTS;
  $('[data-search-results]').innerHTML = hits.length
    ? hits.map((p) => `<li><button type="button" data-search-pick="${p.id}"><span class="name">${p.name}</span><span class="meta">${p.strength} · ${p.category} · ${money(p.price)}</span></button></li>`).join('')
    : '<li class="none">No compound matches. Full catalog arrives with client data.</li>';
}

// ---------- gate ----------
function initGate() {
  const until = store.get('mr-gate', 0);
  if (until > Date.now()) return;
  const gate = $('[data-gate]');
  gate.hidden = false;
  document.body.style.overflow = 'hidden';
  const checks = $$('[data-gate-check]');
  const enter = $('[data-gate-enter]');
  checks.forEach((c) => c.addEventListener('change', () => (enter.disabled = !checks.every((x) => x.checked))));
  enter.addEventListener('click', () => {
    store.set('mr-gate', Date.now() + 30 * 864e5);
    gate.hidden = true;
    document.body.style.overflow = '';
  });
  checks[0].focus();
}

// ---------- events ----------
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, a');
  if (!t) {
    if (e.target.matches('.overlay, .drawer-scrim')) closePanels();
    return;
  }
  if (t.dataset.open) {
    const panel = $(`[data-panel="${t.dataset.open}"]`);
    panel.hidden ? openPanel(t.dataset.open) : closePanels();
  } else if (t.hasAttribute('data-close')) closePanels();
  else if (t.dataset.add) addToCart(t.dataset.add);
  else if (t.hasAttribute('data-spot-add')) addToCart(current);
  else if (t.dataset.switch) selectProduct(t.dataset.switch);
  else if (t.dataset.qty) {
    const l = cart.find((x) => x.id === t.dataset.qty);
    l.qty += Number(t.dataset.d);
    if (l.qty <= 0) cart = cart.filter((x) => x !== l);
    saveCart();
  } else if (t.dataset.remove) {
    cart = cart.filter((x) => x.id !== t.dataset.remove);
    saveCart();
  } else if (t.hasAttribute('data-mock-order')) {
    cart = [{ id: 'klow', qty: 1 }, { id: 'bpc-157', qty: 2 }];
    saveCart();
  } else if (t.dataset.searchPick) {
    closePanels();
    selectProduct(t.dataset.searchPick);
    $('#spotlight').scrollIntoView({ behavior: 'smooth' });
  } else if (t.hasAttribute('data-checkout')) {
    toast('Demo: checkout, payments and accounts are out of scope for Phase 0.');
  } else if (t.hasAttribute('data-coa-btn')) {
    lookupCoa();
  } else if (t.dataset.demoPage) {
    e.preventDefault();
    closePanels();
    toast(`“${t.dataset.demoPage}” is planned for the full build — not part of this demo.`);
  } else if (t.closest('.menu-panel') && t.getAttribute('href')?.startsWith('#')) {
    closePanels();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePanels();
});
$('[data-search-input]').addEventListener('input', (e) => renderSearch(e.target.value));
$('[data-attest]').addEventListener('change', (e) => ($('[data-checkout]').disabled = !e.target.checked));
$('[data-discount]').addEventListener('submit', (e) => {
  e.preventDefault();
  const code = $('#code').value.trim().toUpperCase();
  if (code === 'DEMO10') {
    discount = { code, pct: 0.1 };
    toast('Code DEMO10 applied: 10% off.');
  } else {
    discount = null;
    toast('That code is not valid. Try DEMO10.');
  }
  renderCart();
});
function lookupCoa() {
  const lot = $('[data-coa-input]').value.trim().toUpperCase();
  const p = PRODUCTS.find((x) => x.specs.Lot === lot);
  $('[data-coa-result]').textContent = !lot
    ? ''
    : p
      ? `✓ ${lot} · ${p.name} ${p.strength} · certificate on file (demo)`
      : `No certificate found for ${lot}.`;
}
$('[data-coa-input]').addEventListener('keydown', (e) => e.key === 'Enter' && lookupCoa());

// ---------- boot ----------
renderCards();
renderSwitcher();
renderSpec(byId(current));
renderCart();
initGate();
paintStills(); // a composed still paints immediately

document.fonts?.ready.then(() => {
  labelCache.clear();
  paintStills();
  renderCart();
  startVials();
});

let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(paintStills, 200);
});

async function startVials() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = navigator.connection?.saveData;
  if (reduced || lowPower) return; // composed stills stay up; nothing breaks
  try {
    const mod = await import('./vials.js?v=4');
    if (!mod.webglAvailable()) return;
    vials = mod.initVials({
      canvas: $('.vial-canvas'),
      products: PRODUCTS,
      featured: FEATURED,
      spotlight: current,
      labelCache: new Map(PRODUCTS.map((p) => [p.id, labelFor(p)])),
      onReady: () => document.documentElement.classList.add('has-3d'),
      // clicking/tapping a hero or featured vial opens its spec sheet
      onVialClick: (p, isSpotlight) => {
        if (isSpotlight) return;
        selectProduct(p.id);
        setTimeout(() => $('#spotlight').scrollIntoView({ behavior: 'smooth' }), 350);
      },
    });
  } catch (err) {
    console.warn('3D hero unavailable, showing stills.', err);
  }
}

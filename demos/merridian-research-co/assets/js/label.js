// Draws Merridian vial labels to a canvas, built from the client's KLOW 80MG
// label: mark, wordmark, compound, strength, research-use line. The same
// canvas is used as the 3D label texture and for the static vial stills.

export const MARK_PATH =
  'M50 10 L65.6 19 L65.6 37 L50 46 L34.4 37 L34.4 19 Z M39 21.8 L39 34.2 ' +
  'M34.4 37 L24 43 L24 52 M50 46 L50 54 M65.6 37 L76 43 L76 52 M76 43 L84.6 34.4';
export const MARK_NODE = { x: 87, y: 32, r: 4.4 };
export const MARK_BOX = { x: 20, y: 6, w: 72, h: 50 };

const INK = { dark: '#ffffff', light: '#710E22' };
const STOCK = { dark: '#5a0612', light: '#ffffff' };

// Label proportions follow the vial. Like a real pharma vial, the label wraps
// most of the body: from just above the powder cake to the shoulder.
// SLIM narrows the vial (x/z scale) so it reads as a slender 3 mL vial.
export const SLIM = 0.82;
export const LABEL_Y0 = 0.175;
export const LABEL_Y1 = 0.925;
export const LABEL_H = LABEL_Y1 - LABEL_Y0;
export const LABEL_ASPECT = (2 * Math.PI * 0.3045 * SLIM) / LABEL_H;

function tracked(ctx, text, x, y, spacing, align = 'center') {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + spacing;
  });
  return total;
}

export function drawMark(ctx, cx, cy, height, ink, nodeColor, lineWidth) {
  const s = height / MARK_BOX.h;
  ctx.save();
  ctx.translate(cx - (MARK_BOX.x + MARK_BOX.w / 2) * s, cy - (MARK_BOX.y + MARK_BOX.h / 2) * s);
  ctx.scale(s, s);
  ctx.strokeStyle = ink;
  ctx.lineWidth = lineWidth / s;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';
  ctx.stroke(new Path2D(MARK_PATH));
  ctx.fillStyle = nodeColor;
  ctx.beginPath();
  ctx.arc(MARK_NODE.x, MARK_NODE.y, MARK_NODE.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawLabel(product, width = 2048) {
  const W = width;
  const H = Math.round(W / LABEL_ASPECT);
  const u = W / 2048; // horizontal scale unit
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  const v = (H * 0.95) / 760; // vertical scale unit (760 = layout baseline height)
  const ink = INK[product.theme];
  const stock = STOCK[product.theme];

  ctx.fillStyle = stock;
  ctx.fillRect(0, 0, W, H);

  // faint paper / print texture
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(255,255,255,0.05)');
  g.addColorStop(0.5, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.08)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.textBaseline = 'alphabetic';

  const cx = W / 2;
  const top = H * 0.1;
  const nodeColor = product.theme === 'dark' ? '#ffffff' : ink;

  // Front panel
  drawMark(ctx, cx, top + 70 * v, 118 * u, ink, nodeColor, 6 * u);

  ctx.font = `500 ${54 * u}px Montserrat, Arial, sans-serif`;
  tracked(ctx, 'MERRIDIAN', cx, top + 205 * v, 11 * u);

  ctx.font = `500 ${25 * u}px Montserrat, Arial, sans-serif`;
  const rc = tracked(ctx, 'RESEARCH CO.', cx, top + 258 * v, 10 * u);
  ctx.lineWidth = 2.5 * u;
  ctx.beginPath();
  ctx.moveTo(cx - rc / 2 - 24 * u, top + 249 * v);
  ctx.lineTo(cx - rc / 2 - 104 * u, top + 249 * v);
  ctx.moveTo(cx + rc / 2 + 24 * u, top + 249 * v);
  ctx.lineTo(cx + rc / 2 + 104 * u, top + 249 * v);
  ctx.stroke();

  const nameSize = product.name.length > 6 ? 92 : 112;
  ctx.font = `600 ${nameSize * u}px Montserrat, Arial, sans-serif`;
  tracked(ctx, product.name.toUpperCase(), cx, top + 400 * v, 12 * u);

  ctx.font = `500 ${46 * u}px Montserrat, Arial, sans-serif`;
  tracked(ctx, product.strength.toUpperCase(), cx, top + 478 * v, 9 * u);

  ctx.font = `500 ${24 * u}px Montserrat, Arial, sans-serif`;
  tracked(ctx, 'For Research Purposes Only', cx, top + 590 * v, 5 * u);

  // Left wrap panel: batch data
  const lx = W * 0.12;
  ctx.font = `500 ${22 * u}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.globalAlpha = 0.9;
  const rows = [
    ['LOT', product.specs.Lot],
    ['NET', `${product.strength} · lyophilized`],
    ['MFG', '2026-10'],
    ['EXP', '2028-10'],
  ];
  rows.forEach(([k, v], i) => {
    const y = top + 250 * v + i * 44 * u;
    tracked(ctx, k, lx, y, 2 * u, 'left');
    tracked(ctx, v, lx + 90 * u, y, 2 * u, 'left');
  });
  ctx.font = `400 ${20 * u}px "JetBrains Mono", ui-monospace, monospace`;
  tracked(ctx, 'Store at -20 °C. Protect from light.', lx, top + 470 * v, 1 * u, 'left');

  // Right wrap panel: standing notice + barcode
  const rx = W * 0.64;
  ctx.font = `600 ${21 * u}px Montserrat, Arial, sans-serif`;
  ['FOR LABORATORY RESEARCH', 'USE ONLY. NOT FOR HUMAN', 'OR VETERINARY USE.'].forEach((l, i) =>
    tracked(ctx, l, rx, top + 250 * v + i * 34 * u, 3 * u, 'left')
  );
  // barcode
  let bx = rx;
  const seed = [...product.id].reduce((a, ch) => a + ch.charCodeAt(0), 7);
  for (let i = 0; i < 46; i++) {
    const bw = (((seed * (i + 3)) % 4) + 1) * 2.4 * u;
    if (i % 2 === 0) ctx.fillRect(bx, top + 380 * v, bw, 90 * v);
    bx += bw + 2 * u;
  }
  ctx.font = `400 ${18 * u}px "JetBrains Mono", ui-monospace, monospace`;
  tracked(ctx, product.specs.Lot, rx, top + 500 * v, 3 * u, 'left');

  ctx.globalAlpha = 1;
  // hairlines top and bottom
  ctx.globalAlpha = 0.35;
  ctx.fillRect(0, 10 * u, W, 2 * u);
  ctx.fillRect(0, H - 12 * u, W, 2 * u);
  ctx.globalAlpha = 1;
  return c;
}

// A composed still of one vial, drawn in 2D. Paints instantly before WebGL
// loads, and is the full fallback for reduced motion / no WebGL.
export function drawVialStill(canvas, product, labelCanvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = canvas.clientWidth || 120;
  const ch = canvas.clientHeight || 260;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cw, ch);

  // vial proportions: total height 1.34, radius 0.3
  const Hpx = Math.min(ch * 0.94, cw * 2.4);
  const s = Hpx / 1.34;
  const sx = s * SLIM;
  const r = 0.3 * sx;
  const cx = cw / 2;
  const base = ch / 2 + Hpx / 2;
  const y = (v) => base - v * s;

  // glass body
  ctx.save();
  const glass = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  glass.addColorStop(0, 'rgba(255,255,255,0.28)');
  glass.addColorStop(0.18, 'rgba(255,255,255,0.06)');
  glass.addColorStop(0.75, 'rgba(255,255,255,0.03)');
  glass.addColorStop(0.92, 'rgba(255,255,255,0.22)');
  glass.addColorStop(1, 'rgba(255,255,255,0.08)');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.moveTo(cx - r, y(0.04));
  ctx.lineTo(cx - r, y(0.96));
  ctx.quadraticCurveTo(cx - r, y(1.04), cx - 0.18 * sx, y(1.07));
  ctx.lineTo(cx - 0.175 * sx, y(1.13));
  ctx.lineTo(cx + 0.175 * sx, y(1.13));
  ctx.lineTo(cx + 0.18 * sx, y(1.07));
  ctx.quadraticCurveTo(cx + r, y(1.04), cx + r, y(0.96));
  ctx.lineTo(cx + r, y(0.04));
  ctx.quadraticCurveTo(cx + r, y(0), cx + r - 0.04 * sx, y(0));
  ctx.lineTo(cx - r + 0.04 * sx, y(0));
  ctx.quadraticCurveTo(cx - r, y(0), cx - r, y(0.04));
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // puck
  ctx.fillStyle = product.puck;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(cx - r * 0.86, y(0.14), r * 1.72, 0.12 * s);
  ctx.globalAlpha = 1;

  // label: crop the front third of the wrap
  const lw = labelCanvas.width;
  const lh = labelCanvas.height;
  const frac = 0.34;
  ctx.drawImage(labelCanvas, lw * (0.5 - frac / 2), 0, lw * frac, lh, cx - r * 1.01, y(LABEL_Y1), r * 2.02, LABEL_H * s);
  const shade = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  shade.addColorStop(0, 'rgba(0,0,0,0.55)');
  shade.addColorStop(0.3, 'rgba(0,0,0,0)');
  shade.addColorStop(0.42, 'rgba(255,255,255,0.12)');
  shade.addColorStop(0.7, 'rgba(0,0,0,0.05)');
  shade.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = shade;
  ctx.fillRect(cx - r * 1.01, y(LABEL_Y1), r * 2.02, LABEL_H * s);

  // crimp
  const al = ctx.createLinearGradient(cx - 0.215 * sx, 0, cx + 0.215 * sx, 0);
  al.addColorStop(0, '#6d7076');
  al.addColorStop(0.35, '#e9ebee');
  al.addColorStop(0.6, '#a9adb3');
  al.addColorStop(1, '#55585d');
  ctx.fillStyle = al;
  ctx.fillRect(cx - 0.215 * sx, y(1.25), 0.43 * sx, 0.13 * s);

  // flip-off cap
  const cap = ctx.createLinearGradient(cx - 0.21 * sx, 0, cx + 0.21 * sx, 0);
  cap.addColorStop(0, shadeHex(product.cap, -0.45));
  cap.addColorStop(0.38, shadeHex(product.cap, 0.25));
  cap.addColorStop(1, shadeHex(product.cap, -0.5));
  ctx.fillStyle = cap;
  ctx.beginPath();
  ctx.roundRect(cx - 0.21 * sx, y(1.335), 0.42 * sx, 0.09 * s, [3, 3, 0, 0]);
  ctx.fill();
}

function shadeHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

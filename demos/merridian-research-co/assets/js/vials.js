// The rolling vials (PRD section 05, beats 1–4).
//
// One fixed, transparent WebGL canvas sits over the page. Each frame, every
// vial's target pose is computed from the positions of real DOM anchors
// (.hero-stage, #roll, .vial-slot, .spotlight-stage), so the motion follows
// the native scrollbar and lines up with the HTML at any screen size.
// The canvas is decorative: aria-hidden, pointer-events: none. Hover and tap
// are detected by raycasting from window pointer events.
//
// Vials 0–2 are the featured trio (hero → roll → featured row). Vial 3 is the
// spec-sheet vial; it is the only one the product switcher changes.

import * as THREE from 'three';
import { drawLabel, SLIM, LABEL_Y0, LABEL_Y1, LABEL_H } from './label.js';

const VIAL_H = 1.34; // model height in world units
const VIAL_R = 0.3 * SLIM;
const FOV = 20;
const CAM_Z = 10;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (a) => (a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2);
const TAU = Math.PI * 2;
const SPOT = 3;

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

// Product-photography lighting: tall softbox strips left and right give the
// long vertical highlights you see on real glass; a broad front panel lights
// the labels; a small node-blue card behind adds one accent.
function studioEnvironment(renderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x050505);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const panel = (w, h, d, x, y, z, rgb, ry = 0) => {
    const m = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    m.color.setRGB(...rgb);
    const mesh = new THREE.Mesh(box, m);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    mesh.rotation.y = ry;
    env.add(mesh);
  };
  panel(0.6, 9, 0.1, -4.2, 0.5, 1.2, [7, 7, 7], 0.5); // key strip, left
  panel(0.35, 9, 0.1, 4.4, 0.5, 0.4, [3.2, 3.2, 3.4], -0.4); // fill strip, right
  panel(7, 4, 0.1, 0, 0.5, 7, [0.55, 0.54, 0.53]); // broad front fill
  panel(6, 0.1, 6, 0, 6, 0, [2.2, 2.2, 2.2]); // overhead
  panel(1.4, 3, 0.1, 3.2, 1, -5, [0.5, 1.4, 3.4]); // node-blue card behind
  panel(8, 0.1, 8, 0, -4, 0, [0.35, 0.03, 0.06]); // maroon floor bounce
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  return tex;
}

function noiseTexture(size = 256, seed = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  let s = seed * 9301 + 49297;
  for (let i = 0; i < size * size; i++) {
    s = (s * 9301 + 49297) % 233280;
    const v = 110 + (s / 233280) * 145;
    img.data.set([v, v, v, 255], i * 4);
  }
  ctx.putImageData(img, 0, 0);
  // soften into a fine grain; raw per-pixel noise sparkles as the vial moves
  const soft = document.createElement('canvas');
  soft.width = soft.height = size;
  const sctx = soft.getContext('2d');
  sctx.filter = 'blur(1.5px)';
  sctx.drawImage(c, 0, 0);
  const t = new THREE.CanvasTexture(soft);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Glass on a transparent canvas: clear face-on, brighter toward the edges
// (Fresnel), and any reflected highlight is allowed to show at full strength.
function glassMaterial(side, base) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, side,
    clearcoat: 1, clearcoatRoughness: 0.03, ior: 1.5, specularIntensity: 1,
    envMapIntensity: 1.6, depthWrite: false,
  });
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `float fres = pow(1.0 - clamp(abs(dot(normalize(-vViewPosition), normal)), 0.0, 1.0), 4.0);
       outgoingLight *= mix(vec3(1.0), vec3(0.86, 0.96, 0.94), fres);
       float spec = smoothstep(0.22, 0.85, luminance(outgoingLight));
       diffuseColor.a = clamp(${base.toFixed(3)} + fres * 0.9 + spec * 0.85, 0.0, 1.0);
       #include <opaque_fragment>`
    );
  };
  return m;
}

export function initVials({ canvas, products, featured, spotlight, labelCache, onReady, onVialClick }) {
  const isMobile = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 0.85;

  const camera = new THREE.PerspectiveCamera(FOV, 1, 5, 15);
  camera.position.set(0, 0, CAM_Z);

  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(-3, 4, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x58a0f2, 1.1); // node blue, one highlight
  rim.position.set(5, 1, -4);
  scene.add(rim);

  // ---------- shared geometry (y = 0 at the vial base) ----------
  const seg = isMobile ? 40 : 72;
  const v2 = (pts) => pts.map(([r, y]) => new THREE.Vector2(r, y));
  const outer = [
    [0.0, 0.0], [0.24, 0.0], [0.285, 0.006], [0.299, 0.03], [0.3, 0.06], [0.3, 0.95], [0.297, 0.99],
    [0.278, 1.025], [0.226, 1.052], [0.186, 1.07], [0.176, 1.09], [0.176, 1.11],
  ];
  // inner wall: ~1.4% thinner, with a thick glass base (the puck sits on it)
  const inner = [
    [0.0, 0.035], [0.22, 0.035], [0.27, 0.042], [0.285, 0.07], [0.286, 0.95], [0.283, 0.985],
    [0.264, 1.018], [0.214, 1.044], [0.166, 1.064], [0.158, 1.085], [0.158, 1.11],
  ];
  const glassGeo = new THREE.LatheGeometry(v2(outer), seg);
  const glassInGeo = new THREE.LatheGeometry(v2(inner), seg);
  const labelGeo = new THREE.CylinderGeometry(0.3045, 0.3045, LABEL_H, isMobile ? 48 : 96, 1, true, Math.PI, TAU);
  // freeze-dried cake: slightly domed and uneven on top
  const puckGeo = new THREE.LatheGeometry(v2([[0, 0.035], [0.27, 0.035], [0.284, 0.06], [0.284, 0.13], [0.265, 0.148], [0.18, 0.158], [0.0, 0.162]]), 40);
  const stopperGeo = new THREE.LatheGeometry(v2([[0, 1.03], [0.15, 1.03], [0.158, 1.06], [0.158, 1.11], [0.0, 1.11]]), 32);
  const crimpGeo = new THREE.LatheGeometry(
    v2([[0.172, 1.096], [0.19, 1.1], [0.205, 1.106], [0.212, 1.118], [0.216, 1.135], [0.216, 1.238], [0.212, 1.252], [0.198, 1.259], [0.14, 1.262], [0.135, 1.258]]),
    seg
  );
  const capGeo = new THREE.LatheGeometry(
    v2([[0.19, 1.254], [0.204, 1.262], [0.208, 1.275], [0.208, 1.318], [0.203, 1.332], [0.19, 1.338], [0.1, 1.339], [0.085, 1.334], [0.0, 1.334]]),
    seg
  );
  const hitGeo = new THREE.CylinderGeometry(0.32, 0.32, VIAL_H, 12);
  hitGeo.translate(0, VIAL_H / 2, 0);

  const glassOut = glassMaterial(THREE.FrontSide, 0.0);
  const glassIn = glassMaterial(THREE.BackSide, 0.0);
  glassIn.envMapIntensity = 0.9;
  const crimpMat = new THREE.MeshPhysicalMaterial({ color: 0xd2d5da, metalness: 1, roughness: 0.24, anisotropy: 0.7, anisotropyRotation: Math.PI / 2 });
  const stopperMat = new THREE.MeshStandardMaterial({ color: 0x47484c, roughness: 0.75 });
  const grain = noiseTexture(256, 3);
  const paperGrain = noiseTexture(512, 7);
  paperGrain.repeat.set(6, 2);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });

  // soft contact shadow, drawn under upright vials (fades as they tip or lift)
  const shadowTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 32, 4, 128, 32, 128);
    g.addColorStop(0, 'rgba(0,0,0,0.9)');
    g.addColorStop(0.35, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.setTransform(1, 0, 0, 0.25, 0, 24);
    ctx.fillStyle = g;
    ctx.fillRect(0, -96, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const shadowGeo = new THREE.PlaneGeometry(1, 0.25);

  // ---------- label textures ----------
  const texW = isMobile ? 1024 : 2048;
  const textures = new Map();
  const getTexture = (p) => {
    if (textures.has(p.id)) return textures.get(p.id);
    const canvasEl = labelCache.get(p.id) || drawLabel(p, texW);
    const t = new THREE.CanvasTexture(canvasEl);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.set(p.id, t);
    return t;
  };

  function makeVial(product) {
    const g = new THREE.Group();
    const body = new THREE.Group();
    body.position.y = -VIAL_H / 2;
    body.scale.set(SLIM, 1, SLIM);
    g.add(body);

    const puckMat = new THREE.MeshStandardMaterial({ color: product.puck, roughness: 1, bumpMap: isMobile ? null : grain, bumpScale: 1.6 });
    const labelMat = new THREE.MeshPhysicalMaterial({
      map: getTexture(product), roughness: 0.66, clearcoat: 0.06, clearcoatRoughness: 0.5,
      bumpMap: isMobile ? null : paperGrain, bumpScale: 0.35, sheen: 0.35, sheenRoughness: 0.9, envMapIntensity: 1.5,
    });
    const capMat = new THREE.MeshPhysicalMaterial({ color: product.cap, roughness: 0.58, clearcoat: 0.12, clearcoatRoughness: 0.6, sheen: 0.4, sheenRoughness: 0.7, bumpMap: isMobile ? null : grain, bumpScale: 0.45 });

    const glassInner = new THREE.Mesh(glassInGeo, glassIn);
    glassInner.renderOrder = 1;
    const glassOuter = new THREE.Mesh(glassGeo, glassOut);
    glassOuter.renderOrder = 3;
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.y = (LABEL_Y0 + LABEL_Y1) / 2;
    const hit = new THREE.Mesh(hitGeo, hitMat);
    hit.userData.vial = true;

    body.add(
      new THREE.Mesh(puckGeo, puckMat),
      new THREE.Mesh(stopperGeo, stopperMat),
      label,
      new THREE.Mesh(crimpGeo, crimpMat),
      new THREE.Mesh(capGeo, capMat),
      glassInner,
      glassOuter,
      hit
    );
    scene.add(g);
    const shadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    shadow.renderOrder = -1;
    scene.add(shadow);
    return { group: g, hit, shadow, labelMat, capMat, puckMat, product };
  }

  const byId = (id) => products.find((p) => p.id === id);
  const vials = [...featured.map((id) => makeVial(byId(id))), makeVial(byId(spotlight))];
  const state = vials.map(() => null); // smoothed poses
  const hover = vials.map(() => ({ h: 0, spin: 0, anim: null }));

  // ---------- layout ----------
  let W = innerWidth;
  let Hs = innerHeight;
  let k = 1; // world units per CSS px at z = 0
  function resize() {
    W = innerWidth;
    Hs = innerHeight;
    renderer.setSize(W, Hs, false);
    camera.aspect = W / Hs;
    camera.updateProjectionMatrix();
    k = (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z) / Hs;
    state.fill(null);
  }
  addEventListener('resize', resize);
  resize();

  const $ = (s) => document.querySelector(s);
  const heroStage = $('.hero-stage');
  const roll = $('#roll');
  const slots = [...document.querySelectorAll('.vial-slot')];
  const spotStage = $('.spotlight-stage');

  // ---------- choreography ----------
  const qUp = new THREE.Quaternion();
  const qLie = new THREE.Quaternion();
  const qSpin = new THREE.Quaternion();
  const eUp = new THREE.Euler();
  const eLie = new THREE.Euler();
  const Y = new THREE.Vector3(0, 1, 0);

  const start = performance.now();
  let switchSpin = 0; // extra turns on the spec-sheet vial (beat 4)

  function heroPose(i, t, R) {
    const desktop = W > 760;
    const fx = desktop ? [0.2, 0.52, 0.82][i] : [0.2, 0.5, 0.8][i];
    const fy = [0.58, 0.47, 0.6][i];
    const size = Math.min(R.height * (i === 1 ? 0.72 : 0.54), R.width * (i === 1 ? 0.72 : 0.54) * 1.3);
    const intro = easeOut(clamp((t - 0.15 - i * 0.18) / 1.4));
    return {
      x: R.left + R.width * fx,
      y: R.top + R.height * fy + Math.sin(t * 0.9 + i * 1.7) * size * 0.025 + (1 - intro) * Hs * 0.7,
      size,
      lie: 0,
      rz: [0.16, -0.05, -0.2][i] + Math.sin(t * 0.6 + i) * 0.03,
      spin: Math.sin(t * 0.45 + i * 2.1) * 0.55,
    };
  }

  function rollPose(i, p) {
    // a diagonal row lying on its side, rolling right → left
    const desktop = W > 760;
    const size = desktop ? Math.min(Hs * 0.36, W * 0.2) : Math.min(Hs * 0.24, W * 0.36);
    const cx = lerp(W * (desktop ? 0.74 : 0.7), W * (desktop ? 0.28 : 0.32), p);
    const off = i - 1;
    const x = cx + off * size * (desktop ? 0.95 : 0.8);
    const y = Hs * 0.56 + off * size * 0.22;
    const travel = W * (desktop ? 0.46 : 0.38) * p; // px rolled so far
    const radiusPx = (VIAL_R / VIAL_H) * size;
    return { x, y, size, lie: 1, rz: 0, spin: travel / radiusPx };
  }

  const blend = (a, b, t) => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    size: lerp(a.size, b.size, t),
    lie: lerp(a.lie, b.lie, t),
    rz: lerp(a.rz, b.rz, t),
    spin: lerp(a.spin, b.spin, t),
  });

  function featuredPose(i, t) {
    const r0 = heroStage.getBoundingClientRect();
    // vials drift up slower than the page as the hero leaves (parallax)
    const R = { left: r0.left, width: r0.width, height: r0.height, top: r0.top < 0 ? r0.top * 0.4 : r0.top };
    const RR = roll.getBoundingClientRect();
    const tip = ease(clamp(1 - RR.top / (Hs * 0.95)));
    const rp = clamp(-RR.top / Math.max(1, RR.height - Hs));
    let pose = blend(heroPose(i, t, R), rollPose(i, rp), tip);

    // beat 3: stand up and land in the featured row
    const S = slots[i].getBoundingClientRect();
    const land = ease(clamp((Hs * 0.98 - S.top - i * Hs * 0.03) / (Hs * 0.42)));
    if (land > 0) {
      const endSpin = Math.round(rollPose(i, 1).spin / TAU) * TAU;
      pose.spin = lerp(pose.spin, endSpin, land);
      pose = blend(pose, {
        x: S.left + S.width / 2,
        y: S.top + S.height / 2 - Math.sin(land * Math.PI) * Hs * 0.06,
        size: S.height * (W > 760 ? 0.86 : 0.76),
        lie: 0,
        rz: 0,
        spin: endSpin + Math.sin(t * 0.5 + i * 2) * 0.22,
      }, land);
    }
    return pose;
  }

  // beat 4: the spec-sheet vial rises and spins into its stage
  function spotPose(t) {
    const G = spotStage.getBoundingClientRect();
    const e = easeOut(clamp((Hs * 1.05 - G.top) / (Hs * 0.7)));
    return {
      x: G.left + G.width / 2,
      y: G.top + G.height / 2 + (1 - e) * Hs * 0.45,
      size: Math.min(G.height * 0.8, G.width * 1.5),
      lie: 0,
      rz: -0.08 * e,
      spin: switchSpin + Math.sin(t * 0.4) * 0.14 - (1 - e) * TAU,
    };
  }

  function apply(v, p) {
    const g = v.group;
    g.position.set((p.x - W / 2) * k, -(p.y - Hs / 2) * k, 0);
    g.scale.setScalar((p.size * k) / VIAL_H);
    eUp.set(0, 0, p.rz);
    qUp.setFromEuler(eUp);
    // lying on its side on a floor tipped toward the camera, angled into a row
    eLie.set(0.62, 0, W > 760 ? 0.42 : 0.36, 'ZXY');
    qLie.setFromEuler(eLie);
    qUp.slerp(qLie, p.lie);
    qSpin.setFromAxisAngle(Y, -p.spin);
    g.quaternion.copy(qUp).multiply(qSpin);
    g.visible = p.y > -p.size && p.y < Hs + p.size && p.x > -p.size && p.x < W + p.size;
  }

  // ---------- beat 4: product switcher ----------
  // Every turn ends on a whole revolution, so the label always comes to rest
  // facing the camera. The label swap happens as the label passes the back.
  // Requests during a turn are queued and the swap uses the latest choice; a
  // request after the swap starts a fresh turn from wherever the vial is.
  let wanted = vials[SPOT].product;
  let switchAnim = null;
  function startSwitch(now) {
    const from = switchSpin;
    let to = (Math.floor(from / TAU) + 1) * TAU;
    if (to - from < Math.PI) to += TAU;
    switchAnim = { t0: now, from, to, swapAt: to - Math.PI, dur: 1100 * ((to - from) / TAU) ** 0.6, swapped: false };
  }
  function switchTo(product) {
    wanted = product;
    if (switchAnim && !switchAnim.swapped) return;
    if (!switchAnim && vials[SPOT].product.id === product.id) return;
    startSwitch(performance.now());
  }
  function stepSwitch(now) {
    if (!switchAnim) return;
    const v = vials[SPOT];
    const { t0, from, to, swapAt, dur } = switchAnim;
    const a = clamp((now - t0) / dur);
    switchSpin = from + easeInOut(a) * (to - from);
    if (!switchAnim.swapped && switchSpin >= swapAt) {
      switchAnim.swapped = true;
      v.labelMat.map = getTexture(wanted);
      v.capMat.color.set(wanted.cap);
      v.puckMat.color.set(wanted.puck);
      v.product = wanted;
    }
    if (a >= 1) {
      switchSpin = 0; // `to` is a whole revolution: same pose, reset the number
      switchAnim = null;
      if (v.product.id !== wanted.id) startSwitch(now);
    }
  }

  // ---------- hover / tap ----------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let pointer = null;
  let hovered = -1;
  const blocked = (el) => el?.closest?.('a, button, input, label, .site-header, .demo-bar, [data-panel], [data-gate], .toast');

  function pick(x, y) {
    ndc.set((x / W) * 2 - 1, -(y / Hs) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(vials.filter((v) => v.group.visible).map((v) => v.hit), false);
    return hits.length ? vials.findIndex((v) => v.hit === hits[0].object) : -1;
  }
  function flourish(i, now) {
    const hv = hover[i];
    if (!hv.anim) hv.anim = { t0: now };
  }
  // Hover and click are for mouse/trackpad only. Phones and tablets get none
  // of it, so a tap while scrolling never spins or jumps the page.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    pointer = blocked(e.target) ? null : { x: e.clientX, y: e.clientY };
  }, { passive: true });
  document.addEventListener('pointerleave', () => (pointer = null));
  if (finePointer) addEventListener('click', (e) => {
    if (blocked(e.target)) return;
    const i = pick(e.clientX, e.clientY);
    if (i < 0) return;
    flourish(i, performance.now());
    onVialClick?.(vials[i].product, i === SPOT);
  });

  function stepHover(now, dt) {
    const next = pointer ? pick(pointer.x, pointer.y) : -1;
    if (next !== hovered) {
      if (next >= 0) flourish(next, now);
      hovered = next;
      document.documentElement.classList.toggle('vial-hover', hovered >= 0);
    }
    const a = 1 - Math.exp(-dt * 10);
    hover.forEach((hv, i) => {
      hv.h = lerp(hv.h, i === hovered ? 1 : 0, a);
      if (hv.anim) {
        const p = clamp((now - hv.anim.t0) / 1300);
        hv.spin = easeOut(p) * TAU;
        if (p >= 1) {
          hv.anim = null;
          hv.spin = 0;
        }
      }
    });
  }

  // ---------- loop ----------
  let last = performance.now();
  let running = true;
  let firstFrame = true;
  let wasVisible = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  const KEYS = ['x', 'y', 'size', 'lie', 'rz', 'spin'];
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - start) / 1000;
    stepSwitch(now);
    stepHover(now, dt);
    const a = 1 - Math.exp(-dt * 9);
    let anyVisible = false;
    vials.forEach((v, i) => {
      const target = i === SPOT ? spotPose(t) : featuredPose(i, t);
      if (!state[i]) state[i] = { ...target };
      else for (const key of KEYS) state[i][key] = lerp(state[i][key], target[key], a);

      // hover: lift, lean toward the cursor, and one full turn
      const hv = hover[i];
      const s = state[i];
      const lean = pointer && hv.h > 0.01 ? clamp((pointer.x - s.x) / s.size, -1, 1) * -0.12 : 0;
      apply(v, {
        x: s.x,
        y: s.y - s.size * 0.05 * hv.h,
        size: s.size * (1 + 0.06 * hv.h),
        lie: s.lie,
        rz: s.rz + lean * hv.h,
        spin: s.spin + hv.spin,
      });
      const sh = v.shadow;
      const upright = (1 - s.lie) * (1 - 0.5 * hv.h);
      sh.visible = v.group.visible && upright > 0.02;
      if (sh.visible) {
        const px = s.size * 0.62;
        sh.position.set((s.x - W / 2) * k, -(s.y + s.size * 0.5 - s.size * 0.015 - Hs / 2) * k, -0.5);
        sh.scale.setScalar(px * k);
        sh.material.opacity = upright * 0.85;
      }
      anyVisible ||= v.group.visible;
    });
    // battery-aware: skip the draw when nothing is on screen
    if (anyVisible) renderer.render(scene, camera);
    else if (wasVisible) renderer.clear();
    wasVisible = anyVisible;
    if (firstFrame) {
      firstFrame = false;
      onReady?.();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return { switchTo };
}

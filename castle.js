/* Innerve 11 — Infinity Castle (無限城) v2.
   A corridor → a vertical drop through a shoji shaft → a lower hall → the doors.
   main.js pins #castle and writes window.CASTLE.progress (0..1). This file renders,
   fires biwa "shifts" that rearrange the castle, and emits `castle-moon` events. */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const host = document.getElementById("castleGL");
const state = (window.CASTLE = window.CASTLE || { progress: 0 });
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = innerWidth < 700;
const level = () => (window.SFX && window.SFX.level ? window.SFX.level() : 0);

const renderer = new THREE.WebGLRenderer({ canvas: host, antialias: !mobile, powerPreference: "high-performance" });
const DPR_MAX = Math.min(devicePixelRatio, mobile ? 1.25 : 1.5);
let dpr = DPR_MAX;
renderer.setPixelRatio(dpr);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#0b0407");
scene.fog = new THREE.FogExp2("#12060b", .026);
const camera = new THREE.PerspectiveCamera(64, 1, .1, 500);

state.info = renderer.info;
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .6, .5, .82);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---------- textures ---------- */
const canvasTex = (w, h, draw, repeat) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
};
const drawShoji = (g, w, h) => {
  const grd = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, h * .7);
  grd.addColorStop(0, "#ffe9bd"); grd.addColorStop(1, "#d48f45");
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#26110a"; g.lineWidth = 6;
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); }
  for (let j = 1; j < 6; j++) { g.beginPath(); g.moveTo(0, j * h / 6); g.lineTo(w, j * h / 6); g.stroke(); }
  g.lineWidth = 18; g.strokeRect(0, 0, w, h);
};
const shojiTex = canvasTex(256, 384, drawShoji);
const shojiTall = canvasTex(256, 384, drawShoji, [3, 14]);
const woodTex = canvasTex(256, 256, (g, w, h) => {
  for (let i = 0; i < 8; i++) {
    g.fillStyle = ["#3a1d10", "#43230f", "#331a0e", "#4a2812"][i % 4]; g.fillRect(0, i * h / 8, w, h / 8);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke();
    g.strokeStyle = "rgba(255,200,140,.07)";
    for (let k = 0; k < 5; k++) { g.beginPath(); const y = i * h / 8 + Math.random() * h / 8; g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 3, w * .6, y - 3, w, y + 1); g.stroke(); }
  }
}, [1, 8]);
const tatamiTex = canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = "#6f7a3c"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(0,0,0,.18)"; for (let y = 0; y < h; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = "#1c120c"; g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h);
});
const plateTex = (txt) => canvasTex(512, 160, (g, w, h) => {
  g.font = "800 112px 'Shippori Mincho B1', serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = "#ff1a3c"; g.shadowBlur = 28; g.fillStyle = "#ff2a48"; g.fillText(txt, w / 2, h / 2 + 6);
  g.shadowBlur = 0; g.fillStyle = "#ffd0d6"; g.fillText(txt, w / 2, h / 2 + 6);
});

/* ---------- materials ---------- */
// Lambert keeps per-pixel cost low; everything static is merged below into a few draw calls
const M = {
  shoji: new THREE.MeshLambertMaterial({ map: shojiTex, emissive: new THREE.Color("#ff9d4a"), emissiveMap: shojiTex, emissiveIntensity: .45, side: THREE.DoubleSide }),
  shojiTall: new THREE.MeshLambertMaterial({ map: shojiTall, emissive: new THREE.Color("#ff8a3a"), emissiveMap: shojiTall, emissiveIntensity: .45, side: THREE.DoubleSide }),
  wood: new THREE.MeshLambertMaterial({ map: woodTex }),
  beam: new THREE.MeshLambertMaterial({ color: "#1d0d08" }),
  red: new THREE.MeshLambertMaterial({ color: "#8e0a1f", emissive: new THREE.Color("#3a0008") }),
  tatami: new THREE.MeshLambertMaterial({ map: tatamiTex }),
  lantern: new THREE.MeshLambertMaterial({ color: "#ffcf8a", emissive: new THREE.Color("#ff7a1a"), emissiveIntensity: 2.4 })
};
scene.add(new THREE.HemisphereLight("#ff9a6a", "#1a0610", .5));
const camLight = new THREE.PointLight("#ffb070", 18, 26, 1.6); scene.add(camLight);
const demonLight = new THREE.PointLight("#ff1a3c", 0, 14, 1.4); scene.add(demonLight);

const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const lanternGeo = new THREE.CylinderGeometry(.28, .28, .62, 10);
const lantern = (x, y, z, parent) => { const l = new THREE.Mesh(lanternGeo, M.lantern); l.position.set(x, y, z); parent.add(l); };

/* ---------- architecture ---------- */
const world = new THREE.Group(); scene.add(world);
const FLOOR_A = -2.2, FLOOR_B = -82.2;
const corridor = (z0, z1, fy) => {
  const len = z0 - z1;
  const floor = box(6, .4, len, M.wood); floor.position.set(0, fy, (z0 + z1) / 2); world.add(floor);
  for (let z = z0 - 2, i = 0; z > z1; z -= 10, i++) {
    [-3.1, 3.1].forEach((x) => { const p = box(.45, 6.4, .45, M.beam); p.position.set(x, fy + 3, z); world.add(p); });
    const lin = box(7.4, .45, .55, M.red); lin.position.set(0, fy + 6.1, z); world.add(lin);
    const lin2 = box(6.8, .25, .4, M.beam); lin2.position.set(0, fy + 5.5, z); world.add(lin2);
    const side = i % 2 ? 1 : -1;
    for (let k = 0; k < 2; k++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 5.4), M.shoji);
      s.position.set(side * 3.05, fy + 2.75, z - 2.2 - k * 2.6); s.rotation.y = side * Math.PI / 2; world.add(s);
    }
    lantern(-side * 2.4, fy + 4.8, z - 5, world);
  }
};
corridor(10, -94, FLOOR_A);
corridor(-112, -222, FLOOR_B);

// the shaft: four glowing shoji walls you fall between
const SHAFT_Z = -104, SH = 4.2;
const wall = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.shojiTall); m.position.set(x, y, z); m.rotation.y = ry; world.add(m); };
wall(2 * SH, 82, -SH, -43, SHAFT_Z, Math.PI / 2);
wall(2 * SH, 82, SH, -43, SHAFT_Z, -Math.PI / 2);
wall(2 * SH, 76, 0, -46, SHAFT_Z + SH, Math.PI);   // near wall starts below corridor A
wall(2 * SH, 76, 0, -38, SHAFT_Z - SH, 0);         // far wall ends above corridor B
for (let y = -8, k = 0; y > -80; y -= 9, k++) {
  [[0, SHAFT_Z + SH], [0, SHAFT_Z - SH]].forEach(([x, z]) => { const b = box(2 * SH + .6, .4, .4, M.beam); b.position.set(x, y, z); world.add(b); });
  [[-SH, SHAFT_Z], [SH, SHAFT_Z]].forEach(([x, z]) => { const b = box(.4, .4, 2 * SH + .6, M.beam); b.position.set(x, y, z); world.add(b); });
  lantern(k % 2 ? -SH + .7 : SH - .7, y - 1, SHAFT_Z + (k % 2 ? 1.5 : -1.5), world);
}

/* ---------- bake the static architecture: one draw call per material ---------- */
{
  world.updateMatrixWorld(true);
  const byMat = new Map();
  world.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry.index ? o.geometry.clone() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    if (!byMat.has(o.material)) byMat.set(o.material, []);
    byMat.get(o.material).push(g);
  });
  world.clear();
  byMat.forEach((geos, mat) => world.add(new THREE.Mesh(mergeGeometries(geos, false), mat)));
}

/* ---------- floating rooms in every orientation (instanced) ---------- */
const rooms = new THREE.Group(); scene.add(rooms);
rooms.position.set(0, -40, -105);
const rnd = (a, b) => a + Math.random() * (b - a);
const dummy = new THREE.Object3D();
const roomMats = [M.shoji, M.wood, M.tatami, M.beam, M.red];
const perMat = mobile ? 22 : 44;
const placeRoom = (inst, i, scale) => {
  const ang = rnd(0, Math.PI * 2), r = rnd(12, 70);
  dummy.position.set(Math.cos(ang) * r, rnd(-80, 80), Math.sin(ang) * r * 1.8);
  dummy.rotation.set(rnd(-.6, .6) + (Math.random() < .25 ? Math.PI / 2 : 0), rnd(0, Math.PI), rnd(-.6, .6) + (Math.random() < .2 ? Math.PI : 0));
  if (scale) dummy.scale.set(rnd(2, 10), rnd(.4, 7), rnd(2, 12)); else dummy.scale.set(1, 1, 1);
  dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
};
const instanced = [];
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
roomMats.forEach((mat, k) => {
  const n = k === 0 ? perMat * 2 : perMat;
  const inst = new THREE.InstancedMesh(boxGeo, mat, n);
  for (let i = 0; i < n; i++) placeRoom(inst, i, true);
  inst.userData.scaled = true; rooms.add(inst); instanced.push(inst);
});
{ // staircases: one merged flight, instanced
  const steps = [];
  for (let k = 0; k < 10; k++) { const g = new THREE.BoxGeometry(2.4, .3, .9); g.translate(0, k * .45, -k * .8); steps.push(g); }
  const stairs = new THREE.InstancedMesh(mergeGeometries(steps), M.wood, 22);
  for (let i = 0; i < 22; i++) placeRoom(stairs, i, false);
  rooms.add(stairs); instanced.push(stairs);
}

/* ---------- camera path ---------- */
const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, .4, 9), new THREE.Vector3(0, .4, -40), new THREE.Vector3(0, .4, -88),
  new THREE.Vector3(0, -2, -99), new THREE.Vector3(0, -14, -104), new THREE.Vector3(0, -45, -104),
  new THREE.Vector3(0, -70, -104), new THREE.Vector3(0, -78.6, -110), new THREE.Vector3(0, -79.6, -124),
  new THREE.Vector3(0, -79.6, -170), new THREE.Vector3(0, -79.6, -203)
], false, "centripetal");

/* ---------- Upper Moons — inflated 2.5D figures that turn and lunge ---------- */
const demons = [];
const auraTex = canvasTex(128, 128, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gr.addColorStop(0, "rgba(255,30,60,.9)"); gr.addColorStop(.4, "rgba(200,0,40,.35)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
// each demon: the official art as a billboard
const demon = (i, id, rank, x, fy, z, h, onPlatform) => {
  const g = new THREE.Group(); g.position.set(x, fy + .2, z); scene.add(g);
  const d = { g, i, h, x0: x, y0: g.position.y, side: Math.sign(x) || 1, lunge: 0, lunged: false, turn: 0, flat: null };
  demons.push(d);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .81), new THREE.MeshBasicMaterial({ map: plateTex(rank), transparent: true, depthWrite: false, toneMapped: false, fog: false, opacity: 0 }));
  plate.position.y = h + .7; g.add(plate); d.plate = plate;
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(h * 1.5, h * 1.5), new THREE.MeshBasicMaterial({ map: auraTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0 }));
  aura.position.set(0, h * .5, -.6); g.add(aura); d.aura = aura;
  new THREE.TextureLoader().load(`assets/img/chars/${id}.webp`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const a = tex.image.width / tex.image.height;
      const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(.8, .8, .8), transparent: true, alphaTest: .02, fog: false, depthWrite: false, toneMapped: false, opacity: 0 });
      d.flat = new THREE.Mesh(new THREE.PlaneGeometry(h * a, h), mat); d.flat.position.y = h / 2; g.add(d.flat);
  });
  if (onPlatform) { const p = box(3.2, .35, 3.2, M.red); p.position.set(x, fy, z); scene.add(p); }
};
demon(0, "daki",      "上弦の陸", -2.1, FLOOR_A, -26, 4.2);
demon(1, "gyokko",    "上弦の伍",  2.1, FLOOR_A, -52, 3.8);
demon(2, "hantengu",  "上弦の肆", -2.0, FLOOR_A, -78, 3.2);
demon(3, "akaza",     "上弦の参",  2.3, -46,     SHAFT_Z, 3.6, true);
demon(4, "doma",      "上弦の弐", -2.2, FLOOR_B, -136, 4.2);
demon(5, "kokushibo", "上弦の壱",  2.1, FLOOR_B, -160, 4.4);
demon(6, "nakime",    "琵琶",     -2.3, FLOOR_B, -190, 4.2);

/* ---------- the final doors ---------- */
const DOOR_Z = -208, DY = FLOOR_B + 3.2;
const glow = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 6.2), new THREE.MeshBasicMaterial({ color: "#ff1030", fog: false, toneMapped: false }));
glow.position.set(0, DY, DOOR_Z - .6); scene.add(glow);
const doorL = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 6), M.shoji); doorL.position.set(-1.6, DY, DOOR_Z); scene.add(doorL);
const doorR = doorL.clone(); doorR.position.x = 1.6; scene.add(doorR);
const df = box(7.4, .5, .5, M.red); df.position.set(0, DY + 3.2, DOOR_Z); scene.add(df);

/* ---------- dust ---------- */
const dustN = mobile ? 700 : 1500, dust = new Float32Array(dustN * 3);
for (let i = 0; i < dustN; i++) { dust[i * 3] = rnd(-24, 24); dust[i * 3 + 1] = rnd(-95, 15); dust[i * 3 + 2] = rnd(-225, 12); }
const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dust, 3));
const dustMat = new THREE.PointsMaterial({ color: "#ffb36b", size: .08, transparent: true, opacity: .75, depthWrite: false, blending: THREE.AdditiveBlending });
scene.add(new THREE.Points(dg, dustMat));

/* ---------- biwa shifts: the castle rearranges itself ---------- */
const SHIFTS = [.18, .42, .66].map((at) => ({ at, armed: true }));
let lastShift = 0, shiftKick = 0;
const shift = (dir) => {
  window.SFX && window.SFX.play("biwa");
  const g = window.gsap;
  const z = rooms.rotation.z + dir * Math.PI / 2, y = rooms.rotation.y + dir * .6;
  if (g) g.to(rooms.rotation, { z, y, duration: .55, ease: "expo.out" }); else rooms.rotation.set(rooms.rotation.x, y, z);
  instanced.forEach((inst) => { for (let i = 0; i < inst.count; i++) if (Math.random() < .3) placeRoom(inst, i, inst.userData.scaled); inst.instanceMatrix.needsUpdate = true; });
  shiftKick = 1;
  window.dispatchEvent(new CustomEvent("castle-shift"));
};

/* ---------- loop ---------- */
const resize = () => {
  const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
  renderer.setSize(w, h, false); composer.setSize(w, h);
  bloom.resolution.set(w / 2, h / 2);
  camera.aspect = w / h; camera.updateProjectionMatrix();
};
resize(); addEventListener("resize", resize);

const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });
let pendingMoon = -1, pendingAt = 0;
let visible = false, smooth = 0, moon = -1, ft = 1 / 60, frames = 0;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; state.visible = visible; }, { rootMargin: "0px" }).observe(host);

const clock = new THREE.Clock();
const UP = new THREE.Vector3(0, 1, 0), UP_SHAFT = new THREE.Vector3(0, 0, -1), Z = new THREE.Vector3(0, 0, 1);
const fwd = new THREE.Vector3(), up = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), m4 = new THREE.Matrix4();
const qRoll = new THREE.Quaternion(), qLook = new THREE.Quaternion();
const smoothstep = THREE.MathUtils.smoothstep;

const frame = () => {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), .05);
  if (!visible) return;
  const t = clock.elapsedTime, lv = level();
  smooth += (state.progress - smooth) * (reduced ? 1 : 1 - Math.exp(-dt * 6));
  // adaptive resolution: keep the flythrough fluid on any GPU
  ft = ft * .92 + dt * .08; frames++;
  if (frames > 40) {
    if (ft > .021 && dpr > .6) { dpr = Math.max(.6, dpr * .85); renderer.setPixelRatio(dpr); resize(); frames = 0; }
    else if (ft < .0135 && dpr < DPR_MAX) { dpr = Math.min(DPR_MAX, dpr * 1.08); renderer.setPixelRatio(dpr); resize(); frames = 0; }
  }
  const p = smooth;

  // biwa shifts when crossing thresholds (either direction)
  // each shift fires once going forward; it re-arms only after you scroll well back before it
  SHIFTS.forEach((s) => {
    if (s.armed && p >= s.at && performance.now() - lastShift > 1500) { s.armed = false; lastShift = performance.now(); shift(1); }
    else if (!s.armed && p < s.at - .06) s.armed = true;
  });
  shiftKick *= .92;

  // ride the curve
  const u = Math.min(.999, smoothstep(p, 0, .93));
  const pos = path.getPointAt(u);
  const ahead = path.getPointAt(Math.min(u + .015, 1));
  fwd.subVectors(ahead, pos).normalize();
  const vert = smoothstep(Math.abs(fwd.y), .5, .95);
  up.copy(UP).lerp(UP_SHAFT, vert).normalize();
  mouse.sx += (mouse.x - mouse.sx) * .05; mouse.sy += (mouse.y - mouse.sy) * .05;
  camera.position.copy(pos);
  camera.position.x += Math.sin(p * 11) * .5 + mouse.sx * 1.4;
  camera.position.y += (Math.sin(p * 15) * .2 - mouse.sy * .8) * (1 - vert);
  tmp.copy(camera.position).add(fwd);
  m4.lookAt(camera.position, tmp, up); qLook.setFromRotationMatrix(m4);
  const roll = Math.sin(p * Math.PI * 2.4) * .2 + vert * Math.sin(t * .8) * .5 + shiftKick * .25;
  qRoll.setFromAxisAngle(Z, roll);
  camera.quaternion.copy(qLook).multiply(qRoll);
  camera.rotateY(-mouse.sx * .22); camera.rotateX(-mouse.sy * .12);
  const baseFov = camera.aspect < .8 ? 80 : 64;
  camera.fov += (baseFov + vert * 14 + shiftKick * 12 - camera.fov) * .1; camera.updateProjectionMatrix();
  camLight.position.copy(camera.position).addScaledVector(fwd, 3);

  // world motion
  rooms.rotation.x += dt * .012;
  M.lantern.emissiveIntensity = 2 + Math.sin(t * 9) * .25 + Math.sin(t * 23) * .15 + lv * 1.5;
  M.shoji.emissiveIntensity = M.shojiTall.emissiveIntensity = .42 + lv * .3 + shiftKick * .35;
  dustMat.size = .08 + lv * .12;

  // demons: billboards that face you, glow and lunge when close
  let near = -1, nd = 1e9;
  demons.forEach((d) => {
    const dist = camera.position.distanceTo(d.g.position);
    if (dist > 80) { d.g.visible = false; return; }
    d.g.visible = true;
    const o = smoothstep(dist, 1.4, 4) * (1 - smoothstep(dist, 36, 64));
    d.plate.material.opacity = o * (.8 + Math.sin(t * 4 + d.i) * .2);
    d.plate.quaternion.copy(camera.quaternion);
    const prox = 1 - smoothstep(dist, 3, 26);
    d.turn += ((d.side * -.6 * prox) - d.turn) * (1 - Math.exp(-dt * 3));
    if (d.flat) {
      d.g.quaternion.copy(camera.quaternion); d.g.rotateY(d.turn * .5);
      d.flat.material.opacity = o;
    }
    if (!d.lunged && dist < 9) { d.lunged = true; window.SFX && window.SFX.play("whoosh"); if (window.gsap) window.gsap.timeline().to(d, { lunge: 1, duration: .22, ease: "power3.out" }).to(d, { lunge: 0, duration: .9, ease: "power2.inOut" }); }
    if (dist > 45) d.lunged = false;
    tmp.copy(camera.position).sub(d.g.position).normalize();
    d.g.position.set(d.x0, d.y0 + Math.sin(t * 1.4 + d.i) * .08, d.g.position.z).addScaledVector(tmp, d.lunge * 1.6);
    d.aura.material.opacity = o * (.3 + lv * .5 + d.lunge * .8 + Math.sin(t * 3 + d.i) * .08);
    d.aura.scale.setScalar(1 + d.lunge * .4 + Math.sin(t * 2 + d.i) * .04);
    if (dist < 24 && dist < nd) { nd = dist; near = d.i; }
  });
  if (near !== pendingMoon) { pendingMoon = near; pendingAt = performance.now(); }
  if (pendingMoon !== moon && performance.now() - pendingAt > 350) { moon = pendingMoon; window.dispatchEvent(new CustomEvent("castle-moon", { detail: moon })); }
  if (near >= 0) { demonLight.position.copy(demons.find((d) => d.i === near).g.position).add(tmp2.set(0, 1, 2)); demonLight.intensity += (9 - demonLight.intensity) * .1; }
  else demonLight.intensity *= .9;

  // doors
  const open = smoothstep(p, .88, .985);
  doorL.position.x = -1.6 - open * 3.4; doorR.position.x = 1.6 + open * 3.4;
  scene.fog.density = .026 - open * .012;

  bloom.strength = .55 + lv * .6 + shiftKick * .8 + open * .5;
  renderer.toneMappingExposure = 1 + shiftKick * .35;
  composer.render();
};
frame();

/* Innerve 11 — Infinity Castle (無限城) v2.
   A corridor → a vertical drop through a shoji shaft → a lower hall → the doors.
   main.js pins #castle and writes window.CASTLE.progress (0..1). This file renders,
   fires biwa "shifts" that rearrange the castle, and emits `castle-moon` events. */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const host = document.getElementById("castleGL");
const state = (window.CASTLE = window.CASTLE || { progress: 0 });
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = innerWidth < 700;
const level = () => (window.SFX && window.SFX.level ? window.SFX.level() : 0);

const renderer = new THREE.WebGLRenderer({ canvas: host, antialias: !mobile, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#0b0407");
scene.fog = new THREE.FogExp2("#12060b", .026);
const camera = new THREE.PerspectiveCamera(64, 1, .1, 500);

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
const M = {
  shoji: new THREE.MeshStandardMaterial({ map: shojiTex, emissive: new THREE.Color("#ff9d4a"), emissiveMap: shojiTex, emissiveIntensity: .45, roughness: .9, side: THREE.DoubleSide }),
  shojiTall: new THREE.MeshStandardMaterial({ map: shojiTall, emissive: new THREE.Color("#ff8a3a"), emissiveMap: shojiTall, emissiveIntensity: .45, roughness: .9, side: THREE.DoubleSide }),
  wood: new THREE.MeshStandardMaterial({ map: woodTex, roughness: .5, metalness: .1 }),
  beam: new THREE.MeshStandardMaterial({ color: "#1d0d08", roughness: .7 }),
  red: new THREE.MeshStandardMaterial({ color: "#8e0a1f", roughness: .55, emissive: new THREE.Color("#3a0008") }),
  tatami: new THREE.MeshStandardMaterial({ map: tatamiTex, roughness: .95 }),
  lantern: new THREE.MeshStandardMaterial({ color: "#ffcf8a", emissive: new THREE.Color("#ff7a1a"), emissiveIntensity: 2.4 })
};
scene.add(new THREE.HemisphereLight("#ff9a6a", "#1a0610", .5));
const camLight = new THREE.PointLight("#ffb070", 34, 28, 1.6); scene.add(camLight);
const demonLight = new THREE.PointLight("#ff1a3c", 0, 14, 1.4); scene.add(demonLight);

const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const lanterns = [];
const lantern = (x, y, z, parent) => {
  const l = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .62, 10), M.lantern.clone());
  l.position.set(x, y, z); parent.add(l); lanterns.push(l);
};

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

/* ---------- floating rooms in every orientation ---------- */
const rooms = new THREE.Group(); scene.add(rooms);
rooms.position.set(0, -40, -105);
const roomGeo = new THREE.BoxGeometry(1, 1, 1);
const rnd = (a, b) => a + Math.random() * (b - a);
const roomMats = [M.shoji, M.wood, M.tatami, M.beam, M.red];
const roomCount = mobile ? 110 : 220;
const placeRoom = (m) => {
  const ang = rnd(0, Math.PI * 2), r = rnd(12, 70);
  m.position.set(Math.cos(ang) * r, rnd(-80, 80), Math.sin(ang) * r * 1.8);
  m.rotation.set(rnd(-.6, .6) + (Math.random() < .25 ? Math.PI / 2 : 0), rnd(0, Math.PI), rnd(-.6, .6) + (Math.random() < .2 ? Math.PI : 0));
};
for (let i = 0; i < roomCount; i++) {
  const m = new THREE.Mesh(roomGeo, roomMats[i % 7 < 3 ? 0 : (i % 5)]);
  m.scale.set(rnd(2, 10), rnd(.4, 7), rnd(2, 12)); placeRoom(m);
  m.userData.spin = rnd(-.04, .04); rooms.add(m);
}
for (let s = 0; s < 22; s++) {
  const st = new THREE.Group();
  for (let k = 0; k < 10; k++) { const b = box(2.4, .3, .9, M.wood); b.position.set(0, k * .45, -k * .8); st.add(b); }
  placeRoom(st); st.userData.spin = rnd(-.05, .05); rooms.add(st);
}

/* ---------- camera path ---------- */
const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, .4, 9), new THREE.Vector3(0, .4, -40), new THREE.Vector3(0, .4, -88),
  new THREE.Vector3(0, -2, -99), new THREE.Vector3(0, -14, -104), new THREE.Vector3(0, -45, -104),
  new THREE.Vector3(0, -70, -104), new THREE.Vector3(0, -78.6, -110), new THREE.Vector3(0, -79.6, -124),
  new THREE.Vector3(0, -79.6, -170), new THREE.Vector3(0, -79.6, -203)
], false, "centripetal");

/* ---------- Upper Moons ---------- */
const loader = new THREE.TextureLoader();
const demons = [];
const base = "assets/img/chars/";
const demon = (i, file, rank, x, fy, z, h, onPlatform) => {
  const g = new THREE.Group(); g.position.set(x, fy + h / 2 + .2, z); scene.add(g);
  const d = { g, i, mesh: null, y0: g.position.y }; demons.push(d);
  loader.load(file, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const a = tex.image.width / tex.image.height;
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(.78, .78, .78), transparent: true, alphaTest: .02, fog: false, depthWrite: false, toneMapped: false, opacity: 0 });
    d.mesh = new THREE.Mesh(new THREE.PlaneGeometry(h * a, h), mat); g.add(d.mesh);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .81), new THREE.MeshBasicMaterial({ map: plateTex(rank), transparent: true, depthWrite: false, toneMapped: false, fog: false, opacity: 0 }));
    plate.position.y = h / 2 + .7; g.add(plate); d.plate = plate;
  });
  if (onPlatform) { const p = box(3.2, .35, 3.2, M.red); p.position.set(x, fy, z); scene.add(p); }
};
demon(0, base + "daki.webp",      "上弦の陸", -2.1, FLOOR_A, -26, 4.4);
demon(1, base + "gyokko.webp",    "上弦の伍",  2.1, FLOOR_A, -52, 4.0);
demon(2, base + "hantengu.webp",  "上弦の肆", -2.0, FLOOR_A, -78, 3.4);
demon(3, base + "akaza.webp",     "上弦の参",  2.3, -46,     SHAFT_Z, 3.6, true);
demon(4, base + "doma.webp",      "上弦の弐", -2.2, FLOOR_B, -136, 4.4);
demon(5, base + "kokushibo.webp", "上弦の壱",  2.1, FLOOR_B, -160, 4.6);
demon(6, base + "nakime.webp",    "琵琶",     -2.3, FLOOR_B, -190, 4.4);

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
const SHIFTS = [.14, .3, .5, .7, .84];
let lastP = 0, shiftKick = 0;
const shift = (dir) => {
  window.SFX && window.SFX.play("biwa");
  const g = window.gsap;
  const z = rooms.rotation.z + dir * Math.PI / 2, y = rooms.rotation.y + dir * .6;
  if (g) g.to(rooms.rotation, { z, y, duration: .55, ease: "expo.out" }); else rooms.rotation.set(rooms.rotation.x, y, z);
  rooms.children.forEach((r) => { if (Math.random() < .3) placeRoom(r); });
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
let visible = false, smooth = 0, moon = -1;
new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" }).observe(host);

const clock = new THREE.Clock();
const UP = new THREE.Vector3(0, 1, 0), UP_SHAFT = new THREE.Vector3(0, 0, -1), Z = new THREE.Vector3(0, 0, 1);
const fwd = new THREE.Vector3(), up = new THREE.Vector3(), tmp = new THREE.Vector3(), m4 = new THREE.Matrix4();
const qRoll = new THREE.Quaternion(), qLook = new THREE.Quaternion();
const smoothstep = THREE.MathUtils.smoothstep;

const frame = () => {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), .05);
  if (!visible) return;
  const t = clock.elapsedTime, lv = level();
  smooth += (state.progress - smooth) * (reduced ? 1 : .07);
  const p = smooth;

  // biwa shifts when crossing thresholds (either direction)
  SHIFTS.forEach((s) => { if ((lastP < s && p >= s) || (lastP > s && p <= s)) shift(p > lastP ? 1 : -1); });
  lastP = p;
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
  rooms.rotation.x += dt * .01;
  rooms.children.forEach((r) => { r.rotation.x += r.userData.spin * dt * 6; });
  lanterns.forEach((l, i) => { l.material.emissiveIntensity = 2 + Math.sin(t * 9 + i * 1.7) * .25 + Math.sin(t * 23 + i) * .15 + lv * 1.5; });
  M.shoji.emissiveIntensity = M.shojiTall.emissiveIntensity = .42 + lv * .3 + shiftKick * .35;
  dustMat.size = .08 + lv * .12;

  // demons: billboard, fade in, plates, nearest -> caption + red light
  let near = -1, nd = 1e9;
  demons.forEach((d) => {
    if (!d.mesh) return;
    d.g.quaternion.copy(camera.quaternion);
    const dist = camera.position.distanceTo(d.g.position);
    const o = smoothstep(dist, 1.6, 4.5) * (1 - smoothstep(dist, 36, 64));
    d.mesh.material.opacity = o; d.plate.material.opacity = o * (.8 + Math.sin(t * 4 + d.i) * .2);
    d.g.position.y = d.y0 + Math.sin(t * 1.4 + d.i) * .12;
    if (dist < 24 && dist < nd) { nd = dist; near = d.i; }
  });
  if (near !== moon) { moon = near; window.dispatchEvent(new CustomEvent("castle-moon", { detail: moon })); }
  if (near >= 0) { demonLight.position.copy(demons.find((d) => d.i === near).g.position).add(tmp.set(0, 1, 2)); demonLight.intensity += (30 - demonLight.intensity) * .1; }
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

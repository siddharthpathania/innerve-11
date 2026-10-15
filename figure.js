/* Innerve 11 — page characters as real 3D models (GLB generated from the official art).
   Every <div class="fig" data-model="…"> shows its flat art until assets/models/<model>.glb is listed
   in assets/models/models.json; then a WebGL canvas takes over. GSAP keeps animating the wrapper. */
import * as THREE from "three";
import { loadModel, animateModel } from "./models.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const figs = (window.FIGS = []);
const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
const level = () => (window.SFX && window.SFX.level ? window.SFX.level() : 0);
const OVER = .12;                                         // canvas overscan so turning never clips

const setup = async (wrap) => {
  const model = await loadModel(wrap.dataset.model);
  if (!model) return;                                     // no model yet: keep the official art
  const canvas = document.createElement("canvas");
  canvas.className = "fig__gl"; canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { left: `-${OVER * 100}%`, top: `-${OVER * 100}%`, width: `${100 + OVER * 200}%`, height: `${100 + OVER * 200}%` });
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { return; }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = +(wrap.dataset.exposure || 1.15);
  renderer.setClearColor(0x000000, 0);
  wrap.appendChild(canvas); wrap.classList.add("is-3d");

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight("#ffffff", "#3a2a30", 2.2));
  const key = new THREE.DirectionalLight("#ffffff", 1.6); key.position.set(2, 3, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(wrap.dataset.rim || "#ff1a3c", 2.2); rim.position.set(-3, 2, -4); scene.add(rim);
  const stage = new THREE.Group(); stage.add(model.root); scene.add(stage);

  const camera = new THREE.PerspectiveCamera(24, 1, .01, 50);
  const f = { wrap, canvas, renderer, scene, camera, model, stage, key, visible: false, yaw: 0, spin: wrap.hasAttribute("data-3d-spin"), t0: Math.random() * 10 };
  const frame = () => {
    const tan = Math.tan(THREE.MathUtils.degToRad(12)), s = model.size;
    const dist = Math.max(s.y / 2 / tan, s.x / 2 / (tan * camera.aspect)) * (1 + OVER * 2) * 1.04;
    camera.position.set(0, s.y / 2, dist); camera.lookAt(0, s.y / 2, 0);
  };
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix(); frame();
  };
  resize(); new ResizeObserver(resize).observe(wrap);
  new IntersectionObserver(([e]) => (f.visible = e.isIntersecting), { rootMargin: "120px" }).observe(wrap);
  figs.push(f);
};
document.querySelectorAll(".fig[data-model]").forEach(setup);

const clock = new THREE.Clock();
const loop = () => {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, lv = level();
  for (const f of figs) {
    if (!f.visible) continue;
    const r = f.wrap.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    const mx = (mouse.x - (r.left + r.width / 2)) / innerWidth, my = (mouse.y - (r.top + r.height * .35)) / innerHeight;
    let ty = mx * .8 + Math.sin(t * .4 + f.t0) * .15;
    if (f.spin) ty += (r.top + r.height / 2) / innerHeight * 4.5 - 1.5;    // tumbling as he falls
    if (reduced) ty = 0;
    f.yaw += (ty - f.yaw) * (1 - Math.exp(-dt * 4));
    f.stage.rotation.set(reduced ? 0 : my * .25, f.yaw, 0);
    animateModel(f.model, reduced ? 0 : t + f.t0, lv);
    f.key.position.set(2 + mx * 6, 3 - my * 4, 5);
    f.renderer.render(f.scene, f.camera);
  }
};
loop();

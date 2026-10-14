/* Innerve 11 — page characters as living 2.5D figures.
   Every <div class="fig" data-3d> wraps an <img>; we add a WebGL canvas over it and hide the img.
   GSAP keeps animating the wrapper, so all the scroll choreography still applies. */
import * as THREE from "three";
import { figureMesh } from "./figure3d.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const figs = (window.FIGS = []);
const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
const level = () => (window.SFX && window.SFX.level ? window.SFX.level() : 0);

const setup = (wrap) => {
  // use a detached copy: a laid-out <img> reports its CSS size as width/height, which breaks the GPU upload
  const img = new Image();
  img.src = wrap.querySelector("img").currentSrc || wrap.querySelector("img").src;
  const go = () => {
    const canvas = document.createElement("canvas");
    canvas.className = "fig__gl"; canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true }); }
    catch (e) { return; }                                    // no WebGL: keep the flat image
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(canvas); wrap.classList.add("is-3d");

    const map = new THREE.Texture(img); map.colorSpace = THREE.SRGBColorSpace; map.needsUpdate = true;
    map.anisotropy = 4;
    const mesh = figureMesh(img, map, {
      amount: +wrap.dataset.depth || .14, premultiplied: true, rim: wrap.dataset.rim || "#ff1a3c", segments: 160
    });
    const scene = new THREE.Scene(); scene.add(mesh);
    const camera = new THREE.PerspectiveCamera(18, 1, .1, 50);
    const fit = 1 / .9;                                       // small margin so turning never clips
    camera.position.z = (.5 / Math.tan(THREE.MathUtils.degToRad(9))) * fit;

    const f = { wrap, renderer, scene, camera, mesh, visible: false, yaw: 0, pitch: 0, spin: wrap.hasAttribute("data-3d-spin") };
    const resize = () => {
      const w = wrap.offsetWidth, h = wrap.offsetHeight; if (!w || !h) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize(); new ResizeObserver(resize).observe(wrap);
    new IntersectionObserver(([e]) => (f.visible = e.isIntersecting), { rootMargin: "100px" }).observe(wrap);
    figs.push(f);
  };
  // the art is already decoded for the flat version; reuse it
  img.decode().then(go, () => {});
};

document.querySelectorAll(".fig[data-3d]").forEach(setup);

const clock = new THREE.Clock();
const loop = () => {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, lv = level();
  for (const f of figs) {
    if (!f.visible) continue;
    const r = f.wrap.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    // turn toward the cursor, with an idle sway
    let ty = THREE.MathUtils.clamp((mouse.x - cx) / innerWidth, -.6, .6) * .7 + Math.sin(t * .45) * .08;
    let tp = THREE.MathUtils.clamp((mouse.y - cy) / innerHeight, -.6, .6) * .35 + Math.sin(t * .6) * .03;
    if (f.spin) ty += (cy / innerHeight - .5) * 2.2;           // tumbling through the frame
    if (reduced) { ty = 0; tp = 0; }
    const k = 1 - Math.exp(-dt * 5);
    f.yaw += (ty - f.yaw) * k; f.pitch += (tp - f.pitch) * k;
    f.mesh.rotation.set(f.pitch, f.yaw, 0);
    const u = f.mesh.material.uniforms;
    u.uTime.value = reduced ? 0 : t;
    u.uPulse.value += (lv - u.uPulse.value) * .3;
    u.uLight.value.set((mouse.x / innerWidth - .5) * 1.6, -(mouse.y / innerHeight - .5) * 1.2, 1);
    f.renderer.render(f.scene, f.camera);
  }
};
loop();

/* Innerve 11 — global WebGL particles (ash / embers / wisteria petals) + nichirin cursor trail */
import * as THREE from "three";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

/* ================= particles ================= */
if (!reduced) {
  const canvas = document.getElementById("fx");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // a real sakura/wisteria petal: notched tip, pale-to-deep gradient, centre vein
  const petalCanvas = document.createElement("canvas"); petalCanvas.width = petalCanvas.height = 128;
  {
    const g = petalCanvas.getContext("2d");
    g.translate(64, 64);
    const path = new Path2D("M0 56 C-30 40 -40 6 -30 -22 C-22 -44 -10 -54 -4 -56 L0 -44 L4 -56 C10 -54 22 -44 30 -22 C40 6 30 40 0 56 Z");
    const gr = g.createLinearGradient(0, 56, 0, -56);
    gr.addColorStop(0, "#c2185b"); gr.addColorStop(.18, "#f48fb1"); gr.addColorStop(.6, "#ffd1e3"); gr.addColorStop(1, "#fff4f8");
    g.fillStyle = gr; g.fill(path);
    g.globalCompositeOperation = "source-atop";
    const sh = g.createRadialGradient(-12, -6, 4, 0, 0, 70); sh.addColorStop(0, "rgba(255,255,255,.45)"); sh.addColorStop(1, "rgba(120,0,40,.25)");
    g.fillStyle = sh; g.fillRect(-64, -64, 128, 128);
    g.strokeStyle = "rgba(170,20,80,.35)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 52); g.quadraticCurveTo(-2, 0, 0, -40); g.stroke();
    g.lineWidth = 1; g.beginPath(); g.moveTo(0, 30); g.quadraticCurveTo(-14, 6, -16, -18); g.moveTo(0, 30); g.quadraticCurveTo(14, 6, 16, -18); g.stroke();
  }
  const petalTex = new THREE.CanvasTexture(petalCanvas);

  const N = innerWidth < 700 ? 260 : 620;
  const seeds = new Float32Array(N * 4);
  for (let i = 0; i < N * 4; i++) seeds[i] = Math.random();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute("seed", new THREE.BufferAttribute(seeds, 4));

  const uniforms = {
    uTime: { value: 0 }, uAspect: { value: innerWidth / innerHeight },
    uDir: { value: 1 }, uSpeed: { value: .05 }, uSize: { value: 3 }, uPetal: { value: 0 },
    uColA: { value: new THREE.Color("#efe8dc") }, uColB: { value: new THREE.Color("#9b8f9a") },
    uAlpha: { value: .45 }, uMouse: { value: new THREE.Vector2(9, 9) }, uVel: { value: 0 },
    uPR: { value: renderer.getPixelRatio() }, uPulse: { value: 0 }, uPetalTex: { value: petalTex }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: /* glsl */`
      attribute vec4 seed;
      uniform float uTime, uAspect, uDir, uSpeed, uSize, uVel, uPR, uPetal, uPulse;
      uniform vec2 uMouse;
      varying float vMix; varying float vRot; varying float vFade; varying float vFlip;
      void main() {
        float sp = uSpeed * (0.45 + seed.z);
        float y = fract(seed.y + uDir * (uTime * sp + uVel * 0.15 * seed.w)) * 2.4 - 1.2;
        float x = (seed.x * 2.0 - 1.0) * 1.1 + sin(uTime * (0.3 + seed.w) + seed.z * 6.28) * (0.04 + 0.08 * uPetal);
        vec2 p = vec2(x, y);
        vec2 m = uMouse; vec2 d = vec2((p.x - m.x) * uAspect, p.y - m.y);
        float dist = length(d);
        p += normalize(d + 1e-4) * smoothstep(0.28, 0.0, dist) * 0.12 / vec2(uAspect, 1.0);
        gl_Position = vec4(p, 0.0, 1.0);
        gl_PointSize = uSize * (0.5 + seed.w * 1.6) * uPR * (1.0 + uPetal * 1.6) * (1.0 + uPulse * (0.6 + seed.z));
        vMix = seed.z; vRot = uTime * (seed.x - 0.5) * 3.0 + seed.y * 6.28;
        vFade = smoothstep(1.2, 0.85, abs(y));
        vFlip = cos(uTime * (1.2 + seed.w * 2.5) + seed.x * 6.28);   // petals tumble
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColA, uColB; uniform float uAlpha, uPetal; uniform sampler2D uPetalTex;
      varying float vMix; varying float vRot; varying float vFade; varying float vFlip;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float c = cos(vRot), s = sin(vRot);
        uv = mat2(c, -s, s, c) * uv;
        // soft ember / ash disc
        float d = length(uv);
        float disc = smoothstep(0.5, 0.0, d); disc *= disc;
        vec4 ember = vec4(mix(uColA, uColB, vMix), disc);
        // petal: sample the drawn petal, squashed by the tumble so it flips in 3D
        float flip = max(abs(vFlip), 0.12);
        vec2 pu = vec2(uv.x / flip, uv.y) + 0.5;
        vec4 pt = texture2D(uPetalTex, pu);
        pt.a *= step(0.0, pu.x) * step(pu.x, 1.0);
        vec3 tint = mix(vec3(1.0), mix(uColA, uColB, vMix) * 1.25, 0.45) * (0.75 + 0.25 * flip);   // back side darker
        vec4 petal = vec4(pt.rgb * tint, pt.a);
        vec4 col = mix(ember, petal, uPetal);
        gl_FragColor = vec4(col.rgb, col.a * uAlpha * vFade);
      }`
  });
  scene.add(new THREE.Points(geo, mat));

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    uniforms.uAspect.value = innerWidth / innerHeight;
  };
  resize(); addEventListener("resize", resize);
  addEventListener("pointermove", (e) => {
    uniforms.uMouse.value.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1));
  });

  // palettes per section tone
  const MODES = {
    dark:  { dir: 1,  speed: .035, size: 3.2, petal: 0, a: "#efe8dc", b: "#7d6f7b", alpha: .4 },
    red:   { dir: 1,  speed: .11,  size: 4.2, petal: 0, a: "#ffd23a", b: "#ff6a00", alpha: .85 },
    light: { dir: -1, speed: .035, size: 5.2, petal: 1, a: "#c9b2f0", b: "#ffc1d9", alpha: .9 }
  };
  let target = MODES.dark;
  const setMode = (tone) => {
    const m = MODES[tone] || MODES.dark; if (m === target) return; target = m;
    const g = window.gsap; const tw = (o, v) => g ? g.to(o, { value: v, duration: 1.2, ease: "power2.out" }) : (o.value = v);
    tw(uniforms.uSpeed, m.speed); tw(uniforms.uSize, m.size); tw(uniforms.uPetal, m.petal); tw(uniforms.uAlpha, m.alpha);
    uniforms.uDir.value = m.dir;
    if (g) { g.to(uniforms.uColA.value, { ...hex(m.a), duration: 1.2 }); g.to(uniforms.uColB.value, { ...hex(m.b), duration: 1.2 }); }
  };
  const hex = (h) => { const c = new THREE.Color(h); return { r: c.r, g: c.g, b: c.b }; };
  const sync = () => setMode(document.documentElement.classList.contains("hinokami") ? "red" : document.body.dataset.tone);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["data-tone"] });
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  let lastY = scrollY, vel = 0, t0 = performance.now(), hidden = false;
  const loop = (now) => {
    const dt = Math.min(.05, (now - t0) / 1000); t0 = now;
    vel += ((scrollY - lastY) * .02 - vel) * .1; lastY = scrollY;
    uniforms.uVel.value += vel * dt * 4;
    const lv = window.SFX && window.SFX.level ? window.SFX.level() : 0;
    uniforms.uPulse.value += (lv * 1.6 - uniforms.uPulse.value) * .25;
    uniforms.uTime.value += dt * (1 + lv * 2.5);
    if (window.CASTLE && window.CASTLE.visible) { if (!hidden) { renderer.clear(); hidden = true; } }
    else { hidden = false; renderer.render(scene, camera); }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ================= nichirin blade trail (desktop) ================= */
if (finePointer && !reduced) {
  const cv = document.getElementById("trail");
  const c2 = cv.getContext("2d");
  let W, H, dpr = Math.min(devicePixelRatio, 2);
  const size = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; c2.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener("resize", size);
  const pts = [];
  addEventListener("pointermove", (e) => pts.push({ x: e.clientX, y: e.clientY, t: performance.now() }));
  const PAL = { dark: ["rgba(64,170,255,", "rgba(220,245,255,"], light: ["rgba(64,120,255,", "rgba(30,60,140,"], red: ["rgba(255,90,0,", "rgba(255,220,80,"] };
  const draw = () => {
    const now = performance.now();
    while (pts.length && now - pts[0].t > 220) pts.shift();
    c2.clearRect(0, 0, W, H);
    if (pts.length > 2) {
      const pal = document.documentElement.classList.contains("hinokami") ? PAL.red : (PAL[document.body.dataset.tone] || PAL.dark);
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const k = i / pts.length, life = 1 - (now - b.t) / 220;
        c2.lineCap = "round";
        c2.strokeStyle = pal[0] + (k * life * .55).toFixed(3) + ")";
        c2.lineWidth = 1 + k * 9;
        c2.beginPath(); c2.moveTo(a.x, a.y); c2.lineTo(b.x, b.y); c2.stroke();
        c2.strokeStyle = pal[1] + (k * life * .9).toFixed(3) + ")";
        c2.lineWidth = .6 + k * 2.4;
        c2.beginPath(); c2.moveTo(a.x, a.y); c2.lineTo(b.x, b.y); c2.stroke();
      }
    }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

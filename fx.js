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
    uPR: { value: renderer.getPixelRatio() }, uPulse: { value: 0 }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: /* glsl */`
      attribute vec4 seed;
      uniform float uTime, uAspect, uDir, uSpeed, uSize, uVel, uPR, uPetal, uPulse;
      uniform vec2 uMouse;
      varying float vMix; varying float vRot; varying float vFade;
      void main() {
        float sp = uSpeed * (0.45 + seed.z);
        float y = fract(seed.y + uDir * (uTime * sp + uVel * 0.15 * seed.w)) * 2.4 - 1.2;
        float x = (seed.x * 2.0 - 1.0) * 1.1 + sin(uTime * (0.3 + seed.w) + seed.z * 6.28) * (0.04 + 0.08 * uPetal);
        vec2 p = vec2(x, y);
        vec2 m = uMouse; vec2 d = vec2((p.x - m.x) * uAspect, p.y - m.y);
        float dist = length(d);
        p += normalize(d + 1e-4) * smoothstep(0.28, 0.0, dist) * 0.12 / vec2(uAspect, 1.0);
        gl_Position = vec4(p, 0.0, 1.0);
        gl_PointSize = uSize * (0.5 + seed.w * 1.6) * uPR * (1.0 + uPetal * 1.4) * (1.0 + uPulse * (0.6 + seed.z));
        vMix = seed.z; vRot = uTime * (seed.x - 0.5) * 3.0 + seed.y * 6.28;
        vFade = smoothstep(1.2, 0.85, abs(y));
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColA, uColB; uniform float uAlpha, uPetal;
      varying float vMix; varying float vRot; varying float vFade;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float c = cos(vRot), s = sin(vRot);
        uv = mat2(c, -s, s, c) * uv;
        uv.x *= mix(1.0, 2.1, uPetal);              // petals are elongated
        float d = length(uv);
        float a = smoothstep(0.5, 0.0, d);
        a = mix(a * a, smoothstep(0.5, 0.42, d), uPetal);
        gl_FragColor = vec4(mix(uColA, uColB, vMix), a * uAlpha * vFade);
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
    light: { dir: -1, speed: .04, size: 3.6, petal: 1, a: "#b39ae6", b: "#f2a9c4", alpha: .42 }
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

  let lastY = scrollY, vel = 0, t0 = performance.now();
  const loop = (now) => {
    const dt = Math.min(.05, (now - t0) / 1000); t0 = now;
    vel += ((scrollY - lastY) * .02 - vel) * .1; lastY = scrollY;
    uniforms.uVel.value += vel * dt * 4;
    const lv = window.SFX && window.SFX.level ? window.SFX.level() : 0;
    uniforms.uPulse.value += (lv * 1.6 - uniforms.uPulse.value) * .25;
    uniforms.uTime.value += dt * (1 + lv * 2.5);
    renderer.render(scene, camera);
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

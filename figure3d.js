/* Innerve 11 — turn a flat cutout illustration into a living 2.5D figure.
   A depth map is "inflated" from the art's alpha silhouette (plus a little luminance relief),
   a dense plane is displaced by it, and a shader lights it, adds a rim, breathes and sways cloth/hair. */
import * as THREE from "three";

/* ---------- depth map from silhouette ---------- */
const boxBlur = (src, w, h, r) => {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h), win = r * 2 + 1;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / win;
      acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / win;
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
};

export function depthTexture(image, H = 200) {
  const iw = image.naturalWidth || image.width, ih = image.naturalHeight || image.height;
  const W = Math.max(8, Math.round(H * iw / ih));
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(image, 0, 0, W, H);
  const px = g.getImageData(0, 0, W, H), d = px.data;
  const mask = new Float32Array(W * H), lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    mask[i] = d[i * 4 + 3] / 255 > .25 ? 1 : 0;
    lum[i] = (d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11) / 255;
  }
  const r = Math.max(2, Math.round(H / 18));
  let m = boxBlur(mask, W, H, r); m = boxBlur(m, W, H, r); m = boxBlur(m, W, H, Math.round(r * .6));
  const detail = boxBlur(lum, W, H, 1);
  for (let i = 0; i < W * H; i++) {
    // 0 exactly at the silhouette (blurred mask = .5) rising to 1 in the core: no z-cliff at the outline
    const dome = Math.pow(Math.max(0, Math.min(1, m[i] * 2 - 1)), .55);
    const v = Math.min(1, dome * (.92 + (detail[i] - .5) * .16));
    const b = Math.round(Math.max(0, v) * 255);
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
  }
  g.putImageData(px, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace; t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
  t.userData = { texel: new THREE.Vector2(1 / W, 1 / H) };
  return t;
}

/* ---------- material ---------- */
export function figureMaterial(map, depth, { amount = .13, premultiplied = false, rim = "#ff1a3c", fog = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, premultipliedAlpha: premultiplied,
    defines: { PREMUL: premultiplied ? 1 : 0 },
    uniforms: {
      uMap: { value: map }, uDepth: { value: depth }, uTexel: { value: depth.userData.texel },
      uAmt: { value: amount }, uPlane: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 }, uFlutter: { value: 1 }, uBreath: { value: .008 },
      uLight: { value: new THREE.Vector3(.4, .5, 1) }, uRim: { value: new THREE.Color(rim) }, uRimAmt: { value: .55 },
      uOpacity: { value: 1 }, uBright: { value: 1 }, uPulse: { value: 0 }
    },
    vertexShader: /* glsl */`
      uniform sampler2D uDepth; uniform vec2 uTexel, uPlane; uniform float uAmt, uTime, uFlutter, uBreath, uPulse;
      varying vec2 vUv; varying vec3 vN;
      float D(vec2 u) { return texture2D(uDepth, u).r; }
      void main() {
        vUv = uv;
        float d = D(uv);
        vec3 p = position;
        float edge = abs(uv.x - .5) * 2.0;
        float free = (1.0 - d) * (.35 + edge);                     // thin parts (sleeves, hair, haori) move most
        p.x += sin(uTime * 2.1 + uv.y * 7.0 + uv.x * 3.0) * .014 * uFlutter * free;
        p.y += sin(uTime * 1.7 + uv.x * 5.0) * .006 * uFlutter * free;
        p.y += (p.y + uPlane.y * .5) * sin(uTime * 1.6) * uBreath * smoothstep(.25, .8, uv.y);   // breathing
        p.z += d * uAmt * (1.0 + uPulse * .35);
        float dx = (D(uv + vec2(uTexel.x, 0.)) - D(uv - vec2(uTexel.x, 0.))) * uAmt / (2.0 * uTexel.x * uPlane.x);
        float dy = (D(uv + vec2(0., uTexel.y)) - D(uv - vec2(0., uTexel.y))) * uAmt / (2.0 * uTexel.y * uPlane.y);
        vN = normalize(normalMatrix * normalize(vec3(-dx, -dy, 1.0)));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; uniform vec3 uLight, uRim; uniform float uRimAmt, uOpacity, uBright, uPulse;
      varying vec2 vUv; varying vec3 vN;
      void main() {
        vec4 c = texture2D(uMap, vUv);
        if (c.a < .04) discard;
        vec3 n = normalize(vN);
        if (!gl_FrontFacing) n = -n;
        float diff = max(dot(n, normalize(uLight)), 0.0);
        float rim = pow(1.0 - clamp(abs(n.z), 0.0, 1.0), 1.6);
        vec3 col = c.rgb * (.66 + .5 * diff) * uBright + uRim * rim * (uRimAmt + uPulse * .6);
        float a = c.a * uOpacity;
        #if PREMUL == 1
          gl_FragColor = vec4(col * a, a);
        #else
          gl_FragColor = vec4(col, a);
        #endif
        #include <colorspace_fragment>
      }`
  });
}

/* ---------- mesh ---------- */
export function figureMesh(image, map, opts = {}) {
  const aspect = (image.naturalWidth || image.width) / (image.naturalHeight || image.height);
  const h = opts.height || 1, w = h * aspect;
  const segY = opts.segments || 150, segX = Math.max(8, Math.round(segY * aspect));
  const geo = new THREE.PlaneGeometry(w, h, segX, segY);
  const depth = depthTexture(image);
  const mat = figureMaterial(map, depth, { ...opts, amount: (opts.amount || .13) * h });
  mat.uniforms.uPlane.value.set(w, h);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.aspect = aspect;
  return mesh;
}

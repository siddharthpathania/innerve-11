/* Innerve 11 — shared loader + "life" for the generated character models.
   Models are static meshes (image-to-3D output has no skeleton), so motion is added in the
   vertex shader: breathing, an upper-body sway that grows with height, and a cloth/hair ripple. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let manifest = null;
const getManifest = () => manifest ??= fetch("assets/models/models.json").then((r) => (r.ok ? r.json() : { available: [] })).catch(() => ({ available: [] }));
const loader = new GLTFLoader();

export async function hasModel(name) { return !!name && (await getManifest()).available.includes(name); }

/* returns { root, size, uniforms } with the model centred on x/z, feet at y=0 */
export async function loadModel(name) {
  if (!(await hasModel(name))) return null;
  const gltf = await loader.loadAsync(`assets/models/${name}.glb`);
  const inner = gltf.scene;
  const box = new THREE.Box3().setFromObject(inner), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  inner.position.set(-ctr.x, -box.min.y, -ctr.z);
  const root = new THREE.Group(); root.add(inner);
  const uniforms = { uTime: { value: 0 }, uLevel: { value: 0 }, uH: { value: size.y }, uMinY: { value: box.min.y } };
  inner.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      m.side = THREE.DoubleSide;
      if (m.map) m.map.anisotropy = 8;
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, uniforms);
        sh.vertexShader = "uniform float uTime, uLevel, uH, uMinY;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
          float hgt = clamp((transformed.y - uMinY) / uH, 0.0, 1.0);
          float bend = hgt * hgt;
          transformed.x += sin(uTime * 1.1) * .022 * uH * bend;                         // upper body sways
          transformed.z += sin(uTime * .8 + 1.3) * .014 * uH * bend;
          transformed.y += sin(uTime * 1.9) * .006 * uH * smoothstep(.45, .8, hgt);      // breathing
          transformed.x += sin(uTime * 3.1 + transformed.y * 9.0 / uH) * (.004 + uLevel * .01) * uH * (1.0 - hgt) * step(hgt, .45);  // cloth ripple
        `);
      };
      m.needsUpdate = true;
    });
  });
  return { root, size, uniforms };
}

export function animateModel(model, t, level = 0) {
  model.uniforms.uTime.value = t;
  model.uniforms.uLevel.value += (level - model.uniforms.uLevel.value) * .3;
  model.root.position.y = Math.sin(t * 1.3) * model.size.y * .008;
}

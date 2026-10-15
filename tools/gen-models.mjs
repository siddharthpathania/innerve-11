/* Generate textured 3D character models from the official art with TRELLIS.2 (free Hugging Face Space).
   Usage:  HF_TOKEN=hf_xxx node tools/gen-models.mjs [name ...]
   Writes assets/models/<name>.glb and lists it in assets/models/models.json (the site picks it up automatically).
   The token is read from the environment only — never commit it. */
import { Client } from "@gradio/client";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

import { fileURLToPath } from "url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORDER = ["muzan", "tanjiro", "nezuko", "zenitsu-strike", "tanjiro-leap", "akaza", "doma", "kokushibo", "daki", "nakime", "hantengu", "gyokko"];
const names = process.argv.slice(2).length ? process.argv.slice(2) : ORDER;
const token = process.env.HF_TOKEN;
const manifestPath = path.join(ROOT, "assets/models/models.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

for (const name of names) {
  const out = path.join(ROOT, `assets/models/${name}.glb`);
  if (fs.existsSync(out)) { console.log(`skip ${name} (exists)`); continue; }
  const png = path.join(ROOT, `tools/.cache/${name}.png`);
  fs.mkdirSync(path.dirname(png), { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(ROOT, `assets/img/chars/${name}.webp`), "-pix_fmt", "rgba", png]);
  const t0 = Date.now();
  try {
    const c = await Client.connect("microsoft/TRELLIS.2", token ? { hf_token: token } : {});
    try { await c.predict("/start_session", {}); } catch (e) {}
    const pre = await c.predict("/preprocess_image", { input: new Blob([fs.readFileSync(png)], { type: "image/png" }) });
    await c.predict("/image_to_3d", { image: pre.data[0], seed: 42, resolution: "1024" });
    const g = await c.predict("/extract_glb", { decimation_target: 150000, texture_size: 2048 });
    const f = g.data.find((d) => d && d.url && /\.glb/i.test(d.url + (d.orig_name || ""))) || g.data.find((d) => d && d.url);
    fs.writeFileSync(out, Buffer.from(await (await fetch(f.url, token ? { headers: { Authorization: `Bearer ${token}` } } : {})).arrayBuffer()));
    if (!manifest.available.includes(name)) manifest.available.push(name);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`ok   ${name}  ${Math.round((Date.now() - t0) / 1000)}s`);
  } catch (e) {
    console.log(`FAIL ${name}: ${e.title || ""} ${e.message || JSON.stringify(e).slice(0, 200)}`);
    if (/quota/i.test(e.title || e.message || "")) break;
  }
}

/* Innerve 11 — Breathing techniques. Click a track row to unleash its Hashira's first form:
   a full-screen cut-in (dark wash + kanji slam) with a style-specific particle storm. */
window.Forms = (() => {
  const cv = document.getElementById("forms");
  const g = cv.getContext("2d");
  const slam = document.getElementById("slam");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = Math.min(devicePixelRatio, 2), parts = [], style = null, t0 = 0, running = false;
  const size = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener("resize", size);
  const R = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const STYLES = {
    water:   { col: ["#3fb6ff", "#bfe9ff", "#ffffff", "#1d5fbf"], sfx: ["whoosh", "slash"], kanji: "水" },
    flame:   { col: ["#ffd23a", "#ff8a00", "#ff3b00", "#fff1b8"], sfx: ["flame"], kanji: "炎" },
    insect:  { col: ["#b9a3e3", "#6fc3c0", "#f2d0ff", "#ffffff"], sfx: ["koto", "whoosh"], kanji: "蟲" },
    mist:    { col: ["#cfe7e1", "#ffffff", "#9fc9c0"], sfx: ["whoosh"], kanji: "霞" },
    sound:   { col: ["#ffd23a", "#d6a640", "#ff4d6d", "#ffffff"], sfx: ["thunder", "taiko"], kanji: "音" },
    stone:   { col: ["#8a7f72", "#5b5148", "#c9bba7", "#2c2621"], sfx: ["taiko", "heartbeat"], kanji: "岩" },
    serpent: { col: ["#ffffff", "#6a4fa0", "#b9a3e3"], sfx: ["whoosh", "slash"], kanji: "蛇" },
    love:    { col: ["#f2a9c4", "#ff6fa8", "#8fd18a", "#ffffff"], sfx: ["koto", "whoosh"], kanji: "恋" },
    wind:    { col: ["#e9efe9", "#8fd18a", "#2f6b3c", "#ffffff"], sfx: ["whoosh", "slash"], kanji: "風" }
  };

  const spawn = (key) => {
    parts = [];
    const n = innerWidth < 700 ? .55 : 1;
    const S = STYLES[key];
    const add = (o) => parts.push(Object.assign({ life: 0, max: R(1.2, 2.2), col: pick(S.col) }, o));
    if (key === "water") for (let i = 0; i < 7; i++) add({ k: "ribbon", y: H * R(.25, .75), amp: R(30, 110), ph: R(0, 6), w: R(6, 26), sp: R(.9, 1.4), max: 2 });
    if (key === "water") for (let i = 0; i < 160 * n; i++) add({ k: "drop", x: R(0, W), y: H * R(.2, .8), vx: R(6, 14), vy: R(-4, 4), r: R(1, 4) });
    if (key === "flame") for (let i = 0; i < 420 * n; i++) { const a = R(0, 6.28); add({ k: "fire", x: W / 2 + Math.cos(a) * R(40, W * .45), y: H * .9, vx: R(-1, 1), vy: R(-9, -4), r: R(10, 40), swirl: R(-.05, .05) }); }
    if (key === "insect") for (let i = 0; i < 70 * n; i++) { const a = R(0, 6.28); add({ k: "fly", x: W / 2, y: H / 2, vx: Math.cos(a) * R(2, 7), vy: Math.sin(a) * R(2, 7), r: R(8, 20), ph: R(0, 6) }); }
    if (key === "mist") for (let i = 0; i < 40 * n; i++) add({ k: "blob", x: R(0, W), y: R(0, H), vx: R(-1.5, 1.5), vy: R(-.6, .6), r: R(60, 220) });
    if (key === "sound") for (let i = 0; i < 9; i++) add({ k: "ring", x: R(W * .15, W * .85), y: R(H * .2, H * .8), r: 0, vr: R(9, 16), delay: i * .12, max: 1.4 });
    if (key === "sound") for (let i = 0; i < 240 * n; i++) { const a = R(0, 6.28), s = R(4, 16); add({ k: "spark", x: W / 2, y: H / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: R(1, 3) }); }
    if (key === "stone") for (let i = 0; i < 80 * n; i++) add({ k: "rock", x: R(0, W), y: H + 40, vx: R(-3, 3), vy: R(-26, -14), r: R(8, 34), rot: R(0, 6), vrot: R(-.2, .2), sides: Math.floor(R(5, 8)) });
    if (key === "serpent") for (let i = 0; i < 6; i++) add({ k: "snake", y: H * R(.15, .85), amp: R(40, 120), ph: R(0, 6), w: R(10, 22), sp: R(1, 1.6), max: 2 });
    if (key === "love") for (let i = 0; i < 320 * n; i++) add({ k: "spiral", a: R(0, 6.28), rad: R(0, 30), va: R(.05, .12), vrad: R(4, 9), r: R(3, 9) });
    if (key === "wind") for (let i = 0; i < 200 * n; i++) add({ k: "streak", x: R(-W, 0), y: R(0, H), vx: R(30, 60), vy: R(-14, -4), len: R(60, 260), w: R(1, 4) });
    add({ k: "cut", max: .6, col: "#ffffff" });
  };

  const heart = (x, y, r) => { g.beginPath(); g.moveTo(x, y + r * .3); g.bezierCurveTo(x, y, x - r, y, x - r, y + r * .3); g.bezierCurveTo(x - r, y + r * .7, x, y + r, x, y + r * 1.2); g.bezierCurveTo(x, y + r, x + r, y + r * .7, x + r, y + r * .3); g.bezierCurveTo(x + r, y, x, y, x, y + r * .3); g.fill(); };

  const step = (now) => {
    const el = (now - t0) / 1000, dt = 1 / 60;
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = style === "stone" || style === "serpent" ? "source-over" : "lighter";
    let alive = 0;
    for (const p of parts) {
      p.life += dt; if (p.delay && el < p.delay) { alive++; continue; }
      const k = Math.max(0, 1 - p.life / p.max); if (k <= 0) continue; alive++;
      g.globalAlpha = Math.min(1, k * 1.4); g.fillStyle = g.strokeStyle = p.col;
      switch (p.k) {
        case "ribbon": case "snake": {
          const prog = Math.min(1, p.life * p.sp);
          g.lineWidth = p.w * k; g.lineCap = "round"; g.beginPath();
          for (let x = 0; x <= W * prog; x += 12) {
            const y = p.y + Math.sin(x * (p.k === "snake" ? .012 : .006) + p.ph + el * 4) * p.amp * (p.k === "snake" ? 1 : Math.sin(x / W * 3.14));
            x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
          }
          g.stroke();
          if (p.k === "snake") { g.setLineDash([18, 18]); g.strokeStyle = "#0b0a0c"; g.lineWidth = p.w * k * .5; g.stroke(); g.setLineDash([]); }
          break;
        }
        case "drop": p.x += p.vx; p.y += p.vy; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.28); g.fill(); break;
        case "fire": {
          p.vx += p.swirl * 6; p.x += p.vx; p.y += p.vy; p.r *= .985;
          const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          gr.addColorStop(0, p.col); gr.addColorStop(1, "rgba(255,40,0,0)"); g.fillStyle = gr;
          g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.28); g.fill(); break;
        }
        case "fly": {
          p.x += p.vx + Math.sin(el * 3 + p.ph) * 2; p.y += p.vy + Math.cos(el * 2 + p.ph) * 1.5;
          const flap = Math.abs(Math.sin(el * 18 + p.ph));
          g.save(); g.translate(p.x, p.y); g.rotate(Math.atan2(p.vy, p.vx) + 1.57);
          g.beginPath(); g.ellipse(-p.r * .5 * flap, 0, p.r * .55 * flap + 1, p.r * .8, -.4, 0, 6.28); g.fill();
          g.beginPath(); g.ellipse(p.r * .5 * flap, 0, p.r * .55 * flap + 1, p.r * .8, .4, 0, 6.28); g.fill();
          g.restore(); break;
        }
        case "blob": {
          p.x += p.vx; p.y += p.vy; p.r *= 1.006;
          const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          gr.addColorStop(0, "rgba(220,240,235,.35)"); gr.addColorStop(1, "rgba(220,240,235,0)"); g.fillStyle = gr;
          g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.28); g.fill(); break;
        }
        case "ring": p.r += p.vr; g.lineWidth = 6 * k; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.28); g.stroke(); break;
        case "spark": p.x += p.vx; p.y += p.vy; p.vx *= .97; p.vy *= .97; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.28); g.fill(); break;
        case "rock": {
          p.vy += .9; p.x += p.vx; p.y += p.vy; p.rot += p.vrot;
          g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.beginPath();
          for (let s = 0; s < p.sides; s++) { const a = s / p.sides * 6.28, rr = p.r * (.7 + (s % 2) * .3); s ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
          g.closePath(); g.fill(); g.restore(); break;
        }
        case "spiral": {
          p.a += p.va; p.rad += p.vrad;
          const x = W / 2 + Math.cos(p.a) * p.rad, y = H / 2 + Math.sin(p.a) * p.rad * .8;
          if (Math.random() < .3) heart(x, y, p.r); else { g.beginPath(); g.arc(x, y, p.r * .5, 0, 6.28); g.fill(); }
          break;
        }
        case "streak": p.x += p.vx; p.y += p.vy; g.lineWidth = p.w; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.len, p.y - p.len * p.vy / p.vx); g.stroke(); break;
        case "cut": {
          const prog = Math.min(1, p.life / .18);
          g.globalCompositeOperation = "source-over";
          g.lineWidth = 10 * k; g.lineCap = "round"; g.beginPath(); g.moveTo(-50, H * .78); g.lineTo(-50 + (W + 100) * prog, H * .22); g.stroke();
          g.globalCompositeOperation = style === "stone" || style === "serpent" ? "source-over" : "lighter";
          break;
        }
      }
    }
    g.globalAlpha = 1;
    if (alive && el < 3.2) requestAnimationFrame(step);
    else { g.clearRect(0, 0, W, H); running = false; }
  };

  const unleash = (track) => {
    if (reduced || !track || !STYLES[track.form]) return;
    const S = STYLES[track.form];
    style = track.form;
    S.sfx.forEach((s, i) => setTimeout(() => window.SFX && window.SFX.play(s), i * 140));
    slam.querySelector(".slam__k").textContent = S.kanji;
    slam.querySelector(".slam__jp").textContent = track.formJp;
    slam.querySelector(".slam__en").textContent = track.formEn;
    slam.querySelector(".slam__who").textContent = track.hashira;
    slam.style.setProperty("--slam", S.col[0]);
    const G = window.gsap;
    if (G) {
      G.killTweensOf([slam, ".slam__k", ".slam__line"]);
      G.timeline()
        .set(slam, { autoAlpha: 1 })
        .fromTo(".slam__wash", { opacity: 0 }, { opacity: 1, duration: .15 })
        .fromTo(".slam__k", { scale: 3.2, opacity: 0, rotation: -12 }, { scale: 1, opacity: 1, rotation: 0, duration: .35, ease: "expo.out" }, 0)
        .fromTo(".slam__line", { yPercent: 120 }, { yPercent: 0, stagger: .06, duration: .45, ease: "expo.out" }, .12)
        .to(slam, { x: 10, duration: .03, yoyo: true, repeat: 5 }, .1)
        .to(slam, { autoAlpha: 0, duration: .5, ease: "power2.in" }, 1.9);
    }
    window.Impact && setTimeout(() => Impact(track.form === "flame" || track.form === "love"), 60);
    spawn(track.form); t0 = performance.now();
    if (!running) { running = true; requestAnimationFrame(step); }
  };
  return { unleash };
})();

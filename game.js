/* Innerve 11 — 鬼斬り "Slay the Upper Moons". Swipe to slice demons in half; never cut Nezuko. */
(() => {
  const cv = document.getElementById("slayGL");
  if (!cv) return;
  const g = cv.getContext("2d");
  const $ = (s) => document.querySelector(s);
  const overlay = $("#slayOverlay"), msg = $("#slayMsg"), startBtn = $("#slayStart"), rankEl = $("#slayRank");
  const scoreEl = $("#slayScore"), timeEl = $("#slayTime"), bestEl = $("#slayBest");
  const SFX = () => window.SFX || { play() {} };
  const R = (a, b) => a + Math.random() * (b - a);
  let W = 0, H = 0, dpr = Math.min(devicePixelRatio, 2);

  const stain = document.createElement("canvas"), sg = stain.getContext("2d");
  const size = () => {
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = stain.width = W * dpr; cv.height = stain.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); sg.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size(); new ResizeObserver(size).observe(cv);

  const DEMONS = ["daki", "gyokko", "hantengu", "akaza", "doma", "kokushibo", "kaigaku", "nakime", "muzan"];
  const IMG = {};
  [...DEMONS, "nezuko-side"].forEach((n) => { const i = new Image(); i.src = `assets/img/chars/${n}.webp`; IMG[n] = i; });

  const RANKS = [[5, "癸", "Mizunoto"], [10, "壬", "Mizunoe"], [15, "辛", "Kanoto"], [20, "庚", "Kanoe"], [25, "己", "Tsuchinoto"],
    [30, "戊", "Tsuchinoe"], [35, "丁", "Hinoto"], [40, "丙", "Hinoe"], [45, "乙", "Kinoto"], [55, "甲", "Kinoe"], [1e9, "柱", "Hashira"]];
  const FORMS = ["壱ノ型!", "弐ノ型!", "参ノ型!", "肆ノ型!", "伍ノ型!", "拾ノ型!", "全集中!", "滅!"];
  let best = 0; try { best = +localStorage.getItem("innerve-slay-best") || 0; } catch (e) {}
  bestEl.textContent = best;

  let running = false, visible = true, timeLeft = 30, score = 0, combo = 0, lastHit = 0, spawnIn = 0, elapsed = 0;
  let objs = [], pieces = [], drops = [], pops = [], trail = [];
  let last = performance.now(), wasIdle = false;

  const spawn = () => {
    const n = 1 + (Math.random() < .35 + elapsed / 60 ? 1 : 0) + (Math.random() < elapsed / 90 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const nez = Math.random() < .12;
      const key = nez ? "nezuko-side" : DEMONS[Math.floor(Math.random() * DEMONS.length)];
      const img = IMG[key]; if (!img.complete || !img.naturalWidth) continue;
      const h = H * R(.26, .34), w = h * img.naturalWidth / img.naturalHeight;
      const x = W * R(.18, .82);
      objs.push({ key, img, nez, x, y: H + h * .6, w, h, vx: (W / 2 - x) * R(.25, .6) + R(-60, 60), vy: -H * R(1.6, 1.95), rot: R(-.4, .4), vr: R(-2.4, 2.4), r: Math.min(w, h) * .42 });
    }
    SFX().play("whoosh");
  };

  const segCircle = (ax, ay, bx, by, cx, cy, r) => {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((cx - ax) * dx + (cy - ay) * dy) / l2));
    const px = ax + dx * t - cx, py = ay + dy * t - cy;
    return px * px + py * py < r * r;
  };

  const cut = (o, ax, ay, bx, by) => {
    const a = Math.atan2(by - ay, bx - ax), nx = -Math.sin(a), ny = Math.cos(a);
    const la = a - o.rot;
    [1, -1].forEach((s) => pieces.push({ img: o.img, w: o.w, h: o.h, x: o.x + nx * s * 6, y: o.y + ny * s * 6, vx: o.vx + nx * s * 260, vy: o.vy * .3 + ny * s * 260 - 120, rot: o.rot, vr: o.vr + s * R(2, 5), la, side: s, life: 0 }));
    for (let i = 0; i < 46; i++) {
      const t = R(-.5, .5), sp = R(80, 620), ang = a + Math.PI / 2 * (Math.random() < .5 ? 1 : -1) + R(-.6, .6);
      drops.push({ x: o.x + Math.cos(a) * o.r * t * 2, y: o.y + Math.sin(a) * o.r * t * 2, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 120, r: R(2, 7), life: 0 });
    }
  };

  const end = (reason) => {
    running = false;
    document.documentElement.classList.remove("is-slaying");
    window.LENIS && window.LENIS.start();
    const rank = RANKS.find(([n]) => score < n);
    if (score > best) { best = score; try { localStorage.setItem("innerve-slay-best", best); } catch (e) {} bestEl.textContent = best; }
    rankEl.innerHTML = `<b>${rank[1]}</b><span>${rank[2]}</span>`;
    msg.innerHTML = reason === "nezuko"
      ? `You cut <b>Nezuko</b>. Tanjiro will never forgive you.<br>Demons slain: <b>${score}</b>`
      : `Dawn breaks. Demons slain: <b>${score}</b> · Best: <b>${best}</b>`;
    startBtn.textContent = "Draw again";
    overlay.classList.add("is-on", "is-end");
    SFX().play("gong");
  };

  const start = () => {
    objs = []; pieces = []; drops = []; pops = []; trail = [];
    score = 0; combo = 0; timeLeft = 30; elapsed = 0; spawnIn = .4;
    scoreEl.textContent = 0; timeEl.textContent = 30;
    sg.clearRect(0, 0, W, H);
    overlay.classList.remove("is-on", "is-end");
    running = true; last = performance.now();
    document.documentElement.classList.add("is-slaying");
    // frame the arena and lock page scroll while you play
    const stage = document.querySelector(".slay__stage");
    if (window.LENIS) { window.LENIS.scrollTo(stage, { offset: -70, duration: .6, force: true }); setTimeout(() => window.LENIS.stop(), 650); }
    SFX().play("unsheathe");
  };
  startBtn.addEventListener("click", start);
  document.getElementById("slayExit").addEventListener("click", () => running && end("time"));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && running) end("time"); });
  // stop the wheel from scrolling the page out from under you mid-round
  cv.addEventListener("wheel", (e) => { if (running) e.preventDefault(); }, { passive: false });

  /* ---------- the blade ---------- */
  let px = null, py = null, pt = 0, down = false;
  const move = (x, y) => {
    const now = performance.now();
    if (px !== null) {
      const dt = Math.max(1, now - pt), sp = Math.hypot(x - px, y - py) / dt * 1000;
      const slicing = running && (sp > 700 || down);
      if (slicing) {
        trail.push({ x, y, t: now });
        objs = objs.filter((o) => {
          if (!segCircle(px, py, x, y, o.x, o.y, o.r)) return true;
          if (o.nez) { cut(o, px, py, x, y); window.Impact && Impact(true); end("nezuko"); return false; }
          cut(o, px, py, x, y);
          combo = now - lastHit < 380 ? combo + 1 : 1; lastHit = now;
          score += combo > 2 ? 2 : 1; scoreEl.textContent = score;
          pops.push({ x: o.x, y: o.y - o.h * .3, txt: combo > 1 ? `COMBO ×${combo}` : FORMS[Math.floor(Math.random() * FORMS.length)], life: 0, big: combo > 2 });
          SFX().play("slash");
          if (combo === 3 || combo === 5) { SFX().play("taiko"); window.Impact && Impact(); }
          return false;
        });
      }
    }
    px = x; py = y; pt = now;
  };
  const local = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointermove", (e) => move(...local(e)));
  cv.addEventListener("pointerdown", (e) => { down = true; px = null; move(...local(e)); });
  addEventListener("pointerup", () => { down = false; });
  cv.addEventListener("pointerleave", () => { px = null; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (!visible && running) last = performance.now(); }, { threshold: .35 }).observe(cv);

  /* ---------- loop ---------- */
  const GRAV = () => H * 1.9;
  const loop = (now) => {
    requestAnimationFrame(loop);
    let dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!visible) return;
    const idle = !running && !objs.length && !pieces.length && !drops.length && !pops.length && !trail.length;
    if (idle) { if (!wasIdle) { g.clearRect(0, 0, W, H); g.drawImage(stain, 0, 0, W, H); wasIdle = true; } return; }
    wasIdle = false;
    if (running) {
      elapsed += dt; timeLeft -= dt;
      const tl = Math.max(0, Math.ceil(timeLeft));
      if (+timeEl.textContent !== tl) { timeEl.textContent = tl; if (tl <= 5 && tl > 0) SFX().play("heartbeat"); }
      if (timeLeft <= 0) end("time");
      spawnIn -= dt;
      if (spawnIn <= 0) { spawn(); spawnIn = Math.max(.45, 1.05 - elapsed * .018) * R(.8, 1.2); }
    }
    g.clearRect(0, 0, W, H);
    // fading ink stains
    sg.globalCompositeOperation = "destination-out"; sg.fillStyle = "rgba(0,0,0,.012)"; sg.fillRect(0, 0, W, H); sg.globalCompositeOperation = "source-over";
    g.drawImage(stain, 0, 0, W, H);

    const grav = GRAV();
    objs.forEach((o) => {
      o.vy += grav * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt;
      g.save(); g.translate(o.x, o.y); g.rotate(o.rot);
      if (o.nez) { g.shadowColor = "#ff6fa8"; g.shadowBlur = 30; }
      else { g.shadowColor = "rgba(200,16,46,.8)"; g.shadowBlur = 24; }
      g.drawImage(o.img, -o.w / 2, -o.h / 2, o.w, o.h); g.restore();
    });
    objs = objs.filter((o) => o.y < H + o.h || o.vy < 0);

    pieces.forEach((p) => {
      p.vy += grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life += dt;
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.rotate(p.la);
      g.beginPath(); g.rect(-4000, p.side > 0 ? 0 : -4000, 8000, 4000); g.clip();
      g.rotate(-p.la);
      g.globalAlpha = Math.max(0, 1 - p.life / 1.6);
      g.drawImage(p.img, -p.w / 2, -p.h / 2, p.w, p.h);
      g.restore();
      // the cut edge glows
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot + p.la); g.globalAlpha = Math.max(0, .9 - p.life * 2);
      g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.shadowColor = "#ff1a3c"; g.shadowBlur = 16;
      g.beginPath(); g.moveTo(-p.w * .6, 0); g.lineTo(p.w * .6, 0); g.stroke(); g.restore();
    });
    pieces = pieces.filter((p) => p.life < 1.6 && p.y < H + p.h * 2);

    drops.forEach((d) => {
      d.vy += grav * .6 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life += dt;
      g.fillStyle = "#b0081f"; g.beginPath(); g.arc(d.x, d.y, d.r, 0, 7); g.fill();
      if (d.life > .25 && !d.stuck && Math.random() < .08) { d.stuck = true; sg.fillStyle = "rgba(140,6,24,.55)"; sg.beginPath(); sg.ellipse(d.x, d.y, d.r * 2.2, d.r * 1.6, R(0, 3), 0, 7); sg.fill(); }
    });
    drops = drops.filter((d) => d.life < 1.2 && d.y < H + 20);

    pops.forEach((p) => {
      p.life += dt; const k = Math.min(1, p.life * 6);
      g.save(); g.globalAlpha = Math.max(0, 1 - p.life / 1.1); g.translate(p.x, p.y - p.life * 60); g.scale(k * (p.big ? 1.4 : 1), k * (p.big ? 1.4 : 1));
      g.font = `${p.big ? 900 : 700} ${p.big ? 44 : 32}px 'Anton', sans-serif`; g.textAlign = "center";
      g.lineWidth = 6; g.strokeStyle = "#0b0a0c"; g.strokeText(p.txt, 0, 0);
      g.fillStyle = p.big ? "#ffd23a" : "#efe8dc"; g.fillText(p.txt, 0, 0); g.restore();
    });
    pops = pops.filter((p) => p.life < 1.1);

    // blade trail
    trail = trail.filter((p) => now - p.t < 160);
    if (trail.length > 1) {
      g.lineCap = "round";
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1], b = trail[i], k = i / trail.length;
        g.strokeStyle = `rgba(120,200,255,${k * .6})`; g.lineWidth = 2 + k * 14;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
        g.strokeStyle = `rgba(255,255,255,${k})`; g.lineWidth = 1 + k * 4;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
    }
  };
  requestAnimationFrame(loop);
})();

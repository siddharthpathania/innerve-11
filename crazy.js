/* Innerve 11 — the crazy layer: impact frames, speed-line rush, biwa door teleports,
   Muzan's blood whips, the Kasugai crow, kanji scramble, and your personal breathing style. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const SFX = () => window.SFX || { play() {} };
  const R = (a, b) => a + Math.random() * (b - a);

  /* ================= impact frames (anime sakuga hit) ================= */
  const imp = $("#impact");
  let impBusy = false;
  window.Impact = (red = false) => {
    if (reduced || impBusy || !imp) return;
    impBusy = true;
    imp.className = "impact is-a" + (red ? " is-red" : "");
    setTimeout(() => (imp.className = "impact is-b" + (red ? " is-red" : "")), 70);
    setTimeout(() => { imp.className = "impact"; }, 150);
    setTimeout(() => (impBusy = false), 450);          // never more than ~2 per second
  };

  /* ================= speed-line rush on fast scroll ================= */
  const rush = $("#rush");
  if (rush && !reduced) {
    rush.innerHTML = Array.from({ length: 120 }, () => {
      const a = Math.random() * Math.PI * 2, r1 = R(34, 46), r2 = 95;
      return `<line x1="${(Math.cos(a) * r1).toFixed(2)}" y1="${(Math.sin(a) * r1).toFixed(2)}" x2="${(Math.cos(a) * r2).toFixed(2)}" y2="${(Math.sin(a) * r2).toFixed(2)}" stroke-width="${R(.1, .55).toFixed(2)}"/>`;
    }).join("");
    let lastY = scrollY, lastT = performance.now(), op = 0;
    const tick = () => {
      const now = performance.now(), v = Math.abs(scrollY - lastY) / Math.max(1, now - lastT) * 1000;
      lastY = scrollY; lastT = now;
      const target = Math.min(.75, Math.max(0, (v - 1400) / 4000));
      const was = op;
      op += (target - op) * .15;
      if (op < .004) op = 0;
      if (op || was) {                                   // only touch the DOM while it's showing
        rush.style.opacity = op.toFixed(3);
        rush.style.transform = `rotate(${(now / 40) % 360}deg) scale(${1 + op * .2})`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ================= Nakime's biwa: shoji doors teleport ================= */
  const doors = $("#doors");
  window.Doors = {
    go(target) {
      const lenis = window.LENIS;
      if (reduced || !window.gsap || !doors) { lenis ? lenis.scrollTo(target) : target.scrollIntoView(); return; }
      const G = window.gsap;
      SFX().play("biwa");
      G.timeline()
        .set(doors, { autoAlpha: 1 })
        .fromTo(".door--l", { xPercent: -100 }, { xPercent: 0, duration: .42, ease: "expo.in" }, 0)
        .fromTo(".door--r", { xPercent: 100 }, { xPercent: 0, duration: .42, ease: "expo.in" }, 0)
        .fromTo(".doors__seal", { scale: 2.4, opacity: 0, rotation: -20 }, { scale: 1, opacity: 1, rotation: 0, duration: .3, ease: "back.out(2)" }, .36)
        .call(() => { SFX().play("taiko"); lenis ? lenis.scrollTo(target, { immediate: true, force: true }) : target.scrollIntoView(); window.ScrollTrigger && ScrollTrigger.update(); }, null, .45)
        .to(".doors__seal", { opacity: 0, scale: .6, duration: .2 }, .85)
        .to(".door--l", { xPercent: -100, duration: .6, ease: "expo.out" }, .9)
        .to(".door--r", { xPercent: 100, duration: .6, ease: "expo.out" }, .9)
        .set(doors, { autoAlpha: 0 });
    }
  };

  /* ================= Muzan's blood whips (verlet tentacles) ================= */
  const wc = $("#whips"), throne = $(".hero__muzan");
  if (wc && throne && !reduced) {
    const g = wc.getContext("2d");
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio, 1.5);
    const size = () => { const r = wc.getBoundingClientRect(); W = r.width; H = r.height; wc.width = W * dpr; wc.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); new ResizeObserver(size).observe(wc);
    const small = innerWidth < 700;
    const N = small ? 18 : 30;
    const whips = (small ? [-.3, 0, .3] : [-.32, -.17, 0, .17, .32]).map((ox, i) => ({ ox, phase: i * 1.7, pts: [], strikeAt: performance.now() + R(2500, 5000), lunge: 0 }));
    const mouse = { x: -1, y: -1, inside: false };
    addEventListener("pointermove", (e) => { const r = wc.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.inside = mouse.y > 0 && mouse.y < r.height; });
    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(wc);
    let tr, wr;   // measured once per frame, not once per whip
    const anchor = (wp) => ({ x: tr.left - wr.left + tr.width * (.5 + wp.ox * .55), y: tr.top - wr.top + tr.height * (.32 + Math.abs(wp.ox) * .25) });
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (!visible || !W) return;
      const t = now / 1000, seg = H * .03;
      tr = throne.getBoundingClientRect(); wr = wc.getBoundingClientRect();
      g.clearRect(0, 0, W, H);
      whips.forEach((wp, wi) => {
        const a = anchor(wp);
        if (!wp.pts.length) for (let i = 0; i < N; i++) wp.pts.push({ x: a.x, y: a.y - i * seg, px: a.x, py: a.y - i * seg });
        // target: the cursor when it's around, else a slow menacing wander
        const side = wp.ox === 0 ? 0 : Math.sign(wp.ox);
        let tx = a.x + side * W * .22 + Math.sin(t * .7 + wp.phase) * W * .08, ty = a.y - H * .35 + Math.cos(t * .9 + wp.phase) * H * .12;
        if (mouse.inside && finePointer) { tx = tx * .35 + mouse.x * .65; ty = ty * .35 + mouse.y * .65; }
        if (now > wp.strikeAt && mouse.inside) {
          wp.strikeAt = now + R(2200, 4800); wp.lunge = 1; SFX().play("whoosh");
        }
        wp.lunge *= .9;
        const P = wp.pts;
        for (let i = 1; i < N; i++) {
          const p = P[i], vx = (p.x - p.px) * .9, vy = (p.y - p.py) * .9;
          p.px = p.x; p.py = p.y;
          const k = (i / N) ** 2 * (.0035 + wp.lunge * .06);
          p.x += vx + (tx - p.x) * k + Math.sin(t * 2 + i * .5 + wp.phase) * .4;
          p.y += vy + (ty - p.y) * k - .15;
        }
        P[0].x = a.x; P[0].y = a.y;
        for (let it = 0; it < 6; it++) for (let i = 1; i < N; i++) {
          const p0 = P[i - 1], p1 = P[i], dx = p1.x - p0.x, dy = p1.y - p0.y, d = Math.hypot(dx, dy) || 1, f = (d - seg) / d;
          if (i === 1) { p1.x -= dx * f; p1.y -= dy * f; } else { p0.x += dx * f * .5; p0.y += dy * f * .5; p1.x -= dx * f * .5; p1.y -= dy * f * .5; }
        }
        P[0].x = a.x; P[0].y = a.y;
        // draw: dark core, crimson sheen, thorns
        g.lineCap = "round"; g.lineJoin = "round";
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 1; i < N; i++) {
            const k = 1 - i / N;
            g.strokeStyle = pass ? `rgba(235,40,70,${.6 * k + .25})` : "#3a000c";
            g.lineWidth = (pass ? 9 : 30) * (k * .85 + .15) * (H / 900);
            g.beginPath(); g.moveTo(P[i - 1].x, P[i - 1].y); g.lineTo(P[i].x, P[i].y); g.stroke();
          }
        }
        g.fillStyle = "#1a0005";
        for (let i = 3; i < N - 2; i += 3) {
          const p0 = P[i - 1], p1 = P[i], ang = Math.atan2(p1.y - p0.y, p1.x - p0.x) + (i % 2 ? 1.57 : -1.57), s = 9 * (1 - i / N) * (H / 900) + 3;
          g.beginPath(); g.moveTo(p1.x + Math.cos(ang + 1.3) * s * .6, p1.y + Math.sin(ang + 1.3) * s * .6); g.lineTo(p1.x + Math.cos(ang) * s * 1.8, p1.y + Math.sin(ang) * s * 1.8); g.lineTo(p1.x + Math.cos(ang - 1.3) * s * .6, p1.y + Math.sin(ang - 1.3) * s * .6); g.fill();
        }
        // glowing tip
        const tip = P[N - 1];
        g.fillStyle = `rgba(255,40,70,${.5 + wp.lunge * .5})`; g.shadowColor = "#ff1a3c"; g.shadowBlur = 16;
        g.beginPath(); g.arc(tip.x, tip.y, 3 + wp.lunge * 4, 0, 7); g.fill(); g.shadowBlur = 0;
        void wi;
      });
    };
    requestAnimationFrame(loop);
  }

  /* ================= the Kasugai crow messenger ================= */
  const crow = $("#crow");
  const LINES = ["CAW! Registration opens 15 Nov 2026!", "CAW! ₹12 Lacs+ in bounties!", "CAW! Teams of 2 to 4 slayers!", "CAW! 24 hours. 30–31 Jan 2027!", "CAW! The Upper Moons await in the castle!", "CAW! Try typing… hinokami", "CAW! Zero registration fee!"];
  let li = 0;
  if (crow && !reduced && window.gsap) {
    const say = $(".crow__say", crow);
    const fly = () => {
      const busy = (window.CASTLE && window.CASTLE.visible) || document.documentElement.classList.contains("is-slaying") || document.body.classList.contains("is-loading");
      if (!busy) {
        say.textContent = LINES[li++ % LINES.length];
        const y0 = R(.12, .4) * innerHeight;
        // swoop across: steady glide left with a rolling dip-and-climb path
        const dur = 8, amp = R(40, 90);
        const path = { p: 0 };
        gsap.timeline()
          .set(crow, { autoAlpha: 1, x: innerWidth + 80, y: y0, rotation: 0 })
          .to(path, { p: 1, duration: dur, ease: "none", onUpdate: () => {
            const x = innerWidth + 80 - path.p * (innerWidth + 460);
            const y = y0 + Math.sin(path.p * Math.PI * 3) * amp;
            const slope = Math.cos(path.p * Math.PI * 3) * amp * Math.PI * 3 / (innerWidth + 460);
            gsap.set(crow, { x, y, rotation: Math.atan(slope) * 57 });
          } }, 0)
          .fromTo(say, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: "back.out(2.5)" }, 1.2)
          .call(() => SFX().play("tick"), null, 1.2)
          .to(say, { opacity: 0, duration: .3 }, 7.2)
          .set(crow, { autoAlpha: 0 });
      }
      setTimeout(fly, R(30000, 50000));
    };
    window.addEventListener("innerve-ready", () => setTimeout(fly, 5000), { once: true });
    crow.addEventListener("click", () => { SFX().play("koto"); const t = $("#register"); t && window.Doors.go(t); });
  }

  /* ================= kanji scramble on section titles ================= */
  const POOL = "鬼滅刃炎水雷風岩蟲恋霞音蛇月日血柱斬呼吸型全集中無限城上弦壱弐参肆伍陸".split("");
  if (!reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      $$(".ch", e.target).forEach((ch, i) => {
        const orig = ch.textContent; if (!orig.trim()) return;
        let n = 0; const steps = 7 + Math.floor(Math.random() * 5);
        setTimeout(() => {
          const iv = setInterval(() => { ch.textContent = ++n >= steps ? orig : POOL[Math.floor(Math.random() * POOL.length)]; if (n >= steps) clearInterval(iv); }, 45);
        }, i * 18);
      });
    }), { threshold: .4 });
    // wait until main.js has split titles into .ch spans
    setTimeout(() => $$(".sec-title").forEach((el) => io.observe(el)), 0);
  }

  /* ================= your breathing style ================= */
  const BREATH = { water: ["水", "Water"], flame: ["炎", "Flame"], insect: ["蟲", "Insect"], mist: ["霞", "Mist"], sound: ["音", "Sound"], stone: ["岩", "Stone"], serpent: ["蛇", "Serpent"], love: ["恋", "Love"], wind: ["風", "Wind"] };
  const badge = $("#breathBadge");
  const setBreath = (key, announce) => {
    if (!BREATH[key]) return;
    document.documentElement.dataset.breath = key;
    if (badge) { badge.innerHTML = `<b>${BREATH[key][0]}</b><span>${BREATH[key][1]} breathing</span>`; badge.classList.add("is-on"); }
    try { localStorage.setItem("innerve-breath", key); } catch (e) {}
    if (announce && window.gsap && badge) gsap.fromTo(badge, { scale: 1.6 }, { scale: 1, duration: .6, ease: "elastic.out(1, .4)" });
  };
  try { setBreath(localStorage.getItem("innerve-breath")); } catch (e) {}
  const tl = $("#tlist");
  if (tl) tl.addEventListener("click", (e) => {
    const r = e.target.closest(".trow"); if (!r || !window.INNERVE) return;
    setBreath(window.INNERVE.tracks[+r.dataset.i].form, true);
  });

  /* ================= now playing (the Demon Slayer medley) ================= */
  const npIdx = $("#npIdx"), npTitle = $("#npTitle"), npNext = $("#npNext");
  if (npNext) {
    // note: `SFX` in this file is a local getter function; use the engine on window directly
    npNext.addEventListener("click", () => { const S = window.SFX; if (S && S.hasMusic) { S.nextTrack(1); setTimeout(tickNp, 300); } });
    const tickNp = () => {
      const S = window.SFX;
      if (!S || !S.hasMusic) return;
      const tr = S.track();
      npIdx.textContent = String(tr.index + 1).padStart(2, "0");
      npNext.previousElementSibling.querySelector("i").textContent = "/" + String(tr.count).padStart(2, "0");
      npTitle.textContent = tr.title;
    };
    setInterval(tickNp, 1000);
  }
})();

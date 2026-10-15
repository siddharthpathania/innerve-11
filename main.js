/* Innerve 11 — Demon Slayer edition */
(() => {
  const D = window.INNERVE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, "0");
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const animate = hasGsap && !reduced;

  /* ---------- Render content ---------- */
  $("#tlist").innerHTML = D.tracks.map((t, i) => `
    <li class="trow" tabindex="0" role="button" data-i="${i}" aria-label="${t.name}: unleash ${t.formEn}">
      <div class="trow__bg"></div>
      <div class="trow__art" aria-hidden="true">
        <svg preserveAspectRatio="none"><rect width="100%" height="100%" fill="url(#${t.pat})"/></svg>
        <img src="assets/img/chars/${t.img}.webp" alt="" loading="lazy" />
        <span class="trow__kanji">${t.kanji}</span>
      </div>
      <div class="trow__in">
        <span class="trow__num">${pad(i + 1)}</span>
        <h3 class="trow__name">${t.name}</h3>
        <p class="trow__meta"><b>${t.style} · ${t.hashira}</b>${t.desc}</p>
      </div>
    </li>`).join("");

  $("#fgrid").innerHTML = D.frames.map((f) => `
    <figure class="ftile${f.cls ? " ftile--" + f.cls : ""}">
      <figcaption class="ftile__lbl">${f.tag}<b>${f.who}</b></figcaption>
      <span class="ftile__k" aria-hidden="true">${f.kanji}</span>
      <img src="assets/img/chars/${f.img}.webp" alt="${f.who}" loading="lazy" />
    </figure>`).join("");

  $("#pcards").innerHTML = D.prizes.map((p) => `
    <article class="pcard${p.hot ? " pcard--hot" : ""}">
      <span class="pcard__k" aria-hidden="true">${p.kanji}</span>
      <div class="pcard__rank">${p.rank}</div>
      <div class="pcard__amt"><small>₹</small>${p.amt}</div>
      <ul>${D.prizePerks.map((x) => `<li>${x}</li>`).join("")}</ul>
    </article>`).join("");

  const kanjiNums = ["壱", "弐", "参", "肆", "伍"];
  $("#ttrack").insertAdjacentHTML("beforeend", D.timeline.map((t, i) => `
    <div class="tnode">
      <span class="tnode__dot"></span>
      <span class="tnode__n">${kanjiNums[i]} · Night ${pad(i + 1)}</span>
      <div class="tnode__date">${t.date.replace(/ (\d{4})$/, "")}<span style="font-size:.4em;opacity:.7"> ${t.date.slice(-4)}</span></div>
      <div class="tnode__title">${t.title}</div>
      <p>${t.text}</p>
    </div>`).join(""));

  $("#vgrid").innerHTML = D.testimonials.map((t) => `
    <figure class="vcard">
      <blockquote>${t.quote}</blockquote>
      <figcaption class="vcard__who">
        <span class="hanko" aria-hidden="true">${t.name.split(" ").map((w) => w[0]).join("")}</span>
        <span><b>${t.name}</b><span>${t.org}</span></span>
      </figcaption>
    </figure>`).join("");

  $("#agrid").innerHTML = D.sponsors.map((s) => `
    <a class="atile${s.size ? " atile--" + s.size : ""}" href="${s.url}" target="_blank" rel="noopener">
      <span class="atile__tier">${s.tier}</span>
      <img src="assets/logos/sponsors/${s.logo}" alt="${s.name}" loading="lazy" />
    </a>`).join("");

  // FAQ tabs
  const cats = Object.keys(D.faq);
  const tabs = $("#faqTabs"), list = $("#faqList");
  tabs.innerHTML = cats.map((c, i) => `<button class="faq__tab" role="tab" aria-selected="${i === 0}" data-cat="${c}">${c}</button>`).join("");
  const renderFaq = (cat) => {
    list.innerHTML = D.faq[cat].map((x) => `
      <div class="qa">
        <button aria-expanded="false">${x.q}<i aria-hidden="true"></i></button>
        <div class="qa__a"><div><p>${x.a}</p></div></div>
      </div>`).join("");
  };
  renderFaq(cats[0]);
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest(".faq__tab"); if (!b) return;
    $$(".faq__tab", tabs).forEach((t) => t.setAttribute("aria-selected", t === b));
    renderFaq(b.dataset.cat);
    if (hasGsap) gsap.from($$(".qa", list), { y: 20, opacity: 0, stagger: .05, duration: .5, ease: "power3.out" });
    window.ScrollTrigger && ScrollTrigger.refresh();
  });
  list.addEventListener("click", (e) => {
    const b = e.target.closest(".qa button"); if (!b) return;
    const qa = b.parentElement, open = !qa.classList.contains("open");
    qa.classList.toggle("open", open); b.setAttribute("aria-expanded", open);
    setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 500);
  });

  /* ---------- Generated art ---------- */
  // manga speed lines for the zoom-to-white transition
  $(".speed").innerHTML = Array.from({ length: 90 }, () => {
    const a = rand(0, Math.PI * 2), r1 = rand(18, 34), r2 = 90;
    return `<line x1="${(Math.cos(a) * r1).toFixed(2)}" y1="${(Math.sin(a) * r1).toFixed(2)}" x2="${(Math.cos(a) * r2).toFixed(2)}" y2="${(Math.sin(a) * r2).toFixed(2)}" stroke-width="${rand(.15, .9).toFixed(2)}"/>`;
  }).join("");

  // demon eyes — jittered grid
  const EYE = `<path d="M4 30 Q60 -12 116 30 Q60 72 4 30 Z" fill="#efe8dc" stroke="#0b0a0c" stroke-width="4"/>
    <g class="iris"><circle cx="60" cy="30" r="19" fill="#c8102e" stroke="#0b0a0c" stroke-width="3"/><circle cx="60" cy="30" r="13" fill="none" stroke="#0b0a0c" stroke-width="1.2" opacity=".6"/><ellipse cx="60" cy="30" rx="3.6" ry="16" fill="#0b0a0c"/><circle cx="66" cy="22" r="3" fill="#fff" opacity=".8"/></g>
    <path d="M4 30 Q60 -12 116 30" fill="none" stroke="#0b0a0c" stroke-width="7"/>
    <path d="M10 22 L2 14 M22 14 L18 4 M38 8 L37 -2" stroke="#0b0a0c" stroke-width="3" stroke-linecap="round"/>`;
  const allEyes = [];
  const buildEyes = (el, cols, rows) => {
    const cw = 100 / cols, ch = 100 / rows;
    let html = "";
    const meta = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const w = rand(cw * 1.05, cw * 1.6), l = c * cw + rand(-cw * .3, cw * .1), tp = r * ch + rand(-ch * .2, ch * .2);
      meta.push({ cx: (l + w / 2) / 100, cy: tp / 100 });
      html += `<svg viewBox="0 0 120 60" style="left:${l}%;top:${tp}%;width:${w}%;transform:rotate(${rand(-14, 14)}deg)"><g class="lid">${EYE}</g></svg>`;
    }
    el.innerHTML = html;
    [...el.querySelectorAll(".iris")].forEach((ir, i) => allEyes.push({ ir, layer: el, ...meta[i] }));
  };
  const narrow = innerWidth < 700;
  buildEyes($("#eyes"), narrow ? 4 : 8, narrow ? 9 : 6);
  buildEyes($("#eyes0"), narrow ? 4 : 8, narrow ? 9 : 6);
  buildEyes($("#eyes2"), narrow ? 4 : 8, narrow ? 9 : 6);
  // every demon eye tracks the cursor (or drifts when idle on touch)
  let eyeRaf = 0, mx = .5, my = .5;
  const lookAt = () => {
    eyeRaf = 0;
    const vis = new Map();
    allEyes.forEach((e) => {
      if (!vis.has(e.layer)) vis.set(e.layer, +getComputedStyle(e.layer).opacity > 0 && e.layer.getBoundingClientRect().bottom > 0);
      if (!vis.get(e.layer)) return;
      const dx = mx - e.cx, dy = (my - e.cy) * (innerHeight / innerWidth);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d * 4);
      e.ir.setAttribute("transform", `translate(${(dx / d * 14 * k).toFixed(1)} ${(dy / d * 6 * k).toFixed(1)})`);
    });
  };
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; if (!eyeRaf) eyeRaf = requestAnimationFrame(lookAt); });

  /* ---------- Hinokami Kagura easter egg: type "hinokami" ---------- */
  let typed = "";
  addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-8);
    if (typed !== "hinokami") return;
    typed = "";
    const on = document.documentElement.classList.toggle("hinokami");
    window.SFX && (SFX.play("flame"), setTimeout(() => SFX.play("gong"), 300));
    if (window.gsap) gsap.timeline().set("#sun", { autoAlpha: 1 }).fromTo(".sun__k", { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: "expo.out" })
      .fromTo(".sun__en", { letterSpacing: "1em", opacity: 0 }, { letterSpacing: ".3em", opacity: 1, duration: .6 }, "<.1")
      .to("#sun", { autoAlpha: 0, duration: .6 }, on ? 1.6 : 1.2);
  });

  /* ---------- Countdown ---------- */
  const target = new Date(D.eventStart).getTime();
  const cd = { d: $('[data-u="d"]'), h: $('[data-u="h"]'), m: $('[data-u="m"]'), s: $('[data-u="s"]') };
  const tick = () => {
    let t = Math.max(0, target - Date.now()) / 1000;
    cd.d.textContent = pad(Math.floor(t / 86400)); t %= 86400;
    cd.h.textContent = pad(Math.floor(t / 3600)); t %= 3600;
    cd.m.textContent = pad(Math.floor(t / 60));
    cd.s.textContent = pad(Math.floor(t % 60));
  };
  tick(); setInterval(tick, 1000);

  /* ---------- Breathing forms on track click ---------- */
  const fire = (row) => { window.Forms && Forms.unleash(D.tracks[+row.dataset.i]); };
  $("#tlist").addEventListener("click", (e) => { const r = e.target.closest(".trow"); if (r) fire(r); });
  $("#tlist").addEventListener("keydown", (e) => { const r = e.target.closest(".trow"); if (r && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); fire(r); } });

  /* ---------- Track hover ---------- */
  const canHover = matchMedia("(hover: hover)").matches;
  if (canHover) {
    $$(".trow").forEach((row) => {
      row.addEventListener("mouseenter", () => row.classList.add("is-on"));
      row.addEventListener("mouseleave", () => row.classList.remove("is-on"));
    });
  }

  /* ---------- Sound toggle ---------- */
  const SFX = window.SFX || { play() {}, start() {}, toggle() { return false; }, on: false };
  const sndBtn = $("#snd");
  sndBtn.addEventListener("click", () => sndBtn.setAttribute("aria-pressed", SFX.toggle()));
  document.addEventListener("pointerenter", (e) => {
    const t = e.target;
    if (t.closest && t.closest("a, button, .trow, .ftile, .pcard")) SFX.play("tick");
  }, true);
  $$(".trow").forEach((r) => r.addEventListener("mouseenter", () => SFX.play("unsheathe")));

  /* ---------- Split text into words/chars ---------- */
  const splitChars = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(" ")); return; }
            const word = document.createElement("span"); word.className = "word";
            [...w].forEach((c) => { const ch = document.createElement("span"); ch.className = "ch"; ch.textContent = c; word.appendChild(ch); });
            frag.appendChild(word);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  };
  $$(".fall__text .mask > span, .breath__title, .breath__kicker, .castle__title .mask > span, .finale__title .mask > span, .about__title > span, .sec-title, .castle__bounty").forEach(splitChars);

  /* ---------- Static fallback ---------- */
  if (!animate) {
    document.documentElement.classList.add("no-anim");
    $("#loader")?.remove();
    $("#poolNum").textContent = "12";
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
    $$(".eyes").forEach((e) => e.remove());
    $(".fall__red").style.opacity = 1;
    $(".breath__face").style.display = "none";
    $(".fall__sub").style.opacity = 1;
    $(".breath__sub").style.opacity = 1;
    $$(".slash path").forEach((p) => (p.style.display = "none"));
    if (!canHover) {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-on", e.isIntersecting)), { rootMargin: "-45% 0px -45% 0px" });
      $$(".trow").forEach((r) => io.observe(r));
    }
    $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
      const t = $(a.getAttribute("href")); if (!t) return;
      e.preventDefault(); t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }));
    return;
  }

  /* ================= ANIMATED PATH ================= */
  gsap.registerPlugin(ScrollTrigger);
  const SECTIONS = $$("main > section"); // grab before pinning wraps them in spacers
  document.body.classList.add("is-loading");

  // Smooth scroll
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  window.LENIS = lenis;
  $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
    const t = $(a.getAttribute("href")); if (!t) return;
    e.preventDefault();
    if (window.Doors) Doors.go(t); else lenis ? lenis.scrollTo(t, { duration: 1.8 }) : t.scrollIntoView({ behavior: "smooth" });
  }));

  const vh = (n) => () => (innerHeight * n) / 100;
  const flash = (o = .6) => gsap.fromTo("#flash", { opacity: o }, { opacity: 0, duration: .45, ease: "power2.out", overwrite: true });

  /* ----- HERO: the throne ----- */
  const eyes1 = $$("#eyes svg");
  gsap.set(eyes1, { scaleY: .02 });

  gsap.timeline({ scrollTrigger: { trigger: "#top", start: "top top", end: "+=120%", pin: true, scrub: 1, anticipatePin: 1 } })
    .to(".hero__title--l", { xPercent: -60, opacity: 0, ease: "power2.in", duration: .35 }, 0)
    .to(".hero__title--r", { xPercent: 60, opacity: 0, ease: "power2.in", duration: .35 }, 0)
    .to(".hero__foot", { opacity: 0, y: 40, duration: .15 }, 0)
    .to("#eyes", { opacity: 1, duration: .05 }, .1)
    .call(() => SFX.play("eyes"), null, .1)
    .to(eyes1, { scaleY: 1, duration: .25, ease: "power2.out", stagger: { each: .003, from: "center" } }, .1)
    .to(".hero__throne", { scale: 1.12, transformOrigin: "50% 100%", duration: .5, ease: "none" }, .1)
    .to(eyes1, { scaleY: .02, duration: .12, ease: "power2.in", stagger: { each: .002, from: "edges" } }, .62)
    .to("#eyes", { opacity: 0, duration: .05 }, .8)
    .to(".hero__spire, .hero__floor, .whips", { opacity: 0, duration: .12 }, .72)
    .call(() => flash(.7), null, .86)
    .call(() => SFX.play("whoosh"), null, .8)
    .to(".hero__throne", { scale: 2.4, yPercent: 30, opacity: 0, duration: .25, ease: "power2.in" }, .75);

  /* ----- FALL: Tanjiro drops, the night bleeds red ----- */
  const faller = $(".fall__hero");
  const slashPaths = $$(".slash path");
  gsap.set(slashPaths, { strokeDasharray: "1 2", strokeDashoffset: 1 });
  gsap.set(faller, { filter: "grayscale(1) brightness(2.4) contrast(0.55) opacity(0.9)" });

  gsap.timeline({ scrollTrigger: { trigger: "#fall", start: "top top", end: "+=170%", pin: true, scrub: 1, anticipatePin: 1 } })
    .fromTo(faller, { y: vh(-110), rotation: -150, scale: .7 }, { y: vh(0), rotation: 12, scale: 1, ease: "power1.out", duration: .65 }, 0)
    .fromTo(".fall__lines i", { y: vh(-40) }, { y: vh(150), stagger: .03, duration: .5, ease: "none" }, 0)
    .to(".fall__red", { opacity: 1, ease: "none", duration: .22 }, .32)
    .to(faller, { filter: "grayscale(0) brightness(1) contrast(1) opacity(1)", duration: .22 }, .32)
    .to(".fall__kanji", { color: "rgba(11,10,12,.12)", duration: .25 }, .32)
    .call(() => SFX.play("whoosh"), null, .05)
    .call(() => SFX.play("taiko"), null, .32)
    .from(".fall__text .ch", { yPercent: 120, rotation: 12, stagger: .006, duration: .14, ease: "power3.out" }, .5)
    .to(".fall__sub", { opacity: 1, duration: .1 }, .62)
    .to(faller, { x: () => innerWidth * .18, rotation: 4, scale: 1.08, duration: .2, ease: "none" }, .65)
    .to(slashPaths, { strokeDashoffset: 0, duration: .12, stagger: .03, ease: "power2.in" }, .84)
    .call(() => { SFX.play("slash"); window.Impact && Impact(); }, null, .86)
    .call(() => flash(.55), null, .93)
    .to(faller, { x: () => innerWidth * 1.1, y: vh(-50), rotation: 40, duration: .14, ease: "power2.in" }, .86)
    .to(".fall__stage", { x: 8, duration: .02, yoyo: true, repeat: 3, ease: "none" }, .95);

  /* ----- FLAME: close-up → TOTAL FOCUS → strike → speed lines ----- */
  gsap.timeline({ scrollTrigger: { trigger: "#breath", start: "top top", end: "+=150%", pin: true, scrub: 1, anticipatePin: 1 } })
    .fromTo(".breath__face", { scale: 1.1 }, { scale: .36, duration: .38, ease: "power1.inOut" }, 0)
    .to(".breath__face", { opacity: .18, duration: .1 }, .36)
    .call(() => SFX.play("flame"), null, .02)
    .from(".breath__kicker .ch", { yPercent: 120, stagger: .01, duration: .1, ease: "power3.out" }, .3)
    .from(".breath__title .ch", { yPercent: 120, rotation: 10, stagger: .015, duration: .14, ease: "power3.out" }, .34)
    .to(".breath__sub", { opacity: 1, duration: .08 }, .45)
    .fromTo(".breath__strike", { xPercent: 90, yPercent: 30, rotation: 14, opacity: 0 }, { xPercent: 0, yPercent: 0, rotation: 0, opacity: 1, duration: .22, ease: "power3.out" }, .5)
    .to(".breath__copy", { x: () => -innerWidth * .04, duration: .22 }, .5)
    .to(".breath__strike", { scale: 1.6, xPercent: -30, transformOrigin: "40% 40%", duration: .2, ease: "power2.in" }, .78)
    .call(() => { SFX.play("thunder"); window.Impact && Impact(); }, null, .52)
    .call(() => SFX.play("whoosh"), null, .78)
    .to(".speed", { opacity: 1, scale: 1.3, duration: .14 }, .78)
    .to(".breath__wipe", { opacity: 1, duration: .1 }, .9);

  /* ----- INFINITY CASTLE (3D in castle.js; this drives it) ----- */
  const CASTLE = (window.CASTLE = window.CASTLE || { progress: 0 });
  const MOONS = [[0, "上弦の陸", "Upper Six · Daki"], [0, "上弦の伍", "Upper Five · Gyokko"], [0, "上弦の肆", "Upper Four · Hantengu"],
    [0, "上弦の参", "Upper Three · Akaza"], [0, "上弦の弐", "Upper Two · Doma"], [0, "上弦の壱", "Upper One · Kokushibo"], [0, "琵琶", "The Biwa · Nakime"]];
  const capEl = $("#castleCap"), barEl = $("#castleBar");
  let lastMoonSfx = 0;
  window.addEventListener("castle-moon", (e) => {
    const idx = e.detail;
    if (idx < 0) { gsap.to(capEl, { opacity: 0, x: 20, duration: .3 }); return; }
    capEl.innerHTML = `<b>${MOONS[idx][1]}</b><span>${MOONS[idx][2]}</span>`;
    gsap.fromTo(capEl, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: .5, ease: "power3.out" });
    if (performance.now() - lastMoonSfx > 900) { lastMoonSfx = performance.now(); SFX.play(idx === 6 ? "biwa" : "koto"); }
  });
  window.addEventListener("castle-shift", () => flash(.22));
  const castleTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#castle", start: "top top", end: "+=320%", pin: true, scrub: true, anticipatePin: 1,
      onUpdate: (self) => { CASTLE.progress = self.progress; barEl.style.transform = `scaleX(${self.progress})`; }
    }
  });
  castleTl
    .to(".castle__copy", { opacity: 0, y: -40, duration: .06 }, .08)
    .to(".castle__end", { opacity: 1, duration: .05 }, .9)
    .from(".castle__bounty .ch", { yPercent: 80, opacity: 0, stagger: .004, duration: .05 }, .9)
    .call(() => SFX.play("gong"), null, .9)
    .call(() => flash(.5), null, .965)
    .to({}, { duration: .02 }, .98);

  /* ----- PRIZES ----- */
  const pool = { v: 0 }, poolEl = $("#poolNum");
  gsap.timeline({ scrollTrigger: { trigger: ".prizes__pin", start: "top top", end: "+=70%", pin: true, scrub: 1 } })
    .from(".prizes__big", { scale: .6, opacity: 0, duration: .3 }, 0)
    .to(pool, { v: 12, duration: .5, ease: "power1.out", onUpdate: () => (poolEl.textContent = Math.round(pool.v)) }, 0)
    .call(() => SFX.play("taiko"), null, .02)
    .from(".prizes__note, .prizes .eyebrow", { opacity: 0, y: 20, duration: .2 }, .3)
    .to(".prizes__pin", { opacity: .15, scale: .92, duration: .3 }, .7);
  gsap.from(".pcard", { y: 80, opacity: 0, rotationX: -12, transformPerspective: 900, stagger: .1, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: "#pcards", start: "top 85%" } });

  /* ----- TIMELINE (horizontal on desktop) ----- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 641px)", () => {
    const track = $("#ttrack");
    const dist = () => Math.max(0, track.scrollWidth - innerWidth + 40);
    gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".timeline__pin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
  });
  mm.add("(max-width: 640px)", () => {
    gsap.from(".tnode", { x: 40, opacity: 0, stagger: .12, duration: .8, scrollTrigger: { trigger: "#ttrack", start: "top 80%" } });
  });

  /* ----- FINALE: back to the eyes ----- */
  const eyes2 = $$("#eyes2 svg");
  gsap.set(eyes2, { scaleY: .02 });
  gsap.timeline({ scrollTrigger: { trigger: ".finale__stage", start: "top top", end: "+=110%", pin: true, scrub: 1, anticipatePin: 1 } })
    .to("#eyes2", { opacity: 1, duration: .03 }, 0)
    .to(eyes2, { scaleY: 1, duration: .25, stagger: { each: .003, from: "center" }, ease: "power2.out" }, 0)
    .to(eyes2, { scaleY: .02, duration: .12, stagger: { each: .002, from: "edges" }, ease: "power2.in" }, .3)
    .to("#eyes2", { opacity: 0, duration: .04 }, .44)
    .fromTo(".finale__sun", { scale: .1 }, { scale: 1, duration: .3, ease: "power2.out" }, .4)
    .from(".finale__duo .fig", { yPercent: 60, opacity: 0, stagger: .08, duration: .25, ease: "power3.out" }, .48)
    .call(() => SFX.play("eyes"), null, .01)
    .call(() => SFX.play("gong"), null, .45)
    .from(".finale__title .ch", { yPercent: 120, rotation: 10, stagger: .008, duration: .14, ease: "power3.out" }, .6)
    .from(".finale__title small", { opacity: 0, duration: .1 }, .7)
    .from(".finale__cta", { opacity: 0, y: 30, duration: .12 }, .8);

  /* ===== non-pinned triggers (created after every pin so positions include pin spacing) ===== */
  /* ----- generic reveals ----- */
  $$(".reveal-lines").forEach((el) =>
    gsap.from(el.querySelectorAll(".ch"), { yPercent: 100, rotation: 8, opacity: 0, stagger: .012, duration: .9, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 85%" } }));
  $$(".reveal").forEach((el) =>
    gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
  $$(".sec-title").forEach((el) =>
    gsap.from(el.querySelectorAll(".ch"), { yPercent: 100, rotation: 8, opacity: 0, stagger: .018, duration: .8, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 88%" } }));

  /* ----- velocity skew + marquee ----- */
  const skewTargets = $$(".sec-title, .ftile img, .about__title");
  const skewSet = skewTargets.map((el) => gsap.quickSetter(el, "skewY", "deg"));
  const marqTweens = $$(".marquee__row").map((row, i) =>
    gsap.fromTo(row, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 22, ease: "none", repeat: -1 }));
  // one ticker drives both effects from scroll velocity — no tweens created per scroll event
  let vel = 0, skew = 0, speed = 1;
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => { vel = self.getVelocity(); } });
  gsap.ticker.add(() => {
    vel *= .9;
    const ts = gsap.utils.clamp(-5, 5, vel / -350);
    const nextSkew = skew + (ts - skew) * .12;
    if (Math.abs(nextSkew - skew) > .005 || Math.abs(nextSkew) > .01) { skew = Math.abs(nextSkew) < .01 ? 0 : nextSkew; skewSet.forEach((f) => f(skew)); }
    const ns = 1 + Math.min(4, Math.abs(vel) / 500);
    speed += (ns - speed) * .08;
    marqTweens.forEach((t) => t.timeScale(speed));
  });

  /* ----- magnetic buttons + 3D tilt ----- */
  if (canHover) {
    $$(".btn, .nav__cta, .snd").forEach((b) => {
      const xTo = gsap.quickTo(b, "x", { duration: .5, ease: "power3.out" }), yTo = gsap.quickTo(b, "y", { duration: .5, ease: "power3.out" });
      b.addEventListener("mousemove", (e) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .35); yTo((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
    $$(".ftile, .pcard").forEach((c) => {
      gsap.set(c, { transformPerspective: 900 });
      const rx = gsap.quickTo(c, "rotationX", { duration: .6, ease: "power3.out" }), ry = gsap.quickTo(c, "rotationY", { duration: .6, ease: "power3.out" });
      c.addEventListener("mousemove", (e) => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 12); rx(-((e.clientY - r.top) / r.height - .5) * 10); });
      c.addEventListener("mouseleave", () => { rx(0); ry(0); });
    });
  }
  $$("[data-count]").forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  gsap.from(".stats li", { y: 30, opacity: 0, stagger: .08, duration: .8, ease: "power3.out", scrollTrigger: { trigger: ".stats", start: "top 85%" } });

  /* ----- TRACKS ----- */
  gsap.from(".trow", { y: 60, opacity: 0, stagger: .06, duration: .9, ease: "power3.out", scrollTrigger: { trigger: "#tlist", start: "top 85%" } });
  if (!canHover) {
    $$(".trow").forEach((row) => ScrollTrigger.create({
      trigger: row, start: "top 58%", end: "bottom 58%", toggleClass: { targets: row, className: "is-on" }
    }));
  }

  /* ----- VOICES + ALLIES ----- */
  gsap.from(".vcard", { y: 60, opacity: 0, stagger: .12, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "#vgrid", start: "top 85%" } });
  gsap.from(".atile", { y: 40, opacity: 0, scale: .96, stagger: .04, duration: .8, ease: "power3.out", scrollTrigger: { trigger: "#agrid", start: "top 85%" } });
  gsap.from(".hanko", { scale: 2.2, opacity: 0, rotation: -30, stagger: .15, duration: .5, ease: "back.out(2)", scrollTrigger: { trigger: "#vgrid", start: "top 70%" } });

  /* ----- FRAMES ----- */
  gsap.from(".ftile", { y: 80, opacity: 0, stagger: .08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "#fgrid", start: "top 85%" } });
  $$(".ftile img").forEach((img) => gsap.fromTo(img, { yPercent: 12 }, { yPercent: -4, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));

  /* ----- FAQ ----- */
  gsap.from(".qa", { y: 30, opacity: 0, stagger: .06, duration: .7, ease: "power3.out", scrollTrigger: { trigger: "#faqList", start: "top 85%" } });

  /* ----- HUD: tone + section label + progress ----- */
  const hudNum = $("#hudNum"), hudName = $("#hudName");
  SECTIONS.forEach((sec, i) => {
    const spacer = sec.parentElement.classList.contains("pin-spacer") ? sec.parentElement : sec;
    ScrollTrigger.create({
      trigger: spacer, start: "top 50%", end: "bottom 50%",
      onToggle: (self) => {
        if (!self.isActive) return;
        document.body.dataset.tone = sec.dataset.tone;
        hudNum.textContent = pad(i + 1);
        hudName.textContent = sec.dataset.name || "";
      }
    });
  });
  document.body.dataset.tone = "dark";
  gsap.to("#hudFill", { scaleY: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

  /* ----- LOADER + intro ----- */
  const eyes0 = $$("#eyes0 svg");
  gsap.set(eyes0, { scaleY: .02 });
  const loadPct = $("#loadPct"), prog = { v: 0 };
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const intro = gsap.timeline({ paused: true });
  intro
    .call(() => SFX.play("unsheathe"))
    .to(".loader__slash", { scaleX: 1, duration: .45, ease: "power3.inOut" }, "+=.35")
    .call(() => SFX.play("slash"))
    .to(".loader__inner", { opacity: 0, duration: .25 }, "-=.1")
    .to(".loader__half--top", { yPercent: -100, duration: 1, ease: "expo.inOut" })
    .to(".loader__half--bot", { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<")
    .to(".loader__slash", { opacity: 0, duration: .3 }, "<")
    .from(".hero__floor", { yPercent: 100, duration: 1.2, ease: "expo.out" }, "<.3")
    .from(".hero__spire", { scaleY: 0, transformOrigin: "50% 100%", duration: 1.3, ease: "expo.out" }, "<.1")
    .from(".hero__muzan", { yPercent: 25, opacity: 0, duration: 1.3, ease: "expo.out" }, "<.15")
    .from(".hero__title h1, .hero__title .h1", { yPercent: 100, opacity: 0, stagger: .12, duration: 1.1, ease: "expo.out" }, "<.1")
    .from(".hero__title small, .hero__sub, .hero__date, .hero__scroll", { opacity: 0, y: 20, stagger: .06, duration: .8 }, "<.3")
    // the demon notices you: brief eye flash on its own layer (2 slow blinks, under 3 flashes/s)
    .set("#eyes0", { opacity: 1 }, "+=.15")
    .call(() => SFX.play("heartbeat"))
    .to(eyes0, { scaleY: 1, duration: .22, ease: "power2.out", stagger: { each: .003, from: "random" } })
    .to(eyes0, { scaleY: .02, duration: .18, ease: "power2.in", stagger: { each: .002, from: "random" } }, "+=.35")
    .set("#eyes0", { display: "none" })
    .add(() => {
      $("#loader").remove();
      document.body.classList.remove("is-loading");
      lenis && lenis.start();
      ScrollTrigger.refresh();
      SFX.play("taiko");
      window.dispatchEvent(new Event("innerve-ready"));
    });

  gsap.to(prog, {
    v: 100, duration: 1.4, ease: "power2.inOut",
    onUpdate: () => (loadPct.textContent = Math.round(prog.v)),
    onComplete: () => fontsReady.then(() => {
      const gate = $("#gate"); gate.classList.add("is-ready");
      gsap.from(".gate__btn, .gate__hint", { y: 20, opacity: 0, stagger: .08, duration: .6, ease: "power3.out" });
      let wanted = true;
      try { wanted = localStorage.getItem("innerve-sound") !== "0"; } catch (e) {}
      gate.querySelector(wanted ? "[data-sound='1']" : "[data-sound='0']").focus({ preventScroll: true });
      gate.addEventListener("click", (e) => {
        const b = e.target.closest(".gate__btn"); if (!b || intro.isActive() || intro.progress() > 0) return;
        const withSound = b.dataset.sound === "1";
        SFX.start(withSound);
        sndBtn.setAttribute("aria-pressed", withSound);
        intro.play();
      });
    })
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

/* Innerve 11 — procedural score + SFX (Web Audio, no audio files).
   window.SFX.start(withSound), .toggle(), .play(name), .on */
window.SFX = (() => {
  let ctx = null, master, wet, comp, noiseBuf, analyser, ambBus, on = false, ambientStarted = false;
  let music = null, hasMusic = false, lvl = 0, lvlAt = 0, tdata = null;
  const MUSIC_SRC = "assets/audio/theme.mp3";   // drop a track you own here (e.g. the Demon Slayer OST)
  fetch(MUSIC_SRC, { method: "HEAD" }).then((r) => { hasMusic = r.ok && /audio|mpeg|octet/.test(r.headers.get("content-type") || ""); }).catch(() => {});
  const last = {};
  // Miyako-bushi (in) scale on D — the classic koto mode
  const SCALE = [146.83, 155.56, 196.0, 220.0, 233.08, 293.66, 311.13, 392.0, 440.0, 466.16, 587.33];

  const init = () => {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = 0;
    analyser = ctx.createAnalyser(); analyser.fftSize = 512; tdata = new Uint8Array(analyser.fftSize);
    master.connect(analyser); analyser.connect(comp).connect(ctx.destination);
    ambBus = ctx.createGain(); ambBus.gain.value = 1; ambBus.connect(master);

    // generated hall reverb
    const conv = ctx.createConvolver();
    const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    conv.buffer = ir;
    wet = ctx.createGain(); wet.gain.value = .35;
    wet.connect(conv).connect(master);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  };

  const out = (node, send = 0) => {
    node.connect(master);
    if (send) { const s = ctx.createGain(); s.gain.value = send; node.connect(s).connect(wet); }
  };
  const noise = (loop = false) => { const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = loop; return n; };
  const env = (g, t, a, peak, d) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  };

  /* ---------- ambient bed ---------- */
  const ambient = () => {
    if (ambientStarted) return; ambientStarted = true;
    const t = ctx.currentTime;
    // low drone: two detuned saws through a breathing lowpass
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 240; lp.Q.value = 6;
    const lfo = ctx.createOscillator(); lfo.frequency.value = .06;
    const lfoG = ctx.createGain(); lfoG.gain.value = 120; lfo.connect(lfoG).connect(lp.frequency); lfo.start(t);
    const dg = ctx.createGain(); dg.gain.value = .07;
    [36.71, 36.9, 55.0].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = i === 2 ? "sine" : "sawtooth"; o.frequency.value = f; o.connect(lp); o.start(t);
    });
    lp.connect(dg); dg.connect(ambBus);
    // wind
    const wn = noise(true), bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 600; bp.Q.value = .8;
    const wl = ctx.createOscillator(); wl.frequency.value = .045; const wlg = ctx.createGain(); wlg.gain.value = 380;
    wl.connect(wlg).connect(bp.frequency); wl.start(t);
    const wg = ctx.createGain(); wg.gain.value = .035; wn.connect(bp).connect(wg); wg.connect(ambBus); wn.start(t);
    // koto plucks, forever
    const pluckLoop = () => {
      if (!ctx) return;
      if (on) {
        const n = SCALE[Math.floor(Math.random() * SCALE.length)];
        const amb = music ? .25 : 1;
        koto(n, .14 * amb);
        if (Math.random() < .35) setTimeout(() => koto(SCALE[Math.floor(Math.random() * SCALE.length)], .1 * amb), 180 + Math.random() * 260);
      }
      setTimeout(pluckLoop, 1400 + Math.random() * 3200);
    };
    setTimeout(pluckLoop, 1800);
  };

  /* ---------- instruments & SFX ---------- */
  function koto(f, vol = .16) {
    const t = ctx.currentTime;
    const g = ctx.createGain(); env(g, t, .004, vol, 2.6);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 1.6);
    [[1, "triangle", 1], [2, "sine", .45], [3.01, "sine", .18]].forEach(([m, type, a]) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f * m;
      const og = ctx.createGain(); og.gain.value = a; o.connect(og).connect(lp); o.start(t); o.stop(t + 3);
    });
    lp.connect(g); out(g, .6);
  }
  const S = {
    koto: () => koto(SCALE[5 + Math.floor(Math.random() * 5)], .2),
    biwa: () => { [0, 1, 2, 3].forEach((i) => setTimeout(() => koto(SCALE[[0, 2, 5, 7][i]] * .5, .26), i * 70)); },
    taiko: (vol = .9) => {
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + .45);
      const g = ctx.createGain(); env(g, t, .006, vol, .7); o.connect(g); out(g, .25); o.start(t); o.stop(t + 1);
      const n = noise(), lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 260;
      const ng = ctx.createGain(); env(ng, t, .002, vol * .5, .18); n.connect(lp).connect(ng); out(ng); n.start(t); n.stop(t + .3);
    },
    heartbeat: () => { S.taiko(.55); setTimeout(() => S.taiko(.4), 230); },
    slash: () => {
      const t = ctx.currentTime;
      const n = noise(), bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 2.5;
      bp.frequency.setValueAtTime(7000, t); bp.frequency.exponentialRampToValueAtTime(700, t + .28);
      const g = ctx.createGain(); env(g, t, .01, .9, .3); n.connect(bp).connect(g); out(g, .3); n.start(t); n.stop(t + .5);
      [3150, 4720].forEach((f, i) => {
        const o = ctx.createOscillator(); o.frequency.value = f; const og = ctx.createGain(); env(og, t + .05, .005, .05 - i * .02, 1.4);
        o.connect(og); out(og, .7); o.start(t); o.stop(t + 1.8);
      });
    },
    unsheathe: () => {
      const t = ctx.currentTime;
      const n = noise(), bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 6;
      bp.frequency.setValueAtTime(1800, t); bp.frequency.exponentialRampToValueAtTime(7500, t + .5);
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.35, t + .45); g.gain.exponentialRampToValueAtTime(.0001, t + .55);
      n.connect(bp).connect(g); out(g, .3); n.start(t); n.stop(t + .6);
      const o = ctx.createOscillator(); o.frequency.value = 3800; const og = ctx.createGain(); env(og, t + .5, .003, .04, 1.2); o.connect(og); out(og, .8); o.start(t); o.stop(t + 2);
    },
    whoosh: () => {
      const t = ctx.currentTime;
      const n = noise(), bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(250, t); bp.frequency.exponentialRampToValueAtTime(2400, t + .5);
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + .35); g.gain.exponentialRampToValueAtTime(.0001, t + .7);
      n.connect(bp).connect(g); out(g, .2); n.start(t); n.stop(t + .8);
    },
    thunder: () => {
      const t = ctx.currentTime;
      const n = noise(), lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t);
      for (let i = 0; i < 7; i++) { const tt = t + i * .045 + Math.random() * .03; g.gain.exponentialRampToValueAtTime(.4 + Math.random() * .5, tt); g.gain.exponentialRampToValueAtTime(.05, tt + .03); }
      g.gain.exponentialRampToValueAtTime(.0001, t + .6);
      n.connect(lp).connect(g); out(g, .4); n.start(t); n.stop(t + .7);
      const r = noise(), rl = ctx.createBiquadFilter(); rl.type = "lowpass"; rl.frequency.value = 140;
      const rg = ctx.createGain(); env(rg, t + .1, .2, 1.1, 2.4); r.connect(rl).connect(rg); out(rg, .5); r.start(t); r.stop(t + 3);
    },
    flame: () => {
      const t = ctx.currentTime;
      const n = noise(), lp = ctx.createBiquadFilter(); lp.type = "lowpass";
      lp.frequency.setValueAtTime(300, t); lp.frequency.exponentialRampToValueAtTime(1400, t + .8); lp.frequency.exponentialRampToValueAtTime(400, t + 1.8);
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.7, t + .7); g.gain.exponentialRampToValueAtTime(.0001, t + 2);
      n.connect(lp).connect(g); out(g, .3); n.start(t); n.stop(t + 2.1);
      S.taiko(.6);
    },
    eyes: () => {
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(48, t); o.frequency.linearRampToValueAtTime(62, t + 1.1);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(120, t); lp.frequency.exponentialRampToValueAtTime(900, t + 1.1);
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.35, t + 1.05); g.gain.exponentialRampToValueAtTime(.0001, t + 1.2);
      o.connect(lp).connect(g); out(g, .5); o.start(t); o.stop(t + 1.3);
      setTimeout(S.heartbeat, 1100);
    },
    gong: () => {
      const t = ctx.currentTime;
      [[98, .3, 5], [98 * 2.76, .12, 3.5], [98 * 5.4, .06, 2.4], [98 * 8.93, .03, 1.6], [98 * 1.5, .08, 4]].forEach(([f, a, d]) => {
        const o = ctx.createOscillator(); o.frequency.value = f; const g = ctx.createGain(); env(g, t, .01, a, d);
        o.connect(g); out(g, .8); o.start(t); o.stop(t + d + .2);
      });
    },
    tick: () => {
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.frequency.value = 1900 + Math.random() * 300; const g = ctx.createGain(); env(g, t, .002, .035, .06);
      o.connect(g); out(g, .2); o.start(t); o.stop(t + .1);
    }
  };

  const api = {
    get on() { return on; },
    start(withSound) {
      init(); if (!ctx) return;
      ambient();
      if (hasMusic && !music) {
        music = new Audio(MUSIC_SRC); music.loop = true; music.preload = "auto";
        const src = ctx.createMediaElementSource(music), mg = ctx.createGain(); mg.gain.value = .85;
        src.connect(mg).connect(master);
        ambBus.gain.value = .3;
        document.documentElement.classList.add("has-music");
      }
      api.set(withSound);
    },
    get hasMusic() { return !!music; },
    // 0..1 loudness of everything playing (score + SFX + music) — drives the visuals
    level() {
      if (!on || !analyser) return 0;
      const now = performance.now();
      if (now - lvlAt < 15) return lvl;
      lvlAt = now; analyser.getByteTimeDomainData(tdata);
      let sum = 0; for (let i = 0; i < tdata.length; i++) { const v = (tdata[i] - 128) / 128; sum += v * v; }
      const rms = Math.sqrt(sum / tdata.length);
      lvl += (Math.min(1, rms * 4.5) - lvl) * .35;
      return lvl;
    },
    set(v) {
      if (!ctx) { if (v) api.start(true); return; }
      on = v;
      if (on && ctx.state !== "running") ctx.resume();
      if (music) { if (on) music.play().catch(() => {}); else music.pause(); }
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(on ? .9 : 0, t + .6);
      document.documentElement.classList.toggle("sound-on", on);
      try { localStorage.setItem("innerve-sound", on ? "1" : "0"); } catch (e) {}
    },
    toggle() { api.set(!on); return on; },
    play(name, arg) {
      if (!on || !ctx || !S[name]) return;
      const now = performance.now();
      if (last[name] && now - last[name] < 140) return;
      last[name] = now;
      try { S[name](arg); } catch (e) {}
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });
  return api;
})();

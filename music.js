/* Innerve 11 — music source switch.
   Local: assets/audio/theme.mp3 (your own copy, never published) plays through audio.js.
   Public site: the official music videos stream through YouTube's embedded player (visible, ≥200×200,
   as YouTube requires). The nav ♪ control and the Sound button drive whichever source is active. */
(() => {
  const D = window.INNERVE || {};
  const LIST = D.youtube || (D.music && D.music.youtube) || [];
  const MEDLEY = D.medley, STARTS = (D.music && D.music.starts) || [0], NAMES = (D.music && D.music.titles) || [];
  let mode = MEDLEY ? "medley" : "playlist";
  const card = document.getElementById("yt");
  if (!card || !LIST.length) return;
  const $ = (id) => document.getElementById(id);
  let player = null, ready = false, wantPlay = false, active = false, minimised = false;

  const title = () => {
    let i = 0, name = "";
    if (mode === "medley") {
      const t = ready ? player.getCurrentTime() : 0;
      STARTS.forEach((s, k) => { if (t >= s - .5) i = k; });
      name = NAMES[i] || `Song ${i + 1}`;
    } else { i = ready ? Math.max(0, player.getPlaylistIndex()) : 0; name = LIST[i] ? LIST[i].title : ""; }
    const count = mode === "medley" ? STARTS.length : LIST.length;
    $("ytTitle").textContent = name;
    const idx = document.getElementById("npIdx"), tot = idx && idx.nextElementSibling, t = document.getElementById("npTitle");
    if (idx) idx.textContent = String(i + 1).padStart(2, "0");
    if (tot) tot.textContent = "/" + String(count).padStart(2, "0");
    if (t) t.textContent = name.split(" — ")[0];
  };

  const loadApi = () => {
    if (window.YT && window.YT.Player) return create();
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.async = true;
    document.head.appendChild(s);
    window.onYouTubeIframeAPIReady = create;
  };
  const create = () => {
    const opts = mode === "medley"
      ? { videoId: MEDLEY, playerVars: { rel: 0, modestbranding: 1, playsinline: 1, controls: 1, loop: 1, playlist: MEDLEY } }
      : { videoId: LIST[0].id, playerVars: { playlist: LIST.slice(1).map((v) => v.id).join(","), loop: 1, rel: 0, modestbranding: 1, playsinline: 1, controls: 1 } };
    player = new YT.Player("ytPlayer", {
      width: 200, height: 200, ...opts,
      events: {
        onReady: () => { ready = true; player.setVolume(70); title(); if (wantPlay) player.playVideo(); },
        onStateChange: (e) => { title(); if (e.data === 1) window.SFX && SFX.duck && SFX.duck(.08); if (e.data === 2 || e.data === 0) window.SFX && SFX.duck && SFX.duck(1); },
        // medley gone or blocked? fall back to the official videos
        onError: () => { if (mode === "medley" && LIST.length) { mode = "playlist"; player.loadPlaylist(LIST.map((v) => v.id)); title(); } }
      }
    });
  };
  // skip: jump between song markers in the medley, or between videos in the playlist
  const skip = (dir) => {
    if (!ready) return;
    if (mode === "medley") {
      const t = player.getCurrentTime(); let i = 0;
      STARTS.forEach((s, k) => { if (t >= s - .5) i = k; });
      const to = STARTS[(i + dir + STARTS.length) % STARTS.length];
      player.seekTo(to + .2, true);
    } else dir > 0 ? player.nextVideo() : player.previousVideo();
    setTimeout(title, 600);
  };

  const play = () => { wantPlay = true; if (ready && !minimised) player.playVideo(); };
  const pause = () => { wantPlay = false; if (ready) player.pauseVideo(); };

  // decide the source once the visitor enters: local file if it's there, else YouTube
  const activate = (withSound) => {
    if (window.SFX && SFX.hasLocalMusic) return;           // local medley handles itself
    active = true;
    document.documentElement.classList.add("has-music");
    card.classList.add("is-on");
    loadApi();
    if (withSound) play();
    setInterval(() => ready && title(), 1500);   // keep the title in step with the player
  };
  document.addEventListener("click", (e) => {
    const g = e.target.closest(".gate__btn"); if (!g || active) return;
    activate(g.dataset.sound === "1");
  });

  // nav ♪ next + sound toggle drive YouTube when it's the active source
  const np = document.getElementById("npNext");
  if (np) np.addEventListener("click", () => { if (active) skip(1); }, true);
  $("ytNext").addEventListener("click", () => skip(1));
  $("ytPrev").addEventListener("click", () => skip(-1));
  $("ytMin").addEventListener("click", () => {
    minimised = !minimised; card.classList.toggle("is-min", minimised);
    $("ytMin").textContent = minimised ? "+" : "–";
    // a hidden YouTube player must not keep playing
    if (minimised) { if (ready) player.pauseVideo(); } else if (wantPlay && ready) player.playVideo();
  });
  const snd = document.getElementById("snd");
  if (snd) snd.addEventListener("click", () => {
    if (!active) return;
    setTimeout(() => { (document.documentElement.classList.contains("sound-on") ? play : pause)(); }, 0);
  });
})();

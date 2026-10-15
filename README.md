# Innerve 11 — Demon Slayer edition

Personal, unpublished fan build of the Innerve 11 hackathon site (OSS Club, AIT Pune).
Contains official Demon Slayer artwork — keep this repo private.

## Run

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Static site, no build step. GSAP, Lenis and three.js load from CDNs.

## Files

| File | What it does |
|---|---|
| `index.html` / `styles.css` | Page structure and styling |
| `data.js` | All content: tracks, prizes, timeline, FAQ, sponsors, gallery |
| `main.js` | Scroll scenes (GSAP ScrollTrigger), loader/gate, HUD, eyes, easter egg |
| `castle.js` | 3D Infinity Castle flythrough (three.js + bloom) |
| `fx.js` | Global WebGL particles + nichirin cursor trail |
| `forms.js` | Breathing-technique cut-ins when you click a track |
| `audio.js` | Procedural score + SFX (Web Audio), audio-reactive level meter |
| `game.js` | "Slay the Upper Moons" swipe-to-slice mini-game |
| `crazy.js` | Impact frames, speed-line rush, biwa door teleports, Muzan's whips, Kasugai crow, kanji scramble, breathing badge |

## Music

Drop a track you own at `assets/audio/theme.mp3` — it plays after "Enter with sound",
the generated score ducks under it, and the visuals pulse to it. It is git-ignored.

## Secrets

Type `hinokami` anywhere on the page.

# Inventor's Lab: build, understand, invent

A screen-down robot-building app for children aged 5+. Offline-first PWA, vanilla JS, no accounts, no tracking, no network calls.

Created by **Anthony Onoja, PhD** · donmaston09@gmail.com · [Buy me a coffee](https://www.paypal.biz/Onoja412)

## What's in it
- 33 procedural 3D models (three.js r150) that spin, run, explode and show labels
- 502 missions across 10 volumes (Build, Understand, Invent), plus 15-minute quick builds, outdoor missions and build-together guides
- Build Mode (one big step at a time, en-GB read-aloud, dim mode, screen-break reminder)
- Household materials guide, inventor templates (printable), My Inventions, badges, passport, grown-ups area
- Interactive explainers: gears, levers, pulleys, circuits, belts

## Watch first, then build
Every mission opens with **Step 1 · Watch how it goes together**: the 3D model assembles itself part by part, with each step shown, spoken in an English voice and the materials highlighted. Then **Step 2 · Now you try** opens screen-down Build Mode. This is an animated 3D walkthrough generated for all 502 missions, not filmed footage.
To add a real filmed video for any mission, put an mp4 in a `videos/` folder next to the app and add a line to `INV.VIDEOS` at the end of `js/data-core.js`, for example `INV.VIDEOS["v3-04"] = "videos/v3-04.mp4";`. It then plays above the animation. (Host your own files rather than embedding YouTube, so the app stays free of tracking.)

## Run it
- Open `dist/inventors-lab.html` (single file, works offline), or
- `python3 -m http.server` in this folder and open http://localhost:8000 (enables the service worker / install).
- Phones/tablets: host the folder over HTTPS, open in the browser, "Add to Home Screen".

## Build
`node build.js` regenerates js/missions-all.js. `node build.js dist` also writes dist/inventors-lab.html.

## Tests
`node tests/models.test.js`, `node tests/content.test.js full`, `node tests/e2e.js <outdir>` (headless Chromium, tablet and phone sizes).

## Safety and privacy
AA batteries (max 3V) only; no button cells or mains. Steps starting "!" are grown-up jobs. Progress stays in localStorage on the device. No streaks or nudging. The grown-ups gate is a maths question, not security.

## Next steps
- Wrap with Capacitor for app stores.
- Models are procedural; to use Blender-authored models, export glTF and load with GLTFLoader inside INV.defModel.
- Not yet tested on real tablets/phones, and not yet reviewed by a child-safety/accessibility specialist.

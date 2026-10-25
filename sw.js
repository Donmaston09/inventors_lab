/* Offline-first service worker: precache the app shell, then cache-first. Bump VERSION to refresh. */
const VERSION = "inventorslab-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png", "css/app.css", "vendor/three.min.js", "js/models-core.js", "js/models-a.js", "js/models-b.js", "js/models-c.js", "js/viewer.js", "js/data-core.js", "js/missions.js", "js/missions-all.js", "js/sims.js", "js/templates.js", "js/app.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return res; }).catch(() => caches.match("index.html"))));
});

/* Inventor's Lab — app shell, router and views. Offline, no accounts, no tracking: everything stays on this device. */
(function () {
  "use strict";
  var INV = window.INV, V = INV.Viewer;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var app, cleanup = null;

  /* ---------- storage (all local, wrapped for private windows) ---------- */
  var KEY = "inventorslab.v1", store = { done: {}, have: {}, inv: [], fav: {}, last: "", prefs: { breakMin: 20, read: true, calm: false, easy: false, theme: "auto", name: "", wake: false } };
  function load() { try { var j = JSON.parse(localStorage.getItem(KEY) || "null"); if (j) { store = Object.assign(store, j); store.prefs = Object.assign({ breakMin: 20, read: true, calm: false, easy: false, theme: "auto", name: "", wake: false }, j.prefs || {}); } } catch (e) { } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { } }
  function applyPrefs() {
    var r = document.documentElement, p = store.prefs;
    r.dataset.calm = p.calm ? "1" : "0"; r.dataset.easy = p.easy ? "1" : "0";
    if (p.theme === "auto") delete r.dataset.theme; else r.dataset.theme = p.theme;
  }
  function doneOf(id) { return store.done[id] || {}; }
  function mark(id, stage) { var d = store.done[id] || (store.done[id] = {}); var first = !d[stage]; d[stage] = 1; save(); return first; }
  function countStage(st) { var n = 0; for (var k in store.done) if (store.done[k][st]) n++; return n; }

  /* ---------- helpers ---------- */
  function toast(msg) { var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); }
  function confetti() {
    if (store.prefs.calm) return;
    var c = document.createElement("div"); c.className = "confetti"; var cols = ["#ff7a2f", "#ffd43b", "#3a86ff", "#ef476f", "#06a77d", "#8338ec"];
    for (var i = 0; i < 60; i++) { var p = document.createElement("i"); p.style.left = Math.random() * 100 + "%"; p.style.background = cols[i % cols.length]; p.style.animationDelay = Math.random() * .5 + "s"; p.style.transform = "rotate(" + Math.random() * 360 + "deg)"; c.appendChild(p); }
    document.body.appendChild(c); setTimeout(function () { c.remove(); }, 2600);
  }
  var actx;
  function chime(notes) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); (notes || [660, 880, 1100]).forEach(function (f, i) { var o = actx.createOscillator(), g = actx.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, actx.currentTime + i * .18); g.gain.exponentialRampToValueAtTime(0.18, actx.currentTime + i * .18 + .03); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + i * .18 + .4); o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + i * .18); o.stop(actx.currentTime + i * .18 + .45); }); } catch (e) { } }
  function speak(text) {
    try {
      if (!("speechSynthesis" in window)) return; speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text).replace(/^!\s*/, "Grown-up job. ")); u.lang = "en-GB"; u.rate = 0.92;
      var vs = speechSynthesis.getVoices(); var v = vs.filter(function (x) { return /en-GB/i.test(x.lang); })[0]; if (v) u.voice = v; speechSynthesis.speak(u);
    } catch (e) { }
  }
  function stopSpeak() { try { speechSynthesis.cancel(); } catch (e) { } }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pick(arr, seed) { return arr[seed % arr.length]; }
  var MS = function () { return INV.MISSIONS; };
  function vol(n) { return INV.VOLS[n - 1]; }
  function volMissions(n) { return MS().filter(function (m) { return m.vol === n; }); }
  function modelOf(m) { return INV.models[m.model.split(":")[0]]; }
  function canMake(m) { return m.mats.every(function (n) { return (INV.MAT[n] && INV.MAT[n].x) || store.have[n]; }); }
  function missionOfDay() {
    var d = new Date(), key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    var pool = MS().filter(function (m) { return !INV.extras(m).length && m.lvl <= 2 && m.mins <= 45; });
    return pool[hashStr(key) % pool.length];
  }
  function surprise() {
    var pool = MS().filter(function (m) { return !doneOf(m.id).b; });
    var easy = pool.filter(function (m) { return canMake(m) && !INV.extras(m).length; });
    if (easy.length > 5 && Object.keys(store.have).length) pool = easy;
    var m = pool[Math.floor(Math.random() * pool.length)] || MS()[0]; location.hash = "#/m/" + m.id;
  }
  function pills(m) {
    var s = '<span class="pill">⏱ ' + m.mins + ' min</span>';
    if (INV.isQuick(m)) s += '<span class="pill q">⚡ Quick</span>';
    if (m.out) s += '<span class="pill o">🌳 Outdoor</span>';
    if (m.tog) s += '<span class="pill t">👨‍👩‍👧 Together</span>';
    if (INV.extras(m).length) s += '<span class="pill x">🔌 Little extras</span>';
    return s;
  }
  function mcard(m) {
    var d = doneOf(m.id), tick = d.b ? '<span class="tick" aria-label="Built">✓</span>' : "";
    return '<a class="card mcard" href="#/m/' + m.id + '">' + tick + '<img alt="" width="84" height="84" data-thumb="' + esc(m.model) + '" data-seed="' + m.id + '" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="><div><h3>' + esc(m.title) + '</h3><div class="meta">' + pills(m) + '</div></div></a>';
  }
  var ICON = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="12" width="56" height="44" rx="10" fill="#ffb347" stroke="#1f2a44" stroke-width="4"/><circle cx="22" cy="34" r="9" fill="#fff" stroke="#1f2a44" stroke-width="4"/><circle cx="42" cy="34" r="9" fill="#fff" stroke="#1f2a44" stroke-width="4"/><circle cx="22" cy="34" r="3" fill="#1f2a44"/><circle cx="42" cy="34" r="3" fill="#1f2a44"/><path d="M32 12V4" stroke="#1f2a44" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="4" r="3.5" fill="#ef476f" stroke="#1f2a44" stroke-width="2"/></svg>';

  /* ---------- shell ---------- */
  var TABS = [["#/", "🏠", "Home"], ["#/lab", "🧪", "Labs"], ["#/materials", "🧺", "Stuff"], ["#/invent", "💡", "Invent"], ["#/passport", "🏅", "Passport"], ["#/grownups", "👩‍👧", "Grown-ups"]];
  function shell(active) {
    var nav = $(".tabs-bar");
    if (!nav) { nav = document.createElement("nav"); nav.className = "tabs-bar"; nav.setAttribute("aria-label", "Main"); document.body.appendChild(nav); }
    nav.innerHTML = TABS.map(function (t) { var cur = (t[0] === "#/" ? active === "home" : active === t[0].slice(2)); return '<a href="' + t[0] + '"' + (cur ? ' aria-current="page"' : "") + '><span class="e">' + t[1] + '</span>' + t[2] + '</a>'; }).join("");
  }
  function page(html, active) { app.innerHTML = '<header class="top"><a class="logo" href="#/">' + ICON + '<span>Inventor’s Lab</span></a><span class="grow"></span></header><main id="main" tabindex="-1">' + html + '</main>'; shell(active); window.scrollTo(0, 0); INV.fillThumbs && INV.fillThumbs(app); }

  /* ---------- 3D viewer helper ---------- */
  function mountViewer(host, spec, seed, opts) {
    opts = opts || {};
    if (!V.mount(host, { select: opts.select, loaded: opts.loaded })) {
      host.innerHTML = '<div class="fallback"><div><div style="font-size:4rem">' + (opts.emoji || "🛠️") + '</div>3D view isn’t available on this device, but the instructions still work!</div></div>'; return false;
    }
    V.load(spec, seed); return true;
  }

  /* ---------- views ---------- */
  var views = {};

  views.home = function () {
    var md = missionOfDay(), last = store.last && INV.mission(store.last);
    var totalDone = countStage("b");
    page('<section class="hero"><div class="text"><p class="pill" style="background:#fff">Today’s mission</p><h1>' + esc(md.title) + '</h1><p>' + esc(md.why) + '</p><div class="row" style="margin-bottom:10px">' + pills(md) + '</div><div class="row"><a class="btn big" href="#/m/' + md.id + '">Let’s build! 🛠️</a>' + (last && last.id !== md.id ? '<a class="btn alt" href="#/m/' + last.id + '">Keep going: ' + esc(last.title) + '</a>' : "") + '</div></div><div class="stage" id="hero3d" aria-label="A spinning 3D model of today’s mission"></div></section>' +
      '<div class="quick-row"><button class="btn" id="b-surprise"><span class="e">🎲</span>Surprise me!</button><a class="btn alt" href="#/lab?f=quick"><span class="e">⚡</span>15-minute builds</a><a class="btn alt" href="#/lab?f=out"><span class="e">🌳</span>Outdoor missions</a><a class="btn alt" href="#/lab?f=make"><span class="e">🧺</span>What can I make now?</a><a class="btn alt" href="#/templates"><span class="e">🖨️</span>Inventor templates</a></div>' +
      '<h2>10 volumes: build, understand, invent</h2><p class="muted">' + MS().length + ' missions so far. ' + (totalDone ? "You have built " + totalDone + "!" : "Pick a volume to start.") + '</p><div class="grid g-vol">' + INV.VOLS.map(function (v) {
        var ms = volMissions(v.n), dn = ms.filter(function (m) { return doneOf(m.id).b; }).length;
        return '<a class="card vcard" href="#/vol/' + v.n + '"><div class="band" style="background:' + v.c + '"><span>Volume ' + v.n + '</span><span class="big">' + v.e + '</span></div><div class="body"><h3>' + esc(v.t) + '</h3><div class="muted">' + esc(v.s) + ' · Age ' + v.age + '</div><div class="muted" style="font-size:.9rem">' + ms.length + ' missions · ' + dn + ' built</div><div class="bar" aria-hidden="true"><i style="width:' + (ms.length ? Math.round(dn / ms.length * 100) : 0) + '%"></i></div></div></a>';
      }).join("") + '</div>', "home");
    $("#b-surprise").onclick = surprise;
    var h3 = $("#hero3d"); mountViewer(h3, md.model, md.id, { emoji: modelOf(md).meta.emoji, loaded: function () { V.setRun(!store.prefs.calm); V.setSpin(true); V.setLabels(false); } });
    cleanup = function () { V.unmount(); };
  };

  views.vol = function (n) {
    n = +n; var v = vol(n); if (!v) return location.replace("#/");
    var ms = volMissions(n);
    page('<p><a href="#/">← All volumes</a></p><div class="card" style="border-top:14px solid ' + v.c + '"><h1>' + v.e + ' Volume ' + n + ': ' + esc(v.t) + '</h1><p><b>' + esc(v.s) + '</b> · Age ' + v.age + '</p><p>' + esc(v.d) + '</p><p class="muted">You’ll practise: ' + v.sk.map(esc).join(", ") + '.</p></div><div id="list"></div>', "home");
    renderList($("#list"), { vol: n });
  };

  var F = { q: "", quick: false, out: false, tog: false, noex: false, make: false, vol: 0, lim: 36 };
  function renderList(host, base) {
    var f = Object.assign({}, F, base || {}); var lim = f.lim;
    host.innerHTML = '<div class="filters" role="group" aria-label="Filters"><input type="search" id="q" placeholder="Search missions…" aria-label="Search missions" value="' + esc(f.q) + '">' +
      [["quick", "⚡ 15 min"], ["out", "🌳 Outdoor"], ["tog", "👨‍👩‍👧 Together"], ["noex", "No extras"], ["make", "🧺 Can make now"]].map(function (x) { return '<button type="button" data-f="' + x[0] + '" aria-pressed="' + (!!f[x[0]]) + '">' + x[1] + '</button>'; }).join("") + '</div><div class="grid g-mis" id="grid"></div><p id="count" class="muted"></p><div class="row"><button class="btn alt" id="more" hidden>Show more</button></div>';
    function draw() {
      var q = f.q.trim().toLowerCase(), list = MS().filter(function (m) {
        if (base && base.vol && m.vol !== base.vol) return false; if (f.vol && m.vol !== f.vol) return false;
        if (f.quick && !INV.isQuick(m)) return false; if (f.out && !m.out) return false; if (f.tog && !m.tog) return false;
        if (f.noex && INV.extras(m).length) return false; if (f.make && !canMake(m)) return false;
        if (q && (m.title + " " + m.mats.join(" ") + " " + modelOf(m).meta.name).toLowerCase().indexOf(q) < 0) return false; return true;
      });
      $("#grid", host).innerHTML = list.slice(0, lim).map(mcard).join("") || '<p class="card">Nothing matches yet. Try fewer filters, or tick more things on the Stuff page.</p>';
      $("#count", host).textContent = list.length + " mission" + (list.length === 1 ? "" : "s");
      $("#more", host).hidden = list.length <= lim; INV.fillThumbs(host);
    }
    $("#q", host).addEventListener("input", function (e) { f.q = F.q = e.target.value; lim = 36; draw(); });
    $$("[data-f]", host).forEach(function (b) { b.onclick = function () { var k = b.dataset.f; f[k] = F[k] = !f[k]; b.setAttribute("aria-pressed", f[k]); lim = 36; draw(); }; });
    $("#more", host).onclick = function () { lim += 36; draw(); }; draw();
  }
  views.lab = function (arg, qs) {
    var p = {}; (qs || "").split("&").forEach(function (kv) { var a = kv.split("="); if (a[0]) p[a[0]] = a[1]; });
    if (p.f) { F.quick = p.f === "quick"; F.out = p.f === "out"; F.make = p.f === "make"; F.tog = false; F.noex = false; F.q = ""; }
    page('<h1>🧪 Labs</h1><p>Pick a mission from over ' + (Math.floor(MS().length / 50) * 50) + ' ideas. There’s always something new to try.</p><div class="filters" role="group" aria-label="Volume"><button data-vol="0" aria-pressed="' + (!F.vol) + '">All volumes</button>' + INV.VOLS.map(function (v) { return '<button data-vol="' + v.n + '" aria-pressed="' + (F.vol === v.n) + '">' + v.e + ' ' + v.n + '</button>'; }).join("") + '</div><div id="list"></div>', "lab");
    function r() { renderList($("#list"), {}); }
    $$("[data-vol]").forEach(function (b) { b.onclick = function () { F.vol = +b.dataset.vol; $$("[data-vol]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); r(); }; }); r();
  };

  /* ----- mission ----- */
  views.m = function (id, qs) {
    var m = INV.mission(id); if (!m) return location.replace("#/lab");
    store.last = id; save();
    var v = vol(m.vol), meta = modelOf(m).meta, d = doneOf(id), tab = (/tab=(\w+)/.exec(qs || "") || [])[1] || "build";
    page('<p><a href="#/vol/' + m.vol + '">← Volume ' + m.vol + ': ' + esc(v.t) + '</a></p><div class="mission"><div class="viewer-col"><div class="stage tall" id="stage"></div>' +
      '<div class="ctrls" role="group" aria-label="3D controls"><button class="chip-btn" id="c-run" aria-pressed="false">▶ Make it move</button><button class="chip-btn" id="c-spin" aria-pressed="true">🔄 Spin</button><button class="chip-btn" id="c-lab" aria-pressed="true">🏷 Parts</button><button class="chip-btn" id="c-reset">⟲ Reset</button><label>💥 Pull apart <input type="range" id="c-exp" min="0" max="100" value="0" aria-label="Pull the model apart"></label></div>' +
      '<div class="card partinfo" id="partinfo" aria-live="polite"><b>Drag to spin, pinch to zoom.</b> Tap a number to meet each part.</div></div>' +
      '<div class="info-col"><h1>' + esc(m.title) + '</h1><div class="row" style="margin-bottom:10px">' + pills(m) + '<span class="pill">' + meta.emoji + ' ' + esc(meta.name) + '</span></div>' +
      '<div class="mtabs" role="tablist"><button role="tab" data-t="build" aria-selected="false">🛠 Build' + (d.b ? '<span class="d">✓</span>' : "") + '</button><button role="tab" data-t="understand" aria-selected="false">🧠 Understand' + (d.u ? '<span class="d">✓</span>' : "") + '</button><button role="tab" data-t="invent" aria-selected="false">💡 Invent' + (d.i ? '<span class="d">✓</span>' : "") + '</button></div><div id="pane" class="card" role="tabpanel"></div></div></div>', "lab");
    var run = false, partList = [];
    var ok = mountViewer($("#stage"), m.model, m.id, {
      emoji: meta.emoji,
      select: function (i, part) { $$(".plabel").forEach(function (b, k) { b.classList.toggle("on", k === i); }); $("#partinfo").innerHTML = part ? '<b>' + (i + 1) + '. ' + esc(part.name) + '</b><br>' + esc(part.desc) : '<b>Drag to spin, pinch to zoom.</b> Tap a number to meet each part.'; },
      loaded: function (b) { partList = b.parts; V.setRun(!store.prefs.calm); run = !store.prefs.calm; $("#c-run").setAttribute("aria-pressed", run); $("#c-run").textContent = run ? "⏸ Pause" : "▶ Make it move"; }
    });
    if (ok) {
      $("#c-run").onclick = function () { run = !run; V.setRun(run); this.setAttribute("aria-pressed", run); this.textContent = run ? "⏸ Pause" : "▶ Make it move"; };
      $("#c-spin").onclick = function () { var s = !V.state().spin; V.setSpin(s); this.setAttribute("aria-pressed", s); };
      $("#c-lab").onclick = function () { var s = !V.state().labels; V.setLabels(s); this.setAttribute("aria-pressed", s); };
      $("#c-reset").onclick = function () { V.resetView(); V.select(-1); $("#c-exp").value = 0; V.setExplode(0); };
      $("#c-exp").oninput = function () { V.setExplode(this.value / 100); };
    } else $(".ctrls").style.display = "none";
    var tabs = $$(".mtabs button");
    function show(t) {
      tabs.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.t === t); });
      watchStop(); var pane = $("#pane"); pane.innerHTML = ""; tabFns[t](pane, m);
    }
    tabs.forEach(function (b) { b.onclick = function () { show(b.dataset.t); }; });
    show(tab);
    cleanup = function () { watchStop(); V.unmount(); stopSpeak(); };
  };


  /* ----- Watch first: the model assembles itself, step by step, with a voice ----- */
  var watchTmr = null, watchStop = function () { };
  function watchPanel(host, m, autoplay) {
    var steps = m.steps, n = steps.length, idx = -1, playing = false, slow = false, sound = store.prefs.read, finished = false;
    var vid = INV.VIDEOS && INV.VIDEOS[m.id];
    host.innerHTML = '<div class="card watch"><h2>🎬 Step 1 · Watch how it goes together</h2>' +
      '<p class="muted">Watch the 3D model build itself, one step at a time, with a voice to explain. Then put the screen down and try it yourself!</p>' +
      (vid ? '<video class="wvideo" controls playsinline preload="none" src="' + esc(vid) + '" aria-label="Real build video"></video><p class="muted">The video above shows the real build. The animation below shows it in 3D.</p>' : "") +
      '<div class="wcap" id="w-cap" aria-live="polite"><b>Press Watch to start.</b></div><div class="wmats" id="w-mats"></div>' +
      '<div class="wprog" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="0"><i id="w-bar"></i></div>' +
      '<div class="row"><button class="btn big" id="w-play">▶ Watch</button><button class="chip-btn" id="w-back" aria-label="Previous step">⏮ Back</button><button class="chip-btn" id="w-next" aria-label="Next step">Next ⏭</button>' +
      '<button class="chip-btn" id="w-slow" aria-pressed="false">🐢 Slower</button><button class="chip-btn" id="w-snd" aria-pressed="' + !!sound + '">🔊 Voice</button></div>' +
      '<div id="w-done" class="row" style="margin-top:12px"></div></div>';
    var cap = $("#w-cap", host), mats = $("#w-mats", host), bar = $("#w-bar", host), play = $("#w-play", host);
    function matsIn(t) {
      var low = t.toLowerCase();
      return m.mats.filter(function (x) { var k = x.toLowerCase().replace(/\s*\(.*\)/, ""); return low.indexOf(k) > -1 || low.indexOf(k.replace(/s$/, "")) > -1; });
    }
    function dur(t) { return (2200 + t.length * 85) * (slow ? 1.6 : 1); }
    function show(i) {
      idx = i; var t = steps[i], g = t[0] === "!", clean = g ? t.replace(/^!\s*/, "") : t;
      cap.innerHTML = '<span class="muted">Step ' + (i + 1) + ' of ' + n + '</span>' + (g ? ' <span class="gu-badge">grown-up job</span>' : "") + '<div class="wtxt">' + esc(clean) + '</div>';
      mats.innerHTML = matsIn(clean).map(function (x) { var mt = INV.MAT[x] || { e: "•" }; return '<span class="pill">' + mt.e + " " + esc(x) + '</span>'; }).join("");
      bar.style.width = Math.round((i + 1) / n * 100) + "%"; bar.parentNode.setAttribute("aria-valuenow", i + 1);
      V.setAssemble((i + 1) / n); V.setRun(false);
      if (sound && playing) speak(t);
    }
    function schedule() { clearTimeout(watchTmr); if (!playing) return; watchTmr = setTimeout(function () { if (idx < n - 1) { show(idx + 1); schedule(); } else finish(); }, dur(steps[idx])); }
    function finish() {
      playing = false; finished = true; clearTimeout(watchTmr); play.textContent = "↻ Watch again"; V.setAssemble(1);
      setTimeout(function () { V.setAssemble(null); V.setRun(true); }, 1200);
      cap.innerHTML = '<b>🎉 All built! Watch it move.</b><div class="wtxt">Now you try it. Gather your materials, put the screen down, and follow the same steps.</div>'; mats.innerHTML = "";
      store.watched = store.watched || {}; store.watched[m.id] = 1; save();
      $("#w-done", host).innerHTML = '<a class="btn big good" href="#/build/' + m.id + '?skip=1">🛠 Step 2 · Now you try!</a>';
    }
    function toggle() {
      if (finished || idx < 0) { finished = false; V.setRun(false); $("#w-done", host).innerHTML = ""; V.setAssemble(0); playing = true; play.textContent = "⏸ Pause"; show(0); schedule(); return; }
      playing = !playing; play.textContent = playing ? "⏸ Pause" : "▶ Keep watching";
      if (playing) { show(idx); schedule(); } else { clearTimeout(watchTmr); stopSpeak(); }
    }
    play.onclick = toggle;
    $("#w-next", host).onclick = function () { if (idx < n - 1) { finished = false; show(idx + 1); if (playing) schedule(); } else if (idx === n - 1) finish(); };
    $("#w-back", host).onclick = function () { if (idx > 0) { finished = false; V.setRun(false); show(idx - 1); if (playing) schedule(); } };
    $("#w-slow", host).onclick = function () { slow = !slow; this.setAttribute("aria-pressed", slow); if (playing) schedule(); };
    $("#w-snd", host).onclick = function () { sound = !sound; this.setAttribute("aria-pressed", sound); if (!sound) stopSpeak(); else if (playing) speak(steps[idx]); };
    watchStop = function () { playing = false; clearTimeout(watchTmr); stopSpeak(); V.setAssemble(null); watchStop = function () { }; };
    if (autoplay) setTimeout(toggle, 700);
  }

  var tabFns = {};
  tabFns.build = function (pane, m) {
    var ex = INV.extras(m), gu = m.steps.some(function (s) { return s[0] === "!"; });
    var h = '<div id="watchhost"></div>';
    if (m.tog) h += '<div class="callout"><b>👨‍👩‍👧 Build together.</b> You’re the Chief Inventor and make the decisions. Your grown-up is the Safety Officer and helps with the jobs marked <span class="gu-badge">grown-up</span>.</div>';
    if (ex.length) h += '<div class="callout safe"><b>🔌 Little extras needed:</b> ' + ex.map(esc).join(", ") + '. A grown-up should check every circuit. Use only AA batteries in a holder (3 V). Never use button batteries or mains power.</div>';
    h += '<h2>What you need</h2><ul class="mats">' + m.mats.map(function (n) {
      var mt = INV.MAT[n] || { e: "•", t: "" }, x = mt.x;
      return '<li><label><input type="checkbox" data-mat="' + esc(n) + '"' + (store.have[n] ? " checked" : "") + '><span>' + mt.e + " " + esc(n) + '</span>' + (x ? '<span class="xt">little extra</span>' : "") + '</label></li>';
    }).join("") + '</ul><p class="muted">Basics: ' + INV.BASICS.join(", ") + '.</p>';
    h += '<h2>Steps</h2><ol class="steps">' + m.steps.map(function (s) { var g = s[0] === "!"; return '<li' + (g ? ' class="gu"' : "") + '><div>' + (g ? '<span class="gu-badge">grown-up</span>' : "") + esc(g ? s.replace(/^!\s*/, "") : s) + '</div></li>'; }).join("") + '</ol>';
    h += '<div class="row"><a class="btn big" href="#/build/' + m.id + '?skip=1">▶ Step 2 · Step-by-step mode</a><button class="btn good" id="done-b">I built it! ✅</button></div><p class="muted" style="margin-top:10px">Tip: step-by-step mode reads each step aloud, so you can put the screen down and build.</p>';
    pane.innerHTML = h; watchStop(); watchPanel($("#watchhost", pane), m, /[?&]watch=1/.test(location.hash));
    $$("[data-mat]", pane).forEach(function (c) { c.onchange = function () { if (c.checked) store.have[c.dataset.mat] = 1; else delete store.have[c.dataset.mat]; save(); }; });
    $("#done-b", pane).onclick = function () { finish(m, "b", "Built! Now find out how it works…"); };
  };
  tabFns.understand = function (pane, m) {
    var meta = modelOf(m).meta, sc = INV.SCI[meta.science] || INV.SCI.control, h = '<h2>🧠 ' + esc(sc.t) + '</h2><div class="words">' + sc.big.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join("") + '</div>';
    h += '<p>' + esc(sc.say) + '</p><div class="callout"><b>Why it works in this build:</b> ' + esc(m.why) + '</div><div class="callout"><b>Look closely:</b> ' + esc(sc.look) + '</div>';
    var sim = INV.SIMS[meta.science] || INV.SIMS[(meta.science === "lever" && "lever") || ""];
    if (sim && INV.sims.has(sim)) h += '<h3>Try it yourself</h3><div id="sim"></div>';
    h += '<h3>Pull it apart</h3><p>Slide <b>💥 Pull apart</b> under the 3D model and name each part. Which part does the moving? Which part holds still?</p>';
    h += '<h3>Experiments to try</h3><ol class="steps">' + sc.tests.map(function (t) { return '<li><div>' + esc(t) + '</div></li>'; }).join("") + '</ol>';
    h += '<button class="btn good" id="done-u">I understand it! 🧠</button>'; pane.innerHTML = h;
    if (sim && INV.sims.has(sim)) INV.sims.mount(sim, $("#sim", pane));
    $("#done-u", pane).onclick = function () { finish(m, "u", "Brilliant thinking! Now make it your own…"); };
  };
  tabFns.invent = function (pane, m) {
    var mine = store.inv.filter(function (x) { return x.mid === m.id; });
    var h = '<h2>💡 Your invention challenge</h2><div class="callout"><b>' + esc(m.invent) + '</b></div><p>Real inventors sketch, build, test and improve. Draw your idea on the <a href="#/t/blueprint">Invention Blueprint</a> before you start, and write what happened in the <a href="#/t/testlog">Test Log</a>.</p>' +
      '<label for="inv-t"><b>Name my invention</b></label><input type="text" id="inv-t" maxlength="60" placeholder="e.g. The Super Snapper 3000"><label for="inv-n" style="display:block;margin-top:8px"><b>What I changed and what happened</b></label><textarea id="inv-n" maxlength="600" placeholder="I changed… and then…"></textarea><div class="row" style="margin-top:10px"><button class="btn" id="inv-s">Save my invention</button><button class="btn good" id="done-i">I invented! 💡</button></div>';
    if (mine.length) h += '<h3 style="margin-top:16px">My inventions for this mission</h3>' + mine.map(function (x) { return '<div class="card" style="margin-bottom:8px"><b>' + esc(x.t) + '</b><br>' + esc(x.n) + '<br><small class="muted">' + esc(x.d) + '</small></div>'; }).join("");
    pane.innerHTML = h;
    $("#inv-s", pane).onclick = function () { var t = $("#inv-t", pane).value.trim(); if (!t) { toast("Give your invention a name first!"); return; } store.inv.unshift({ mid: m.id, t: t, n: $("#inv-n", pane).value.trim(), d: new Date().toLocaleDateString("en-GB") }); save(); toast("Saved in My Inventions 🎉"); tabFns.invent(pane, m); };
    $("#done-i", pane).onclick = function () { finish(m, "i", "You’re an inventor!"); };
  };
  function finish(m, st, msg) {
    var first = mark(m.id, st); if (first) { confetti(); chime(); }
    toast(msg); var all = doneOf(m.id);
    var tabs = $$(".mtabs button"); tabs.forEach(function (b) { var k = { build: "b", understand: "u", invent: "i" }[b.dataset.t]; if (all[k] && !$(".d", b)) b.insertAdjacentHTML("beforeend", '<span class="d">✓</span>'); });
    var next = { b: "understand", u: "invent" }[st]; if (next) { tabs.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.t === next); }); var pane = $("#pane"); pane.innerHTML = ""; tabFns[next](pane, m); pane.scrollIntoView({ behavior: "smooth", block: "start" }); }
    checkBadges();
  }

  /* ----- build mode ----- */
  views.build = function (id) {
    var m = INV.mission(id); if (!m) return location.replace("#/lab");
    shell("lab"); var i = 0, dim = false, wl = null, read = store.prefs.read, tmr = null, started = Date.now(), breakShown = false;
    app.innerHTML = ""; var bm = document.createElement("div"); bm.className = "bm"; bm.setAttribute("role", "dialog"); bm.setAttribute("aria-label", "Step-by-step build"); document.body.appendChild(bm);
    function wake(on) { try { if (on && navigator.wakeLock) navigator.wakeLock.request("screen").then(function (l) { wl = l; }); else if (wl) { wl.release(); wl = null; } } catch (e) { } }
    var intro = !(store.watched && store.watched[m.id]) && !/skip=1/.test(location.hash);
    function drawIntro() {
      bm.innerHTML = '<div class="head"><a class="chip-btn" href="#/m/' + m.id + '" id="bm-x" aria-label="Close">✕</a></div><div class="step"><div class="n">' + esc(m.title) + '</div><div class="txt">Want to watch how it goes together first?</div><p class="muted" style="font-size:1.1rem">It takes about a minute. Watching first makes the building much easier.</p><div class="row"><a class="btn big good" href="#/m/' + m.id + '?watch=1">🎬 Watch first (recommended)</a><button class="btn alt big" id="bm-skip">Skip, let’s build</button></div></div>';
      $("#bm-skip").onclick = function () { intro = false; draw(); say(); }; $("#bm-x").onclick = function () { end(); };
    }
    function draw() {
      if (intro) return drawIntro();
      var s = m.steps[i], g = s[0] === "!", last = i === m.steps.length - 1;
      bm.innerHTML = '<div class="head"><a class="chip-btn" href="#/m/' + m.id + '" id="bm-x" aria-label="Close step-by-step">✕</a><div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="' + m.steps.length + '" aria-valuenow="' + (i + 1) + '"><i style="width:' + Math.round((i + 1) / m.steps.length * 100) + '%"></i></div><button class="chip-btn" id="bm-read" aria-pressed="' + read + '">🔊</button><button class="chip-btn" id="bm-dim" aria-pressed="' + dim + '">🌙</button></div>' +
        '<div class="step"><div class="n">' + esc(m.title) + ' · Step ' + (i + 1) + ' of ' + m.steps.length + '</div>' + (g ? '<div><span class="gu-badge" style="font-size:1rem;padding:4px 14px">Grown-up job</span></div>' : "") + '<div class="txt">' + esc(g ? s.replace(/^!\s*/, "") : s) + '</div>' +
        (i === 0 ? '<div class="callout"><b>You need:</b> ' + m.mats.map(esc).join(", ") + '</div>' : "") + '</div><div class="nav"><button class="btn alt big" id="bm-back"' + (i ? "" : " disabled") + '>← Back</button><button class="btn big' + (last ? " good" : "") + '" id="bm-next">' + (last ? "I built it! 🎉" : "Next →") + '</button></div>' +
        '<div class="mini"><button class="chip-btn" id="bm-wake" aria-pressed="' + !!wl + '">☀️ Keep screen on</button> <span class="muted">Put the screen down and build. Tap Next when you’re ready.</span></div>';
      bm.classList.toggle("dim", dim);
      $("#bm-back").onclick = function () { if (i) { i--; draw(); say(); } };
      $("#bm-next").onclick = function () { if (last) { stopSpeak(); end(); location.hash = "#/m/" + m.id + "?tab=understand"; mark(m.id, "b"); confetti(); chime(); checkBadges(); } else { i++; draw(); say(); } };
      $("#bm-read").onclick = function () { read = !read; store.prefs.read = read; save(); if (read) say(); else stopSpeak(); this.setAttribute("aria-pressed", read); };
      $("#bm-dim").onclick = function () { dim = !dim; bm.classList.toggle("dim", dim); this.setAttribute("aria-pressed", dim); };
      $("#bm-wake").onclick = function () { wake(!wl); this.setAttribute("aria-pressed", !!wl); setTimeout(function () { $("#bm-wake") && $("#bm-wake").setAttribute("aria-pressed", !!wl); }, 300); };
      $("#bm-x").onclick = function () { end(); };
      var nx = $("#bm-next"); nx && nx.focus({ preventScroll: true });
    }
    function say() { if (read) speak(m.steps[i]); }
    function end() { stopSpeak(); wake(false); clearInterval(tmr); bm.remove(); }
    tmr = setInterval(function () { if (!breakShown && (Date.now() - started) / 60000 >= store.prefs.breakMin) { breakShown = true; screenBreak(function () { started = Date.now(); breakShown = false; }); } }, 15000);
    draw(); if (!intro) say(); cleanup = function () { end(); };
  };
  function screenBreak(after) {
    chime([880, 660, 880]); var b = document.createElement("div"); b.className = "break"; b.setAttribute("role", "alertdialog"); b.setAttribute("aria-label", "Screen break");
    b.innerHTML = '<div class="in"><div class="e">🙌</div><h1>Screen break!</h1><p style="font-size:1.3rem">Put the screen down for a few minutes. Build something, stretch, look out of the window, or get a drink.</p><button class="btn big good" id="br-ok">I’m ready to come back</button></div>';
    document.body.appendChild(b); $("#br-ok", b).focus(); $("#br-ok", b).onclick = function () { b.remove(); after && after(); };
  }

  /* ----- materials guide ----- */
  views.materials = function () {
    var cats = Object.keys(INV.MAT_CATS), n = Object.keys(store.have).length;
    var h = '<h1>🧺 Household Materials Guide</h1><p>Everything here is stuff most homes already have. Tick what you’ve got and the Labs will show what you can make <b>right now</b>. Always ask a grown-up before taking things, and wash and dry anything that held food.</p><div class="row" style="margin-bottom:14px"><a class="btn" href="#/lab?f=make">🧺 What can I make? (<span id="hc">' + n + '</span> ticked)</a><a class="btn alt" href="#/t/hunt">🔍 Print the scavenger hunt</a></div><div class="callout"><b>Always in the toolbox:</b> ' + INV.BASICS.join(", ") + '.</div>';
    cats.forEach(function (c) {
      var items = INV.MATS.filter(function (m) { return m.c === c; });
      h += '<section class="mat-cat"><h2>' + INV.MAT_CATS[c] + '</h2>' + (c === "electric" ? '<p class="muted">A starter pack costs roughly £10 to £15 online or at a hobby shop. You can also salvage motors from old toys with a grown-up. Only for Volumes 3 and 6 to 10; AA batteries and 3 volts only. Never use button batteries.</p>' : "") + '<div class="mat-grid">' + items.map(function (m) { return '<label class="mat"><span class="e">' + m.e + '</span><span><b>' + esc(m.n) + '</b><small>' + esc(m.t) + '</small></span><input type="checkbox" data-mat="' + esc(m.n) + '"' + (store.have[m.n] ? " checked" : "") + ' aria-label="I have ' + esc(m.n) + '"></label>'; }).join("") + '</div></section>';
    });
    page(h, "materials");
    $$("[data-mat]").forEach(function (c) { c.onchange = function () { if (c.checked) store.have[c.dataset.mat] = 1; else delete store.have[c.dataset.mat]; save(); $("#hc").textContent = Object.keys(store.have).length; }; });
  };

  /* ----- invent studio ----- */
  views.invent = function () {
    var S = INV.SPIN; page('<h1>💡 Invent Studio</h1><p>No robot experience needed. Spin the reels for an idea, then make it real.</p><div class="spin-row"><div class="reel" id="r1"><small>Problem to solve</small><b>?</b></div><div class="reel" id="r2"><small>Use this mechanism</small><b>?</b></div><div class="reel" id="r3"><small>Built from</small><b>?</b></div></div><div class="row" style="margin:14px 0"><button class="btn big" id="spin">🎰 Spin the ideas!</button><button class="btn alt" id="spin-save">Save this idea</button><a class="btn alt" href="#/t/blueprint">📐 Blueprint</a></div><div id="idea-out"></div><h2>My Inventions</h2><div id="mine"></div>', "invent");
    var cur = null;
    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    $("#spin").onclick = function () {
      var rs = [["#r1", S.problem], ["#r2", S.mech], ["#r3", S.mat]], n = 0; var t = setInterval(function () { rs.forEach(function (r) { var e = $(r[0]); e.classList.add("spinning"); $("b", e).textContent = rnd(r[1]); }); if (++n > 10) { clearInterval(t); rs.forEach(function (r) { $(r[0]).classList.remove("spinning"); }); cur = "An invention to " + $("#r1 b").textContent + ", using " + $("#r2 b").textContent + ", built from " + $("#r3 b").textContent + "."; $("#idea-out").innerHTML = '<div class="callout"><b>Your challenge:</b> ' + esc(cur) + ' Sketch it first, build a quick version, test it, then make it better!</div>'; chime([700, 900]); } }, 90);
    };
    $("#spin-save").onclick = function () { if (!cur) { toast("Spin first!"); return; } store.inv.unshift({ mid: "", t: "Spun idea", n: cur, d: new Date().toLocaleDateString("en-GB") }); save(); toast("Saved!"); drawMine(); };
    function drawMine() { $("#mine").innerHTML = store.inv.length ? store.inv.slice(0, 40).map(function (x, k) { var m = x.mid && INV.mission(x.mid); return '<div class="card" style="margin-bottom:8px"><b>' + esc(x.t) + '</b>' + (m ? ' <span class="muted">from ' + esc(m.title) + '</span>' : "") + '<br>' + esc(x.n) + '<br><small class="muted">' + esc(x.d) + '</small> <button class="chip-btn" data-del="' + k + '" aria-label="Delete this invention">🗑</button></div>'; }).join("") : '<p class="muted">Nothing here yet. Save your first idea!</p>'; $$("[data-del]").forEach(function (b) { b.onclick = function () { store.inv.splice(+b.dataset.del, 1); save(); drawMine(); }; }); }
    drawMine();
  };

  /* ----- templates ----- */
  views.templates = function () {
    page('<h1>🖨️ Inventor Templates</h1><p>Print on A4 at <b>100% / Actual size</b>. Stick sheets to thin card (cereal box) with a glue stick before cutting.</p><div class="grid g-vol">' + INV.templateList.map(function (k) { var t = INV.templates[k]; return '<a class="card tpl" href="#/t/' + k + '"><span class="e">' + t.e + '</span><span><b>' + esc(t.t) + '</b><br><span class="muted">' + esc(t.d) + '</span></span></a>'; }).join("") + '</div>', "templates");
  };
  views.t = function (k) {
    var t = INV.templates[k]; if (!t) return location.replace("#/templates");
    var name = store.prefs.name, count = countStage("b");
    page('<p><a href="#/templates">← All templates</a></p><h1>' + t.e + ' ' + esc(t.t) + '</h1><p>' + esc(t.d) + '</p>' + (k === "certificate" ? '<p><label for="cn"><b>Inventor’s name</b></label><input id="cn" type="text" maxlength="30" value="' + esc(name) + '" placeholder="Type a name"></p>' : "") + '<div class="row" style="margin-bottom:14px"><button class="btn big" id="print">🖨️ Print</button></div><div class="card" id="prev" style="padding:8px;max-width:520px;background:#fff"></div>', "templates");
    function r() { $("#prev").innerHTML = t.svg({ name: store.prefs.name || "Inventor", count: count }); $("#prev svg").removeAttribute("width"); $("#prev svg").removeAttribute("height"); $("#prev svg").style.width = "100%"; }
    if (k === "certificate") $("#cn").oninput = function () { store.prefs.name = this.value; save(); r(); }; r();
    $("#print").onclick = function () { var pa = $("#printArea"); pa.innerHTML = t.svg({ name: store.prefs.name || "Inventor", count: count }); window.print(); };
  };

  /* ----- passport ----- */
  function earned() {
    var b = 0, u = 0, i = 0, q = 0, o = 0, e = 0, t = 0, s = 0;
    MS().forEach(function (m) { var d = doneOf(m.id); if (d.b) { b++; if (INV.isQuick(m)) q++; if (m.out) o++; if (INV.extras(m).length) e++; if (m.tog) t++; } if (d.u) u++; if (d.i) i++; if (d.b && d.u && d.i) s++; });
    var has = { first: b >= 1, b5: b >= 5, b15: b >= 15, b40: b >= 40, b100: b >= 100, u10: u >= 10, i10: i >= 10, q10: q >= 10, o5: o >= 5, e5: e >= 5, t5: t >= 5, s10: s >= 10 };
    return { has: has, b: b, u: u, i: i };
  }
  function checkBadges() { var cur = earned().has, seen = store.badges || {}; INV.BADGES.forEach(function (bd) { if (cur[bd.id] && !seen[bd.id]) { seen[bd.id] = 1; setTimeout(function () { toast("New badge: " + bd.e + " " + bd.t + "!"); }, 900); } }); store.badges = seen; save(); }
  views.passport = function () {
    var e = earned();
    page('<h1>🏅 Inventor Passport</h1><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr));margin-bottom:18px"><div class="card stat"><b>' + e.b + '</b>Built</div><div class="card stat"><b>' + e.u + '</b>Understood</div><div class="card stat"><b>' + e.i + '</b>Invented</div><div class="card stat"><b>' + store.inv.length + '</b>Inventions saved</div></div><h2>Badges</h2><div class="badge-grid">' + INV.BADGES.map(function (b) { return '<div class="badge' + (e.has[b.id] ? "" : " locked") + '"><span class="e">' + b.e + '</span><b>' + esc(b.t) + '</b><br><small>' + esc(b.d) + '</small></div>'; }).join("") + '</div><p class="muted" style="margin-top:14px">No streaks and no pressure. Come back whenever you like.</p><p><a class="btn" href="#/t/certificate">🏅 Print my certificate</a></p>', "passport");
  };

  /* ----- grown-ups ----- */
  var CUR = [["Design & Technology", "Mechanisms: levers, linkages, sliders, wheels and axles (KS1); gears, pulleys, cams, simple circuits and control (KS2). Design, make and evaluate."], ["Science", "Forces, friction, air and water resistance (Y3, Y5); levers, pulleys and gears (Y5); simple circuits (Y4, Y6); light and shadows (Y3, Y6); materials (Y1 to Y2)."], ["Computing", "Control and sensing ideas (inputs, decisions, outputs). Sensors and simple logic in Volume 8. Optional programmable boards."], ["Maths", "Measuring length and time, comparing results, charts, ratio and proportion (gears and pulleys), estimation."]];
  views.grownups = function () {
    var ok = false; try { ok = sessionStorage.getItem("gu") === "1"; } catch (e) { }
    var p = store.prefs;
    var h = '<h1>👩‍👧 Grown-ups</h1><p>Welcome! Inventor’s Lab is designed to get children <b>off the screen</b> and building. The app is the guide; the real fun happens on the table.</p>' +
      '<details open><summary>Build-together guide</summary><div><p><b>Roles.</b> The child is the <b>Chief Inventor</b>: they choose, build and decide. You are the <b>Safety Officer and Assistant</b>: you do the jobs marked grown-up (poking holes, snipping skewer points, inflating balloons, checking circuits) and hold things steady.</p><ul><li><b>Let them struggle a little.</b> Wobbly first versions are the point. Try “What do you notice?” and “What could we change?” before offering a fix.</li><li><b>Set up a tray</b> or a table cloth, a bag for off-cuts, and a shoebox to keep half-finished inventions.</li><li><b>Use the 15-minute filter</b> (⚡) on school nights and bigger builds at weekends.</li><li><b>Build, Understand, Invent.</b> After building, spend two minutes on the Understand tab, then ask: “How could we make it better?”</li><li><b>Screen-down tip:</b> use Step-by-step mode with read-aloud on, then put the device on a stand or shelf.</li><li><b>Praise effort and ideas,</b> not just the finished machine.</li></ul></div></details>' +
      '<details><summary>Safety rules (please read)</summary><div>' + INV.SAFETY.map(function (s) { return '<p><b>' + s.e + ' ' + esc(s.t) + '.</b> ' + esc(s.d) + '</p>'; }).join("") + '</div></details>' +
      '<details><summary>Curriculum links (England)</summary><div>' + CUR.map(function (c) { return '<p><b>' + c[0] + ':</b> ' + esc(c[1]) + '</p>'; }).join("") + '<p class="muted">These are helpful connections, not a lesson plan. Volumes 1 to 2 suit ages 5+, 3 and 9 suit 6+, 4 to 6 suit 7+, 7 to 8 suit 8+, and 10 suits 9+.</p></div></details>' +
      '<details><summary>Privacy and data</summary><div><p>There are <b>no accounts, no adverts, no analytics and no network calls</b>. Progress and saved inventions are stored only on this device (in the browser’s local storage). You can export, import or delete it below. This follows the spirit of the UK Children’s Code (age-appropriate design): no nudging, no streaks, no data collection.</p></div></details>' +
      '<details><summary>About the creator</summary><div><p><b>Inventor’s Lab</b> was created by <b>Anthony Onoja, PhD</b>.</p><p>Email: <a href="mailto:donmaston09@gmail.com">donmaston09@gmail.com</a></p><p>Enjoying it? <a href="https://www.paypal.biz/Onoja412" target="_blank" rel="noopener noreferrer">☕ Buy me a coffee</a> (opens PayPal in a new tab, a grown-up decision).</p><p class="muted">© Anthony Onoja, PhD. The app itself never sends anything anywhere; these links only open if you tap them.</p></div></details>' +
      '<details><summary>Install it like an app</summary><div><p><b>iPad / iPhone (Safari):</b> Share → Add to Home Screen. <b>Android / Chrome:</b> menu → Install app. <b>Computer:</b> use the install icon in the address bar. After the first load it works fully offline.</p></div></details>';
    if (!ok) {
      var a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
      h += '<div class="card"><h2>🔒 Settings (grown-ups only)</h2><p>To open settings, what is <b>' + a + ' × ' + b + '</b>?</p><div class="row"><input type="text" inputmode="numeric" id="gate" style="max-width:120px" aria-label="Answer"><button class="btn" id="gate-ok">Open</button></div><p class="muted">This is a speed bump for little fingers, not security.</p></div>';
      page(h, "grownups"); $("#gate-ok").onclick = function () { if (+$("#gate").value === a * b) { try { sessionStorage.setItem("gu", "1"); } catch (e) { } views.grownups(); } else toast("Not quite, try again"); };
      return;
    }
    h += '<div class="card"><h2>⚙️ Settings</h2>' +
      '<p><label><input type="checkbox" id="s-read"' + (p.read ? " checked" : "") + '> Read steps aloud in step-by-step mode</label></p><p><label><input type="checkbox" id="s-calm"' + (p.calm ? " checked" : "") + '> Calm mode (no confetti, models start still, quieter colours)</label></p><p><label><input type="checkbox" id="s-easy"' + (p.easy ? " checked" : "") + '> Easy-read text (bigger, roomier)</label></p>' +
      '<p><label>Theme <select id="s-theme"><option value="auto">Match my device</option><option value="light">Light</option><option value="dark">Dark</option></select></label></p><p><label>Screen-break reminder every <select id="s-break">' + [10, 15, 20, 30, 45].map(function (n) { return '<option value="' + n + '"' + (p.breakMin === n ? " selected" : "") + '>' + n + ' minutes</option>'; }).join("") + '</select></label></p>' +
      '<div class="row"><button class="btn alt" id="s-exp">⬇ Export progress</button><label class="btn alt" for="s-imp">⬆ Import progress</label><input type="file" id="s-imp" accept="application/json" hidden><button class="btn alt" id="s-reset">🗑 Reset everything</button><button class="btn alt" id="s-lock">🔒 Lock settings</button></div></div>';
    page(h, "grownups"); $("#s-theme").value = p.theme;
    $("#s-read").onchange = function () { p.read = this.checked; save(); }; $("#s-calm").onchange = function () { p.calm = this.checked; save(); applyPrefs(); }; $("#s-easy").onchange = function () { p.easy = this.checked; save(); applyPrefs(); };
    $("#s-theme").onchange = function () { p.theme = this.value; save(); applyPrefs(); }; $("#s-break").onchange = function () { p.breakMin = +this.value; save(); };
    $("#s-exp").onclick = function () { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(store)], { type: "application/json" })); a.download = "inventors-lab-progress.json"; a.click(); };
    $("#s-imp").onchange = function () { var f = this.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { try { var j = JSON.parse(r.result); if (j && j.done) { store = Object.assign(store, j); save(); applyPrefs(); toast("Progress imported"); views.grownups(); } else toast("That file doesn’t look right"); } catch (e) { toast("Couldn’t read that file"); } }; r.readAsText(f); };
    $("#s-reset").onclick = function () { if (confirm("Delete all progress and saved inventions on this device?")) { try { localStorage.removeItem(KEY); } catch (e) { } location.reload(); } };
    $("#s-lock").onclick = function () { try { sessionStorage.removeItem("gu"); } catch (e) { } views.grownups(); };
  };

  /* ---------- router ---------- */
  function route() {
    if (cleanup) { try { cleanup(); } catch (e) { } cleanup = null; }
    var hsh = location.hash || "#/", qi = hsh.indexOf("?"), qs = qi >= 0 ? hsh.slice(qi + 1) : "", path = (qi >= 0 ? hsh.slice(0, qi) : hsh).replace(/^#\/?/, "").split("/");
    var name = path[0] || "home", fn = views[name] || views.home;
    try { fn(path[1], qs); } catch (e) { console.error(e); app.innerHTML = '<div class="card"><h1>Oops!</h1><p>Something went wrong. <a href="#/">Go home</a></p></div>'; }
    var mn = $("#main"); if (mn) mn.focus({ preventScroll: true });
  }
  /* global gentle break reminder (counts visible time only) */
  var used = 0; setInterval(function () { if (document.visibilityState === "visible" && !$(".bm") && !$(".break")) { used += 15; if (used / 60 >= store.prefs.breakMin * 2) { used = 0; screenBreak(); } } }, 15000);

  window.addEventListener("hashchange", route);
  window.addEventListener("DOMContentLoaded", function () {
    app = $("#app"); load(); applyPrefs();
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) navigator.serviceWorker.register("sw.js").catch(function () { });
    route();
  });
  INV._app = { store: function () { return store; }, route: route };
})();

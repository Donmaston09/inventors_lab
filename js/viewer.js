/* Inventor's Lab — 3D viewer (turntable, orbit, pinch-zoom, pull-apart, labels, thumbnails) */
(function () {
  "use strict";
  var INV = window.INV, T = window.THREE;

  INV.webgl = function () {
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  };

  /* ---------- environment for metal reflections ---------- */
  function makeEnv(renderer) {
    var c = document.createElement("canvas"); c.width = 512; c.height = 256;
    var g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.42, "#fff1d6"); gr.addColorStop(0.5, "#d9c4a0"); gr.addColorStop(1, "#4d3f30");
    g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    g.fillStyle = "rgba(255,255,255,.95)"; g.fillRect(50, 40, 100, 40); g.fillRect(300, 28, 120, 36);
    g.fillStyle = "rgba(170,205,255,.8)"; g.fillRect(190, 60, 64, 30);
    var tex = new T.CanvasTexture(c); tex.mapping = T.EquirectangularReflectionMapping; tex.encoding = T.sRGBEncoding;
    var pm = new T.PMREMGenerator(renderer), env = pm.fromEquirectangular(tex).texture; tex.dispose(); pm.dispose();
    return env;
  }

  /* ---------- ground textures ---------- */
  var groundTexCache = {};
  function wrapDraw(g, fn) { for (var dx = -256; dx <= 256; dx += 256) for (var dy = -256; dy <= 256; dy += 256) { g.save(); g.translate(dx, dy); fn(); g.restore(); } }
  function groundTex(kind) {
    if (groundTexCache[kind]) return groundTexCache[kind];
    var c = document.createElement("canvas"); c.width = c.height = 256; var g = c.getContext("2d");
    if (kind === "mat") {
      g.fillStyle = "#1f6b75"; g.fillRect(0, 0, 256, 256);
      for (var i = 0; i <= 5; i++) {
        g.strokeStyle = i === 0 ? "rgba(190,240,232,.95)" : "rgba(130,205,205,.55)"; g.lineWidth = i === 0 ? 4 : 2;
        g.beginPath(); g.moveTo(i * 51.2, 0); g.lineTo(i * 51.2, 256); g.moveTo(0, i * 51.2); g.lineTo(256, i * 51.2); g.stroke();
      }
      g.fillStyle = "rgba(255,255,255,.35)";
      for (var k = 1; k < 5; k++) { g.fillRect(k * 51.2 - 1, 0, 2, 9); g.fillRect(0, k * 51.2 - 1, 9, 2); }
    } else if (kind === "water") {
      g.fillStyle = "#2f86c9"; g.fillRect(0, 0, 256, 256);
      var r = INV.rng(5);
      for (var n = 0; n < 34; n++) {
        var x = r() * 256, y = r() * 256, w = 24 + r() * 40;
        wrapDraw(g, function () { g.strokeStyle = "rgba(190,230,255," + (0.25 + r() * 0.3) + ")"; g.lineWidth = 3; g.beginPath(); g.arc(x, y, w, 3.3, 5.9); g.stroke(); });
      }
    } else {
      g.fillStyle = "#68a63a"; g.fillRect(0, 0, 256, 256);
      var q = INV.rng(9);
      for (var b = 0; b < 700; b++) {
        var bx = q() * 256, by = q() * 256, h = 6 + q() * 12, l = q();
        wrapDraw(g, function () { g.strokeStyle = l > 0.5 ? "rgba(120,190,70,.8)" : "rgba(60,120,35,.7)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + (l - 0.5) * 5, by - h); g.stroke(); });
      }
    }
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    groundTexCache[kind] = t; return t;
  }

  /* ---------- stage: scene + lights + turntable ---------- */
  function makeStage(renderer, opts) {
    opts = opts || {};
    var scene = new T.Scene();
    scene.environment = makeEnv(renderer);
    var hemi = new T.HemisphereLight(0xfff2dc, 0x7a6850, 0.62); scene.add(hemi);
    var key = new T.DirectionalLight(0xffffff, 1.0); key.position.set(3.5, 7, 4.5); key.castShadow = true;
    key.shadow.mapSize.set(opts.shadow || 2048, opts.shadow || 2048);
    var sc = key.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 20;
    key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; key.shadow.radius = 3;
    scene.add(key);
    var fill = new T.DirectionalLight(0x9ec8ff, 0.3); fill.position.set(-5, 3, -2); scene.add(fill);
    var rim = new T.DirectionalLight(0xffd8a0, 0.4); rim.position.set(0, 3, -6); scene.add(rim);
    var pivot = new T.Group(); scene.add(pivot);
    var platMat = new T.MeshStandardMaterial({ roughness: 0.95, metalness: 0 });
    var disc = new T.Mesh(new T.CircleGeometry(1, 72), platMat); disc.rotation.x = -Math.PI / 2; disc.receiveShadow = true; pivot.add(disc);
    var rim3 = new T.Mesh(new T.TorusGeometry(1, 0.06, 10, 72), new T.MeshStandardMaterial({ color: 0xf3e3c3, roughness: 0.6 }));
    rim3.rotation.x = Math.PI / 2; rim3.castShadow = false; rim3.receiveShadow = true; pivot.add(rim3);
    var cam = new T.PerspectiveCamera(32, 1, 0.1, 80);
    var st = { scene: scene, camera: cam, pivot: pivot, key: key, hemi: hemi, fill: fill, rim: rim, disc: disc, rim3: rim3, platMat: platMat, content: null, R: 3, kind: "" };
    st.setGround = function (kind, R) {
      st.R = R; disc.scale.set(R, R, 1); rim3.scale.set(R, R, R);
      if (kind !== st.kind) { st.kind = kind; platMat.map = groundTex(kind); platMat.roughness = kind === "water" ? 0.35 : 0.95; platMat.needsUpdate = true; }
      platMat.map.repeat.set((2 * R) / 2.5, (2 * R) / 2.5);
    };
    st.setModel = function (built) {
      if (st.content) { pivot.remove(st.content); disposeObj(st.content); st.content = null; }
      if (built) { pivot.add(built.root); st.content = built.root; st.setGround(built.ground, built.platR); }
    };
    return st;
  }
  function disposeObj(o) {
    o.traverse(function (m) {
      if (m.isMesh) {
        if (m.geometry && !m.geometry.userData.shared) { if (m.geometry.dispose) m.geometry.dispose(); }
        if (m.userData && m.userData.hl && m.material && m.material.dispose) m.material.dispose();
      }
    });
  }

  /* ---------- the interactive viewer (single shared canvas) ---------- */
  var V = {
    renderer: null, stage: null, host: null, canvas: null, raf: 0, last: 0,
    built: null, ph: 0, run: 0, runT: 0, spin: true, spinT: 0, yaw: 0.7, pitch: 0.42, zoom: 1, baseDist: 8, tgt: new T.Vector3(0, 1, 0),
    explodeT: 0, explode: 0, labelsOn: true, sel: -1, labelEls: [], labelHost: null, frame: 0, groundOff: 0, avg: 0.016, pr: 1, cb: {}, ro: null,
    ptrs: {}, vel: 0, lastInteract: 0, reduce: false, highlighted: []
  };

  function ensureRenderer() {
    if (V.renderer) return true;
    if (!INV.webgl()) return false;
    var cvs = document.createElement("canvas"); cvs.className = "v-canvas"; cvs.setAttribute("aria-label", "3D model. Drag to spin, pinch to zoom."); cvs.setAttribute("role", "img");
    var r;
    try { r = new T.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true, powerPreference: "high-performance" }); } catch (e) { return false; }
    r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.NoToneMapping; r.toneMappingExposure = 0.92;
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap; r.setClearColor(0x000000, 0);
    V.pr = Math.min(window.devicePixelRatio || 1, 2); r.setPixelRatio(V.pr);
    V.renderer = r; V.canvas = cvs;
    V.stage = makeStage(r, { shadow: (window.innerWidth < 700 ? 1024 : 2048) });
    V.reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    V.spin = !V.reduce;
    cvs.style.touchAction = "none";
    cvs.addEventListener("pointerdown", onDown); cvs.addEventListener("pointermove", onMove);
    cvs.addEventListener("pointerup", onUp); cvs.addEventListener("pointercancel", onUp);
    cvs.addEventListener("wheel", function (e) { e.preventDefault(); V.zoom = INV.L.clamp(V.zoom * Math.exp(e.deltaY * 0.0012), 0.55, 1.9); touch(); }, { passive: false });
    cvs.addEventListener("dblclick", function () { V.resetView(); });
    cvs.addEventListener("webglcontextlost", function (e) { e.preventDefault(); });
    return true;
  }
  function touch() { V.lastInteract = performance.now(); }

  var tapStart = null;
  function onDown(e) {
    V.canvas.setPointerCapture && V.canvas.setPointerCapture(e.pointerId);
    V.ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    tapStart = { x: e.clientX, y: e.clientY, t: performance.now(), n: Object.keys(V.ptrs).length };
    touch(); V.vel = 0;
  }
  function onMove(e) {
    var p = V.ptrs[e.pointerId]; if (!p) return;
    var ids = Object.keys(V.ptrs);
    if (ids.length === 1) {
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      V.yaw += dx * 0.009; V.vel = dx * 0.009;
      V.pitch = INV.L.clamp(V.pitch + dy * 0.006, 0.08, 1.3);
    } else if (ids.length === 2) {
      var other = V.ptrs[ids[0] == e.pointerId ? ids[1] : ids[0]];
      var d0 = Math.hypot(p.x - other.x, p.y - other.y), d1 = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      if (d0 > 5) V.zoom = INV.L.clamp(V.zoom * (d0 / d1), 0.55, 1.9);
    }
    p.x = e.clientX; p.y = e.clientY; touch();
  }
  function onUp(e) {
    var had = V.ptrs[e.pointerId]; delete V.ptrs[e.pointerId];
    if (had && tapStart && tapStart.n === 1 && Object.keys(V.ptrs).length === 0) {
      var moved = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y), dt = performance.now() - tapStart.t;
      if (moved < 7 && dt < 450) pick(e.clientX, e.clientY);
    }
    touch();
  }

  var ray = new T.Raycaster(), ndc = new T.Vector2();
  function pick(cx, cy) {
    if (!V.built) return;
    var r = V.canvas.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, V.stage.camera);
    var hits = ray.intersectObjects(V.built.parts.map(function (p) { return p.obj; }), true), idx = -1;
    for (var h = 0; h < hits.length && idx < 0; h++) {
      var o = hits[h].object;
      while (o && idx < 0) { for (var i = 0; i < V.built.parts.length; i++) if (V.built.parts[i].obj === o) { idx = i; break; } o = o.parent; }
    }
    V.select(idx);
  }

  V.select = function (i) {
    V.clearHighlight();
    V.sel = i;
    if (i >= 0 && V.built && V.built.parts[i]) {
      V.built.parts[i].obj.traverse(function (m) {
        if (m.isMesh && !m.userData.hl && m.material && m.material.emissive) {
          m.userData.orig = m.material; var c = m.material.clone(); c.emissive.setHex(0xffa800); c.emissiveIntensity = 0.5; m.material = c; m.userData.hl = 1; V.highlighted.push(m);
        }
      });
    }
    V.labelEls.forEach(function (el, k) { el.classList.toggle("on", k === i); });
    if (V.cb.select) V.cb.select(i, i >= 0 && V.built ? V.built.parts[i] : null);
  };
  V.clearHighlight = function () {
    V.highlighted.forEach(function (m) { if (m.userData.orig) { m.material.dispose(); m.material = m.userData.orig; m.userData.hl = 0; m.userData.orig = null; } });
    V.highlighted = [];
  };

  V.resetView = function () { V.yaw = 0.7; V.pitch = 0.42; V.zoom = 1; touch(); };

  function frameModel() {
    var b = V.built, cam = V.stage.camera;
    var w = V.host ? V.host.clientWidth : 600, h = V.host ? V.host.clientHeight : 400, asp = w / Math.max(1, h);
    cam.aspect = asp; cam.updateProjectionMatrix();
    if (b) { var f = INV.frame(b, asp, cam.fov); V.baseDist = f.dist; V.tgt.set(0, f.ty, 0); }
    else { V.baseDist = 9; V.tgt.set(0, 1, 0); }
  }

  function resize() {
    if (!V.host || !V.renderer) return;
    var w = V.host.clientWidth, h = V.host.clientHeight; if (w < 4 || h < 4) return;
    V.renderer.setSize(w, h, false); frameModel();
  }

  /* ---------- labels ---------- */
  function buildLabels() {
    if (V.labelHost) { V.labelHost.innerHTML = ""; }
    V.labelEls = [];
    if (!V.labelHost || !V.built) return;
    V.built.parts.forEach(function (p, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "plabel"; b.textContent = String(i + 1);
      b.setAttribute("aria-label", "Part " + (i + 1) + ": " + p.name);
      b.addEventListener("click", function (ev) { ev.stopPropagation(); V.select(V.sel === i ? -1 : i); });
      V.labelHost.appendChild(b); V.labelEls.push(b);
    });
    V.labelHost.style.display = V.labelsOn ? "" : "none";
  }
  var _box = new T.Box3(), _c = new T.Vector3();
  function updateLabels() {
    if (!V.labelsOn || !V.built || !V.host) return;
    var w = V.host.clientWidth, h = V.host.clientHeight, cam = V.stage.camera;
    V.built.parts.forEach(function (p, i) {
      var el = V.labelEls[i]; if (!el) return;
      _box.setFromObject(p.obj); _box.getCenter(_c);
      if (p.big) _c.y = _box.max.y - (_box.max.y - _box.min.y) * 0.35;
      _c.project(cam);
      var x = (_c.x * 0.5 + 0.5) * w, y = (-_c.y * 0.5 + 0.5) * h;
      el.style.transform = "translate(" + Math.round(x - 15) + "px," + Math.round(y - 15) + "px)";
      el.style.opacity = _c.z > 1 ? 0 : 1;
    });
  }

  /* ---------- public API ---------- */
  V.available = function () { return INV.webgl(); };

  V.mount = function (host, cb) {
    if (!ensureRenderer()) return false;
    V.unmount();
    V.host = host; V.cb = cb || {};
    host.appendChild(V.canvas);
    V.labelHost = document.createElement("div"); V.labelHost.className = "v-labels"; host.appendChild(V.labelHost);
    if (window.ResizeObserver) { V.ro = new ResizeObserver(resize); V.ro.observe(host); }
    resize();
    V.last = performance.now(); V.raf = requestAnimationFrame(loop);
    return true;
  };
  V.unmount = function () {
    cancelAnimationFrame(V.raf); V.raf = 0;
    if (V.ro) { V.ro.disconnect(); V.ro = null; }
    V.clearHighlight();
    if (V.canvas && V.canvas.parentNode) V.canvas.parentNode.removeChild(V.canvas);
    if (V.labelHost && V.labelHost.parentNode) V.labelHost.parentNode.removeChild(V.labelHost);
    V.host = null; V.labelHost = null; V.cb = {}; V.ptrs = {};
    if (V.stage) V.stage.setModel(null);
    V.built = null; V.sel = -1;
  };
  V.load = function (spec, seed) {
    if (!V.stage) return null;
    V.clearHighlight(); V.sel = -1;
    var b = INV.build(spec, seed);
    V.built = b; V.stage.setModel(b);
    V.ph = b.meta.rest || 0; V.run = 0; V.runT = 0; V.explode = 0; V.explodeT = 0; V.groundOff = 0; V.asm = null; V.asmT = null; V._wasAsm = false;
    V.resetView(); frameModel(); buildLabels();
    if (V.cb.loaded) V.cb.loaded(b);
    return b;
  };
  V.setSpin = function (on) { V.spin = !!on; touch(); };
  V.setRun = function (on) { V.runT = on ? 1 : 0; };
  V.setExplode = function (k) { V.explodeT = k; };
  /* Assembly "watch" mode: parts appear one by one (p from 0 to 1); null switches it off */
  V.setAssemble = function (p) { if (p == null) { V.asmT = null; V.asm = null; } else { if (V.asm == null) V.asm = 0; V.asmT = p; } touch(); };
  V.setLabels = function (on) { V.labelsOn = !!on; if (V.labelHost) V.labelHost.style.display = on ? "" : "none"; };
  V.state = function () { return { spin: V.spin, run: V.runT > 0, labels: V.labelsOn, explode: V.explodeT }; };
  V.parts = function () { return V.built ? V.built.parts : []; };

  function loop(now) {
    V.raf = requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - V.last) / 1000); V.last = now;
    if (!V.built || !V.renderer) return;
    // adaptive quality
    V.avg = V.avg * 0.95 + dt * 0.05; V.frame++;
    if (V.frame % 90 === 0 && V.avg > 0.034 && V.pr > 1) { V.pr = Math.max(1, V.pr - 0.25); V.renderer.setPixelRatio(V.pr); resize(); }
    // spin / inertia
    var idle = now - V.lastInteract > 1800 && Object.keys(V.ptrs).length === 0;
    if (V.spin && idle && !V.reduce) V.yaw += dt * 0.38;
    if (Object.keys(V.ptrs).length === 0 && Math.abs(V.vel) > 0.0004) { V.yaw += V.vel * 0.9; V.vel *= 0.92; }
    // run animation
    V.run += (V.runT - V.run) * (1 - Math.exp(-dt * 4));
    if (Math.abs(V.runT - V.run) < 0.002) V.run = V.runT;
    V.ph += dt * V.run;
    var out = V.built.update(V.ph, V.run, dt, V) || {};
    if (out.light !== undefined) { V.stage.key.intensity = 1.0 * out.light; V.stage.hemi.intensity = 0.62 * out.light + 0.06; V._lit = true; }
    else if (V._lit) { V.stage.key.intensity = 1.0; V.stage.hemi.intensity = 0.62; V._lit = false; }
    if (out.speed) { V.groundOff += out.speed * dt; V.stage.platMat.map.offset.x = V.groundOff / 2.5; }
    // explode
    if (V.asm != null && V.built) {
      V.asm += (V.asmT - V.asm) * (1 - Math.exp(-dt * 2.6));
      if (Math.abs(V.asmT - V.asm) < 0.0005) V.asm = V.asmT;
      var pn = V.built.parts.length, ax = V.asm * pn;
      V.built.parts.forEach(function (pt, j) {
        var t = Math.max(0, Math.min(1, ax - j)); t = t * t * (3 - 2 * t);
        pt.obj.visible = t > 0.02; pt.obj.position.copy(pt.base).addScaledVector(pt.ex, (1 - t) * 1.5);
      });
      V._wasAsm = true; touch();
    } else {
      if (V._wasAsm && V.built) { V.built.parts.forEach(function (pt) { pt.obj.visible = true; pt.obj.position.copy(pt.base); }); V._wasAsm = false; }
      V.explode += (V.explodeT - V.explode) * (1 - Math.exp(-dt * 6));
      if (V.explode > 0.002 || V._wasExploded) {
        INV.explode(V.built, V.explode * 1.0); V._wasExploded = V.explode > 0.002;
      }
    }
    // camera
    var st = V.stage, cam = st.camera, d = V.baseDist * V.zoom;
    st.pivot.rotation.y = V.yaw;
    cam.position.set(V.tgt.x, V.tgt.y + Math.sin(V.pitch) * d, V.tgt.z + Math.cos(V.pitch) * d);
    cam.lookAt(V.tgt);
    V.renderer.render(st.scene, cam);
    if (V.frame % 4 === 0) updateLabels();
  }

  /* ---------- thumbnails (separate small context, cached) ---------- */
  var TH = { r: null, st: null, cache: {}, q: [], busy: false };
  function thumbInit() {
    if (TH.r) return true;
    if (!INV.webgl()) return false;
    var c = document.createElement("canvas"), r;
    try { r = new T.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return false; }
    r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.NoToneMapping; r.toneMappingExposure = 0.92;
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap; r.setPixelRatio(1); r.setSize(240, 240, false); r.setClearColor(0x000000, 0);
    TH.r = r; TH.st = makeStage(r, { shadow: 1024 }); TH.st.camera.aspect = 1; TH.st.camera.updateProjectionMatrix();
    return true;
  }
  function renderThumb(spec, seed, restPhase) {
    var b = INV.build(spec, seed), st = TH.st;
    st.setModel(b);
    b.update(restPhase !== undefined ? restPhase : (b.meta.rest || 0), 0, 0.016);
    st.pivot.rotation.y = 0.75;
    var cam = st.camera, f = INV.frame(b, 1, cam.fov), d = f.dist;
    cam.position.set(0, f.ty + Math.sin(0.5) * d, Math.cos(0.5) * d); cam.lookAt(0, f.ty, 0);
    TH.r.render(st.scene, cam);
    var url = TH.r.domElement.toDataURL("image/png");
    st.setModel(null);
    return url;
  }
  INV.thumbSync = function (spec, seed) {
    var k = spec + "|" + (seed || "");
    if (TH.cache[k]) return TH.cache[k];
    if (!thumbInit()) return null;
    try { TH.cache[k] = renderThumb(spec, seed); } catch (e) { return null; }
    return TH.cache[k];
  };
  /* Fill <img data-thumb="model" data-seed="..."> lazily, a few per frame */
  INV.fillThumbs = function (root) {
    var imgs = (root || document).querySelectorAll("img[data-thumb]:not([data-done])");
    var list = Array.prototype.slice.call(imgs);
    function step() {
      var n = 0;
      while (list.length && n < 2) {
        var im = list.shift(); if (!im.isConnected) continue;
        var url = INV.thumbSync(im.getAttribute("data-thumb"), im.getAttribute("data-seed") || "");
        if (url) { im.src = url; } im.setAttribute("data-done", "1"); n++;
      }
      if (list.length) setTimeout(step, 16);
    }
    step();
  };
  INV.Viewer = V;
  INV._makeStage = makeStage; INV._disposeObj = disposeObj;
})();

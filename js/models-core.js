/* Inventor's Lab — 3D model core library
   Procedural modelling on top of three.js (WebGL). Everything is generated in code,
   so the whole 33-model gallery is tiny, works offline and animates in real time.
   Unit: 1 unit = 10 cm. */
(function () {
  "use strict";
  var T = window.THREE;
  var INV = (window.INV = window.INV || {});
  INV.models = {};
  INV.modelOrder = [];

  /* ---------- seeded randomness ---------- */
  function hash(str) {
    var h = 2166136261;
    str = String(str);
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  INV.hash = hash; INV.rng = rng;

  /* Bottle-cap colour palettes: a,b = cap colours, c = body paint, d = accent */
  var PALS = [
    { n: "Sunny", a: 0xe4572e, b: 0x29335c, c: 0xf3a712, d: 0x7bc67b },
    { n: "Ocean", a: 0x1b998b, b: 0xf46036, c: 0x2e86ab, d: 0xffd166 },
    { n: "Berry", a: 0xc2185b, b: 0x6a4c93, c: 0xe56b8f, d: 0x8ac926 },
    { n: "Forest", a: 0x3a7d44, b: 0xf2c14e, c: 0x6aa84f, d: 0xe76f51 },
    { n: "Rocket", a: 0xd62828, b: 0xf7f7f7, c: 0x1d3557, d: 0xfcbf49 },
    { n: "Grape", a: 0x7b2cbf, b: 0xffd60a, c: 0x8f63d6, d: 0x00b4d8 },
    { n: "Mint", a: 0x1b998b, b: 0xff9f1c, c: 0x4ecdc4, d: 0xe71d36 },
    { n: "Tangerine", a: 0xfb8500, b: 0x023047, c: 0xf2a900, d: 0x219ebc },
    { n: "Bubblegum", a: 0xf72585, b: 0x4cc9f0, c: 0xf48fb1, d: 0x3a0ca3 },
    { n: "Lime", a: 0x80b918, b: 0x2b2d42, c: 0x9acd32, d: 0xef476f }
  ];
  INV.PALS = PALS;

  /* ---------- textures (only when a DOM exists) ---------- */
  var _cardTex = null, _cardBump = null;
  function makeCardTex() {
    if (_cardTex || typeof document === "undefined") return;
    var c = document.createElement("canvas"); c.width = c.height = 256;
    var g = c.getContext("2d");
    g.fillStyle = "#cfa468"; g.fillRect(0, 0, 256, 256);
    var r = rng(7);
    for (var i = 0; i < 2600; i++) {
      var v = r();
      g.fillStyle = v > 0.5 ? "rgba(120,80,35," + (0.05 + r() * 0.09) + ")" : "rgba(255,230,180," + (0.04 + r() * 0.08) + ")";
      g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 2);
    }
    g.fillStyle = "rgba(90,55,20,0.05)";
    for (var x = 0; x < 256; x += 4) g.fillRect(x, 0, 1.5, 256);
    _cardTex = new T.CanvasTexture(c);
    _cardTex.wrapS = _cardTex.wrapT = T.RepeatWrapping;
    _cardTex.repeat.set(0.8, 0.8);
    _cardTex.encoding = T.sRGBEncoding;
    _cardTex.anisotropy = 4;
    var b = document.createElement("canvas"); b.width = b.height = 128;
    var bg = b.getContext("2d"); bg.fillStyle = "#808080"; bg.fillRect(0, 0, 128, 128);
    for (var y = 0; y < 128; y += 3) { bg.fillStyle = (y / 3) % 2 ? "#9a9a9a" : "#6e6e6e"; bg.fillRect(0, y, 128, 1.6); }
    _cardBump = new T.CanvasTexture(b);
    _cardBump.wrapS = _cardBump.wrapT = T.RepeatWrapping;
    _cardBump.repeat.set(1, 1);
  }

  /* ---------- materials ---------- */
  var MATS = null, paintCache = {};
  function std(o) { if (o.envMapIntensity === undefined) o.envMapIntensity = (o.metalness || 0) > 0.5 ? 1.0 : 0.4; return new T.MeshStandardMaterial(o); }
  function mats() {
    if (MATS) return MATS;
    makeCardTex();
    var cardOpts = { color: 0xd3a96d, roughness: 0.95, metalness: 0 };
    if (_cardTex) { cardOpts.map = _cardTex; cardOpts.bumpMap = _cardBump; cardOpts.bumpScale = 0.25; }
    MATS = {
      card: std(cardOpts),
      tube: std({ color: 0xcda467, roughness: 0.9 }),
      cardIn: std({ color: 0xe6c696, roughness: 0.95 }),
      cardDark: std({ color: 0xb48a52, roughness: 0.95 }),
      paper: std({ color: 0xf7f2e8, roughness: 0.9 }),
      metal: std({ color: 0xcfd4d8, metalness: 0.85, roughness: 0.28 }),
      steel: std({ color: 0x8a9399, metalness: 0.8, roughness: 0.38 }),
      brass: std({ color: 0xc9a23c, metalness: 0.8, roughness: 0.35 }),
      foil: std({ color: 0xeef1f3, metalness: 1, roughness: 0.22 }),
      wood: std({ color: 0xe5c490, roughness: 0.8 }),
      skewer: std({ color: 0xd2a869, roughness: 0.85 }),
      rubber: std({ color: 0x25272b, roughness: 0.75 }),
      band: std({ color: 0xe8a33d, roughness: 0.55 }),
      black: std({ color: 0x2a2c31, roughness: 0.6 }),
      pcb: std({ color: 0x1f7a52, roughness: 0.55 }),
      white: std({ color: 0xffffff, roughness: 0.4 }),
      pupil: std({ color: 0x15151a, roughness: 0.3 }),
      sponge: std({ color: 0xf2cf3f, roughness: 1 }),
      wireR: std({ color: 0xd7263d, roughness: 0.5 }),
      wireK: std({ color: 0x1b1b1e, roughness: 0.5 }),
      wireY: std({ color: 0xf0b429, roughness: 0.5 }),
      wireB: std({ color: 0x2f80ed, roughness: 0.5 }),
      clear: new T.MeshStandardMaterial({ color: 0xdff0ff, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.32, depthWrite: false }),
      water: new T.MeshStandardMaterial({ color: 0x3fa0ff, roughness: 0.15, transparent: true, opacity: 0.75, depthWrite: false }),
      grass: std({ color: 0x7cb342, roughness: 1 }),
      stone: std({ color: 0x9a9690, roughness: 1 }),
      glow: new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false })
    };
    return MATS;
  }
  function paint(c, o) {
    o = o || {};
    var k = c + "_" + (o.m || 0) + "_" + (o.r || 0);
    if (!paintCache[k]) paintCache[k] = std({ color: c, roughness: o.r !== undefined ? o.r : 0.55, metalness: o.m || 0 });
    return paintCache[k];
  }
  function capMat(c) { return paint(c, { r: 0.32, m: 0.15 }); }
  function ledMat(c) {
    return new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0, roughness: 0.25, transparent: true, opacity: 0.92 });
  }
  function balloonMat(c) {
    return new T.MeshPhysicalMaterial({ color: c, roughness: 0.22, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.15, transparent: true, opacity: 0.92 });
  }
  INV.mats = mats; INV.paint = paint;

  /* ---------- tiny mesh helpers ---------- */
  var V3 = function (x, y, z) { return new T.Vector3(x || 0, y || 0, z || 0); };
  function mesh(g, m, x, y, z) {
    var o = new T.Mesh(g, m);
    o.position.set(x || 0, y || 0, z || 0);
    o.castShadow = true; o.receiveShadow = true;
    return o;
  }
  var BX = function (w, h, d, m, x, y, z) { return mesh(new T.BoxGeometry(w, h, d), m, x, y, z); };
  var CY = function (r, h, m, x, y, z, s) { return mesh(new T.CylinderGeometry(r, r, h, s || 28), m, x, y, z); };
  var CYT = function (rTop, rBot, h, m, x, y, z, s) { return mesh(new T.CylinderGeometry(rTop, rBot, h, s || 28), m, x, y, z); };
  var CX = function (r, len, m, x, y, z, s) { var g = new T.CylinderGeometry(r, r, len, s || 20); g.rotateZ(Math.PI / 2); return mesh(g, m, x, y, z); };
  var CZ = function (r, len, m, x, y, z, s) { var g = new T.CylinderGeometry(r, r, len, s || 20); g.rotateX(Math.PI / 2); return mesh(g, m, x, y, z); };
  var SP = function (r, m, x, y, z, a, b) { return mesh(new T.SphereGeometry(r, a || 24, b || 16), m, x, y, z); };
  var TOR = function (R, r, m, x, y, z, s) { return mesh(new T.TorusGeometry(R, r, 10, s || 36), m, x, y, z); };
  var G = function () { var g = new T.Group(); for (var i = 0; i < arguments.length; i++) if (arguments[i]) g.add(arguments[i]); return g; };
  var at = function (o, x, y, z) { o.position.set(x || 0, y || 0, z || 0); return o; };

  /* Unit-length bars along Y that can be stretched between two points */
  var _up = new T.Vector3(0, 1, 0), _dv = new T.Vector3();
  function barRound(r, m) { return mesh(new T.CylinderGeometry(r, r, 1, 10), m); }
  function barStrip(w, t, m) { return mesh(new T.BoxGeometry(w, 1, t), m); }
  function place(o, a, b) {
    _dv.set(b.x - a.x, b.y - a.y, b.z - a.z);
    var l = _dv.length() || 1e-6;
    o.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    o.quaternion.setFromUnitVectors(_up, _dv.multiplyScalar(1 / l));
    o.scale.set(1, l, 1);
  }
  function place2(o, x1, y1, x2, y2, z) {
    place(o, { x: x1, y: y1, z: z || 0 }, { x: x2, y: y2, z: z || 0 });
  }

  /* Bottle cap: lathe profile, ridged edge. Axis = Y, closed top at +Y. */
  var _capCache = {};
  function capGeo(r, h) {
    var k = r.toFixed(3) + "_" + h.toFixed(3);
    if (_capCache[k]) return _capCache[k];
    h = h || r * 0.42;
    var w = Math.max(0.012, r * 0.07);
    var pts = [
      [0, h], [r * 0.8, h], [r * 0.93, h - w * 0.5], [r, h - w * 1.6], [r, 0], [r - w, 0], [r - w, h - w * 1.9], [0, h - w * 1.9]
    ].map(function (p) { return new T.Vector2(p[0], p[1]); });
    var g = new T.LatheGeometry(pts, 40);
    var pos = g.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), z = pos.getZ(i), rr = Math.hypot(x, z);
      if (rr > r * 0.965) {
        var a = Math.atan2(z, x), f = 1 + 0.028 * Math.cos(a * 30);
        pos.setX(i, x * f); pos.setZ(i, z * f);
      }
    }
    g.computeVertexNormals();
    _capCache[k] = g;
    return g;
  }
  /* A cap standing with open side down (-Y) */
  function cap(r, col, h) {
    h = h || r * 0.42;
    return mesh(capGeo(r, h), capMat(col));
  }
  /* A wheel made of two caps glued top-to-top. Axle along Z. Spin with .rotation.z */
  function capWheel(r, col, tyre) {
    var h = r * 0.42, g = new T.Group();
    var a = cap(r, col, h); a.rotation.x = -Math.PI / 2; a.position.z = h;
    var b = cap(r, col, h); b.rotation.x = Math.PI / 2; b.position.z = -h;
    g.add(a, b);
    if (tyre) { var t = TOR(r * 1.0, r * 0.07, mats().band); g.add(t); }
    var hub = CZ(r * 0.12, h * 2 + 0.04, paint(0xffffff, { r: 0.5 }), 0, 0, 0, 14); g.add(hub);
    g.userData.r = r;
    return g;
  }

  /* Gear with trapezoid teeth. Axis = Z. Pitch radius = n*m/2. Teeth centred at angles k*2π/n. */
  function gearGeo(n, m, th, hole) {
    var pr = (n * m) / 2, tip = pr + m * 0.85, root = pr - m * 1.0, p = (Math.PI * 2) / n;
    var s = new T.Shape(), first = true;
    function pt(r, a) { var x = r * Math.cos(a), y = r * Math.sin(a); if (first) { s.moveTo(x, y); first = false; } else s.lineTo(x, y); }
    for (var i = 0; i < n; i++) {
      var a = i * p;
      pt(root, a - 0.32 * p); pt(tip, a - 0.15 * p); pt(tip, a + 0.15 * p); pt(root, a + 0.32 * p); pt(root, a + 0.5 * p);
    }
    s.closePath();
    var h = new T.Path(); h.absarc(0, 0, hole || m * 0.45, 0, Math.PI * 2, true); s.holes.push(h);
    var g = new T.ExtrudeGeometry(s, { depth: th, bevelEnabled: false, curveSegments: 6 });
    g.translate(0, 0, -th / 2);
    return g;
  }
  /* Sawtooth ratchet wheel. Axis = Z */
  function ratchetGeo(n, rOut, rIn, th) {
    var s = new T.Shape(), p = (Math.PI * 2) / n;
    for (var i = 0; i < n; i++) {
      var a = i * p, x1 = rIn * Math.cos(a), y1 = rIn * Math.sin(a), x2 = rOut * Math.cos(a + p * 0.85), y2 = rOut * Math.sin(a + p * 0.85);
      if (i === 0) s.moveTo(x1, y1); else s.lineTo(x1, y1);
      s.lineTo(x2, y2);
    }
    s.closePath();
    var h = new T.Path(); h.absarc(0, 0, rIn * 0.25, 0, Math.PI * 2, true); s.holes.push(h);
    var g = new T.ExtrudeGeometry(s, { depth: th, bevelEnabled: false });
    g.translate(0, 0, -th / 2);
    return g;
  }

  /* Tube along points (wire, straw bend, string). */
  function tube(pts, r, m, closed, segs) {
    var cur = new T.CatmullRomCurve3(pts.map(function (p) { return p.isVector3 ? p : new T.Vector3(p[0], p[1], p[2] || 0); }), !!closed, "catmullrom", 0.35);
    var g = new T.TubeGeometry(cur, segs || pts.length * 10, r, 8, !!closed);
    var o = mesh(g, m); o.userData.curve = cur; return o;
  }
  /* Polyline with softened corners -> dense point list */
  function roundPath(pts, rad, closed) {
    var out = [], n = pts.length;
    for (var i = 0; i < n; i++) {
      if (!closed && (i === 0 || i === n - 1)) { out.push(V3.apply(null, pts[i])); continue; }
      var p0 = V3.apply(null, pts[(i - 1 + n) % n]), p1 = V3.apply(null, pts[i]), p2 = V3.apply(null, pts[(i + 1) % n]);
      var d1 = p0.clone().sub(p1), d2 = p2.clone().sub(p1);
      var l = Math.min(rad, d1.length() / 2, d2.length() / 2);
      var a = p1.clone().add(d1.normalize().multiplyScalar(l)), b = p1.clone().add(d2.normalize().multiplyScalar(l));
      for (var t = 0; t <= 6; t++) {
        var u = t / 6, x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * p1.x + u * u * b.x,
          y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * p1.y + u * u * b.y,
          z = (1 - u) * (1 - u) * a.z + 2 * (1 - u) * u * p1.z + u * u * b.z;
        out.push(new T.Vector3(x, y, z));
      }
    }
    return out;
  }
  function googly(r, sep, z, look) {
    var g = new T.Group(), M = mats();
    [-1, 1].forEach(function (s) {
      var e = new T.Group();
      e.add(SP(r, M.white, 0, 0, 0, 20, 14));
      e.add(SP(r * 0.5, M.pupil, (look || 0) * r * 0.2, -r * 0.1, r * 0.62, 14, 10));
      e.position.set(s * sep, 0, z || 0);
      g.add(e);
    });
    return g;
  }
  function pompom(r, col) {
    var g = new T.Group();
    for (var i = 0; i < 7; i++) {
      var a = i * 2.4, b = i * 1.3;
      g.add(SP(r * 0.62, paint(col, { r: 1 }), Math.cos(a) * r * 0.35, Math.sin(b) * r * 0.35, Math.sin(a) * r * 0.35, 10, 8));
    }
    return g;
  }
  function pipeCleaner(pts, col, r) { return tube(pts, r || 0.016, paint(col, { r: 0.95 }), false, 40); }

  /* Parts registry — what kids can tap / pull apart */
  function parts() {
    var list = [];
    var p = function (name, desc, obj, ex, big) {
      list.push({ name: name, desc: desc, obj: obj, ex: ex ? V3(ex[0], ex[1], ex[2]) : V3(0, 0, 0), big: !!big });
      return obj;
    };
    p.list = list;
    return p;
  }

  /* Flat label with text (used for gear tooth counts etc.). Faces +Z. */
  function textPlane(text, w, h, fg, bg) {
    if (typeof document === "undefined") return new T.Group();
    var c = document.createElement("canvas"); c.width = 128; c.height = Math.max(32, Math.round(128 * h / w));
    var g = c.getContext("2d");
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); }
    g.fillStyle = fg || "#1b1b1e"; g.font = "bold " + Math.round(c.height * 0.72) + "px Verdana, Arial, sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(text), c.width / 2, c.height / 2 + 2);
    var tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding;
    var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex, transparent: !bg, depthWrite: false }));
    return m;
  }
  /* Rounded "stadium" outline (for tank tracks): returns Shape with hole */
  function stadiumShape(len, R, wall) {
    function path(P, rr, isHole) {
      P.moveTo(-len / 2, -rr); P.lineTo(len / 2, -rr);
      P.absarc(len / 2, 0, rr, -Math.PI / 2, Math.PI / 2, false);
      P.lineTo(-len / 2, rr);
      P.absarc(-len / 2, 0, rr, Math.PI / 2, (3 * Math.PI) / 2, false);
      return P;
    }
    var s = path(new T.Shape(), R); s.holes.push(path(new T.Path(), R - wall)); return s;
  }

  /* Invisible marker that widens a model's camera bounds (for things that fly, drop or slide) */
  function frameMark(x, y, z) {
    var m = new T.Mesh(new T.BoxGeometry(0.02, 0.02, 0.02), new T.MeshBasicMaterial()); m.position.set(x, y, z); m.visible = false; m.userData.mark = true; return m;
  }

  /* Easing + helpers */
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var sstep = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  INV.L = {
    T: T, V3: V3, mats: mats, paint: paint, capMat: capMat, ledMat: ledMat, balloonMat: balloonMat,
    mesh: mesh, BX: BX, CY: CY, CYT: CYT, CX: CX, CZ: CZ, SP: SP, TOR: TOR, G: G, at: at,
    barRound: barRound, barStrip: barStrip, place: place, place2: place2,
    cap: cap, capGeo: capGeo, capWheel: capWheel, gearGeo: gearGeo, ratchetGeo: ratchetGeo,
    tube: tube, frameMark: frameMark, textPlane: textPlane, stadiumShape: stadiumShape, roundPath: roundPath, googly: googly, pompom: pompom, pipeCleaner: pipeCleaner,
    parts: parts, clamp: clamp, sstep: sstep, lerp: lerp
  };

  /* ---------- registry & building ---------- */
  INV.defModel = function (id, meta, fn) {
    meta.id = id;
    INV.models[id] = { meta: meta, fn: fn };
    INV.modelOrder.push(id);
  };

  /* id may carry variant flags: "walker:m" = motor-driven. */
  INV.parseModel = function (spec) {
    var bits = String(spec).split(":");
    return { id: bits[0], motor: (bits[1] || "").indexOf("m") >= 0 };
  };

  INV.build = function (spec, seed) {
    var ps = INV.parseModel(spec), def = INV.models[ps.id];
    if (!def) throw new Error("Unknown model " + ps.id);
    var r = rng(hash(seed || ps.id));
    var pal = PALS[Math.floor(r() * PALS.length)];
    var o = { pal: pal, rnd: r, motor: ps.motor || !!def.meta.motorDefault, seed: seed || ps.id, id: ps.id };
    var root = new T.Group();
    var res = def.fn(INV.L, o, root) || {};
    var P = res.parts || [];
    if (res.update) res.update(def.meta.rest || 0, 0, 0.016);   // settle into the starting pose first
    // Fit big models onto the turntable
    root.updateMatrixWorld(true);
    var box = new T.Box3().setFromObject(root), size = box.getSize(new T.Vector3());
    var span = Math.max(size.x, size.z), fit = 1;
    if (span > 5.2) fit = 5.2 / span;
    if (size.y > 4.2) fit = Math.min(fit, 4.2 / size.y);
    if (fit < 1) root.scale.setScalar(fit);
    root.updateMatrixWorld(true);
    box = new T.Box3().setFromObject(root);
    var sph = box.getBoundingSphere(new T.Sphere());
    P.forEach(function (p) { p.base = p.obj.position.clone(); });
    var sz = box.getSize(new T.Vector3());
    return {
      id: ps.id, meta: def.meta, root: root, parts: P,
      update: res.update || function () {}, ground: res.ground || "mat",
      radius: Math.max(sph.radius, 1.4), centre: sph.center, height: box.max.y,
      platR: Math.max(res.platMin || 0, 2.0, Math.min(3.9, Math.max(sz.x, sz.z) / 2 * 1.1 + 0.4)),
      pal: pal
    };
  };
  /* Camera distance + target height that frames a built model */
  INV.frame = function (b, aspect, fovDeg) {
    var half = (fovDeg * Math.PI) / 360, halfH = Math.atan(Math.tan(half) * aspect), hh = Math.min(half, halfH);
    var ty = Math.max(0.5, b.centre.y * 0.62);
    var r = Math.max(b.radius * 0.95, Math.sqrt(b.platR * b.platR * 0.85 + ty * ty)) + 0.12;
    return { dist: r / Math.sin(hh), ty: ty };
  };

  INV.explode = function (built, k) {
    built.parts.forEach(function (p) {
      p.obj.position.copy(p.base).addScaledVector(p.ex, k);
    });
  };
})();

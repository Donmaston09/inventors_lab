/* Models 12–22: tracks, boats, air, gears, pulleys, levers, cranks, belts, ratchets, cable car, fan */
(function () {
  "use strict";
  var INV = window.INV, L = INV.L, T = L.T, def = INV.defModel, PI = Math.PI;
  function axle(M, len, x, y, z) { return L.CZ(0.025, len, M.skewer, x, y, z, 10); }

  /* ---------------- 12. CATERPILLAR TANK ---------------- */
  def("tank", { name: "Caterpillar Tank", fam: "Vehicles", emoji: "🚜", science: "friction",
    blurb: "Tracks spread the weight over a big area, so the tank grips and climbs where wheels would slip." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var Ls = 1.4, R = 0.34, Rw = 0.27, Z = 0.8, cy = 0.36;
    var body = L.BX(1.9, 0.48, 1.05, L.paint(pal.c, { r: 0.7 }), 0, 0.72, 0); rig.add(body);
    P("Hull", "A cardboard box holds the motor and batteries and keeps the tracks apart.", body, [0, 0.35, 0], true);
    var tur = L.G(); tur.position.set(0.05, 1.12, 0); rig.add(tur);
    tur.add(L.CYT(0.3, 0.42, 0.36, L.paint(pal.b, { r: 0.6 }), 0, 0, 0, 28), L.CX(0.07, 0.95, L.paint(pal.d, { r: 0.5 }), 0.6, 0.02, 0, 12));
    P("Turret & barrel", "A paper-cup turret with a straw barrel. It does not fire, it just looks fierce!", tur, [0, 0.55, 0]);
    var tracks = [], cleats = [], wheels = [], bandG = L.G(), cleatG = L.G(), wheelG = L.G(); rig.add(bandG, cleatG, wheelG);
    [-1, 1].forEach(function (s) {
      var g = new T.ExtrudeGeometry(L.stadiumShape(Ls, R, 0.05), { depth: 0.3, bevelEnabled: false, curveSegments: 10 }); g.translate(0, 0, -0.15);
      var band = new T.Mesh(g, M.rubber); band.position.set(0, cy, s * Z); band.castShadow = true; band.receiveShadow = true; bandG.add(band);
      [-1, 1].forEach(function (e) { var w = L.capWheel(Rw, e > 0 ? pal.a : pal.b, false); w.position.set(e * Ls / 2, cy, s * Z); wheelG.add(w); wheels.push(w); });
      var road = L.capWheel(0.14, pal.d, false); road.position.set(0, cy - 0.15, s * Z); wheelG.add(road); wheels.push(road);
      for (var i = 0; i < 26; i++) { var cl = L.BX(0.12, 0.05, 0.36, L.paint(pal.d, { r: 0.8 })); cleatG.add(cl); cleats.push({ m: cl, s: s, i: i }); }
    });
    P("Rubber tracks", "A loop of belt wrapped round the wheels. Each wheel lays down its own road, then picks it up again.", bandG, [0, 0, 0.5], true);
    P("Grip cleats", "Cardboard bumps on the belt dig into the ground.", cleatG, [0, 0, 0.8]);
    P("Wheels", "Bottle-cap wheels on skewer axles guide the belt.", wheelG, [0, -0.1, 0.6]);
    if (o.motor) { var m = L.CX(0.15, 0.5, M.steel, -0.5, 1.08, 0, 18), bt = L.BX(0.7, 0.22, 0.34, M.black, 0.25, 1.06, -0.2); rig.add(m, bt); }
    else { var key = L.G(); key.position.set(-0.98, 0.78, 0); key.add(L.BX(0.04, 0.5, 0.12, L.paint(pal.a, { r: 0.5 }))); rig.add(key); }
    P.list.push({ name: o.motor ? "Motor & battery" : "Wind-up key", desc: o.motor ? "The motor turns the back wheels, and the wheels drive the tracks." : "Wind it up to twist a rubber band. As the band untwists, it drives the wheels.", obj: o.motor ? rig.children[rig.children.length - 2] : rig.children[rig.children.length - 1], ex: L.V3(0, 0.5, 0), big: false });
    var per = 2 * Ls + 2 * PI * R, v0 = 0.8, off = 0, wr = 0;
    function onPath(u) { // top straight (+x) -> front arc -> bottom straight (-x) -> rear arc
      u = ((u % per) + per) % per;
      if (u < Ls) return [-Ls / 2 + u, R, 0];
      u -= Ls; if (u < PI * R) { var a = PI / 2 - u / R; return [Ls / 2 + R * Math.cos(a), R * Math.sin(a), a - PI / 2]; }
      u -= PI * R; if (u < Ls) return [Ls / 2 - u, -R, PI];
      u -= Ls; var a2 = -PI / 2 - u / R; return [-Ls / 2 + R * Math.cos(a2), R * Math.sin(a2), a2 - PI / 2];
    }
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt, dt) {
        var v = v0 * amt; off += v * (dt || 0.016); wr += v * (dt || 0.016) / Rw;
        cleats.forEach(function (c) { var p = onPath(off + (c.i / 26) * per); c.m.position.set(p[0], cy + p[1], c.s * Z); c.m.rotation.z = p[2]; });
        wheels.forEach(function (w) { w.rotation.z = -wr * (w.userData.r > 0.2 ? 1 : 1.9); });
        return { speed: v };
      }
    };
  });

  /* ---------------- 13. PADDLE BOAT ---------------- */
  def("paddleboat", { name: "Paddle Boat", fam: "Vehicles", emoji: "🚤", science: "energy",
    blurb: "A twisted rubber band turns the paddle wheel, and the paddles push the water back so the boat goes forward." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.y = 0.04; root.add(rig);
    var sh = new T.Shape(); sh.moveTo(-1.3, 0.62); sh.lineTo(-1.3, 0.14); sh.lineTo(-1.05, 0); sh.lineTo(1.1, 0); sh.lineTo(1.75, 0.62); sh.closePath();
    var hull = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: false }), L.paint(pal.c, { r: 0.6 })); hull.position.z = -0.5; hull.castShadow = true; hull.receiveShadow = true; rig.add(hull);
    P("Hull", "A milk-carton hull. Its shape pushes water aside and keeps the boat floating.", hull, [0, 0.0, 0], true);
    var cab = L.G(); cab.position.set(0.15, 0.95, 0); rig.add(cab);
    cab.add(L.BX(0.8, 0.55, 0.65, L.paint(pal.b, { r: 0.6 })), L.CY(0.11, 0.5, L.paint(pal.a, { r: 0.6 }), 0.25, 0.5, 0, 18), L.googly(0.1, 0.17, 0.33, 0.3));
    cab.children[2].position.y = 0.05;
    P("Cabin & funnel", "A cup funnel and a card cabin make it look like a real paddle steamer.", cab, [0, 0.5, 0]);
    var wheel = L.G(); wheel.position.set(-1.38, 0.55, 0); rig.add(wheel);
    var spin = L.G(); wheel.add(spin);
    [-1, 1].forEach(function (s) { spin.add(L.CZ(0.5, 0.03, M.card, 0, 0, s * 0.46, 28)); });
    for (var i = 0; i < 6; i++) { var a = (i / 6) * PI * 2, p = L.BX(0.3, 0.05, 0.95, L.paint(i % 2 ? pal.a : pal.d, { r: 0.7 }), Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0); p.rotation.z = a; spin.add(p); }
    spin.add(L.CZ(0.04, 1.3, M.skewer, 0, 0, 0, 10));
    P("Paddle wheel", "Six card paddles on a skewer. Each paddle scoops water backwards and the boat is pushed forwards.", wheel, [-0.5, 0, 0], true);
    var band = L.barRound(0.02, M.band); rig.add(band); var hook = L.CY(0.04, 0.3, M.wood, 0.4, 0.78, 0, 8); rig.add(hook);
    var bandW = L.G(); bandW.add(band); rig.add(bandW);
    P("Rubber band motor", "Wind the paddle wheel back to twist the band. As it untwists it turns the wheel.", bandW, [0, 0.45, 0.4]);
    var flag = L.G(); flag.position.set(0.15, 1.25, 0); flag.add(L.CY(0.02, 0.5, M.skewer, 0, 0.25, 0, 6)); rig.add(flag);
    return {
      parts: P.list, ground: "water", platMin: 2.9,
      update: function (ph, amt) {
        var th = ph * 3.2; spin.rotation.z = th;
        L.place2(band, 0.4, 0.78, -1.38, 0.55, 0.0);
        rig.position.y = 0.04 + Math.sin(ph * 2.1) * 0.03 * amt; rig.rotation.z = Math.sin(ph * 1.7) * 0.025 * amt;
        return { speed: 0.55 * amt };
      }
    };
  });

  /* ---------------- 14. HOVER DISC ---------------- */
  def("hover", { name: "Balloon Hovercraft", fam: "Vehicles", emoji: "🛸", science: "air", rest: 0.4,
    blurb: "A balloon blows a cushion of air under an old CD, so it floats and glides with almost no friction." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var tex = null;
    if (typeof document !== "undefined") {
      var c = document.createElement("canvas"); c.width = c.height = 256; var g = c.getContext("2d");
      var gr = g.createRadialGradient(128, 128, 20, 128, 128, 128); gr.addColorStop(0, "#d6dbe0"); gr.addColorStop(0.3, "#f2f4f6"); gr.addColorStop(0.55, "#bfe8ff"); gr.addColorStop(0.7, "#f6c7ff"); gr.addColorStop(0.85, "#ffe9a8"); gr.addColorStop(1, "#d0d6dc");
      g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 128, 0, 7); g.fill();
      tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding;
    }
    var disc = L.G(); rig.add(disc);
    var top = new T.Mesh(new T.CircleGeometry(1.25, 64), new T.MeshStandardMaterial({ map: tex, color: tex ? 0xffffff : 0xdde3e8, metalness: 0.6, roughness: 0.25 })); top.rotation.x = -PI / 2; top.position.y = 0.025; top.castShadow = true; top.receiveShadow = true;
    disc.add(top, L.CY(1.25, 0.05, M.steel, 0, 0, 0, 64));
    P("Old CD", "A flat, smooth disc. Air can escape evenly all round the edge, so it floats level.", disc, [0, -0.1, 0], true);
    var valve = L.G(); rig.add(valve);
    valve.add(L.CY(0.28, 0.32, L.paint(pal.a, { r: 0.4 }), 0, 0.2, 0, 28), L.CY(0.12, 0.22, L.paint(0xf7f7f7, { r: 0.4 }), 0, 0.45, 0, 18));
    P("Sports-cap valve", "A push-pull bottle cap glued over the hole. Pull it up and the air flows out.", valve, [0, 0.5, 0]);
    var bW = L.G(); rig.add(bW);
    var bal = L.SP(0.8, L.balloonMat(pal.b), 0, 1.35, 0, 28, 20); bal.scale.set(1, 1.1, 1); bW.add(bal);
    P("Balloon", "The balloon is the air tank. Squeezed air wants to escape downwards.", bW, [0, 0.6, 0], true);
    var rings = L.G(), rm = []; rig.add(rings);
    for (var i = 0; i < 5; i++) { var r = new T.Mesh(new T.TorusGeometry(1, 0.025, 6, 48), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); r.rotation.x = PI / 2; rings.add(r); rm.push(r); }
    P("Air cushion", "A thin layer of air under the disc. It means the disc rides on air, not on the table!", rings, [0, -0.25, 0]);
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt) {
        var cyc = ph % 11, s = cyc < 9 ? 1 - 0.45 * (cyc / 9) : 0.55 + 0.45 * L.sstep(9, 11, cyc);
        var lift = 0.08 + 0.05 * Math.sin(ph * 3.1) * amt + 0.02 * s;
        rig.position.y = lift * Math.min(1, 0.2 + amt); rig.rotation.y = ph * 0.35; rig.rotation.z = Math.sin(ph * 1.3) * 0.03 * amt; rig.rotation.x = Math.cos(ph * 1.1) * 0.025 * amt;
        bal.scale.set(0.35 + 0.65 * s, (0.35 + 0.65 * s) * 1.1, 0.35 + 0.65 * s); bal.position.y = 0.6 + 0.75 * s;
        rm.forEach(function (r, i) { var u = (ph * 0.9 + i / 5) % 1; var k = 0.9 + u * 0.9; r.scale.set(amt > 0.05 ? k * 1.2 : 0.3, amt > 0.05 ? k * 1.2 : 0.3, 1); r.position.y = -0.04 - u * 0.02; r.material.opacity = (1 - u) * 0.45 * (amt > 0.05 ? 1 : 0.0) * s; });
        return {};
      }
    };
  });

  /* ---------------- 15. GEAR TRAIN ---------------- */
  def("geartrain", { name: "Gear Train", fam: "Mechanisms", emoji: "⚙️", science: "gear",
    blurb: "Gears with teeth that mesh. Big gears turn slowly, small gears turn quickly, and neighbours turn opposite ways." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.x = -1.3; root.add(rig);
    var board = L.BX(4.1, 2.35, 0.07, M.card, 1.3, 1.2, -0.06); rig.add(board);
    var stand = L.BX(4.1, 0.07, 1.0, M.cardDark, 1.3, 0.035, 0.38); rig.add(stand);
    var prop = L.BX(0.06, 1.0, 0.8, M.cardDark, 1.3, 0.5, 0.3); rig.add(prop);
    P("Cardboard board", "Everything is held on a board so the gears stay the right distance apart.", board, [0, 0, -0.7], true);
    var Ns = [12, 20, 12, 30], m = 0.05, cols = [pal.a, pal.b, pal.d, pal.c], gy = 1.3, xs = [0], gs = [];
    for (var i = 1; i < Ns.length; i++) xs.push(xs[i - 1] + (Ns[i - 1] + Ns[i]) * m / 2);
    var gearG = L.G(); rig.add(gearG);
    Ns.forEach(function (n, i) {
      var g = L.G(); g.position.set(xs[i], gy, 0.06);
      var gm = new T.Mesh(L.gearGeo(n, m, 0.07, 0.03), L.paint(cols[i], { r: 0.6 })); gm.castShadow = true; gm.receiveShadow = true; g.add(gm);
      var lab = L.textPlane(n, 0.3, 0.2, "#ffffff"); lab.position.z = 0.042; lab.position.x = (n * m / 2) * 0.55; g.add(lab);
      var dot = L.SP(0.03, M.white, -(n * m / 2) * 0.55, 0, 0.045, 8, 6); g.add(dot);
      gearG.add(g); gs.push({ g: g, n: n });
      rig.add(L.CZ(0.025, 0.4, M.skewer, xs[i], gy, 0.05, 8));
      var hub = L.CZ(0.07, 0.04, M.brass, xs[i], gy, 0.14, 12); rig.add(hub);
    });
    P("Gears", "Teeth lock together. When one gear turns, it pushes its neighbour the OTHER way. Count the teeth to find the speed!", gearG, [0, 0.0, 0.7], true);
    var crank = L.G(); crank.position.set(xs[0], gy, 0.24); rig.add(crank);
    var arm = L.BX(0.08, 0.5, 0.05, M.wood, 0, 0.22, 0); crank.add(arm, L.CZ(0.07, 0.14, L.paint(pal.d, { r: 0.5 }), 0, 0.46, 0.04, 12));
    P("Crank handle", "Turn here. This is the 'driver' gear. The last gear is the 'follower'.", crank, [-0.3, 0, 0.5]);
    return {
      parts: P.list, ground: "mat", platMin: 2.9,
      update: function (ph, amt) {
        var th = -ph * 1.9, ang = [th];
        for (var i = 1; i < gs.length; i++) { var C = (gs[i - 1].n + gs[i].n) * 0 + (gs[i].n - 1) * PI; ang.push((C - gs[i - 1].n * ang[i - 1]) / gs[i].n); }
        gs.forEach(function (x, i) { x.g.rotation.z = ang[i]; });
        crank.rotation.z = th;
        return {};
      }
    };
  });

  /* ---------------- 16. PULLEY CRANE ---------------- */
  def("pulley", { name: "Pulley Crane", fam: "Mechanisms", emoji: "🏗️", science: "pulley",
    blurb: "A rope over a wheel lets you lift things by pulling down. Winding a drum does the hard work." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.x = -0.7; root.add(rig);
    var base = L.BX(1.5, 0.16, 1.1, M.card, 0.3, 0.08, 0); rig.add(base);
    var frame = L.G(); rig.add(frame);
    [-1, 1].forEach(function (s) { frame.add(L.BX(0.11, 2.75, 0.07, L.paint(pal.c, { r: 0.7 }), 0, 1.5, s * 0.3)); var st = L.barStrip(0.09, 0.05, L.paint(pal.c, { r: 0.7 })); L.place2(st, 0.0, 1.2, 0.75, 0.2, s * 0.3); frame.add(st); });
    var boom = L.G(); [-1, 1].forEach(function (s) { boom.add(L.BX(1.75, 0.1, 0.07, L.paint(pal.a, { r: 0.7 }), 0.85, 2.85, s * 0.3)); }); frame.add(boom);
    var bst = L.barStrip(0.08, 0.05, L.paint(pal.a, { r: 0.7 })); L.place2(bst, 0.0, 2.2, 1.3, 2.82, 0.3); boom.add(bst); var bst2 = L.barStrip(0.08, 0.05, L.paint(pal.a, { r: 0.7 })); L.place2(bst2, 0.0, 2.2, 1.3, 2.82, -0.3); boom.add(bst2);
    P("Tower & boom", "A triangle-braced frame. The arm sticks out so the load can hang clear of the tower.", frame, [0, 0.2, 0], true);
    var px = 1.7, py = 2.75;
    var pul = L.capWheel(0.22, pal.b, false); pul.position.set(px - 0.2, py, 0); rig.add(pul);
    var axl = L.CZ(0.03, 0.8, M.skewer, px - 0.2, py, 0, 8); rig.add(axl);
    P("Fixed pulley", "A wheel with a groove. It does not make the lift easier, but it lets you pull DOWN to lift UP.", pul, [0.4, 0.3, 0], true);
    var drum = L.G(); drum.position.set(0.0, 0.62, 0); rig.add(drum);
    var dr = 0.2; drum.add(L.CZ(dr, 0.46, L.paint(pal.d, { r: 0.7 }), 0, 0, 0, 20), L.CZ(dr + 0.07, 0.03, M.card, 0, 0, 0.23, 20), L.CZ(dr + 0.07, 0.03, M.card, 0, 0, -0.23, 20));
    var hnd = L.G(); hnd.add(L.BX(0.07, 0.4, 0.05, M.wood, 0, 0.2, 0), L.CZ(0.06, 0.12, L.paint(pal.a, { r: 0.5 }), 0, 0.4, 0.05, 10)); hnd.position.z = 0.4; drum.add(hnd);
    P("Winding drum", "Turning the handle winds the rope round the drum. A small turn here lifts the load slowly but easily.", drum, [0, 0, 0.6]);
    var rope1 = L.barRound(0.012, M.white), rope2 = L.barRound(0.012, M.white); var ropeG = L.G(); ropeG.add(rope1, rope2); rig.add(ropeG);
    P("Rope", "One end is wound on the drum. The other end holds the bucket.", ropeG, [0, 0, -0.5]);
    var bk = L.G(); rig.add(bk);
    var cup = L.CYT(0.26, 0.17, 0.38, L.paint(pal.a, { r: 0.6 }), 0, -0.2, 0, 24); bk.add(cup, L.TOR(0.22, 0.012, M.white, 0, 0.0, 0, 24));
    var cargo = L.pompom(0.12, pal.d); cargo.position.y = -0.0; bk.add(cargo);
    var bkW = L.G(); bkW.add(bk); rig.add(bkW);
    P("Bucket (the load)", "A paper cup holding something heavy to lift.", bkW, [0.5, 0, 0]);
    return {
      parts: P.list, ground: "mat", platMin: 2.6,
      update: function (ph, amt) {
        var h = 0.55 + 1.45 * (0.5 - 0.5 * Math.cos(ph * 0.9 + 0.01));
        var top = h + 0.0;
        bk.position.set(px, top, 0);
        var th = (h - 0.55) / dr;
        drum.children[0].rotation.x = 0; hnd.parent.rotation.z = -th; pul.rotation.z = -(h / 0.22) * 0.0 - th * 0.9;
        L.place2(rope1, 0.0 + 0.12, 0.62 + dr, px - 0.4, py + 0.22, 0);
        L.place2(rope2, px, py - 0.02, px, h + 0.02, 0);
        return {};
      }
    };
  });

  /* ---------------- 17. CATAPULT ---------------- */
  def("catapult", { name: "Lever Catapult", fam: "Mechanisms", emoji: "🏹", science: "lever", rest: 0.9,
    blurb: "A lever pivots on a fulcrum. Press the short end down and the long end flicks a pom-pom into the air." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.x = -0.9; rig.scale.setScalar(1.15); root.add(rig);
    var base = L.BX(2.3, 0.08, 1.2, M.card, 0.3, 0.04, 0); rig.add(base);
    P("Base", "A flat piece of strong card keeps everything steady.", base, [0, -0.1, 0], true);
    var ful = L.G(); rig.add(ful);
    [-1, 1].forEach(function (s) { var sh = new T.Shape(); sh.moveTo(-0.32, 0); sh.lineTo(0.32, 0); sh.lineTo(0, 1.0); sh.closePath(); var tri = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false }), L.paint(pal.c, { r: 0.7 })); tri.position.set(0, 0.08, s * 0.4 - 0.025); tri.castShadow = true; ful.add(tri); });
    ful.add(L.CZ(0.035, 1.0, M.skewer, 0, 1.08, 0, 8));
    P("Fulcrum", "The pivot point. A lever turns around it. Moving it changes how the lever feels!", ful, [0, 0, 0.4], true);
    var armW = L.G(); armW.position.set(0, 1.08, 0); rig.add(armW);
    var arm = L.G(); armW.add(arm);
    arm.add(L.BX(2.6, 0.07, 0.2, L.paint(pal.a, { r: 0.6 }), 0.5, 0, 0));
    var cup = L.CYT(0.28, 0.2, 0.2, L.paint(pal.b, { r: 0.6 }), 1.68, 0.12, 0, 24); arm.add(cup);
    arm.add(L.SP(0.07, M.brass, -0.7, 0.07, 0, 8, 6));
    P("Lever arm", "A strong lolly-stick strip. The long side moves further and faster than the short side.", armW, [0, 0.45, 0], true);
    var hook = L.CY(0.04, 0.24, M.wood, -0.78, 0.2, 0.0, 8); rig.add(hook);
    var band = L.barRound(0.02, M.band); var bandW = L.G(); bandW.add(band); rig.add(bandW);
    P("Rubber band", "It pulls the arm back to rest after every launch.", bandW, [0, 0, -0.5]);
    var ballO = L.G(), ballW = L.G(); ballO.add(ballW); rig.add(ballO);
    ballW.add(L.pompom(0.13, pal.d));
    P("Pom-pom", "The thing we are launching. Light, soft and safe to throw!", ballO, [0, 0.8, 0]);
    var fing = L.G(); rig.add(fing);
    fing.add(L.CY(0.09, 0.9, L.paint(0xf2b8a0, { r: 0.8 }), 0, 0.45, 0, 14), L.SP(0.09, L.paint(0xf2b8a0, { r: 0.8 }), 0, 0, 0, 14, 10));
    var T0 = 5.2;
    var platMinHint = 2.7;
    rig.add(L.frameMark(2.1, 2.0, 0));
    function cupPos(a) { return [Math.cos(a) * 1.68 - Math.sin(a) * 0.2, 1.08 + Math.sin(a) * 1.68 + Math.cos(a) * 0.2]; }
    function shortY(a) { return 1.08 - 0.7 * Math.sin(a) + 0.04; }
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt, dt) {
        var t = ph % T0, a = -0.5, tip, show = 0, bx, by, fy = 2.6, f;
        if (t < 1.5) { a = -0.5; show = L.sstep(0, 0.7, t); fy = 2.6 - 1.04 * L.sstep(0.5, 1.5, t); }
        else if (t < 1.9) { var u = (t - 1.5) / 0.4; a = -0.5 + 1.1 * u * u; show = 1; fy = shortY(a) + 0.09; }
        else if (t < 2.9) { var w = t - 1.9; a = 0.6 + 0.07 * Math.exp(-w * 6) * Math.cos(w * 20); fy = L.lerp(shortY(0.6) + 0.09, 2.6, L.sstep(0.05, 0.8, w)); show = 1; }
        else if (t < 4.0) { a = 0.6 - 1.1 * L.sstep(2.9, 4.0, t); fy = 2.6; show = 0; }
        else { a = -0.5; show = 0; }
        if (t < 1.9) { tip = cupPos(a); bx = tip[0]; by = tip[1]; }
        else if (t < 2.9) { f = t - 1.9; tip = cupPos(0.6); bx = tip[0] + 1.3 * f; by = tip[1] + 3.2 * f - 4.6 * f * f; if (by < 0.14) { by = 0.14; show = 0; } }
        else { tip = cupPos(a); bx = tip[0]; by = tip[1]; }
        armW.rotation.z = a;
        ballW.scale.setScalar(Math.max(0.001, show)); ballW.position.set(bx, by, 0);
        fing.position.set(-0.6, fy, 0); fing.visible = amt > 0.02;
        L.place2(band, -0.7 * Math.cos(a) - 0.07 * Math.sin(a), 1.08 - 0.7 * Math.sin(a) + 0.07 * Math.cos(a), -0.78, 0.14, 0);
        return {};
      }, platMin: platMinHint
    };
  });

  /* ---------------- 18. CRANK & SLIDER ---------------- */
  def("crankslider", { name: "Peekaboo Slider", fam: "Mechanisms", emoji: "👻", science: "linkage",
    blurb: "A crank going round and round pushes a rod, and a monster slides in and out of its window." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.x = -0.6; root.add(rig);
    var board = L.BX(3.3, 2.0, 0.07, M.card, 0.55, 1.1, -0.06); rig.add(board); var stand = L.BX(3.3, 0.07, 1.0, M.cardDark, 0.55, 0.035, 0.3); rig.add(stand);
    var prop = L.BX(0.06, 1.0, 0.7, M.cardDark, 0.55, 0.5, 0.25); rig.add(prop);
    P("Board", "A tall board holds the crank on the left and the window on the right.", board, [0, 0, -0.6], true);
    var cx = -0.7, cy = 1.1, r = 0.28, l = 1.15;
    var crank = L.G(); crank.position.set(cx, cy, 0.06); rig.add(crank);
    var spin = L.G(); crank.add(spin); var wh = L.capWheel(0.5, pal.a, false); spin.add(wh);
    spin.add(L.CZ(0.045, 0.3, M.metal, r, 0, 0.1, 10));
    var kn = L.CZ(0.09, 0.08, L.paint(pal.d, { r: 0.4 }), r, 0, 0.3, 14); spin.add(kn);
    P("Crank wheel", "The pin near the edge travels round a circle, pulling and pushing the rod.", crank, [-0.3, 0, 0.5], true);
    var rod = L.barStrip(0.1, 0.035, M.steel); rig.add(rod); var rodW = L.G(); rodW.add(rod); rig.add(rodW);
    P("Connecting rod", "A rod joins the crank pin to the slider. It changes spinning into sliding.", rodW, [0, 0.45, 0.3]);
    [-1, 1].forEach(function (s) { rig.add(L.BX(2.4, 0.07, 0.1, M.cardDark, 0.95, cy + s * 0.27, 0.06)); });
    var sl = L.G(), slW = L.G(); slW.add(sl); rig.add(slW);
    sl.add(L.BX(0.55, 0.38, 0.14, L.paint(pal.b, { r: 0.6 }), 0.26, 0, 0.04), L.googly(0.09, 0.14, 0.12, 0.0));
    sl.children[1].position.set(0.3, 0.06, 0.04);
    sl.add(L.BX(0.28, 0.05, 0.02, M.pupil, 0.3, -0.12, 0.115));
    P("Monster slider", "It can only move left and right, guided by the two rails.", slW, [0.2, 0.6, 0.3], true);
    var win = L.G(); rig.add(win); win.add(L.BX(0.1, 1.1, 0.12, L.paint(pal.c, { r: 0.7 }), 1.1, cy, 0.14), L.BX(0.5, 0.1, 0.12, L.paint(pal.c, { r: 0.7 }), 1.3, cy + 0.55, 0.14), L.BX(0.5, 0.1, 0.12, L.paint(pal.c, { r: 0.7 }), 1.3, cy - 0.55, 0.14), L.BX(0.1, 1.1, 0.12, L.paint(pal.c, { r: 0.7 }), 1.5, cy, 0.14));
    P("Window frame", "A cardboard window. The monster pops in and out of sight.", win, [0.5, 0.0, 0.4]);
    return {
      parts: P.list, ground: "mat", platMin: 2.6,
      update: function (ph, amt) {
        var th = -ph * 2.6; spin.rotation.z = th;
        var px = cx + r * Math.cos(th), py = cy + r * Math.sin(th);
        var sx = px + Math.sqrt(l * l - (py - cy) * (py - cy));
        L.place2(rod, px, py, sx, cy, 0.14);
        sl.position.set(sx - 0.1, cy, 0.04);
        return {};
      }
    };
  });

  /* ---------------- 19. BELT DRIVE ---------------- */
  def("belt", { name: "Belt Drive", fam: "Mechanisms", emoji: "🔗", science: "belt",
    blurb: "A rubber band links two wheels. A small wheel turns a big wheel slowly, so you can change speed without touching." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.x = -0.95; root.add(rig);
    var board = L.BX(3.7, 2.0, 0.07, M.card, 0.95, 1.15, -0.06); rig.add(board); rig.add(L.BX(3.7, 0.07, 1.0, M.cardDark, 0.95, 0.035, 0.3)); rig.add(L.BX(0.06, 1.0, 0.7, M.cardDark, 0.95, 0.5, 0.25));
    var r1 = 0.32, r2 = 0.8, d = 1.9, cy = 1.2;
    function pulleyMesh(r, col) {
      var g = L.G(); g.add(L.CZ(r, 0.2, L.paint(col, { r: 0.7 }), 0, 0, 0, 36), L.CZ(r * 1.1, 0.03, M.card, 0, 0, 0.11, 36), L.CZ(r * 1.1, 0.03, M.card, 0, 0, -0.11, 36));
      g.add(L.BX(r * 0.7, 0.07, 0.03, M.white, r * 0.4, 0, 0.13)); return g;
    }
    var p1 = pulleyMesh(r1, pal.a), p2 = pulleyMesh(r2, pal.b); p1.position.set(0, cy, 0.06); p2.position.set(d, cy, 0.06); rig.add(p1, p2);
    rig.add(L.CZ(0.03, 0.4, M.skewer, 0, cy, 0.05, 8), L.CZ(0.03, 0.4, M.skewer, d, cy, 0.05, 8));
    P("Little wheel (driver)", "Small wheel: turns fast. It is the one you turn by hand.", p1, [-0.3, 0, 0.5], true);
    P("Big wheel (follower)", "Big wheel: turns slowly but with more pulling power.", p2, [0.3, 0, 0.5], true);
    var nx = (r1 - r2) / d, ny = Math.sqrt(1 - nx * nx), thu = Math.atan2(ny, nx), pts = [], i, a;
    for (i = 0; i <= 14; i++) { a = thu - (i / 14) * 2 * thu; pts.push([d + r2 * Math.cos(a), cy + r2 * Math.sin(a), 0.06]); }
    for (i = 1; i <= 14; i++) { a = -thu - (i / 14) * (2 * PI - 2 * thu); pts.push([r1 * Math.cos(a), cy + r1 * Math.sin(a), 0.06]); }
    pts.pop();
    var beltM = L.tube(pts, 0.035, M.band, true, 120); rig.add(beltM);
    P("Rubber-band belt", "The belt grips both wheels. When one turns, the belt drags the other round.", beltM, [0, 0, 0.8]);
    var kn = L.G(); kn.position.set(0, cy, 0.2); rig.add(kn); kn.add(L.BX(0.06, 0.4, 0.04, M.wood, 0, 0.2, 0), L.CZ(0.07, 0.12, L.paint(pal.d, { r: 0.5 }), 0, 0.4, 0.04, 10));
    P("Handle", "Turn the little wheel by hand.", kn, [-0.4, 0, 0.8]);
    return {
      parts: P.list, ground: "mat", platMin: 2.9,
      update: function (ph, amt) {
        var th = -ph * 2.4; p1.rotation.z = th; kn.rotation.z = th; p2.rotation.z = th * (r1 / r2);
        return {};
      }
    };
  });

  /* ---------------- 20. RATCHET ---------------- */
  def("ratchet", { name: "Click-Clack Ratchet", fam: "Mechanisms", emoji: "🔧", science: "ratchet",
    blurb: "A one-way gear. Wiggle the lever back and forth and the wheel only ever turns one way: click, click, click." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var board = L.BX(3.0, 2.2, 0.07, M.card, 0, 1.2, -0.06); rig.add(board); rig.add(L.BX(3.0, 0.07, 1.0, M.cardDark, 0, 0.035, 0.3)); rig.add(L.BX(0.06, 1.0, 0.7, M.cardDark, 0, 0.5, 0.25));
    var cy = 1.3, N = 12, wr = 0.7;
    var wheel = L.G(); wheel.position.set(0, cy, 0.06); rig.add(wheel);
    var wm = new T.Mesh(L.ratchetGeo(N, wr, wr * 0.72, 0.08), L.paint(pal.a, { r: 0.6 })); wm.castShadow = true; wm.receiveShadow = true; wheel.add(wm);
    P("Ratchet wheel", "A wheel with saw-shaped teeth. Each tooth has a gentle slope and a steep edge.", wheel, [0, 0, 0.6], true);
    var lev = L.G(); lev.position.set(0, cy, 0.17); rig.add(lev);
    lev.add(L.BX(1.8, 0.14, 0.05, L.paint(pal.c, { r: 0.6 }), 0.3, 0, 0), L.CZ(0.05, 0.1, M.brass, 0, 0, 0, 10), L.CZ(0.09, 0.1, L.paint(pal.d, { r: 0.4 }), 1.2, 0, 0.05, 12));
    var dp = L.G(); dp.position.set(0.0, 0, 0); lev.add(dp);
    var pawl = L.BX(0.36, 0.06, 0.05, M.steel, 0.5, 0.0, -0.05); pawl.position.set(0.55, 0.0, -0.06); lev.add(pawl);
    P("Lever", "Swing this back and forth. It carries a little hook (the driving pawl).", lev, [0.3, 0, 0.7], true);
    var lock = L.G(); lock.position.set(0, cy + 0.98, 0.1); rig.add(lock);
    var lb = L.BX(0.05, 0.4, 0.05, M.steel, 0, -0.2, 0); lb.rotation.z = 0; lock.add(lb, L.CZ(0.05, 0.1, M.brass, 0, 0, 0, 10));
    P("Locking pawl", "A fixed hook that stops the wheel sliding backwards. It makes the click sound!", lock, [0, 0.4, 0.4]);
    var theta = 0, lastA = 0;
    return {
      parts: P.list, ground: "mat", platMin: 2.4,
      update: function (ph, amt) {
        var a = 0.27 * Math.sin(ph * 2.4), da = a - lastA; lastA = a;
        if (da > 0) theta += da;
        lev.rotation.z = -(a * 1.0) + 0.0; wheel.rotation.z = -theta;
        lock.rotation.z = 0.06 * Math.abs(Math.sin(theta * N * 0.5 * (1))) * 0;
        lock.rotation.z = -0.08 * Math.max(0, Math.sin(theta * N + 0.5));
        return {};
      }
    };
  });

  /* ---------------- 21. CABLE CAR ---------------- */
  def("cablecar", { name: "Cable Car", fam: "Outdoor machines", emoji: "🚡", science: "pulley", platMin: 3.4,
    blurb: "A string slung between two posts. A little pulley wheel rolls down the line carrying a cup passenger." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var xa = -2.1, ya = 2.5, xb = 2.1, yb = 1.55;
    var postA = L.G(), postB = L.G(); rig.add(postA, postB);
    postA.add(L.CYT(0.1, 0.12, ya, L.paint(pal.c, { r: 0.7 }), xa, ya / 2, 0, 20), L.CY(0.4, 0.12, M.stone, xa, 0.06, 0, 20));
    postB.add(L.CYT(0.1, 0.12, yb, L.paint(pal.a, { r: 0.7 }), xb, yb / 2, 0, 20), L.CY(0.4, 0.12, M.stone, xb, 0.06, 0, 20));
    P("High post", "A tall cardboard tube held in a pot of stones. The line starts high so gravity can pull the car down.", postA, [-0.4, 0.2, 0], true);
    P("Low post", "The line ends lower down. The steeper the slope, the faster the car goes.", postB, [0.4, 0.1, 0]);
    var line = L.barRound(0.016, M.white); L.place2(line, xa, ya, xb, yb, 0); rig.add(line);
    P("String line", "Keep it tight! A slack line sags and the car slows down.", line, [0, 0.35, 0]);
    var tr = L.G(), trW = L.G(); trW.add(tr); rig.add(trW);
    var wheel = L.capWheel(0.13, pal.b, false); tr.add(wheel);
    var hang = L.barRound(0.012, M.white); tr.add(hang);
    var gond = L.G(); tr.add(gond);
    gond.add(L.CYT(0.24, 0.16, 0.36, L.paint(pal.d, { r: 0.6 }), 0, -0.32, 0, 24), L.pompom(0.12, pal.a), L.googly(0.05, 0.07, 0.1, 0));
    gond.children[1].position.y = -0.1; gond.children[2].position.set(0, -0.08, 0.1);
    P("Trolley wheel", "A bottle-cap pulley rolls along the string. It hangs on the line, held by its groove.", trW, [0, 0.4, 0.4], true);
    
    var slope = Math.atan2(yb - ya, xb - xa), pos = 0.1, wr = 0;
    P.list.push({ name: "Cup gondola", desc: "A paper cup swings underneath. The passenger is a pom-pom!", obj: gond, ex: L.V3(0, -0.5, 0), big: false });
    return {
      parts: P.list, ground: "grass",
      update: function (ph, amt, dt) {
        var t = ph % 7.6, u;
        if (t < 3.4) u = 0.08 + 0.8 * (t / 3.4) * (t / 3.4); else if (t < 3.9) u = 0.88; else if (t < 7.1) u = 0.88 - 0.8 * ((t - 3.9) / 3.2); else u = 0.08;
        var x = xa + (xb - xa) * u, y = ya + (yb - ya) * u;
        var du = u - pos; pos = u; wr += du * 4.2 / 0.13;
        tr.position.set(x, y + 0.13, 0); wheel.rotation.z = -wr;
        L.place2(hang, 0, -0.1, 0, -0.3, 0);
        var sway = Math.sin(ph * 2.2) * 0.05 * amt + (t < 3.4 ? -0.06 : (t < 3.9 ? 0.12 * Math.exp(-(t - 3.4) * 3) * Math.cos((t - 3.4) * 10) : 0.04));
        gond.rotation.z = sway; hang.rotation.z = sway; hang.position.set(0, -0.2, 0); hang.scale.set(1, 0.4, 1);
        return {};
      }
    };
  });

  /* ---------------- 22. DESK FAN ---------------- */
  def("fan", { name: "Desk Fan", fam: "Motors & circuits", emoji: "🌀", science: "circuit", motorDefault: true,
    blurb: "Flip the switch, the circuit is complete, and the motor spins a propeller that pushes air at you." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var base = L.BX(1.5, 0.3, 1.1, L.paint(pal.c, { r: 0.7 }), 0, 0.15, 0); rig.add(base);
    P("Base box", "A box that is heavy enough not to tip over. The batteries live inside.", base, [0, -0.1, 0], true);
    var post = L.CYT(0.08, 0.1, 1.2, M.tube, -0.1, 0.9, 0, 18); rig.add(post);
    P("Stand", "A tube lifts the fan up so the breeze reaches your face.", post, [0, 0.0, 0]);
    var head = L.G(); head.position.set(-0.1, 1.55, 0); rig.add(head);
    head.add(L.CX(0.2, 0.7, M.steel, 0.0, 0, 0, 24), L.CX(0.03, 0.4, M.metal, 0.5, 0, 0, 8), L.TOR(0.92, 0.03, M.metal, 0.7, 0, 0, 56));
    head.children[2].rotation.y = PI / 2;
    var prop = L.G(); prop.position.set(0.58, 0, 0); head.add(prop);
    prop.add(L.CX(0.1, 0.12, L.paint(pal.d, { r: 0.4 }), 0, 0, 0, 16));
    for (var i = 0; i < 4; i++) { var b = L.G(); b.rotation.x = (i / 4) * PI * 2; var bl = L.BX(0.025, 0.7, 0.28, L.paint(i % 2 ? pal.a : pal.b, { r: 0.6 }), 0, 0.46, 0); bl.rotation.y = 0.55; b.add(bl); prop.add(b); }
    P("Motor", "Turns electricity into spinning. Inside are magnets and coils of wire.", head, [-0.3, 0.3, 0], true);
    P("Propeller", "Blades set at a slant. They scoop the air and push it forwards.", prop, [0.5, 0, 0], true);
    var batt = L.G(); batt.position.set(0.3, 0.33, -0.25); batt.add(L.BX(0.8, 0.14, 0.34, M.black), L.CX(0.07, 0.7, M.metal, 0, 0.1, 0.08, 10)); rig.add(batt);
    P("Battery holder", "Two AA batteries. Their push is called voltage.", batt, [0.3, 0.4, -0.5]);
    var swc = L.G(); swc.position.set(0.5, 0.32, 0.35); swc.add(L.BX(0.32, 0.1, 0.2, M.white), L.BX(0.06, 0.3, 0.05, M.wireR, 0, 0.2, 0)); rig.add(swc);
    var lever = swc.children[1];
    P("Switch", "A switch is a gap in the wire you can open and close. Closed gap = electricity flows.", swc, [0.4, 0.4, 0.5]);
    var wire = L.tube([[0.1, 0.4, -0.2], [-0.05, 0.8, -0.1], [-0.1, 1.3, -0.05], [-0.05, 1.5, 0]], 0.014, M.wireR, false, 24); rig.add(wire);
    var st = [], sg = L.G(); root.add(sg);
    for (var k = 0; k < 9; k++) { var s = L.BX(0.55, 0.014, 0.014, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }), 0, 1.55 + ((k * 0.37) % 1.1) - 0.55, ((k * 0.53) % 1.1) - 0.55); s.castShadow = false; sg.add(s); st.push({ m: s, x: 1.2 + (k * 0.6) % 2 }); }
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt, dt) {
        prop.rotation.x = ph * 30; lever.rotation.z = -0.55 * amt;
        head.rotation.y = Math.sin(ph * 0.8) * 0.45 * amt;
        st.forEach(function (s) { s.x += 2.6 * (dt || 0.016) * amt; if (s.x > 3.4) s.x = 1.1; s.m.position.x = s.x; s.m.material.opacity = 0.5 * amt * (1 - L.sstep(2.4, 3.4, s.x)); });
        return {};
      }
    };
  });
})();

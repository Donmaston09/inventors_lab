/* Models 1–11: creatures, mechanisms, first vehicles */
(function () {
  "use strict";
  var INV = window.INV, L = INV.L, T = L.T;
  var def = INV.defModel;
  var PI = Math.PI;

  function axle(M, len, x, y, z) { return L.CZ(0.025, len, M.skewer, x, y, z, 10); }

  /* A syringe along +X: nozzle at x=0, barrel to x=len. set(p, rodLen) places the plunger. */
  function syringe(M, len, r) {
    var g = new T.Group();
    var barrel = L.CX(r, len, M.clear, len / 2, 0, 0, 24);
    var fluid = L.CX(r * 0.86, 1, L.paint(0x2f9bff, { r: 0.2 }), 0, 0, 0, 20);
    var tip = L.CX(r * 0.28, 0.16, M.clear, -0.07, 0, 0, 10);
    var flange = L.CX(r * 1.7, 0.03, M.white, len, 0, 0, 20);
    var pl = new T.Group();
    var stopper = L.CX(r * 0.9, 0.09, M.rubber, 0, 0, 0, 20);
    var rod = L.CX(0.045, 1, M.white, 0.5, 0, 0, 10);
    var thumb = L.CX(r * 1.5, 0.035, M.white, 1, 0, 0, 20);
    pl.add(stopper, rod, thumb);
    g.add(barrel, fluid, tip, flange, pl);
    g.userData.set = function (p, tipX) {
      fluid.scale.x = Math.max(0.001, p); fluid.position.x = p / 2;
      pl.position.x = p;
      var rl = Math.max(0.1, tipX - p);
      rod.scale.x = rl; rod.position.x = rl / 2; thumb.position.x = rl;
    };
    return g;
  }

  /* ---------------- 1. WOBBLE BOT ---------------- */
  def("wobble", { name: "Wobble Bot", fam: "Robots & creatures", emoji: "🤖", science: "vibration", motorDefault: true,
    blurb: "A paper-cup robot that shuffles along because a motor with a lopsided lump shakes it." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var body = L.CYT(0.5, 0.72, 1.25, L.paint(pal.c, { r: 0.7 }), 0, 1.125, 0, 40);
    P("Cup body", "A paper cup turned upside down makes the robot's body.", body, [0, 0.3, 0], true); rig.add(body);
    var eyes = L.googly(0.17, 0.25, 0.0, 0); eyes.position.set(0, 1.3, 0.56); rig.add(eyes);
    P("Googly eyes", "Eyes make it feel alive. They do not do anything!", eyes, [0, 0.1, 0.5]);
    var legs = L.G(); rig.add(legs);
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a);
      var bar = L.barStrip(0.1, 0.035, M.wood); L.place(bar, L.V3(c * 0.6, 0.62, s * 0.6), L.V3(c * 0.98, 0.04, s * 0.98)); legs.add(bar);
      var foot = L.cap(0.11, i % 2 ? pal.a : pal.b, 0.05); foot.position.set(c * 0.98, 0.0, s * 0.98); legs.add(foot);
    }
    P("Lolly-stick legs", "Bendy legs with bottle-cap feet. When the body shakes, the legs shuffle forward.", legs, [0, -0.35, 0]);
    var plate = L.CY(0.52, 0.04, M.card, 0, 1.77, 0, 32); rig.add(plate);
    var motor = L.CX(0.16, 0.5, M.steel, 0, 1.98, 0.12, 20); rig.add(motor);
    var shaftEnd = L.CX(0.025, 0.2, M.metal, 0.35, 1.98, 0.12, 8); rig.add(shaftEnd);
    P("Motor", "A small electric motor. On its own it just spins.", motor, [0, 0.55, 0]);
    var weight = L.G(); weight.position.set(0.46, 1.98, 0.12);
    weight.add(L.CX(0.07, 0.06, L.paint(pal.a, { r: 0.4 }), 0, 0, 0, 14));
    weight.add(L.SP(0.11, L.paint(pal.b, { r: 0.5 }), 0, 0.14, 0, 14, 10));
    rig.add(weight);
    P("Wobble weight", "A lump stuck off-centre on the motor shaft. Spinning it unevenly makes everything shake!", weight, [0.5, 0.35, 0], true);
    var batt = L.G(); batt.add(L.BX(0.8, 0.26, 0.36, M.black, 0, 0, 0));
    batt.add(L.CX(0.08, 0.7, M.metal, 0, 0.13, 0.08, 10)); batt.position.set(0, 1.93, -0.36); rig.add(batt);
    batt.add(L.BX(0.1, 0.05, 0.2, M.wireR, -0.46, 0.05, 0));
    P("Battery box", "Two AA batteries live in here. They push electricity round the wires to the motor.", batt, [0, 0.45, -0.4]);
    var wire = L.tube([[-0.4, 1.95, -0.2], [-0.35, 1.85, 0.05], [-0.18, 1.98, 0.12]], 0.015, M.wireR, false, 20); rig.add(wire);
    var ant = L.pipeCleaner([[-0.35, 1.78, -0.1], [-0.5, 2.2, -0.05], [-0.4, 2.55, 0.1]], pal.d, 0.018); rig.add(ant);
    var pp = L.pompom(0.1, pal.b); pp.position.set(-0.4, 2.58, 0.1); rig.add(pp);
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt) {
        var k = amt;
        rig.position.x = (Math.sin(ph * 53) * 0.014 + Math.sin(ph * 31) * 0.01) * k;
        rig.position.z = Math.cos(ph * 43) * 0.012 * k;
        rig.rotation.z = Math.sin(ph * 47) * 0.014 * k;
        legs.rotation.y = Math.sin(ph * 6) * 0.03 * k;
        weight.rotation.x = ph * 46;
        return { speed: 0.3 * k };
      }
    };
  });

  /* ---------------- 2. CAM NODDER ---------------- */
  def("cam", { name: "Cam Nodder", fam: "Mechanisms", emoji: "🎛️", science: "cam",
    blurb: "Turn the handle: a lopsided wheel (a cam) pushes a rod and the robot head pops up and down." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal;
    var W = 2.4, H = 1.1, D = 1.3, t = 0.05, hubY = 0.58, R = 0.38, e = 0.2;
    var box = L.G();
    box.add(L.BX(W, t, D, M.card, 0, t / 2, 0), L.BX(t, H, D, M.card, -W / 2 + t / 2, H / 2, 0), L.BX(t, H, D, M.card, W / 2 - t / 2, H / 2, 0),
      L.BX(W, H, t, M.cardIn, 0, H / 2, -D / 2 + t / 2));
    box.add(L.BX(W / 2 - 0.12, t, D, M.card, -(W / 4 + 0.06), H, 0), L.BX(W / 2 - 0.12, t, D, M.card, W / 4 + 0.06, H, 0),
      L.BX(0.24, t, D / 2 - 0.12, M.card, 0, H, -(D / 4 + 0.06)), L.BX(0.24, t, D / 2 - 0.12, M.card, 0, H, D / 4 + 0.06));
    root.add(box); P("Cardboard box", "The box holds everything in place. The front is cut away so you can see inside.", box, [0, 0, 0], true);
    var shaft = L.CX(0.04, W + 0.7, M.skewer, 0.2, hubY, 0, 10); root.add(shaft);
    var camG = L.G(); camG.position.set(0, hubY, 0);
    camG.add(L.CX(R, 0.16, L.paint(pal.a, { r: 0.7 }), 0, e, 0, 40));
    camG.add(L.CX(0.06, 0.2, M.white, 0, 0, 0, 12));
    root.add(camG); P("Cam", "A circle with the hole in the wrong place! As it turns, its edge pushes the rod up, then lets it drop.", camG, [0, 0, 0.95], true);
    var foll = L.G();
    foll.add(L.CY(0.2, 0.04, M.card, 0, 0.02, 0, 20), L.CY(0.06, 0.62, M.steel, 0, 0.35, 0, 12));
    var head = L.G(); head.position.y = 0.95;
    head.add(L.BX(0.95, 0.72, 0.7, L.paint(pal.c, { r: 0.7 }), 0, 0, 0));
    var ey = L.googly(0.15, 0.22, 0.36, 0); ey.position.y = 0.08; head.add(ey);
    head.add(L.BX(0.4, 0.06, 0.02, M.pupil, 0, -0.2, 0.355));
    head.add(L.pipeCleaner([[0, 0.36, 0], [0.1, 0.62, 0], [0.0, 0.8, 0]], pal.d, 0.016));
    var pp = L.pompom(0.08, pal.b); pp.position.set(0, 0.84, 0); head.add(pp);
    foll.add(head); var follW = L.G(); follW.add(foll); root.add(follW);
    P("Pop-up head & rod", "The head rides on a rod that follows the cam, so it moves exactly how the cam tells it to.", follW, [0, 0.9, 0]);
    var drive = L.G(); drive.position.set(W / 2 + 0.38, hubY, 0); root.add(drive);
    var spin = L.G(); drive.add(spin);
    if (o.motor) {
      var m = L.CX(0.17, 0.55, M.steel, 0.2, 0, 0, 20), bt = L.BX(0.4, 0.3, 0.8, M.black, 0.3, -0.42, 0);
      drive.add(m, bt);
      P("Motor & batteries", "A motor turns the cam for you, so your hands are free for tinkering.", drive, [0.8, 0, 0]);
    } else {
      spin.add(L.BX(0.07, 0.55, 0.09, M.wood, 0, 0.26, 0), L.CX(0.08, 0.3, paint(pal.d), 0.1, 0.55, 0, 12));
      function paint(c) { return L.paint(c, { r: 0.5 }); }
      P("Crank handle", "Turn this by hand. It is a lever that spins the shaft.", drive, [0.8, 0, 0]);
    }
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt) {
        var th = ph * 3.2;
        camG.rotation.x = -th; spin.rotation.x = -th;
        foll.position.y = hubY + R + e * Math.cos(th) + 0.01;
        return {};
      }
    };
  });

  /* ---------------- 3. SNAP CRAB ---------------- */
  def("crab", { name: "Snap Crab", fam: "Robots & creatures", emoji: "🦀", science: "lever",
    blurb: "Pull the string and the crab's claws snap shut. Two levers share one pull." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var shell = L.SP(0.9, L.paint(pal.a, { r: 0.6 }), 0, 0.5, 0, 32, 20); shell.scale.set(1.25, 0.5, 1);
    rig.add(shell); P("Shell", "A cardboard dome painted like a crab shell. All the parts attach to it.", shell, [0, 0.35, 0], true);
    for (var i = 0; i < 6; i++) { var d = L.SP(0.07, L.paint(pal.b, { r: 0.7 }), (i - 2.5) * 0.28, 0.82 - Math.abs(i - 2.5) * 0.05, ((i % 2) - 0.5) * 0.3, 8, 6); rig.add(d); }
    var ey = L.G(); [-1, 1].forEach(function (s) {
      ey.add(L.CY(0.025, 0.4, M.metal, s * 0.3, 0.2, 0.0, 8));
      var e = L.G(); e.position.set(s * 0.3, 0.45, 0); e.add(L.SP(0.13, M.white, 0, 0, 0, 14, 10), L.SP(0.07, M.pupil, 0, 0, 0.1, 10, 8)); ey.add(e);
    });
    ey.position.set(0, 0.85, 0.5); rig.add(ey); P("Eye stalks", "Straw stalks with googly eyes on top.", ey, [0, 0.45, 0.2]);
    var legs = L.G(); rig.add(legs); var legGs = [];
    [-1, 1].forEach(function (s) {
      for (var k = 0; k < 3; k++) {
        var lg = L.G(); lg.position.set(s * 1.0, 0.4, -0.45 + k * 0.38);
        lg.add(L.pipeCleaner([[0, 0, 0], [s * 0.3, 0.15, 0.05], [s * 0.6, -0.1, 0.12], [s * 0.7, -0.4, 0.14]], pal.b, 0.022));
        legs.add(lg); legGs.push({ g: lg, s: s, k: k });
      }
    });
    P("Pipe-cleaner legs", "Six bendy legs. Crabs scuttle sideways!", legs, [0, -0.2, 0]);
    var claws = [], jaws = L.G(); rig.add(jaws);
    [-1, 1].forEach(function (s) {
      var arm = L.barStrip(0.12, 0.06, L.paint(pal.a, { r: 0.6 })); L.place(arm, L.V3(s * 1.0, 0.4, 0.45), L.V3(s * 1.28, 0.32, 1.0)); jaws.add(arm);
      var fixed = L.BX(0.16, 0.07, 0.7, L.paint(pal.a, { r: 0.6 }), s * 1.28 + s * 0.12, 0.32, 1.32); jaws.add(fixed);
      var mov = L.G(); mov.position.set(s * 1.28 - s * 0.06, 0.32, 1.0);
      mov.add(L.BX(0.15, 0.07, 0.7, L.paint(pal.b, { r: 0.5 }), 0, 0, 0.35)); mov.add(L.CY(0.06, 0.1, M.brass, 0, 0, 0, 10));
      jaws.add(mov); claws.push({ g: mov, s: s });
    });
    P("Snapping claws", "Each claw has a fixed jaw and a jaw that swings on a split pin. That is a lever.", jaws, [0, 0.1, 0.6], true);
    var beadW = L.G(); rig.add(beadW);
    var bead = L.SP(0.1, L.paint(pal.d, { r: 0.4 }), 0, 0.35, -1.2, 14, 10); beadW.add(bead);
    var str = L.barRound(0.012, M.white); beadW.add(str);
    P("Pull-string & bead", "Pulling the bead tugs the claws shut. Let go and the claws spring open again.", beadW, [0, 0, -0.8]);
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt) {
        var a = 0.28 + 0.28 * Math.sin(ph * 3.6);
        a = 0.28 + (a - 0.28) * amt;
        claws.forEach(function (c) { c.g.rotation.y = -c.s * (-0.04 + a * 0.9); });
        bead.position.z = -1.05 - (0.56 - a) * 0.5;
        L.place(str, L.V3(0, 0.35, -0.85), bead.position);
        legGs.forEach(function (lg) { lg.g.rotation.y = Math.sin(ph * 9 + lg.k * 2 + lg.s) * 0.11 * amt; });
        rig.position.x = Math.sin(ph * 1.2) * 0.12 * amt;
        return { speed: 0 };
      }
    };
  });

  /* ---------------- 4. BIPED/QUAD WALKER ---------------- */
  def("walker", { name: "Crank Walker", fam: "Robots & creatures", emoji: "🚶", science: "linkage",
    blurb: "A turning crank lifts and swings the legs one after another, so the robot walks." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var hipY = 1.35, a = 0.42, b = 0.24;
    var body = L.BX(2.0, 0.9, 1.0, L.paint(pal.c, { r: 0.7 }), 0, hipY + 0.42, 0); rig.add(body);
    P("Body box", "A cardboard box is the strong body. Everything else is fixed to it.", body, [0, 0.35, 0], true);
    var head = L.G(); head.position.set(0.95, hipY + 1.1, 0);
    head.add(L.CYT(0.28, 0.4, 0.55, L.paint(pal.b, { r: 0.6 }), 0, 0, 0, 24), L.googly(0.1, 0.14, 0.3, 0.5));
    head.children[1].position.y = 0.05;
    head.add(L.pipeCleaner([[0, 0.27, 0], [0.05, 0.5, 0], [0, 0.65, 0.05]], pal.d, 0.016)); rig.add(head);
    P("Head", "A tiny paper-cup head. Just for fun!", head, [0.4, 0.4, 0]);
    var legDefs = [[0.55, 0.62, 0], [-0.55, 0.62, PI], [0.55, -0.62, PI], [-0.55, -0.62, 0]], legs = [];
    var legGroup = L.G(), feetGroup = L.G(); rig.add(legGroup, feetGroup);
    legDefs.forEach(function (d) {
      var bar = L.barStrip(0.11, 0.04, M.card); legGroup.add(bar);
      var foot = L.cap(0.15, pal.a, 0.07); feetGroup.add(foot);
      var pin = L.CZ(0.05, 0.08, M.brass, d[0], hipY, d[1] + (d[1] > 0 ? 0.03 : -0.03), 10); legGroup.add(pin);
      legs.push({ bar: bar, foot: foot, x: d[0], z: d[1], ph: d[2] });
    });
    P("Cardboard legs", "Each leg slides through a slot at the hip. As the crank turns, the foot goes forward, lifts, and steps.", legGroup, [0, 0, 0.3], true);
    P("Bottle-cap feet", "Caps make flat feet that grip the floor.", feetGroup, [0, -0.25, 0.25]);
    var drive = L.G(); drive.position.set(0, hipY + 0.42, 0.78); rig.add(drive);
    var wheel = L.capWheel(0.3, pal.a, false); drive.add(wheel);
    var pin2 = L.CZ(0.04, 0.3, M.metal, 0.17, 0, 0.1, 8); wheel.add(pin2);
    var rods = [0, 1].map(function () { var r = L.barRound(0.025, M.steel); rig.add(r); return r; });
    if (o.motor) {
      var m = L.CX(0.17, 0.5, M.steel, 0, 0.7, 0, 18), bt = L.BX(0.8, 0.26, 0.36, M.black, 0.1, 0.7, -0.4);
      rig.add(m, bt); m.position.set(0, hipY + 1.1, 0.0); bt.position.set(-0.3, hipY + 0.98, 0.0);
      P("Motor & battery", "The motor turns the crank for you.", L.G(), null); P.list.pop();
    }
    P("Crank wheel", "A wheel with a pin near the edge. The pin goes round in a circle and pushes the rods.", drive, [0, 0, 0.5]);
    var rodsPart = L.G(); P("Push rods", "Thin rods link the crank pin to the legs.", rodsPart, [0, 0.0, 0.4]); rig.add(rodsPart); rods.forEach(function (r) { rodsPart.add(r); });
    function foot(phi) {
      var u = ((phi % (PI * 2)) + PI * 2) % (PI * 2);
      if (u < PI) { var s = u / PI; return [a * (1 - 2 * s), 0]; }
      var v = (u - PI) / PI; return [-a + 2 * a * v, b * Math.sin(PI * v)];
    }
    var speed = (2 * a * 3.0) / PI;
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt) {
        var th = ph * 3.0;
        legs.forEach(function (lg) {
          var f = foot(th + lg.ph), hx = lg.x, hz = lg.z + (lg.z > 0 ? 0.0 : 0.0);
          var fx = hx + f[0] * 1.0, fy = 0.07 + f[1];
          L.place(lg.bar, L.V3(hx, hipY, hz), L.V3(fx, fy + 0.07, hz));
          lg.foot.position.set(fx, fy, hz);
        });
        wheel.rotation.z = -th;
        var px = Math.cos(-th) * 0.17, py = Math.sin(-th) * 0.17;
        rods[0].visible = rods[1].visible = true;
        var pin = L.V3(px, hipY + 0.42 + py, 0.9);
        [0, 1].forEach(function (i) { var lg = legs[i]; var mid = L.V3(lg.x + (lg.bar.position.x - lg.x) * 0.5, hipY - 0.25 + (lg.bar.position.y - hipY) * 0.0, 0.66); L.place(rods[i], pin, L.V3(lg.bar.position.x, lg.bar.position.y, 0.66)); });
        rig.position.y = Math.sin(th * 2) * 0.012 * amt;
        return { speed: speed * amt };
      }
    };
  });

  /* ---------------- 5. FLAPPY BIRD ---------------- */
  def("flappy", { name: "Flappy Bird", fam: "Robots & creatures", emoji: "🐦", science: "linkage",
    blurb: "A crank turns round and round, and a rod turns that into wings going up and down." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, bird = L.G(); bird.position.y = 1.55; root.add(bird);
    var PV = 0.82, r = 0.2, y0 = -0.25;
    var body = L.SP(0.7, L.paint(pal.a, { r: 0.7 }), 0, 0.5, 0, 28, 18); body.scale.set(1.35, 0.8, 0.8); bird.add(body);
    var head = L.G(); head.position.set(0.95, 0.85, 0);
    head.add(L.SP(0.34, L.paint(pal.a, { r: 0.7 }), 0, 0, 0, 20, 14), L.googly(0.1, 0.17, 0.25, 0.4));
    head.children[1].rotation.y = PI / 2 - 0.3; head.children[1].position.set(0.14, 0.08, 0);
    var beak = L.mesh(new T.ConeGeometry(0.11, 0.38, 14), L.paint(pal.d, { r: 0.5 })); beak.rotation.z = -PI / 2; beak.position.set(0.42, -0.02, 0); head.add(beak);
    bird.add(head);
    P("Body & head", "Painted cardboard shapes. The body hides the crank.", body, [0, 0.1, 0], true);
    P("Beak", "A cone of card. It just looks nice!", head, [0.5, 0.2, 0]);
    var tail = L.BX(0.8, 0.05, 0.5, L.paint(pal.b, { r: 0.6 }), -1.25, 0.65, 0); tail.rotation.z = 0.35; bird.add(tail);
    var wings = [], wingG = L.G(); bird.add(wingG);
    [-1, 1].forEach(function (s) {
      var g = L.G(); g.position.set(0, PV, 0);
      g.add(L.BX(0.85, 0.045, 1.15, L.paint(pal.b, { r: 0.6 }), 0, 0, s * 0.62), L.BX(0.6, 0.05, 0.75, L.paint(pal.d, { r: 0.6 }), -0.08, 0.02, s * 0.5));
      g.add(L.CX(0.03, 0.3, M.brass, 0, 0, s * 0.05, 8)); wingG.add(g); wings.push({ g: g, s: s });
    });
    P("Wings", "Two card wings that swing on hinges at the top of the body.", wingG, [0, 0.45, 0], true);
    var standH = 1.55 + y0 - 0.02;
    var stand = L.G();
    stand.add(L.CYT(0.12, 0.15, standH, L.paint(pal.c, { r: 0.7 }), 0, -1.55 + standH / 2, 0, 24), L.CY(0.65, 0.06, M.card, 0, -1.55 + 0.03, 0, 36));
    bird.add(stand);
    P("Stand", "A tube stand holds the bird up and carries the crank.", stand, [0, -0.5, 0]);
    var crank = L.G(); crank.position.set(0, y0, 0); bird.add(crank);
    var wheel = L.capWheel(0.3, pal.a, false); crank.add(wheel);
    var pinMesh = L.CZ(0.045, 0.5, M.metal, r, 0, 0, 8); wheel.add(pinMesh);
    var knob = L.CZ(0.09, 0.08, L.paint(pal.d, { r: 0.4 }), r, 0, 0.3, 14); wheel.add(knob);
    if (o.motor) {
      var m = L.CX(0.17, 0.5, M.steel, 0.4, -0.45, 0, 18), bt = L.BX(0.75, 0.24, 0.32, M.black, -0.5, -0.55, 0); bird.add(m, bt);
    }
    P("Crank wheel", o.motor ? "A motor turns this wheel. The pin near its edge goes round in a circle." : "Turn it by hand. The pin near the edge goes round in a circle.", crank, [0, -0.4, 0.55]);
    var rods = [-1, 1].map(function (s) { var rr = L.barRound(0.022, M.steel); bird.add(rr); return { m: rr, s: s }; });
    var rodsG = L.G(); P("Push rods", "Rods link the spinning pin to the wings. Up goes the rod, up go the wings.", rodsG, [0, -0.2, 0.4]);
    rods.forEach(function (r) { rodsG.add(r.m); }); bird.add(rodsG);
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt) {
        var th = ph * 4.0;
        wheel.rotation.z = th;
        var s1 = Math.sin(th), flap = Math.asin(L.clamp(s1 * r / 0.28, -1, 1));
        wings.forEach(function (w) { w.g.rotation.x = -w.s * (flap + 0.08); });
        var px = r * Math.cos(th), py = y0 + r * s1;
        rods.forEach(function (rd) {
          var A = L.V3(px, PV + 0.28 * Math.sin(flap + 0.08), rd.s * 0.28 * Math.cos(flap + 0.08));
          L.place(rd.m, L.V3(px, py, rd.s * 0.1), A);
        });
        bird.position.y = 1.55 + Math.sin(th * 2) * 0.025 * amt;
        return {};
      }
    };
  });

  /* ---------------- 6. HYDRAULIC ARM ---------------- */
  def("hydraulic", { name: "Hydraulic Arm", fam: "Robots & creatures", emoji: "🦾", science: "hydraulics",
    blurb: "Push one syringe and water pushes another syringe, which lifts the robot arm." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal;
    var base = L.BX(2.1, 0.5, 1.3, M.card, 0.3, 0.25, 0); root.add(base);
    P("Cardboard base", "A heavy box that does not tip over when the arm reaches out.", base, [0, -0.1, 0], true);
    var pv = L.V3(-0.35, 0.85, 0), A = L.V3(0.9, 0.5, 0), dQ = 0.75, barrelLen = 0.9;
    var post = L.BX(0.16, 0.7, 0.9, M.cardDark, pv.x, 0.6, 0); root.add(post);
    var armG = L.G(); armG.position.copy(pv); root.add(armG);
    var up = L.G(); [-1, 1].forEach(function (s) { up.add(L.BX(1.7, 0.14, 0.06, L.paint(pal.c, { r: 0.7 }), 0.85, 0, s * 0.18)); }); armG.add(up);
    up.add(L.CZ(0.08, 0.5, M.brass, 0, 0, 0, 12));
    var fore = L.G(); fore.position.set(1.7, 0, 0); armG.add(fore);
    [-1, 1].forEach(function (s) { fore.add(L.BX(1.3, 0.12, 0.05, L.paint(pal.a, { r: 0.7 }), 0.65, 0, s * 0.15)); });
    fore.add(L.CZ(0.07, 0.45, M.brass, 0, 0, 0, 12));
    var claw = L.G(); claw.position.set(1.3, 0, 0); fore.add(claw);
    var jaws = [-1, 1].map(function (s) { var j = L.G(); j.add(L.BX(0.5, 0.07, 0.06, L.paint(pal.b, { r: 0.5 }), 0.25, 0, 0)); j.position.z = s * 0.1; claw.add(j); return { g: j, s: s }; });
    claw.add(L.CZ(0.07, 0.3, M.steel, 0, 0, 0, 10));
    P("Upper arm", "Two cardboard strips that swing up and down on a pin.", up, [0, 0.55, 0], true);
    P("Forearm & claw", "A fixed-bend forearm with a pinching claw.", fore, [0.2, 0.7, 0]);
    var slave = syringe(M, barrelLen, 0.13); slave.position.copy(A); root.add(slave);
    P("Lifting syringe", "This syringe is full of water. When water arrives, its plunger pushes the arm upwards.", slave, [0.1, -0.1, 0.5], true);
    var ctrl = syringe(M, 0.95, 0.13); ctrl.position.set(1.3, 0.7, 0.62); ctrl.rotation.y = 0; root.add(ctrl);
    P("Controller syringe", "YOU push this one. Water has nowhere to go but along the tube, so it pushes the other syringe.", ctrl, [0.5, 0.2, 0.6], true);
    var tub = L.tube([[0.9, 0.5, 0], [1.0, 0.4, 0.25], [1.15, 0.5, 0.55], [1.22, 0.7, 0.62]], 0.045, M.water, false, 30); root.add(tub);
    P("Water tube", "A bendy tube full of water. Water does not squash, so it passes the push along.", tub, [0.3, 0, 0.4]);
    var sMaxExt = 0.57;
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt) {
        var phi = 0.75 + 0.4 * Math.sin(ph * 1.6) * (amt > 0.001 ? 1 : 0) * 1;
        phi = 0.75 + (phi - 0.75) * 1;
        armG.rotation.z = phi; fore.rotation.z = -1.0 - 0.0;
        var Q = L.V3(pv.x + dQ * Math.cos(phi), pv.y + dQ * Math.sin(phi), 0);
        var dx = Q.x - A.x, dy = Q.y - A.y, dist = Math.hypot(dx, dy);
        slave.rotation.z = Math.atan2(dy, dx);
        var ext = Math.max(0.02, dist - barrelLen);
        slave.userData.set(0.12 + ext, dist);
        ctrl.userData.set(0.9 - ext + 0.02, 1.9);
        var open = 0.15 + 0.3 * (0.5 + 0.5 * Math.sin(ph * 3.3));
        jaws.forEach(function (j) { j.g.rotation.z = j.s * open; });
        return {};
      }
    };
  });

  /* ---------------- 7. SCISSOR GRABBER ---------------- */
  def("scissor", { name: "Scissor Grabber", fam: "Mechanisms", emoji: "✂️", science: "linkage",
    blurb: "Criss-crossed strips make a reach-and-grab arm that stretches like magic." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.set(-1.5, 1.15, 0); rig.scale.setScalar(1.25); root.add(rig);
    var n = 4, Lh = 0.42, bars = [], pins = [];
    for (var i = 0; i < n; i++) {
      var A = L.barStrip(0.15, 0.035, L.paint(i % 2 ? pal.a : pal.b, { r: 0.7 })), B = L.barStrip(0.15, 0.035, L.paint(i % 2 ? pal.b : pal.a, { r: 0.7 }));
      rig.add(A, B); bars.push({ A: A, B: B });
      var pm = L.CZ(0.045, 0.12, M.brass, 0, 0, 0, 10); rig.add(pm); pins.push(pm);
    }
    var jointPins = []; for (var j = 0; j <= n; j++) { var jp = L.CZ(0.04, 0.14, M.steel, 0, 0, 0, 8); rig.add(jp); jointPins.push(jp); }
    var barG = L.G(); bars.forEach(function (b) { barG.add(b.A, b.B); });
    var handle = L.G(); handle.add(L.BX(0.3, 0.62, 0.4, L.paint(pal.c, { r: 0.7 }), -0.22, 0, 0), L.TOR(0.2, 0.05, M.black, -0.5, 0, 0));
    handle.add(L.BX(0.5, 0.9, 0.5, M.card, -0.2, -0.75, 0));
    rig.add(handle);
    var claw = L.G(); rig.add(claw);
    var cj = [-1, 1].map(function (s) { var g = L.G(); g.add(L.BX(0.4, 0.05, 0.08, L.paint(pal.d, { r: 0.5 }), 0.2, 0, 0)); claw.add(g); return { g: g, s: s }; });
    var clawW = L.G(); rig.remove(claw); clawW.add(claw); rig.add(clawW);
    var pinG = L.G(); pins.forEach(function (pm) { rig.remove(pm); pinG.add(pm); }); jointPins.forEach(function (jp) { rig.remove(jp); pinG.add(jp); }); rig.add(pinG);
    rig.add(barG);
    P("Criss-cross strips", "Strips pinned in the middle make X shapes. Squeeze one end and ALL the X's get taller and thinner, so the whole arm stretches out.", barG, [0, 0.7, 0], true);
    P("Split pins", "Pins let the strips swing but never slide apart.", pinG, [0, 0.35, 0.4]);
    P("Handle", "Squeeze here. A small movement here becomes a long reach at the other end.", handle, [-0.4, 0, 0]);
    P("Grabber jaws", "Two jaws open as the arm reaches out.", clawW, [0.6, 0, 0]);
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt) {
        var al = 0.42 + 0.27 * Math.sin(ph * 1.7);
        var c = Math.cos(al) * Lh, s = Math.sin(al) * Lh;
        for (var i = 0; i < n; i++) {
          var xc = (2 * i + 1) * c;
          L.place2(bars[i].A.isMesh ? bars[i].A : bars[i].A, xc - c, s, xc + c, -s, 0.03);
          L.place2(bars[i].B, xc - c, -s, xc + c, s, -0.03);
          pins[i].position.set(xc, 0, 0);
        }
        for (var k = 0; k <= n; k++) jointPins[k].position.set(2 * k * c, (k % 2 ? -s : s) * (k === 0 || k === n ? 0 : 1) * 1, 0);
        jointPins[0].position.set(0, s, 0); jointPins[n].position.set(2 * n * c, n % 2 ? -s : s, 0);
        for (var q = 1; q < n; q++) jointPins[q].position.set(2 * q * c, q % 2 ? -s : s, 0);
        claw.position.set(2 * n * c, n % 2 ? -s : s, 0);
        cj.forEach(function (j) { j.g.rotation.z = j.s * (0.15 + 0.5 * (al - 0.15)); });
        return {};
      }
    };
  });

  /* ---------------- 8. BALLOON RACER ---------------- */
  def("balloon", { name: "Balloon Racer", fam: "Vehicles", emoji: "🎈", science: "air",
    blurb: "Air rushing out the back pushes the car forward. Action and reaction in action!" }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var body = L.BX(2.3, 0.3, 1.0, L.paint(pal.c, { r: 0.7 }), 0, 0.5, 0); rig.add(body);
    var cab = L.BX(0.8, 0.3, 0.7, L.paint(pal.b, { r: 0.7 }), 0.55, 0.8, 0); rig.add(cab);
    P("Cardboard body", "A flat cardboard base with a little cab on top.", body, [0, 0.0, 0], true);
    var wheels = [], wg = L.G(); rig.add(wg);
    [[-0.78, 0.65], [0.78, 0.65], [-0.78, -0.65], [0.78, -0.65]].forEach(function (p, i) { var w = L.capWheel(0.28, i % 2 ? pal.a : pal.b, true); w.position.set(p[0], 0.3, p[1]); wg.add(w); wheels.push(w); });
    rig.add(axle(M, 1.5, -0.78, 0.3, 0), axle(M, 1.5, 0.78, 0.3, 0));
    P("Bottle-cap wheels", "Caps on skewer axles. Rubber bands make grippy tyres.", wg, [0, -0.15, 0.5]);
    var balloonW = L.G(); balloonW.position.set(-0.35, 0, 0); rig.add(balloonW);
    var balloon = L.SP(0.5, L.balloonMat(pal.a), 0, 1.0, 0, 28, 20); balloon.scale.set(1.15, 0.9, 0.9); balloonW.add(balloon);
    P("Balloon", "The balloon is the engine. Squashed air inside wants to escape.", balloonW, [0, 0.55, 0], true);
    var straw = L.CX(0.04, 1.55, L.paint(pal.d, { r: 0.4 }), -0.55, 0.78, 0, 10); rig.add(straw);
    P("Straw nozzle", "The air can only escape down this straw, and out the back.", straw, [-0.5, 0.2, 0]);
    var jet = L.mesh(new T.ConeGeometry(0.12, 0.9, 14), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); jet.rotation.z = PI / 2; jet.position.set(-1.78, 0.78, 0); rig.add(jet);
    var wr = 0, T0 = 6.5;
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt, dt) {
        var t = ph % T0, s = 0.5, v = 0, jetA = 0;
        if (t < 1.5) { s = 0.5 + 0.5 * L.sstep(0, 1.5, t); }
        else if (t < 4.6) { var u = (t - 1.5) / 3.1; s = 1 - 0.5 * L.sstep(0, 1, u); v = 1.6 * (1 - u) * (0.4 + 0.6 * (1 - Math.abs(2 * u - 0.55))) ; jetA = 0.35 * (1 - u); }
        v = Math.max(0, v);
        balloon.scale.set(1.15 * s * 1.0 + 0.15, 0.9 * s + 0.15, 0.9 * s + 0.15);
        balloon.position.y = 0.66 + 0.34 * s;
        jet.material.opacity = jetA * (amt > 0.05 ? 1 : 0);
        jet.scale.set(1, 0.7 + 0.5 * jetA * 3, 1);
        wr += (v * (dt || 0.016)) / 0.28;
        wheels.forEach(function (w) { w.rotation.z = -wr; });
        return { speed: v };
      }
    };
  });

  /* ---------------- 9. RUBBER-BAND ROLLER ---------------- */
  def("roller", { name: "Rubber-band Roller", fam: "Vehicles", emoji: "🏎️", science: "energy",
    blurb: "Wind the axle and the stretched rubber band stores energy. Let go: whoosh!" }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var ch = L.BX(2.5, 0.1, 0.9, L.paint(pal.c, { r: 0.7 }), 0, 0.55, 0); rig.add(ch);
    var nose = L.BX(0.5, 0.4, 0.55, L.paint(pal.b, { r: 0.7 }), 0.75, 0.8, 0); rig.add(nose);
    var seatf = L.googly(0.1, 0.13, 0.28, 0.0); seatf.position.set(0.88, 0.95, 0); seatf.rotation.y = PI / 2; rig.add(seatf);
    P("Chassis", "A strip of stiff card. Long and low keeps it steady.", ch, [0, 0, 0], true);
    var rear = L.G(), front = L.G(); rig.add(rear, front);
    var rws = [-1, 1].map(function (s) { var w = L.capWheel(0.44, pal.a, true); w.position.set(-0.85, 0.44, s * 0.62); rear.add(w); return w; });
    var fws = [-1, 1].map(function (s) { var w = L.capWheel(0.26, pal.b, true); w.position.set(0.85, 0.26, s * 0.55); front.add(w); return w; });
    rig.add(axle(M, 1.5, -0.85, 0.44, 0), axle(M, 1.3, 0.85, 0.26, 0));
    P("Big back wheels", "Bigger wheels travel further on each turn.", rear, [-0.3, 0, 0], true);
    P("Little front wheels", "Small wheels at the front keep the nose low.", front, [0.3, 0, 0]);
    var hook = L.CY(0.05, 0.3, M.wood, 1.05, 0.7, 0, 10); rig.add(hook);
    var spool = L.CZ(0.07, 0.1, M.band, -0.85, 0.44, 0, 12); rig.add(spool);
    var bandW = L.G(); rig.add(bandW);
    var band = L.barRound(0.018, M.band); bandW.add(band);
    P("Rubber band", "It stretches from the front hook to the back axle. Stretched rubber stores energy, like a spring.", bandW, [0, 0.6, 0], true);
    P("Hook", "The band is anchored here.", hook, [0.3, 0.3, 0]);
    var wr = 0, T0 = 8.2;
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt, dt) {
        var t = ph % T0, tension = 0, v = 0;
        if (t < 3.2) { tension = L.sstep(0, 3.2, t); v = -0.55; }
        else if (t < 3.7) { tension = 1; v = 0; }
        else if (t < 7.2) { var u = (t - 3.7) / 3.5; tension = 1 - u; v = 2.2 * Math.pow(tension, 0.7); }
        else { tension = 0; v = 0; }
        wr += ((v * (dt || 0.016)) / 0.44);
        rws.forEach(function (w) { w.rotation.z = -wr; }); fws.forEach(function (w) { w.rotation.z = -wr * (0.44 / 0.26); });
        var wa = wr * 0.0 + tension * 6; var sx = -0.85 + Math.cos(wa) * 0.07, sy = 0.44 + Math.sin(wa) * 0.07;
        L.place2(band, 1.05, 0.72, sx, sy, 0.0);
        spool.scale.set(1 + tension * 0.5, 1, 1 + tension * 0.5);
        band.scale.x = band.scale.z = 1.3 - tension * 0.5;
        return { speed: v };
      }
    };
  });

  /* ---------------- 10. GEAR BUGGY ---------------- */
  def("buggy", { name: "Gear Buggy", fam: "Vehicles", emoji: "🚗", science: "gear", motorDefault: true,
    blurb: "A small gear on a motor drives a big gear on the axle: slower, but much stronger." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var plate = L.BX(2.5, 0.08, 1.0, L.paint(pal.c, { r: 0.7 }), 0, 0.6, 0); rig.add(plate);
    P("Chassis plate", "Everything is fixed to this flat piece of cardboard.", plate, [0, 0, 0], true);
    var rws = [], fws = [], rg = L.G(), fg = L.G(); rig.add(rg, fg);
    [-1, 1].forEach(function (s) {
      var w = L.capWheel(0.46, pal.a, true); w.position.set(-0.85, 0.46, s * 0.64); rg.add(w); rws.push(w);
      var f = L.capWheel(0.28, pal.b, true); f.position.set(0.9, 0.28, s * 0.6); fg.add(f); fws.push(f);
    });
    rig.add(axle(M, 1.6, -0.85, 0.46, 0), axle(M, 1.4, 0.9, 0.28, 0));
    P("Driving wheels", "These wheels sit on the same axle as the big gear, so they turn with it.", rg, [-0.2, 0, 0.35], true);
    P("Front wheels", "Free-spinning wheels just roll along.", fg, [0.25, 0, 0.3]);
    var m = L.G(); var pr = 0.18, br = 0.54, dist = pr + br;
    var mx = -0.85 + Math.sqrt(dist * dist - 0.3 * 0.3), my = 0.76;
    m.position.set(mx, my, 0); rig.add(m);
    m.add(L.CZ(0.16, 0.55, M.steel, 0, 0, 0, 20), L.CZ(0.02, 0.9, M.metal, 0, 0, 0.1, 8));
    P("Motor", "Turns very fast but with only a little strength.", m, [0, 0.5, -0.2], true);
    var Np = 10, Ng = 30, mod = 0.036;
    var pin = new T.Mesh(L.gearGeo(Np, mod, 0.05, 0.03), L.paint(pal.d, { r: 0.6 })); pin.castShadow = true; pin.position.set(mx, my, 0.62); rig.add(pin);
    var big = new T.Mesh(L.gearGeo(Ng, mod, 0.05, 0.03), L.paint(pal.b, { r: 0.6 })); big.castShadow = true; big.position.set(-0.85, 0.46, 0.62); rig.add(big);
    P("Little gear", "10 teeth. It spins 3 times for every 1 turn of the big gear.", pin, [0.15, 0.3, 0.5], true);
    P("Big gear", "30 teeth. Turns slowly but with 3 times the pulling power.", big, [-0.2, 0.0, 0.6], true);
    var phiA = Math.atan2(0.46 - my, -0.85 - mx);
    var batt = L.BX(0.8, 0.22, 0.4, M.black, 0.5, 0.78, 0); rig.add(batt); batt.add(L.BX(0.12, 0.05, 0.2, M.wireR, -0.46, 0.1, 0));
    P("Battery box", "Two AA batteries power the motor.", batt, [0.3, 0.5, 0]);
    var sw = L.G(); sw.position.set(1.0, 0.74, 0.28); sw.add(L.BX(0.28, 0.1, 0.18, M.white), L.BX(0.05, 0.15, 0.06, M.wireR, 0.04, 0.1, 0)); rig.add(sw);
    P("Switch", "Flip it to complete the circuit and the motor starts.", sw, [0.3, 0.3, 0.3]);
    var wire = L.tube([[0.2, 0.84, 0], [0.0, 0.9, 0.1], [mx + 0.2, my + 0.1, 0.0]], 0.014, M.wireR, false, 20); rig.add(wire);
    var wr = 0, run = 0;
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt, dt) {
        var v = 1.1 * amt;
        wr += v * (dt || 0.016) / 0.46;
        rws.forEach(function (w) { w.rotation.z = -wr; }); fws.forEach(function (w) { w.rotation.z = -wr * 0.46 / 0.28; });
        big.rotation.z = -wr;
        var C = (Np + Ng) * (phiA + PI) + (Ng - 1) * PI;
        // phi from pinion to big gear is phiA+PI (direction pinion->big)
        pin.rotation.z = (C - Ng * (-wr)) / Np;
        return { speed: v };
      }
    };
  });

  /* ---------------- 11. SAIL CART ---------------- */
  def("sailcart", { name: "Sail Cart", fam: "Vehicles", emoji: "⛵", science: "wind",
    blurb: "A card sail catches the wind and pushes the cart. No motor needed!" }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var ch = L.BX(2.1, 0.09, 0.85, L.paint(pal.c, { r: 0.7 }), 0, 0.42, 0); rig.add(ch);
    P("Cart base", "A flat card base, light and strong.", ch, [0, 0, 0], true);
    var wh = [], wg = L.G(); rig.add(wg);
    [[-0.7, 0.55], [0.7, 0.55], [-0.7, -0.55], [0.7, -0.55]].forEach(function (p, i) { var w = L.capWheel(0.27, i % 2 ? pal.a : pal.b, true); w.position.set(p[0], 0.27, p[1]); wg.add(w); wh.push(w); });
    rig.add(axle(M, 1.4, -0.7, 0.27, 0), axle(M, 1.4, 0.7, 0.27, 0));
    P("Wheels", "Light bottle-cap wheels roll easily.", wg, [0, -0.1, 0.4]);
    var mast = L.CY(0.03, 2.0, M.skewer, 0.15, 1.45, 0, 8); rig.add(mast);
    P("Mast", "A skewer standing tall so the sail catches more wind.", mast, [0, 0.4, 0]);
    var sailG = L.G(); sailG.position.set(0.15, 0.5, 0); rig.add(sailG);
    var sh = new T.Shape(); sh.moveTo(0, 0); sh.lineTo(0, 1.8); sh.lineTo(-1.15, 0.1); sh.lineTo(-1.15, 0); sh.closePath();
    var sailM = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }), L.paint(pal.d, { r: 0.7 })); sailM.position.z = -0.015; sailM.castShadow = true; sailG.add(sailM);
    var boom = L.CX(0.025, 1.2, M.skewer, -0.58, 0.02, 0, 8); sailG.add(boom);
    P("Sail", "A triangle of card. Moving air pushes on it, and the cart moves.", sailG, [0, 0.4, 0.3], true);
    var flag = new T.Mesh(new T.ShapeGeometry((function () { var s = new T.Shape(); s.moveTo(0, 0); s.lineTo(0, 0.28); s.lineTo(0.38, 0.14); s.closePath(); return s; })()), new T.MeshStandardMaterial({ color: pal.a, side: T.DoubleSide, roughness: 0.7 })); flag.position.set(0.15, 2.18, 0); flag.castShadow = true; rig.add(flag);
    var streaks = [], sg = L.G(); root.add(sg);
    for (var i = 0; i < 12; i++) {
      var st = L.BX(0.6, 0.015, 0.015, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false }), 0, 0.5 + (i * 0.37 % 1.8), ((i * 0.53) % 1.8) - 0.9);
      st.castShadow = false; st.receiveShadow = false; sg.add(st); streaks.push({ m: st, x: -3.2 + (i * 0.71) % 5, s: 3 + (i % 3) });
    }
    var wr = 0;
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt, dt) {
        var gust = 0.8 + 0.3 * Math.sin(ph * 0.9), v = gust * amt;
        wr += v * (dt || 0.016) / 0.27;
        wh.forEach(function (w) { w.rotation.z = -wr; });
        sailG.rotation.y = -0.3 - 0.07 * Math.sin(ph * 2.6) * amt;
        flag.rotation.y = Math.sin(ph * 6) * 0.3 * amt;
        streaks.forEach(function (s) {
          s.x += s.s * (dt || 0.016) * amt; if (s.x > 2.2) s.x = -3.2;
          s.m.position.x = s.x; s.m.material.opacity = 0.55 * amt * L.sstep(-3.2, -2.4, s.x) * (1 - L.sstep(1.4, 2.2, s.x));
        });
        return { speed: v };
      }
    };
  });
})();

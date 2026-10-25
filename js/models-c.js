/* Models 23–33: circuits, sensors, structures, outdoor machines, capstone robot */
(function () {
  "use strict";
  var INV = window.INV, L = INV.L, T = L.T, def = INV.defModel, PI = Math.PI;
  var LEDS = [0xff3b30, 0xffcc00, 0x34c759, 0x4cc9f0];

  function ledBulb(M, col) {
    var g = L.G(), mat = L.ledMat(col);
    var dome = L.mesh(new T.SphereGeometry(0.13, 20, 12, 0, PI * 2, 0, PI / 2), mat); dome.castShadow = false; g.add(dome);
    g.add(L.CY(0.13, 0.07, mat, 0, -0.035, 0, 20), L.CY(0.15, 0.025, mat, 0, -0.07, 0, 20));
    g.add(L.CY(0.012, 0.3, M.metal, 0.04, -0.22, 0, 6), L.CY(0.012, 0.22, M.metal, -0.04, -0.18, 0, 6));
    var halo = new T.Mesh(new T.SphereGeometry(0.3, 16, 12), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
    g.add(halo);
    g.userData.set = function (v) { mat.emissiveIntensity = v * 1.6; halo.material.opacity = v * 0.22; halo.visible = v > 0.02; };
    g.userData.set(0);
    return g;
  }
  function battery(M, pal) {
    var g = L.G(); g.add(L.BX(1.0, 0.2, 0.52, M.black, 0, 0, 0));
    [-1, 1].forEach(function (s) {
      g.add(L.CX(0.085, 0.5, L.paint(0xc8b04a, { m: 0.5, r: 0.4 }), 0, 0.14, s * 0.12, 16), L.CX(0.088, 0.1, L.paint(0x2a2a2a, { r: 0.5 }), 0.3, 0.14, s * 0.12, 16));
    });
    g.add(L.BX(0.06, 0.05, 0.1, M.wireR, -0.5, 0.05, 0.12), L.BX(0.06, 0.05, 0.1, M.wireK, -0.5, 0.05, -0.12));
    return g;
  }
  function buzzerMesh(M) {
    var g = L.G(); g.add(L.CY(0.19, 0.16, M.black, 0, 0.08, 0, 24), L.CY(0.04, 0.02, M.white, 0, 0.17, 0, 10));
    return g;
  }
  function rings(n, col) {
    var g = L.G(), arr = [];
    for (var i = 0; i < n; i++) { var r = new T.Mesh(new T.TorusGeometry(0.2, 0.012, 6, 28), new T.MeshBasicMaterial({ color: col || 0xffffff, transparent: true, opacity: 0, depthWrite: false })); r.rotation.x = PI / 2; r.scale.setScalar(0.3); g.add(r); arr.push(r); }
    g.userData.set = function (ph, on) { arr.forEach(function (r, i) { var u = (ph * 1.2 + i / n) % 1; r.scale.setScalar(on ? 0.5 + u * 1.5 : 0.3); r.position.y = u * 0.4; r.material.opacity = on ? (1 - u) * 0.6 : 0; }); };
    return g;
  }

  /* ---------------- 23. GLOW CIRCUIT ---------------- */
  def("glow", { name: "Glow Circuit", fam: "Motors & circuits", emoji: "💡", science: "circuit",
    blurb: "A battery pushes electricity round a loop of wire. Close the switch to complete the loop and the LED lights up." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var tray = L.BX(3.3, 0.08, 2.0, M.card, 0, 0.04, 0); rig.add(tray);
    P("Cardboard tray", "Keeps the parts in place so wires do not get tangled.", tray, [0, -0.15, 0], true);
    var col = LEDS[o.rnd() * LEDS.length | 0];
    var bat = battery(M, pal); bat.position.set(-1.0, 0.2, 0); bat.rotation.y = PI / 2; rig.add(bat);
    P("Battery holder", "The battery is the electricity pump. Its push is called voltage.", bat, [-0.5, 0.5, 0], true);
    var led = ledBulb(M, col); led.position.set(1.3, 0.38, 0); rig.add(led);
    P("LED", "A tiny light. It only works one way round: the long leg goes to plus (+).", led, [0.4, 0.6, 0], true);
    var swb = L.G(); swb.position.set(0.1, 0.1, 0.78); rig.add(swb);
    swb.add(L.BX(0.8, 0.07, 0.3, M.white, 0, 0.0, 0), L.CY(0.06, 0.1, M.brass, -0.3, 0.07, 0, 10), L.CY(0.06, 0.1, M.brass, 0.3, 0.07, 0, 10));
    var lev = L.G(); lev.position.set(-0.3, 0.14, 0); lev.add(L.BX(0.66, 0.03, 0.1, M.metal, 0.33, 0, 0)); swb.add(lev);
    P("Switch", "A switch opens and closes a gap in the circuit. Open = no light. Closed = light!", swb, [0, 0.4, 0.6], true);
    var path = L.roundPath([[-1.3, 0.1, 0.78], [-1.3, 0.1, 0.78], [1.3, 0.1, 0.78], [1.3, 0.1, -0.78], [-1.3, 0.1, -0.78]], 0.2, true);
    var wire = L.tube(path, 0.028, M.wireY, true, 160); rig.add(wire);
    P("Wires", "Copper inside, plastic outside. Electricity flows round the loop, but only if the loop is complete.", wire, [0, 0.2, 0.4]);
    var cur = wire.userData.curve, dots = [], dg = L.G(); rig.add(dg);
    var dm = new T.MeshBasicMaterial({ color: 0x9be7ff });
    for (var i = 0; i < 26; i++) { var d = new T.Mesh(new T.SphereGeometry(0.045, 8, 6), dm); dg.add(d); dots.push(d); }
    var off = 0, cl = 1;
    return {
      parts: P.list, ground: "mat",
      update: function (ph, amt, dt) {
        var t = ph % 5.5, target = amt < 0.05 ? 1 : (t < 3.6 ? 1 : 0);
        cl += (target - cl) * Math.min(1, (dt || 0.016) * 8);
        lev.rotation.z = (1 - cl) * 0.75;
        led.userData.set(cl > 0.5 ? (cl - 0.5) * 2 : 0);
        off += (dt || 0.016) * 0.22 * (cl > 0.5 ? 1 : 0) * amt;
        dots.forEach(function (d, i) { var p = cur.getPointAt(((i / dots.length) + off) % 1); d.position.copy(p).y += 0.05; d.visible = cl > 0.5 || amt < 0.05; });
        return {};
      }
    };
  });

  /* ---------------- 24. NIGHT-LIGHT BOT ---------------- */
  def("nightbot", { name: "Night-light Bot", fam: "Sensors & control", emoji: "🌙", science: "light", rest: 0,
    blurb: "A light sensor 'sees' when it gets dark and switches the robot's LED eyes on all by itself." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var legs = L.G(); [-1, 1].forEach(function (s) { legs.add(L.CYT(0.13, 0.17, 0.5, L.paint(pal.b, { r: 0.6 }), s * 0.32, 0.25, 0, 18)); legs.add(L.BX(0.4, 0.08, 0.55, L.paint(pal.b, { r: 0.6 }), s * 0.32, 0.04, 0.08)); }); rig.add(legs);
    var body = L.BX(1.15, 1.2, 0.8, L.paint(pal.c, { r: 0.7 }), 0, 1.1, 0); rig.add(body);
    P("Cardboard body", "A strong box. Inside is a battery and the light-sensitive part.", body, [0, 0.0, 0], true);
    var head = L.G(); head.position.set(0, 2.05, 0); rig.add(head);
    head.add(L.BX(0.95, 0.7, 0.75, L.paint(pal.a, { r: 0.6 }), 0, 0, 0));
    head.add(L.pipeCleaner([[0, 0.35, 0], [0.12, 0.62, 0], [0, 0.85, 0]], pal.d, 0.016));
    var eyesMat = L.ledMat(0xfff3a0), eyes = L.G();
    [-1, 1].forEach(function (s) { eyes.add(L.CZ(0.13, 0.08, eyesMat, s * 0.25, 0.04, 0.38, 20)); });
    eyes.add(new T.Mesh(new T.SphereGeometry(0.3, 14, 10), new T.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })));
    eyes.children[2].position.set(0, 0.04, 0.55); eyes.children[2].scale.set(2, 0.7, 0.6);
    head.add(eyes); head.add(L.BX(0.4, 0.06, 0.02, M.pupil, 0, -0.2, 0.38));
    P("LED eyes", "These light up when it is dark. They are the robot's 'output'.", head, [0, 0.5, 0.2], true);
    var panel = L.BX(0.32, 0.03, 0.22, L.paint(0x16213e, { m: 0.4, r: 0.3 }), 0.0, 0.37, 0.05); head.add(panel);
    P("Light sensor", "A tiny dark panel that notices how bright it is. Cover it with your hand and the eyes come on!", panel, [0, 0.6, 0]);
    head.add(L.pompom(0.09, pal.d)); head.children[head.children.length - 1].position.set(0, 0.9, 0);
    var bt = L.BX(0.5, 0.2, 0.2, M.black, 0, 1.1, 0.45); rig.add(bt); bt.add(L.CX(0.05, 0.4, M.metal, 0, 0.1, 0.0, 8));
    P("Battery", "Powers the sensor and the LEDs.", bt, [0, 0, 0.6]);
    var cyc = L.G(); cyc.position.set(0, 0.5, -1.3); rig.add(cyc);
    var sun = L.G(); sun.add(L.SP(0.32, new T.MeshBasicMaterial({ color: 0xffd23f }), 0, 0, 0, 16, 12));
    for (var i = 0; i < 8; i++) { var ray = L.BX(0.1, 0.28, 0.04, new T.MeshBasicMaterial({ color: 0xffb703 }), 0, 0.55, 0); var rg = L.G(); rg.rotation.z = (i / 8) * PI * 2; rg.add(ray); sun.add(rg); }
    var moon = L.G(); moon.add(L.SP(0.28, new T.MeshBasicMaterial({ color: 0xdfe9ff }), 0, 0, 0, 16, 12), L.SP(0.07, new T.MeshBasicMaterial({ color: 0xbcc8e8 }), 0.1, 0.08, 0.25, 8, 6));
    cyc.add(sun, moon); sun.children.forEach(function (c) { c.castShadow = false; }); moon.children.forEach(function (c) { c.castShadow = false; });
    var Rr = 2.3, glow = 0;
    return {
      parts: P.list, ground: "mat", platMin: 2.8,
      update: function (ph, amt, dt) {
        var a = amt < 0.05 && ph === 0 ? PI / 2 : PI / 2 + ph * 0.62;
        sun.position.set(Math.cos(a) * Rr, Math.sin(a) * Rr, 0); moon.position.set(-Math.cos(a) * Rr, -Math.sin(a) * Rr, 0);
        sun.rotation.z = ph * 0.5; sun.children.forEach(function (c) { c.castShadow = false; });
        var day = L.clamp(Math.sin(a) * 1.6 + 0.35, 0, 1);
        glow += ((1 - day) - glow) * Math.min(1, (dt || 0.016) * 6);
        var on = glow > 0.5 ? (glow - 0.5) * 2 : 0;
        eyesMat.emissiveIntensity = on * 1.8; eyes.children[2].material.opacity = on * 0.35;
        return { light: 0.38 + 0.62 * day };
      }
    };
  });

  /* ---------------- 25. TILT ALARM ---------------- */
  def("tilt", { name: "Tilt Alarm", fam: "Sensors & control", emoji: "📳", science: "switch",
    blurb: "Tip it over and a foil ball rolls to the end of the tube, joins two foil contacts, and sets off the light and buzzer." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var col = LEDS[o.rnd() * LEDS.length | 0];
    var box = L.BX(2.4, 0.7, 1.3, L.paint(pal.c, { r: 0.7 }), 0, 0.35, 0); rig.add(box);
    P("Alarm box", "A cardboard box holds the battery, LED and buzzer.", box, [0, 0, 0], true);
    var led = ledBulb(M, col); led.position.set(-0.7, 0.88, 0.45); rig.add(led);
    P("LED", "Lights when the ball completes the circuit.", led, [-0.3, 0.5, 0.2]);
    var buz = buzzerMesh(M); buz.position.set(0.0, 0.7, 0.45); rig.add(buz);
    var rg = rings(3, 0xffffff); rg.position.set(0, 0.9, 0.45); rig.add(rg);
    P("Buzzer", "A little speaker that beeps when electricity reaches it.", buz, [0.0, 0.5, 0.3]);
    var bt = battery(M, pal); bt.position.set(0.7, 0.78, -0.3); bt.scale.setScalar(0.8); rig.add(bt);
    P("Battery", "Provides the push. Electricity waits for the ball to close the gap.", bt, [0.4, 0.5, -0.4]);
    rig.add(L.BX(0.12, 0.35, 0.5, M.cardDark, 0, 0.88, -0.05));
    var tilt = L.G(); tilt.position.set(0, 1.08, 0); rig.add(tilt);
    tilt.add(L.BX(1.8, 0.05, 0.4, M.card, 0, 0.0, 0));
    var tubeM = L.CX(0.16, 1.5, M.clear, 0, 0.2, 0, 24); tilt.add(tubeM);
    [0.62, 0.78].forEach(function (x) { tilt.add(L.CX(0.165, 0.07, M.foil, x, 0.2, 0, 20)); });
    tilt.add(L.CX(0.165, 0.07, M.foil, -0.7, 0.2, 0, 20));
    var ballW = L.G(); tilt.add(ballW); var ball = L.SP(0.105, M.foil, 0, 0.2, 0, 16, 12); ballW.add(ball);
    P("Tilt tube", "A clear tube with two foil rings at one end. The gap between the rings is the 'switch'.", tilt, [0, 0.7, 0], true);
    P.list.push({ name: "Foil ball", desc: "Rolls downhill under gravity. When it sits across the two rings, electricity can cross!", obj: ballW, ex: L.V3(0, 0.5, 0.2), big: false });
    var bx = -0.5, roll = 0, lit = 0;
    return {
      parts: P.list, ground: "mat", platMin: 2.4,
      update: function (ph, amt, dt) {
        var a = amt < 0.01 ? -0.38 : 0.42 * Math.sin(ph * 0.9 + 1.2) - 0.0;
        tilt.rotation.z = a;
        var target = a < -0.06 ? 0.7 : (a > 0.06 ? -0.65 : bx), d = (dt || 0.016);
        var before = bx; bx += (target - bx) * Math.min(1, d * (amt < 0.01 ? 40 : 5)); roll += (bx - before) / 0.105;
        ball.position.x = bx; ball.rotation.z = -roll;
        var on = bx > 0.58 ? 1 : 0; lit += (on - lit) * Math.min(1, d * 12);
        led.userData.set(lit); buz.children[0].position.x = on ? Math.sin(ph * 80) * 0.006 : 0;
        rg.userData.set(ph, on > 0 && amt > 0.05);
        return {};
      }
    };
  });

  /* ---------------- 26. SQUISH PAD ---------------- */
  def("squish", { name: "Squish Pad", fam: "Sensors & control", emoji: "👇", science: "switch",
    blurb: "Two foil sheets with sponge between them. Press down and the foil touches, so the circuit closes." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.x = -0.5; root.add(rig);
    var col = LEDS[o.rnd() * LEDS.length | 0];
    var bot = L.G(); rig.add(bot); bot.add(L.BX(2.0, 0.06, 1.5, M.card, 0, 0.03, 0), L.BX(1.7, 0.012, 1.2, M.foil, 0, 0.07, 0));
    P("Bottom plate & foil", "A foil-covered card. It is connected to one side of the circuit.", bot, [0, -0.15, 0], true);
    var sp = L.G(); rig.add(sp); var spp = [];
    [[-0.8, -0.55], [0.8, -0.55], [-0.8, 0.55], [0.8, 0.55]].forEach(function (p) { var b = L.BX(0.3, 0.3, 0.3, M.sponge, p[0], 0.22, p[1]); sp.add(b); spp.push(b); });
    P("Sponge springs", "Squashy corners hold the plates apart. Let go and they spring back.", sp, [0, 0.0, 0.7]);
    var topO = L.G(), top = L.G(); topO.add(top); rig.add(topO);
    top.add(L.BX(2.0, 0.06, 1.5, L.paint(pal.c, { r: 0.7 }), 0, 0, 0), L.BX(1.7, 0.012, 1.2, M.foil, 0, -0.04, 0));
    P("Top plate & foil", "Press this down. Its foil underside is the other half of the switch.", topO, [0, 0.6, 0], true);
    var finger = L.G(); rig.add(finger); finger.add(L.CY(0.2, 1.0, L.paint(0xf2b8a0, { r: 0.8 }), 0, 0.5, 0, 16), L.SP(0.2, L.paint(0xf2b8a0, { r: 0.8 }), 0, 0, 0, 16, 10));
    var side = L.G(); side.position.set(1.9, 0, 0); rig.add(side);
    side.add(L.BX(0.9, 0.5, 1.4, M.cardDark, 0.1, 0.25, 0));
    var led = ledBulb(M, col); led.position.set(0.1, 0.62, 0.4); side.add(led);
    var buz = buzzerMesh(M); buz.position.set(0.1, 0.5, -0.35); side.add(buz);
    var rg = rings(3, 0xffffff); rg.position.set(0.1, 0.7, -0.35); side.add(rg);
    P("LED", "Lights up when you press the pad.", led, [0.3, 0.5, 0.0]);
    P("Buzzer", "Buzzes when the foil sheets touch.", buz, [0.3, 0.3, -0.3]);
    var bt = battery(M, pal); bt.scale.setScalar(0.7); bt.position.set(0.1, 0.62, 0.0); bt.rotation.y = PI / 2; side.add(bt);
    var wire = L.tube([[0.7, 0.07, 0.3], [1.5, 0.15, 0.3], [1.9, 0.3, 0.2]], 0.014, M.wireR, false, 24); rig.add(wire);
    var wire2 = L.tube([[0.7, 0.9, -0.3], [1.3, 0.8, -0.3], [1.9, 0.4, -0.2]], 0.014, M.wireK, false, 24); rig.add(wire2);
    var lit = 0;
    return {
      parts: P.list, ground: "mat", platMin: 2.9,
      update: function (ph, amt, dt) {
        var t = ph % 3.6, press = amt < 0.01 ? 0 : L.sstep(0.4, 1.0, t) * (1 - L.sstep(1.9, 2.5, t));
        var gap = 0.34 * (1 - press) + 0.07 * press; top.position.y = 0.1 + gap;
        spp.forEach(function (b) { var h = gap; b.scale.y = Math.max(0.2, h / 0.3 * 1.0); b.position.y = 0.06 + (b.scale.y * 0.3) / 2; });
        finger.position.set(0, 0.1 + gap + 0.22, 0); finger.visible = amt > 0.02 && gap < 0.4 && press > 0.02;
        finger.position.y = 0.16 + gap + 0.2;
        var on = press > 0.92 ? 1 : 0, d = (dt || 0.016); lit += (on - lit) * Math.min(1, d * 14);
        led.userData.set(lit); buz.children[0].position.x = on ? Math.sin(ph * 90) * 0.006 : 0;
        rg.userData.set(ph, on > 0 && amt > 0.05);
        return {};
      }
    };
  });

  /* ---------------- 27. BUMP BUGGY ---------------- */
  def("bump", { name: "Bump-and-Stop Buggy", fam: "Sensors & control", emoji: "🚧", science: "switch", rest: 0, motorDefault: true,
    blurb: "A bumper at the front is a switch. Bump into a wall and the circuit breaks, so the motor stops." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.x = -0.5; root.add(rig);
    var ch = L.BX(2.2, 0.09, 1.0, L.paint(pal.c, { r: 0.7 }), 0, 0.52, 0); rig.add(ch);
    P("Chassis", "A card base with motor, battery and bumper switch.", ch, [0, 0, 0], true);
    var ws = [], wg = L.G(); rig.add(wg);
    [[-0.7, 0.62], [0.7, 0.62], [-0.7, -0.62], [0.7, -0.62]].forEach(function (p, i) { var w = L.capWheel(0.3, i % 2 ? pal.a : pal.b, true); w.position.set(p[0], 0.3, p[1]); wg.add(w); ws.push(w); });
    rig.add(axle(M, 1.5, -0.7, 0.3, 0), axle(M, 1.5, 0.7, 0.3, 0));
    P("Wheels", "Bottle-cap wheels on skewer axles.", wg, [0, -0.1, 0.4]);
    var mot = L.CZ(0.15, 0.5, M.steel, -0.55, 0.72, 0, 18); rig.add(mot);
    P("Motor", "Spins the back axle through a rubber band. No electricity, no spinning.", mot, [-0.3, 0.4, 0]);
    var bt = battery(M, pal); bt.scale.setScalar(0.85); bt.position.set(0.15, 0.7, 0); rig.add(bt);
    P("Battery holder", "Two AA batteries push electricity round the circuit.", bt, [0, 0.5, 0]);
    var bump = L.G(); bump.position.set(1.12, 0.56, 0); rig.add(bump);
    var bar = L.BX(0.1, 0.34, 1.1, L.paint(pal.d, { r: 0.6 }), 0.1, 0.1, 0); bump.add(bar);
    [-1, 1].forEach(function (s) { bump.add(L.BX(0.28, 0.06, 0.05, M.wood, -0.05, 0.1, s * 0.4)); });
    var bumpO = L.G(); bumpO.add(bump); rig.add(bumpO);
    P("Bumper", "A bar on springy arms. When it is pushed back, it opens the switch.", bumpO, [0.5, 0, 0], true);
    var sw = L.G(); sw.position.set(0.82, 0.62, 0); rig.add(sw); sw.add(L.BX(0.26, 0.07, 0.2, M.white), L.CY(0.04, 0.08, M.brass, 0.1, 0.06, 0, 8));
    var armc = L.BX(0.28, 0.02, 0.06, M.metal, -0.1, 0.1, 0); sw.add(armc);
    P("Contact switch", "Two metal strips touch when the bumper is free. A push breaks the touch.", sw, [0.1, 0.5, 0.4]);
    var wall = L.G(); rig.add(wall); wall.add(L.BX(0.2, 1.1, 1.7, L.paint(0x8a6f4d, { r: 0.8 }), 0, 0.55, 0), L.BX(0.04, 1.1, 1.7, M.cardDark, -0.12, 0.55, 0));
    var wr = 0, spd = 0, wx = 3.1;
    return {
      parts: P.list, ground: "mat", platMin: 3.3,
      update: function (ph, amt, dt) {
        var d = (dt || 0.016), t = ph % 7.4, target = 0.8, push = 0;
        if (amt < 0.01) { wx = 3.1; } else {
          if (t < 3.0) { wx = 3.1 - (3.1 - 1.9) * (t / 3.0); target = 0.8; }
          else if (t < 3.3) { push = L.sstep(3.0, 3.3, t); wx = 1.9 - 0.15 * push; target = 0; }
          else if (t < 4.7) { push = 1; wx = 1.75; target = 0; }
          else if (t < 5.7) { push = 1 - L.sstep(4.7, 5.2, t); wx = 1.75 + 1.4 * L.sstep(4.8, 5.7, t); target = 0; }
          else { wx = 3.1; target = 0.8; }
        }
        spd += (target - spd) * Math.min(1, d * 6); wr += spd * d / 0.3;
        ws.forEach(function (w) { w.rotation.z = -wr; });
        wall.position.set(wx, 0, 0); bump.position.x = 1.12 - 0.12 * push; armc.rotation.z = push * 0.5; mot.rotation.x = 0;
        return { speed: spd };
      }
    };
  });
  function axle(M, len, x, y, z) { return L.CZ(0.025, len, M.skewer, x, y, z, 10); }

  /* ---------------- 28. TRUSS BRIDGE ---------------- */
  def("bridge", { name: "Triangle Truss Bridge", fam: "Structures", emoji: "🌉", science: "structure", rest: 1.5,
    blurb: "Triangles can't be squashed out of shape, so a bridge made of triangles carries a heavy load with very little card." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var n = 6, w = 0.7, y0 = 0.55, h = 0.75, zz = 0.56;
    var sup = L.G(); rig.add(sup);
    [-1, 1].forEach(function (s) { sup.add(L.BX(0.75, 0.5, 1.5, L.paint(s > 0 ? pal.b : pal.a, { r: 0.7 }), s * 2.35, 0.25, 0)); for (var i = 0; i < 4; i++) sup.add(L.BX(0.75, 0.025, 1.52, M.white, s * 2.35, 0.1 + i * 0.12, 0)); });
    P("Book supports", "Two piles of books hold the ends. Real bridges rest on strong piers.", sup, [0, -0.2, 0], true);
    var deck = L.G(); rig.add(deck);
    for (var d = 0; d < 14; d++) deck.add(L.BX(0.24, 0.045, 1.35, M.cardIn, -2.0 + d * 0.31, y0 - 0.02, 0));
    P("Road deck", "Flat card across the bottom. The load drives on this.", deck, [0, -0.3, 0]);
    var bars = [], truss = L.G(); rig.add(truss);
    function bar(ax, ay, bx, by, z, kind) {
      var mat = L.paint(kind === "top" ? pal.a : (kind === "bot" ? pal.b : pal.d), { r: 0.6 }).clone();
      var b = L.barStrip(0.1, 0.06, mat); L.place2(b, ax, ay, bx, by, z); truss.add(b);
      bars.push({ m: b, x: (ax + bx) / 2, mat: mat });
    }
    var bx = []; for (var i = 0; i <= n; i++) bx.push(-2.1 + i * w);
    [-1, 1].forEach(function (s) {
      var z = s * zz;
      for (var i = 0; i < n; i++) {
        bar(bx[i], y0, bx[i + 1], y0, z, "bot");
        var tx = bx[i] + w / 2; bar(bx[i], y0, tx, y0 + h, z, "diag"); bar(tx, y0 + h, bx[i + 1], y0, z, "diag");
        if (i < n - 1) bar(tx, y0 + h, tx + w, y0 + h, z, "top");
      }
    });
    P("Triangle trusses", "Every bar is part of a triangle. Pushes and pulls travel along the bars instead of bending them.", truss, [0, 0.35, 0.0], true);
    var truck = L.G(); rig.add(truck); var twh = [];
    truck.add(L.BX(0.6, 0.2, 0.5, L.paint(0xf6c026, { r: 0.6 }), 0, 0.22, 0), L.BX(0.25, 0.22, 0.46, L.paint(0xf6c026, { r: 0.6 }), 0.24, 0.4, 0), L.BX(0.2, 0.1, 0.3, M.stone, -0.12, 0.38, 0));
    [[-0.2, 0.28], [0.2, 0.28], [-0.2, -0.28], [0.2, -0.28]].forEach(function (p) { var wh = L.capWheel(0.1, 0x2a2c31, false); wh.position.set(p[0], 0.1, p[1]); truck.add(wh); twh.push(wh); });
    var truckO = L.G(); truckO.add(truck); rig.add(truckO);
    P("Toy truck (the load)", "A heavy truck crosses. Watch the bars glow where they are working hardest.", truckO, [0, 1.2, 0]);
    var xl = -1.8;
    return {
      parts: P.list, ground: "grass", platMin: 3.4,
      update: function (ph, amt) {
        var t = ph % 9, u = t < 4 ? t / 4 : (t < 4.6 ? 1 : (t < 8.6 ? 1 - (t - 4.6) / 4 : 0)); u = u * u * (3 - 2 * u);
        xl = amt < 0.01 ? 0.4 : -1.7 + 3.4 * u; truck.position.set(xl, y0, 0); truck.scale.x = (t < 4.6 || t > 8.6) ? 1 : -1;
        twh.forEach(function (wh) { wh.rotation.z = -xl * 8; });
        bars.forEach(function (b) { var dd = Math.abs(b.x - xl), s = Math.exp(-(dd / 0.9) * (dd / 0.9)); b.mat.emissive.setRGB(1, 0.32, 0.05); b.mat.emissiveIntensity = s * 0.85; });
        return {};
      }
    };
  });

  /* ---------------- 29. EARTHQUAKE TOWERS ---------------- */
  def("tower", { name: "Earthquake Towers", fam: "Structures", emoji: "🗼", science: "structure",
    blurb: "Two towers on a shaking table. The one with triangle braces stays strong, the one without wobbles and wobbles." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var table = L.G(), tbW = L.G(); tbW.add(table); rig.add(tbW);
    table.add(L.BX(4.2, 0.12, 1.9, M.card, 0, 0.06, 0), L.CY(0.22, 0.12, M.stone, -1.9, -0.0, 0.7, 12));
    P("Shake table", "A tray that shakes sideways like an earthquake.", tbW, [0, -0.3, 0], true);
    var H = 0.55, nL = 5, W = 0.62, towers = [];
    function level(braced, col, dcol) {
      var g = L.G();
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { g.add(L.CY(0.035, H, L.paint(col, { r: 0.5 }), c[0] * W / 2, H / 2, c[1] * W / 2, 8)); });
      [[0, -1], [0, 1]].forEach(function (c) { g.add(L.CX(0.03, W, L.paint(col, { r: 0.5 }), 0, H, c[1] * W / 2, 8)); });
      [[-1, 0], [1, 0]].forEach(function (c) { g.add(L.CZ(0.03, W, L.paint(col, { r: 0.5 }), c[0] * W / 2, H, 0, 8)); });
      if (braced) {
        var dm = L.paint(dcol, { r: 0.5 });
        [[-1, 1], [1, -1]].forEach(function (c, i) { var b = L.barRound(0.025, dm); L.place(b, L.V3(-W / 2, 0, c[1] * W / 2 * -1), L.V3(W / 2, H, c[1] * W / 2 * -1)); g.add(b); var b2 = L.barRound(0.025, dm); L.place(b2, L.V3(W / 2, 0, c[1] * W / 2), L.V3(-W / 2, H, c[1] * W / 2)); g.add(b2); var b3 = L.barRound(0.025, dm); L.place(b3, L.V3(c[1] * W / 2, 0, -W / 2), L.V3(c[1] * W / 2, H, W / 2)); g.add(b3); });
      }
      return g;
    }
    function tower(x, braced, col) {
      var base = L.G(); base.position.set(x, 0.12, 0); table.add(base);
      var cur = base, lv = [];
      for (var k = 0; k < nL; k++) { var lg = level(braced, col, pal.d); lg.position.y = k === 0 ? 0 : H; cur.add(lg); lv.push(lg); cur = lg; }
      var top = L.pompom(0.17, braced ? pal.d : pal.b); top.position.set(0, H + 0.2, 0); cur.add(top);
      return { base: base, lv: lv, braced: braced };
    }
    var tl = tower(-1.0, false, pal.a), tr = tower(1.0, true, pal.b);
    P("Floppy tower (squares)", "Squares can slide into diamonds, so the tower leans over and wobbles.", tl.base, [-0.5, 0.3, 0]);
    P("Braced tower (triangles)", "Diagonal braces make triangles. Triangles cannot slide, so this tower stays standing.", tr.base, [0.5, 0.3, 0], true);
    return {
      parts: P.list, ground: "mat", platMin: 3.2,
      update: function (ph, amt) {
        var sh = Math.sin(ph * 13) * amt; table.position.x = sh * 0.07;
        tl.lv.forEach(function (lg, k) { lg.rotation.z = Math.sin(ph * 13 - 0.7 + k * 0.5) * 0.065 * amt * (0.5 + k * 0.3); });
        tr.lv.forEach(function (lg, k) { lg.rotation.z = Math.sin(ph * 13) * 0.004 * amt; });
        return {};
      }
    };
  });

  /* ---------------- 30. WIND SPINNER ---------------- */
  def("windspinner", { name: "Wind Spinner", fam: "Outdoor machines", emoji: "🌬️", science: "wind", platMin: 3.0,
    blurb: "Cups catch the wind. The harder the wind blows, the faster it spins, so you can measure wind speed!" }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var pot = L.G(); pot.add(L.CYT(0.55, 0.42, 0.5, L.paint(pal.c, { r: 0.7 }), 0, 0.25, 0, 24), L.CY(0.5, 0.04, M.stone, 0, 0.5, 0, 24));
    for (var i = 0; i < 7; i++) { var a = i * 0.9; pot.add(L.SP(0.1, M.stone, Math.cos(a) * 0.3, 0.55, Math.sin(a) * 0.3, 8, 6)); }
    rig.add(pot); P("Pot of stones", "Stones keep the pole standing in strong wind.", pot, [0, -0.2, 0]);
    var pole = L.CY(0.06, 2.0, M.tube, 0, 1.45, 0, 14); rig.add(pole); P("Pole", "A garden cane. It must stay still while the top spins.", pole, [0, 0.0, 0]);
    var head = L.G(); head.position.set(0, 2.5, 0); rig.add(head);
    var spin = L.G(); head.add(spin);
    spin.add(L.CX(0.03, 2.1, M.skewer, 0, 0, 0, 8), L.CZ(0.03, 2.1, M.skewer, 0, 0, 0, 8), L.CY(0.08, 0.1, M.brass, 0, 0.0, 0, 12));
    var cups = L.G(); spin.add(cups);
    [0, 1, 2, 3].forEach(function (i) {
      var a = (i * PI) / 2, g = L.G(); g.position.set(Math.cos(a) * 1.05, 0, Math.sin(a) * 1.05); g.rotation.y = -a;
      var c = L.CYT(0.2, 0.12, 0.34, L.paint(i === 0 ? 0xe63946 : pal.a, { r: 0.5 }), 0, 0, 0, 20); c.rotation.x = PI / 2; g.add(c); cups.add(g);
    });
    P("Four cups", "Open cups catch wind better than the rounded backs. This pushes the arms round.", cups, [0, 0.4, 0], true);
    P("Cross arms", "Two straws or skewers cross in the middle, like a plus sign.", spin.children[1], [0, 0.2, 0]);
    var sg = L.G(), st = []; root.add(sg);
    for (var k = 0; k < 11; k++) { var s = L.BX(0.6, 0.016, 0.016, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }), 0, 0.5 + ((k * 0.43) % 2.6), ((k * 0.59) % 2.4) - 1.2); s.castShadow = false; sg.add(s); st.push({ m: s, x: -3.4 + (k * 0.9) % 5, v: 3 + k % 3 }); }
    var ang = 0;
    return {
      parts: P.list, ground: "grass",
      update: function (ph, amt, dt) {
        var gust = 1.5 + 0.9 * Math.sin(ph * 0.6), d = dt || 0.016; ang += gust * amt * d * 1.4; spin.rotation.y = -ang;
        st.forEach(function (s) { s.x += s.v * d * amt * (0.6 + gust * 0.3); if (s.x > 3.4) s.x = -3.4; s.m.position.x = s.x; s.m.material.opacity = 0.5 * amt * L.sstep(-3.4, -2.6, s.x) * (1 - L.sstep(2.4, 3.4, s.x)); });
        return {};
      }
    };
  });

  /* ---------------- 31. WATER WHEEL ---------------- */
  def("waterwheel", { name: "Water Wheel", fam: "Outdoor machines", emoji: "💧", science: "energy", platMin: 2.9,
    blurb: "Falling water pushes the paddles round. Moving water has energy, and the wheel can use it to lift a weight." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var wy = 1.2, wr = 0.8;
    var frame = L.G(); rig.add(frame);
    [-1, 1].forEach(function (s) { var sh = new T.Shape(); sh.moveTo(-0.7, 0); sh.lineTo(0.7, 0); sh.lineTo(0, wy + 0.1); sh.closePath(); var m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: false }), L.paint(pal.c, { r: 0.7 })); m.position.set(0, 0, s * 0.62 - 0.035); m.castShadow = true; frame.add(m); });
    frame.add(L.CZ(0.04, 1.5, M.skewer, 0, wy, 0, 10));
    P("A-frame stand", "Two triangle supports hold the axle high enough.", frame, [0, -0.2, 0]);
    var wheel = L.G(); wheel.position.set(0, wy, 0); rig.add(wheel);
    var spin = L.G(); wheel.add(spin);
    [-1, 1].forEach(function (s) { spin.add(L.CZ(wr, 0.04, L.paint(pal.a, { r: 0.7 }), 0, 0, s * 0.42, 32)); });
    for (var i = 0; i < 8; i++) { var a = (i / 8) * PI * 2, p = L.BX(0.3, 0.05, 0.84, L.paint(i % 2 ? pal.b : pal.d, { r: 0.7 }), Math.cos(a) * wr * 0.9, Math.sin(a) * wr * 0.9, 0); p.rotation.z = a + 0.5; spin.add(p); }
    P("Wheel & paddles", "Each paddle is a small cup that catches the falling water.", wheel, [0, 0, 0.55], true);
    var spool = L.CZ(0.12, 0.2, M.wood, 0, wy, 0.9, 14); rig.add(spool);
    var spl = L.G(); spl.position.set(0, wy, 0.9); rig.add(spl); spl.add(L.CZ(0.12, 0.2, M.wood, 0, 0, 0, 14)); spool.visible = false;
    var str = L.barRound(0.012, M.white); var wt = L.G(); rig.add(str, wt);
    wt.add(L.CY(0.1, 0.16, L.paint(0x5a5a62, { m: 0.5, r: 0.4 }), 0, 0, 0, 14));
    var wtO = L.G(); wtO.add(wt); rig.add(wtO);
    P("Spool & lifted weight", "The wheel winds a string on the spool. The weight rises: the water is doing work!", wtO, [0.5, 0, 0.3]);
    var bottle = L.G(); bottle.position.set(-1.45, 2.4, 0); bottle.rotation.z = -0.55; rig.add(bottle);
    bottle.add(L.CYT(0.28, 0.28, 0.9, M.clear, 0, 0, 0, 20), L.CYT(0.1, 0.28, 0.2, M.clear, 0, -0.5, 0, 20), L.CY(0.1, 0.06, L.paint(pal.a, { r: 0.4 }), 0, -0.64, 0, 14), L.CYT(0.26, 0.26, 0.5, M.water, 0, -0.1, 0, 16));
    P("Water bottle", "A plastic bottle with a hole in the cap. Gravity pulls the water out.", bottle, [-0.4, 0.3, 0]);
    var drops = L.G(), dm = L.paint(0x3fa0ff, { r: 0.2 }), dp = []; rig.add(drops);
    for (var k = 0; k < 14; k++) { var d = L.SP(0.05, dm, 0, 0, 0, 8, 6); d.castShadow = false; drops.add(d); dp.push(d); }
    var basin = L.G(); basin.add(L.BX(2.0, 0.18, 1.4, M.water, 0, 0.09, 0)); basin.children[0].castShadow = false; rig.add(basin);
    P("Water basin", "A tray catches the water so you can use it again.", basin, [0, -0.3, 0]);
    var th = 0, h = 0, sx = -1.2 - 0.15, sy = 2.05;
    return {
      parts: P.list, ground: "water",
      update: function (ph, amt, dt) {
        var d = dt || 0.016, w = 1.3 * amt; th += w * d; spin.rotation.z = -th; spl.rotation.z = -th;
        var t = ph % 9; h = 0.18 + (1.55 - 0.18) * L.clamp(t / 8, 0, 1) * (t < 8 ? 1 : 1); var sc = t < 8 ? 1 : 0.0001 + 0;
        if (amt < 0.01) { h = 0.7; sc = 1; }
        wt.position.set(0.0, h, 0.92); wt.scale.setScalar(Math.max(0.001, sc));
        L.place2(str, 0.0, wy - 0.1, 0.0, h + 0.08, 0.92); str.position.z = 0.92; str.visible = sc > 0.5;
        dp.forEach(function (dr, i) { var u = (ph * 1.4 + i / 14) % 1, f = u; dr.position.set(sx + f * 1.35, sy - 0.0 - 6 * f * f * 0.5 * 0.9 - f * 0.4, 0); dr.visible = amt > 0.03 && dr.position.y > 0.95; });
        return {};
      }
    };
  });

  /* ---------------- 32. PARACHUTE LANDER ---------------- */
  def("parachute", { name: "Parachute Lander", fam: "Outdoor machines", emoji: "🪂", science: "drag", rest: 3.1, platMin: 2.8,
    blurb: "A bin-bag canopy catches the air and slows the fall. Drop it next to a plain weight and race them!" }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); root.add(rig);
    var tex = null;
    if (typeof document !== "undefined") {
      var c = document.createElement("canvas"); c.width = 256; c.height = 32; var g = c.getContext("2d");
      var cc = "#" + ("000000" + pal.a.toString(16)).slice(-6);
      for (var i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#ffffff" : cc; g.fillRect(i * 32, 0, 32, 32); }
      tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.wrapS = T.RepeatWrapping;
    }
    var canG = L.G(), canO = L.G(), canW = L.G(); canO.add(canG); canW.add(canO); rig.add(canW);
    var can = new T.Mesh(new T.SphereGeometry(0.85, 32, 14, 0, PI * 2, 0, PI / 2), new T.MeshStandardMaterial({ map: tex, color: tex ? 0xffffff : pal.a, side: T.DoubleSide, roughness: 0.7 })); can.scale.y = 0.7; can.castShadow = true; canG.add(can);
    var vent = L.CY(0.1, 0.01, M.black, 0, 0.595, 0, 16); canG.add(vent);
    P("Canopy", "A big bag shape. It pushes lots of air out of the way, and the air pushes back. That is air resistance.", canW, [0, 0.8, 0], true);
    var strG = L.G(), strs = []; rig.add(strG);
    for (var k = 0; k < 8; k++) { var s = L.barRound(0.01, M.white); strG.add(s); strs.push({ m: s, a: (k / 8) * PI * 2 }); }
    P("Strings", "Strings spread the pull evenly so the load hangs straight.", strG, [0, 0.3, 0]);
    var pl = L.G(), plO = L.G(), plW = L.G(); plO.add(pl); plW.add(plO); rig.add(plW);
    pl.add(L.CYT(0.2, 0.14, 0.34, L.paint(pal.d, { r: 0.6 }), 0, 0, 0, 20), L.pompom(0.13, pal.b), L.googly(0.05, 0.07, 0.12, 0));
    pl.children[1].position.y = 0.2; pl.children[2].position.set(0, 0.2, 0.1);
    P("Little passenger", "A pom-pom in a paper cup. It is the weight hanging below.", plW, [0, -0.5, 0]);
    var wtO = L.G(), wt = L.BX(0.34, 0.34, 0.34, L.paint(0x5a5a62, { m: 0.4, r: 0.5 }), 0, 0, 0), wtW = L.G(); wtO.add(wt); wtW.add(wtO); rig.add(wtW);
    P("Plain weight (no parachute)", "The same weight with no canopy. It falls much faster!", wtW, [-0.8, 0, 0]);
    var arrows = L.G(), arr = []; rig.add(arrows);
    for (var j = 0; j < 4; j++) { var a = L.BX(0.012, 0.35, 0.012, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }), 0, 0, 0); a.castShadow = false; arrows.add(a); arr.push(a); }
    var top = 3.6;
    rig.add(L.frameMark(0, 4.7, 0));
    return {
      parts: P.list, ground: "grass",
      update: function (ph, amt) {
        var t = ph % 6.2, p = 0.3, yP;
        if (t < 4.0) yP = top - (top - 0.58) * (t / 4.0); else yP = 0.58;
        var tw = Math.min(t, 0.92), yW = top - 4.9 * tw * tw; if (yW < 0.2) yW = 0.17 + 0.0;
        var vis = t < 5.7 ? 1 : 1 - L.sstep(5.7, 6.2, t);
        var sway = (t < 4.0 ? 1 : 0) * 0.1 * Math.sin(t * 2.4);
        var cx = 0.9, landed = t >= 4.0;
        var canY = yP + 0.95, sc = landed ? 0.45 : 1;
        canO.position.set(cx + sway * 0.4, canY, 0); canG.rotation.z = sway * 0.8; canG.scale.set(landed ? 1.15 : 1, sc, landed ? 1.15 : 1);
        if (landed) canO.position.y = 0.42;
        plO.position.set(cx + sway * 0.5, yP - 0.0, 0); plO.position.y = yP;
        wtO.position.set(-1.05, yW, 0); wtO.rotation.y = t * 0.5;
        strs.forEach(function (s) { var rx = Math.cos(s.a) * 0.78, rz = Math.sin(s.a) * 0.78; L.place(s.m, L.V3(canO.position.x + rx * (landed ? 1.15 : 1), canO.position.y + (landed ? 0.1 : 0.12), rz * (landed ? 1.15 : 1)), L.V3(plO.position.x + Math.cos(s.a) * 0.05, plO.position.y + 0.17, Math.sin(s.a) * 0.05)); });
        arr.forEach(function (a, i) { var u = (t * 1.6 + i / 4) % 1; a.position.set(cx + (i % 2 ? 0.55 : -0.55) + sway * 0.4, yP + 0.2 + u * 0.7, (i < 2 ? 0.45 : -0.45)); a.material.opacity = (t < 4.0 && amt > 0.02) ? 0.5 * (1 - u) : 0; });
        rig.visible = true; canO.visible = plO.visible = strG.visible = wtO.visible = vis > 0.05;
        return {};
      }
    };
  });

  /* ---------------- 33. MASTER BOT ---------------- */
  def("master", { name: "Master Inventor Bot", fam: "Master lab", emoji: "🧠", science: "control", motorDefault: true,
    blurb: "Motors move it, sensors look around, and a little 'brain' decides what to do. This is a real robot's recipe." }, function (L, o, root) {
    var M = L.mats(), P = L.parts(), pal = o.pal, rig = L.G(); rig.position.x = -0.5; root.add(rig);
    var chassis = L.BX(2.2, 0.1, 1.1, L.paint(pal.b, { r: 0.7 }), 0, 0.52, 0); rig.add(chassis);
    var ws = [], wg = L.G(); rig.add(wg);
    [[-0.75, 0.68], [0.75, 0.68], [-0.75, -0.68], [0.75, -0.68]].forEach(function (p, i) { var w = L.capWheel(0.3, i % 2 ? pal.a : pal.d, true); w.position.set(p[0], 0.3, p[1]); wg.add(w); ws.push(w); });
    rig.add(axle(M, 1.6, -0.75, 0.3, 0), axle(M, 1.6, 0.75, 0.3, 0));
    P("Motors & wheels", "Two motors turn the wheels. The brain tells them when to go or stop.", wg, [0, -0.15, 0.5]);
    var torso = L.BX(1.35, 1.05, 0.95, L.paint(pal.c, { r: 0.7 }), -0.1, 1.1, 0); rig.add(torso);
    P("Cardboard body", "The strong frame. Everything is mounted on it.", torso, [0, 0.0, 0], true);
    var brain = L.G(); brain.position.set(-0.1, 1.15, 0.5); rig.add(brain);
    brain.add(L.BX(0.95, 0.75, 0.04, M.pcb, 0, 0, 0));
    var onM = L.ledMat(0xff5a36), offM = L.paint(0x3a1d17, { r: 0.8 }), cells = [];
    for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) { var cell = L.BX(0.1, 0.1, 0.045, offM, (c - 2) * 0.15, (2 - r) * 0.12, 0.04); brain.add(cell); cells.push(cell); }
    onM.emissiveIntensity = 1.5;
    brain.add(L.BX(0.2, 0.16, 0.05, M.black, 0.32, -0.28, 0.03), L.BX(0.14, 0.05, 0.05, M.metal, -0.33, -0.3, 0.03));
    P("Brain board", "A tiny computer. It reads the sensors and decides what to do. The 5x5 lights show its mood!", brain, [0, 0, 0.7], true);
    var neck = L.CY(0.1, 0.25, M.steel, -0.1, 1.74, 0, 14); rig.add(neck);
    var head = L.G(); head.position.set(-0.1, 1.95, 0); rig.add(head);
    head.add(L.BX(0.95, 0.6, 0.8, L.paint(pal.a, { r: 0.6 }), 0, 0, 0));
    head.add(L.BX(0.88, 0.3, 0.05, M.pcb, 0, 0.0, 0.43));
    [-1, 1].forEach(function (s) { head.add(L.CZ(0.15, 0.14, M.metal, s * 0.26, 0.0, 0.52, 20), L.CZ(0.09, 0.02, M.black, s * 0.26, 0.0, 0.6, 14)); });
    var ant = L.G(); ant.position.set(0.3, 0.3, 0); ant.add(L.CY(0.015, 0.4, M.metal, 0, 0.2, 0, 6));
    var lampM = L.ledMat(0x7bffb0); var lamp = L.SP(0.07, lampM, 0, 0.42, 0, 12, 8); ant.add(lamp); head.add(ant);
    P("Sensor eyes", "These two silver 'eyes' send out sound pulses and listen for echoes. Echo time tells distance.", head, [0, 0.6, 0.2], true);
    var bt = battery(M, pal); bt.scale.setScalar(0.85); bt.position.set(-0.55, 0.72, -0.1); bt.rotation.y = PI / 2; rig.add(bt);
    P("Battery pack", "Powers the motors and the brain.", bt, [-0.4, 0.4, -0.3]);
    var obs = L.G(); obs.position.set(3.0, 0, 0); rig.add(obs);
    obs.add(L.BX(0.35, 0.9, 1.3, L.paint(0x8a6f4d, { r: 0.8 }), 0, 0.45, 0), L.BX(0.05, 0.9, 1.3, M.cardDark, -0.2, 0.45, 0));
    var PAT = {
      smile: ".....|.#.#.|.....|#...#|.###.", bang: "..#..|..#..|..#..|.....|..#..", ask: ".###.|#...#|...#.|.....|..#..", heart: ".#.#.|#####|#####|.###.|..#.."
    }, cur = "";
    function show(name) { if (cur === name) return; cur = name; var rows = PAT[name].split("|"); for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) cells[r * 5 + c].material = rows[r][c] === "#" ? onM : offM; }
    show("smile");
    var wr = 0, spd = 0, ox = 3.3;
    return {
      parts: P.list, ground: "mat", platMin: 3.4,
      update: function (ph, amt, dt) {
        var d = dt || 0.016, t = ph % 10, target = 0.85, pan = 0, state = "smile", lampOn = 0.5 + 0.5 * Math.sin(ph * 6);
        if (amt < 0.01) { ox = 3.3; state = "heart"; }
        else if (t < 3.6) { ox = 3.3 - 0.9 * (t / 3.6) - 0.0; pan = 0.2 * Math.sin(t * 2.2); state = "smile"; }
        else if (t < 4.0) { ox = 2.4 - 0.25 * L.sstep(3.6, 4.0, t); target = 0; pan = 0; state = "bang"; }
        else if (t < 7.2) { ox = 2.15; target = 0; pan = 0.85 * Math.sin((t - 4.0) * 2.4); state = "ask"; }
        else if (t < 8.2) { ox = 2.15 + 1.3 * L.sstep(7.2, 8.2, t); target = 0; state = "ask"; }
        else { ox = 3.45; state = "heart"; target = 0.85; }
        spd += (target - spd) * Math.min(1, d * 6); wr += spd * d / 0.3;
        ws.forEach(function (w) { w.rotation.z = -wr; });
        head.rotation.y = pan; obs.position.x = ox; show(state);
        lampM.emissiveIntensity = (amt < 0.01 ? 1 : lampOn) * 1.6;
        return { speed: spd };
      }
    };
  });
})();

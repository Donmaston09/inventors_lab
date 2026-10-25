/* Printable A4 inventor templates (SVG, true millimetres). Print at 100% / "Actual size". */
(function () {
  "use strict";
  var INV = (window.INV = window.INV || {});
  var INK = "#1f2a44";
  function svg(inner, title) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm" font-family="Trebuchet MS, Segoe UI, sans-serif" role="img" aria-label="' + title + '"><rect width="210" height="297" fill="#fff"/>' + inner + '</svg>';
  }
  function head(t, sub) {
    return '<text x="105" y="16" text-anchor="middle" font-size="9" font-weight="900" fill="' + INK + '">' + t + '</text><text x="105" y="23" text-anchor="middle" font-size="3.6" fill="#555">' + (sub || "") + '</text>';
  }
  function foot(txt) { return '<text x="105" y="291" text-anchor="middle" font-size="3" fill="#777">' + (txt || "Inventor’s Lab · print at 100% (Actual size) · ask a grown-up to help with cutting") + '</text>'; }
  function gridLines(x, y, w, hh, step) {
    var s = "", i; for (i = 0; i <= w; i += step) s += '<line x1="' + (x + i) + '" y1="' + y + '" x2="' + (x + i) + '" y2="' + (y + hh) + '" stroke="#d6dcec" stroke-width=".25"/>';
    for (i = 0; i <= hh; i += step) s += '<line x1="' + x + '" y1="' + (y + i) + '" x2="' + (x + w) + '" y2="' + (y + i) + '" stroke="#d6dcec" stroke-width=".25"/>'; return s;
  }
  function box(x, y, w, hh, label) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="3" fill="none" stroke="' + INK + '" stroke-width=".7"/>' + (label ? '<text x="' + (x + 3) + '" y="' + (y + 5.5) + '" font-size="4" font-weight="800" fill="' + INK + '">' + label + '</text>' : ""); }
  function lines(x, y, w, n, gap) { var s = ""; for (var i = 0; i < n; i++) s += '<line x1="' + x + '" y1="' + (y + i * gap) + '" x2="' + (x + w) + '" y2="' + (y + i * gap) + '" stroke="#b9c1d9" stroke-width=".3"/>'; return s; }
  /* spur gear outline, module 4 mm: pitch dia = 4N, outside = 4(N+2) */
  function gearPath(cx, cy, N) {
    var m = 4, rp = m * N / 2, ro = rp + m, ri = rp - 1.25 * m, pts = [], i, w = Math.PI * 2 / N;
    for (i = 0; i < N; i++) {
      var a = i * w; [[0, ri], [0.12, ri], [0.28, ro], [0.52 * 0.95, ro], [0.62, ri]].forEach(function (p) {
        var t = a + p[0] * w * 1.0 + (p[0] > 0.4 ? 0.0 : 0); pts.push((cx + Math.cos(t) * p[1]).toFixed(2) + "," + (cy + Math.sin(t) * p[1]).toFixed(2));
      });
    }
    return "M" + pts.join("L") + "Z";
  }
  var T = {};
  T.blueprint = { e: "📐", t: "Invention Blueprint", d: "Plan your invention: problem, sketch, parts, steps and tests.", svg: function () {
    return svg(head("MY INVENTION BLUEPRINT", "Inventor: ______________________   Date: ____________") +
      box(10, 30, 190, 22, "The problem I want to solve") + lines(14, 41, 182, 2, 6) +
      box(10, 56, 120, 100, "Sketch it (draw from the side!)") + gridLines(12, 62, 116, 92, 5) +
      box(134, 56, 66, 100, "Materials") + lines(137, 68, 60, 14, 6.5) +
      box(10, 160, 190, 52, "Build steps") + lines(14, 172, 182, 6, 6.5) +
      box(10, 216, 92, 36, "Which machine part moves? (lever, wheel, gear…)") + lines(14, 229, 84, 3, 7) +
      box(108, 216, 92, 36, "How will I test it?") + lines(112, 229, 84, 3, 7) +
      box(10, 256, 190, 28, "What I would change next time") + lines(14, 269, 182, 2, 7) + foot(), "Invention blueprint");
  } };
  T.gears = { e: "⚙️", t: "Gear Cutouts", d: "Real gears with matching teeth (module 4 mm). Glue to card, cut out, add skewer axles.", svg: function () {
    var spec = [[8, 38, 62], [10, 108, 64], [12, 172, 66], [16, 52, 130], [20, 146, 134], [12, 40, 214], [24, 128, 232]], s = head("GEAR CUTOUTS", "Teeth fit together – use two gears to test the ratio");
    spec.forEach(function (g) { var N = g[0], cx = g[1], cy = g[2]; s += '<path d="' + gearPath(cx, cy, N) + '" fill="#ffe8c2" stroke="' + INK + '" stroke-width=".7"/><circle cx="' + cx + '" cy="' + cy + '" r="1.6" fill="#fff" stroke="' + INK + '" stroke-width=".4"/><text x="' + cx + '" y="' + (cy + 7) + '" text-anchor="middle" font-size="3.6" font-weight="800" fill="' + INK + '">' + N + '</text>'; });
    s += '<text x="105" y="283" text-anchor="middle" font-size="3.4" fill="#444">Numbers = teeth. Centre holes are for a skewer (grown-up snips the point). Gears A and B mesh when their edges just touch.</text>';
    return svg(s + foot(), "Gear cutouts");
  } };
  T.wheels = { e: "🎡", t: "Wheels & Cams", d: "Circles for wheels, plus egg, heart and snail cams with off-centre holes.", svg: function () {
    var s = head("WHEELS & CAMS", "Cut out. Poke the centre marks with a skewer (grown-up job)."), i;
    [[30, 55, 28], [75, 55, 20], [112, 55, 16], [150, 55, 24], [185, 52, 12]].forEach(function (w) { s += '<circle cx="' + w[0] + '" cy="' + w[1] + '" r="' + w[2] + '" fill="#e5f4ff" stroke="' + INK + '" stroke-width=".7"/><circle cx="' + w[0] + '" cy="' + w[1] + '" r="1.2" fill="' + INK + '"/><text x="' + w[0] + '" y="' + (w[1] + w[2] + 5) + '" text-anchor="middle" font-size="3" fill="#444">' + (w[2] * 2) + ' mm</text>'; });
    s += '<ellipse cx="50" cy="130" rx="26" ry="19" fill="#ffe8c2" stroke="' + INK + '" stroke-width=".7"/><circle cx="42" cy="130" r="1.4" fill="' + INK + '"/><text x="50" y="158" text-anchor="middle" font-size="3.4">Egg cam</text>';
    var heart = ""; for (i = 0; i <= 60; i++) { var t = i / 60 * Math.PI * 2, r = 20 * (1 - Math.sin(t)) * 0.9 + 6; heart += (i ? "L" : "M") + (105 + Math.cos(t) * r).toFixed(1) + "," + (130 - Math.sin(t) * r).toFixed(1); }
    s += '<path d="' + heart + 'Z" fill="#ffc2d1" stroke="' + INK + '" stroke-width=".7"/><circle cx="105" cy="130" r="1.4" fill="' + INK + '"/><text x="105" y="158" text-anchor="middle" font-size="3.4">Heart cam</text>';
    var sn = ""; for (i = 0; i <= 80; i++) { var t2 = i / 80 * Math.PI * 2, r2 = 10 + 18 * (i / 80); sn += (i ? "L" : "M") + (160 + Math.cos(t2) * r2).toFixed(1) + "," + (130 + Math.sin(t2) * r2).toFixed(1); }
    s += '<path d="' + sn + 'Z" fill="#d3f9d8" stroke="' + INK + '" stroke-width=".7"/><circle cx="160" cy="130" r="1.4" fill="' + INK + '"/><text x="160" y="158" text-anchor="middle" font-size="3.4">Snail cam (drops suddenly!)</text>';
    s += '<text x="105" y="180" text-anchor="middle" font-size="4" font-weight="800" fill="' + INK + '">Test it: rest a lolly stick on the edge and turn the cam on a skewer.</text>';
    for (i = 0; i < 3; i++) s += box(20 + i * 62, 190, 56, 60, ["What moves?", "How fast?", "What surprised me?"][i]);
    return svg(s + foot(), "Wheels and cams");
  } };
  T.faces = { e: "🤖", t: "Robot Face Sheet", d: "Eyes, mouths and buttons to cut out and stick on your creations.", svg: function () {
    var s = head("ROBOT FACE SHEET", "Cut out and stick on, or copy the ideas onto card."), r, c, i;
    for (r = 0; r < 3; r++) for (c = 0; c < 4; c++) { var x = 25 + c * 48, y = 50 + r * 34, k = r * 4 + c, rx = 6 + (k % 3) * 2;
      s += '<g><circle cx="' + (x - 7) + '" cy="' + y + '" r="' + (3 + k % 4) + '" fill="#fff" stroke="' + INK + '" stroke-width=".7"/><circle cx="' + (x + 7) + '" cy="' + y + '" r="' + (3 + k % 4) + '" fill="#fff" stroke="' + INK + '" stroke-width=".7"/><circle cx="' + (x - 7 + (k % 3 - 1)) + '" cy="' + y + '" r="1.5" fill="' + INK + '"/><circle cx="' + (x + 7 + (k % 3 - 1)) + '" cy="' + y + '" r="1.5" fill="' + INK + '"/></g>'; }
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) { var mx = 25 + c * 48, my = 165 + r * 22, t = (r * 4 + c);
      s += '<path d="M' + (mx - 12) + ',' + my + (t % 3 === 0 ? 'Q' + mx + ',' + (my + 10) + ' ' + (mx + 12) + ',' + my : t % 3 === 1 ? 'L' + (mx + 12) + ',' + my : 'Q' + mx + ',' + (my - 8) + ' ' + (mx + 12) + ',' + my) + '" fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-linecap="round"/>'; }
    s += '<text x="105" y="258" text-anchor="middle" font-size="4" fill="' + INK + '" font-weight="800">Draw your own robot’s face here:</text>' + box(55, 262, 100, 24);
    return svg(s + foot(), "Robot faces");
  } };
  T.strips = { e: "📏", t: "Linkage Strips", d: "Strips with holes every 15 mm for split pins: build levers and linkages fast.", svg: function () {
    var s = head("LINKAGE STRIPS", "Glue to card, cut out, join with split pins (grown-up pokes the holes)."), r, i, lens = [60, 90, 105, 120, 150, 180];
    lens.forEach(function (L, k) { var y = 35 + k * 22; s += '<rect x="15" y="' + y + '" width="' + L + '" height="14" rx="7" fill="#fff4cf" stroke="' + INK + '" stroke-width=".7"/>'; for (i = 7.5; i < L; i += 15) s += '<circle cx="' + (15 + i) + '" cy="' + (y + 7) + '" r="1.5" fill="#fff" stroke="' + INK + '" stroke-width=".5"/>'; s += '<text x="' + (15 + L + 4) + '" y="' + (y + 9) + '" font-size="3.4" fill="#555">' + L + ' mm</text>'; });
    s += '<text x="105" y="180" text-anchor="middle" font-size="4" font-weight="800" fill="' + INK + '">Try it: join 4 strips into a square. Push a corner – it wobbles! Add a diagonal strip: it stops.</text>';
    s += box(15, 190, 180, 90, "Draw the linkage I made") + gridLines(17, 197, 176, 81, 6);
    return svg(s + foot(), "Linkage strips");
  } };
  T.testlog = { e: "📋", t: "Test Log", d: "A fair-test table: change one thing, measure, and decide what to improve.", svg: function () {
    var s = head("MY TEST LOG", "Change ONE thing at a time. Measure. Write what you learn."), i, cols = [["Test", 14], ["What I changed", 62], ["What I measured", 46], ["Better?", 22], ["What next?", 46]], x = 10;
    s += '<text x="10" y="34" font-size="4" font-weight="800" fill="' + INK + '">Machine: ____________________   My question: ________________________________</text>';
    cols.forEach(function (c) { s += '<rect x="' + x + '" y="42" width="' + c[1] + '" height="9" fill="#ffe8c2" stroke="' + INK + '" stroke-width=".5"/><text x="' + (x + 2) + '" y="48" font-size="3.6" font-weight="800" fill="' + INK + '">' + c[0] + '</text>'; var y; for (y = 0; y < 14; y++) s += '<rect x="' + x + '" y="' + (51 + y * 14) + '" width="' + c[1] + '" height="14" fill="none" stroke="' + INK + '" stroke-width=".4"/>'; x += c[1]; });
    for (i = 0; i < 14; i++) s += '<text x="12" y="' + (60 + i * 14) + '" font-size="4" fill="#777">' + (i + 1) + '</text>';
    return svg(s + foot(), "Test log");
  } };
  T.hunt = { e: "🔍", t: "Household Scavenger Hunt", d: "Tick off the things you can find at home to build with. No shopping needed!", svg: function () {
    var items = INV.MATS.filter(function (m) { return !m.x && m.c !== "kitchen"; }).slice(0, 44), s = head("HOUSEHOLD SCAVENGER HUNT", "Find it, tick it, and ask before you take anything!"), i;
    items.forEach(function (m, k) { var col = k % 2, row = Math.floor(k / 2), x = 14 + col * 96, y = 36 + row * 11.3; s += '<rect x="' + x + '" y="' + (y - 4.5) + '" width="5" height="5" rx="1" fill="none" stroke="' + INK + '" stroke-width=".6"/><text x="' + (x + 8) + '" y="' + y + '" font-size="3.8" fill="' + INK + '">' + m.n.replace(/&/g, "&amp;") + '</text>'; });
    return svg(s + foot("Always ask a grown-up before taking things. Wash and dry anything that was used for food."), "Scavenger hunt");
  } };
  T.certificate = { e: "🏅", t: "Inventor Certificate", d: "A certificate to print with your name and how many machines you have made.", svg: function (o) {
    o = o || {}; var name = (o.name || "Inventor").replace(/[<>&]/g, ""), n = o.count || 0, s = "";
    s += '<rect x="8" y="8" width="194" height="281" fill="none" stroke="' + INK + '" stroke-width="2.4"/><rect x="13" y="13" width="184" height="271" fill="none" stroke="#ff7a2f" stroke-width="1.2" stroke-dasharray="3 2"/>';
    s += '<text x="105" y="60" text-anchor="middle" font-size="26" font-weight="900" fill="' + INK + '">Inventor’s Lab</text><text x="105" y="80" text-anchor="middle" font-size="10" fill="#ff7a2f" font-weight="800">CERTIFICATE OF INVENTING</text>';
    s += '<text x="105" y="120" text-anchor="middle" font-size="6" fill="#555">This certificate is proudly given to</text><text x="105" y="150" text-anchor="middle" font-size="16" font-weight="900" fill="' + INK + '">' + name + '</text><line x1="40" y1="156" x2="170" y2="156" stroke="' + INK + '" stroke-width=".6"/>';
    s += '<text x="105" y="185" text-anchor="middle" font-size="6.5" fill="#333">for building, understanding and inventing</text><text x="105" y="200" text-anchor="middle" font-size="6.5" fill="#333">' + n + ' real machine' + (n === 1 ? "" : "s") + ' from cardboard, bottle caps and things from home.</text>';
    s += '<text x="105" y="240" text-anchor="middle" font-size="40">🏅</text><text x="40" y="270" font-size="4" fill="#555">Date: ______________</text><text x="130" y="270" font-size="4" fill="#555">Grown-up: ______________</text>';
    return svg(s, "Certificate");
  } };
  INV.templates = T;
  INV.templateList = ["blueprint", "gears", "wheels", "strips", "faces", "testlog", "hunt", "certificate"];
})();

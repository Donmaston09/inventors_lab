/* Tiny interactive "Understand" simulations: gear, belt, lever, pulley, circuit. Pure SVG, no libraries. */
(function () {
  "use strict";
  var INV = (window.INV = window.INV || {});
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, kids) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); (kids || []).forEach(function (c) { e.appendChild(c); }); return e; }
  function h(tag, attrs, html) { var e = document.createElement(tag); for (var k in (attrs || {})) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function slider(label, min, max, val, step, on) {
    var l = h("label"), s = h("input", { type: "range", min: min, max: max, value: val, step: step || 1 }), t = h("span", {}, label + ": <b>" + val + "</b>");
    l.appendChild(t); l.appendChild(s);
    s.addEventListener("input", function () { t.innerHTML = label + ": <b>" + s.value + "</b>"; on(+s.value); });
    return l;
  }
  function gearPath(cx, cy, n, r, ang) {
    var tooth = r * 0.22, pts = [], i;
    for (i = 0; i < n; i++) {
      var a0 = ang + (i / n) * Math.PI * 2, w = Math.PI * 2 / n;
      [[0, r - tooth], [0.18, r + tooth * 0.2], [0.32, r + tooth], [0.55, r + tooth], [0.7, r + tooth * 0.2], [0.85, r - tooth]].forEach(function (p) {
        var a = a0 + p[0] * w; pts.push((cx + Math.cos(a) * p[1]).toFixed(1) + "," + (cy + Math.sin(a) * p[1]).toFixed(1));
      });
    }
    return "M" + pts.join("L") + "Z";
  }

  var S = {};
  /* ----- gears ----- */
  S.gear = function (host) {
    var A = 8, B = 16, turns = 0.5;
    var svg = el("svg", { viewBox: "0 0 400 220", role: "img", "aria-label": "Two meshing gears" });
    var ga = el("path", { fill: "#ffb347", stroke: "#1f2a44", "stroke-width": 3 }), gb = el("path", { fill: "#6ec1e4", stroke: "#1f2a44", "stroke-width": 3 });
    var ma = el("line", { stroke: "#1f2a44", "stroke-width": 4, "stroke-linecap": "round" }), mb = el("line", { stroke: "#1f2a44", "stroke-width": 4, "stroke-linecap": "round" });
    var ta = el("text", { "font-size": 16, "font-weight": 800, fill: "#1f2a44", "text-anchor": "middle" }), tb = el("text", { "font-size": 16, "font-weight": 800, fill: "#1f2a44", "text-anchor": "middle" });
    [ga, gb, ma, mb, ta, tb].forEach(function (n) { svg.appendChild(n); });
    var out = h("div", { class: "out", "aria-live": "polite" });
    function draw() {
      var m = Math.min(8, 340 / (A + B)), ra = A * m / 2, rb = B * m / 2, ax = 200 - (ra + rb) / 2 - 4 + ra - ra, cxA = 200 - (ra + rb) / 2, cxB = cxA + ra + rb, cy = 100;
      var thA = turns * Math.PI * 2, thB = ((B - 1) * Math.PI - A * thA) / B * 1 + Math.PI * 0; // mesh phase (contact on the line between centres)
      ga.setAttribute("d", gearPath(cxA, cy, A, ra, thA)); gb.setAttribute("d", gearPath(cxB, cy, B, rb, thB));
      ma.setAttribute("x1", cxA); ma.setAttribute("y1", cy); ma.setAttribute("x2", cxA + Math.cos(thA) * ra * 0.7); ma.setAttribute("y2", cy + Math.sin(thA) * ra * 0.7);
      mb.setAttribute("x1", cxB); mb.setAttribute("y1", cy); mb.setAttribute("x2", cxB + Math.cos(thB) * rb * 0.7); mb.setAttribute("y2", cy + Math.sin(thB) * rb * 0.7);
      ta.setAttribute("x", 100); ta.setAttribute("y", 212); ta.textContent = "Driver: " + A + " teeth";
      tb.setAttribute("x", 300); tb.setAttribute("y", 212); tb.textContent = "Follower: " + B + " teeth";
      var r = B / A, rr = Math.round(r * 100) / 100;
      out.innerHTML = "Turn the driver <b>1</b> time and the follower turns <b>" + (Math.round(100 / r) / 100) + "</b> times. " + (r > 1 ? "Slower but stronger! 💪" : r < 1 ? "Faster but weaker! ⚡" : "Same speed.") + "<br>Ratio " + A + " : " + B + " (" + rr + " to 1)";
    }
    var ctl = h("div", { class: "ctl" });
    ctl.appendChild(slider("Driver teeth", 6, 24, A, 1, function (v) { A = v; draw(); }));
    ctl.appendChild(slider("Follower teeth", 6, 36, B, 1, function (v) { B = v; draw(); }));
    ctl.appendChild(slider("Turn the handle", 0, 400, 50, 1, function (v) { turns = v / 100; draw(); }));
    host.appendChild(svg); host.appendChild(ctl); host.appendChild(out); draw();
  };
  /* ----- belts ----- */
  S.belt = function (host) {
    var A = 30, B = 60, cross = false, t = 0;
    var svg = el("svg", { viewBox: "0 0 400 220", role: "img", "aria-label": "Two pulleys joined by a belt" });
    var belt = el("path", { fill: "none", stroke: "#1f2a44", "stroke-width": 5 }), pa = el("circle", { fill: "#ffb347", stroke: "#1f2a44", "stroke-width": 3 }), pb = el("circle", { fill: "#6ec1e4", stroke: "#1f2a44", "stroke-width": 3 });
    var ma = el("line", { stroke: "#1f2a44", "stroke-width": 4, "stroke-linecap": "round" }), mb = el("line", { stroke: "#1f2a44", "stroke-width": 4, "stroke-linecap": "round" });
    [belt, pa, pb, ma, mb].forEach(function (n) { svg.appendChild(n); });
    var out = h("div", { class: "out", "aria-live": "polite" });
    function draw() {
      var ra = A * 0.9, rb = B * 0.9, ax = 90, bx = 310, cy = 110;
      var d = cross ? "M" + ax + "," + (cy - ra) + "L" + bx + "," + (cy + rb) + "M" + ax + "," + (cy + ra) + "L" + bx + "," + (cy - rb) : "M" + ax + "," + (cy - ra) + "L" + bx + "," + (cy - rb) + "M" + ax + "," + (cy + ra) + "L" + bx + "," + (cy + rb);
      belt.setAttribute("d", d);
      pa.setAttribute("cx", ax); pa.setAttribute("cy", cy); pa.setAttribute("r", ra); pb.setAttribute("cx", bx); pb.setAttribute("cy", cy); pb.setAttribute("r", rb);
      var a = t * Math.PI * 2, b = (cross ? -1 : 1) * a * (A / B);
      ma.setAttribute("x1", ax); ma.setAttribute("y1", cy); ma.setAttribute("x2", ax + Math.cos(a) * ra * .8); ma.setAttribute("y2", cy + Math.sin(a) * ra * .8);
      mb.setAttribute("x1", bx); mb.setAttribute("y1", cy); mb.setAttribute("x2", bx + Math.cos(b) * rb * .8); mb.setAttribute("y2", cy + Math.sin(b) * rb * .8);
      out.innerHTML = "Turn the small pulley <b>1</b> time: the big one turns <b>" + (Math.round(A / B * 100) / 100) + "</b> times, " + (cross ? "the <b>opposite</b> way (crossed belt)." : "the <b>same</b> way.");
    }
    var ctl = h("div", { class: "ctl" });
    ctl.appendChild(slider("Driver size", 15, 45, A, 1, function (v) { A = v; draw(); }));
    ctl.appendChild(slider("Follower size", 20, 60, B, 1, function (v) { B = v; draw(); }));
    ctl.appendChild(slider("Turn it", 0, 400, 0, 1, function (v) { t = v / 100; draw(); }));
    var cb = h("label", {}, "<span>Cross the belt?</span>"); var chk = h("input", { type: "checkbox" }); chk.style.width = "28px"; chk.style.height = "28px"; chk.addEventListener("change", function () { cross = chk.checked; draw(); }); cb.appendChild(chk); ctl.appendChild(cb);
    host.appendChild(svg); host.appendChild(ctl); host.appendChild(out); draw();
  };
  /* ----- lever ----- */
  S.lever = function (host) {
    var fx = 50, L = 3, R = 3;
    var svg = el("svg", { viewBox: "0 0 400 220", role: "img", "aria-label": "A lever with weights" });
    var bar = el("g"), tri = el("path", { fill: "#c98a45", stroke: "#1f2a44", "stroke-width": 3 }), ground = el("rect", { x: 20, y: 190, width: 360, height: 10, fill: "#1f2a44", rx: 4 });
    [ground, tri, bar].forEach(function (n) { svg.appendChild(n); });
    var out = h("div", { class: "out", "aria-live": "polite" });
    function draw() {
      var px = 40 + fx / 100 * 320, py = 170, len = 320, lx = 40, rx2 = 360;
      var torqueL = L * (px - lx), torqueR = R * (rx2 - px), diff = (torqueR - torqueL) / (torqueR + torqueL + 1), ang = Math.max(-0.35, Math.min(0.35, diff * 0.5));
      tri.setAttribute("d", "M" + (px - 22) + ",190L" + px + "," + py + "L" + (px + 22) + ",190Z");
      bar.innerHTML = "";
      var g = el("g", { transform: "rotate(" + (ang * 180 / Math.PI).toFixed(1) + " " + px + " " + py + ")" });
      g.appendChild(el("rect", { x: 40, y: py - 12, width: len, height: 12, rx: 5, fill: "#ffb347", stroke: "#1f2a44", "stroke-width": 3 }));
      function stack(n, x, y) { for (var i = 0; i < n; i++) g.appendChild(el("circle", { cx: x, cy: y - 12 - i * 16 - 8, r: 8, fill: "#ffd43b", stroke: "#1f2a44", "stroke-width": 2 })); }
      stack(L, 70, py - 12); stack(R, 330, py - 12);
      bar.appendChild(g);
      out.innerHTML = "Left push: <b>" + L + " × " + Math.round((px - lx) / 8) + " = " + L * Math.round((px - lx) / 8) + "</b> &nbsp; Right push: <b>" + R + " × " + Math.round((rx2 - px) / 8) + " = " + R * Math.round((rx2 - px) / 8) + "</b><br>" + (Math.abs(diff) < 0.04 ? "Balanced! ⚖️" : diff > 0 ? "The left side lifts up." : "The right side lifts up.") + " (Weight × distance from the pivot)";
    }
    var ctl = h("div", { class: "ctl" });
    ctl.appendChild(slider("Pivot position", 10, 90, fx, 1, function (v) { fx = v; draw(); }));
    ctl.appendChild(slider("Coins on left", 0, 6, L, 1, function (v) { L = v; draw(); }));
    ctl.appendChild(slider("Coins on right", 0, 6, R, 1, function (v) { R = v; draw(); }));
    host.appendChild(svg); host.appendChild(ctl); host.appendChild(out); draw();
  };
  /* ----- pulley ----- */
  S.pulley = function (host) {
    var n = 1, load = 100;
    var svg = el("svg", { viewBox: "0 0 400 220", role: "img", "aria-label": "Pulley system" });
    var g = el("g"); svg.appendChild(g);
    var out = h("div", { class: "out", "aria-live": "polite" });
    function draw() {
      g.innerHTML = "";
      g.appendChild(el("rect", { x: 40, y: 10, width: 320, height: 12, rx: 4, fill: "#1f2a44" }));
      for (var i = 0; i < n; i++) {
        var x = 130 + i * 40;
        g.appendChild(el("line", { x1: x, y1: 22, x2: x, y2: 160, stroke: "#8b5e34", "stroke-width": 4 }));
      }
      g.appendChild(el("circle", { cx: 150 + (n - 1) * 20, cy: 32, r: 14, fill: "#6ec1e4", stroke: "#1f2a44", "stroke-width": 3 }));
      g.appendChild(el("rect", { x: 112 + (n - 1) * 20, y: 160, width: 76, height: 40, rx: 6, fill: "#ffb347", stroke: "#1f2a44", "stroke-width": 3 }));
      var t = el("text", { x: 150 + (n - 1) * 20, y: 186, "text-anchor": "middle", "font-weight": 800, "font-size": 16, fill: "#1f2a44" }); t.textContent = load + " g"; g.appendChild(t);
      var eff = Math.round(load / n);
      g.appendChild(el("rect", { x: 300, y: 200 - eff / 2, width: 40, height: eff / 2, fill: "#ef476f", stroke: "#1f2a44", "stroke-width": 3 }));
      var t2 = el("text", { x: 320, y: 195 - eff / 2, "text-anchor": "middle", "font-weight": 800, "font-size": 14, fill: "#1f2a44" }); t2.textContent = "pull " + eff + " g"; g.appendChild(t2);
      out.innerHTML = "<b>" + n + "</b> rope" + (n > 1 ? "s share" : " holds") + " the load → you pull with <b>" + eff + " g</b> of force, but you must pull <b>" + n + " cm</b> of rope to lift the load <b>1 cm</b>.";
    }
    var ctl = h("div", { class: "ctl" });
    ctl.appendChild(slider("Ropes holding the load", 1, 4, n, 1, function (v) { n = v; draw(); }));
    ctl.appendChild(slider("Load (grams)", 20, 200, load, 10, function (v) { load = v; draw(); }));
    host.appendChild(svg); host.appendChild(ctl); host.appendChild(out); draw();
  };
  /* ----- circuit ----- */
  S.circuit = function (host) {
    var on = true, mat = "none";
    var cond = { none: false, "paper clip": true, coin: true, foil: true, paper: false, "wooden lolly stick": false, rubber: false, "plastic lid": false };
    var svg = el("svg", { viewBox: "0 0 400 220", role: "img", "aria-label": "A simple circuit with a battery, switch and LED" });
    var g = el("g"); svg.appendChild(g);
    var out = h("div", { class: "out", "aria-live": "polite" });
    function draw() {
      g.innerHTML = "";
      var closed = on && (mat === "none" ? true : cond[mat]);
      g.appendChild(el("rect", { x: 50, y: 50, width: 300, height: 120, rx: 18, fill: "none", stroke: closed ? "#e03131" : "#868e96", "stroke-width": 5, "stroke-dasharray": closed ? "10 8" : "none" }));
      if (closed) { var an = el("animate", { attributeName: "stroke-dashoffset", from: 0, to: -36, dur: "0.8s", repeatCount: "indefinite" }); g.firstChild.appendChild(an); }
      g.appendChild(el("rect", { x: 28, y: 90, width: 44, height: 44, fill: "#f4f1e8", stroke: "#1f2a44", "stroke-width": 3, rx: 6 }));
      var bt = el("text", { x: 50, y: 118, "text-anchor": "middle", "font-weight": 900, "font-size": 18, fill: "#1f2a44" }); bt.textContent = "🔋"; g.appendChild(bt);
      // switch
      g.appendChild(el("rect", { x: 160, y: 40, width: 80, height: 20, fill: "#f4f1e8" }));
      g.appendChild(el("line", { x1: 165, y1: 50, x2: on ? 235 : 225, y2: on ? 50 : 28, stroke: "#1f2a44", "stroke-width": 6, "stroke-linecap": "round" }));
      g.appendChild(el("circle", { cx: 165, cy: 50, r: 6, fill: "#1f2a44" })); g.appendChild(el("circle", { cx: 238, cy: 50, r: 6, fill: "#1f2a44" }));
      // gap object
      var gt = el("text", { x: 200, y: 200, "text-anchor": "middle", "font-weight": 800, "font-size": 14, fill: "#1f2a44" }); gt.textContent = "Gap test: " + mat; g.appendChild(gt);
      // LED
      g.appendChild(el("rect", { x: 300, y: 110, width: 100, height: 60, fill: "#f4f1e8" }));
      g.appendChild(el("circle", { cx: 350, cy: 140, r: 26, fill: closed ? "#ffd43b" : "#ced4da", stroke: "#1f2a44", "stroke-width": 3 }));
      if (closed) for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; g.appendChild(el("line", { x1: 350 + Math.cos(a) * 34, y1: 140 + Math.sin(a) * 34, x2: 350 + Math.cos(a) * 46, y2: 140 + Math.sin(a) * 46, stroke: "#f59f00", "stroke-width": 4, "stroke-linecap": "round" })); }
      var lt = el("text", { x: 350, y: 146, "text-anchor": "middle", "font-weight": 900, "font-size": 16 }); lt.textContent = "💡"; g.appendChild(lt);
      out.innerHTML = closed ? "The loop is <b>complete</b>, so electricity flows and the LED lights! ✨" : (!on ? "The switch is <b>open</b>: there is a gap, so nothing flows." : "<b>" + mat + "</b> does not let electricity through (it's an <b>insulator</b>), so the LED stays dark.");
    }
    var ctl = h("div", { class: "ctl" });
    var b = h("button", { class: "btn alt", type: "button", "aria-pressed": "true" }, "Switch: ON"); b.addEventListener("click", function () { on = !on; b.setAttribute("aria-pressed", on); b.textContent = "Switch: " + (on ? "ON" : "OFF"); draw(); }); ctl.appendChild(b);
    var lab = h("label", {}, "<span>Put this across the gap</span>"); var sel = h("select"); Object.keys(cond).forEach(function (k) { sel.appendChild(h("option", { value: k }, k === "none" ? "nothing (wires joined)" : k)); });
    sel.addEventListener("change", function () { mat = sel.value; draw(); }); lab.appendChild(sel); ctl.appendChild(lab);
    host.appendChild(svg); host.appendChild(ctl); host.appendChild(out); draw();
  };
  INV.sims = { mount: function (kind, host) { if (S[kind]) { host.innerHTML = ""; host.className = "sim"; S[kind](host); return true; } return false; }, has: function (k) { return !!S[k]; } };
})();

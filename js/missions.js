/* Mission loader. Each volume file calls INV.vol(n, rows).
   Row: [title, model, mins, level(1-3), "mat,mat", "step|step|!grown-up step", why, invent, flags]
   flags: o = outdoor, t = build-together */
(function () {
  "use strict";
  var INV = (window.INV = window.INV || {});
  INV.MISSIONS = INV.MISSIONS || [];
  INV.vol = function (n, rows) {
    var base = INV.MISSIONS.filter(function (x) { return x.vol === n; }).length;
    rows.forEach(function (r, k) {
      var i = base + k;
      var f = r[8] || "";
      INV.MISSIONS.push({
        id: "v" + n + "-" + (i + 1 < 10 ? "0" : "") + (i + 1), vol: n, title: r[0], model: r[1], mins: r[2], lvl: r[3],
        mats: r[4].split(",").map(function (s) { return s.trim(); }).filter(function (s) { return s && (INV.BASICS || []).indexOf(s) < 0; }),
        steps: r[5].split("|").map(function (s) { return s.trim(); }),
        why: r[6], invent: r[7], out: f.indexOf("o") >= 0, tog: f.indexOf("t") >= 0
      });
    });
  };
  INV.mission = function (id) { for (var i = 0; i < INV.MISSIONS.length; i++) if (INV.MISSIONS[i].id === id) return INV.MISSIONS[i]; return null; };
  INV.extras = function (m) { return m.mats.filter(function (n) { return INV.MAT[n] && INV.MAT[n].x; }); };
  INV.isQuick = function (m) { return m.mins <= 15; };
})();

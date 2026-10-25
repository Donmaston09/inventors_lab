/* Smoke-tests every 3D model in Node (no GPU needed):
   builds with several seeds/variants, runs the animation, checks for NaNs,
   and checks that animation never moves a "part" (which would fight the pull-apart slider). */
"use strict";
const path = require("path");
global.window = global;
global.THREE = require("three");
const root = path.join(__dirname, "..", "js");
["models-core.js", "models-a.js", "models-b.js", "models-c.js"].forEach(f => require(path.join(root, f)));
const INV = global.INV, T = global.THREE;
let fails = 0, checks = 0;
const bad = (m) => { fails++; console.log("  ✗ " + m); };

function finiteTree(obj) {
  let ok = true;
  obj.updateMatrixWorld(true);
  obj.traverse(o => {
    const e = o.matrixWorld.elements;
    for (let i = 0; i < 16; i++) if (!Number.isFinite(e[i])) ok = false;
  });
  return ok;
}
function meshCount(obj) { let n = 0; obj.traverse(o => { if (o.isMesh) n++; }); return n; }

const ids = INV.modelOrder;
console.log("models registered:", ids.length);
if (ids.length !== 33) bad("expected 33 models, got " + ids.length);

const variants = (id) => ["cam", "walker", "flappy", "tank"].includes(id) ? [id, id + ":m"] : [id];
ids.forEach(id => {
  let worst = 0, parts = 0;
  variants(id).forEach(spec => {
    for (let s = 0; s < 4; s++) {
      checks++;
      let b;
      try { b = INV.build(spec, "seed-" + s); } catch (e) { bad(spec + " build threw: " + e.message); return; }
      if (!b.parts.length || b.parts.length < 3) bad(spec + " has too few parts (" + b.parts.length + ")");
      if (b.parts.some(p => !p.name || !p.desc || p.desc.length < 20)) bad(spec + " has a part without a proper name/description");
      const mc = meshCount(b.root); worst = Math.max(worst, mc); parts = b.parts.length;
      if (mc > 700) bad(spec + " has too many meshes (" + mc + ")");
      if (!Number.isFinite(b.radius) || b.radius > 6 || b.radius < 0.5) bad(spec + " odd radius " + b.radius);
      const base = b.parts.map(p => p.obj.position.clone());
      for (let step = 0; step < 240; step++) {
        const amt = step < 20 ? 0 : 1, ph = step * 0.05;
        let out; try { out = b.update(ph, amt, 0.016); } catch (e) { bad(spec + " update threw at step " + step + ": " + e.message); break; }
        if (step % 40 === 0 && !finiteTree(b.root)) { bad(spec + " produced NaN transforms at step " + step); break; }
        if (out && out.speed !== undefined && !Number.isFinite(out.speed)) { bad(spec + " bad speed"); break; }
      }
      b.parts.forEach((p, i) => { if (p.obj.position.distanceTo(base[i]) > 1e-6) bad(spec + " animates part \"" + p.name + "\" position (would fight pull-apart)"); });
      INV.explode(b, 1); if (!finiteTree(b.root)) bad(spec + " NaN after explode"); INV.explode(b, 0);
    }
  });
  console.log("  ✓ " + id.padEnd(12) + " parts:" + String(parts).padStart(2) + "  meshes≤" + worst);
});
console.log(fails ? "\nFAILED: " + fails + " problem(s) in " + checks + " builds" : "\nAll " + ids.length + " models OK (" + checks + " builds)");
process.exit(fails ? 1 : 0);

/* Headless-browser end-to-end test: serves the app, visits every view, records console errors, saves screenshots. */
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.join(__dirname, "..");
const OUT = process.argv[2] || "/tmp/e2e";
fs.mkdirSync(OUT, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/json", ".png": "image/png" };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = "http://127.0.0.1:" + srv.address().port + "/";
  const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
  const errors = []; let fails = 0;
  const bad = m => { fails++; console.log("  ✗ " + m); };
  async function run(name, vp, steps) {
    const ctx = await br.newContext({ viewport: vp, deviceScaleFactor: 1, locale: "en-GB" }); const pg = await ctx.newPage();
    pg.on("console", m => { if (m.type() === "error" || m.type() === "warning") { const t = m.text(); if (!/GPU stall|deprecated with r150|swiftshader|ReadPixels|WebGL: INVALID_OPERATION/i.test(t)) errors.push(name + ": " + t); } });
    pg.on("pageerror", e => errors.push(name + " PAGEERROR: " + e.message));
    await steps(pg, ctx); await ctx.close();
  }
  async function go(pg, hash, wait, shot) { await pg.goto(base + "#" + hash); await pg.waitForTimeout(wait || 900); if (shot) await pg.screenshot({ path: path.join(OUT, shot + ".png") }); }
  const tablet = { width: 1180, height: 820 }, phone = { width: 390, height: 780 };
  await run("tablet", tablet, async pg => {
    await pg.goto(base); await pg.waitForTimeout(1500);
    const n = await pg.evaluate(() => INV.MISSIONS.length); console.log("missions in app:", n);
    if (!(await pg.$(".vcard"))) bad("home has no volume cards");
    await pg.screenshot({ path: path.join(OUT, "home.png") });
    await go(pg, "/vol/3", 1200, "vol3");
    await go(pg, "/lab", 1200, "lab");
    const ids = ["v1-01", "v2-06", "v3-06", "v4-01", "v6-17", "v7-04", "v8-01", "v9-04", "v10-01"];
    for (const id of ids) {
      const ok = await pg.evaluate(i => !!INV.mission(i), id); if (!ok) { bad("no mission " + id); continue; }
      await go(pg, "/m/" + id, 1400, "m-" + id);
      if (!(await pg.$(".v-canvas"))) bad(id + " 3D canvas missing");
    }
    await go(pg, "/m/v4-01?tab=understand", 1200, "understand-gear");
    if (!(await pg.$(".sim svg"))) bad("understand tab sim missing");
    await go(pg, "/m/v4-01?tab=invent", 700, "invent-tab");
    await go(pg, "/build/v1-01", 800, "buildmode");
    if (!(await pg.$(".bm .txt"))) bad("build mode missing");
    await pg.click("#bm-next"); await pg.waitForTimeout(200);
    await pg.click("#bm-dim"); await pg.screenshot({ path: path.join(OUT, "buildmode-dim.png") });
    await go(pg, "/materials", 600, "materials");
    await go(pg, "/invent", 600); await pg.click("#spin"); await pg.waitForTimeout(1600); await pg.screenshot({ path: path.join(OUT, "invent.png") });
    await go(pg, "/templates", 400, "templates");
    for (const t of ["blueprint", "gears", "wheels", "strips", "faces", "testlog", "hunt", "certificate"]) await go(pg, "/t/" + t, 400, "t-" + t);
    await go(pg, "/passport", 400, "passport");
    await go(pg, "/grownups", 400, "grownups");
    // sims interaction
    for (const [id, sim] of [["v4-01", "gear"], ["v4-06", "belt"], ["v4-11", "lever"], ["v4-13", "pulley"], ["v7-01", "circuit"]]) {
      const ok = await pg.evaluate(i => !!INV.mission(i), id); if (!ok) continue;
      await go(pg, "/m/" + id + "?tab=understand", 600); const r = await pg.$(".sim input[type=range]"); if (r) { await r.evaluate(e => { e.value = Math.round((+e.min + +e.max) * 0.6); e.dispatchEvent(new Event("input", { bubbles: true })); }); } await pg.screenshot({ path: path.join(OUT, "sim-" + id + ".png") });
    }
    // mark done + badge
    await go(pg, "/m/v1-01", 800); await pg.click("#done-b"); await pg.waitForTimeout(500);
    const dn = await pg.evaluate(() => INV._app.store().done["v1-01"]); if (!dn || !dn.b) bad("mark built failed");
  });
  await run("phone", phone, async pg => {
    await go(pg, "/", 1500, "p-home"); await go(pg, "/m/v3-01", 1400, "p-mission"); await go(pg, "/build/v3-01", 700, "p-build"); await go(pg, "/lab", 900, "p-lab");
    const ov = await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2); if (ov) bad("phone horizontal overflow on lab");
  });
  await br.close(); srv.close();
  const uniq = [...new Set(errors)]; uniq.forEach(e => bad("console: " + e));
  console.log(fails ? "E2E FAILED (" + fails + ")" : "E2E OK"); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

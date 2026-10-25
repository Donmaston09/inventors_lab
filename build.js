/* node build.js  → js/missions-all.js (concatenated missions) + dist/inventors-lab.html (one self-contained file) */
const fs = require("fs"), path = require("path");
const R = __dirname, md = path.join(R, "js", "missions");
const files = fs.readdirSync(md).filter(f => /^v\d+[a-z]?\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)) || a.localeCompare(b));
fs.writeFileSync(path.join(R, "js", "missions-all.js"), files.map(f => "/* " + f + " */\n" + fs.readFileSync(path.join(md, f), "utf8")).join("\n"));
console.log("missions-all.js from", files.length, "files");
if (process.argv[2] === "dist") {
  let html = fs.readFileSync(path.join(R, "index.html"), "utf8");
  html = html.replace(/<link rel="stylesheet" href="([^"]+)">/, (_, p) => "<style>\n" + fs.readFileSync(path.join(R, p), "utf8") + "\n</style>");
  html = html.replace(/<link rel="(manifest|apple-touch-icon)"[^>]*>\n?/g, "").replace(/<link rel="icon"[^>]*>/, '<link rel="icon" href="data:image/svg+xml,' + encodeURIComponent(fs.readFileSync(path.join(R, "icon.svg"), "utf8")) + '">');
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, p) => "<script>\n" + fs.readFileSync(path.join(R, p), "utf8").replace(/<\/script/g, "<\\/script") + "\n</script>");
  fs.mkdirSync(path.join(R, "dist"), { recursive: true });
  fs.writeFileSync(path.join(R, "dist", "inventors-lab.html"), html);
  console.log("dist/inventors-lab.html", (html.length / 1024).toFixed(0) + " KB");
}

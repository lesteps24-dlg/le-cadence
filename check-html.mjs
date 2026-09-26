// Le Cadence — pre-deploy sanity check for index.html.
// Parses every inline <script> (JSX included) so a syntax error is caught before Cloudflare
// publishes it, and asserts the version/changelog discipline from the session protocol.
// Run locally:  node scripts/check-html.mjs
import fs from "node:fs";
import { transformSync } from "esbuild";

const FILE = "index.html";
let failures = 0;
const fail = (msg) => { failures++; console.log("  FAIL  " + msg); };
const pass = (msg) => console.log("  ok    " + msg);

if (!fs.existsSync(FILE)) { console.log("FAIL  " + FILE + " not found"); process.exit(1); }
const html = fs.readFileSync(FILE, "utf8");

/* 1 — every inline script must parse */
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let m, n = 0, parsed = 0;
while ((m = re.exec(html)) !== null) {
  const attrs = m[1] || "", body = m[2] || "";
  n++;
  if (/\bsrc\s*=/.test(attrs) || !body.trim()) continue;
  if (/type\s*=\s*["']application\/(ld\+)?json["']/i.test(attrs)) continue;
  const jsx = /type\s*=\s*["']text\/babel["']/i.test(attrs);
  try {
    transformSync(body, { loader: jsx ? "jsx" : "js", jsx: "transform", target: "es2020" });
    parsed++;
    pass(`inline script #${n}${jsx ? " (jsx)" : ""} parses — ${body.length.toLocaleString()} chars`);
  } catch (e) {
    for (const err of (e.errors || [])) {
      const l = err.location || {};
      fail(`inline script #${n} line ${l.line} col ${l.column}: ${err.text}`);
      if (l.lineText) console.log("        > " + l.lineText.trim().slice(0, 160));
    }
  }
}
if (!parsed) fail("no inline script was parsed — did the markup change?");

/* 2 — the five deploy files must all be present */
for (const f of ["index.html", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png"]) {
  fs.existsSync(f) ? pass(`${f} present`) : fail(`${f} missing — the installed Dock/iPad app breaks without it`);
}

/* 3 — the shell version must be in the changelog (session protocol: bump + changelog line) */
const shell = html.match(/APP_VERSION\s*=\s*"(v[\d.]+)[^"]*"/);
if (!shell) fail("could not find the shell APP_VERSION");
else {
  pass(`shell version ${shell[1]}`);
  const log = fs.existsSync("CHANGELOG.md") ? fs.readFileSync("CHANGELOG.md", "utf8") : "";
  log.includes(shell[1])
    ? pass(`CHANGELOG.md documents ${shell[1]}`)
    : fail(`CHANGELOG.md has no entry for ${shell[1]} — bump the version AND add the changelog line`);
}

/* 4 — junk that should never be committed */
for (const junk of [".DS_Store", "Thumbs.db", "download"]) {
  if (fs.existsSync(junk)) fail(`${junk} is committed — it should be ignored, not deployed`);
}

console.log("");
if (failures) { console.log(`${failures} problem(s) found — do not deploy.`); process.exit(1); }
console.log("All checks passed. Safe to merge.");

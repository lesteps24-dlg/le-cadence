// apple-sync — Cloudflare Worker
// Apple Health has no cloud API, so the iPhone PUSHES a daily step total here (via a Shortcut automation),
// this Worker keeps it in KV, and the Health app PULLS it like every other source.
//
//   push:  GET or POST  /push?key=APPLE_KEY&day=YYYY-MM-DD&steps=1234[&exerciseMin=30][&activeCal=420]
//          (POST JSON { day, steps, exerciseMin, activeCal } also works; `day` defaults to today in New York time)
//   read:  GET  ?days=N   ->  { days: [ { day, steps, exerciseMin, activeCal, at } ] }   (newest first)
//
// ── Deploy ───────────────────────────────────────────────────────────────────
// 1. Workers & Pages → Create → Worker → name it  apple-sync  → paste this → Deploy.
// 2. Storage & Databases → KV → Create namespace  APPLE_SYNC .
// 3. Worker → Settings → Bindings → Add → KV namespace → variable name  APPLE_KV  → pick APPLE_SYNC.
// 4. Worker → Settings → Variables and Secrets → Secret  APPLE_KEY  = a long random string (this is the push password).
//    Optional variable  TZ  = America/New_York (default) — the day boundary for a push with no `day`.
// 5. Deploy again. Paste  https://apple-sync.<you>.workers.dev  into Health → Sources → Apple Watch.
//
// ── iPhone Shortcut (one time, ~10 minutes) ───────────────────────────────────
// Shortcuts app → + → name it "Push steps to Cadence":
//   1. Find Health Samples   — Type: Steps · add filter Source is "<your Apple Watch>" · Start Date is Today
//        (Source = Apple Watch avoids counting the phone's steps a second time)
//   2. Calculate Statistics  — Sum of  Health Samples
//   3. Format Date           — Current Date, custom format  yyyy-MM-dd
//   4. Text                  — https://apple-sync.<you>.workers.dev/push?key=<APPLE_KEY>&day=<Formatted Date>&steps=<Statistics>
//        (tap the magic-variable tokens into the text; steps may show a decimal — the Worker rounds it)
//   5. Get Contents of URL   — the Text above (GET is fine)
// Run it once by hand: Cadence → Health → Apple Watch → Sync now should show today's number.
// Automation: Shortcuts → Automation → + → Time of Day → 11:45 PM · Daily → Run Immediately (turn OFF "Ask Before Running")
//   → pick "Push steps to Cadence". A second automation at 6:00 AM catches steps after 11:45 PM the night before, if you care.
// Missed a day (phone off, automation skipped)? Nothing breaks: the app falls back to Oura for that day.
// ──────────────────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-apple-key",
};
const json = (b, s) => new Response(JSON.stringify(b), { status: s || 200, headers: { "content-type": "application/json", ...CORS } });
const KEY = "days";

function todayIn(tz) {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
const num = (v) => { if (v == null || v === "") return null; const n = Number(String(v).replace(/,/g, "")); return isNaN(n) ? null : Math.round(n); };

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (!env.APPLE_KV) return json({ error: "APPLE_KV binding is not set on the Worker (Settings → Bindings → KV namespace)" }, 500);
    const u = new URL(request.url);

    if (u.pathname.replace(/\/+$/, "") === "/push") {
      if (!env.APPLE_KEY) return json({ error: "APPLE_KEY secret is not set on the Worker" }, 500);
      let body = {};
      if (request.method === "POST") { try { const ct = request.headers.get("content-type") || ""; body = ct.includes("json") ? await request.json() : Object.fromEntries((await request.formData()).entries()); } catch (e) { body = {}; } }
      const p = (k) => (u.searchParams.get(k) != null ? u.searchParams.get(k) : body[k]);
      const key = request.headers.get("x-apple-key") || p("key");
      if (key !== env.APPLE_KEY) return json({ error: "bad key" }, 401);
      const steps = num(p("steps"));
      if (steps == null || steps < 0 || steps > 200000) return json({ error: "steps missing or out of range" }, 400);
      let day = String(p("day") || "").trim().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) day = todayIn(env.TZ || "America/New_York");
      const cur = (await env.APPLE_KV.get(KEY, "json")) || {};
      const prev = cur[day] || {};
      cur[day] = { day, steps, exerciseMin: num(p("exerciseMin")) != null ? num(p("exerciseMin")) : (prev.exerciseMin != null ? prev.exerciseMin : null), activeCal: num(p("activeCal")) != null ? num(p("activeCal")) : (prev.activeCal != null ? prev.activeCal : null), at: new Date().toISOString() };
      // keep the last 400 days
      Object.keys(cur).sort().slice(0, -400).forEach((d) => delete cur[d]);
      await env.APPLE_KV.put(KEY, JSON.stringify(cur));
      return json({ ok: true, saved: cur[day] });
    }

    // read
    const n = Math.min(parseInt(u.searchParams.get("days") || "60", 10) || 60, 400);
    const cur = (await env.APPLE_KV.get(KEY, "json")) || {};
    const days = Object.values(cur).sort((a, b) => (a.day < b.day ? 1 : -1)).slice(0, n);
    return json({ days });
  },
};

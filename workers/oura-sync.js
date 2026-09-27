// oura-worker — Cloudflare Worker (comprehensive)
// Pulls a rich daily set from Oura API v2 and returns it as { days: [...] },
// drop-in compatible with your Health app (same field names + many new ones).
// Your Oura Personal Access Token stays here as a secret — never in the app.
//
// GET ?days=N  ->  { days: [ { day, sleepHours, timeInBed, deepMin, remMin, lightMin, bedStart, bedEnd,
//                              awakeMin, efficiency, latencyMin, hrv, rhr, avgHr, breath,
//                              sleepScore, readiness, tempDev, spo2, bdi,
//                              stressMin, recoveryMin, stressSummary, resilience } ] }
//
// ── Deploy ───────────────────────────────────────────────────────────────────
// 1. Open your existing Oura worker in Cloudflare (or create one), paste this in.
// 2. Settings → Variables and Secrets → secret  OURA_TOKEN  = your Personal Access Token.
// 3. Deploy. The URL stays the same, so the field in your Health → Oura settings is unchanged.
// ──────────────────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
const json = (b, s) => new Response(JSON.stringify(b), { status: s || 200, headers: { "content-type": "application/json", ...CORS } });
const iso = (d) => d.toISOString().slice(0, 10);
const hrs = (sec) => (sec == null ? null : Math.round((sec / 3600) * 100) / 100);
const min = (sec) => (sec == null ? null : Math.round(sec / 60));

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (!env.OURA_TOKEN) return json({ error: "OURA_TOKEN secret is not set on the Worker" }, 500);

    const u = new URL(request.url);
    const n = Math.min(parseInt(u.searchParams.get("days") || "30", 10) || 30, 120);
    const end = new Date();
    const start = new Date(Date.now() - n * 86400000);
    const qs = "?start_date=" + iso(start) + "&end_date=" + iso(end);
    const H = { Authorization: "Bearer " + env.OURA_TOKEN };
    const base = "https://api.ouraring.com/v2/usercollection/";

    const get = async (type) => {
      try {
        const r = await fetch(base + type + qs, { headers: H });
        if (r.status === 401) return { __err: 401 };
        if (!r.ok) return { __err: r.status };
        const j = await r.json();
        return j.data || [];
      } catch (e) { return { __err: String((e && e.message) || e) }; }
    };

    const [sleep, dailySleep, readiness, spo2, stress, resilience, workout, activity] = await Promise.all([
      get("sleep"), get("daily_sleep"), get("daily_readiness"), get("daily_spo2"), get("daily_stress"), get("daily_resilience"), get("workout"), get("daily_activity"),
    ]);

    if (sleep && sleep.__err === 401) return json({ error: "Oura rejected the token (401). Update OURA_TOKEN." }, 401);

    const days = {};
    const row = (d) => (days[d] = days[d] || { day: d });

    // detailed sleep — pick the main long_sleep (or longest) period per day
    const mainByDay = {};
    (Array.isArray(sleep) ? sleep : []).forEach((s) => {
      if (!s || !s.day) return;
      const cur = mainByDay[s.day];
      const isLong = s.type === "long_sleep";
      if (!cur || (isLong && cur.type !== "long_sleep") || (s.total_sleep_duration || 0) > (cur.total_sleep_duration || 0)) mainByDay[s.day] = s;
    });
    Object.values(mainByDay).forEach((s) => {
      const r = row(s.day);
      r.sleepHours = hrs(s.total_sleep_duration);
      r.timeInBed = hrs(s.time_in_bed);
      r.deepMin = min(s.deep_sleep_duration);
      r.remMin = min(s.rem_sleep_duration);
      r.lightMin = min(s.light_sleep_duration);
      r.awakeMin = min(s.awake_time);
      r.efficiency = s.efficiency != null ? s.efficiency : null;
      r.latencyMin = min(s.latency);
      r.hrv = s.average_hrv != null ? Math.round(s.average_hrv) : null;
      r.rhr = s.lowest_heart_rate != null ? s.lowest_heart_rate : null;
      r.avgHr = s.average_heart_rate != null ? Math.round(s.average_heart_rate) : null;
      r.breath = s.average_breath != null ? Math.round(s.average_breath * 10) / 10 : null;
      // v2 (Sept 27): actual bed/wake times so the Time tab can place the sleep block where it really was
      r.bedStart = s.bedtime_start || null;
      r.bedEnd = s.bedtime_end || null;
    });

    (Array.isArray(dailySleep) ? dailySleep : []).forEach((d) => { if (d && d.day) row(d.day).sleepScore = d.score != null ? d.score : null; });
    (Array.isArray(readiness) ? readiness : []).forEach((d) => {
      if (!d || !d.day) return;
      const r = row(d.day);
      r.readiness = d.score != null ? d.score : null;
      r.tempDev = d.temperature_deviation != null ? Math.round(d.temperature_deviation * 100) / 100 : null;
    });
    (Array.isArray(spo2) ? spo2 : []).forEach((d) => {
      if (!d || !d.day) return;
      const r = row(d.day);
      r.spo2 = d.spo2_percentage && d.spo2_percentage.average != null ? Math.round(d.spo2_percentage.average * 10) / 10 : null;
      r.bdi = d.breathing_disturbance_index != null ? d.breathing_disturbance_index : null;
    });
    (Array.isArray(stress) ? stress : []).forEach((d) => {
      if (!d || !d.day) return;
      const r = row(d.day);
      r.stressMin = min(d.stress_high);
      r.recoveryMin = min(d.recovery_high);
      r.stressSummary = d.day_summary || null;
    });
    (Array.isArray(resilience) ? resilience : []).forEach((d) => { if (d && d.day) row(d.day).resilience = d.level || null; });
    (Array.isArray(workout) ? workout : []).forEach((w) => {
      if (!w || !w.day || !w.start_datetime || !w.end_datetime) return;
      const dur = (new Date(w.end_datetime).getTime() - new Date(w.start_datetime).getTime()) / 60000; // minutes
      if (!isFinite(dur) || dur <= 0) return;
      const r = row(w.day);
      if (r.workoutMin == null || dur > r.workoutMin) { r.workoutMin = Math.round(dur); r.workoutType = w.activity || null; }
    });
    // daily activity → brisk/medium active minutes (catches walks Oura didn't tag as workouts)
    (Array.isArray(activity) ? activity : []).forEach((d) => {
      if (!d || !d.day) return;
      const r = row(d.day);
      r.activeMin = Math.round(((d.high_activity_time || 0) + (d.medium_activity_time || 0)) / 60);
      if (d.steps != null) r.ouraSteps = d.steps;
    });

    const out = Object.values(days).sort((a, b) => (a.day < b.day ? -1 : 1));
    const errs = {};
    [["sleep", sleep], ["daily_sleep", dailySleep], ["daily_readiness", readiness], ["daily_spo2", spo2], ["daily_stress", stress], ["daily_resilience", resilience], ["workout", workout], ["daily_activity", activity]]
      .forEach(([k, v]) => { if (v && v.__err) errs[k] = v.__err; });

    return json({ days: out, ...(Object.keys(errs).length ? { partial: errs } : {}) });
  },
};
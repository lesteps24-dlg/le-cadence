# Le Cadence — changelog

Shell version is `APP_VERSION` near the top of `index.html` (inside QuickLogApp). Each app also carries its own
`APP_VERSION`: Health, Muse, Streaks (ConsistencyApp), Practice. Bump the shell on every deploy; bump an app's
version only when that app changed.

## v7.52 — 2026-09-27 (Health v3.96)

- **New Study goal: Excel Functions Challenge** (Full Stack Modeller). Its own tab beside PMP / AMP /
  Strat Comm, with a 6 × 8 level grid (XLOOKUP, XMATCH, SORT & SORTBY, FILTER, UNIQUE, INDEX) stored in
  `study.fsmDone` as `"FUNC:level"` keys. New subject `su7` "Excel Functions" is seeded into existing
  state by migration, so the timer can log against it. Appears in the Today card and the ON TRACK card.
  `FSM_WEEKS` carries a light placeholder plan with a PAUSE block Oct 26 – Nov 15 for the PMP final push —
  **the weekly hour targets are an assumption, not a decision.** Levels are marked by hand; the course
  platform has no API. GOALS chips moved to a 2×2 grid to fit four goals.
- **Fix (found in a headless browser run before merge):** the Sept 26 draft of this build left a
  `setUnlockedTab(null)` call behind after removing that state, which crashed the shell on load — blank app.
  Removed. This is the reason the pre-deploy check parses but does not replace a browser test.
- **Passcode: one unlock, idle-based.** Practice / Muse / Streaks previously relocked on *every* tab
  change. One unlock now covers all three and lapses after 15 minutes without input (`LOCK_IDLE_MS`).
  The deadline lives in a ref, so a click never re-renders the shell; a 15 s interval only fires a
  re-render when the unlock has actually expired. 🔒 still locks immediately.
- **Health navigation.** Oura / Withings / Whoop / Strava sit under one **Sources** chip (17 chips → 13,
  three rows). Any Health tab can be hidden in **Settings → Tabs** — nothing deleted, hidden tabs keep
  logging, and hiding the tab you're on bounces to Today. (Replaces the `HIDDEN_VIEWS` constant that was
  drafted on Sept 26 and never deployed.)
- **Study → PMP flattened.** The "Readiness & checklist / Week-by-week plan" toggle plus the five inner
  chips are one row — Overview · Roadmap · Weekly plan · Log · Errors · Reference.
- **A rest day now reads as the plan followed** on the Today plan banner ("Rest day — plan followed ✓",
  sage) instead of rendering grey as though nothing happened. No change to any habit, streak or anchor.
- Repo: pre-deploy check (`scripts/check-html.mjs`, runs as a GitHub Action on every push/PR), real
  `.gitignore`, docs moved to `docs/`. v7.50's note said "Cloudflare Pages" — it is a Cloudflare Worker
  serving static assets; same effect.

No schema change. Nothing removed, nothing renamed.

## v7.51 — 2026-09-19 (Health v3.94 · Muse v1.15 · Streaks v1.31 · Practice v3.1)
- **Concurrency-safe saves in every app.** A save now lands only if the Supabase row still carries the
  `updated_at` this device last read. If another device saved first, the write is refused, the app
  reloads that device's copy and shows a toast ("… updated on another device — reloaded"). The one edit
  in flight on the stale device is dropped instead of a day of logs being overwritten. Shared helper
  `window.__lcSave`; applies to Time (`quick_log`), Workspace (`cadence_workspace`), Health
  (`hundred_days`), Muse (`muse`), Streaks (`hundred_days/linda_consistency`), Practice (`practice_studio`).
- Small toast component `window.__lcToast` for shell-level notices.
- No schema change. Requires the RLS policies to allow UPDATE and INSERT for the signed-in user (they do).

## v7.50 — 2026-09-19
- Moved to a Git repo deployed by Cloudflare (a Worker serving static assets; was manual five-file upload).
- Removed the 21 KB inline base64 apple-touch-icon from `<head>`; `/icon-180.png` already serves it.
- `manifest.json`: added `"id": "/"` so the installed app keeps its identity across URL changes.
- Added `_headers`: `index.html` is never cached by Cloudflare; icons and manifest are.
- No functional changes.

## v7.49 — 2026-09-15 (Health v3.93 · Practice v3.0 · Streaks v1.30)
- Merge of two parallel branches (v7.29 + v7.48). Passcode hash moved to the SELECT-only `app_lock` table;
  "Set passcode" screen removed.
- See `docs/cadence-changes-summary-v7.49.md` for the full Aug 27 – Sep 15 history (Practice Studio, Study tab
  restructure, PMP/AMP/Strat Comm modules, Streaks narrowed to three anchors, bug fixes, Supabase objects).

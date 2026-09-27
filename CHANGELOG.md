# Le Cadence — changelog

Shell version is `APP_VERSION` near the top of `index.html` (inside QuickLogApp). Each app also carries its own
`APP_VERSION`: Health, Muse, Streaks (ConsistencyApp), Practice. Bump the shell on every deploy; bump an app's
version only when that app changed.

## v7.62 — 2026-09-27 (Today v1.7 · Health v3.98)
- **Skip today.** Every undone step (except Periodic) has a small `skip` pill: a skipped step shows `—` and
  "skipped today", counts as met for the run, and never draws as ✓. `↺ undo` reverses it. Skips are stored in a
  new **`today_state`** Supabase row so they follow you across devices; until that table exists they stay in
  the browser you tapped on (the toast says so). SQL to run once (fill in your user UUID from Authentication → Users):

  ```sql
  create table if not exists today_state (id text primary key, state jsonb not null default '{}'::jsonb, updated_at timestamptz);
  alter table today_state enable row level security;
  create policy "today auth" on today_state for all to authenticated
    using (auth.uid() = 'YOUR-UUID') with check (auth.uid() = 'YOUR-UUID');
  ```
- **Supplements matched by name.** Noon = anything named multivitamin / vitamin D (core); night = everything else,
  i.e. iron (core). Renaming a supplement in Health moves it between the two.
- **Saved meals** (Health → Nutrition, above the meal card). "+ save today's breakfast / lunch / dinner" names the
  meal you've logged; it then appears as a one-tap chip for that slot (🥗 marks whole-food). Applies food, the
  whole-food flag and the time. ✕ removes a chip. Stored as `savedMeals` in the Health row.

## v7.61 — 2026-09-27 (Today v1.6)
- Periodic: **ZOZOFIT scan + tape, monthly** — from the last saved measurement date; links to the Measurements card.
- Today now shows a **Signed out** notice with a button to the Time tab's sign-in when there is no session,
  instead of silently reading nothing.

## v7.60 — 2026-09-27 (Today v1.5)
- **Six more steps.** Morning: **Morning reset** (core — the Movement routine completed) and **Blood pressure**
  (optional — today's Withings cuff reading). Afternoon: **Walk** (core — steps ≥ today's ramp goal, Withings or
  entered). Evening: **Workout per plan** (core — lift day needs Resistance ticked, cardio day needs Cardio,
  both needs both, rest day counts as followed; detail names the Strava class) and **Muse meditation** (optional).
- **Periodic block** at the bottom, never counts toward the run: **Review trends** every 30 days (last Insights
  analysis run) and **Lab draw** every 90 days (last lab date) — each shows last / next-by / overdue and links
  to its screen. More can be added the same way (ZOZOFIT monthly once the scan data is in reach).
- Today reads the `muse` row as well now. Shell: the Today tab sits on its own full-width row above the others.

## v7.59 — 2026-09-27 (Today v1.4)
- **Water is a goal, not a tap.** Three checkpoints against your Health water goal (80 oz): ⅓ by noon, ⅔ by
  mid-afternoon (both optional prompts), and the full goal **done before evening** (core). A 2 oz glass no longer
  ticks anything; each row shows `x of 80 oz · n more for this checkpoint`.
- **Supplements split into noon and night.** Noon dose = at least one ticked (optional prompt); night dose = all
  ticked (core). The log is per supplement, not per time, so this is the honest split available.
- New **Afternoon** block between Noon and Evening; "now" marker follows the clock (Morning <11, Noon <14,
  Afternoon <17, Evening).

## v7.58 — 2026-09-27 (Today v1.3)
- **Fix: the weigh-in step never ticked.** Withings day records carry `weightLb` / `weightKg`; Today was reading a
  field called `weight` that doesn't exist. Now reads the right one in your chosen unit. Found on Linda's first
  real day — the headless test had used a made-up field name. Test data now mirrors the real record shape.

## v7.57 — 2026-09-27 (Study: PMP plan rebuilt)

- **PMP Roadmap rebuilt for the Sept 27 recalibration** (30 PMTI hours still open; Sept 30 target dropped).
  Seven weeks from Sept 28: PMTI runs on the treadmill at 2× on cardio days (≈6 contact hrs/wk → 35 by ~Nov 1);
  evenings are Study Hall only. Mocks: Oct 1 = baseline, **Oct 12 = reschedule gate** (≥65 keep · 55–64 keep +
  4 h weekends · <55 reschedule before the free cutoff Oct 15), Nov 1, Nov 7. Boot camp Nov 9–12.
- PMTI course pace line now counts to **Nov 1** and shows the weekly treadmill hours needed.
- One-time migration (`study.pmpPlanV2`), additive: reframes the "Oct 1 mock" checklist item as BASELINE, adds
  "★ Oct 12 re-mock — decision gate" and "PMTI 35 hrs on the treadmill by Nov 1". Items you edited are untouched.
- Same migration sets the PMP subject to **2 h weekdays / 3.5 h weekend days** (weekly 17 h, goal 100 h) and
  writes those minutes into the Schedule template (120 / 210) — only the PMP column; other subjects keep their
  minutes. ON TRACK, the Study Today card and the Today tab's 2 h bar now grade against the same plan.

## v7.56 — 2026-09-27 (Today v1.2)
- Today: link row under the header — **Inspiration · week by week (OneNote)**. More links go in `TODAY_LINKS`
  near the top of the Today app, one `[label, url]` per line.

## v7.55 — 2026-09-27 (Today v1.1)

- **Today: four more counted steps** — Fast (≥ the Health fasting goal, computed from last night's stop time
  and this morning's start time; the habit tick counts as fallback), Supplements (all listed taken),
  Whole foods all day with no sugar (all three meal flags, or the habit tick), Invisalign (hours vs goal,
  same math as the Invisalign tab). All four are core: they make or break the run.
- **Study bar raised to 2 h on the timer** (stretch 3 h shown in the detail). The step ticks at 120 min.
- **Run counts from Sept 28** (`RUN_FROM`) — Linda's reset. Earlier days are ignored, nothing deleted.
- Core steps are now: weigh · fast · water · supplements · 2 h study · dinner · stop time · whole foods ·
  Invisalign. Optional (never break the run): lunch, question set, flashcards, the read-only visits.

No schema change. Nothing removed, nothing renamed.

## v7.54 — 2026-09-27 (Today v1.0)

- **New Today tab — the daily routine, verified by the app.** First tab and the default landing. Morning /
  Noon / Evening (and Sunday) steps from the routine doc, each ticked from entries that already exist:
  Withings weigh-in, water tap, lunch, study timer (minutes + subject), question set + tagged misses,
  flashcards reviewed, dinner, stopped-eating time; on Sundays also next week's schedule and a look at
  Streaks. Read-only steps ("Read Health → Today") only know that the tab was opened today. Tap any step to
  jump to its screen. A **Next** card names the first undone step. The header shows done / to go and a
  **run** of consecutive days where the five core steps (weigh · water · timer · dinner · stop time) were
  all met — derived from history, never stored, so it can't be gamed or lost.
- Reads `hundred_days` and `quick_log` directly; refreshes when any app saves. Nothing new stored except
  a per-day "visited" stamp in the browser and a per-day flashcard review count in `quick_log`
  (`study.flashcardDrill`), written by the Flashcards tab.
- New `lc:view` event lets the shell open a specific Health view or Study chip (used by the step links).
- This is the first draft of the single cross-app Today from the Nov 15 spec, built where it will be used.

No schema change. Nothing removed, nothing renamed.

## v7.53 — 2026-09-27 (Health v3.97)

- **Provenance labels on habits.** Every habit row on Health → Today now says *why* it's ticked, derived at
  render time from the same signals the auto-checks read — nothing new is stored, so the label can't drift:
  `From Withings · 7.2 h` · `From Withings · 11,200 of 6,500` · `Completed from Strava · 35 min` ·
  `Credited from 92 min study` · `Completed from Muse` · `Completed from Nutrition log · 13h 10m fast` ·
  `Manually checked`. Unticked habits show progress toward the auto-check where there is any
  (`45 min study so far (60 credits)`), and sleep/steps show `Waiting for sync` on today until data lands.
- **Nutrition copy-day.** Two controls above the meal card: **↧ Same as yesterday** and **Copy from…** (last
  14 logged days). Copies meals, times, whole-food flags, snacks and sugar into the selected day; never
  touches `stoppedPrev` (derived from the previous night). The whole-food / fasting auto-checks fire on the
  copy exactly as on a manual entry. Saved meals ("usual breakfast") are the next step if this proves useful.

No schema change. Nothing removed, nothing renamed.

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

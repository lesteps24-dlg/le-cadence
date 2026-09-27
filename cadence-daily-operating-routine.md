# Le Cadence — Daily Operating Routine & Change Plan

**As of:** September 27, 2026 · Live build **v7.52**, v7.53 delivered (Health v3.97 · Muse v1.15 ·
Streaks v1.31 · Practice v3.1) · Owner: Linda
**Status:** BUILD GUIDE — but §8 is now **verified against the repo**, not assumed.
**Sources read:** `lesteps24-dlg/le-cadence` @ `main` (commit `1f4751b`),
`cadence-weekend-plan.md` (Sept 19), external structural review (working from v7.49).

> **Correction of record:** both the weekend plan and the first draft of this
> document said live was v7.50. It is **v7.51**, dated Sept 19. The difference
> matters — see A7 in §7.

---

## 1. The read — and the pushback

You asked to maximize use of the app. For the next 49 days that is the wrong
objective, and I'd rather say so now than after you've spent a weekend on it.

| Date | Gate | Days out |
|---|---|---|
| Sep 30 | 35 PMTI contact hours complete | 4 |
| Oct 1 | Full-length mock — reschedule decision gate | 5 |
| Oct 15 | Free reschedule cutoff (US$70 after) | 19 |
| Nov 9–12 | PMTI bootcamp | 44–47 |
| **Nov 14** | **PMP exam** | **49** |

Broadening app usage between now and Nov 14 competes directly with the only
deliverable that has an external date on it. The objective for this window is
the opposite of maximizing:

> **Cadence should cost under 5 minutes a day, make the exam run visible, and
> require no decisions about where to click.**

Second point, less comfortable: you've told me twice you're only really living in
the Study tabs. That is not a discipline failure to fix by trying harder. It's
the app telling you which surfaces earn their place. The design response is to
stop presenting parallel tabs at every open and present one sequence.

---

## 2. What the automatic syncs bought you

You noticed the health syncs running on their own. That is the material change:
it converts Health from a data-entry surface into a read-only one on weekdays.

**Now automatic — never touch these**

| Source | Feeds | Trigger |
|---|---|---|
| Oura | Sleep, HRV | Overnight, via `oura-proxy` Worker |
| Withings | Weight, body comp, Composition Trend | On weigh-in |
| Strava (Peloton auto-post) | Resistance / Cardio / Deep-breathing ticks | On class completion, via `strava-sync` |
| Morning routine + Reset tab | Morning routine, Movement breaks habits | In-app completion |
| Time app (60+ min study) | Reading habit | On save, via `lc:timeSaved` |
| Muse session | Deep breathing habit | On save, via `lc:museSaved` |
| Health h4 check-marks | Streaks Lift anchor | Derived |
| Per-day step goal (ramp) | Streaks Walk anchor | Derived |

**Still needs your hand** — now a short list: water quick-add (one tap),
nutrition, supplements, blood pressure, Invisalign, the study log, errors,
flashcards. Plus the weekly/monthly items in §4.

**A1:** all three sync Workers confirmed live, including Strava — the weekend
plan still had "paste the Worker URL into Health → Strava, do a first class"
open. If Strava is what came alive, that's closed. Confirm.

---

## 3. The daily routine — v7.53, settled Sept 27

Three touchpoints plus Sunday. Rule: **one screen per touchpoint, and nothing that syncs itself is ever opened.**

### Morning — after 6:00, before leaving (≈2 min)
1. Withings scale. Only "entry" — weight, body comp, last night's sleep flow in on their own.
2. **Health → Today**, read only: *Today's plan* banner (Lift / Cardio / "Rest day — plan followed"); *This Week*
   card (steps vs today's ramp goal). Habit rows stay collapsed; provenance labels say what already ticked;
   "Waiting for sync" means leave it.
3. Tap **water** once.
4. Close. Do not open Withings, Oura, Labs, Metrics or Sources.

### Noon — lunch (≈1 min, optional)
1. **Health → Nutrition** → **↧ Same as yesterday** for breakfast if it repeats; log lunch.
2. Water tap. Close. **Work Mode on, app closed** for the rest of the day; Reset tab only for an actual movement break.
If this touchpoint gets skipped for a week, that's data: food logging moves to dinner only.

### Evening — study block (≈3 min of app across the session)
1. **Study** → Today card → pick the subject.
2. Start the **timer**. Leave the app.
3. Stop the timer; the session saves itself. 60+ min credits Reading (label appears on Health tomorrow).
4. Question set done? **PMP → Errors**: attempted / wrong, tag each miss (M/K/D/J/T).
5. **Flashcards** to zero due.
6. Dinner: **Health → Nutrition** → dinner + **stopped eating** time (drives tomorrow's fasting auto-check).
7. Close. Streaks derives itself; nothing to check before bed.

### Sunday (≈10 min)
Health **Week** card (planned vs done rings) · Study **Schedule** grid (next week's minutes) · **Streaks** one look ·
**Practice** only if a real conversation is coming. Strava ticks came in all week — don't touch them.

### What this drives in Tier A
Evening steps 1–5 are four chips today. The **Study Today accordion** (§5) turns them into one scroll and is the
only Tier A item left that changes daily behaviour. Build after the Oct 1 mock.

## 4. What leaves the daily view

The app feels heavy because everything is presented at daily frequency when most
of it isn't daily. Tier it:

| Cadence | Items | When |
|---|---|---|
| **Daily** | Health Today (read), water, Study sequence | Per §3 |
| **Weekly** | Week card, next week's study plan, reflections, Practice / Muse | Sunday |
| **Monthly** | ZOZOFIT scan + CSV drop into Measurements | First weekend |
| **As drawn** | Labs panel (incl. Whoop Advanced Labs) | On results |
| **Post-Nov 14** | Everything in Tier B, §7 | Nov 15+ |

Standing design rule this implies: **a surface appears on open only at its own
cadence.** Weekly cards render Sunday. Monthly cards render the first weekend.
Otherwise they're one level down, not on the daily path.

---

## 5. Study `Today` sequence — the build spec

### Problem

Study presents parallel destinations — HQ/Plan, Log, Schedule, Flashcards,
Notes, More, plus AMP and Strat Comm chips — when a study session is a
*sequence*. You navigate to update content that arrives in fixed order, and you
have to remember where you were.

### Proposal

A single accordion spine as Study's default view. One step open at a time;
completing a step collapses it and opens the next.

**Always-visible header strip (read-only)**
`49 days to exam · Week 3 of 10 · Study anchor 5/7 · PMTI 31/35`

**Step 1 — Plan for today** *(opens expanded)* — pulls today's items from the
minutes grid and the AMP tracker. Read-only, checkboxes, no typing.

**Step 2 — Study & log** — timer chip, subject and module **pre-filled from Step
1**; a note field inline. Collapses on save.

> **Revised after reading the code.** I assumed (A4) that the Log was typed
> manually even when the timer ran. **It isn't.** The timer already writes
> `{ id, subjectId, start, end, secs, note, type }` straight into `quick_log`,
> and there is no separate manual add-session form. So the original Step 3 was
> solving a problem you don't have. It collapses into Step 2 as a note field, and
> the sequence's real value moves to Steps 1, 4 and 5 — reading the plan,
> capturing misses, and clearing the deck. **The payoff is smaller than I pitched
> it.** Still worth one session, but it is now a navigation fix, not an
> entry-elimination fix, and you should judge it on that basis.

**Step 3 — Errors** *(renders only if the session had a practice set)* —
attempted, wrong, then each miss with the Q-line miss-tag (M/K/D/J/T) and the
domain pre-filled from Step 1.

**Step 4 — Flashcards** — due count for today's subject, button to drill.

**Step 5 — Done strip** — one line of what the session moved:
`Study anchor ticked · Reading credited from study (92 min)`.

### Collapse rules

- One step open at a time; completion advances.
- A collapsed completed step shows its result in the header — `Log · 92 min ·
  Agile · saved` — so nothing is hidden, only quiet.
- Steps that don't apply today don't render.
- Collapse state is **session-only** — every open starts at the first incomplete
  step. Same decision you made for the Health habit groups in v3.86, reused.
- Nothing new to configure. No settings added.

### Worked example — Tuesday, Sep 29

```
49 days to exam · Week 3 of 10 · Study anchor 5/7 · PMTI 31/35

▾ 1. Plan for today
    □ PMTI: Agile Part 2 — 90 min (contact hours)
    □ Study Hall: Risk domain set, 25 questions
  ───────────────────────────────────────────────
  2. Study                                     ·
  3. Log                                       ·
```

After the treadmill session and the question set:

```
  1. Plan for today          2 of 2 done        ✓
  2. Study & log             92 min · Agile     ✓
▾ 3. Errors
    Attempted 25 · Wrong [ 6 ]
    → tag each:  domain Risk ▾   miss K ▾   note _______
  ───────────────────────────────────────────────
  4. Flashcards              9 due              ·
```

### Self-correction after reading the external review

The review's sharpest observation is that **several areas already have their own
Today screen** — Health has one, Study has a Today card. A naive fix adds a
third, which is the wrong direction if the endpoint is one cross-app Today.

So the framing changes: **this is not a third Today, it is the first draft of the
single one**, built where you'll actually use it daily. At Nov 15 it gets
promoted to shell level and absorbs Health's Today rather than being replaced.
That makes the sequence a prototype with a known destination instead of throwaway
surface area.

The review also warns against pulling every dashboard onto Today — "that would
recreate the navigation problem as a scrolling problem." Correct, and the
accordion with session-only collapse is precisely the answer to it. Agreement,
not conflict.

---

## 6. External review — what I'd take and what I'd drop

Credit first: it's honest about its own limits (a file and structure review, not
a usability test), it reaches the same conclusion your own weekend plan reached
independently, and its provenance-label idea is the best cheap win in the whole
backlog. Three independent reads now land on *one Today, tools one level deeper,
Health by purpose not by device.* That direction is settled. Only the timing is
contested.

### Take — and the strongest item is not the restructure

| # | Review item | My read |
|---|---|---|
| 5 | **Provenance labels** — "Completed from Strava", "Reading credited from study", "Manually checked", "Waiting for sync" | **Best item in the document, and cheaper than it looks.** The pattern already exists in Health — the code carries `source = "log"` / `"you"`, renders `"your log"` and `"Oura+Withings"`, and distinguishes `withings_mat`. So this is **extending an existing convention to habits and the Reading credit**, not inventing one. Reuse before building. Ship before Nov 14. |
| 5 | Unified **Saved / Saving / Couldn't save** wording | Take the *wording* now — and the component already exists: v7.51 added `window.__lcToast` for shell-level notices. Wire the wording through it. |
| 4 | **A planned rest day should count as following the plan** | Correct, cheap, and `state.workoutPlan` already has Rest as a value. One-line logic fix. |
| 3 | **Health by purpose, devices underneath** | Right, and already yours — the weekend plan has "Health by outcome" and "fold Oura/Withings/Whoop/Strava into a Sources screen." Nov 15. |
| 1 | One cross-app Today, tools one level deeper | Right, and already yours. §5 is the prototype; full promotion Nov 15. |
| 4 | Separate daily commitments / weekly targets / longer-term outcomes; Streaks into Review | Directionally right. See the correction below. |
| 6 | The passcode hides sections while components stay mounted; UI lock ≠ data protection | **Correct in principle, partly already fixed** — see below. |

### Drop

**The "Work" area.** The review proposes Work as one of five top-level areas —
commitments, projects, planning, time tracking. You have already decided against
Cadence for work to-dos and are looking at Copilot instead, because Copilot sits
inside the work environment and can read your calendar and mail. Cadence cannot
and will not. Building a Work area builds a surface you've already ruled out, and
it would need daily manual entry — straight through your maintenance ceiling.
This is the review reasoning from the code rather than from your usage.

**File splitting / Vite / per-area source files, now.** Architecturally correct,
and it's your own post-Nov-14 item. It also introduces a build step into a deploy
path that currently just pushes static assets to `main` — a new failure mode
seven weeks out from the exam. Nov 15.

### Corrections to the review

1. **It's reading v7.49; live is v7.50.** So it reports the Streaks "design
   conflict" — Lift as both a 3×/wk habit and a fourth anchor — as unresolved.
   It isn't: weekly habits never gate the daily streak, `addedOn`/`weeklySince`
   stamps mean past days are judged only on habits that existed then, and the
   agreed fallback is to archive Lift rather than let it erode study. The rule it
   asks for ("preserve your existing history rules") is already the rule.
2. **The security point is half-done work, not new work.** The data layer was
   addressed — RLS audit, `app_lock` moved to SELECT-only, SQL written to scope
   every table to your `auth.uid()`. What's actually open is narrower and more
   urgent: (a) confirm that RLS SQL was run and tested on both devices,
   (b) "Allow new users to sign up" → OFF, (c) the `cadence-practice` and other
   AI Workers rejecting calls that don't originate from the app. Item (c) is the
   live exposure — an unprotected Worker lets anyone burn your API key. Those
   three are Tier A.
3. **No schedule awareness.** The review never mentions Nov 14. Every one of its
   recommendations is sound and roughly half of them are the wrong thing to do in
   the next seven weeks. Treat it as a Nov 15 roadmap with four items pulled
   forward, not a work plan for this weekend.

---

## 7. Merged change plan

### This week specifically (Sep 26 – Oct 4)

The build window this week is **today and tomorrow**, not the weekdays. Sept 30
is the PMTI 35-hour deadline and Oct 1 is the mock that gates your reschedule
decision. Mon–Fri is zero build. That is not caution, it's arithmetic: four days
to a hard deliverable.

What fits in one sitting this weekend, ordered by friction removed per hour:

| Do | Why it's first | Size |
|---|---|---|
| **1. Passcode relock → idle-based, not per-tab-change** | You identified this yourself and it is the single worst friction in the app. Right now walking Practice → Muse → Streaks is a passcode gauntlet. Relock after ~15 min idle, or once per app-open. This is literally "cumbersome to walk through." | ~30 min |
| **2. Per-view Hide toggle in Settings** | **The highest-leverage navigation fix available before Nov 14**, and it's your own idea from the weekend plan. Health has ~17 views and Time ~9. Hiding what you don't open cuts the tab count *without restructuring anything* — additive, reversible, no state keys renamed, no data paths touched. | ½ session |
| **3. Provenance labels on auto-completed habits** | "Read 10 min" ticking off 60 minutes of study is the most confusing behavior in the app. Label it `Credited from 92 min study`. Extends the existing `source` convention. | ~45 min |
| **4. Rest day counts as plan-followed** | Removes a false "behind" signal on a day you did exactly what you planned. | ~10 min |

**Scope warning on #2** — it's the one item here that can balloon, because it
needs a Settings surface plus a nav filter in each app. If it starts to sprawl,
fall back to a hardcoded `HIDDEN_VIEWS` constant near the top of `index.html`
that you edit by hand. Ten minutes, 90% of the value, no UI to build. Take the
fallback rather than losing the weekend.

**Not this week:** the Study `Today` sequence. It's a full session, and its payoff
shrank when A4 turned out false — it's a navigation fix now, not an
entry-elimination fix. Next weekend, after the Oct 1 mock, when you know whether
you're rescheduling.

**Separate track, ~20 minutes, not a build session:** add a shared-secret or
origin check to the `cadence-practice` Worker (A6 below). It's the only open item
with an outside attacker, and an unprotected Worker burning your API key gets
discovered as a bill. Unrelated to usability; do it while you're in there.

### Tier A — before Nov 14 (additive or risk-reducing only)

| # | Change | Size | Why now |
|---|---|---|---|
| A1 | Study `Today` sequence (§5) | 1 session | The daily path; additive, existing save paths. Scope reduced — see §5 |
| A2 | Extend existing `source` labels to habits + the Reading credit | ½ session | Makes automation legible; convention already in the code |
| A3 | Saved / Saving / Couldn't save wording through `window.__lcToast` | ½ session | Wording only; component exists |
| A4 | Rest day counts as plan-followed | minutes | One-line fix |
| A5 | **Usage meter idle bug** (1222m/day) | ½ session | §9 can't measure utilization until this is right |
| A6 | Security close-out: sign-up toggle OFF · confirm RLS SQL ran on both devices · **Worker origin check or shared secret** | ½ session | A6c is live exposure of a paid API key — the only item here with an outside attacker |
| ~~A7~~ | ~~Optimistic-concurrency saves~~ | — | **ALREADY DONE.** v7.51 shipped it on Sept 19: shared `window.__lcSave`, writes land only if the row still carries the `updated_at` this device last read, mismatch reloads and toasts. Covers `quick_log`, `cadence_workspace`, `hundred_days`, `muse`, `linda_consistency`, `practice_studio`. No schema change. |

Two items missing from my earlier draft of this list, now promoted above
everything else in it — both are in the this-week block above:

| # | Change | Size | Why it outranks A1 |
|---|---|---|---|
| **A0a** | Passcode relock → idle-based | ~30 min | Highest friction-per-minute in the app, and already on your own list |
| **A0b** | Per-view Hide toggle (or `HIDDEN_VIEWS` constant) | ½ session | Cuts navigation surface with zero restructuring. Reversible. This is the intuitive-ness fix; A1 is a refinement on top of it |

Order: **A0a → A0b → A2 → A4 → A6 → A1.** A5 cut (see §9).

I had A1 at the top of Tier A. That was wrong. A1 improves one flow; A0b improves
every flow by deleting the destinations you never wanted, and it costs less.

A7 was the item I flagged as the riskiest judgment call in Tier A, and it turns
out you shipped it a week ago. That removes the only entry on this list that
touched all five save paths — Tier A is now entirely additive, and the iMac/iPad
overwrite risk is closed. Worth updating `cadence-weekend-plan.md`, which still
carries it as an open weekend item.

### Tier B — Nov 15+

Five-area IA (Today / Study / Health / Review, **no Work**) · shell-level Today
absorbing Health's · Health by purpose + Connections screen · Streaks into
Review with a small indicator on Today · Study 8→4 tab merge · per-area source
files or Vite · service worker + update prompt · error boundaries + save-failure
toast with retry · Stats Review mode on `hundred-days-analyze` · Cloudflare
Access · per-tab usage → archive dormant views · Budget Tracker.

### Rejected

Work area in Cadence (use Copilot) · anything requiring weekly hand-tending.

### Schedule risk — stated now, not after

- Tier A is additive or risk-reducing. Nothing removed, nothing renamed.
- Tier B touches nav and state keys. A bad merge on Log or Errors loses study
  history in the final stretch, and it is cosmetic once the sequence exists.
- The Sept 16 parallel-edit divergence is the precedent: two chats edited at once
  and either deploy would have silently overwritten the other. All Cadence work
  runs through this Project only.
- Keep the cream / ink / ember / sage palette and the circular icon. The review
  agrees; no visual work is needed or wanted before Nov 14.

---

## 8. Assumptions — now checked against the repo

Four of seven are resolved from the code. Two of those were wrong, and both were
wrong in the direction of me overstating the benefit.

| # | Assumption | Verdict |
|---|---|---|
| A3 | `app_usage` records tab opens, not only state | **FALSE.** The upsert writes `{ id: "linda", state: { ...existing, devices } }` — per-device minutes only, no per-tab counter. Utilization is **not** free to measure. See §9. |
| A4 | The Log is typed manually even when the timer ran | **FALSE.** The timer writes the session itself and there is no separate add-session form. Step 3 deleted; see §5. |
| A6 | PMTI hours can be read for the header strip | **TRUE.** `pmtiDone` / `pmtiPos`, per-video `hours`, and the playback-speed toggle are all stored. The counter is a read, not new build. |
| — | Provenance labels are new work | **FALSE — cheaper than assumed.** `source` is already a first-class field in Health. See §6. |
| A1 | All three sync Workers live, incl. the Strava URL in Health → Strava | **Still yours to confirm** — needs the running app, not the code. |
| A2 | Study block is evenings on weekdays | **Still yours to confirm** — ordering of Touchpoints 1 and 3 only. |
| A7 | The RLS SQL from Sept 19 was run and tested on both devices | **Still yours to confirm** — Supabase-side, not visible in the repo. Decides whether A6 in §7 is a check or a task. |

The pattern in the two falsified ones is worth naming: I assumed manual effort
where you had already automated it. The app is further along than the planning
documents describe it, which is its own finding — see §11.

---

## 9. Utilization focus — the next three weeks

No new tracker; anything needing weekly hand-tending will rot, per your own
ceiling.

- **Week of Sep 28:** use the `Today` sequence only. Don't open other Study tabs.
- **Week of Oct 5:** the question is *which step did you skip.* A skipped step is
  a design defect, not a discipline problem — we auto-fill it or delete it.
- **Week of Oct 12:** lock the sequence. Confirm Tier B is Nov 15.

**Measurement — revised, because A3 was false.** `app_usage` stores per-device
minutes, not per-tab opens, so there is nothing to read. Two options:

1. **Add a per-tab counter** — one increment on tab change, merged into the
   existing `app_usage.state`. Small, but it's still new code before the exam.
2. **Skip instrumentation entirely.** You only need one answer — *which step did
   you skip* — and you can answer that from memory each Sunday in ten seconds.

**I'd take option 2 before Nov 14** and add the counter in Tier B, where it feeds
the "archive dormant views" decision properly. Instrumenting a three-week
observation you can do by recall is the kind of upkeep that rots. Note this also
demotes A5 (the idle-time bug): it no longer blocks anything in §9, so if you want
Tier A shorter, A5 is the item to cut.

---

## 10. What I need from you

The upload step is retired — see §11. What's left is three confirmations, all
things the code can't tell me:

1. **A1** — are all three sync Workers live, Strava URL included?
2. **A7** — was the Sept 19 RLS SQL run and tested on both devices?
3. **Mark up §3** — is the daily routine right, and is the study block evenings?

And one decision: **is A1 (the Study sequence) still worth a session** now that
it's a navigation fix rather than an entry-elimination fix? I'd still do it, but
the case is weaker than I made it an hour ago and you should get to re-rule on it.

---

## 11. Repo access and hygiene

**I can read the repo directly.** This session is authenticated to GitHub as
`lesteps24-dlg` and clones `lesteps24-dlg/le-cadence` over HTTPS. Everything in
§8 was verified that way. **You no longer need to upload `index.html`** — amend
the session protocol in `cadence-weekend-plan.md` accordingly. (The GitHub REST
API is blocked by this environment's egress proxy, but `git clone`/`fetch` work,
which is all that's needed.)

Three things found while in there, none urgent:

1. **A stray file named `download`** (20 bytes) sits in the repo root, containing
   `.DS_Store` and `Thumbs.db`. It's a `.gitignore` that got saved under the
   browser's default filename. Rename it to `.gitignore` — as it stands it does
   nothing and those files will get committed.
2. **`main` has one commit, `1f4751b` "Add files via upload."** The new session
   protocol says every change is a version bump + CHANGELOG line + commit. Right
   now the repo has no history to roll back to, which is the main benefit you
   moved it there for. Worth committing per change from here on.
3. **`CHANGELOG.md` v7.50 says "deployed by Cloudflare Pages."** It's a Worker
   with static assets. Minor, but the deploy docs are exactly where a wrong word
   costs an hour later.

I have made no changes and committed nothing. Say the word and I'll fix items 1
and 3 as a single commit, or leave the repo untouched.

---

## 12. Build record — v7.52 (Sept 26)

Built on branch `feat/functions-challenge-tab`, commit `c7e59df`. **Not pushed** —
this session has read access to the repo but not write, so it is delivered as a
patch plus the built `index.html` and `CHANGELOG.md`.

| Item | Status | Notes |
|---|---|---|
| Functions Challenge tab | **Built, active** | Fourth GOALS chip (2×2 grid now). 6×8 level grid stored in `study.fsmDone` as `"FUNC:level"`. New subject `su7` migrated into existing state so the timer logs to it. Rows added to Today and ON TRACK. |
| 1 — Passcode idle relock | **Built** | One unlock covers Practice / Muse / Streaks, lapses after 15 min idle. Deadline held in a ref so a click never re-renders the shell. 🔒 still locks immediately. |
| 2 — Hide unused views | **Built as the fallback** | `HIDDEN_VIEWS` constant near the top of the Health app, empty by default; `today` can't be hidden. The Settings toggle is deferred past Nov 14, as agreed. |
| 3 — Provenance labels | **NOT built** | Deliberate. See below. |
| 4 — Rest day = plan followed | **Built** | Banner reads "Rest day — plan followed ✓" in sage instead of rendering grey. No habit, streak or anchor logic touched. |

### Why item 3 was not built, and the better design

`state.completions[day][habitId]` is a bare `true`. There is no provenance stored
anywhere, so labels need one of two things:

1. **Store the source** — change the value shape, or add a parallel
   `completionSrc` map. Additive, but it needs writing at five separate
   auto-check sites (sleep, steps, muse, study→reading, Strava) and the stored
   label can drift from the logic that set it.
2. **Derive the source at render time** — the signals are all still available
   (`studyDays[d]`, the Strava workout list, `cm[day]` cardio minutes). No schema
   change, nothing to migrate, and it cannot drift because it recomputes from the
   same inputs that caused the tick.

**Option 2 is the right build** and it is not a 45-minute job as I estimated — it
needs the signals threaded into the habit-row render. Rather than ship half of it
into the app you're studying in tonight, it's the first item next weekend.

### Verification — and its limit

The transpiled JSX parses clean through esbuild (the whole 1.13 MB inline Babel
block). **It has not been run in a browser.** The CDNs this page loads React,
Babel and supabase-js from are unreachable from this environment, so no runtime
test was possible. **Load it once and click through Study → Functions, the
passcode on Practice, and Health → Today before you merge.**

### Repo hygiene — still untouched, awaiting your go-ahead

`download` (a `.gitignore` saved under the browser's default filename) and the
CHANGELOG's "deployed by Cloudflare Pages" for a Worker. I left both alone.

---

## 13. Deploy procedure — the standing version

**How the two services split.** GitHub holds the files and the history. Cloudflare
watches `main` and publishes it, usually within a minute. You never log into
Cloudflare for a normal update.

### One-time setup — Windows

1. **GitHub Desktop for Windows** — `desktop.github.com`. Sign in, then
   **File → Clone repository → lesteps24-dlg/le-cadence**. It lands in
   `C:\Users\<you>\Documents\GitHub\le-cadence` by default. This ends the
   download-and-upload cycle: new files get dropped into a real folder, and you
   get a local copy to open and test before anything goes live.
   *(If you also work from the iMac, the Mac version is the same app and the same
   flow — just don't have both clones half-updated at once. One machine per
   change, push before switching.)*
2. **Add the three automation files** (delivered Sept 26):
   `scripts/check-html.mjs`, `.github/workflows/check.yml`, `.gitignore`.
3. **Delete `download`** — its rules now live in `.gitignore`, and the new check
   fails if it reappears.

### What the check enforces, on every push and PR, with no upkeep

- Every inline script in `index.html` parses, JSX included — a syntax error is
  caught before Cloudflare publishes it.
- All five deploy files are present (a missing icon breaks the installed Dock and
  iPad app).
- The shell `APP_VERSION` was bumped **and** `CHANGELOG.md` has a matching entry.
  This is the session protocol, enforced instead of remembered.
- No `.DS_Store`, `Thumbs.db` or `download` committed.

**Running it locally (optional — the Action runs it for you either way).** Install
Node LTS from `nodejs.org`. Then in GitHub Desktop use
**Repository → Open in Command Prompt**, and run:

```
npm install --no-save esbuild@0.25.0
node scripts/check-html.mjs
```

The `npm install` is once per clone, not once per run.

### The standing flow from here

1. Claude hands over changed files (or a patch).
2. Drop them into the local clone.
3. GitHub Desktop → **new branch** → Commit → **Publish branch**.
4. GitHub shows a **Create pull request** button. Open it. The check runs.
5. **Green → Merge.** Cloudflare deploys `main`. **Red → don't merge**; the log
   names the file and line.
6. Hard-refresh Cadence — **Ctrl+Shift+R** on Windows (Cmd+Shift+R on the Mac), or
   close and reopen the installed app. On Windows the installed app comes from
   Edge or Chrome's "Install this site as an app"; the five-file rule still
   applies, since a missing icon breaks that app's tile the same way it breaks the
   Mac Dock icon.

Cloudflare only publishes `main`, so a branch is genuinely safe: nothing you push
to one can reach the live app until you merge. **That is the staging gate the
repo has never had** — and the reason to stop uploading straight to `main`.

### Rollback

GitHub → **Commits** → open the previous one → **Revert**. Cloudflare republishes
the old version automatically. This only works once there is more than one
commit — before v7.52, `main` had exactly one, so there was nothing to revert to.

### Why Claude still can't push

This session can read the repo but not write to it. A Cowork session's
repositories are fixed when the task is created and cannot be added mid-session —
a documented open gap, not a misconfiguration. **Fix for next time: attach the
repository when starting the task.** Then Claude pushes the branch, the check
runs, and Linda only clicks Merge.

---

## 14. Food logging — the MyFitnessPal question

### What you actually asked for

You asked about a MyFitnessPal API, then said the thing that made it work was that
it **let you copy food choices rather than re-entering each day**. Those are two
different requests, and the second one is the real one.

**The mechanism that made you consistent for months was a UI affordance, not a
data pipe.** Copy-a-previous-day needs no API, no subscription, and no sync that
can break — it is a feature built on data Cadence already holds.

### Why the API route is a dead end

| Route | Status | Verdict |
|---|---|---|
| MyFitnessPal official API | Exists, but access is requested at `partners@myfitnesspal.com` and you must state "what company you work for and the purpose." OAuth2 only. | **Partner/commercial channel.** Not a realistic path for one person's personal app. |
| MyFitnessPal CSV export | **Premium-only.** Manual, on-demand, emailed as a zip of three CSVs. No scheduled or automated export exists. | Workable as a *monthly* drop, like the ZOZOFIT flow. Useless for daily logging. |
| Unofficial scraping libraries | Depend on MFP's private endpoints and break without notice. | **Rejected** — straight through the maintenance ceiling. |

### The build instead: copy-day in the Nutrition tab

Three affordances, in order of how much friction each removes:

1. **"Same as yesterday"** — one tap, copies yesterday's entries into today. Likely
   80% of the value on its own, since your eating repeats.
2. **"Copy from…"** — pick any previous day and copy it, for a rotation rather than
   strictly yesterday.
3. **Saved meals** — name a combination once ("usual breakfast"), reuse it forever.
   This is the same pattern as the editable water quick-add buttons in v3.85, which
   you already asked for and use, so it reuses a convention rather than inventing one.

All three read and write `hundred_days` state that already exists. No new table, no
external dependency, nothing to authorize, nothing that can go stale.

### Timing

This is a **daily-friction** item, which is the category §7 says is worth doing — but
it is a new build, not one of the four already agreed. **Recommend: after the Oct 1
mock**, alongside the Study `Today` sequence, unless you want it sooner and
something else drops. Not before Sept 30.

### If you'd rather keep logging in MyFitnessPal

Then the honest integration is the Premium CSV drop on a monthly cadence — a
"drop an MFP export" zone in the Nutrition tab, mapping the Meal Level Nutrition
Details file. Same pattern as ZOZOFIT. That gives Cadence the history and the
trends, but the daily logging stays in MFP and Cadence never sees today's food.
Pick one home for food; don't log in both.

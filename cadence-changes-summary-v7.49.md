# Le Cadence — changes from this chat (Aug 27 – Sep 15, 2026)

Current merged build: **v7.49** (Health v3.93, Practice v3.0, Streaks v1.30).
This file covers only what was built in *this* chat, plus the merge. The Health work listed
under "Not mine" came from a parallel chat and should be documented there.

---

## Merge status — read this first

Two chats edited the same app in parallel and the versions diverged:

- This chat reached **v7.29**
- The other chat reached **v7.48** (all of this chat's earlier work, plus new Health features)

**v7.49 = v7.48 + the one change this chat made after the fork (the passcode fix).**
Nothing from v7.48 was overwritten — water presets, Strava, labs, measurements, workout plan,
Felder habits and the steps ramp were all verified present after the merge.

Going forward: one project, one file lineage. A deploy from either branch would have silently
destroyed the other's work.

---

## Deploy protocol (changed — important)

Cadence is no longer a single file. Every deploy is a **five-file folder**:

```
index.html
manifest.json
icon-180.png
icon-192.png
icon-512.png
```

Cloudflare Pages treats each deployment as a complete snapshot — uploading `index.html` alone
deletes the manifest and icons, which breaks the installed macOS Dock app and iPad icon.

---

## New: Practice Studio (Practice tab)

A rehearsal tool for real conversations. Pick a room, set up the message, see what the person is
likely to push back on, talk it through, get scored.

**Rooms:** Deandre (personal, first), 1:1 with Tim, Greg's CFO staff meeting, Greg's senior staff
(Stephanie / Michelle / Ian), larger team meeting, consultants.

**Flow:** prep → predicted questions ("Boardroom Bingo") → live roleplay with per-turn coach notes →
scored debrief.

**Prep structure** uses the I·2·I framework (Angela's — Intent = Impact):
1. Say what is important
2. Why it's important (to them) — 1+2 are the message
3. Ask a question — if you already know the answer, it belongs in 1 or 2
Plus an optional clarifying follow-up.

**Debrief** is harsh-critic by design: leads with the most damaging moment, quotes the line, one
sentence maximum on what worked, then a concrete adjustment. Scores 0–100 with a readiness call
(90+ = ready for the real room).

**Persistence:** per-person drafts auto-save; named scenarios can be saved, renamed and updated in
place; History keeps score, verdict, takeaways and the transcript (full transcript for the 25 most
recent sessions).

**Infrastructure:** a Cloudflare Worker (`cadence-practice`) holds the API key server-side — the
browser cannot call Anthropic directly. New Supabase table `practice_studio`.

---

## Study tab (restructured)

Study was promoted from a view inside Time to its own top-level tab, sharing the same component
instance so the running timer and single Supabase connection are preserved.

- **Chips reorganised:** GOALS (PMP · AMP · Strat Comm) and TOOLS (Dashboard, Log, Schedule,
  Flashcards, Notes, More). PMP HQ and PMP Plan merged into one tab with an HQ / Plan toggle.
- **Today card** at the top: date, days to exam, today's plan, and per-goal hours logged vs this
  week's target.
- **ON TRACK card** on the Dashboard: cumulative actual vs planned-to-date per goal, pro-rated for
  the week in progress.
- **Schedule** rewritten as a **minutes grid** — three subject rows × seven days, actual (from the
  timer) over planned, row and week totals in hours, tap a cell to change the plan, plus a weekly
  template and per-day notes.
- **Subject order** is now user-controlled (↑↓ on the Subjects tab).

---

## PMP (Study → PMP)

- **Exam date corrected to Sat Nov 14, 2026**, with a migration for saved state.
  ⚠️ Open item: Pearson VUE's email says 8:00 AM ET, PMI's portal says 1:00 PM. Unresolved.
- **Checklist is now editable** — tap ○ / ◐ / ✓ to cycle status, ✎ edit to reword, reorder, add or
  delete. Previously hardcoded.
- **PMTI course checklist:** 9 collapsible sections, 59 videos, per-video hours, a playback-speed
  toggle that recalculates remaining time, a resume-timestamp field per video, and a pace line
  showing hours/day needed to finish by Sept 30.
- **Plan rebuilt** for the 2026 Exam Content Outline (People 33 / Process 41 / Business Environment
  26; ~60% agile-hybrid) — replacing a plan built on the retired 2021 weights.
- **Reference tab** gained: a six-step question-attack method, the "Q-line" note-taking shorthand
  with miss-tags (M/K/D/J/T), an EVM glossary explaining what PV/EV/AC/BAC actually mean, and
  tap-to-expand formula explanations covering *when* to use each.
- **39 flashcards** seeded — EVM, other math, and process sequence/discrimination.
- **Links** per goal, editable, with copy buttons. PMI Study Hall first.

**Key finding:** PMTI's "2026" video course is a recorded Zoom refresher from January 2021. PMTI
confirmed these are their latest. Plan changed to **PMTI for the 35 ATP contact hours, PMI Study
Hall for actual exam content.**

---

## AMP (Study → AMP)

- **Level 1 section tracker:** 5 sections / 27 lessons, − and + per section, overall progress bar,
  expandable per-section notes listing that section's exercises. Seeded at 10/27.
- **Deliverables checklist** (Level 1 and Level 2 milestones).

## Strategic Communication (Study → Strat Comm)

- 9-week plan mapped to MasterClass modules, with an explicit PAUSE block Oct 2 – Nov 15 during
  PMP crunch.
- **Certificate & capstone checklist:** the four certificate requirements plus the seven Strategic
  Influence Playbook components, each tagged with the module that produces it.
- MasterClass login `lndae24` surfaced on the tab and in the link label.

---

## Streaks

Narrowed from six anchors to **three — Walk, Sleep, Study** — for a 100-day run (Sep 7 → Dec 15,
exam on day 69). Eating window, whole foods and water are archived, not deleted; they still log in
Health. Walk now requires the 10K step average rather than accepting a workout instead. Copy
updated throughout ("Three anchors…", "all three, once").

---

## Security / privacy

- **Passcode lock** on Practice, Muse and Streaks. Single passcode at the shell level; relocks on
  every tab change; 🔒 button to lock manually.
- **v7.49 change:** the passcode hash moved from `app_usage` to a dedicated **`app_lock`** table
  with a **SELECT-only policy** — the app can read it and cannot write it. The "Set passcode"
  screen was removed entirely; the passcode is set in Supabase only.

**Required SQL (run before deploying v7.49):**

```sql
create table if not exists app_lock (
  id            text primary key,
  passcode_hash text not null
);
alter table app_lock enable row level security;
drop policy if exists "app_lock read" on app_lock;
create policy "app_lock read" on app_lock
  for select to anon, authenticated using (true);

insert into app_lock (id, passcode_hash)
values ('linda', encode(extensions.digest('cadence-practice:' || 'YOUR_PASSCODE', 'sha256'), 'hex'))
on conflict (id) do update set passcode_hash = excluded.passcode_hash;
```

The app hashes `"cadence-practice:" + passcode` with SHA-256. To change it, re-run the insert.

---

## Bugs found and fixed (worth knowing — same shape recurs)

Several failures traced to **code writing a whole object where it should have merged**, or to
treating a *failed read* as an *empty result*:

1. **Health "start a fresh 100 days"** wiped all logs and device sync history behind a single OK.
   Now requires typing `RESET`, and preserves the three sync Worker URLs.
2. **Usage tracker** was writing `state: { devices }` over the whole `app_usage` row, deleting the
   passcode every ten minutes. Now merges, and writes nothing if its read failed.
3. **`practice_studio` table never existed** — the Practice app silently failed to save for a week.
   Table created; a visible save-status indicator added.
4. **Row history trigger** had RLS enabled with no policy, which aborted *every* save to
   `hundred_days`, `quick_log` and `practice_studio`. Fixed with `security definer`, then throttled
   to one snapshot per row per 15 minutes after a disk-IO warning.
5. **Usage tracker counted idle time** — 1,000+ minutes/day from a window merely being open. Now
   requires interaction, stops after 5 minutes idle, pushes every 10 minutes and only on change.

**Recovery aid:** a `state_history` table plus triggers snapshot the previous version of any row
before an update, so a bad write can be rolled back.

---

## Supabase objects added

| Object | Purpose |
|---|---|
| `practice_studio` | Practice Studio state (scores, drafts, saved scenarios) |
| `app_lock` | Passcode hash — SELECT-only to the app |
| `state_history` + triggers | Previous-version snapshots for recovery |

---

## Separate app: Practice Studio demo (not part of Cadence)

A standalone shareable version at `practice-studio.lesteps24.workers.dev`, with its own Worker
(`practice-demo`) and its own capped API key. Generic titled personas, no personal rooms, no
Supabase — everything in the visitor's browser. Feedback is strengths-first (what's already
working / the next step up / a question to carry forward) rather than harsh-critic, and includes a
static Examples tab with a weak (48) and strong (88) worked conversation. Deliberately shares no
code or data with Cadence.

---

## Open items

- [ ] Resolve the Nov 14 exam time: Pearson VUE says 8:00 AM, PMI portal says 1:00 PM
- [ ] Confirm the PMTI Nov 9–12 boot camp is built on the 2026 ECO (their recorded course is 2021)
- [ ] Obtain and file the PMTI 35-hour completion certificate
- [ ] Consolidate all future app work into one project

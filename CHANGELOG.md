# Le Cadence — changelog

Shell version is `APP_VERSION` near the top of `index.html` (inside QuickLogApp). Each app also carries its own
`APP_VERSION`: Health, Muse, Streaks (ConsistencyApp), Practice. Bump the shell on every deploy; bump an app's
version only when that app changed.

## v7.50 — 2026-09-19
- Moved to a Git repo deployed by Cloudflare Pages (was manual five-file upload).
- Removed the 21 KB inline base64 apple-touch-icon from `<head>`; `/icon-180.png` already serves it.
- `manifest.json`: added `"id": "/"` so the installed app keeps its identity across URL changes.
- Added `_headers`: `index.html` is never cached by Cloudflare; icons and manifest are.
- No functional changes.

## v7.49 — 2026-09-15 (Health v3.93 · Practice v3.0 · Streaks v1.30)
- Merge of two parallel branches (v7.29 + v7.48). Passcode hash moved to the SELECT-only `app_lock` table;
  "Set passcode" screen removed.
- See `docs/cadence-changes-summary-v7.49.md` for the full Aug 27 – Sep 15 history (Practice Studio, Study tab
  restructure, PMP/AMP/Strat Comm modules, Streaks narrowed to three anchors, bug fixes, Supabase objects).

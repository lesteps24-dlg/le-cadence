# Le Cadence

Personal PWA. Single-page React app (`index.html`), state in Supabase, AI features via Cloudflare Workers.

## Deploy

Cloudflare Pages builds from the `main` branch of this repo. **Every push to `main` deploys.**
No build step: the site is the repo root as-is.

Files that must always be present at the root:

```
index.html      the whole app
manifest.json   PWA manifest (installed Dock / iPad app identity)
icon-180.png    apple-touch-icon
icon-192.png
icon-512.png
_headers        Cloudflare cache rules (index.html never cached)
```

## Making a change

1. Edit `index.html`.
2. Bump `APP_VERSION` near the top (shell) and in the app you changed (Health / Muse / Streaks / Practice).
3. Add a line to `CHANGELOG.md`.
4. Commit and push to `main`. Open the site, confirm the version string in the footer matches.

## Smoke test after every deploy

- [ ] Version string in the Time footer matches CHANGELOG
- [ ] Open each tab once (Today, Time, Study, Health, Muse, Streaks, Practice); no blank screen
- [ ] Log one water entry in Health; reload; it persists
- [ ] Passcode unlocks Practice
- [ ] Dock app icon and iPad icon still show

## Secrets

The Supabase anon key in `index.html` is a public key by design. All AI keys live in Cloudflare Workers, never here.
Never commit the Supabase service-role key or any Worker secret.

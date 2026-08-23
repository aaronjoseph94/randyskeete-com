# RandySkeete.com

A modern, mobile-friendly sermon library for Elder Randy Skeete. Videos come from a public YouTube playlist and are credited to the channel that posted each one.

This site is not owned, maintained, or endorsed by Elder Randy Skeete.

## Stack

- React + Vite + TypeScript (frontend)
- Netlify Functions + Blobs (sermons cache, preaching location, rate limits)
- YouTube Data API v3

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Environment variables (never commit `.env`):

| Name | Purpose |
| --- | --- |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `ADMIN_PASSWORD` | Password for the footer “Update location” editor |

The editor exchanges the password for an HttpOnly session cookie, saves, then clears the cookie. The password is not kept in `sessionStorage` or `localStorage`.

## Scripts

- `npm run dev` — Vite + Netlify plugin
- `npm run build` — typecheck + production build
- `npm run lint` — oxlint
- `npm run preview` — preview the production build

## Deploy

Configured for Netlify (`netlify.toml`). Set the same env vars in the Netlify UI (or CLI), then deploy. Bump `CACHE_VERSION` in `netlify/functions/_shared/constants.ts` to invalidate the sermon playlist cache.

## Security notes

- Editor password is compared with a constant-time check and gated by IP rate limits.
- Mutating `/api/preaching` requests require an allowed `Origin`.
- Known `npm audit` findings under `@netlify/vite-plugin` (local-dev image tooling / `sharp`) are transitive and not shipped in the production browser bundle. Avoid `npm audit fix --force` (it downgrades the plugin).

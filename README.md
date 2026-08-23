# RandySkeete.com

A mobile-friendly site for sermons by Elder Randy Skeete. Videos come from a public YouTube playlist and are credited to the channel that posted each one.

This site is not owned, maintained, or endorsed by Elder Randy Skeete.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Set these in `.env` (never commit them):

- `YOUTUBE_API_KEY` — YouTube Data API v3 key
- `ADMIN_PASSWORD` — password for the preaching-this-week editor

The editor login sets an HttpOnly cookie. The password is not stored in the browser.

## Deploy

Built for Netlify. After connecting the GitHub repo, add the same environment variables in the Netlify UI and deploy.

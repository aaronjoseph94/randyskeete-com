# RandySkeete.com

A mobile-friendly site for sermons by Elder Randy Skeete. Videos are pulled from a public YouTube playlist and credited to the channel that posted each video.

This site is not owned, maintained, or endorsed by Elder Randy Skeete.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Set these environment variables in `.env` (never commit them):

- `YOUTUBE_API_KEY` — YouTube Data API v3 key
- `ADMIN_PASSWORD` — password for the “preaching this week” editor

## Deploy

The site is built for Netlify. After connecting the GitHub repo, add the same environment variables in the Netlify UI and deploy.

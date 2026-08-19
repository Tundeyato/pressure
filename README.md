# Pressure

A personal health logbook that runs entirely in the browser. Blood pressure,
training, food, sleep and weight in one place, with the analysis that most
tracking apps leave out.

Built for one person's use. Not a medical device, not medical advice.

## What it does

- **Blood pressure** — session averaging (enter two or three readings, saves the
  mean), morning and evening windows, MAP, pulse pressure, variability as SD, CV
  and ARV, time in target
- **Training** — a plan generator that adapts to your equipment, available days,
  session length and any joints you need to work around, with exercise cues
- **Food** — hand-portion logging with no weighing or calorie counting, a
  cuisine-aware meal framework, and barcode lookup via Open Food Facts
- **Analysis** — does what you do actually move your numbers? Training days
  against rest days, sleep against morning readings, before and after starting
  a supplement, all with honest sample-size warnings
- **Doctor's report** — a printable one-page summary a clinician can read in
  two minutes
- **Assistant** — optional chat that reasons over your own logged data

## Running it

Static files. Any web server works.

```bash
npx serve -l 3007
```

Or deploy to Vercel. The `api/` folder is a serverless function for the
assistant; without it the app still runs, it just asks each user for their own
API key.

## Deploying

```bash
npx vercel deploy --prod
```

Then add environment variables in the Vercel dashboard if you want the
assistant available without users bringing their own key:

| Name | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | server-side key so nobody needs their own |
| `ALLOWED_ORIGIN` | restricts the endpoint to your domain |
| `DAILY_LIMIT` | questions per IP per day, default 25 |

## Shipping a change

Bump the cache name in `sw.js` before deploying, or the service worker keeps
serving the old version:

```js
const CACHE = "pressure-v32";   // was v31
```

## Data

Everything lives in `localStorage` on the device, with a mirror in IndexedDB as
a safety net. There is no server, no account and no sync. Data is per-device and
per-browser.

**Export a backup regularly.** History → Back up all data. That file is the only
real protection against clearing site data or changing phones.

The one exception to local-only: asking the assistant a question sends a summary
of your logged data to Anthropic. It is off by default.

## Files

| File | What it is |
|---|---|
| `index.html` | the entire application |
| `api/chat.js` | serverless proxy for the assistant |
| `sw.js` | service worker, offline caching and update prompts |
| `manifest.json` | install metadata |
| `vercel.json` | cache and security headers |

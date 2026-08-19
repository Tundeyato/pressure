# Pressure

A private blood pressure logbook. Runs entirely in the browser, stores everything
on the device, and sends nothing anywhere.

## Deploy

```bash
npx vercel deploy --prod
```

That's it — no build step, no dependencies to install. Any static host works
(Netlify, Cloudflare Pages, GitHub Pages, S3); `vercel.json` only sets cache
headers so updates land promptly.

Once it's live, open the URL on your phone and use **Add to Home Screen**. It
installs as a standalone app with its own icon, opens without browser chrome,
and works offline.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole application — markup, styles, logic |
| `chart.umd.js` | Chart.js 4.4.1, vendored so nothing loads from a CDN |
| `sw.js` | Service worker: offline caching and update prompts |
| `manifest.json` | Install metadata |
| `icon-*.png`, `apple-touch-icon.png`, `favicon.png` | Icons |
| `vercel.json` | Cache and security headers |

## Shipping a change

Edit `index.html`, then bump the cache name in `sw.js`:

```js
const CACHE = "pressure-v2";
```

Deploy. Anyone with the app open sees a "New version ready" prompt; tapping it
swaps in the new version and reloads. Skipping the bump means users stay on the
cached copy indefinitely.

## Data

Everything lives in `localStorage` under the key `pressure.v1`. That means:

- Nothing leaves the device, and there is no account, server or analytics.
- Data is per-browser. A different phone is a different logbook.
- Clearing site data erases it. **Use the backup button.**

Settings → History → *Back up all data* writes a JSON file; *Restore from
backup* reads one. That file is the only real safety net.

## What it does

- Session entry: log two or three readings, saves the average
- Morning / evening / daily / weekly views over 7, 30, 90 days or all time
- Variability metrics: SD, coefficient of variation, average real variability
- Time-in-target, morning rise, pulse pressure and mean arterial pressure
- Context tags with tagged-vs-untagged comparison and sample-size warnings
- ACC/AHA or ESC/ESH classification
- Printable report, CSV export, JSON backup and restore
- Multiple profiles, dark mode

## What it is not

A logbook, not a medical device. It does not measure blood pressure and does not
give medical advice. Use a validated upper-arm cuff and enter what it shows.

If this is ever shared beyond personal use, note that software interpreting
readings for other people falls into a different regulatory category, and
storing other people's health data brings obligations that local-only storage
currently avoids entirely.

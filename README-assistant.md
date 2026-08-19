# Turning on the assistant for everyone

By default the chat asks each user for their own Anthropic API key. Nobody will
do that. To make it work for everyone, deploy the included serverless function
so the key lives on your server instead.

## Setup

1. Deploy with the `api/` folder included:

   ```
   npx vercel deploy --prod
   ```

2. In Vercel → your project → Settings → Environment Variables, add:

   | Name | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | your key from console.anthropic.com |
   | `ALLOWED_ORIGIN` | `https://your-domain.vercel.app` (optional but recommended) |
   | `DAILY_LIMIT` | `25` (optional, questions per IP per day) |
   | `CHAT_MODEL` | `claude-sonnet-5` (optional) |

3. Redeploy. Users switch the assistant on in Settings, leave the key blank,
   and it works.

The app tries `/api/chat` first and falls back to a personal key only if no
server function is there. So the same file works hosted or standalone.

## What it costs you

Each question sends roughly 1,500–2,500 tokens of context and gets back up to
900. At Sonnet pricing that lands around a cent or so per question.

- 50 users asking 10 questions a month ≈ 500 questions ≈ a few dollars
- 500 users asking 20 a month ≈ 10,000 questions ≈ low hundreds

Because you are paying, the protections in `api/chat.js` matter:

- **Origin check** — only your domain can call it
- **Per-IP daily cap** — `DAILY_LIMIT`, default 25
- **Message trimming** — last 10 messages, 4,000 characters each
- **Fixed `max_tokens`** — a client cannot ask for a longer answer

The IP counter is in memory, so it resets when Vercel recycles the instance.
That stops casual abuse, not a determined attacker. If this ever gets real
traffic, move the counter to Vercel KV or Upstash Redis and add sign-in so
limits attach to a person rather than an address.

## Privacy note worth surfacing to users

Anything asked of the assistant sends a summary of that user's logged health
data to Anthropic. Everything else in the app stays on the device. If you
deploy this for other people, say so plainly in your own words somewhere they
will read it.

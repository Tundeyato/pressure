/* Vercel serverless function: /api/chat
   Holds the Anthropic key server-side so users never need one of their own.
   Set ANTHROPIC_API_KEY in Vercel -> Settings -> Environment Variables.
   Optional: ALLOWED_ORIGIN (your domain), DAILY_LIMIT (default 25). */

const MODEL = process.env.CHAT_MODEL || "claude-sonnet-5";
const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || "25", 10);

/* Best-effort per-IP counter. Serverless instances are recycled, so this
   stops casual abuse rather than a determined attacker. For real limits,
   move this to Vercel KV or Upstash. */
const hits = new Map();
function overLimit(ip) {
  const today = new Date().toISOString().slice(0, 10);
  const key = ip + "|" + today;
  const n = (hits.get(key) || 0) + 1;
  hits.set(key, n);
  if (hits.size > 5000) hits.clear();
  return n > DAILY_LIMIT;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && req.headers.origin && req.headers.origin !== allowed) {
    return res.status(403).json({ error: "Not allowed from this origin" });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Assistant is not configured on the server." });

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  if (overLimit(ip)) {
    return res.status(429).json({
      error:
        "You have reached today's question limit for the assistant. It resets tomorrow.",
    });
  }

  try {
    const { system, messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: "No messages sent." });
    }
    /* Cap what a client can ask for, so nobody can run up the bill. */
    const trimmed = messages.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 4000),
    }));

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system: Array.isArray(system)
          ? system.map((b) => ({
              type: "text",
              text: String(b.text || "").slice(0, 20000),
              ...(b.cache_control ? { cache_control: b.cache_control } : {}),
            }))
          : String(system || "").slice(0, 20000),
        messages: trimmed,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: (data && data.error && data.error.message) || "Upstream error" });
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Assistant request failed." });
  }
}

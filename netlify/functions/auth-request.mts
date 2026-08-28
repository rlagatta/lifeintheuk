import type { Config, Context } from "@netlify/functions";
import { isValidEmail, normalizeEmail, newMagicToken, magicTtlMs } from "./lib/session.mts";
import { putMagic } from "./lib/store.mts";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

async function sendEmail(to: string, link: string): Promise<boolean> {
  const key = Netlify.env.get("RESEND_API_KEY");
  const from = Netlify.env.get("AUTH_FROM_EMAIL") || "Life in the UK Atlas <onboarding@resend.dev>";
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [to],
      subject: "Your sign-in link — Life in the UK Atlas",
      html: `<p>Sign in:</p><p><a href="${link}">${link}</a></p><p>Expires in 15 minutes.</p>`,
    }),
  });
  return res.ok;
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body: { email?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const email = normalizeEmail(body.email || "");
  if (!isValidEmail(email)) return json({ error: "Valid email required" }, 400);
  const token = newMagicToken();
  const now = Date.now();
  await putMagic(token, { email, created_at: now, expires_at: now + magicTtlMs() });
  const site = (Netlify.env.get("URL") || Netlify.env.get("SITE_URL") || "https://lifeintheukatlas.netlify.app").replace(/\/$/, "");
  const link = `${site}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const emailed = await sendEmail(email, link);
  const devMode = Netlify.env.get("AUTH_DEV_MODE") === "true" || !Netlify.env.get("RESEND_API_KEY");
  return json({
    ok: true,
    emailed,
    ...(devMode || !emailed ? { devLink: link } : {}),
    message: emailed ? "Check your email for a sign-in link." : "Email not configured — use the dev link (set RESEND_API_KEY for production).",
  });
};

export const config: Config = { path: "/api/auth/request" };

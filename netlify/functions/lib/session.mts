import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE = "atlas_session";
const TOKEN_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function envGet(key: string): string {
  try {
    const v = Netlify.env.get(key);
    if (v != null && String(v).length) return String(v);
  } catch { /* ignore */ }
  try {
    const v = process.env[key];
    if (v != null && String(v).length) return String(v);
  } catch { /* ignore */ }
  return "";
}

function secret(): string {
  const s = envGet("SESSION_SECRET");
  if (!s || s.length < 16) return "dev-only-change-me-atlas-session-secret";
  return s;
}

export function normalizeEmail(email: string): string {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function allowlistEmails(): Set<string> {
  const raw = envGet("ALLOWLIST_EMAILS");
  return new Set(
    raw
      .split(/[,;\n\r]+/)
      .map((e) => normalizeEmail(e))
      .filter((e) => e.includes("@"))
  );
}

export function entitlementForEmail(email: string) {
  const e = normalizeEmail(email);
  const list = allowlistEmails();
  if (list.has(e)) {
    return { plan: "pass", expires_at: null as number | null, sku: "lifetime", source: "allowlist" };
  }
  return { plan: "free", expires_at: null as number | null, sku: null as string | null, source: "signup" };
}

function b64url(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: { id: string; email: string }): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const body = b64url(JSON.stringify({ id: user.id, email: user.email, exp }));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | null | undefined) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!data?.id || !data?.email || !data?.exp || Date.now() > data.exp) return null;
    return { id: data.id as string, email: normalizeEmail(data.email) };
  } catch {
    return null;
  }
}

export function parseCookie(req: Request, name = COOKIE): string | null {
  const raw = req.headers.get("cookie") || "";
  for (const p of raw.split(/;\s*/)) {
    const i = p.indexOf("=");
    if (i === -1) continue;
    if (p.slice(0, i) === name) return decodeURIComponent(p.slice(i + 1));
  }
  return null;
}

export function sessionCookie(token: string, maxAgeSec = SESSION_TTL_MS / 1000): string {
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(maxAgeSec)}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function newMagicToken(): string {
  return randomBytes(24).toString("base64url");
}

export function magicTtlMs(): number {
  return TOKEN_TTL_MS;
}

export function siteBase(): string {
  return (envGet("URL") || envGet("DEPLOY_PRIME_URL") || envGet("SITE_URL") || "https://lifeintheukatlas.netlify.app").replace(/\/$/, "");
}

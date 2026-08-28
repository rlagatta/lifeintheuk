import type { Config, Context } from "@netlify/functions";
import { randomBytes } from "node:crypto";
import {
  createSessionToken, sessionCookie, entitlementForEmail, normalizeEmail, siteBase,
} from "./lib/session.mts";
import { getMagic, markMagicUsed, getUserByEmail, upsertUser } from "./lib/store.mts";

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const appUrl = `${siteBase()}/app/`;
  if (!token) return Response.redirect(`${appUrl}?auth=missing`, 302);
  const magic = await getMagic(token);
  if (!magic || magic.used || Date.now() > magic.expires_at) {
    return Response.redirect(`${appUrl}?auth=expired`, 302);
  }
  await markMagicUsed(token, magic);
  const email = normalizeEmail(magic.email);
  const ent = entitlementForEmail(email);
  const now = Date.now();
  let user = await getUserByEmail(email);
  if (!user) {
    user = {
      id: randomBytes(12).toString("hex"),
      email,
      plan: ent.plan,
      expires_at: ent.expires_at,
      sku: ent.sku,
      source: ent.source,
      created_at: now,
      updated_at: now,
    };
  } else {
    if (ent.source === "allowlist") {
      user.plan = "pass";
      user.expires_at = null;
      user.sku = "lifetime";
      user.source = "allowlist";
    }
    user.updated_at = now;
  }
  await upsertUser(user);
  const session = createSessionToken({ id: user.id, email: user.email });
  return new Response(null, {
    status: 302,
    headers: { Location: `${appUrl}?auth=ok`, "Set-Cookie": sessionCookie(session) },
  });
};

export const config: Config = { path: "/api/auth/verify" };

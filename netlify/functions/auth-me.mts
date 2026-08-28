import type { Config, Context } from "@netlify/functions";
import { parseCookie, verifySessionToken, entitlementForEmail } from "./lib/session.mts";
import { getUserById, upsertUser } from "./lib/store.mts";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const session = verifySessionToken(parseCookie(req));
  if (!session) {
    return json({ authenticated: false, user: null, entitlement: { plan: "free", expires_at: null, sku: null } });
  }
  let user = await getUserById(session.id);
  if (!user) {
    return json({ authenticated: false, user: null, entitlement: { plan: "free", expires_at: null, sku: null } });
  }

  const ent = entitlementForEmail(user.email);
  if (ent.source === "allowlist") {
    if (user.plan !== "pass" || user.sku !== "lifetime" || user.source !== "allowlist") {
      user = {
        ...user,
        plan: "pass",
        expires_at: null,
        sku: "lifetime",
        source: "allowlist",
        updated_at: Date.now(),
      };
      await upsertUser(user);
    }
  } else if (user.plan === "pass" && user.expires_at && Date.now() > user.expires_at) {
    user = { ...user, plan: "free", expires_at: null, sku: null, source: "expired", updated_at: Date.now() };
    await upsertUser(user);
  }

  return json({
    authenticated: true,
    user: { id: user.id, email: user.email },
    entitlement: {
      plan: user.plan,
      expires_at: user.expires_at,
      sku: user.sku,
      source: user.source,
    },
  });
};

export const config: Config = { path: "/api/auth/me" };

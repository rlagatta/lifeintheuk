import type { Config, Context } from "@netlify/functions";
import { clearSessionCookie } from "./lib/session.mts";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": clearSessionCookie() },
  });
};

export const config: Config = { path: "/api/auth/logout" };

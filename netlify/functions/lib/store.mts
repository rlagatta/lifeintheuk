import { getStore, getDeployStore } from "@netlify/blobs";

export function atlasStore(name: string) {
  const ctx = Netlify.context?.deploy?.context;
  if (ctx === "production") return getStore({ name, consistency: "strong" });
  try {
    return getDeployStore({ name, consistency: "strong" });
  } catch {
    return getStore({ name, consistency: "strong" });
  }
}

export type UserRecord = {
  id: string;
  email: string;
  plan: string;
  expires_at: number | null;
  sku: string | null;
  source: string;
  created_at: number;
  updated_at: number;
};

export type MagicRecord = {
  email: string;
  created_at: number;
  expires_at: number;
  used?: boolean;
};

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  return (await atlasStore("atlas-users").get(email, { type: "json" })) as UserRecord | null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const store = atlasStore("atlas-users");
  const key = await store.get(`id:${id}`, { type: "text" });
  if (!key) return null;
  return (await store.get(key, { type: "json" })) as UserRecord | null;
}

export async function upsertUser(user: UserRecord): Promise<void> {
  const store = atlasStore("atlas-users");
  await store.setJSON(user.email, user);
  await store.set(`id:${user.id}`, user.email);
}

export async function putMagic(token: string, rec: MagicRecord): Promise<void> {
  await atlasStore("atlas-magic").setJSON(token, rec);
}

export async function getMagic(token: string): Promise<MagicRecord | null> {
  return (await atlasStore("atlas-magic").get(token, { type: "json" })) as MagicRecord | null;
}

export async function markMagicUsed(token: string, rec: MagicRecord): Promise<void> {
  await atlasStore("atlas-magic").setJSON(token, { ...rec, used: true });
}

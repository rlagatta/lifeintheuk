/** Entitlement: plan + expires_at. */
const ENT_KEY = 'litukAtlasEntitlementV1';

export const SKUS = {
  sprint7: { id: 'sprint7', name: '7-Day Sprint', days: 7, price: '£4.99' },
  pass30: { id: 'pass30', name: '30-Day Pass', days: 30, price: '£9.99' },
  lifetime: { id: 'lifetime', name: 'Lifetime Pass', days: 3650, price: '£19.99' },
};

export const FREE_LIMITS = {
  maxMockIndex: 2,
  maxSrsCards: 20,
  focusPerDay: 1,
  customMaxQ: 10,
  timed: false,
};

export function loadEntitlement() {
  try {
    const e = JSON.parse(localStorage.getItem(ENT_KEY) || 'null');
    if (!e) return { plan: 'free', expires_at: null, sku: null };
    if (e.plan !== 'free' && e.expires_at && Date.now() > e.expires_at) {
      const reset = { plan: 'free', expires_at: null, sku: null };
      saveEntitlement(reset);
      return reset;
    }
    return e;
  } catch {
    return { plan: 'free', expires_at: null, sku: null };
  }
}

export function saveEntitlement(e) {
  localStorage.setItem(ENT_KEY, JSON.stringify(e));
}

export function hasPass() {
  const e = loadEntitlement();
  return e.plan === 'pass' && (!e.expires_at || Date.now() <= e.expires_at);
}

export function activateSku(skuId) {
  const s = SKUS[skuId];
  if (!s) return null;
  const ent = {
    plan: 'pass',
    expires_at: s.id === 'lifetime' ? null : Date.now() + s.days * 86400000,
    sku: s.id,
    activated_at: Date.now(),
  };
  saveEntitlement(ent);
  return ent;
}

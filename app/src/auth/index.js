/** Identity layer — email magic-link + Apple/Google (stub). */
const AUTH_KEY = 'litukAtlasAuthV1';

export function loadAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
  catch { return null; }
}

export function saveAuth(profile) {
  if (profile) localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
  else localStorage.removeItem(AUTH_KEY);
}

export function signOut() { saveAuth(null); }

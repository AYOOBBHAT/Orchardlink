/** @deprecated use TOKEN_KEY */
export const AUTH_TOKEN_KEY = 'token';
/** @deprecated use USER_KEY */
export const AUTH_USER_KEY = 'user';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

const LEGACY_TOKEN = 'orchardlink_token';
const LEGACY_USER = 'orchardlink_user';

/**
 * @param {string} token
 * @param {Record<string, unknown>} user — full user object from API (stored as JSON)
 */
export function saveAuth(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_TOKEN);
  localStorage.removeItem(LEGACY_USER);
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN);
  localStorage.removeItem(LEGACY_USER);
}

/**
 * @returns {{ id?: string; name: string; email: string; role: string } | null}
 */
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    let raw = localStorage.getItem(USER_KEY);
    if (!raw) raw = localStorage.getItem(LEGACY_USER);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u && typeof u === 'object' && !u.id && u._id) {
      u.id = u._id;
    }
    return u;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN);
}

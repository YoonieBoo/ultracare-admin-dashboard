const TOKEN_KEY = "ultracare_admin_token";

export function saveToken(token) {
  try {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    // ignore
  }
}

export function getToken() {
  try {
    return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  } catch (e) {
    return null;
  }
}

export function removeToken() {
  try {
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // ignore
  }
}

export function isAuthenticated() {
  return !!getToken();
}

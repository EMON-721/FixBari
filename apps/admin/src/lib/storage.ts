const ACCESS_TOKEN_KEY = "fixbari_admin_access_token";
const REFRESH_TOKEN_KEY = "fixbari_admin_refresh_token";
const USER_KEY = "fixbari_admin_user";

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const storage = {
  getAccessToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    setCookie(ACCESS_TOKEN_KEY, token, 7);
  },

  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getUser: () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: unknown) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuth: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    deleteCookie(ACCESS_TOKEN_KEY);
  },
};

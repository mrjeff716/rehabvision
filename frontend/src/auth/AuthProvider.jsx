// =============================================================================
// AuthProvider.jsx — keeps track of who is logged in, for the whole app.
// The login token is saved in the browser, so users stay logged in after a
// page reload (until the token expires after 7 days, or they log out).
// =============================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api";
import { AuthContext } from "./authContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only "loading" if there's a saved token to check
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  // On page load: if a token was saved, ask the server who it belongs to
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api("/auth/me")
      .then((data) => { if (!cancelled) setUser(data.user); })
      .catch((e) => {
        // Token expired or invalid: forget it. (If the server is just
        // unreachable, keep the token so it works once the server is back.)
        if (e.status === 401) setToken(null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password, role, referralId }) => {
    const data = await api("/auth/register", { method: "POST", body: { name, email, password, role, referralId: referralId || undefined } });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  // Forgot password: set a new password with the emailed link's token, and log in
  const resetPassword = useCallback(async (token, password) => {
    const data = await api("/auth/reset-password", { method: "POST", body: { token, password } });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Reload the user from the server (e.g. after the physio changed their plan)
  const refresh = useCallback(async () => {
    const data = await api("/auth/me");
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, resetPassword, logout, refresh, setUser }),
    [user, loading, login, register, resetPassword, logout, refresh],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

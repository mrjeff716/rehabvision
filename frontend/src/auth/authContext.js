// =============================================================================
// authContext.js — shared "who is logged in" state.
// Any component can call useAuth() to get:
//   user      -> the logged-in user (or null)
//   loading   -> true while checking a saved login on page load
//   login(email, password), register({...}), resetPassword(token, password),
//   logout(), refresh(), setUser(user)
// The state itself lives in AuthProvider.jsx.
// =============================================================================

import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

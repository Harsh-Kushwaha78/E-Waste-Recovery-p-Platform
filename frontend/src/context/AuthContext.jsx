// frontend/src/context/AuthContext.jsx
//
// Holds the logged-in user + JWT token in memory and localStorage, and
// exposes login/register/logout functions. Kept intentionally simple for
// Phase 1 - no refresh tokens, no silent renewal yet.

import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

const STORAGE_KEY = "ewaste_auth";

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth); // { token, user } | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  async function register({ name, email, password }) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      setAuth({ token: data.token, user: data.user });
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }

  async function login({ email, password }) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setAuth({ token: data.token, user: data.user });
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuth(null);
    // Fire-and-forget - JWT is stateless, this just follows the API
    // contract; nothing depends on the response.
    apiRequest("/api/auth/logout", { method: "POST" }).catch(() => {});
  }

  const value = {
    user: auth?.user || null,
    token: auth?.token || null,
    isAuthenticated: Boolean(auth?.token),
    loading,
    error,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

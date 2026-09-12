import React, { createContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../services/endpoints";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // No token (fresh browser / logged out) — ensure no stale user lingers.
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getProfile();
      if (data.success) {
        setUser(data.data);
      } else {
        // Profile endpoint returned success=false — tokens are invalid
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      }
    } catch (err) {
      // Only clear tokens on explicit auth failures (401/403). Transient
      // network errors, 429 rate limits, or server errors leave tokens
      // intact so the user can retry on next navigation. 429 must never
      // log the user out — it is a throttle, not an auth failure.
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Closing/reopening the browser (or logging out in another tab) must not
  // leave stale client-side auth state behind.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "accessToken" && !e.newValue) setUser(null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    if (data.success) {
      // Drop any cached data from a previously logged-in account so the
      // new session always fetches fresh role-scoped data on first navigation
      queryClient.clear();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || "Login failed");
  };

  const register = async (credentials) => {
    const { data } = await authAPI.register(credentials);
    if (data.success) {
      queryClient.clear();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || "Registration failed");
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await authAPI.logout({ refreshToken });
    } catch {
      // ignore — clear tokens regardless
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      queryClient.clear();
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getProfile();
      if (data.success) setUser(data.data);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("book-kingdom-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const persistAuth = (payload) => {
    localStorage.setItem("book-kingdom-token", payload.token);
    localStorage.setItem("book-kingdom-user", JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const login = async (values) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(values)
    });
    persistAuth(data);
    return data;
  };

  const register = async (values) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(values)
    });
    persistAuth(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("book-kingdom-token");
    localStorage.removeItem("book-kingdom-user");
    setUser(null);
    setProfile(null);
  };

  const loadProfile = async () => {
    if (!user) return null;
    setLoading(true);
    try {
      const data = await apiRequest("/users/profile");
      setProfile(data);
      return data;
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user?._id]);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setProfile(null);
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, login, register, logout, loadProfile, setProfile }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

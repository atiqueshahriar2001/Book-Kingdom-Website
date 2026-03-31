import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client.js";

const AuthContext = createContext(null);

const mergeUserFromProfile = (currentUser, profile) => {
  if (!profile) return currentUser;

  return {
    ...currentUser,
    _id: profile._id ?? currentUser?._id,
    name: profile.name ?? currentUser?.name,
    email: profile.email ?? currentUser?.email,
    phone: profile.phone ?? currentUser?.phone,
    address: profile.address ?? currentUser?.address,
    profilePhoto: profile.profilePhoto ?? currentUser?.profilePhoto,
    role: profile.role ?? currentUser?.role
  };
};

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

  const isAuthError = useCallback((error) => {
    const message = error?.message?.toLowerCase?.() || "";
    return message.includes("session expired") || message.includes("not authorized");
  }, []);

  const persistAuth = useCallback((payload) => {
    localStorage.setItem("book-kingdom-token", payload.token);
    localStorage.setItem("book-kingdom-user", JSON.stringify(payload.user));
    setUser(payload.user);
  }, []);

  const login = useCallback(async (values) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(values)
    });
    persistAuth(data);
    return data;
  }, [persistAuth]);

  const register = useCallback(async (values) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(values)
    });
    persistAuth(data);
    return data;
  }, [persistAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem("book-kingdom-token");
    localStorage.removeItem("book-kingdom-user");
    setUser(null);
    setProfile(null);
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user) return null;
    setLoading(true);
    try {
      const data = await apiRequest("/users/profile");
      setProfile(data);
      const nextUser = mergeUserFromProfile(user, data);
      localStorage.setItem("book-kingdom-user", JSON.stringify(nextUser));
      setUser(nextUser);
      return data;
    } catch (error) {
      if (isAuthError(error)) {
        logout();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, logout, isAuthError]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiRequest("/users/profile")
      .then((data) => {
        setProfile(data);
        setUser((currentUser) => {
          const nextUser = mergeUserFromProfile(currentUser, data);
          localStorage.setItem("book-kingdom-user", JSON.stringify(nextUser));
          return nextUser;
        });
      })
      .catch((error) => {
        if (isAuthError(error)) {
          logout();
        }
      })
      .finally(() => setLoading(false));
  }, [user?._id, logout, isAuthError]);

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
    [user, profile, loading, login, register, logout, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

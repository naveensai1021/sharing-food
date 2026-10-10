"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { apiFetch } from "@/services/apiClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (payload: any) => Promise<User>;
  verifyEmail: (payload: { email: string; code: string }) => Promise<User>;
  resendVerification: (email: string) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const currentUser = await apiFetch<User>("/api/me");
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const loggedInUser = await apiFetch<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload: any) => {
    const registeredUser = await apiFetch<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(registeredUser);
    return registeredUser;
  };

  const verifyEmail = async (payload: { email: string; code: string }) => {
    const verifiedUser = await apiFetch<User>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(verifiedUser);
    return verifiedUser;
  };

  const resendVerification = async (email: string) => {
    return await apiFetch<{ message: string }>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

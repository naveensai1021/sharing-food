"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { apiFetch } from "@/services/apiClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (payload: any) => Promise<User>;
  verifyEmail: (payload: { email?: string; phone?: string; code?: string; otp?: string }) => Promise<User>;
  verifyOtp: (payload: { email?: string; phone?: string; code?: string; otp?: string }) => Promise<User>;
  resendVerification: (emailOrPayload: string | { email?: string; phone?: string }) => Promise<{ message: string }>;
  resendOtp: (payload: { email?: string; phone?: string }) => Promise<{ message: string }>;
  changeVerificationMethod: (payload: { email?: string; phone?: string; newMethod: "EMAIL" | "SMS" | "VOICE_CALL" }) => Promise<any>;
  startVoiceVerification: (payload: { email?: string; phone?: string; language?: string }) => Promise<any>;
  retryVoiceVerification: (payload: { challengeId?: string; email?: string; phone?: string; language?: string }) => Promise<any>;
  getVoiceVerificationStatus: (params: { challengeId?: string; email?: string; phone?: string }) => Promise<any>;
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
    const res = await apiFetch<any>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    const loggedInUser: User = res.user ? res.user : res;
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload: any) => {
    const res = await apiFetch<any>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const registeredUser: User = res.user ? res.user : res;
    setUser(registeredUser);
    return registeredUser;
  };

  const verifyOtp = async (payload: { email?: string; phone?: string; code?: string; otp?: string }) => {
    const formattedPayload = {
      ...payload,
      code: payload.code || payload.otp,
      otp: payload.otp || payload.code,
    };
    const res = await apiFetch<any>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(formattedPayload),
    });
    const verifiedUser: User = res.user ? res.user : res;
    setUser(verifiedUser);
    return verifiedUser;
  };

  const verifyEmail = async (payload: { email?: string; phone?: string; code?: string; otp?: string }) => {
    return await verifyOtp(payload);
  };

  const resendOtp = async (payload: { email?: string; phone?: string }) => {
    return await apiFetch<{ message: string }>("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const resendVerification = async (emailOrPayload: string | { email?: string; phone?: string }) => {
    const payload = typeof emailOrPayload === "string" ? { email: emailOrPayload } : emailOrPayload;
    return await resendOtp(payload);
  };

  const changeVerificationMethod = async (payload: { email?: string; phone?: string; newMethod: "EMAIL" | "SMS" | "VOICE_CALL" }) => {
    return await apiFetch<any>("/api/auth/change-verification-method", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const startVoiceVerification = async (payload: { email?: string; phone?: string; language?: string }) => {
    return await apiFetch<any>("/api/auth/voice/start", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const retryVoiceVerification = async (payload: { challengeId?: string; email?: string; phone?: string; language?: string }) => {
    return await apiFetch<any>("/api/auth/voice/retry", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const getVoiceVerificationStatus = async (params: { challengeId?: string; email?: string; phone?: string }) => {
    const q = new URLSearchParams();
    if (params.challengeId) q.set("challengeId", params.challengeId);
    if (params.email) q.set("email", params.email);
    if (params.phone) q.set("phone", params.phone);
    return await apiFetch<any>(`/api/auth/voice/status?${q.toString()}`, {
      method: "GET",
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
        verifyOtp,
        resendVerification,
        resendOtp,
        changeVerificationMethod,
        startVoiceVerification,
        retryVoiceVerification,
        getVoiceVerificationStatus,
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

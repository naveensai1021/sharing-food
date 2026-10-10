"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Heart, Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password");
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.fullName || user.email}!`);

      if (user.roles.includes("ROLE_ADMIN")) {
        router.push("/admin/dashboard");
      } else if (user.roles.includes("ROLE_SUPPLIER")) {
        router.push("/supplier/dashboard");
      } else if (user.roles.includes("ROLE_BENEFICIARY")) {
        router.push("/beneficiary/dashboard");
      } else if (user.roles.includes("ROLE_VOLUNTEER")) {
        router.push("/volunteer/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: string) => {
    switch (role) {
      case "supplier":
        setEmail("supplier1@sharingfood.org");
        setPassword("Password@123");
        break;
      case "beneficiary":
        setEmail("beneficiary1@sharingfood.org");
        setPassword("Password@123");
        break;
      case "volunteer":
        setEmail("volunteer1@sharingfood.org");
        setPassword("Password@123");
        break;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50/40 via-white to-orange-50/20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-md">
            <Heart className="h-6 w-6 fill-current text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Connect to save meals and support local care homes
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-secondary-600" />
            Quick Demo Accounts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDemoCredentials("supplier")}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-orange-50 text-secondary-700 border border-orange-200 hover:bg-orange-100"
            >
              Food Supplier
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials("beneficiary")}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-green-50 text-primary-700 border border-green-200 hover:bg-green-100"
            >
              Beneficiary
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials("volunteer")}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            >
              Verified Volunteer
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary-700 hover:text-primary-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-700 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-semibold text-primary-700 hover:text-primary-800">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

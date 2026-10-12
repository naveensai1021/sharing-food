"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { Mail, ShieldCheck, RefreshCw, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code") || searchParams.get("token");
    if (emailParam) {
      setEmail(emailParam);
    }
    if (codeParam) {
      setCode(codeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !code.trim()) {
      setError("Please provide both your registered email address and the 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = await verifyEmail({ email: email.trim(), code: code.trim() });
      setSuccess("Email verified successfully! Redirecting...");
      setTimeout(() => {
        if (user.status === "PENDING_APPROVAL" || user.status === "REJECTED" || user.status === "SUSPENDED") {
          router.push("/account-status");
        } else if (user.roles?.includes("ROLE_ADMIN")) {
          router.push("/admin/dashboard");
        } else if (user.roles?.includes("ROLE_SUPPLIER")) {
          router.push("/supplier/dashboard");
        } else if (user.roles?.includes("ROLE_BENEFICIARY")) {
          router.push("/beneficiary/dashboard");
        } else {
          router.push("/account-status");
        }
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to verify email. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Please enter your email address to receive a new verification code.");
      return;
    }
    setResending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await resendVerification(email.trim());
      setSuccess(response?.message || "A new 6-digit verification code has been dispatched to your email!");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification code. Please try again shortly.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            We have sent a 6-digit verification code to your email. Enter it below to activate your account and start sharing food.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Registered Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 placeholder-slate-400 text-sm"
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                6-Digit Verification Code
              </label>
              <input
                id="code"
                type="text"
                required
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 text-center tracking-[0.5em] text-2xl font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 placeholder-slate-300"
              />
              <p className="mt-1 text-xs text-slate-500 text-center">
                Code expires in 10 minutes. Check your inbox and spam folder.
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Confirm & Activate Account
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || resendCooldown > 0}
            className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
            {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Verification Code"}
          </button>

          <Link href="/login" className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium">
            Back to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-slate-500">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

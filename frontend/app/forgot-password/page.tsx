"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowLeft, Mail, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await apiClient.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
      toast.success("Password reset instructions dispatched!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to process password reset request. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200/90 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Your Password</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter your registered account email. We will send you a 6-digit verification code and secure reset link.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <div>
              <p className="text-sm font-bold text-emerald-950">
                Reset instructions dispatched!
              </p>
              <p className="text-xs text-emerald-800 mt-1">
                If an account exists for <strong>{email}</strong>, check your email inbox for your 6-digit verification code.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary-700 text-white text-xs font-bold hover:bg-primary-800 transition-all shadow-sm"
              >
                <span>Enter Reset Code & Choose New Password</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
              >
                Try another email address
              </button>
            </div>

            <div className="pt-2 border-t border-emerald-200/60">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary-700 text-white text-xs font-bold hover:bg-primary-800 transition-all shadow-sm disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <span>Send Password Reset Code</span>
              )}
            </button>

            <div className="pt-1 text-center">
              <Link
                href={`/reset-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-xs font-semibold text-primary-700 hover:text-primary-800"
              >
                Already have a reset code? Set new password here &rarr;
              </Link>
            </div>

            <div className="text-center pt-2 border-t border-slate-100">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

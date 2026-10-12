"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { 
  Mail, 
  Phone, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-primary-700" /></div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, resendOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"EMAIL" | "SMS">("EMAIL");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // 5-minute (300 seconds) OTP validity countdown timer
  const [otpTimeLeft, setOtpTimeLeft] = useState(300);

  // 60-second resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const phoneParam = searchParams.get("phone");
    const methodParam = searchParams.get("method");
    const codeParam = searchParams.get("code") || searchParams.get("token");

    if (emailParam) setEmail(emailParam);
    if (phoneParam) setPhone(phoneParam);
    if (methodParam === "SMS") setMethod("SMS");
    if (codeParam) setCode(codeParam);
  }, [searchParams]);

  // 5-minute countdown
  useEffect(() => {
    if (otpTimeLeft > 0 && !isVerified) {
      const timer = setInterval(() => {
        setOtpTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpTimeLeft, isVerified]);

  // 60-second cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanCode = code.trim().replace(/\s/g, "");
    if (!cleanCode) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (cleanCode.length !== 6) {
      setError("Verification code must be exactly 6 digits.");
      return;
    }

    if (otpTimeLeft <= 0) {
      setError("This OTP has expired (5-minute validity limit). Please click 'Resend OTP' to receive a new code.");
      return;
    }

    setLoading(true);

    try {
      const user = await verifyOtp({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        code: cleanCode,
      });

      setIsVerified(true);
      toast.success("OTP Verified Successfully!");
    } catch (err: any) {
      setError(err?.message || "Invalid or expired verification code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    if (!email.trim() && !phone.trim()) {
      setError("Email address or mobile number is required to resend OTP.");
      return;
    }

    setResending(true);
    setError(null);

    try {
      const response = await resendOtp({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      });

      toast.success(response?.message || "A fresh 6-digit OTP has been dispatched!");
      setOtpTimeLeft(300); // Reset OTP validity to 5 minutes
      setResendCooldown(60); // Reset cooldown to 60 seconds
      setCode("");
    } catch (err: any) {
      setError(err?.message || "Failed to resend OTP. Please try again shortly.");
    } finally {
      setResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50/40 via-white to-slate-50">
        <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 shadow-md animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              PENDING ADMIN APPROVAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              OTP Verified Successfully!
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Thank you for verifying your contact credentials. Your application has now been submitted to the platform administration for formal review.
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-5 text-left text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
              Mandatory Administrator Verification
            </div>
            <p className="text-slate-700 leading-normal">
              To guarantee community safety and prevent unauthorized access, all food suppliers and care beneficiaries must be approved by an administrator before signing in and accessing operational features.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/account-status"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 transition-colors shadow-sm"
            >
              <span>Check Account Status</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50/40 via-white to-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 shadow-sm mb-1">
            {method === "SMS" ? <Phone className="w-8 h-8" /> : <Mail className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Verify Your {method === "SMS" ? "Mobile Number" : "Email Address"}
          </h1>
          <p className="text-xs text-slate-600">
            We sent a secure 6-digit OTP to:
          </p>
          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            {method === "SMS" ? (phone || email) : email}
          </div>
        </div>

        {/* 5-minute countdown alert */}
        <div className={cn(
          "rounded-2xl p-4 flex items-center justify-between text-xs transition-all",
          otpTimeLeft > 60
            ? "bg-slate-50 border border-slate-200 text-slate-700"
            : otpTimeLeft > 0
            ? "bg-amber-50 border border-amber-200 text-amber-900"
            : "bg-red-50 border border-red-200 text-red-900"
        )}>
          <div className="flex items-center gap-2">
            <Clock className={cn("h-4 w-4", otpTimeLeft <= 60 && "text-red-600 animate-pulse")} />
            <span className="font-medium">
              {otpTimeLeft > 0 ? "OTP Validity:" : "OTP Expired:"}
            </span>
          </div>
          <div className="font-mono font-bold text-sm">
            {otpTimeLeft > 0 ? formatTimer(otpTimeLeft) : "00:00"}
          </div>
        </div>

        {otpTimeLeft === 0 && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong>Your OTP has expired.</strong> Please click &ldquo;Resend OTP&rdquo; below to receive a fresh code, or register again with the same details if needed.
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
              Enter 6-Digit OTP Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="123456"
              disabled={loading}
              className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-3.5 px-4 rounded-2xl border-2 border-slate-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 bg-slate-50/50 focus:bg-white transition-all"
            />
            <p className="text-[11px] text-slate-500 text-center mt-1.5">
              Maximum 5 verification attempts allowed.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length !== 6 || otpTimeLeft === 0}
            className="w-full py-3.5 px-4 rounded-xl bg-primary-700 text-white font-bold text-sm hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Verifying OTP...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Verify OTP & Submit for Approval</span>
              </>
            )}
          </button>
        </form>

        {/* Resend & Retry Options */}
        <div className="pt-2 border-t border-slate-100 space-y-3 text-center">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Didn&apos;t receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className={cn(
                "font-bold transition-colors inline-flex items-center gap-1",
                resendCooldown > 0 || resending
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-primary-700 hover:text-primary-800 underline"
              )}
            >
              {resending ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Resending...</span>
                </>
              ) : resendCooldown > 0 ? (
                <span>Resend OTP ({resendCooldown}s)</span>
              ) : (
                <span>Resend OTP</span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-center gap-1">
            <span>Entered wrong information?</span>
            <Link
              href="/register"
              className="font-bold text-primary-700 hover:text-primary-800 underline inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Register again with same details</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

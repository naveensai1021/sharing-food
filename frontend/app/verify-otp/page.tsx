"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { 
  Mail, 
  Phone, 
  PhoneCall,
  PhoneOff,
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  ArrowLeftRight,
  Volume2,
  Globe2,
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
  const { 
    verifyOtp, 
    resendOtp, 
    changeVerificationMethod, 
    startVoiceVerification, 
    retryVoiceVerification, 
    getVoiceVerificationStatus 
  } = useAuth();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"EMAIL" | "SMS" | "VOICE_CALL">("EMAIL");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Voice call specific state
  const [voiceLanguage, setVoiceLanguage] = useState<string>("en-IN");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string>("IDLE");
  const [callResult, setCallResult] = useState<string>("PENDING");
  const [callStatusMessage, setCallStatusMessage] = useState<string>("");
  const [callCooldown, setCallCooldown] = useState<number>(0);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isDisputed, setIsDisputed] = useState<boolean>(false);

  // 5-minute (300 seconds) OTP validity countdown timer
  const [otpTimeLeft, setOtpTimeLeft] = useState(300);

  // 60-second resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(60);

  // Polling ref to avoid concurrent intervals
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const phoneParam = searchParams.get("phone");
    const methodParam = searchParams.get("method");
    const codeParam = searchParams.get("code") || searchParams.get("token");

    if (emailParam) setEmail(emailParam);
    if (phoneParam) setPhone(phoneParam);
    if (codeParam) setCode(codeParam);

    if (methodParam === "VOICE_CALL" || methodParam === "VOICE" || methodParam === "CALL") {
      setMethod("VOICE_CALL");
      setCallStatus("RINGING");
      setCallStatusMessage("Calling your registered mobile number...");
      setIsCalling(true);
    } else if (methodParam === "SMS") {
      setMethod("SMS");
    } else {
      setMethod("EMAIL");
    }
  }, [searchParams]);

  // 5-minute countdown for OTP
  useEffect(() => {
    if (otpTimeLeft > 0 && !isVerified) {
      const timer = setInterval(() => {
        setOtpTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpTimeLeft, isVerified]);

  // 60-second cooldown for OTP resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Voice call cooldown countdown
  useEffect(() => {
    if (callCooldown > 0) {
      const timer = setInterval(() => {
        setCallCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [callCooldown]);

  // Voice verification polling
  useEffect(() => {
    if (method !== "VOICE_CALL" || isVerified || isDisputed) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      try {
        const status = await getVoiceVerificationStatus({
          challengeId: challengeId || undefined,
          email: email.trim().toLowerCase() || undefined,
          phone: phone.trim() || undefined,
        });

        if (status) {
          if (status.challengeId) setChallengeId(status.challengeId);
          if (status.callStatus) setCallStatus(status.callStatus);
          if (status.verificationResult) setCallResult(status.verificationResult);
          if (status.message) setCallStatusMessage(status.message);
          if (typeof status.cooldownSeconds === "number") setCallCooldown(status.cooldownSeconds);

          // Check for success
          if (
            status.verificationResult === "CONFIRMED" ||
            status.userStatus === "PENDING_ADMIN_APPROVAL" ||
            status.userStatus === "APPROVED"
          ) {
            setIsVerified(true);
            setIsCalling(false);
            toast.success("Phone verified successfully via automated voice call!");
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            return;
          }

          // Check for dispute (user pressed 2)
          if (status.verificationResult === "DISPUTED") {
            setIsDisputed(true);
            setIsCalling(false);
            setError("Account creation disputed: Keypad response 2 was received. This registration has been blocked from Admin Approval.");
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            return;
          }

          // Check for failed or no-answer calls
          if (
            status.callStatus === "FAILED" ||
            status.callStatus === "BUSY" ||
            status.callStatus === "NO-ANSWER" ||
            status.verificationResult === "CALL_FAILED" ||
            status.verificationResult === "NO_ANSWER"
          ) {
            setIsCalling(false);
          }
        }
      } catch {
        // Polling retry silently
      }
    };

    // Run immediate check then set interval
    pollStatus();
    pollTimerRef.current = setInterval(pollStatus, 2500);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [method, isVerified, isDisputed, email, phone, challengeId, getVoiceVerificationStatus]);

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
      setError("Your verification code has expired. Please request a new OTP.");
      return;
    }

    setLoading(true);

    try {
      await verifyOtp({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        code: cleanCode,
      });

      setIsVerified(true);
      toast.success("Your contact information has been verified successfully. Your registration has been submitted for Admin Approval.");
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
      setOtpTimeLeft(300);
      setResendCooldown(60);
      setCode("");
    } catch (err: any) {
      setError(err?.message || "We couldn't send your verification code. Please try again or choose another verification method.");
    } finally {
      setResending(false);
    }
  };

  const handleStartVoiceCall = async () => {
    if (callCooldown > 0 || isCalling) return;

    if (!phone.trim()) {
      setError("A registered mobile number is required for voice call verification.");
      return;
    }

    setIsCalling(true);
    setError(null);
    setIsDisputed(false);

    try {
      const response = await startVoiceVerification({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        language: voiceLanguage,
      });

      if (response?.challengeId) setChallengeId(response.challengeId);
      setCallStatus(response?.callStatus || "RINGING");
      setCallStatusMessage(response?.message || "Calling your registered mobile number...");
      setCallCooldown(response?.cooldownSeconds || 60);
      toast.success("Automated verification call initiated! Please answer and press 1 to confirm.");
    } catch (err: any) {
      setIsCalling(false);
      setError(err?.message || "Failed to initiate automated voice call. Please verify your phone number or try SMS/Email OTP.");
    }
  };

  const handleRetryVoiceCall = async () => {
    if (callCooldown > 0 || isCalling) return;

    setIsCalling(true);
    setError(null);
    setIsDisputed(false);

    try {
      const response = await retryVoiceVerification({
        challengeId: challengeId || undefined,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        language: voiceLanguage,
      });

      if (response?.challengeId) setChallengeId(response.challengeId);
      setCallStatus(response?.callStatus || "RINGING");
      setCallStatusMessage(response?.message || "Calling your registered mobile number...");
      setCallCooldown(response?.cooldownSeconds || 60);
      toast.success("Verification call retry initiated! Please answer your phone.");
    } catch (err: any) {
      setIsCalling(false);
      setError(err?.message || "Could not retry voice call. You can switch to Email OTP or Mobile SMS OTP below.");
    }
  };

  const handleChangeMethod = async (targetMethod: "EMAIL" | "SMS" | "VOICE_CALL") => {
    if (resending || loading || targetMethod === method) return;

    if ((targetMethod === "SMS" || targetMethod === "VOICE_CALL") && !phone.trim()) {
      setError(`Cannot switch to ${targetMethod === "VOICE_CALL" ? "Automated Voice Call" : "SMS"}: No mobile number attached to registration.`);
      return;
    }

    setResending(true);
    setError(null);
    setIsDisputed(false);

    try {
      const response = await changeVerificationMethod({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        newMethod: targetMethod,
      });

      setMethod(targetMethod);
      setCode("");
      setOtpTimeLeft(300);
      setResendCooldown(60);

      if (targetMethod === "VOICE_CALL") {
        setCallStatus("RINGING");
        setCallStatusMessage("Calling your registered mobile number...");
        setIsCalling(true);
        setCallCooldown(60);
      } else {
        setIsCalling(false);
      }

      const methodLabel = targetMethod === "VOICE_CALL" 
        ? "Automated Phone Call" 
        : (targetMethod === "SMS" ? "Mobile SMS" : "Email");
      toast.success(response?.message || `Verification method switched to ${methodLabel}.`);
    } catch (err: any) {
      setError(err?.message || "Could not switch verification method. Please try again.");
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

          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              PENDING ADMIN APPROVAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {method === "VOICE_CALL" ? "Phone Call Verified Successfully!" : "OTP Verified Successfully!"}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Your contact information has been verified successfully. Your registration has been submitted for Admin Approval. You will be able to access your account after approval.
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-5 text-left text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
              Administrator Verification in Progress
            </div>
            <p className="text-slate-700 leading-normal">
              To maintain community food safety, every food supplier and beneficiary account is reviewed and approved by an administrator before access is granted.
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
        
        {/* Method Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 shadow-sm mb-1">
            {method === "VOICE_CALL" ? (
              <PhoneCall className="w-8 h-8 animate-pulse text-primary-700" />
            ) : method === "SMS" ? (
              <Phone className="w-8 h-8" />
            ) : (
              <Mail className="w-8 h-8" />
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {method === "VOICE_CALL"
              ? "Automated Phone Call Verification"
              : method === "SMS"
              ? "Verify Your Mobile Number"
              : "Verify Your Email Address"}
          </h1>
          <p className="text-xs text-slate-600">
            {method === "VOICE_CALL"
              ? "We are calling your registered mobile number:"
              : "We sent a secure 6-digit OTP to:"}
          </p>
          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            {method === "VOICE_CALL" ? (phone || "Registered Phone") : method === "SMS" ? (phone || email) : email}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: AUTOMATED VOICE CALL VERIFICATION PANEL                          */}
        {/* ========================================================================= */}
        {method === "VOICE_CALL" ? (
          <div className="space-y-5">
            
            {/* Live Calling Status Banner */}
            <div className={cn(
              "rounded-2xl p-4 border transition-all text-xs space-y-2",
              isCalling || callStatus === "RINGING" || callStatus === "IN_PROGRESS"
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                : isDisputed
                ? "bg-red-50 border-red-200 text-red-950"
                : "bg-slate-50 border-slate-200 text-slate-700"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isCalling ? (
                    <>
                      <PhoneCall className="h-4 w-4 text-emerald-600 animate-bounce" />
                      <span>Calling your registered phone...</span>
                    </>
                  ) : isDisputed ? (
                    <>
                      <PhoneOff className="h-4 w-4 text-red-600" />
                      <span>Call Disputed</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 text-primary-700" />
                      <span>Interactive Voice Response (IVR)</span>
                    </>
                  )}
                </div>
                {callCooldown > 0 && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    Cooldown: {callCooldown}s
                  </span>
                )}
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                {callStatusMessage || "Please answer the automated call and follow the keypad instructions."}
              </p>
            </div>

            {/* Language Selector */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-primary-700" />
                <span>Call Language:</span>
              </span>
              <select
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value)}
                disabled={isCalling}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:ring-1 focus:ring-primary-600"
              >
                <option value="en-IN">English (Default)</option>
                <option value="te-IN">తెలుగు (Telugu)</option>
                <option value="hi-IN">हिन्दी (Hindi)</option>
              </select>
            </div>

            {/* Keypad Response Guide */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <div className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary-600" />
                <span>Keypad Response Instructions</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-emerald-950">Press 1 — Confirm Account</div>
                    <div className="text-emerald-800 text-[11px] mt-0.5">
                      Confirms you created this account. Mobile is marked verified and submitted for Admin Approval.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-600 text-white font-mono font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-rose-950">Press 2 — Account Not Created</div>
                    <div className="text-rose-800 text-[11px] mt-0.5">
                      Reports unauthorized sign-up. The challenge is marked Disputed and blocked from approval.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Call Me / Retry */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={callStatus === "IDLE" ? handleStartVoiceCall : handleRetryVoiceCall}
                disabled={isCalling || callCooldown > 0}
                className="w-full py-3.5 px-4 rounded-xl bg-primary-700 text-white font-bold text-sm hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isCalling ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Calling {phone}...</span>
                  </>
                ) : callCooldown > 0 ? (
                  <span>Call Cooldown ({callCooldown}s)</span>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4" />
                    <span>{callStatus === "IDLE" ? "Call Me Now" : "Retry Call"}</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[11px] text-slate-500">
                  Live status polling active. When you press 1 on the call, verification completes automatically.
                </span>
              </div>
            </div>

            {/* Error / Dispute alert */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: 6-DIGIT OTP KEYPAD ENTRY (EMAIL & SMS)                            */
          /* ========================================================================= */
          <div className="space-y-5">
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
                  <strong>Your verification code has expired. Please request a new OTP.</strong>
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

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* SWITCH VERIFICATION METHOD OPTIONS (ALL 3 METHODS)                       */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5 text-primary-700" />
            <span>Switch Verification Method:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {method !== "EMAIL" && (
              <button
                type="button"
                onClick={() => handleChangeMethod("EMAIL")}
                disabled={resending || loading}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-primary-500 text-left transition-all text-xs group"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary-600" />
                  <span>Email OTP</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Send code to email</div>
              </button>
            )}

            {method !== "SMS" && (
              <button
                type="button"
                onClick={() => handleChangeMethod("SMS")}
                disabled={resending || loading || !phone.trim()}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-primary-500 text-left transition-all text-xs group disabled:opacity-40"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary-600" />
                  <span>Mobile SMS</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Send code to phone</div>
              </button>
            )}

            {method !== "VOICE_CALL" && (
              <button
                type="button"
                onClick={() => handleChangeMethod("VOICE_CALL")}
                disabled={resending || loading || !phone.trim()}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-primary-500 text-left transition-all text-xs group disabled:opacity-40"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-primary-600" />
                  <span>Phone Call</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Call & press 1</div>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-center">
            <span>Need to update organization or contact details?</span>
            <Link
              href="/register"
              className="font-bold text-primary-700 hover:text-primary-800 underline inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Register again</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

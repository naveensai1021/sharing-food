"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { apiFetch } from "@/services/apiClient";
import { DonationDto } from "@/types";
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Loader2, 
  Search, 
  AlertCircle,
  KeyRound,
  RefreshCw,
  Navigation,
  Building2,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";

export default function BeneficiaryPickupsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<DonationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<DonationDto[]>("/api/donations");
      setDonations(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load pickups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const pendingPickups = donations.filter(
    (d) => d.status !== "COMPLETED" && d.status !== "COLLECTED" && d.status !== "CANCELLED" && d.status !== "EXPIRED"
  );
  const completedPickups = donations.filter(
    (d) => d.status === "COMPLETED" || d.status === "COLLECTED"
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secure OTP Handover Verification</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            My Food Pickups &amp; Pickup OTPs
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Present your secure 6-digit OTP to the food supplier to verify identity and collect reserved food.
          </p>
        </div>

        <Link
          href="/beneficiary/find-food"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors self-start sm:self-auto"
        >
          <Search className="h-4 w-4" />
          <span>Find More Food</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : pendingPickups.length === 0 && completedPickups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Truck className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No active food pickups</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Browse available food donations and submit collection requests for your organization.
          </p>
          <Link
            href="/beneficiary/find-food"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Find Nearby Food
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active / Approved Pickups */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Active Pickups &amp; Handover OTPs ({pendingPickups.length})
            </h2>

            {pendingPickups.length === 0 ? (
              <p className="text-sm text-slate-500 italic bg-white p-6 rounded-2xl border border-slate-200">
                No active pickups pending. Any approved donations will appear here with your secure Pickup OTP.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingPickups.map((donation) => (
                  <PickupCard key={donation.id} donation={donation} onRefresh={fetchPickups} />
                ))}
              </div>
            )}
          </div>

          {/* Completed Pickups */}
          {completedPickups.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Verified &amp; Completed Pickups ({completedPickups.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedPickups.map((donation) => (
                  <div
                    key={donation.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500">{donation.foodCategory}</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Successfully Collected
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{donation.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      From: <strong>{donation.supplierName}</strong> • {donation.estimatedServings} Meals Shared
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Completed: {donation.completedAt ? formatDateTime(donation.completedAt) : "Recently"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PickupCard({ donation, onRefresh }: { donation: DonationDto; onRefresh: () => void }) {
  const [otp, setOtp] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [loadingOtp, setLoadingOtp] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isCollected, setIsCollected] = useState<boolean>(
    donation.status === "COLLECTED" || donation.status === "COMPLETED"
  );
  const [pendingReviewMsg, setPendingReviewMsg] = useState<string>(
    "Your request is pending review by the food supplier. Once approved, your 6-digit pickup OTP will appear here."
  );

  const fetchOtp = async () => {
    setLoadingOtp(true);
    try {
      const res = await apiFetch<{
        otp?: string;
        expiresAt?: string;
        isExpired?: boolean;
        expired?: boolean;
        collected?: boolean;
        status?: string;
        message?: string;
      }>(`/api/donations/${donation.id}/pickup-otp`);

      if (res) {
        if (res.collected || res.status === "COLLECTED" || res.status === "COMPLETED") {
          setIsCollected(true);
          setOtp(null);
        } else if (res.otp) {
          setOtp(res.otp);
          setExpiresAt(res.expiresAt || null);
          setIsExpired(Boolean(res.isExpired ?? res.expired));
          setIsCollected(false);
        } else {
          setOtp(null);
          if (res.message) setPendingReviewMsg(res.message);
        }
      }
    } catch {
      if (donation.status === "COLLECTED" || donation.status === "COMPLETED") {
        setIsCollected(true);
      }
    } finally {
      setLoadingOtp(false);
    }
  };

  useEffect(() => {
    fetchOtp();
    // Auto-poll every 8 seconds if waiting for supplier approval
    if (!otp && !isCollected) {
      const interval = setInterval(() => {
        fetchOtp();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [donation.id, otp, isCollected]);

  // Countdown timer for 15-minute OTP
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
        setIsExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleRegenerateOtp = async () => {
    setRegenerating(true);
    try {
      const res = await apiFetch<{ otp: string; expiresAt: string; expired: boolean }>(
        `/api/donations/${donation.id}/regenerate-otp`,
        { method: "POST" }
      );
      setOtp(res.otp);
      setExpiresAt(res.expiresAt);
      setIsExpired(false);
      toast.success("New secure 6-digit Pickup OTP generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to regenerate OTP.");
    } finally {
      setRegenerating(false);
    }
  };

  const photoSrc = donation.supplierPhotoUrl || donation.supplierLogoUrl;
  const destLat = donation.supplierLatitude || donation.address?.latitude || 17.385;
  const destLng = donation.supplierLongitude || donation.address?.longitude || 78.486;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        
        {/* Left: Donation & Supplier Details */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-4">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={donation.supplierName}
                className="h-20 w-24 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="h-20 w-24 rounded-2xl bg-amber-50 text-amber-700 flex flex-col items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
                <Building2 className="h-6 w-6" />
                <span className="text-[10px] mt-1">Storefront</span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {donation.foodCategory}
                </span>
                <span>•</span>
                {(!otp && !isCollected && (donation.acceptanceStatus === 'PENDING' || donation.status === 'RESERVED')) ? (
                  <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    Pending Supplier Approval
                  </span>
                ) : (donation.status === 'READY_FOR_PICKUP' || otp) ? (
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Approved - Ready For Pickup
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-50 text-slate-800 border border-slate-200 px-2.5 py-0.5 text-xs font-bold">
                    {donation.status.replace(/_/g, " ")}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900">{donation.title}</h3>
              <p className="text-sm font-semibold text-amber-800 mt-0.5">
                Supplier: {donation.supplierName}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {donation.estimatedServings} Meals ({donation.dietaryType}) • {donation.approximateQuantity} {donation.quantityUnit}
              </p>
            </div>
          </div>

          {/* Full Address Details (Requirement 1) */}
          <div className="text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 uppercase text-[10px] block mb-0.5">
              Pickup Location:
            </span>
            <p className="leading-relaxed">
              {donation.supplierAddress || donation.address?.streetAddress}
              {donation.supplierLocality && `, ${donation.supplierLocality}`}
              {donation.supplierCity && `, ${donation.supplierCity}`}
              {donation.supplierPostalCode && ` - ${donation.supplierPostalCode}`}
            </p>
          </div>

          {/* Call Supplier & Directions Buttons (Requirement 1 & Dashboard Contact Details) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {donation.supplierPhone ? (
              <div className="inline-flex items-center gap-2">
                <a
                  href={`tel:${donation.supplierPhone}`}
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Supplier</span>
                </a>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-2 rounded-xl border border-slate-200">
                  <Phone className="h-3 w-3 text-emerald-600" />
                  {donation.supplierPhone}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic bg-slate-100 px-2.5 py-2 rounded-xl border border-slate-200">
                Phone Number Not Added
              </span>
            )}

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
            >
              <Navigation className="h-3.5 w-3.5 text-emerald-600" />
              <span>Get Directions</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Right: Secure Pickup OTP Card (Requirement 6 - Step 3 / Issue 2) */}
        <div className="w-full lg:w-80 rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-50/70 to-white p-5 text-center shadow-sm space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
            <KeyRound className="h-4 w-4 text-emerald-700" />
            <span>Secure Pickup OTP</span>
          </div>

          {loadingOtp ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : isCollected ? (
            <div className="py-6 space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Successfully Collected</h4>
              <p className="text-xs text-slate-600">
                Food handover verified by supplier via secure OTP.
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Handover Completed
              </span>
            </div>
          ) : otp ? (
            <div>
              {/* 6-Digit OTP Display with Copy OTP button */}
              <div className="my-2 py-3 px-4 bg-white border-2 border-dashed border-emerald-600 rounded-2xl shadow-xs flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-extrabold tracking-[0.35em] text-emerald-800 select-all pl-2">
                  {otp}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(otp);
                    setCopied(true);
                    toast.success("Pickup OTP copied to clipboard!");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                  title="Copy OTP"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Expiration Timer & Notice */}
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold mt-2">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                {isExpired ? (
                  <span className="text-red-600 font-bold">Code has expired</span>
                ) : (
                  <span className="text-slate-700">Expires in: <strong className="text-emerald-700 font-mono">{timeLeft}</strong></span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Present this code to <strong>{donation.supplierName}</strong> upon arrival.
              </p>

              {/* Copy OTP & Regenerate OTP buttons */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(otp);
                    setCopied(true);
                    toast.success("Pickup OTP copied to clipboard!");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="py-2 px-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-emerald-700" />}
                  <span>{copied ? "Copied!" : "Copy OTP"}</span>
                </button>

                <button
                  type="button"
                  disabled={regenerating}
                  onClick={handleRegenerateOtp}
                  className="py-2 px-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} />
                  <span>{isExpired ? "New OTP" : "Regenerate"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                {pendingReviewMsg}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fetchOtp();
                    onRefresh();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", loadingOtp && "animate-spin")} /> Refresh Status
                </button>
                <button
                  type="button"
                  disabled={regenerating}
                  onClick={handleRegenerateOtp}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>{regenerating ? "Generating..." : "Generate / View Code"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

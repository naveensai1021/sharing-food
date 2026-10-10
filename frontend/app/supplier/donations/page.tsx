"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { apiFetch } from "@/services/apiClient";
import { DonationDto } from "@/types";
import { 
  PlusCircle, 
  Utensils, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  Truck, 
  Loader2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Check,
  X,
  Phone,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";

export default function SupplierDonationsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<DonationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // OTP Verification Modal state
  const [verifyModalDonation, setVerifyModalDonation] = useState<DonationDto | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerifiedSuccess, setOtpVerifiedSuccess] = useState(false);
  const [confirmedServings, setConfirmedServings] = useState<number>(0);
  const [confirmingHandover, setConfirmingHandover] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<DonationDto[]>("/api/donations");
      setDonations(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load donations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleApprove = async (donationId: string) => {
    setProcessingId(donationId);
    try {
      await apiFetch(`/api/donations/${donationId}/approve`, { method: "POST" });
      toast.success("Request approved! A secure 6-digit Pickup OTP has been sent to the beneficiary.");
      fetchDonations();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve request.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (donationId: string) => {
    if (!confirm("Are you sure you want to decline this beneficiary request?")) return;
    setProcessingId(donationId);
    try {
      await apiFetch(`/api/donations/${donationId}/reject`, { method: "POST" });
      toast.info("Request rejected. Donation remains available for other organizations.");
      fetchDonations();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject request.");
    } finally {
      setProcessingId(null);
    }
  };

  const openVerifyOtpModal = (donation: DonationDto) => {
    setVerifyModalDonation(donation);
    setOtpInput("");
    setOtpVerifiedSuccess(donation.otpVerified || false);
    setConfirmedServings(donation.estimatedServings || 20);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyModalDonation || !otpInput.trim()) return;

    setOtpVerifying(true);
    try {
      const res: any = await apiFetch(`/api/donations/${verifyModalDonation.id}/verify-otp`, {
        method: "POST",
        body: JSON.stringify({ otp: otpInput.trim(), servings: confirmedServings }),
      });
      setOtpVerifiedSuccess(true);
      toast.success(res?.message || "Beneficiary Verified Successfully.");
      fetchDonations();
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP. Please check with the beneficiary.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleConfirmFoodHandover = async () => {
    if (!verifyModalDonation) return;

    setConfirmingHandover(true);
    try {
      await apiFetch(`/api/donations/${verifyModalDonation.id}/confirm-handover`, {
        method: "POST",
        body: JSON.stringify({ confirmedServings }),
      });
      toast.success("Food handover confirmed! Donation completed.");
      setVerifyModalDonation(null);
      setActiveTab("COMPLETED");
      fetchDonations();
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm handover.");
    } finally {
      setConfirmingHandover(false);
    }
  };

  const handleCancel = async (donationId: string) => {
    if (!confirm("Are you sure you want to cancel this food donation?")) return;
    setProcessingId(donationId);
    try {
      await apiFetch(`/api/donations/${donationId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "Supplier cancelled from dashboard" }),
      });
      toast.info("Donation cancelled.");
      fetchDonations();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel donation.");
    } finally {
      setProcessingId(null);
    }
  };

  const activeDonations = donations.filter(
    (d) => d.status !== "COMPLETED" && d.status !== "COLLECTED" && d.status !== "CANCELLED" && d.status !== "EXPIRED"
  );
  const pastDonations = donations.filter(
    (d) => d.status === "COMPLETED" || d.status === "COLLECTED" || d.status === "CANCELLED" || d.status === "EXPIRED"
  );

  const displayedList = activeTab === "ACTIVE" ? activeDonations : pastDonations;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Supplier Food Hub &amp; Handover Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            My Food Donations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review incoming requests, approve pickups, and verify beneficiary OTPs during food handover.
          </p>
        </div>

        <Link
          href="/donations/create"
          className="inline-flex items-center gap-2 rounded-xl bg-secondary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-secondary-700 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Donate Food</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={cn(
            "pb-3 px-4 text-sm font-bold border-b-2 transition-colors",
            activeTab === "ACTIVE"
              ? "border-secondary-600 text-secondary-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Active Donations ({activeDonations.length})
        </button>
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={cn(
            "pb-3 px-4 text-sm font-bold border-b-2 transition-colors",
            activeTab === "COMPLETED"
              ? "border-secondary-600 text-secondary-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Handed Over &amp; Completed ({pastDonations.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : displayedList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Utensils className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">
            {activeTab === "ACTIVE" ? "No active donations right now" : "No handover history yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === "ACTIVE"
              ? "When you have surplus meals from service, post them to rescue food and feed nearby care homes."
              : "Completed and handed-over donations will appear here."}
          </p>
          {activeTab === "ACTIVE" && (
            <Link
              href="/donations/create"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-secondary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-700"
            >
              Post First Donation
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {displayedList.map((donation) => {
            const hasPendingRequest = donation.status === "AVAILABLE" && donation.acceptedByBeneficiaryName;
            const isApproved = donation.status === "RESERVED" || donation.status === "READY_FOR_PICKUP" || donation.status === "PICKUP_IN_PROGRESS";

            return (
              <div
                key={donation.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {donation.images.length > 0 ? (
                      <img
                        src={donation.images[0].imageUrl}
                        alt={donation.title}
                        className="h-20 w-24 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                      />
                    ) : (
                      <div className="h-20 w-24 rounded-2xl bg-orange-50 text-secondary-600 flex items-center justify-center font-bold text-xl shrink-0">
                        🍽️
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {donation.foodCategory}
                        </span>
                        <span>•</span>
                        <StatusBadge status={donation.status} />
                      </div>

                      <h3 className="text-xl font-bold text-slate-900">{donation.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {donation.estimatedServings} Servings ({donation.approximateQuantity} {donation.quantityUnit}) • {donation.dietaryType}
                      </p>

                      {donation.acceptedByBeneficiaryName && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-emerald-700" />
                            Beneficiary: <strong>{donation.acceptedByBeneficiaryName}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions according to Feature 6 workflow */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-start">
                    {/* Step 2: Supplier Approves or Rejects Request */}
                    {hasPendingRequest && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={processingId === donation.id}
                          onClick={() => handleApprove(donation.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {processingId === donation.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          <span>Approve Request</span>
                        </button>
                        <button
                          disabled={processingId === donation.id}
                          onClick={() => handleReject(donation.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 text-xs font-semibold"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Step 4 & 5: Verify Pickup OTP */}
                    {isApproved && (
                      <button
                        onClick={() => openVerifyOtpModal(donation)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        <span>Verify Pickup OTP &amp; Handover</span>
                      </button>
                    )}

                    {donation.status === "AVAILABLE" && !hasPendingRequest && (
                      <button
                        onClick={() => handleCancel(donation.id)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Pickup Window Until: {formatDateTime(donation.pickupAvailableUntil)}</span>
                  </div>
                  <span className="font-semibold text-slate-700">
                    Workflow: {getWorkflowStepName(donation.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OTP Verification & Food Handover Modal (Requirement 6 - Steps 4, 5, 6) */}
      {verifyModalDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Beneficiary Handover Verification
                </h3>
              </div>
              <button
                onClick={() => setVerifyModalDonation(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Beneficiary Details Confirmation */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p className="font-semibold text-slate-900 text-sm">
                  {verifyModalDonation.title}
                </p>
                <p className="text-slate-600">
                  Beneficiary Organization: <strong>{verifyModalDonation.acceptedByBeneficiaryName || "Registered Care Home"}</strong>
                </p>
                <p className="text-slate-500">
                  Reserved Servings: {verifyModalDonation.estimatedServings} Meals
                </p>
              </div>

              {!otpVerifiedSuccess ? (
                /* Step 4 & 5: Enter OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Enter 6-Digit Pickup OTP Provided by Beneficiary
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="w-full px-4 py-3 text-center tracking-[0.5em] text-2xl font-bold rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                      Ask the arriving collector for their pickup code displayed in their authenticated dashboard.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setVerifyModalDonation(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={otpVerifying || otpInput.length < 6}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
                    >
                      {otpVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      <span>Verify Code</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 6: Beneficiary Verified Successfully -> Confirm Food Handover */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-700 shrink-0" />
                    <div>
                      <strong className="block text-sm font-bold">Beneficiary Verified Successfully.</strong>
                      <p className="text-xs text-emerald-800">
                        Identity matched and collection code verified. Please proceed with physical food handover.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Confirmed Handover Servings
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={confirmedServings}
                      onChange={(e) => setConfirmedServings(parseInt(e.target.value) || 1)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Confirm the final number of servings handed over to complete inventory deduction.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setVerifyModalDonation(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={confirmingHandover}
                      onClick={handleConfirmFoodHandover}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                    >
                      {confirmingHandover ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                      <span>Confirm Food Handover</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-800 border-emerald-200",
    RESERVED: "bg-blue-100 text-blue-800 border-blue-200",
    READY_FOR_PICKUP: "bg-purple-100 text-purple-800 border-purple-200",
    PICKUP_IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-200",
    COLLECTED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    EXPIRED: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
        styles[status] || "bg-slate-100 text-slate-800 border-slate-200"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function getWorkflowStepName(status: string) {
  switch (status) {
    case "AVAILABLE": return "Step 1: Open for Beneficiary Request";
    case "RESERVED": return "Step 2: Approved, Awaiting Collector Arrival";
    case "READY_FOR_PICKUP": return "Step 3: Packaged & Ready";
    case "PICKUP_IN_PROGRESS": return "Step 4: Collector En Route";
    case "COLLECTED": return "Step 5: Handover Verified";
    default: return status;
  }
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { apiFetch } from "@/services/apiClient";
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  AlertTriangle,
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Loader2,
  FileText,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [organizationName, setOrganizationName] = useState(user?.organizationName || "");
  const [publicPhone, setPublicPhone] = useState(user?.publicPhone || user?.phone || "");
  const [showPublicPhone, setShowPublicPhone] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sync state if user loads after mount
  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
      setOrganizationName(user.organizationName || "");
      setPublicPhone(user.publicPhone || user.phone || "");
      setShowPublicPhone(user.showPublicPhone ?? true);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  const isSupplier = user.roles.includes("ROLE_SUPPLIER");
  const isBeneficiary = user.roles.includes("ROLE_BENEFICIARY");
  const isAdmin = user.roles.includes("ROLE_ADMIN");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName,
          phone,
          city,
          organizationName: isSupplier || isBeneficiary ? organizationName : undefined,
          publicPhone: isSupplier || isBeneficiary ? publicPhone : undefined,
          showPublicPhone: isSupplier || isBeneficiary ? showPublicPhone : undefined,
        }),
      });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 p-8 text-white shadow-md border border-emerald-900/30 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-white font-extrabold text-2xl backdrop-blur-sm border border-white/30 shadow-inner">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{user.fullName || "User Profile"}</h1>
            <p className="text-sm text-emerald-100 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-4 w-4 text-emerald-200" />
              <span className="font-medium text-white/95">{user.email}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-white/20 text-white border border-white/30 px-3 py-1 text-xs font-bold backdrop-blur-sm shadow-xs"
                >
                  {role.replace("ROLE_", "")}
                </span>
              ))}
              <span className={cn(
                "rounded-full px-3 py-1 text-xs font-bold border",
                (user.status === "APPROVED" || user.status === "ACTIVE")
                  ? "bg-emerald-400/25 text-emerald-100 border-emerald-300/40"
                  : user.status === "PENDING_APPROVAL"
                  ? "bg-amber-400/25 text-amber-100 border-amber-300/40"
                  : "bg-red-400/25 text-red-100 border-red-300/40"
              )}>
                Status: {user.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Verification & Approval Status Card */}
      {!isAdmin && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary-700" />
              Admin Verification & Approval Status
            </h2>
            <Link
              href="/account-status"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800"
            >
              <span>View Full Status Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {(user.status === "APPROVED" || user.status === "ACTIVE") ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-emerald-900 text-base">
                    Account Approved & Fully Operational
                  </h3>
                  <p className="text-sm text-emerald-800 mt-1">
                    Your registration has been reviewed and verified by the administration. You have full access to platform features including food donations, reservations, and OTP-verified pickups.
                  </p>
                  {user.licenseNumber && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                      <FileText className="h-4 w-4" />
                      <span>Registration / License: {user.licenseNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : user.status === "PENDING_APPROVAL" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-900 text-base">
                    Pending Administrator Approval
                  </h3>
                  <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                    Your application is currently under review by our administrative team. Once approved, you will be notified and can immediately begin posting surplus meals or reserving food.
                  </p>
                  <p className="text-xs text-amber-700 mt-3 font-medium">
                    Review is typically conducted within 12-24 business hours.
                  </p>
                </div>
              </div>
            </div>
          ) : user.status === "SUSPENDED" ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 text-base">
                    Account Suspended
                  </h3>
                  <p className="text-sm text-red-800 mt-1">
                    This account is temporarily suspended.
                  </p>
                  {user.statusReason && (
                    <div className="mt-2 rounded-lg bg-white/80 p-3 text-xs text-red-900 border border-red-200">
                      <strong>Reason:</strong> {user.statusReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 text-base">
                    Application Rejected
                  </h3>
                  <p className="text-sm text-red-800 mt-1">
                    Your registration was not approved.
                  </p>
                  {user.statusReason && (
                    <div className="mt-2 rounded-lg bg-white/80 p-3 text-xs text-red-900 border border-red-200">
                      <strong>Reason:</strong> {user.statusReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Contact & Organization Details</h2>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Full Name / Contact Person
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>

            {(isSupplier || isBeneficiary) && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
            )}
          </div>

          {/* Section 48: Public Phone Management */}
          {(isSupplier || isBeneficiary) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Public Contact Phone
                </label>
                <input
                  type="tel"
                  value={publicPhone}
                  onChange={(e) => setPublicPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
                <p className="text-xs text-slate-500 mt-1">Official phone number shown for pickup coordination.</p>
              </div>

              <div className="flex items-center pt-2 sm:pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPublicPhone}
                    onChange={(e) => setShowPublicPhone(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Display phone number publicly in Directory</span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

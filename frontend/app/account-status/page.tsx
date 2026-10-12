"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { 
  ShieldCheck, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  RefreshCw, 
  ArrowRight,
  LogOut,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AccountStatusPage() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <ShieldCheck className="h-12 w-12 text-primary-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Verification</h1>
          <p className="text-sm text-slate-600 mb-6">
            Please log in with your registered account to check your application and review status.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-primary-700 text-white font-semibold hover:bg-primary-800 transition-colors shadow-sm"
          >
            Sign In to View Status
          </Link>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      toast.success("Account status updated.");
    } catch {
      toast.error("Could not refresh account status.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isApproved = user.status === "APPROVED" || user.status === "ACTIVE";
  const isPending = user.status === "PENDING_APPROVAL" || user.status === "PENDING_ADMIN_APPROVAL" || user.status === "PENDING_VERIFICATION";
  const isPendingOtp = user.status === "PENDING_OTP_VERIFICATION";
  const isRejected = user.status === "REJECTED";
  const isSuspended = user.status === "SUSPENDED";

  const roleName = user.roles.includes("ROLE_ADMIN")
    ? "Platform Administrator"
    : user.roles.includes("ROLE_SUPPLIER")
    ? "Food Supplier"
    : "Care Beneficiary";

  const getDashboardUrl = () => {
    if (user.roles.includes("ROLE_ADMIN")) return "/admin/dashboard";
    if (user.roles.includes("ROLE_SUPPLIER")) return "/supplier/dashboard";
    if (user.roles.includes("ROLE_BENEFICIARY")) return "/beneficiary/dashboard";
    return "/";
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Account Registration Review
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {user.organizationName || user.fullName || "Your Account"}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Registered Role: <strong className="text-slate-800">{roleName}</strong> • {user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Status Highlight Banner */}
        {isPendingOtp && (
          <div className="rounded-3xl border border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-200 text-blue-900 text-xs font-bold">
                  Status: PENDING OTP VERIFICATION
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Contact Verification Incomplete
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Your registration requires 6-digit OTP verification before it can be submitted to our administrator team for review.
                </p>
                <div className="pt-2 flex gap-3">
                  <Link
                    href={`/verify-otp?email=${encodeURIComponent(user.email)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm"
                  >
                    <span>Verify OTP Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {isPending && (
          <div className="rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/40 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold">
                  Status: PENDING APPROVAL
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Your Application is Under Administrator Review
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Thank you for submitting your organization details. To maintain the highest standards of food hygiene and protect vulnerable care residents, all food donors and care homes are verified by our administrator team before operational privileges are activated.
                </p>
                <div className="rounded-2xl bg-white/80 border border-amber-200/70 p-4 text-xs text-amber-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-amber-700" />
                    What happens next?
                  </p>
                  <p className="text-slate-700 pl-5.5">
                    Our team verifies your organization registration or FSSAI license, premises photograph, and contact credentials. Once approved, you will gain immediate access to create food listings or reserve meals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 text-xs font-bold">
                  Status: APPROVED & ACTIVE
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Congratulations! Your Account is Fully Approved
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Your credentials and documentation have been verified by the administrator. You now have unrestricted access to all operational features for your role.
                </p>
                <div className="pt-2">
                  <Link
                    href={getDashboardUrl()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-800 transition-colors shadow-sm"
                  >
                    <span>Proceed to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="rounded-3xl border border-red-300 bg-gradient-to-br from-red-50 to-rose-50/40 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-200/80 text-red-900 text-xs font-bold">
                  Status: APPLICATION REJECTED
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Application Not Approved
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Our administration team has reviewed your application and was unable to approve it based on the submitted information.
                </p>

                {/* Mandatory Rejection Reason */}
                <div className="rounded-2xl bg-white border border-red-200 p-4 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-700 block mb-1">
                    Administrator Review Feedback:
                  </span>
                  <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">
                    {user.statusReason || "Insufficient or unverifiable organizational credentials provided."}
                  </p>
                  {user.reviewedAt && (
                    <p className="text-[11px] text-slate-500 mt-2">
                      Decision recorded on {new Date(user.reviewedAt).toLocaleDateString()} at {new Date(user.reviewedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:support@sharingfood.org?subject=Application%20Rejection%20Appeal"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Contact Support to Appeal</span>
                  </a>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <span>Submit New Registration</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {isSuspended && (
          <div className="rounded-3xl border border-red-300 bg-gradient-to-br from-red-50 to-orange-50/40 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-200/80 text-red-900 text-xs font-bold">
                  Status: ACCOUNT SUSPENDED
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Account Temporarily Suspended
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Your access to operational platform capabilities has been paused by the platform administrator.
                </p>

                {/* Mandatory Suspension Reason */}
                <div className="rounded-2xl bg-white border border-red-200 p-4 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-700 block mb-1">
                    Reason for Suspension:
                  </span>
                  <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">
                    {user.statusReason || "Account paused pending policy or food safety compliance verification."}
                  </p>
                  {user.reviewedAt && (
                    <p className="text-[11px] text-slate-500 mt-2">
                      Suspended on {new Date(user.reviewedAt).toLocaleDateString()} at {new Date(user.reviewedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <a
                    href="mailto:support@sharingfood.org?subject=Account%20Suspension%20Inquiry"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Inquire with Compliance Team</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Details Summary Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-700" />
              Submitted Application Profile
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details are recorded and securely reviewed by authorized administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Organization / Center Name
              </span>
              <p className="font-bold text-slate-900 mt-1">
                {user.organizationName || user.fullName || "Not provided"}
              </p>
              {user.organizationType && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 font-medium">
                  {user.organizationType.replace("_", " ")}
                </span>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Primary Contact Person
              </span>
              <p className="font-bold text-slate-900 mt-1">
                {user.fullName || "Not provided"}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Registered Contact Phone
              </span>
              <p className="font-bold text-slate-900 mt-1">
                {user.phone || user.publicPhone || "Not provided"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                City: {user.city || "Hyderabad"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Registration / License Credentials
              </span>
              <p className="font-bold text-slate-900 mt-1">
                {user.licenseNumber || "Recorded in verification dossier"}
              </p>
              {user.documentUrl && (
                <span className="text-xs text-primary-700 font-medium mt-1 inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Supporting Document Attached
                </span>
              )}
            </div>
          </div>

          {user.streetAddress && (
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Operating Premises Address
              </span>
              <p className="font-medium text-slate-900 mt-1">
                {user.streetAddress}{user.locality ? `, ${user.locality}` : ""}, {user.city || "Hyderabad"}, {user.state || "Telangana"} {user.postalCode ? `- ${user.postalCode}` : ""}
              </p>
              {user.latitude && user.longitude && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Coordinates: {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
                </p>
              )}
            </div>
          )}

          {user.residentCount && (
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Beneficiary Care Capacity
              </span>
              <p className="font-medium text-slate-900 mt-1">
                Approximate Residents: <strong>{user.residentCount}</strong> • Meal Capacity: <strong>{user.foodCapacityServings || 50} servings</strong>
              </p>
            </div>
          )}
        </div>

        {/* Support Footer */}
        <div className="rounded-3xl bg-slate-100/70 p-6 text-center text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Questions regarding your account verification?</p>
          <p className="mt-1">
            Reach out to our verification desk at <a href="mailto:support@sharingfood.org" className="text-primary-700 font-semibold underline">support@sharingfood.org</a> or visit our <Link href="/contact" className="text-primary-700 underline">contact page</Link>.
          </p>
        </div>

      </div>
    </div>
  );
}

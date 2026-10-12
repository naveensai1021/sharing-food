"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import apiClient from "@/services/apiClient";
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  UtensilsCrossed, 
  Heart, 
  Building2, 
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import OrganizationContactSection from "@/components/OrganizationContactSection";

interface BeneficiarySummary {
  totalClaimed: number;
  activePickups: number;
  completedPickups: number;
  totalServingsReceived: number;
  availableNearbyCount: number;
  recentPickups: Array<{
    id: string;
    title: string;
    supplierOrganizationName?: string;
    foodCategory: string;
    dietaryType: string;
    estimatedServings: number;
    status: string;
    pickupAvailableUntil: string;
    pickupAddressFormatted?: string;
  }>;
}

export default function BeneficiaryDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<BeneficiarySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const res = await apiClient.get<BeneficiarySummary>("/donations/beneficiary/summary");
        setSummary(res.data);
      } catch (err: any) {
        toast.error("Failed to load beneficiary dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESERVED":
        return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">Reserved</span>;
      case "READY_FOR_PICKUP":
        return <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">Ready for Pickup</span>;
      case "PICKUP_IN_PROGRESS":
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">En Route</span>;
      case "COLLECTED":
        return <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">Collected</span>;
      case "COMPLETED":
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">Completed</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Unapproved Account Warning */}
        {user?.status !== "APPROVED" && user?.status !== "ACTIVE" && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 text-amber-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Account Review Status: {user?.status ? user.status.replace("_", " ") : "PENDING APPROVAL"}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Your care beneficiary account is under review by our administrator team. Reserving donations and OTP pickups will be unlocked once approved.
                </p>
              </div>
            </div>
            <Link
              href="/account-status"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 transition-colors shrink-0"
            >
              <span>View Review Details</span>
            </Link>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-900 via-primary-800 to-blue-950 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-semibold text-blue-300 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
                <span>Verified Beneficiary Partner</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.fullName || "Care Home & Shelter Hub"}
              </h1>
              <p className="mt-1 text-sm text-blue-100/90 max-w-xl">
                Claim fresh surplus meals from local hotels and caterers to nourish your residents safely and promptly.
              </p>
            </div>

            {(user?.status === "APPROVED" || user?.status === "ACTIVE") ? (
              <Link
                href="/beneficiary/find-food"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-sm hover:bg-secondary-400 transition-all hover:scale-[1.02]"
              >
                <Search className="h-5 w-5" />
                <span>Find Food Near You</span>
              </Link>
            ) : (
              <Link
                href="/account-status"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/90 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm hover:bg-amber-400 transition-all"
              >
                <Clock className="h-5 w-5" />
                <span>Approval Pending</span>
              </Link>
            )}
          </div>
        </div>

        {/* Organization Contact Details Section (Requirement 1) */}
        <OrganizationContactSection type="beneficiary" />

        {/* Impact KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Near You</span>
              <Search className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-3xl font-black text-emerald-700">
              {loading ? "..." : summary?.availableNearbyCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Ready for same-day claiming</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Pickups</span>
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {loading ? "..." : summary?.activePickups || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Reserved & en route</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meals Received</span>
              <UtensilsCrossed className="h-4 w-4 text-secondary-600" />
            </div>
            <div className="mt-2 text-3xl font-black text-secondary-700">
              {loading ? "..." : summary?.totalServingsReceived || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Servings brought home</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Pickups</span>
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {loading ? "..." : summary?.completedPickups || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Total successful deliveries</div>
          </div>
        </div>

        {/* Main Section: Active Pickups & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Pickups Table */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Current Pickups</h3>
                <p className="text-xs text-slate-500 mt-0.5">Coordinate collection times and update pickup statuses.</p>
              </div>
              <Link
                href="/beneficiary/pickups"
                className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
              >
                <span>Manage All Pickups</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading pickups...</div>
              ) : (!summary?.recentPickups || summary.recentPickups.length === 0) ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <Truck className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No active food claims right now</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Browse available surplus food listings in your area.</p>
                  <Link
                    href="/beneficiary/find-food"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-800"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Search Food Near You</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.recentPickups.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{d.title}</span>
                          {getStatusBadge(d.status)}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          {d.supplierOrganizationName && (
                            <span className="font-semibold text-slate-700">{d.supplierOrganizationName}</span>
                          )}
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">{d.dietaryType}</span>
                          <span>•</span>
                          <span>{d.estimatedServings} servings</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="h-3 w-3" />
                            By {new Date(d.pickupAvailableUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {d.pickupAddressFormatted && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{d.pickupAddressFormatted}</span>
                          </div>
                        )}
                      </div>

                      <Link
                        href="/beneficiary/pickups"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 self-end sm:self-center"
                      >
                        <span>Update Status</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Guidelines & Directory Box */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Pickup Protocol</span>
              </div>
              <ul className="space-y-2 text-xs text-blue-950/80 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Click <strong>Start Pickup / En Route</strong> when departing your facility.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Carry clean, insulated food grade storage vessels.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Confirm sensory freshness before taking handover from donor.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Links</h4>
              </div>
              <div className="mt-3 space-y-2 text-xs font-semibold">
                <Link
                  href="/beneficiary/find-food"
                  className="flex items-center justify-between rounded-lg p-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Food Map & Distance Filter</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/organizations"
                  className="flex items-center justify-between rounded-lg p-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Public Organization Directory</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/community"
                  className="flex items-center justify-between rounded-lg p-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Post Story / Express Thanks</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

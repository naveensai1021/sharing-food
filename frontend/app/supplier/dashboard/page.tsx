"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import apiClient from "@/services/apiClient";
import { 
  Package, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  UtensilsCrossed, 
  Heart, 
  Building2, 
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Users
} from "lucide-react";
import { toast } from "sonner";
import OrganizationContactSection from "@/components/OrganizationContactSection";

interface SupplierSummary {
  totalDonations: number;
  activeDonations: number;
  completedDonations: number;
  totalServingsDonated: number;
  beneficiariesHelped: number;
  recentDonations: Array<{
    id: string;
    title: string;
    foodCategory: string;
    dietaryType: string;
    estimatedServings: number;
    status: string;
    pickupAvailableUntil: string;
    createdAt: string;
  }>;
}

export default function SupplierDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SupplierSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const res = await apiClient.get<SupplierSummary>("/donations/supplier/summary");
        setSummary(res.data);
      } catch (err: any) {
        toast.error("Failed to load supplier dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">Available</span>;
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
                  Your food donor account is under review by our administrator team. Operational features like posting donations will be unlocked once approved.
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
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-800 via-primary-800 to-emerald-950 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>Verified Food Supplier</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.fullName || "Food Donor Hub"}
              </h1>
              <p className="mt-1 text-sm text-emerald-100/90 max-w-xl">
                Turn your surplus banquet meals and prepared dishes into warm smiles at nearby shelters and homes today.
              </p>
            </div>

            {(user?.status === "APPROVED" || user?.status === "ACTIVE") ? (
              <Link
                href="/donations/create"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-sm hover:bg-secondary-400 transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Donate Food Now</span>
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
        <OrganizationContactSection type="supplier" />

        {/* Impact KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Donations</span>
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {loading ? "..." : summary?.activeDonations || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Available or awaiting pickup</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meals Shared</span>
              <UtensilsCrossed className="h-4 w-4 text-secondary-600" />
            </div>
            <div className="mt-2 text-3xl font-black text-secondary-700">
              {loading ? "..." : summary?.totalServingsDonated || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Estimated servings rescued</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Rescues</span>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {loading ? "..." : summary?.completedDonations || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Delivered to beneficiaries</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shelters Helped</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 text-3xl font-black text-purple-700">
              {loading ? "..." : summary?.beneficiariesHelped || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Distinct homes nourished</div>
          </div>
        </div>

        {/* Main Section: Recent Donations & Safety Advice */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Donations Table */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Food Listings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage live donations, mark food ready, or confirm handover.</p>
              </div>
              <Link
                href="/supplier/donations"
                className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
              >
                <span>View All ({summary?.totalDonations || 0})</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading listings...</div>
              ) : (!summary?.recentDonations || summary.recentDonations.length === 0) ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <Package className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No food listings posted yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Post your surplus dishes to connect with nearby orphanages.</p>
                  <Link
                    href="/donations/create"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-800"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Create First Donation</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.recentDonations.map((d) => (
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
                          <span>{d.foodCategory}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">{d.dietaryType}</span>
                          <span>•</span>
                          <span>{d.estimatedServings} servings</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="h-3 w-3" />
                            Until {new Date(d.pickupAvailableUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/supplier/donations"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 self-end sm:self-center"
                      >
                        <span>Manage Status</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Same-Day Rescue Guidelines & Community Box */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Section 16: Food Safety Pledge</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-950/80 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Food must be prepared in a hygienic, licensed kitchen environment.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Cooked meals must remain stored safely at temperature (&gt;60°C or &lt;5°C) until collection.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Handover must take place before the designated Consume-Before timestamp.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Links</h4>
              </div>
              <div className="mt-3 space-y-2 text-xs font-semibold">
                <Link
                  href="/supplier/donations"
                  className="flex items-center justify-between rounded-lg p-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>My Donation Inventory</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/organizations"
                  className="flex items-center justify-between rounded-lg p-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Explore Partner Directory</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/community"
                  className="flex items-center justify-between rounded-lg p-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Share Story on Community Wall</span>
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

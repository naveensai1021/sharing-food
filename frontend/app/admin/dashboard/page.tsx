"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import apiClient from "@/services/apiClient";
import { 
  Users, 
  Package, 
  UtensilsCrossed, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Heart, 
  AlertCircle, 
  ArrowUpRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  XCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardData {
  totalUsers: number;
  totalSuppliers: number;
  totalBeneficiaries: number;
  pendingSupplierApprovals: number;
  pendingBeneficiaryApprovals: number;
  approvedAccounts: number;
  rejectedAccounts: number;
  suspendedAccounts: number;

  totalDonations: number;
  availableDonations: number;
  reservedDonations: number;
  completedDonations: number;
  cancelledDonations: number;
  expiredDonations: number;
  completedPickups: number;

  totalMealsRescued: number;
  citiesCount: number;

  topSuppliers: Array<{
    rank: number;
    supplierName: string;
    city: string;
    totalDonations: number;
    completedDonations: number;
    mealsSupplied: number;
    completionRate: number;
  }>;

  beneficiaryAnalytics: {
    totalBeneficiaries: number;
    oldAgeHomesCount: number;
    orphanagesCount: number;
    otherCount: number;
    mealsReceived: number;
    pickupsCompleted: number;
  };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await apiClient.get<AdminDashboardData>("/admin/dashboard");
        setData(res.data);
      } catch (err: any) {
        toast.error("Failed to load admin analytics dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-3 text-xs text-slate-500">Aggregating platform metrics...</p>
      </div>
    );
  }

  const totalPending = (data?.pendingSupplierApprovals || 0) + (data?.pendingBeneficiaryApprovals || 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 uppercase tracking-wide">
                Admin Control Room
              </span>
              <span className="text-xs text-slate-400">• Verification & Operational Governance</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Platform Impact & Admin Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live monitoring across food suppliers, care beneficiaries, registration approvals, and completed food rescues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <BarChart3 className="h-4 w-4 text-primary-700" />
              <span>Deep Operational Analytics</span>
            </Link>
            <Link
              href="/admin/users?status=PENDING_APPROVAL"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary-700 text-white hover:bg-primary-800 transition-colors shadow-xs"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Review Approvals ({totalPending})</span>
            </Link>
          </div>
        </div>

        {/* Pending Approval Alert Banner */}
        {totalPending > 0 && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-200 p-2 text-amber-900 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  {totalPending} Registration {totalPending === 1 ? "Application" : "Applications"} Awaiting Administrator Review
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  {data?.pendingSupplierApprovals || 0} Food Suppliers • {data?.pendingBeneficiaryApprovals || 0} Beneficiaries waiting for verification. Unapproved accounts cannot perform operational actions.
                </p>
              </div>
            </div>
            <Link
              href="/admin/users?status=PENDING_APPROVAL"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900 shadow-xs transition-colors shrink-0"
            >
              <span>Process Approvals</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Core Requirement 4: Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Food Suppliers</span>
            <div className="mt-1 text-2xl font-black text-slate-900">{data?.totalSuppliers || 0}</div>
            <div className="mt-1 text-[11px] text-amber-600 font-semibold">{data?.pendingSupplierApprovals || 0} pending review</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Beneficiaries</span>
            <div className="mt-1 text-2xl font-black text-slate-900">{data?.totalBeneficiaries || 0}</div>
            <div className="mt-1 text-[11px] text-amber-600 font-semibold">{data?.pendingBeneficiaryApprovals || 0} pending review</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved Accounts</span>
            <div className="mt-1 text-2xl font-black text-emerald-600">{data?.approvedAccounts || 0}</div>
            <div className="mt-1 text-[11px] text-emerald-700">Fully operational</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rejected Accounts</span>
            <div className="mt-1 text-2xl font-black text-rose-600">{data?.rejectedAccounts || 0}</div>
            <div className="mt-1 text-[11px] text-slate-400">Applications denied</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suspended Accounts</span>
            <div className="mt-1 text-2xl font-black text-red-700">{data?.suspendedAccounts || 0}</div>
            <div className="mt-1 text-[11px] text-red-600">Compliance paused</div>
          </div>
        </div>

        {/* Operational Food Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Food Donations</span>
            <div className="mt-1 text-2xl font-black text-slate-900">{data?.totalDonations || 0}</div>
            <div className="mt-1 text-[11px] text-slate-500">{data?.availableDonations || 0} available now</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Pickups</span>
            <div className="mt-1 text-2xl font-black text-emerald-700">{data?.completedPickups || data?.completedDonations || 0}</div>
            <div className="mt-1 text-[11px] text-emerald-700 font-medium">OTP verified handovers</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Meals Rescued</span>
            <div className="mt-1 text-2xl font-black text-secondary-600">{data?.totalMealsRescued || 0}</div>
            <div className="mt-1 text-[11px] text-slate-400">Warm meals provided</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cities Active</span>
            <div className="mt-1 text-2xl font-black text-indigo-700">{data?.citiesCount || 1}</div>
            <div className="mt-1 text-[11px] text-slate-400">Geographic coverage</div>
          </div>
        </div>

        {/* Bottom Section: Top Suppliers & Beneficiary Sector Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Food Suppliers Leaderboard */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Top Approved Food Donors</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Ranked by meals rescued</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                    <th className="pb-2">Rank</th>
                    <th className="pb-2">Supplier</th>
                    <th className="pb-2">City</th>
                    <th className="pb-2 text-right">Donations</th>
                    <th className="pb-2 text-right">Meals</th>
                    <th className="pb-2 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!data?.topSuppliers || data.topSuppliers.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">No supplier listings yet</td>
                    </tr>
                  ) : (
                    data.topSuppliers.map((s) => (
                      <tr key={s.supplierName} className="hover:bg-slate-50">
                        <td className="py-2.5 font-black text-slate-500">#{s.rank}</td>
                        <td className="py-2.5 font-bold text-slate-900">{s.supplierName}</td>
                        <td className="py-2.5 text-slate-500">{s.city}</td>
                        <td className="py-2.5 text-right font-medium text-slate-700">{s.totalDonations}</td>
                        <td className="py-2.5 text-right font-bold text-secondary-700">{s.mealsSupplied}</td>
                        <td className="py-2.5 text-right font-semibold text-emerald-600">{s.completionRate}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Beneficiary Breakdown */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Beneficiary Sector Distribution & Support</h3>
              <p className="text-[11px] text-slate-400">Care homes receiving meals across categories</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Old-Age Homes</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {data?.beneficiaryAnalytics?.oldAgeHomesCount || 0}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Eldercare homes</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Orphanages</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {data?.beneficiaryAnalytics?.orphanagesCount || 0}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Children care homes</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Community Shelters</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {data?.beneficiaryAnalytics?.otherCount || 0}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Shelters & night care</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pickups Finalized</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {data?.completedPickups || data?.beneficiaryAnalytics?.pickupsCompleted || 0}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Verified OTP handovers</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

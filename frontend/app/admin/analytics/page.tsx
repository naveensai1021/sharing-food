"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Award, 
  ArrowLeft,
  UtensilsCrossed,
  Building2,
  Users,
  CheckCircle2,
  Package,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Heart,
  Activity,
  Layers
} from "lucide-react";
import { toast } from "sonner";

interface AdminAnalyticsData {
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
  totalPickupsCompleted: number;

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

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await apiClient.get<AdminAnalyticsData>("/admin/dashboard");
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load live operational analytics");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-3 text-xs text-slate-500">Querying live transactional telemetry...</p>
      </div>
    );
  }

  const totalDonations = data?.totalDonations || 0;
  const completedDonations = data?.completedDonations || data?.totalPickupsCompleted || 0;
  const totalMeals = data?.totalMealsRescued || 0;
  const efficiencyRate = totalDonations > 0 ? Math.round((completedDonations / totalDonations) * 100) : 0;
  const avgMealsPerPickup = completedDonations > 0 ? Math.round(totalMeals / completedDonations) : 0;
  const activePartners = (data?.totalSuppliers || 0) + (data?.totalBeneficiaries || 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Admin Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 uppercase tracking-wide">
                Live Telemetry
              </span>
              <span className="text-xs text-slate-400">• Database Verified Records</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Deep Operational Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live efficiency ratios, fulfillment pipeline distribution, and care sanctuary allocations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/users?status=PENDING_APPROVAL"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary-700 text-white hover:bg-primary-800 transition-colors shadow-2xs"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Review Pending Accounts</span>
            </Link>
          </div>
        </div>

        {/* Top Operational KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rescue Efficiency</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{efficiencyRate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {completedDonations} of {totalDonations} surplus food batches safely rescued.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Servings / Pickup</span>
              <UtensilsCrossed className="h-5 w-5 text-secondary-600" />
            </div>
            <div className="text-3xl font-black text-secondary-700">{avgMealsPerPickup} meals</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Mean meal volume transferred per completed handover.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Partner Network</span>
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-indigo-700">{activePartners}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {data?.totalSuppliers || 0} Food Suppliers • {data?.totalBeneficiaries || 0} Care Sanctuaries
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Geographic Reach</span>
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-purple-700">{data?.citiesCount || 1} Cities</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Active municipality zones mapped across platform.
            </p>
          </div>
        </div>

        {/* Section 2: Donation Lifecycle Breakdown & Care Community Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Donation Postings Pipeline */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary-700" />
                <h3 className="text-sm font-bold text-slate-900">Food Donation Lifecycle Pipeline</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">{totalDonations} Total Logged</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-emerald-700">Available</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{data?.availableDonations || 0}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ready for pickup</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-amber-700">Reserved</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{data?.reservedDonations || 0}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">En route / OTP</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-blue-700">Completed</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">{completedDonations}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Rescued & eaten</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Expired / Void</span>
                <div className="text-2xl font-black text-slate-400 mt-1">
                  {(data?.cancelledDonations || 0) + (data?.expiredDonations || 0)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Past time limit</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Total Meals Saved:</span>
              <strong className="text-emerald-700 font-bold">{totalMeals.toLocaleString()} Servings</strong>
            </div>
          </div>

          {/* Beneficiary Sector Distribution */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Care Beneficiary Sector Distribution</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {data?.totalBeneficiaries || 0} Active Sanctuaries
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Old-Age Homes</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {data?.beneficiaryAnalytics?.oldAgeHomesCount || 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Elder residents</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Orphanages</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {data?.beneficiaryAnalytics?.orphanagesCount || 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Children care</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Shelters</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {data?.beneficiaryAnalytics?.otherCount || 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Community homes</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Handovers Delivered:</span>
              <strong className="text-primary-700 font-bold">{completedDonations} Verified Handshakes</strong>
            </div>
          </div>

        </div>

        {/* Section 3: Top Approved Food Donors Leaderboard */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Top Food Donors by Rescued Volume</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Live operational rank</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Supplier Organization</th>
                  <th className="pb-2">City</th>
                  <th className="pb-2 text-right">Postings</th>
                  <th className="pb-2 text-right">Meals Supplied</th>
                  <th className="pb-2 text-right">Fulfillment Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!data?.topSuppliers || data.topSuppliers.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 italic">No food donor records logged yet</td>
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

      </div>
    </div>
  );
}

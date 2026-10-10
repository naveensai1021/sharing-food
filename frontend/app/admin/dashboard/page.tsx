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
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardData {
  totalUsers: number;
  totalSuppliers: number;
  totalBeneficiaries: number;
  totalVolunteers: number;
  pendingVolunteerVerifications: number;

  totalDonations: number;
  availableDonations: number;
  reservedDonations: number;
  completedDonations: number;
  cancelledDonations: number;
  expiredDonations: number;

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

  topVolunteers: Array<{
    rank: number;
    volunteerName: string;
    volunteerCode: string;
    city: string;
    orgsContacted: number;
    orgsOnboarded: number;
    donationsAssisted: number;
    activeDays: number;
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
  const [timeFilter, setTimeFilter] = useState("ALL_TIME");

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
  }, [timeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-3 text-xs text-slate-500">Aggregating platform metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header with Time Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800 uppercase tracking-wide">
                Mission Command
              </span>
              <span className="text-xs text-slate-400">• Read-Only Observer & Verification Authority</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Platform Impact & Operations Overview</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live monitoring across food suppliers, shelter beneficiaries, and active volunteer networks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-primary-500 focus:outline-none"
            >
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="LAST_3_MONTHS">Last 3 Months</option>
              <option value="THIS_YEAR">This Year</option>
              <option value="ALL_TIME">All Time</option>
            </select>
          </div>
        </div>

        {/* Section 53 Volunteer Review Alert if pending */}
        {(data?.pendingVolunteerVerifications || 0) > 0 && (
          <div className="my-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-200 p-2 text-amber-900">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  {data?.pendingVolunteerVerifications} Volunteer {data?.pendingVolunteerVerifications === 1 ? "Verification" : "Verifications"} Awaiting Review
                </h4>
                <p className="text-[11px] text-amber-800">
                  Volunteers cannot onboard partner organizations until government ID documents are verified.
                </p>
              </div>
            </div>
            <Link
              href="/admin/volunteers"
              className="rounded-xl bg-amber-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-900 shadow-2xs transition-colors"
            >
              Review Queue
            </Link>
          </div>
        )}

        {/* Top-Level KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 my-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="mt-1 text-2xl font-black text-slate-900">{data?.totalUsers || 0}</div>
            <div className="mt-1 text-[10px] text-slate-400">{data?.totalSuppliers} donors • {data?.totalBeneficiaries} homes</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meals Rescued</span>
            <div className="mt-1 text-2xl font-black text-secondary-600">{data?.totalMealsRescued || 0}</div>
            <div className="mt-1 text-[10px] text-slate-400">Total servings delivered</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Donations Listed</span>
            <div className="mt-1 text-2xl font-black text-slate-900">{data?.totalDonations || 0}</div>
            <div className="mt-1 text-[10px] text-slate-400">{data?.completedDonations} completed</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Now</span>
            <div className="mt-1 text-2xl font-black text-emerald-600">{data?.availableDonations || 0}</div>
            <div className="mt-1 text-[10px] text-slate-400">{data?.reservedDonations} currently reserved</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Volunteers</span>
            <div className="mt-1 text-2xl font-black text-purple-700">{data?.totalVolunteers || 0}</div>
            <div className="mt-1 text-[10px] text-slate-400">{data?.pendingVolunteerVerifications} pending review</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cities Covered</span>
            <div className="mt-1 text-2xl font-black text-indigo-700">{data?.citiesCount || 1}</div>
            <div className="mt-1 text-[10px] text-slate-400">Geographic footprint</div>
          </div>
        </div>

        {/* Leaderboards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
          
          {/* Top Food Suppliers Leaderboard */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Top Food Supplier Partners</h3>
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

          {/* Top Volunteers Leaderboard */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Top Verified Volunteers</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Ranked by org onboarding</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                    <th className="pb-2">Rank</th>
                    <th className="pb-2">Volunteer</th>
                    <th className="pb-2">ID</th>
                    <th className="pb-2 text-right">Contacted</th>
                    <th className="pb-2 text-right">Onboarded</th>
                    <th className="pb-2 text-right">Assisted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!data?.topVolunteers || data.topVolunteers.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">No verified volunteers yet</td>
                    </tr>
                  ) : (
                    data.topVolunteers.map((v) => (
                      <tr key={v.volunteerCode} className="hover:bg-slate-50">
                        <td className="py-2.5 font-black text-slate-500">#{v.rank}</td>
                        <td className="py-2.5 font-bold text-slate-900">{v.volunteerName}</td>
                        <td className="py-2.5 font-mono text-[11px] text-purple-700 font-bold">{v.volunteerCode}</td>
                        <td className="py-2.5 text-right font-medium text-slate-700">{v.orgsContacted}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700">{v.orgsOnboarded}</td>
                        <td className="py-2.5 text-right font-semibold text-blue-600">{v.donationsAssisted}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Beneficiary Sector Breakdown */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs my-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Beneficiary Sector Distribution & Impact</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Old-Age Homes</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {data?.beneficiaryAnalytics?.oldAgeHomesCount || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Elder care shelters</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Orphanages</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {data?.beneficiaryAnalytics?.orphanagesCount || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Child shelters</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Community Centers</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {data?.beneficiaryAnalytics?.otherCount || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Emergency food points</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Pickups Finalized</span>
              <div className="text-xl font-black text-emerald-700 mt-1">
                {data?.beneficiaryAnalytics?.pickupsCompleted || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zero-food-waste handovers</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

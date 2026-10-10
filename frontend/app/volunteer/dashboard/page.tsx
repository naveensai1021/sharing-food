"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import apiClient from "@/services/apiClient";
import { 
  ShieldCheck, 
  Clock, 
  Building2, 
  Award, 
  Calendar, 
  Plus, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight,
  TrendingUp,
  MapPin,
  HeartHandshake
} from "lucide-react";
import { toast } from "sonner";

interface VolunteerDashboardData {
  volunteerCode?: string;
  verificationStatus: string;
  rejectionReason?: string;
  organizationsContactedCount: number;
  organizationsOnboardedCount: number;
  donationsAssistedCount: number;
  activitiesCompletedCount: number;
  totalHoursSpent: number;
  activeDaysCount: number;
  recentLeads: Array<{
    id: string;
    organizationName: string;
    organizationType: string;
    city?: string;
    status: string;
    createdAt: string;
  }>;
  recentActivities: Array<{
    id: string;
    activityType: string;
    description: string;
    hoursSpent: number;
    activityDate: string;
  }>;
}

export default function VolunteerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<VolunteerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await apiClient.get<VolunteerDashboardData>("/volunteer/dashboard");
        setData(res.data);
      } catch (err: any) {
        toast.error("Failed to load volunteer dashboard");
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
        <p className="mt-3 text-sm text-slate-500">Loading your volunteer command center...</p>
      </div>
    );
  }

  const isVerified = data?.verificationStatus === "ACTIVE";
  const isPending = data?.verificationStatus === "PENDING_VERIFICATION";
  const isRejected = data?.verificationStatus === "REJECTED";

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Verification Status Banner (Section 53 Compliance) */}
        {isPending && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-amber-200/60 p-2.5 text-amber-800">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-amber-900">
                  Verification Pending Admin Review
                </h3>
                <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                  Your identity documents and profile photo have been submitted and are currently in queue for review by an App Administrator. Once approved, you will receive your unique Volunteer ID and be fully authorized to onboard partner organizations.
                </p>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-red-200/60 p-2.5 text-red-800">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-900">
                  Verification Resubmission Requested
                </h3>
                <p className="mt-1 text-sm text-red-800">
                  Reason provided by Admin: {data?.rejectionReason || "Uploaded documents were unclear or could not be verified."}
                </p>
                <div className="mt-3">
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-900 underline hover:text-red-950"
                  >
                    <span>Update profile & re-upload documents</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {isVerified && data?.volunteerCode && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-purple-300">
                  <ShieldCheck className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-bold text-emerald-300 tracking-wide uppercase">
                      Active Verified Volunteer
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight mt-1 text-white">
                    {user?.fullName || "Dedicated Volunteer"}
                  </h2>
                  <p className="text-xs text-purple-200 mt-0.5">
                    Authorized to conduct outreach & onboard food partners across all sectors.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center sm:text-right">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                  Your Unique Volunteer ID
                </div>
                <div className="text-2xl font-black tracking-widest text-amber-300 mt-0.5 font-mono">
                  {data.volunteerCode}
                </div>
                <div className="text-[10px] text-purple-300 mt-1">
                  Share during supplier & beneficiary registrations to receive attribution
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Volunteer Operations Hub</h1>
            <p className="text-xs text-slate-500">Track outreach leads, logged community hours, and real-world hunger relief impact.</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/volunteer/leads"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Building2 className="h-4 w-4 text-primary-600" />
              <span>Manage Leads</span>
            </Link>
            <Link
              href="/volunteer/activities"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Log Activity</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacted</span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {data?.organizationsContactedCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Organizations engaged</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Onboarded</span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700">
              {data?.organizationsOnboardedCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Attributed partners</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assisted</span>
              <HeartHandshake className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {data?.donationsAssistedCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Donations facilitated</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hours</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {data?.totalHoursSpent ? Number(data.totalHoursSpent).toFixed(1) : "0.0"}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Hours dedicated</div>
          </div>

          <div className="col-span-2 lg:col-span-1 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Days</span>
              <Calendar className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-indigo-700">
              {data?.activeDaysCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Days with logged deeds</div>
          </div>
        </div>

        {/* Two-Column Section: Leads & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Organization Outreach Leads */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Organization Leads</h3>
              </div>
              <Link
                href="/volunteer/leads"
                className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {(!data?.recentLeads || data.recentLeads.length === 0) ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No organization leads created yet. Start outreach by registering new partner prospects!
                </div>
              ) : (
                data.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{lead.organizationName}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-600">{lead.organizationType}</span>
                        {lead.city && <span>• {lead.city}</span>}
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      lead.status === "ONBOARDED"
                        ? "bg-emerald-100 text-emerald-800"
                        : lead.status === "INTERESTED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Volunteer Activities */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Service Activities</h3>
              </div>
              <Link
                href="/volunteer/activities"
                className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {(!data?.recentActivities || data.recentActivities.length === 0) ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No service activities logged yet. Log your outreach, food delivery, or home visits!
                </div>
              ) : (
                data.recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{act.activityType}</span>
                        <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                          {act.hoursSpent} hrs
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{act.description}</p>
                    </div>
                    <div className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                      {act.activityDate}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

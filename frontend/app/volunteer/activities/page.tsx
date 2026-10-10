"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import { 
  TrendingUp, 
  Plus, 
  Calendar, 
  Clock, 
  ArrowLeft,
  X,
  Award,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface ActivityItem {
  id: string;
  activityType: string;
  description: string;
  hoursSpent: number;
  activityDate: string;
  createdAt: string;
}

export default function VolunteerActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    activityType: "FOOD_PICKUP_ASSISTANCE",
    description: "",
    hoursSpent: "1.5",
    activityDate: new Date().toISOString().split("T")[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ActivityItem[]>("/volunteer/activities");
      setActivities(res.data);
    } catch (err: any) {
      toast.error("Failed to load volunteer activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error("Activity description is required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient.post<ActivityItem>("/volunteer/activities", {
        activityType: formData.activityType,
        description: formData.description.trim(),
        hoursSpent: parseFloat(formData.hoursSpent) || 1.0,
        activityDate: formData.activityDate
      });

      setActivities([res.data, ...activities]);
      setShowAddModal(false);
      setFormData({
        activityType: "FOOD_PICKUP_ASSISTANCE",
        description: "",
        hoursSpent: "1.5",
        activityDate: new Date().toISOString().split("T")[0]
      });
      toast.success("Volunteer service activity logged!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to log activity");
    } finally {
      setSubmitting(false);
    }
  };

  const totalHours = activities.reduce((acc, a) => acc + (Number(a.hoursSpent) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <Link
              href="/volunteer/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Volunteer Hub</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Volunteer Activity Log</h1>
            <p className="text-xs text-slate-500 mt-1">
              Record hours spent assisting pickups, onboarding organizations, and visiting homes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-100 border border-primary-200 px-3.5 py-1.5 text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-primary-800">Total Hours</span>
              <span className="text-lg font-black text-primary-900">{totalHours.toFixed(1)} hrs</span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Log Activity</span>
            </button>
          </div>
        </div>

        {/* Activities Timeline / List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-3 text-xs text-slate-500">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center my-8">
            <TrendingUp className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No activities logged yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Keep a transparent record of all the time you invest in spreading love.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-700 px-4 py-2 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Log First Activity</span>
            </button>
          </div>
        ) : (
          <div className="my-8 space-y-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700 mt-0.5">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{act.activityType}</span>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                        {act.hoursSpent} hours
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 whitespace-nowrap self-end sm:self-center">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{act.activityDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Log Activity Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-primary-700 font-bold">
                  <TrendingUp className="h-5 w-5" />
                  <span>Log Volunteer Activity</span>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateActivity} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Category *</label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                  >
                    <option value="FOOD_PICKUP_ASSISTANCE">Food Pickup & Transport Assistance</option>
                    <option value="COMMUNITY_OUTREACH">Organization Outreach / Awareness</option>
                    <option value="BENEFICIARY_VISIT">Beneficiary Home Visit & Need Assessment</option>
                    <option value="DISTRIBUTION_SUPPORT">Meal Distribution & Packaging Support</option>
                    <option value="FOOD_SAFETY_CHECK">Food Quality & Temperature Check</option>
                    <option value="OTHER">Other Community Deed</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hours Spent *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      required
                      value={formData.hoursSpent}
                      onChange={(e) => setFormData({ ...formData, hoursSpent: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.activityDate}
                      onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the activity, e.g. Assisted Anandham Home with collecting 50 meal trays from Grand Palace Caterers..."
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-primary-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-800 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Log Activity"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

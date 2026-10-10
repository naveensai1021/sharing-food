"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Flag, 
  ShieldCheck, 
  MessageSquare,
  X
} from "lucide-react";
import { toast } from "sonner";

interface AdminReportItem {
  id: string;
  reporterName?: string;
  reporterEmail?: string;
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal
  const [selectedReport, setSelectedReport] = useState<AdminReportItem | null>(null);
  const [actionType, setActionType] = useState<"RESOLVE" | "DISMISS">("RESOLVE");
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<AdminReportItem[]>("/admin/reports");
      setReports(res.data);
    } catch (err: any) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolveOrDismiss = async () => {
    if (!selectedReport) return;

    try {
      setSubmitting(true);
      const endpoint = actionType === "RESOLVE" 
        ? `/admin/reports/${selectedReport.id}/resolve`
        : `/admin/reports/${selectedReport.id}/dismiss`;

      const res = await apiClient.patch<AdminReportItem>(endpoint, {
        notes: adminNotes.trim() || undefined
      });

      setReports(reports.map(r => r.id === selectedReport.id ? res.data : r));
      toast.success(actionType === "RESOLVE" ? "Report marked as resolved" : "Report dismissed");
      setSelectedReport(null);
      setAdminNotes("");
    } catch (err: any) {
      toast.error("Failed to update report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
                Community Moderation
              </span>
              <span className="text-xs text-slate-400">• Misuse & Content Integrity</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Reported Content & Misuse Cases</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review flagged stories, inappropriate comments, and partner conduct grievances.
            </p>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 shadow-2xs text-xs font-semibold text-slate-700">
            Total Reports: <span className="font-bold text-primary-700">{reports.length}</span>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-3 text-xs text-slate-500">Loading reports queue...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="my-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Reports Filed</h3>
            <p className="text-xs text-slate-500 mt-1">The community is clean and in full compliance.</p>
          </div>
        ) : (
          <div className="my-8 space-y-4">
            {reports.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-2.5 mt-0.5 ${
                    r.status === "OPEN"
                      ? "bg-amber-100 text-amber-800"
                      : r.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    <Flag className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                        {r.targetType}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{r.reason}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        r.status === "OPEN"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    {r.description && (
                      <p className="text-xs text-slate-700 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        "{r.description}"
                      </p>
                    )}

                    {r.adminNotes && (
                      <p className="text-xs text-slate-500 mt-2 italic">
                        <strong>Admin Notes:</strong> {r.adminNotes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span>Reported by: {r.reporterName || r.reporterEmail}</span>
                      <span>•</span>
                      <span>Target ID: <span className="font-mono">{r.targetId.substring(0, 8)}...</span></span>
                      <span>•</span>
                      <span>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {r.status === "OPEN" && (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setSelectedReport(r);
                        setActionType("DISMISS");
                        setAdminNotes("");
                      }}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReport(r);
                        setActionType("RESOLVE");
                        setAdminNotes("");
                      }}
                      className="rounded-xl bg-primary-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary-800 shadow-2xs"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span>{actionType === "RESOLVE" ? "Resolve Report" : "Dismiss Report"}</span>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600">
                  Provide notes detailing the administrative action taken for report regarding <strong>{selectedReport.reason}</strong>.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Notes</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Warning issued to user, post removed, or confirmed food safety standards adhered..."
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResolveOrDismiss}
                  disabled={submitting}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white ${
                    actionType === "RESOLVE" ? "bg-primary-700 hover:bg-primary-800" : "bg-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {submitting ? "Saving..." : actionType === "RESOLVE" ? "Confirm Resolution" : "Confirm Dismissal"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

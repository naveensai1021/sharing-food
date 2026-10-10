"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  FileText, 
  ExternalLink, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle,
  Clock,
  X
} from "lucide-react";
import { toast } from "sonner";

interface PendingVolunteer {
  profileId: string;
  userId: string;
  fullName?: string;
  email: string;
  phone?: string;
  city?: string;
  idProofType?: string;
  idProofNumber?: string;
  idProofDocumentUrl?: string;
  profilePhotoUrl?: string;
  serviceArea?: string;
  interests?: string;
  verificationStatus: string;
  createdAt: string;
}

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<PendingVolunteer[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection Modal
  const [rejectingVolunteer, setRejectingVolunteer] = useState<PendingVolunteer | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<PendingVolunteer[]>("/admin/volunteers/pending");
      setVolunteers(res.data);
    } catch (err: any) {
      toast.error("Failed to load pending volunteer verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (vol: PendingVolunteer) => {
    try {
      setSubmittingAction(true);
      const res = await apiClient.post<any>(`/admin/volunteers/${vol.userId}/approve`);
      toast.success(`Volunteer approved! Unique ID generated: ${res.data.volunteerCode}`);
      setVolunteers(volunteers.filter(v => v.userId !== vol.userId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve volunteer");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingVolunteer) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setSubmittingAction(true);
      await apiClient.post(`/admin/volunteers/${rejectingVolunteer.userId}/reject`, {
        reason: rejectReason.trim()
      });
      toast.success("Volunteer verification rejected. User notified to resubmit.");
      setVolunteers(volunteers.filter(v => v.userId !== rejectingVolunteer.userId));
      setRejectingVolunteer(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error("Failed to reject volunteer");
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800 uppercase tracking-wide">
                Section 53 Authority
              </span>
              <span className="text-xs text-slate-400">• App Admin Sole Verification Gateway</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Volunteer Identity Verification</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review government ID proofs and photos. Approved volunteers receive an immutable Volunteer ID and authorization to onboard partner organizations.
            </p>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 shadow-2xs text-xs font-semibold text-slate-700">
            Pending Queue: <span className="font-bold text-primary-700">{volunteers.length}</span>
          </div>
        </div>

        {/* Volunteers Verification Cards */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-3 text-xs text-slate-500">Loading pending verifications...</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="my-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Verification Queue is Clear</h3>
            <p className="text-xs text-slate-500 mt-1">
              All submitted volunteer applications have been reviewed and decided.
            </p>
          </div>
        ) : (
          <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {volunteers.map((vol) => (
              <div
                key={vol.userId}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {vol.profilePhotoUrl ? (
                        <img
                          src={vol.profilePhotoUrl}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {vol.fullName || "Volunteer Applicant"}
                        </h3>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          Pending
                        </span>
                      </div>

                      <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>{vol.email}</span>
                        </div>
                        {vol.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <span>{vol.phone}</span>
                          </div>
                        )}
                        {vol.city && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <span>{vol.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Area & Interests */}
                  {(vol.serviceArea || vol.interests) && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs space-y-1 text-slate-700">
                      {vol.serviceArea && (
                        <div>
                          <span className="font-semibold text-slate-900">Service Area:</span> {vol.serviceArea}
                        </div>
                      )}
                      {vol.interests && (
                        <div>
                          <span className="font-semibold text-slate-900">Interests:</span> {vol.interests}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ID Proof Information Box */}
                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Submitted Government ID Proof
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {vol.idProofType || "Government ID"}: <span className="font-mono text-slate-900">{vol.idProofNumber || "ID Document"}</span>
                      </span>

                      {vol.idProofDocumentUrl ? (
                        <a
                          href={vol.idProofDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-primary-700 hover:underline bg-primary-50 px-2.5 py-1 rounded-lg"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Inspect Document</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Document attached locally</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Decision Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => setRejectingVolunteer(vol)}
                    disabled={submittingAction}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(vol)}
                    disabled={submittingAction}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 shadow-sm transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Approve & Issue ID</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                  <AlertCircle className="h-5 w-5" />
                  <span>Reject Volunteer Application</span>
                </div>
                <button
                  onClick={() => setRejectingVolunteer(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600">
                  Please specify the reason for rejection for <strong>{rejectingVolunteer.fullName || rejectingVolunteer.email}</strong>. This explanation will be provided in their in-app notification.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rejection *</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none mb-2"
                  >
                    <option value="">Select standard reason...</option>
                    <option value="ID proof document is blurry or unreadable.">ID proof document is blurry or unreadable</option>
                    <option value="ID number mismatch with uploaded document.">ID number mismatch with uploaded document</option>
                    <option value="Profile photograph does not meet clarity standards.">Profile photograph does not meet clarity standards</option>
                    <option value="Expired government identification presented.">Expired government identification presented</option>
                    <option value="Other verification discrepancy.">Other verification discrepancy</option>
                  </select>

                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Or type a specific note to the applicant..."
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingVolunteer(null)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submittingAction || !rejectReason.trim()}
                  className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingAction ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

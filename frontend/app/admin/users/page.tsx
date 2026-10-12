"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import apiClient from "@/services/apiClient";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  Trash2, 
  Ban, 
  CheckCircle, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Clock,
  XCircle,
  AlertTriangle,
  ExternalLink,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminUserItem {
  id: string;
  email: string;
  role: string;
  roles?: string[];
  status: string;
  statusReason?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  fullName?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  verificationMethod?: string;
  organizationName?: string;
  organizationType?: string;
  city?: string;
  streetAddress?: string;
  locality?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  publicPhone?: string;
  photoUrl?: string;
  licenseNumber?: string;
  documentUrl?: string;
  residentCount?: number;
  foodCapacityServings?: number;
  dietaryPreferences?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-slate-500">Loading user registry...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Inspection modal
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  // Reject modal state
  const [rejectingUser, setRejectingUser] = useState<AdminUserItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Suspend modal state
  const [suspendingUser, setSuspendingUser] = useState<AdminUserItem | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<AdminUserItem[]>("/admin/users");
      setUsers(res.data);
    } catch (err: any) {
      toast.error("Failed to load user registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setStatusFilter(statusParam);
    }
    fetchUsers();
  }, [searchParams]);

  const handleApprove = async (userId: string) => {
    try {
      setSubmittingAction(true);
      const res = await apiClient.post<AdminUserItem>(`/admin/users/${userId}/approve`);
      setUsers(users.map(u => u.id === userId ? res.data : u));
      if (selectedUser?.id === userId) setSelectedUser(res.data);
      toast.success("User account approved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve user");
    } finally {
      setSubmittingAction(false);
    }
  };

  const submitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingUser) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a mandatory rejection reason.");
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await apiClient.post<AdminUserItem>(`/admin/users/${rejectingUser.id}/reject`, {
        reason: rejectionReason.trim()
      });
      setUsers(users.map(u => u.id === rejectingUser.id ? res.data : u));
      if (selectedUser?.id === rejectingUser.id) setSelectedUser(res.data);
      toast.success("Application rejected and reason recorded.");
      setRejectingUser(null);
      setRejectionReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject user");
    } finally {
      setSubmittingAction(false);
    }
  };

  const submitSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUser) return;
    if (!suspensionReason.trim()) {
      toast.error("Please provide a mandatory suspension reason.");
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await apiClient.post<AdminUserItem>(`/admin/users/${suspendingUser.id}/suspend`, {
        reason: suspensionReason.trim()
      });
      setUsers(users.map(u => u.id === suspendingUser.id ? res.data : u));
      if (selectedUser?.id === suspendingUser.id) setSelectedUser(res.data);
      toast.success("User account suspended and reason recorded.");
      setSuspendingUser(null);
      setSuspensionReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to suspend user");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      setSubmittingAction(true);
      const res = await apiClient.post<AdminUserItem>(`/admin/users/${userId}/reactivate`);
      setUsers(users.map(u => u.id === userId ? res.data : u));
      if (selectedUser?.id === userId) setSelectedUser(res.data);
      toast.success("User account reactivated & restored to approved status!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reactivate user");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
      toast.success("User account removed from platform.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const userRole = u.role || (u.roles && u.roles[0]) || "";
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.organizationName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.licenseNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || userRole === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      u.status === statusFilter ||
      (statusFilter === "PENDING_APPROVAL" && (u.status === "PENDING_ADMIN_APPROVAL" || u.status === "PENDING_APPROVAL" || u.status === "PENDING_VERIFICATION"));

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ROLE_SUPPLIER":
        return <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-secondary-800">Food Supplier</span>;
      case "ROLE_BENEFICIARY":
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-primary-800">Beneficiary</span>;
      case "ROLE_ADMIN":
        return <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800">Administrator</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">{role.replace("ROLE_", "")}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
      case "PENDING_ADMIN_APPROVAL":
      case "PENDING_VERIFICATION":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            <Clock className="h-3 w-3" />
            Pending Approval
          </span>
        );
      case "APPROVED":
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800">
            <AlertTriangle className="h-3 w-3" />
            Suspended
          </span>
        );
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 uppercase tracking-wide">
                User Registry & Approvals
              </span>
              <span className="text-xs text-slate-400">• Role-Based Access & Admin Vetting</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Platform Users & Registration Approvals</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review new Food Supplier & Beneficiary applications, inspect credentials, and manage account statuses.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-slate-400", loading && "animate-spin")} />
            <span>Refresh List</span>
          </button>
        </div>

        {/* Quick Filter Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All Users", value: "ALL" },
            { label: "Pending Approvals", value: "PENDING_APPROVAL" },
            { label: "Approved Accounts", value: "APPROVED" },
            { label: "Rejected Accounts", value: "REJECTED" },
            { label: "Suspended Accounts", value: "SUSPENDED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs",
                statusFilter === tab.value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              {tab.label}
              {tab.value === "PENDING_APPROVAL" && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 font-extrabold text-[10px]">
                  {users.filter(u => u.status === "PENDING_ADMIN_APPROVAL" || u.status === "PENDING_APPROVAL" || u.status === "PENDING_VERIFICATION").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Role Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, organization name, phone, or license number..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-xs focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:border-primary-500 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ROLE_SUPPLIER">Food Suppliers</option>
              <option value="ROLE_BENEFICIARY">Care Beneficiaries</option>
              <option value="ROLE_ADMIN">App Administrators</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">User & Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization & City</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">Loading user accounts...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">No users found matching current filters.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const userRole = u.role || (u.roles && u.roles[0]) || "";
                    const isPending = u.status === "PENDING_APPROVAL" || u.status === "PENDING_VERIFICATION";
                    const isApproved = u.status === "APPROVED" || u.status === "ACTIVE";
                    const isSuspended = u.status === "SUSPENDED";
                    const isRejected = u.status === "REJECTED";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{u.fullName || "Unspecified Contact"}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          {getRoleBadge(userRole)}
                        </td>
                        <td className="py-3.5 px-4">
                          {u.organizationName ? (
                            <div>
                              <div className="font-semibold text-slate-800">{u.organizationName}</div>
                              <div className="text-[10px] text-slate-400">
                                {u.organizationType ? u.organizationType.replace("_", " ") : "Org"} {u.city ? `• ${u.city}` : ""}
                              </div>
                              {u.licenseNumber && (
                                <div className="text-[10px] text-primary-700 font-medium">Lic: {u.licenseNumber}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(u.status)}
                          {u.statusReason && (
                            <p className="text-[10px] text-rose-700 truncate max-w-xs mt-0.5" title={u.statusReason}>
                              Reason: {u.statusReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              title="View Application Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Pending State: Approve or Reject */}
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(u.id)}
                                  disabled={submittingAction}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
                                  title="Approve User Registration"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingUser(u);
                                    setRejectionReason("");
                                  }}
                                  disabled={submittingAction}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                                  title="Reject Registration"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {/* Approved State: Suspend */}
                            {isApproved && userRole !== "ROLE_ADMIN" && (
                              <button
                                onClick={() => {
                                  setSuspendingUser(u);
                                  setSuspensionReason("");
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                                title="Suspend Account"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            )}

                            {/* Suspended or Rejected: Reactivate / Re-approve */}
                            {(isSuspended || isRejected) && (
                              <button
                                onClick={() => handleReactivate(u.id)}
                                disabled={submittingAction}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                                title="Reactivate Account"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Reactivate</span>
                              </button>
                            )}

                            {/* Delete User */}
                            {userRole !== "ROLE_ADMIN" && (
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100"
                                title="Delete User Record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Detailed View Dossier Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Application Review Dossier
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {selectedUser.organizationName || selectedUser.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedUser.role || (selectedUser.roles && selectedUser.roles[0]) || "")}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Reason Banner if present */}
              {selectedUser.statusReason && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900">
                  <strong>Reason Recorded by Admin:</strong> {selectedUser.statusReason}
                  {selectedUser.reviewedAt && (
                    <div className="text-[10px] text-rose-600 mt-1">
                      Reviewed on {new Date(selectedUser.reviewedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase block">Contact Person</span>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{selectedUser.fullName || "Unspecified"}</p>
                  <p className="text-slate-600 mt-0.5">{selectedUser.email}</p>
                  <p className="text-slate-600 mt-0.5">{selectedUser.phone || "No phone"}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase block">Organization Credentials</span>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{selectedUser.organizationName || "None"}</p>
                  <p className="text-slate-600 mt-0.5">Type: {selectedUser.organizationType || "Unspecified"}</p>
                  <p className="text-primary-700 font-semibold mt-0.5">License: {selectedUser.licenseNumber || "None"}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 sm:col-span-2">
                  <span className="font-bold text-slate-500 uppercase block">Premises Address & Location</span>
                  <p className="font-medium text-slate-800 mt-1">
                    {selectedUser.streetAddress || ""}{selectedUser.locality ? `, ${selectedUser.locality}` : ""}, {selectedUser.city || ""}, {selectedUser.state || ""} {selectedUser.postalCode ? `- ${selectedUser.postalCode}` : ""}
                  </p>
                  {selectedUser.latitude && selectedUser.longitude && (
                    <p className="text-slate-500 mt-1 font-mono">
                      GPS: {selectedUser.latitude}, {selectedUser.longitude}
                    </p>
                  )}
                </div>

                {selectedUser.residentCount && (
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 sm:col-span-2">
                    <span className="font-bold text-slate-500 uppercase block">Care Capacity (Beneficiary)</span>
                    <p className="font-medium text-slate-800 mt-1">
                      Residents: <strong>{selectedUser.residentCount}</strong> • Capacity: <strong>{selectedUser.foodCapacityServings || 50} servings</strong>
                    </p>
                    <p className="text-slate-500 mt-0.5">Dietary Notes: {selectedUser.dietaryPreferences || "None"}</p>
                  </div>
                )}
              </div>

              {/* Supporting Document & Premises Photo */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase block">Verification Media & Documents</span>
                <div className="flex flex-wrap items-center gap-3">
                  {selectedUser.documentUrl ? (
                    <a
                      href={selectedUser.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 text-xs font-semibold hover:bg-primary-100 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Uploaded Registration Document</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No document file attached</span>
                  )}
                </div>

                {selectedUser.photoUrl && (
                  <div className="mt-2">
                    <span className="text-[11px] text-slate-500 block mb-1">Premises / Storefront Photo:</span>
                    <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedUser.photoUrl} alt="Premises" className="h-full w-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Action Controls */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {(selectedUser.status === "PENDING_APPROVAL" || selectedUser.status === "PENDING_VERIFICATION") && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedUser.id)}
                        disabled={submittingAction}
                        className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-2xs"
                      >
                        Approve Registration
                      </button>
                      <button
                        onClick={() => {
                          setRejectingUser(selectedUser);
                          setRejectionReason("");
                        }}
                        disabled={submittingAction}
                        className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors"
                      >
                        Reject...
                      </button>
                    </>
                  )}

                  {(selectedUser.status === "APPROVED" || selectedUser.status === "ACTIVE") && (
                    <button
                      onClick={() => {
                        setSuspendingUser(selectedUser);
                        setSuspensionReason("");
                      }}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                      Suspend Account...
                    </button>
                  )}

                  {(selectedUser.status === "SUSPENDED" || selectedUser.status === "REJECTED") && (
                    <button
                      onClick={() => handleReactivate(selectedUser.id)}
                      disabled={submittingAction}
                      className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-2xs"
                    >
                      Reactivate & Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Mandatory Rejection Reason */}
        {rejectingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-rose-600" />
                  Reject Registration Application
                </h3>
                <button
                  onClick={() => setRejectingUser(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Please provide a mandatory reason explaining why the application for <strong>{rejectingUser.organizationName || rejectingUser.fullName}</strong> is being rejected. This reason will be recorded in the audit log and displayed to the user on their Account Status page.
              </p>

              <form onSubmit={submitReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Rejection Reason * (Mandatory)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., FSSAI license number could not be verified; invalid commercial kitchen address coordinates."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingUser(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction || !rejectionReason.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-2xs"
                  >
                    {submittingAction ? "Rejecting..." : "Confirm Rejection"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Mandatory Suspension Reason */}
        {suspendingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Suspend Account
                </h3>
                <button
                  onClick={() => setSuspendingUser(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Please provide a mandatory reason for suspending <strong>{suspendingUser.organizationName || suspendingUser.fullName}</strong>. The user will be blocked from creating donations or reserving meals, and will see this reason on their Account Status page.
              </p>

              <form onSubmit={submitSuspend} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Suspension Reason * (Mandatory)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="e.g., Investigation into reported food quality discrepancy during yesterday's handover."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSuspendingUser(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction || !suspensionReason.trim()}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-2xs"
                  >
                    {submittingAction ? "Suspending..." : "Confirm Suspension"}
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

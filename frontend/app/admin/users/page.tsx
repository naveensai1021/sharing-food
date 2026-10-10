"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Filter,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface AdminUserItem {
  id: string;
  email: string;
  role: string;
  status: string;
  fullName?: string;
  phone?: string;
  organizationName?: string;
  organizationType?: string;
  city?: string;
  volunteerCode?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
    fetchUsers();
  }, []);

  const handleSuspend = async (userId: string) => {
    if (!confirm("Are you sure you want to suspend this user? They will not be able to log in.")) return;
    try {
      const res = await apiClient.post<AdminUserItem>(`/admin/users/${userId}/suspend`, {
        reason: "Admin administrative suspension"
      });
      setUsers(users.map(u => u.id === userId ? res.data : u));
      toast.success("User account suspended");
    } catch (err: any) {
      toast.error("Failed to suspend user");
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      const res = await apiClient.post<AdminUserItem>(`/admin/users/${userId}/reactivate`);
      setUsers(users.map(u => u.id === userId ? res.data : u));
      toast.success("User account reactivated");
    } catch (err: any) {
      toast.error("Failed to reactivate user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user account?")) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success("User account deleted");
    } catch (err: any) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.organizationName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.volunteerCode || "").toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ROLE_SUPPLIER":
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">Supplier</span>;
      case "ROLE_BENEFICIARY":
        return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">Beneficiary</span>;
      case "ROLE_VOLUNTEER":
        return <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800">Volunteer</span>;
      case "ROLE_ADMIN":
        return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">Admin</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">{role}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800 uppercase tracking-wide">
                User Registry
              </span>
              <span className="text-xs text-slate-400">• Role-Based Access & Integrity Enforcement</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Platform Users & Access Control</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect user accounts, organizations, verification identifiers, and suspend abusive users.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Refresh List</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, org, or volunteer ID..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-primary-500 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ROLE_SUPPLIER">Food Suppliers</option>
              <option value="ROLE_BENEFICIARY">Beneficiaries</option>
              <option value="ROLE_VOLUNTEER">Volunteers</option>
              <option value="ROLE_ADMIN">App Administrators</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-primary-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization / ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
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
                    <td colSpan={6} className="py-12 text-center text-slate-400">No users found matching filters.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.fullName || "Unspecified Name"}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="py-3 px-4">
                        {u.organizationName ? (
                          <div>
                            <div className="font-semibold text-slate-800">{u.organizationName}</div>
                            <div className="text-[10px] text-slate-400">{u.organizationType} {u.city && `• ${u.city}`}</div>
                          </div>
                        ) : u.volunteerCode ? (
                          <div className="font-mono text-purple-700 font-bold">{u.volunteerCode}</div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.status === "ACTIVE" ? (
                            <button
                              onClick={() => handleSuspend(u.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                              title="Suspend User"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(u.id)}
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                              title="Reactivate User"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
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

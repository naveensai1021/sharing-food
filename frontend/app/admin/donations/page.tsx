"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { 
  Package, 
  Search, 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface AdminDonationItem {
  id: string;
  title: string;
  foodCategory: string;
  dietaryType: string;
  estimatedServings: number;
  status: string;
  supplierOrganizationName?: string;
  beneficiaryOrganizationName?: string;
  pickupAvailableUntil: string;
  createdAt: string;
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<AdminDonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>("/donations/nearby?radiusKm=500");
      setDonations(res.data);
    } catch (err: any) {
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
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
      case "EXPIRED":
        return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">Expired</span>;
      case "CANCELLED":
        return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">Cancelled</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{status}</span>;
    }
  };

  const filtered = donations.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.supplierOrganizationName || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.foodCategory || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800 uppercase tracking-wide">
                Food Logistics
              </span>
              <span className="text-xs text-slate-400">• Real-Time Redistribution Oversight</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Platform Donation Registry</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status tracking across all surplus meals, safety declarations, and partner handovers.
            </p>
          </div>

          <button
            onClick={fetchDonations}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by food title, supplier, or category..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-primary-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="RESERVED">RESERVED</option>
              <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
              <option value="PICKUP_IN_PROGRESS">PICKUP_IN_PROGRESS</option>
              <option value="COLLECTED">COLLECTED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Donation</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Servings</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pickup Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">Loading platform donations...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">No donations matching filters.</td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{d.title}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {d.supplierOrganizationName || "Verified Donor"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {d.foodCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-secondary-700">
                        {d.estimatedServings} meals
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(d.status)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(d.pickupAvailableUntil).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
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

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Filter,
  X
} from "lucide-react";
import { toast } from "sonner";

interface LeadItem {
  id: string;
  organizationName: string;
  organizationType: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function VolunteerLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "RESTAURANT",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<LeadItem[]>("/volunteer/leads");
      setLeads(res.data);
    } catch (err: any) {
      toast.error("Failed to load organization leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName.trim()) {
      toast.error("Organization name is required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient.post<LeadItem>("/volunteer/leads", formData);
      setLeads([res.data, ...leads]);
      setShowAddModal(false);
      setFormData({
        organizationName: "",
        organizationType: "RESTAURANT",
        contactName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        notes: ""
      });
      toast.success("Organization outreach lead added!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const res = await apiClient.patch<LeadItem>(`/volunteer/leads/${leadId}/status`, {
        status: newStatus
      });
      setLeads(leads.map(l => l.id === leadId ? res.data : l));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const filteredLeads = leads.filter(l => {
    if (filter === "ALL") return true;
    return l.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
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
            <h1 className="text-2xl font-bold text-slate-900">Organization Outreach Pipeline</h1>
            <p className="text-xs text-slate-500 mt-1">
              Engage local food businesses, old-age homes, and orphanages to join the platform.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Organization Lead</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 my-6">
          {["ALL", "NEW", "CONTACTED", "INTERESTED", "ONBOARDED", "NOT_INTERESTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                filter === status
                  ? "bg-primary-700 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Leads Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-3 text-xs text-slate-500">Loading your leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No leads found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Start by adding food suppliers or beneficiaries you have contacted.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-700 px-4 py-2 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Lead</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                        {lead.organizationType}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{lead.organizationName}</h3>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      lead.status === "ONBOARDED"
                        ? "bg-emerald-100 text-emerald-800"
                        : lead.status === "INTERESTED"
                        ? "bg-blue-100 text-blue-800"
                        : lead.status === "CONTACTED"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    {lead.contactName && (
                      <div className="font-semibold text-slate-800">Contact: {lead.contactName}</div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {(lead.address || lead.city) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{[lead.address, lead.city].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {lead.notes && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 italic">
                      "{lead.notes}"
                    </div>
                  )}
                </div>

                {/* Status Switcher Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Update stage:</span>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:border-primary-500 focus:outline-none"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="INTERESTED">INTERESTED</option>
                    <option value="ONBOARDED">ONBOARDED</option>
                    <option value="NOT_INTERESTED">NOT_INTERESTED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Lead Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-primary-700 font-bold">
                  <Building2 className="h-5 w-5" />
                  <span>Add Organization Lead</span>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    placeholder="e.g. Royal Spice Caterers or Hope Orphanage"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                    <select
                      value={formData.organizationType}
                      onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                    >
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="CATERER">Caterer</option>
                      <option value="HOTEL">Hotel</option>
                      <option value="BAKERY">Bakery</option>
                      <option value="OLD_AGE_HOME">Old-Age Home</option>
                      <option value="ORPHANAGE">Orphanage</option>
                      <option value="COMMUNITY_SHELTER">Community Shelter</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Manager or Warden name"
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@org.com"
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Bangalore"
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street / Area"
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Outreach Progress</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Discussed lunch surplus with head chef, follow up on Tuesday..."
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
                    {submitting ? "Saving..." : "Save Lead"}
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

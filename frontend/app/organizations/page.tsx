"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { apiFetch } from "@/services/apiClient";
import { OrganizationDirectoryItem } from "@/types";
import { 
  Building2, 
  Search, 
  MapPin, 
  Home, 
  Loader2, 
  Sparkles,
  Lock,
  Phone,
  PhoneOff,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OrganizationDirectoryPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "SUPPLIER" | "BENEFICIARY">("ALL");

  // Unauthenticated users cannot see supplier data — force to BENEFICIARY view
  const canViewSuppliers = !!user;

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      let query = "/api/organizations/directory";
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (cityFilter !== "ALL") params.append("city", cityFilter);

      const qs = params.toString();
      if (qs) query += `?${qs}`;

      const data = await apiFetch<OrganizationDirectoryItem[]>(query);
      setOrganizations(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [cityFilter]);

  // Reset to beneficiary-only view when user logs out
  useEffect(() => {
    if (!canViewSuppliers && typeFilter === "SUPPLIER") {
      setTypeFilter("ALL");
    }
  }, [canViewSuppliers, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDirectory();
  };

  const SUPPLIER_TYPES = ["RESTAURANT", "BAKERY", "CATERER", "CORPORATE_CAFETERIA"];
  const BENEFICIARY_TYPES = ["OLD_AGE_HOME", "ORPHANAGE", "COMMUNITY_SHELTER"];

  // For unauthenticated users: filter out all supplier-type organizations
  const visibleOrgs = canViewSuppliers
    ? organizations
    : organizations.filter((org) => BENEFICIARY_TYPES.includes(org.type));

  const filteredOrgs = visibleOrgs.filter((org) => {
    if (typeFilter === "SUPPLIER") {
      return SUPPLIER_TYPES.includes(org.type);
    }
    if (typeFilter === "BENEFICIARY") {
      return BENEFICIARY_TYPES.includes(org.type);
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100/70 px-3.5 py-1 text-xs font-semibold text-primary-800 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Verified Community Directory (Section 53)</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Organization Directory
        </h1>
        <p className="mt-2 text-slate-600 text-sm sm:text-base">
          Discover verified care homes and certified food suppliers committed to zero hunger.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 mb-8 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by restaurant, shelter or care home name..."
              className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="ALL">All Cities</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Secunderabad">Secunderabad</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-primary-700 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors",
              typeFilter === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            All Organizations ({visibleOrgs.length})
          </button>
          {canViewSuppliers ? (
            <button
              type="button"
              onClick={() => setTypeFilter("SUPPLIER")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                typeFilter === "SUPPLIER" ? "bg-secondary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Food Suppliers
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed select-none" title="Sign in to view Food Suppliers">
              <Lock className="h-3 w-3" />
              Food Suppliers (Sign In to View)
            </div>
          )}
          <button
            type="button"
            onClick={() => setTypeFilter("BENEFICIARY")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors",
              typeFilter === "BENEFICIARY" ? "bg-primary-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Beneficiaries (Elders &amp; Children Homes)
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No organizations found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search criteria or select &quot;All Cities&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => {
            const isBeneficiaryType = BENEFICIARY_TYPES.includes(org.type);
            const photoSrc = org.photoUrl || org.logoUrl;
            const fullLocation = org.locality ? `${org.locality}, ${org.city}` : org.city;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${org.latitude},${org.longitude}`;
            const rawPhone = org.publicPhone || org.contactPhone;
            const hasPhone = org.showPublicPhone !== false && org.showContactPhone !== false && Boolean(rawPhone && rawPhone.trim());
            const phoneDisplay = rawPhone?.trim() || "";

            return (
              <div
                key={org.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Organization Photo Banner (Requirement 2 & 5) */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt={org.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 text-slate-400">
                      {isBeneficiaryType ? <Home className="h-12 w-12 text-emerald-600/40" /> : <Building2 className="h-12 w-12 text-amber-600/40" />}
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-md",
                        isBeneficiaryType
                          ? "bg-emerald-700/90 text-white"
                          : "bg-amber-600/90 text-white"
                      )}
                    >
                      {org.type.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-xs">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{org.name}</h3>
                    
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{fullLocation || "Hyderabad"}</span>
                    </p>

                    {/* Official Public Contact Number (Requirement 2 & Issue 3) */}
                    {hasPhone ? (
                      <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100/80">
                        <Phone className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" />
                        <span className="text-xs font-bold text-emerald-950">
                          Contact Number: {phoneDisplay}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                        <PhoneOff className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-500">
                          Contact Number Not Available
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-3">
                      {org.description || "Active community organization partnering with Sharing Food, Spreading Love."}
                    </p>
                  </div>

                  {/* Impact Stats */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                      <p className="font-extrabold text-slate-900 text-sm">
                        {org.totalDonationsOrReceived}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        {isBeneficiaryType ? "Pickups" : "Donations"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50/60 p-2 border border-emerald-100">
                      <p className="font-extrabold text-emerald-700 text-sm">
                        {org.estimatedMealsSharedOrReceived.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-800 uppercase font-semibold">
                        Meals {isBeneficiaryType ? "Received" : "Shared"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: "Call Beneficiary / Call Supplier" & "View Location" */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    {hasPhone ? (
                      <a
                        href={`tel:${phoneDisplay}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 transition-colors shadow-xs"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call {isBeneficiaryType ? "Beneficiary" : "Supplier"}</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium py-2.5 px-3 cursor-not-allowed select-none"
                      >
                        <PhoneOff className="h-3.5 w-3.5" />
                        <span>Contact Unavailable</span>
                      </button>
                    )}

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-3 transition-colors"
                      title="View Location on Google Maps"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      <span>View Location</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

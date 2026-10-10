"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { apiFetch } from "@/services/apiClient";
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  ExternalLink, 
  Navigation, 
  Camera, 
  Check, 
  X, 
  Loader2, 
  Upload,
  Globe
} from "lucide-react";
import { toast } from "sonner";

interface OrganizationContactSectionProps {
  type: "supplier" | "beneficiary";
}

export default function OrganizationContactSection({ type }: OrganizationContactSectionProps) {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form State
  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setOrgName(user.organizationName || user.fullName || "");
      setContactPerson(user.contactPerson || user.fullName || "");
      setPhone(user.phone || user.publicPhone || "");
      setStreetAddress(user.streetAddress || "");
      setLocality(user.locality || "");
      setCity(user.city || "");
      setState(user.state || "");
      setPostalCode(user.postalCode || "");
      setPhotoUrl(user.photoUrl || user.avatarUrl || "");
      setLatitude(user.latitude ?? null);
      setLongitude(user.longitude ?? null);
    }
  }, [user]);

  const handleOpenEdit = () => {
    if (user) {
      setOrgName(user.organizationName || user.fullName || "");
      setContactPerson(user.contactPerson || user.fullName || "");
      setPhone(user.phone || user.publicPhone || "");
      setStreetAddress(user.streetAddress || "");
      setLocality(user.locality || "");
      setCity(user.city || "");
      setState(user.state || "");
      setPostalCode(user.postalCode || "");
      setPhotoUrl(user.photoUrl || user.avatarUrl || "");
      setLatitude(user.latitude ?? null);
      setLongitude(user.longitude ?? null);
    }
    setIsEditing(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPhoto(true);
    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      if (data.url) {
        setPhotoUrl(data.url);
        toast.success("Photograph uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(6)));
        toast.success("GPS Location detected!");
      },
      (err) => {
        toast.error("Unable to retrieve location: " + err.message);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          organizationName: orgName,
          contactPerson: contactPerson,
          fullName: contactPerson,
          phone: phone,
          publicPhone: phone,
          streetAddress: streetAddress,
          locality: locality,
          city: city,
          state: state,
          postalCode: postalCode,
          photoUrl: photoUrl,
          latitude: latitude,
          longitude: longitude,
        }),
      });

      await refreshUser();
      setIsEditing(false);
      toast.success("Organization contact details saved permanently!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update contact details");
    } finally {
      setSaving(false);
    }
  };

  const isSupplier = type === "supplier";
  const displayPhone = user?.phone || user?.publicPhone;
  const displayOrgName = user?.organizationName || (isSupplier ? "Food Supplier Organization" : "Beneficiary Organization");
  const displayContactPerson = user?.contactPerson || user?.fullName || "Not Specified";
  const displayEmail = user?.email || "Not Provided";
  
  const fullAddress = [
    user?.streetAddress,
    user?.locality,
    user?.city,
    user?.state,
    user?.postalCode ? `- ${user.postalCode}` : null
  ].filter(Boolean).join(", ");

  const hasCoords = user?.latitude != null && user?.longitude != null;
  const mapsQuery = hasCoords 
    ? `${user!.latitude},${user!.longitude}` 
    : encodeURIComponent(fullAddress || user?.city || "Hyderabad, India");
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isSupplier ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Organization Contact Details
            </h2>
            <p className="text-xs text-slate-500">
              {isSupplier 
                ? "Official verified contact, storefront photo, and pickup location for food collection." 
                : "Official registered contact, care home details, and delivery location for food claiming."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {displayPhone && (
            <a
              href={`tel:${displayPhone}`}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition ${
                isSupplier ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit3 className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit Contact Details</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storefront / Building Photograph */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner group">
            {user?.photoUrl || user?.avatarUrl ? (
              <img
                src={user?.photoUrl || user?.avatarUrl}
                alt={displayOrgName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <Building2 className="h-10 w-10 text-slate-300 mb-2" />
                <span className="text-xs font-medium">No Photograph Added</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Click Edit Contact Details to upload a storefront photo
                </span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white">
              {isSupplier ? "Storefront Photo" : "Building Photograph"}
            </div>
          </div>
        </div>

        {/* Contact Info (Name, Contact Person, Phone, Email) */}
        <div className="space-y-3 lg:col-span-1">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {isSupplier ? "Restaurant / Supplier Name" : "Beneficiary Organization Name"}
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{displayOrgName}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Authorized Contact Person
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{displayContactPerson}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Registered Mobile Number
            </span>
            {displayPhone ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  {displayPhone}
                </span>
              </div>
            ) : (
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 inline-block font-medium mt-0.5">
                Phone Number Not Added
              </span>
            )}
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Email Address
            </span>
            <p className="text-xs text-slate-700 mt-0.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{displayEmail}</span>
            </p>
          </div>
        </div>

        {/* Address & Google Maps Location */}
        <div className="space-y-3 lg:col-span-1 bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {isSupplier ? "Complete Pickup Address" : "Complete Organization Address"}
            </span>
            <p className="text-xs text-slate-800 font-medium mt-1 leading-relaxed">
              {fullAddress || "Address details not yet added. Please click 'Edit Contact Details' to update."}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Google Maps Location
            </span>
            {hasCoords ? (
              <div className="text-[11px] text-slate-600 font-mono mb-2">
                Coordinates: {user?.latitude?.toFixed(4)}, {user?.longitude?.toFixed(4)}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 mb-2 italic">
                Coordinates: Based on registered address
              </div>
            )}

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Open in Google Maps</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Edit Organization Contact Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isSupplier ? "Restaurant / Supplier Name *" : "Organization Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Authorized Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Storefront / Building Photograph
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0">
                      {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> : <Upload className="h-4 w-4" />}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Address details */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Complete Street Address
                </label>
                <input
                  type="text"
                  placeholder="Street / Door No / Landmark"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Madhapur"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State &amp; PIN Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-1/2 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="PIN"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-1/2 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Coordinates / Map Location */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    Google Maps Coordinates (Latitude &amp; Longitude)
                  </span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Detect Current GPS
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (e.g. 17.3850)"
                    value={latitude !== null ? latitude : ""}
                    onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (e.g. 78.4867)"
                    value={longitude !== null ? longitude : ""}
                    onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Save Contact Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

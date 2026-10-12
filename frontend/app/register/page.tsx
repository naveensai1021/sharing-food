"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { 
  Building2, 
  Home, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Upload,
  Camera,
  FileText,
  MapPin,
  Navigation,
  Phone,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RegisterRole = "SUPPLIER" | "BENEFICIARY";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-700" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const [role, setRole] = useState<RegisterRole>("SUPPLIER");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Common credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"EMAIL" | "SMS">("EMAIL");
  const [city, setCity] = useState("Hyderabad");

  // Organization fields
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("RESTAURANT");
  const [description, setDescription] = useState("");

  // Full Address Details
  const [streetAddress, setStreetAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [state, setState] = useState("Telangana");
  const [postalCode, setPostalCode] = useState("");

  // Location Coordinates
  const [latitude, setLatitude] = useState("17.385044");
  const [longitude, setLongitude] = useState("78.486671");
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Public Contact Preferences
  const [publicPhone, setPublicPhone] = useState("");
  const [showPublicPhone, setShowPublicPhone] = useState(true);

  // License and Supporting Document
  const [licenseNumber, setLicenseNumber] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [docFileName, setDocFileName] = useState("");
  const [docUploading, setDocUploading] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Organization Photograph Upload
  const [orgPhotoUrl, setOrgPhotoUrl] = useState("");
  const [orgPhotoPreview, setOrgPhotoPreview] = useState("");
  const [orgPhotoFileName, setOrgPhotoFileName] = useState("");
  const [orgPhotoUploading, setOrgPhotoUploading] = useState(false);
  const orgPhotoInputRef = useRef<HTMLInputElement>(null);

  // Beneficiary specific
  const [residentCount, setResidentCount] = useState("35");
  const [foodCapacityServings, setFoodCapacityServings] = useState("50");
  const [dietaryPreferences, setDietaryPreferences] = useState("Vegetarian & Mixed Meals");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "BENEFICIARY") {
      setRole("BENEFICIARY");
      setOrganizationType("OLD_AGE_HOME");
    } else {
      setRole("SUPPLIER");
      setOrganizationType("RESTAURANT");
    }
  }, [searchParams]);

  const handleRoleSwitch = (newRole: RegisterRole) => {
    setRole(newRole);
    if (newRole === "SUPPLIER") {
      setOrganizationType("RESTAURANT");
    } else {
      setOrganizationType("OLD_AGE_HOME");
    }
  };

  // Live Location Detection
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser. Please enter coordinates manually.");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);

        // Attempt reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const geoData = await res.json();
            if (geoData.address) {
              if (geoData.address.suburb || geoData.address.neighbourhood || geoData.address.residential) {
                setLocality(geoData.address.suburb || geoData.address.neighbourhood || geoData.address.residential || "");
              }
              if (geoData.address.city || geoData.address.town || geoData.address.county) {
                setCity(geoData.address.city || geoData.address.town || geoData.address.county || city);
              }
              if (geoData.address.state) {
                setState(geoData.address.state);
              }
              if (geoData.address.postcode) {
                setPostalCode(geoData.address.postcode);
              }
              if (geoData.display_name && !streetAddress) {
                setStreetAddress(geoData.display_name.split(",")[0]);
              }
            }
          }
        } catch {
          // Coordinates are saved even if geocoding fails
        }

        toast.success(`Location coordinates detected: ${lat}, ${lng}`);
        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enter address manually.");
        } else {
          toast.error("Unable to determine current location. Please enter manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Upload Organization Photograph
  const handleOrgPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP image formats are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photograph size exceeds 10MB limit.");
      return;
    }

    setOrgPhotoFileName(file.name);
    setOrgPhotoPreview(URL.createObjectURL(file));
    setOrgPhotoUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Failed to upload photograph");
      }
      const data = await res.json();
      setOrgPhotoUrl(data.url);
      toast.success(
        role === "SUPPLIER"
          ? "Storefront photograph uploaded successfully!"
          : "Building photograph uploaded successfully!"
      );
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setOrgPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.info("Photograph attached locally.");
    } finally {
      setOrgPhotoUploading(false);
    }
  };

  // Upload Supporting Verification Document
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Document size exceeds 15MB limit.");
      return;
    }

    setDocFileName(file.name);
    setDocUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setDocumentUrl(data.url);
      toast.success("Supporting verification document uploaded successfully!");
    } catch {
      const reader = new FileReader();
      reader.onload = () => setDocumentUrl(reader.result as string);
      reader.readAsDataURL(file);
      toast.info("Verification document attached locally.");
    } finally {
      setDocUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationName.trim()) {
      toast.error("Please provide your organization name.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please provide the contact person's full name.");
      return;
    }

    if (!streetAddress.trim()) {
      toast.error("Please provide the street address.");
      return;
    }

    if (!licenseNumber.trim()) {
      toast.error(
        role === "SUPPLIER"
          ? "Please provide your FSSAI License or Food Business Registration Number."
          : "Please provide your NGO / Trust / Society Registration Number."
      );
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        email: email.trim().toLowerCase(),
        password,
        role,
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim() || "Hyderabad",
        organizationName: organizationName.trim(),
        organizationType,
        description: description.trim(),
        streetAddress: streetAddress.trim(),
        locality: locality.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        latitude: parseFloat(latitude) || 17.385044,
        longitude: parseFloat(longitude) || 78.486671,
        photoUrl: orgPhotoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        publicPhone: publicPhone.trim() || phone.trim(),
        showPublicPhone,
        licenseNumber: licenseNumber.trim(),
        documentUrl: documentUrl.trim(),
        verificationMethod,
      };

      if (role === "BENEFICIARY") {
        payload.residentCount = parseInt(residentCount) || 30;
        payload.foodCapacityServings = parseInt(foodCapacityServings) || 50;
        payload.dietaryPreferences = dietaryPreferences.trim() || "Nutritious Meals";
      }

      if (verificationMethod === "SMS" && !phone.trim()) {
        toast.error("Please enter a valid phone number for SMS OTP delivery.");
        setLoading(false);
        return;
      }

      await register(payload);

      toast.success("Verification code sent! Please enter the 6-digit OTP to complete registration.");
      router.push(
        `/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}&phone=${encodeURIComponent(phone.trim())}&method=${verificationMethod}`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to complete registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/40 via-white to-orange-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800 mb-3">
            <ShieldCheck className="h-4 w-4 text-primary-700" />
            <span>Verified Community Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Join Sharing Food
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Connect restaurants, commercial kitchens, eldercare homes, and orphanages to save good food and spread love.
          </p>
        </div>

        {/* Mandatory Admin Approval Notice */}
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 sm:p-5 text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-amber-950 block mb-0.5">
                Mandatory Administrator Verification Protocol
              </span>
              <p className="text-amber-900/90 leading-relaxed">
                To guarantee food safety and safeguard children and senior care residents, all new registrations are submitted in <strong>PENDING APPROVAL</strong> status. An administrator verifies licensing credentials and premises details before operational features are enabled.
              </p>
            </div>
          </div>
        </div>

        {/* Role Selector Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm mb-8 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleRoleSwitch("SUPPLIER")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center",
              role === "SUPPLIER"
                ? "border-secondary-500 bg-orange-50/40 shadow-xs"
                : "border-transparent hover:bg-slate-50"
            )}
          >
            <Building2 className={cn("h-7 w-7 mb-2", role === "SUPPLIER" ? "text-secondary-600" : "text-slate-400")} />
            <span className="font-bold text-sm text-slate-900">Food Supplier</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Restaurants, Caterers, Cafeterias</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch("BENEFICIARY")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center",
              role === "BENEFICIARY"
                ? "border-primary-500 bg-emerald-50/40 shadow-xs"
                : "border-transparent hover:bg-slate-50"
            )}
          >
            <Home className={cn("h-7 w-7 mb-2", role === "BENEFICIARY" ? "text-primary-700" : "text-slate-400")} />
            <span className="font-bold text-sm text-slate-900">Care Beneficiary</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Orphanages, Old-Age Homes, Shelters</span>
          </button>
        </div>

        {/* Main Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Organization & Contact Information */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary-700" />
                  {role === "SUPPLIER" ? "Food Business Details" : "Care Center Details"}
                </h3>
                <p className="text-xs text-slate-500">Official registered name and category</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Organization / Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder={role === "SUPPLIER" ? "e.g., Grand Banquet Kitchens" : "e.g., Hope Old Age Home"}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Organization Type *
                  </label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  >
                    {role === "SUPPLIER" ? (
                      <>
                        <option value="RESTAURANT">Restaurant / Dine-In</option>
                        <option value="BAKERY">Bakery & Confectionery</option>
                        <option value="CATERER">Catering / Banquet Hall</option>
                        <option value="CORPORATE_CAFETERIA">Corporate Cafeteria</option>
                        <option value="OTHER">Other Food Facility</option>
                      </>
                    ) : (
                      <>
                        <option value="OLD_AGE_HOME">Old Age Home / Senior Living</option>
                        <option value="ORPHANAGE">Children Orphanage / Home</option>
                        <option value="COMMUNITY_SHELTER">Community Night Shelter</option>
                        <option value="OTHER">Charitable Care Facility</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Contact Person Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Authorized manager or trustee"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Account Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@organization.org"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Account Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* OTP Delivery Method Selector */}
              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-2">
                  Preferred OTP Delivery Method *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVerificationMethod("EMAIL")}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                      verificationMethod === "EMAIL"
                        ? "border-primary-600 bg-primary-50/70 ring-2 ring-primary-600/20 text-slate-900"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", verificationMethod === "EMAIL" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-500")}>
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Email Verification</div>
                      <div className="text-[11px] text-slate-500">6-digit OTP sent to registered email</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationMethod("SMS")}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                      verificationMethod === "SMS"
                        ? "border-primary-600 bg-primary-50/70 ring-2 ring-primary-600/20 text-slate-900"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", verificationMethod === "SMS" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-500")}>
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Mobile SMS</div>
                      <div className="text-[11px] text-slate-500">6-digit SMS OTP sent to mobile number</div>
                    </div>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  A secure 6-digit verification code valid for 5 minutes will be dispatched upon registration.
                </p>
              </div>
            </div>

            {/* Section 2: Address & Location */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary-700" />
                    Premises Address & Geospatial Coordinates
                  </h3>
                  <p className="text-xs text-slate-500">Used for pickup radius calculation</p>
                </div>
                <button
                  type="button"
                  onClick={handleDetectCurrentLocation}
                  disabled={detectingLocation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-primary-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                >
                  <Navigation className={cn("h-3.5 w-3.5", detectingLocation && "animate-spin")} />
                  <span>{detectingLocation ? "Detecting GPS..." : "Auto-Detect GPS"}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Street Address & Building / Door Number *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g., Plot 42, Road No 12, Banjara Hills"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Locality / Area
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="Banjara Hills"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Postal PIN Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="500034"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Beneficiary Capacity (Beneficiary Only) */}
            {role === "BENEFICIARY" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary-700" />
                    Resident Capacity & Dietary Preferences
                  </h3>
                  <p className="text-xs text-slate-500">Helps match appropriately sized surplus batches</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                      Approximate Residents / Inmates *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={residentCount}
                      onChange={(e) => setResidentCount(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                      Max Servings Can Receive Per Batch *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={foodCapacityServings}
                      onChange={(e) => setFoodCapacityServings(e.target.value)}
                      placeholder="e.g. 60"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Dietary Requirements / Meal Types
                  </label>
                  <input
                    type="text"
                    value={dietaryPreferences}
                    onChange={(e) => setDietaryPreferences(e.target.value)}
                    placeholder="e.g. Vegetarian, Soft Diet for Elderly, Mixed Meals"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>
              </div>
            )}

            {/* Section 4: Licensing, Credentials & Verification Documents */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-700" />
                  Registration Credentials & Verification Documents
                </h3>
                <p className="text-xs text-slate-500">Required for administrator review and trust verification</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  {role === "SUPPLIER"
                    ? "FSSAI License / Food Registration Number *"
                    : "NGO / Society / Trust Registration Number *"}
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder={
                    role === "SUPPLIER"
                      ? "e.g. FSSAI 13620011000123"
                      : "e.g. REG-NGO-HYD-2018-492"
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              {/* Supporting Document Attachment */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Upload Supporting Document (Certificate / License Copy / Reg Letter)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocUpload}
                    accept=".pdf,image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    disabled={docUploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <Upload className="h-4 w-4 text-slate-500" />
                    <span>{docUploading ? "Uploading..." : docFileName ? "Replace Document" : "Choose File (PDF/Image)"}</span>
                  </button>
                  {docFileName && (
                    <span className="text-xs text-slate-600 truncate max-w-xs font-medium">
                      ✓ {docFileName}
                    </span>
                  )}
                </div>
              </div>

              {/* Premises Photograph Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  {role === "SUPPLIER" ? "Storefront / Kitchen Photograph" : "Building / Premises Photograph"}
                </label>
                <div className="flex items-start gap-4">
                  <input
                    type="file"
                    ref={orgPhotoInputRef}
                    onChange={handleOrgPhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => orgPhotoInputRef.current?.click()}
                    disabled={orgPhotoUploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <Camera className="h-4 w-4 text-slate-500" />
                    <span>{orgPhotoUploading ? "Uploading Photo..." : orgPhotoFileName ? "Change Photograph" : "Upload Photograph"}</span>
                  </button>

                  {orgPhotoPreview && (
                    <div className="relative h-16 w-24 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={orgPhotoPreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading || orgPhotoUploading || docUploading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-700 py-3.5 px-6 font-bold text-white shadow-md hover:bg-primary-800 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting Application for Review...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Registration for Administrator Review</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-3">
                Already registered?{" "}
                <Link href="/login" className="font-semibold text-primary-700 hover:text-primary-800">
                  Sign in to your account
                </Link>
              </p>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

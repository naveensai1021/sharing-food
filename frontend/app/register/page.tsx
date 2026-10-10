"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { 
  Building2, 
  Home, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Upload,
  Camera,
  FileText,
  Trash2,
  MapPin,
  Navigation,
  Phone,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RegisterRole = "SUPPLIER" | "BENEFICIARY" | "VOLUNTEER";

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

  // Common credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Hyderabad");

  // Organization fields
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("RESTAURANT");
  const [description, setDescription] = useState("");

  // Full Address Details (Requirement 1 & 2)
  const [streetAddress, setStreetAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [state, setState] = useState("Telangana");
  const [postalCode, setPostalCode] = useState("");

  // Location Coordinates (Requirement 4)
  const [latitude, setLatitude] = useState("17.385044");
  const [longitude, setLongitude] = useState("78.486671");
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Beneficiary Public Contact Preferences (Requirement 2)
  const [publicPhone, setPublicPhone] = useState("");
  const [showPublicPhone, setShowPublicPhone] = useState(true);

  // Organization Photograph Upload (Requirement 5)
  const [orgPhotoUrl, setOrgPhotoUrl] = useState("");
  const [orgPhotoPreview, setOrgPhotoPreview] = useState("");
  const [orgPhotoFileName, setOrgPhotoFileName] = useState("");
  const [orgPhotoUploading, setOrgPhotoUploading] = useState(false);
  const orgPhotoInputRef = useRef<HTMLInputElement>(null);

  // Section 53: Mandatory Volunteer Attribution for Supplier & Beneficiary
  const [volunteerIdCode, setVolunteerIdCode] = useState("");
  const [volCheckStatus, setVolCheckStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [volVerifiedName, setVolVerifiedName] = useState<string>("");

  // Beneficiary specific
  const [residentCount, setResidentCount] = useState("");
  const [foodCapacityServings, setFoodCapacityServings] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");

  // Volunteer specific
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [idProofUrl, setIdProofUrl] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [interests, setInterests] = useState("");

  const [volPhotoPreview, setVolPhotoPreview] = useState<string>("");
  const [volPhotoUploading, setVolPhotoUploading] = useState<boolean>(false);
  const [volPhotoFileName, setVolPhotoFileName] = useState<string>("");

  const [idPreview, setIdPreview] = useState<string>("");
  const [idUploading, setIdUploading] = useState<boolean>(false);
  const [idFileName, setIdFileName] = useState<string>("");

  const volPhotoInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "BENEFICIARY") {
      setRole("BENEFICIARY");
      setOrganizationType("OLD_AGE_HOME");
    } else if (r === "VOLUNTEER") {
      setRole("VOLUNTEER");
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
      setCity("");
      setProfilePhotoUrl("");
      setIdProofUrl("");
      setServiceArea("");
      setInterests("");
    }
  }, [searchParams]);

  // Handle volunteer ID live verification
  const checkVolunteerId = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setVolCheckStatus("idle");
      setVolVerifiedName("");
      return;
    }

    setVolCheckStatus("checking");
    try {
      const res = await fetch(`/api/volunteer/validate/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        setVolCheckStatus("invalid");
        setVolVerifiedName("");
        return;
      }
      const data = await res.json();
      if (data.valid) {
        setVolCheckStatus("valid");
        setVolVerifiedName(data.volunteerName || "Verified Volunteer");
      } else {
        setVolCheckStatus("invalid");
        setVolVerifiedName("");
      }
    } catch {
      setVolCheckStatus("idle");
    }
  };

  // Live Location Detection (Requirement 4 - Option A)
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
          // Ignore geocoding errors; coordinates are already set
        }

        toast.success(`Location detected: ${lat}, ${lng}`);
        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enter your address or coordinates manually.");
        } else {
          toast.error("Unable to determine current location. Please enter manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Upload Organization Photograph (Requirement 5)
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

  // Upload Volunteer Profile Photo
  const handleVolPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photo size exceeds 10MB limit.");
      return;
    }

    setVolPhotoFileName(file.name);
    setVolPhotoPreview(URL.createObjectURL(file));
    setVolPhotoUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProfilePhotoUrl(data.url);
      toast.success("Profile photo uploaded successfully!");
    } catch {
      const reader = new FileReader();
      reader.onload = () => setProfilePhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
      toast.info("Profile photo attached locally");
    } finally {
      setVolPhotoUploading(false);
    }
  };

  // Upload Government ID Proof
  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ID document size exceeds 10MB limit.");
      return;
    }

    setIdFileName(file.name);
    if (file.type.startsWith("image/")) {
      setIdPreview(URL.createObjectURL(file));
    } else {
      setIdPreview("pdf");
    }

    setIdUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setIdProofUrl(data.url);
      toast.success("Government ID proof uploaded successfully!");
    } catch {
      const reader = new FileReader();
      reader.onload = () => setIdProofUrl(reader.result as string);
      reader.readAsDataURL(file);
      toast.info("ID proof document attached locally");
    } finally {
      setIdUploading(false);
    }
  };

  const handleRoleSwitch = (newRole: RegisterRole) => {
    setRole(newRole);
    if (newRole === "VOLUNTEER") {
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
      setCity("");
      setProfilePhotoUrl("");
      setIdProofUrl("");
      setVolPhotoPreview("");
      setIdPreview("");
      setVolPhotoFileName("");
      setIdFileName("");
      setServiceArea("");
      setInterests("");
    } else if (newRole === "SUPPLIER") {
      setOrganizationType("RESTAURANT");
    } else {
      setOrganizationType("OLD_AGE_HOME");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mandatory fields for Supplier and Beneficiary
    if (role === "SUPPLIER" || role === "BENEFICIARY") {
      if (!orgPhotoUrl) {
        toast.error(
          role === "SUPPLIER"
            ? "Restaurant/Storefront photograph is mandatory for Food Supplier registration."
            : "Building/Premises photograph is mandatory for Beneficiary registration."
        );
        return;
      }

      if (!streetAddress.trim()) {
        toast.error("Please enter complete street address.");
        return;
      }

      if (!volunteerIdCode.trim()) {
        toast.error("Volunteer ID is mandatory for Food Supplier and Beneficiary registration.");
        return;
      }
      if (volCheckStatus === "invalid") {
        toast.error("Please provide a valid active verified Volunteer ID.");
        return;
      }
    }

    if (role === "VOLUNTEER") {
      if (!profilePhotoUrl) {
        toast.error("Please upload your Profile Photo from your device.");
        return;
      }
      if (!idProofUrl) {
        toast.error("Please upload your Government ID Proof from your device.");
        return;
      }
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
      };

      if (role === "SUPPLIER" || role === "BENEFICIARY") {
        payload.organizationName = organizationName.trim() || `${fullName}'s Organization`;
        payload.organizationType = organizationType;
        payload.description = description;
        payload.streetAddress = streetAddress.trim();
        payload.locality = locality.trim();
        payload.state = state.trim();
        payload.postalCode = postalCode.trim();
        payload.latitude = parseFloat(latitude) || 17.385044;
        payload.longitude = parseFloat(longitude) || 78.486671;
        payload.photoUrl = orgPhotoUrl;
        payload.publicPhone = publicPhone.trim() || phone.trim();
        payload.showPublicPhone = showPublicPhone;
        payload.volunteerIdCode = volunteerIdCode.trim();
      }

      if (role === "BENEFICIARY") {
        payload.residentCount = parseInt(residentCount) || 30;
        payload.foodCapacityServings = parseInt(foodCapacityServings) || 50;
        payload.dietaryPreferences = dietaryPreferences || "Nutritious Meals";
      }

      if (role === "VOLUNTEER") {
        payload.profilePhotoUrl = profilePhotoUrl;
        payload.idProofUrl = idProofUrl;
        payload.serviceArea = serviceArea;
        payload.interests = interests;
      }

      await register(payload);

      toast.success("Registration successful! Welcome to Sharing Food.");
      if (role === "SUPPLIER") {
        router.push("/supplier/dashboard");
      } else if (role === "BENEFICIARY") {
        router.push("/beneficiary/dashboard");
      } else {
        router.push("/volunteer/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Sign Up
        </h1>
        <p className="mt-2 text-slate-600">
          Create your account to get started. Together, we turn surplus food into love.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          type="button"
          onClick={() => handleRoleSwitch("SUPPLIER")}
          className={cn(
            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center",
            role === "SUPPLIER"
              ? "border-secondary-600 bg-secondary-50/50 text-secondary-900 shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          )}
        >
          <Building2 className={cn("h-6 w-6 mb-2", role === "SUPPLIER" ? "text-secondary-600" : "text-slate-400")} />
          <span className="font-bold text-sm">Food Supplier</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline mt-0.5">Restaurant, Caterer, Canteen</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSwitch("BENEFICIARY")}
          className={cn(
            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center",
            role === "BENEFICIARY"
              ? "border-primary-600 bg-primary-50/50 text-primary-900 shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          )}
        >
          <Home className={cn("h-6 w-6 mb-2", role === "BENEFICIARY" ? "text-primary-600" : "text-slate-400")} />
          <span className="font-bold text-sm">Beneficiary</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline mt-0.5">Old-Age Home, Orphanage</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSwitch("VOLUNTEER")}
          className={cn(
            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center",
            role === "VOLUNTEER"
              ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          )}
        >
          <Users className={cn("h-6 w-6 mb-2", role === "VOLUNTEER" ? "text-blue-600" : "text-slate-400")} />
          <span className="font-bold text-sm">Volunteer</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline mt-0.5">Verified Community Champion</span>
        </button>
      </div>

      {/* Registration Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Banner */}
          {role === "VOLUNTEER" ? (
            <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-4 text-sm text-blue-900 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Identity Verification Required (Section 53):</strong>
                <p className="mt-1 text-xs text-blue-800 leading-relaxed">
                  Volunteers undergo identity verification to safeguard children and elderly residents.
                  Upload your photo and government ID proof from your device.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-primary-50/70 border border-primary-200 p-3.5 text-xs text-primary-900 flex gap-2.5 items-center">
              <CheckCircle2 className="h-4 w-4 text-primary-700 shrink-0" />
              <span>
                <strong>Mandatory Verification:</strong> Storefront/premises photo, location coordinates, and email verification are required to activate your food donation account.
              </span>
            </div>
          )}

          {/* Account Credentials */}
          <div className="border-b border-slate-100 pb-5">
            <h3 className="text-base font-bold text-slate-900 mb-4">Account Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Password * (Min 6 Characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
            </div>
          </div>

          {/* Primary Contact Person */}
          <div className="border-b border-slate-100 pb-5">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {role === "VOLUNTEER" ? "Volunteer Profile Details" : "Primary Contact / Owner Details"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Hyderabad"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
            </div>
          </div>

          {/* Organization Details (Supplier & Beneficiary) */}
          {(role === "SUPPLIER" || role === "BENEFICIARY") && (
            <div className="border-b border-slate-100 pb-5 space-y-5">
              <h3 className="text-base font-bold text-slate-900">
                {role === "SUPPLIER" ? "Food Supplier Information" : "Beneficiary Organization Information"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    {role === "SUPPLIER" ? "Restaurant / Business Name *" : "Organization / Home Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder={role === "SUPPLIER" ? "Grand Bawarchi Restaurant" : "Asha Jyothi Old Age Home"}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Organization Type *
                  </label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  >
                    {role === "SUPPLIER" ? (
                      <>
                        <option value="RESTAURANT">Restaurant</option>
                        <option value="BAKERY">Bakery</option>
                        <option value="CATERER">Caterer / Banquet Hall</option>
                        <option value="CORPORATE_CAFETERIA">Corporate Cafeteria</option>
                        <option value="OTHER">Other Food Supplier</option>
                      </>
                    ) : (
                      <>
                        <option value="OLD_AGE_HOME">Old-Age Home</option>
                        <option value="ORPHANAGE">Children&apos;s Home / Orphanage</option>
                        <option value="COMMUNITY_SHELTER">Community Shelter / NGO</option>
                        <option value="OTHER">Other Care Facility</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Requirement 5: Mandatory Location / Storefront Photograph */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase text-slate-800">
                    {role === "SUPPLIER" 
                      ? "Storefront / Restaurant Entrance Photograph * (Mandatory)" 
                      : "Building / Premises Photograph * (Mandatory)"}
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Required for Recognition
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  {role === "SUPPLIER"
                    ? "Upload a clear photo of your restaurant entrance, shop sign, or storefront so beneficiaries can easily find you during pickup."
                    : "Upload a photo of your organization building entrance or signboard. Do not upload photos of vulnerable residents."}
                </p>

                <input
                  type="file"
                  ref={orgPhotoInputRef}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleOrgPhotoUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {orgPhotoPreview ? (
                    <div className="relative h-24 w-32 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm flex-shrink-0 bg-slate-100">
                      <img src={orgPhotoPreview} alt="Organization Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-24 w-32 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                      <Camera className="h-8 w-8 text-slate-300" />
                      <span className="text-[10px] mt-1 font-semibold text-slate-500">Location Photo</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      disabled={orgPhotoUploading}
                      onClick={() => orgPhotoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {orgPhotoUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-emerald-700" />
                          <span>{orgPhotoPreview ? "Change Photograph" : "Upload Photograph from Device"}</span>
                        </>
                      )}
                    </button>

                    {orgPhotoFileName && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="truncate max-w-xs">{orgPhotoFileName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOrgPhotoPreview("");
                            setOrgPhotoUrl("");
                            setOrgPhotoFileName("");
                          }}
                          className="text-red-500 hover:text-red-700 ml-1"
                          title="Remove photograph"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">
                      JPG, PNG, or WebP (Max 10MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirement 1 & 2: Full Address Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Complete Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Shop #12, Road #3, Main Road"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Area / Locality *
                    </label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="Banjara Hills"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Telangana"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="500034"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>

              {/* Requirement 4: Live Location & Google Maps Coordinates */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      Google Maps &amp; Geolocation Coordinates
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Used for calculating proximity and driving directions during food pickups.
                    </p>
                  </div>

                  {/* Option A: Use Current Location */}
                  <button
                    type="button"
                    onClick={handleDetectCurrentLocation}
                    disabled={detectingLocation}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 transition-colors disabled:opacity-50 shadow-xs"
                  >
                    {detectingLocation ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Detecting GPS...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-3.5 w-3.5" />
                        Use My Current Location
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="17.385044"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="78.486671"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>
                </div>

                {/* Interactive Map Visual Preview */}
                <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative h-36">
                  <iframe
                    title="Map Preview"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                    className="opacity-90 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-slate-600 font-mono shadow-xs">
                    Pin: {latitude}, {longitude}
                  </div>
                </div>
              </div>

              {/* Requirement 2: Beneficiary Public Directory Contact Settings */}
              {role === "BENEFICIARY" && (
                <div className="rounded-2xl border border-slate-200 bg-emerald-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-700" />
                    <h4 className="text-xs font-bold uppercase text-emerald-900">
                      Organization Directory Public Contact (Feature 2)
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Donors and public visitors can view this contact number in the verified Organization Directory. Personal representative numbers remain strictly private.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                        Official Public Contact Number
                      </label>
                      <input
                        type="tel"
                        value={publicPhone}
                        onChange={(e) => setPublicPhone(e.target.value)}
                        placeholder={phone || "+91 40 2345 6789"}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="showPublicPhone"
                        checked={showPublicPhone}
                        onChange={(e) => setShowPublicPhone(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="showPublicPhone" className="text-xs font-medium text-slate-700 cursor-pointer">
                        Display official phone in public directory
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Beneficiary Specific Servings & Capacities */}
              {role === "BENEFICIARY" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Approximate Residents *
                    </label>
                    <input
                      type="number"
                      required
                      value={residentCount}
                      onChange={(e) => setResidentCount(e.target.value)}
                      placeholder="40"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Daily Meal Capacity (Servings) *
                    </label>
                    <input
                      type="number"
                      required
                      value={foodCapacityServings}
                      onChange={(e) => setFoodCapacityServings(e.target.value)}
                      placeholder="60"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Public Description / Bio
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    role === "SUPPLIER"
                      ? "Family restaurant serving fresh biryani, meals, and snacks daily. Committed to zero food waste."
                      : "Registered shelter providing nutritious food, care, and shelter to senior citizens."
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              {/* Section 53: Mandatory Volunteer Attribution */}
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-amber-950 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-amber-700" />
                    Volunteer ID / Onboarded by Volunteer * (Mandatory)
                  </label>
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    Required by Policy
                  </span>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed">
                  Every partner organization must be onboarded by an active verified Volunteer. 
                  Enter your onboarding Volunteer ID below.
                </p>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    value={volunteerIdCode}
                    onChange={(e) => {
                      setVolunteerIdCode(e.target.value);
                      checkVolunteerId(e.target.value);
                    }}
                    onBlur={() => checkVolunteerId(volunteerIdCode)}
                    placeholder="e.g. VOL-10001"
                    className="flex-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-sm uppercase tracking-wider font-semibold text-slate-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => checkVolunteerId(volunteerIdCode)}
                    disabled={volCheckStatus === "checking"}
                    className="rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-3 py-2 transition-colors disabled:opacity-50"
                  >
                    {volCheckStatus === "checking" ? "Checking..." : "Verify ID"}
                  </button>
                </div>

                {volCheckStatus === "valid" && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>✓ Verified Active Volunteer: <strong>{volVerifiedName}</strong> ({volunteerIdCode.toUpperCase()})</span>
                  </div>
                )}
                {volCheckStatus === "invalid" && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-100 border border-red-300 px-3 py-2 text-xs font-semibold text-red-900">
                    <AlertCircle className="h-4 w-4 text-red-700 shrink-0" />
                    <span>✗ Invalid Volunteer ID. Must belong to an active verified Volunteer.</span>
                  </div>
                )}

                <div className="pt-2 border-t border-amber-200/80 flex items-center flex-wrap gap-2 text-xs text-amber-800">
                  <span className="font-semibold text-[11px]">Quick test Volunteer IDs:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setVolunteerIdCode("VOL-10001");
                      checkVolunteerId("VOL-10001");
                    }}
                    className="rounded-lg bg-white border border-amber-300 px-2 py-0.5 text-xs font-mono font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    VOL-10001 (Aarav)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVolunteerIdCode("VOL-10002");
                      checkVolunteerId("VOL-10002");
                    }}
                    className="rounded-lg bg-white border border-amber-300 px-2 py-0.5 text-xs font-mono font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    VOL-10002 (Diya)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Volunteer Specific Documents */}
          {role === "VOLUNTEER" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Identity Documents (Upload from Device)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These documents will be securely submitted to App Admin for verification and approval.
                </p>
              </div>

              {/* Upload Profile Photo */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Profile Photo *
                </label>
                
                <input
                  type="file"
                  ref={volPhotoInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleVolPhotoUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {volPhotoPreview ? (
                    <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-primary-500 shadow-xs flex-shrink-0">
                      <img src={volPhotoPreview} alt="Profile Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                      <Camera className="h-6 w-6" />
                      <span className="text-[10px] mt-1 font-medium">Photo</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      disabled={volPhotoUploading}
                      onClick={() => volPhotoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {volPhotoUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-primary-700" />
                          <span>Upload from PC / Device</span>
                        </>
                      )}
                    </button>

                    {volPhotoFileName && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="truncate max-w-xs">{volPhotoFileName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setVolPhotoPreview("");
                            setProfilePhotoUrl("");
                            setVolPhotoFileName("");
                          }}
                          className="text-red-500 hover:text-red-700 ml-1"
                          title="Remove photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">
                      JPG, PNG, or WEBP (Max 10MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Government ID Proof */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Government ID Proof * (Aadhaar / PAN / Voter ID / Passport)
                </label>

                <input
                  type="file"
                  ref={idInputRef}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleIdUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {idPreview ? (
                    idPreview === "pdf" ? (
                      <div className="h-20 w-20 rounded-2xl border-2 border-primary-500 bg-primary-50 flex flex-col items-center justify-center text-primary-800 flex-shrink-0">
                        <FileText className="h-7 w-7 text-primary-700" />
                        <span className="text-[10px] mt-0.5 font-bold uppercase">PDF</span>
                      </div>
                    ) : (
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-primary-500 shadow-xs flex-shrink-0">
                        <img src={idPreview} alt="ID Preview" className="h-full w-full object-cover" />
                      </div>
                    )
                  ) : (
                    <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                      <FileText className="h-6 w-6" />
                      <span className="text-[10px] mt-1 font-medium">Govt ID</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      disabled={idUploading}
                      onClick={() => idInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {idUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-primary-700" />
                          <span>Upload from PC / Device</span>
                        </>
                      )}
                    </button>

                    {idFileName && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="truncate max-w-xs">{idFileName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIdPreview("");
                            setIdProofUrl("");
                            setIdFileName("");
                          }}
                          className="text-red-500 hover:text-red-700 ml-1"
                          title="Remove document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">
                      JPG, PNG, or PDF (Max 10MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Area & Interests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Service Area / Neighborhood
                  </label>
                  <input
                    type="text"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g. Secunderabad"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Volunteering Interests
                  </label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. Weekend pickup coordination"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || (role === "VOLUNTEER" && (volPhotoUploading || idUploading)) || orgPhotoUploading}
              className={cn(
                "w-full py-3.5 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2",
                role === "VOLUNTEER"
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                  : role === "SUPPLIER"
                  ? "bg-secondary-600 hover:bg-secondary-700 shadow-secondary-600/20"
                  : "bg-primary-700 hover:bg-primary-800 shadow-primary-700/20"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>
                    {role === "VOLUNTEER"
                      ? "Create Volunteer Account"
                      : role === "SUPPLIER"
                      ? "Register Food Supplier"
                      : "Register Beneficiary"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-primary-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

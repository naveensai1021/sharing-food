"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/apiClient";
import { DonationDto } from "@/types";
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  List, 
  Map as MapIcon, 
  Loader2, 
  Utensils,
  Eye,
  Navigation,
  Phone,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";

export default function FindFoodPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<DonationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Location and Radius filters (Requirement 4)
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [category, setCategory] = useState<string>("ALL");
  const [dietary, setDietary] = useState<string>("ALL");
  const [lat, setLat] = useState<number>(17.385044);
  const [lng, setLng] = useState<number>(78.486671);
  const [locationName, setLocationName] = useState<string>("Hyderabad");
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Modal states
  const [selectedDonation, setSelectedDonation] = useState<DonationDto | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmAcceptModalOpen, setConfirmAcceptModalOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  // Auth guard: redirect unauthenticated visitors to login
  useEffect(() => {
    if (user === null) {
      router.replace("/login?redirect=/beneficiary/find-food");
    }
  }, [user, router]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationName("Your Current Location");
        setDetectingLocation(false);
        toast.success("Updated location to your current GPS position!");
      },
      (err) => {
        setDetectingLocation(false);
        toast.error("Unable to access current location. Please check location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchNearbyFood = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = `/api/donations/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`;
      if (category !== "ALL") query += `&category=${category}`;
      if (dietary !== "ALL") query += `&dietary=${dietary}`;

      const data = await apiFetch<DonationDto[]>(query);
      setDonations(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load nearby donations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNearbyFood();
    }
  }, [radiusKm, category, dietary, lat, lng, user]);

  const handleRequestFood = (donation: DonationDto) => {
    setSelectedDonation(donation);
    setConfirmAcceptModalOpen(true);
  };

  const confirmRequestAction = async () => {
    if (!selectedDonation) return;
    setAccepting(true);
    try {
      await apiFetch(`/api/donations/${selectedDonation.id}/accept`, {
        method: "POST",
      });
      toast.success("Food request submitted! The food supplier will review and approve your request.");
      setConfirmAcceptModalOpen(false);
      setDetailsModalOpen(false);
      fetchNearbyFood();
    } catch (err: any) {
      if (err.status === 409) {
        toast.error("This donation has already been reserved or requested by another organization.");
      } else {
        toast.error(err.message || "Failed to request donation.");
      }
    } finally {
      setAccepting(false);
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };

  return (
    !user ? (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
      </div>
    ) :
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Authorized Beneficiary Food Radar</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Available Food Donations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse active surplus food pledged by certified restaurants and caterers within your area.
          </p>
        </div>

        {/* View Switcher & GPS button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={detectingLocation}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition disabled:opacity-50"
          >
            {detectingLocation ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            ) : (
              <Navigation className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>Use My GPS Location</span>
          </button>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <List className="h-4 w-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                viewMode === "map" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <MapIcon className="h-4 w-4" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Radius Filters & Category Toolbar (Requirement 4: 10km, 20km, 50km) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-8 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-600">Search Radius:</span>
            <div className="flex items-center gap-1.5">
              {[10, 20, 50].map((radius) => (
                <button
                  key={radius}
                  onClick={() => setRadiusKm(radius)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                    radiusKm === radius
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {radius} km
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>Center: {locationName} ({lat.toFixed(4)}, {lng.toFixed(4)})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Food Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="BIRYANI">Biryani</option>
              <option value="RICE">Rice Dishes</option>
              <option value="CURRY">Curry / Gravy</option>
              <option value="ROTI_BREAD">Roti / Bread</option>
              <option value="SNACKS">Snacks</option>
              <option value="DESSERTS">Desserts</option>
              <option value="FRUITS">Fruits</option>
              <option value="PACKAGED_FOOD">Packaged Food</option>
              <option value="MIXED_MEAL">Mixed Meal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Dietary Preference
            </label>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="ALL">Any Dietary</option>
              <option value="VEGETARIAN">Vegetarian Only</option>
              <option value="NON_VEGETARIAN">Non-Vegetarian</option>
              <option value="VEGAN">Vegan Only</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchNearbyFood}
              className="w-full rounded-xl bg-primary-700 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 transition-colors"
            >
              Update Food Radar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : donations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Utensils className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No active surplus donations within {radiusKm} km</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Try expanding your search radius to 20 or 50 km, or check back soon as restaurants post fresh surplus food.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {radiusKm < 20 && (
              <button
                onClick={() => setRadiusKm(20)}
                className="rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-4 py-2 text-xs font-bold"
              >
                Expand to 20 km
              </button>
            )}
            {radiusKm < 50 && (
              <button
                onClick={() => setRadiusKm(50)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold"
              >
                Expand to 50 km
              </button>
            )}
          </div>
        </div>
      ) : viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              timeRemaining={getTimeRemaining(donation.pickupAvailableUntil)}
              onViewDetails={() => {
                setSelectedDonation(donation);
                setDetailsModalOpen(true);
              }}
              onRequestFood={() => handleRequestFood(donation)}
              isBeneficiary={user?.roles.includes("ROLE_BENEFICIARY") || false}
            />
          ))}
        </div>
      ) : (
        /* Map View (Requirement 4) */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
              <MapIcon className="h-4 w-4 text-emerald-600" />
              Supplier Locations in Map View ({donations.length} Active Donations)
            </span>
            <span className="text-xs text-slate-500 font-mono">Radius: {radiusKm} km</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Embedded Google Map */}
            <div className="lg:col-span-2 relative h-[520px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                title="Google Maps Food Radar"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`}
                className="w-full h-full"
              />
            </div>

            {/* List of suppliers with directions */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase text-slate-500">Nearby Pickup Points</h4>
              {donations.map((d) => {
                const destLat = d.supplierLatitude || d.address?.latitude || lat;
                const destLng = d.supplierLongitude || d.address?.longitude || lng;
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
                const photoSrc = d.supplierPhotoUrl || d.supplierLogoUrl;

                return (
                  <div key={d.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm transition space-y-2">
                    <div className="flex items-center gap-2.5">
                      {photoSrc ? (
                        <img src={photoSrc} alt={d.supplierName} className="h-10 w-10 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{d.title}</p>
                        <p className="text-xs text-slate-500 truncate">{d.supplierName}</p>
                      </div>
                      {d.distanceKm !== undefined && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {d.distanceKm} km
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Navigation className="h-3 w-3" />
                        Directions
                      </a>
                      {d.supplierPhone && (
                        <a
                          href={`tel:${d.supplierPhone}`}
                          className="py-1.5 px-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1"
                          title="Call Supplier"
                        >
                          <Phone className="h-3 w-3 text-emerald-600" />
                          Call
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setSelectedDonation(d);
                          setDetailsModalOpen(true);
                        }}
                        className="py-1.5 px-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Details Dialog (Requirement 1: Storefront Photo, Full Address, Contact Phone, Call Supplier, Get Directions) */}
      {detailsModalOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">Pickup &amp; Food Details</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedDonation.title}</h3>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Food Image */}
            {selectedDonation.images.length > 0 && (
              <img
                src={selectedDonation.images[0].imageUrl}
                alt={selectedDonation.title}
                className="w-full h-44 object-cover rounded-2xl mb-4 border border-slate-100"
              />
            )}

            {/* Requirement 1: Food Supplier Storefront & Contact Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 mb-4 space-y-3">
              <div className="flex items-center gap-3">
                {selectedDonation.supplierPhotoUrl || selectedDonation.supplierLogoUrl ? (
                  <img
                    src={selectedDonation.supplierPhotoUrl || selectedDonation.supplierLogoUrl}
                    alt={selectedDonation.supplierName}
                    className="h-16 w-20 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="h-16 w-20 rounded-xl bg-amber-100 text-amber-700 flex flex-col items-center justify-center font-bold text-xs">
                    <Building2 className="h-6 w-6" />
                    <span className="text-[9px] mt-0.5">Storefront</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Verified Food Supplier
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900 mt-0.5 truncate">
                    {selectedDonation.supplierName}
                  </h4>
                  {selectedDonation.distanceKm !== undefined && (
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      <span>{selectedDonation.distanceKm} km from your location</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Full Pickup Address */}
              <div className="text-xs text-slate-700 pt-2 border-t border-slate-200/80">
                <span className="font-bold text-slate-900 uppercase text-[10px] block mb-0.5">
                  Registered Pickup Address:
                </span>
                <p className="leading-relaxed">
                  {selectedDonation.supplierAddress || selectedDonation.address?.streetAddress}
                  {selectedDonation.supplierLocality && `, ${selectedDonation.supplierLocality}`}
                  {selectedDonation.supplierCity && `, ${selectedDonation.supplierCity}`}
                  {selectedDonation.supplierPostalCode && ` - ${selectedDonation.supplierPostalCode}`}
                </p>
              </div>

              {/* Call Supplier and Get Directions Buttons (Requirement 1) */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                {selectedDonation.supplierPhone ? (
                  <a
                    href={`tel:${selectedDonation.supplierPhone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Supplier</span>
                  </a>
                ) : (
                  <div className="py-2.5 px-3 text-center text-xs text-slate-400 bg-slate-100 rounded-xl">
                    Phone on Request
                  </div>
                )}

                {(() => {
                  const destLat = selectedDonation.supplierLatitude || selectedDonation.address?.latitude;
                  const destLng = selectedDonation.supplierLongitude || selectedDonation.address?.longitude;
                  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;

                  return (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition"
                    >
                      <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Get Directions</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  );
                })()}
              </div>
            </div>

            {/* Food Summary Grid */}
            <div className="space-y-4 text-sm text-slate-600">
              <p className="leading-relaxed">{selectedDonation.description}</p>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Estimated Servings</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedDonation.estimatedServings} Persons</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Quantity</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedDonation.approximateQuantity} {selectedDonation.quantityUnit}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Pickup Window</span>
                  <p className="font-bold text-slate-900 mt-0.5">{formatDateTime(selectedDonation.pickupAvailableUntil)}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Safe Consumption By</span>
                  <p className="font-bold text-slate-900 mt-0.5">{formatDateTime(selectedDonation.consumeBeforeTime)}</p>
                </div>
              </div>

              {selectedDonation.pickupInstructions && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Pickup Instructions</h4>
                  <p className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">{selectedDonation.pickupInstructions}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              {user?.roles.includes("ROLE_BENEFICIARY") && selectedDonation.status === "AVAILABLE" && (
                <button
                  onClick={() => {
                    handleRequestFood(selectedDonation);
                  }}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Request Food
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Requirement 6 - Step 1: Request Food) */}
      {confirmAcceptModalOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Submit Food Collection Request
            </h3>
            <blockquote className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs italic text-emerald-900 mb-4">
              &ldquo;Upon approval by the supplier, you will receive a secure 6-digit Pickup OTP in your Pickups dashboard to complete handover.&rdquo;
            </blockquote>

            <p className="text-sm text-slate-600 mb-6">
              You are requesting to collect <strong>{selectedDonation.title}</strong> ({selectedDonation.estimatedServings} servings) from <strong>{selectedDonation.supplierName}</strong> before {formatDateTime(selectedDonation.pickupAvailableUntil)}.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAcceptModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={accepting}
                onClick={confirmRequestAction}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>Submit Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DonationCard({
  donation,
  timeRemaining,
  onViewDetails,
  onRequestFood,
  isBeneficiary,
}: {
  donation: DonationDto;
  timeRemaining: string;
  onViewDetails: () => void;
  onRequestFood: () => void;
  isBeneficiary: boolean;
}) {
  const imageUrl = donation.images && donation.images.length > 0 
    ? donation.images[0].imageUrl 
    : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";

  const photoSrc = donation.supplierPhotoUrl || donation.supplierLogoUrl;

  return (
    <div className="flex flex-col rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Food Image & Badges */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={donation.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white">
            {donation.foodCategory}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md",
              donation.dietaryType === "VEGETARIAN" ? "bg-emerald-600/90" :
              donation.dietaryType === "VEGAN" ? "bg-teal-600/90" : "bg-orange-600/90"
            )}
          >
            {donation.dietaryType}
          </span>
        </div>

        {donation.distanceKm !== undefined && donation.distanceKm !== null && (
          <div className="absolute bottom-3 right-3 rounded-xl bg-white/95 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>{donation.distanceKm} km</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              {photoSrc ? (
                <img src={photoSrc} alt={donation.supplierName} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <Building2 className="h-4 w-4 text-amber-600" />
              )}
              <span className="truncate max-w-[140px]">{donation.supplierName}</span>
            </div>
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <Clock className="h-3 w-3" />
              {timeRemaining}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 line-clamp-1">{donation.title}</h3>
          <p className="mt-1 text-xs text-slate-600 line-clamp-2">{donation.description}</p>

          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <Users className="h-3.5 w-3.5 text-emerald-700" />
              <span>{donation.estimatedServings} Servings</span>
            </div>
            <span>•</span>
            <div>{donation.approximateQuantity} {donation.quantityUnit}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onViewDetails}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Details &amp; Map</span>
          </button>

          {isBeneficiary ? (
            <button
              onClick={onRequestFood}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
            >
              <span>Request Food</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              href="/login?redirect=/beneficiary/find-food"
              className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 text-center"
            >
              Sign In to Request
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

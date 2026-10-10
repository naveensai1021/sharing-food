"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { apiFetch } from "@/services/apiClient";
import { 
  Utensils, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { FoodCategory, DietaryType } from "@/types";

export default function CreateDonationPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foodCategory, setFoodCategory] = useState<FoodCategory>("BIRYANI");
  const [dietaryType, setDietaryType] = useState<DietaryType>("VEGETARIAN");
  const [approximateQuantity, setApproximateQuantity] = useState("25");
  const [quantityUnit, setQuantityUnit] = useState("KG");
  const [estimatedServings, setEstimatedServings] = useState("50");

  // Dates & Times
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const [preparationDate, setPreparationDate] = useState(todayStr);
  const [preparationTime, setPreparationTime] = useState("13:00");
  const [pickupFromDate, setPickupFromDate] = useState(todayStr);
  const [pickupFromTime, setPickupFromTime] = useState("18:30");
  const [pickupUntilDate, setPickupUntilDate] = useState(todayStr);
  const [pickupUntilTime, setPickupUntilTime] = useState("21:30");
  const [consumeBeforeDate, setConsumeBeforeDate] = useState(todayStr);
  const [consumeBeforeTime, setConsumeBeforeTime] = useState("23:30");

  const [packagingStatus, setPackagingStatus] = useState("Packed in clean food-grade foil containers");
  const [allergens, setAllergens] = useState("None reported. Prepared in nut-free environment.");
  const [specialInstructions, setSpecialInstructions] = useState("Keep warm during transit. Serve immediately.");
  const [pickupInstructions, setPickupInstructions] = useState("Pick up at the rear kitchen dispatch counter. Ask for chef on duty.");

  // Food Items List
  const [foodItems, setFoodItems] = useState<{ itemName: string; quantity: string }[]>([
    { itemName: "Vegetable Dum Biryani", quantity: "20 KG" },
    { itemName: "Mixed Vegetable Curry / Salan", quantity: "5 Liters" },
  ]);

  // Food Image URLs
  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Safety Declaration Confirmation (Section 16)
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setFoodItems([...foodItems, { itemName: "", quantity: "" }]);
  };

  const removeItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: "itemName" | "quantity", val: string) => {
    const updated = [...foodItems];
    updated[index][field] = val;
    setFoodItems(updated);
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!safetyConfirmed) {
      toast.error("You must confirm the food safety pledge before publishing.");
      return;
    }

    setLoading(true);
    try {
      const prepInstant = new Date(`${preparationDate}T${preparationTime}:00`).toISOString();
      const pickupFromInstant = new Date(`${pickupFromDate}T${pickupFromTime}:00`).toISOString();
      const pickupUntilInstant = new Date(`${pickupUntilDate}T${pickupUntilTime}:00`).toISOString();
      const consumeBeforeInstant = new Date(`${consumeBeforeDate}T${consumeBeforeTime}:00`).toISOString();

      const payload = {
        title,
        description,
        foodCategory,
        dietaryType,
        approximateQuantity: parseFloat(approximateQuantity) || 10,
        quantityUnit,
        estimatedServings: parseInt(estimatedServings) || 20,
        preparationTime: prepInstant,
        pickupAvailableFrom: pickupFromInstant,
        pickupAvailableUntil: pickupUntilInstant,
        consumeBeforeTime: consumeBeforeInstant,
        packagingStatus,
        allergens,
        specialInstructions,
        pickupInstructions,
        foodItems: foodItems.filter((item) => item.itemName.trim().length > 0),
        imageUrls,
        safetyDeclarationConfirmed: true,
      };

      await apiFetch("/api/donations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Food donation published successfully!");
      router.push("/supplier/donations");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish donation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Donate Surplus Food
        </h1>
        <p className="mt-2 text-slate-600">
          Turn your surplus kitchen bounty into wholesome meals for local shelters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Donation Info */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-secondary-600" />
            Food Details
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Donation Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fresh Vegetable Biryani & Dal Makhani"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-secondary-600 focus:ring-1 focus:ring-secondary-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Category *
              </label>
              <select
                value={foodCategory}
                onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
              >
                <option value="BIRYANI">Biryani</option>
                <option value="RICE">Rice Dishes</option>
                <option value="CURRY">Curry / Gravy</option>
                <option value="ROTI_BREAD">Roti / Bread</option>
                <option value="SNACKS">Snacks & Savories</option>
                <option value="DESSERTS">Desserts & Sweets</option>
                <option value="FRUITS">Fresh Fruits</option>
                <option value="PACKAGED_FOOD">Packaged Sealed Food</option>
                <option value="MIXED_MEAL">Mixed Full Meal</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Dietary Type *
              </label>
              <select
                value={dietaryType}
                onChange={(e) => setDietaryType(e.target.value as DietaryType)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
              >
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="VEGAN">100% Vegan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Approximate Quantity *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={approximateQuantity}
                onChange={(e) => setApproximateQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Quantity Unit *
              </label>
              <select
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
              >
                <option value="KG">Kilograms (KG)</option>
                <option value="SERVINGS">Servings</option>
                <option value="PACKETS">Boxes / Packets</option>
                <option value="LITERS">Liters</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Estimated Servings *
              </label>
              <input
                type="number"
                required
                min={1}
                value={estimatedServings}
                onChange={(e) => setEstimatedServings(e.target.value)}
                placeholder="Number of people fed"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Description & Ingredients
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fragrant Basmati rice prepared with potatoes, paneer, and aromatic spices. Freshly cooked today afternoon."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          {/* Dynamic Food Items breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase text-slate-700">
                Itemized Dishes Included
              </label>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-secondary-600 hover:text-secondary-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
            <div className="space-y-2">
              {foodItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Dish Name (e.g. Steamed Rice)"
                    value={item.itemName}
                    onChange={(e) => updateItem(idx, "itemName", e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Qty (e.g. 15 KG)"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                  {foodItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-2 text-slate-400 hover:text-red-600"
                      title="Remove dish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timelines (Section 17: Same-Day Food Rescue) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-700" />
            Same-Day Schedule & Deadlines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Preparation Time *
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={preparationDate}
                  onChange={(e) => setPreparationDate(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm flex-1"
                />
                <input
                  type="time"
                  required
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm w-28"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Pickup Available From *
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={pickupFromDate}
                  onChange={(e) => setPickupFromDate(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm flex-1"
                />
                <input
                  type="time"
                  required
                  value={pickupFromTime}
                  onChange={(e) => setPickupFromTime(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm w-28"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Pickup Deadline (Must be collected by) *
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={pickupUntilDate}
                  onChange={(e) => setPickupUntilDate(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm flex-1"
                />
                <input
                  type="time"
                  required
                  value={pickupUntilTime}
                  onChange={(e) => setPickupUntilTime(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm w-28"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Donation auto-expires after this deadline</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Consume Before Time *
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={consumeBeforeDate}
                  onChange={(e) => setConsumeBeforeDate(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm flex-1"
                />
                <input
                  type="time"
                  required
                  value={consumeBeforeTime}
                  onChange={(e) => setConsumeBeforeTime(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm w-28"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Maximum safe consumption window</p>
            </div>
          </div>
        </div>

        {/* Handling & Packaging Instructions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Handling & Handover Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Packaging Status
              </label>
              <input
                type="text"
                value={packagingStatus}
                onChange={(e) => setPackagingStatus(e.target.value)}
                placeholder="e.g. Foil containers, clean thermal box"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Allergen Warnings
              </label>
              <input
                type="text"
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                placeholder="e.g. Contains dairy, gluten free"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Pickup & Handover Instructions
            </label>
            <input
              type="text"
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              placeholder="e.g. Park at side entrance, notify reception"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
              Food Photos
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL (e.g. https://images.unsplash.com/...)"
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Add Image
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={url} alt="Food item" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 16: Food Safety Pledge Banner */}
        <div className="rounded-3xl border-2 border-emerald-300 bg-emerald-50/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 text-primary-700 shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Food Safety & Quality Declaration (Section 16)
              </h3>
              <blockquote className="mt-2 text-sm italic text-emerald-900 border-l-2 border-emerald-400 pl-3">
                &ldquo;I confirm that this food is safe for consumption, has been stored appropriately, and has not been served directly to customers. Food must be collected and consumed within the stated safe-consumption window.&rdquo;
              </blockquote>

              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="safetyCheck"
                  checked={safetyConfirmed}
                  onChange={(e) => setSafetyConfirmed(e.target.checked)}
                  className="h-5 w-5 rounded text-primary-700 focus:ring-primary-600 border-emerald-400 cursor-pointer"
                />
                <label htmlFor="safetyCheck" className="text-sm font-bold text-emerald-950 cursor-pointer">
                  I solemnly pledge and confirm this food safety declaration *
                </label>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !safetyConfirmed}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary-600 py-4 text-base font-bold text-white shadow-lg hover:bg-secondary-700 disabled:opacity-50 transition-all hover:scale-[1.01]"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Publishing Donation...</span>
            </>
          ) : (
            <>
              <Utensils className="h-5 w-5" />
              <span>Publish Available Food Donation</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

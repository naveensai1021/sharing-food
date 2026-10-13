"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import { 
  Heart, 
  UtensilsCrossed, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  TrendingUp
} from "lucide-react";

interface ImpactStats {
  totalMealsRescued: number;
  activeSuppliers: number;
  activeBeneficiaries: number;
  completedPickups: number;
  totalDonations: number;
  rescueRate: number;
  citiesCount: number;
}

export default function ImpactPage() {
  const [stats, setStats] = useState<ImpactStats>({
    totalMealsRescued: 0,
    activeSuppliers: 0,
    activeBeneficiaries: 0,
    completedPickups: 0,
    totalDonations: 0,
    rescueRate: 100,
    citiesCount: 1
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImpact() {
      try {
        setLoading(true);
        const res = await apiClient.get<ImpactStats>("/impact/stats");
        if (res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch live impact telemetry", err);
      } finally {
        setLoading(false);
      }
    }
    loadImpact();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3.5 py-1 text-xs font-bold text-primary-800 mb-4">
            <Heart className="h-3.5 w-3.5 fill-current text-primary-700" />
            <span>Verified Platform Impact Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Every Plate Saved is a Smile Delivered
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            By connecting food businesses with local elder care homes and children's orphanages, Sharing Food, Spreading Love ensures that safe, wholesome banquet surplus never goes to waste.
          </p>
        </div>

        {/* Global Impact Numbers - Real Live Database Telemetry */}
        <div className="my-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-100 text-secondary-700 mb-3">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {loading ? "..." : stats.totalMealsRescued.toLocaleString()}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Meals Rescued</div>
            <p className="text-xs text-slate-500 mt-2">Nutritious meals safely delivered to care residents.</p>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {loading ? "..." : stats.activeSuppliers}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Food Suppliers</div>
            <p className="text-xs text-slate-500 mt-2">Active verified donor partners pledging surplus.</p>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 mb-3">
              <Heart className="h-6 w-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {loading ? "..." : stats.activeBeneficiaries}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Care Beneficiaries</div>
            <p className="text-xs text-slate-500 mt-2">Active elder homes & orphanages supported.</p>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 mb-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {loading ? "..." : `${stats.rescueRate}%`}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Rescue Rate</div>
            <p className="text-xs text-slate-500 mt-2">{stats.completedPickups} OTP-verified handovers completed.</p>
          </div>
        </div>

        {/* Workflow Showcase */}
        <div className="my-16 rounded-3xl bg-primary-900 p-8 sm:p-12 text-white">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-300">Operational Integrity</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">How Our Same-Day Food Rescue Works</h2>
            <p className="mt-2 text-sm text-primary-200 leading-relaxed">
              Surplus prepared food is extremely time-sensitive. Our technological workflow guarantees freshness and safety at every turn.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
              <div className="text-xs font-mono font-bold text-secondary-400">STAGE 01</div>
              <h3 className="text-base font-bold text-white mt-1">Preparation & Food Pledge</h3>
              <p className="text-xs text-primary-200 mt-1.5 leading-relaxed">
                Suppliers sign a mandatory Food Safety Declaration, specifying dish items, dietary category, and consume-before timestamps.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
              <div className="text-xs font-mono font-bold text-secondary-400">STAGE 02</div>
              <h3 className="text-base font-bold text-white mt-1">Concurrency-Safe Reservation</h3>
              <p className="text-xs text-primary-200 mt-1.5 leading-relaxed">
                Nearby orphanages and old-age homes browse listings via interactive map. Backend pessimistic locks eliminate double-acceptance race conditions.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
              <div className="text-xs font-mono font-bold text-secondary-400">STAGE 03</div>
              <h3 className="text-base font-bold text-white mt-1">Verified Pickup & Handover</h3>
              <p className="text-xs text-primary-200 mt-1.5 leading-relaxed">
                Beneficiaries indicate departure en route. Food is collected in food-grade insulated containers with a 6-digit verification code.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <h3 className="text-xl font-bold text-slate-900">Be Part of the Solution</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">Whether you run a commercial kitchen or manage an eldercare home or orphanage.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-800 transition-colors"
            >
              <span>Sign Up</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/organizations"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Explore Directory</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

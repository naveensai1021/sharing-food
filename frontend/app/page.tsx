"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import { 
  Heart, 
  Utensils, 
  Search, 
  Users, 
  ArrowRight, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Smile, 
  Sparkles, 
  Award,
  CheckCircle2,
  TrendingUp,
  Leaf
} from "lucide-react";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalMealsRescued: 0,
    activeSuppliers: 0,
    activeBeneficiaries: 0,
    rescueRate: 100,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiClient.get<any>("/impact/stats");
        if (res.data) {
          setStats(res.data);
        }
      } catch (e) {
        // Default to live state
      }
    }
    loadStats();
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 via-orange-50/30 to-transparent py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-4 py-1.5 text-xs font-semibold text-primary-800 shadow-sm mb-6">
              <Leaf className="h-3.5 w-3.5" />
              <span>Zero Food Waste. Maximum Compassion.</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Share Food. <br />
              <span className="text-secondary-600">Spread Love.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Turn surplus food into meaningful meals for people who need it.
              We instantly connect restaurants, caterers, and cafeterias with nearby old-age homes and orphanages.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/donations/create"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-secondary-700 transition-all hover:scale-[1.02]"
              >
                <Utensils className="h-5 w-5" />
                <span>Donate Food</span>
              </Link>

              <Link
                href="/beneficiary/find-food"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-primary-800 transition-all hover:scale-[1.02]"
              >
                <Search className="h-5 w-5" />
                <span>Find Food</span>
              </Link>

              <Link
                href="/organizations"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                <Users className="h-5 w-5 text-primary-700" />
                <span>View Directory</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Banner */}
      <section className="border-y border-slate-200 bg-white py-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-primary-50/50">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-700">
                {stats.totalMealsRescued > 0 ? `${stats.totalMealsRescued.toLocaleString()}+` : "0"}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Meals Shared Safely</p>
            </div>
            <div className="p-4 rounded-xl bg-orange-50/50">
              <p className="text-3xl sm:text-4xl font-extrabold text-secondary-600">
                {stats.activeSuppliers}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Food Suppliers Active</p>
            </div>
            <div className="p-4 rounded-xl bg-primary-50/50">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-700">
                {stats.activeBeneficiaries}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Old-Age Homes & Orphanages</p>
            </div>
            <div className="p-4 rounded-xl bg-orange-50/50">
              <p className="text-3xl sm:text-4xl font-extrabold text-secondary-600">
                {stats.rescueRate}%
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Same-Day Rescue Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-2">
              Simple 4-Step Process
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How Food Rescue Works
            </h3>
            <p className="mt-3 text-slate-600">
              Direct, transparent, and immediate without administrative bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 font-bold text-lg mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Post Surplus Food</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Suppliers post surplus cooked meals, servings, dietary tags, and same-day pickup windows with a food safety pledge.
              </p>
            </div>

            <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100 text-secondary-600 font-bold text-lg mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Nearby Discovery</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nearby orphanages and senior care centers receive notifications and view available food within their radius on a map.
              </p>
            </div>

            <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 font-bold text-lg mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Instant Reservation</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                A single tap reserves the food with transactional concurrency locking, completely eliminating double acceptance risks.
              </p>
            </div>

            <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100 text-secondary-600 font-bold text-lg mb-4">
                4
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Pickup & Handover</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Beneficiaries securely collect the food using a verified 6-digit OTP handover and confirm successful delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary-600">
                Why It Matters
              </span>
              <h3 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Dignity for Elders, Nourishment for Children
              </h3>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Every evening, high-quality untouched banquets and commercial kitchens produce surplus that would otherwise be discarded. At the same time, charitable shelters face rising grocery costs.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700">
                    <strong className="font-semibold text-slate-900">100% Free & Transparent:</strong> We are a non-profit coordination network. Food is gifted with love.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700">
                    <strong className="font-semibold text-slate-900">Admin-Approved Partners:</strong> Mandatory administrator verification ensures food safety licenses and facility integrity.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700">
                    <strong className="font-semibold text-slate-900">Public Organization Directory:</strong> Celebrate local restaurants and shelter heroes with transparent impact recognition.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/organizations"
                  className="inline-flex items-center gap-2 font-semibold text-primary-700 hover:text-primary-800"
                >
                  <span>Explore the Public Organization Directory</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-3xl p-8 sm:p-12 text-white shadow-xl" style={{background: "linear-gradient(135deg, #08783D 0%, #14532D 100%)"}}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                </div>
                <span className="text-sm font-semibold tracking-wide uppercase text-green-200">
                  Real Story
                </span>
              </div>
              <blockquote className="text-lg sm:text-xl font-medium leading-relaxed italic text-white">
                &ldquo;Last night, Paradise Family Restaurant had 50 servings of fresh vegetable biryani after a wedding dinner. Within 25 minutes of posting, Sunshine Old Age Home reserved it. Our elders had a festive warm supper, and not a single grain was wasted.&rdquo;
              </blockquote>
              <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-white text-base">Ananya Rao</p>
                  <p className="text-xs text-green-200 mt-0.5">Sunshine Care Coordinator</p>
                </div>
                <Link
                  href="/community"
                  className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg bg-white text-[#14532D] hover:bg-green-50 transition-colors shadow-sm"
                >
                  Read Community Feed →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join the Movement Call to Action */}
      <section className="py-16 sm:py-20 text-white" style={{background: "linear-gradient(135deg, #08783D 0%, #166534 100%)"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-extrabold sm:text-4xl tracking-tight text-white">
            Ready to Make a Real Difference Today?
          </h3>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-green-100">
            Whether you run a commercial kitchen or care for vulnerable residents in an orphanage or eldercare home, join our mission today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register?role=SUPPLIER"
              className="rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-[#14532D] shadow-md hover:bg-green-50 transition-colors"
            >
              Register as Food Donor
            </Link>
            <Link
              href="/register?role=BENEFICIARY"
              className="rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
              style={{backgroundColor: "#EA580C"}}
            >
              Register as Beneficiary
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

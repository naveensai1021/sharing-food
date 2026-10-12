"use client";

import React from "react";
import Link from "next/link";
import { 
  Heart, 
  ShieldCheck, 
  Users, 
  UtensilsCrossed, 
  Building2, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800 mb-3">
            <Heart className="h-3.5 w-3.5 fill-current text-primary-700" />
            <span>Our Mission & Genesis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sharing Food, Spreading Love
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A technological lifeline bridging surplus banquet food with vulnerable communities in old-age homes and children's shelters.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="my-10 space-y-6 text-sm text-slate-700 leading-relaxed bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs">
          <h2 className="text-xl font-bold text-slate-900">Why We Exist</h2>
          <p>
            In every metropolitan city, tons of high-grade, freshly prepared food from weddings, corporate cafeterias, banquets, and restaurants go to waste every evening. Meanwhile, just a few kilometers away, old-age homes, orphanages, and community shelters struggle with rising grocery costs to feed their residents nutritious meals.
          </p>
          <p>
            Traditional charities often face logistical bottlenecks: communication gaps, uncertain pickup windows, and lack of real-time coordination. <strong>Sharing Food, Spreading Love</strong> solves this through real-time geospatial matching, instant notifications, and strict same-day food safety protocols.
          </p>

          <div className="my-6 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Core Principles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Uncompromised Food Safety</span>
                </div>
                <p className="text-xs text-slate-600">
                  Every donation requires a mandatory Section 16 Declaration with preparation times, storage hygiene, and consume-before deadlines.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  <span>Mandatory Admin Approval</span>
                </div>
                <p className="text-xs text-slate-600">
                  Every food donor and care facility is rigorously reviewed and approved by administrators before accessing operational features.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Transparent Public Directory</span>
                </div>
                <p className="text-xs text-slate-600">
                  Partner restaurants, hotels, old-age homes, and orphanages are listed publicly with their impact metrics while preserving privacy.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <Heart className="h-4 w-4 text-secondary-600" />
                  <span>Community Storytelling</span>
                </div>
                <p className="text-xs text-slate-600">
                  A public community feed allows approved donors and recipient shelters to share pictures, gratitude, and stories of hope.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-800 transition-colors"
          >
            <span>Join Our Mission Today</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { HeartHandshake, ShieldCheck, MapPin, Award, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Volunteer Verification Program | Sharing Food, Spreading Love",
  description: "Join our verified volunteer network to rescue meals, inspect food safety, and onboard local orphanages and eldercare homes.",
};

export default function VolunteerPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            Section 53 Verified Field Operations
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Become a Verified Community Volunteer
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Volunteers are the backbone of our zero-hunger network. Conduct on-site inspections of surplus food, transport meals to care homes, and ensure dignity for all recipients.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/register?role=volunteer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-700 text-white font-semibold shadow-md hover:bg-primary-800 transition-all"
            >
              Apply as Volunteer <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/volunteer/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all"
            >
              Volunteer Dashboard
            </Link>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Safety & Inspection</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Verify temperature, packaging seal, and cooked timestamps before any surplus food is dispatched.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Care Home Delivery</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Coordinate same-day pickup and delivery to registered elderly shelters and orphanages in your locality.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Badges & Recognition</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Earn community credibility credits and verified certificates for every 100 meals safely rescued.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

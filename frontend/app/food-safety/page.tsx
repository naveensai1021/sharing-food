import React from "react";
import Link from "next/link";
import { ShieldCheck, Clock, Thermometer, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Food Safety Guidelines | Sharing Food, Spreading Love",
  description: "Mandatory food hygiene, temperature control, and packaging standards for surplus meal donations.",
};

export default function FoodSafetyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Zero Compromise Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Food Safety & Hygiene Guidelines
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Every meal redistributed through our platform adheres to strict food safety protocols to ensure wholesome and dignified nutrition.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-slate-900">4-Hour Rule & Prepared Timestamps</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              All prepared cooked meals must be pledged and dispatched within 4 hours of cooking. Meals prepared beyond this window must be safely refrigerated at below 4°C or discarded under local health authority directives.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-900">Hot & Cold Chain Management</h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Hot Foods:</strong> Maintained at or above 60°C during transport using insulated food grade containers.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Chilled Foods:</strong> Kept at 4°C or colder with ice packs and monitored ambient temperature.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Packaging:</strong> Sealed food-grade aluminium or tamper-evident foil containers only.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/donations/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-700 text-white font-semibold hover:bg-primary-800 transition-all shadow-md"
          >
            Pledge a Safe Food Donation
          </Link>
        </div>
      </div>
    </div>
  );
}

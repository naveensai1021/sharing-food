import React from "react";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Sharing Food, Spreading Love",
  description: "Terms and conditions governing surplus food pledges, pickups, and safety declarations.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-primary-600" />
            Terms of Service
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
        </div>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 pt-2">1. Food Safety Pledge</h2>
          <p>
            By posting a food donation on this platform, food donors warrant that the food was prepared in a hygienic environment and stored in compliance with local food authority standards.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">2. OTP Custody Transfer</h2>
          <p>
            The physical handover of food is finalized only upon verification of the 6-digit pickup OTP. Beneficiaries must inspect packaging integrity before confirming receipt.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">3. Non-Commercial Use</h2>
          <p>
            All meals received through this service must be consumed by bona fide residents of verified institutions and may not be resold or bartered under any circumstances.
          </p>
        </div>
      </div>
    </div>
  );
}

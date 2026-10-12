import React from "react";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Sharing Food, Spreading Love",
  description: "Privacy and data protection principles for food donors, partner beneficiaries, and care organizations.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
            Last Updated: October 2026
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        </div>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 pt-2">1. Information We Collect</h2>
          <p>
            We collect organizational credentials, verified contact phone numbers, location coordinates, licensing details, and compliance records purely for coordinating the safe pickup and delivery of surplus food.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">2. Usage of Geographic & Contact Data</h2>
          <p>
            Location data is utilized strictly to compute proximity and map nearby surplus food pledges to care homes in urgent need. We never monetize or distribute personal data to third parties.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">3. OTP & Security Logs</h2>
          <p>
            Audit logs and pickup OTP entries are maintained for 90 days to comply with food safety inspection audits and guarantee transparent handovers.
          </p>
        </div>
      </div>
    </div>
  );
}

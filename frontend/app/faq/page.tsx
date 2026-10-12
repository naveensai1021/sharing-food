import React from "react";
import Link from "next/link";
import { HelpCircle, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions | Sharing Food, Spreading Love",
  description: "Common questions about donating surplus food, care home verification, and admin approval.",
};

const FAQS = [
  {
    q: "Who can register as a Food Supplier?",
    a: "Restaurants, caterers, banquet halls, corporate cafeterias, and event organizers who have untouched, safely prepared surplus food.",
  },
  {
    q: "How does the pickup OTP verification work?",
    a: "When an authorized care home reserves a donation, a 6-digit numeric OTP is issued to their representative. Upon arrival at the supplier, the supplier enters this OTP to verify custody, complete the transfer, and guarantee safety audit integrity.",
  },
  {
    q: "Is there any cost to use this platform?",
    a: "No. Sharing Food, Spreading Love is a 100% free non-profit platform dedicated to eliminating hunger and food waste.",
  },
  {
    q: "How are beneficiary orphanages and old age homes verified?",
    a: "All care homes undergo mandatory administrator review and credential verification (including NGO registration and premises inspection) before they can reserve surplus meal supplies.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            Support & Clarifications
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 text-base">
            Everything you need to know about food rescue operations, safety protocols, and administrator approval.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-2">
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                <span>{faq.q}</span>
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
          <h3 className="text-lg font-bold text-emerald-900">Still have questions?</h3>
          <p className="text-sm text-emerald-700">
            Our community care coordinators are here to assist your organization.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 text-sm font-bold text-emerald-800 hover:text-emerald-950 underline"
          >
            Contact Support Team <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

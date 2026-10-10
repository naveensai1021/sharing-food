import React from "react";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact Support | Sharing Food, Spreading Love",
  description: "Reach our care coordination and emergency food rescue helpline.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            24/7 Community Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact Support & Care Coordination
          </h1>
          <p className="text-slate-600 text-base">
            Need urgent assistance coordinating a surplus meal pickup or verifying a new shelter? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">Email Us</h3>
            <p className="text-sm text-slate-600">support@sharingfood.org</p>
            <p className="text-xs text-slate-400">Response within 2 hours</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">Emergency Helpline</h3>
            <p className="text-sm text-slate-600">+91 1800-FOOD-HELP</p>
            <p className="text-xs text-slate-400">Toll-free 24/7</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">Headquarters</h3>
            <p className="text-sm text-slate-600">Hyderabad & Bengaluru</p>
            <p className="text-xs text-slate-400">India Operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

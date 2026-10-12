import React from "react";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white shadow-sm">
                <Heart className="h-5 w-5 fill-current text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Sharing Food, <br className="hidden lg:inline" />
                <span className="text-secondary-600">Spreading Love</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed">
              Empowering local communities to eradicate food waste by delivering safe, hot, surplus meals to eldercare homes and orphanages.
            </p>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/about" className="hover:text-primary-700 transition-colors">
                  About the Mission
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-primary-700 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/food-safety" className="hover:text-primary-700 transition-colors">
                  Food Safety Guidelines
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-primary-700 transition-colors">
                  Organization Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Engagement */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">
              Community
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/community" className="hover:text-primary-700 transition-colors">
                  Impact Stories & Feed
                </Link>
              </li>
              <li>
                <Link href="/register?role=BENEFICIARY" className="hover:text-primary-700 transition-colors">
                  Register as Beneficiary
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-primary-700 transition-colors">
                  Metrics & Meal Counters
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-700 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/privacy" className="hover:text-primary-700 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-700 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-700 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li className="pt-2 text-xs text-slate-500">
                Food Safety Disclaimer: Meals are safely pledged under same-day rescue protocols.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Sharing Food, Spreading Love. Built with care for community nutrition.</p>
          <div className="flex items-center gap-1 mt-2 sm:mt-0 text-slate-600 font-medium">
            <span>Powered by</span>
            <span className="text-primary-700 font-semibold">Compassion & Technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

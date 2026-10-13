"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import apiClient from "@/services/apiClient";
import { 
  Heart, 
  Menu, 
  X, 
  Bell, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon,
  Building2,
  Sparkles,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRole = (role: string) => user?.roles?.includes(role as any);
  const isApproved = user?.status === "APPROVED" || user?.status === "ACTIVE";

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const fetchUnread = async () => {
      try {
        const res = await apiClient.get<{ unreadCount: number }>("/notifications/unread-count");
        setUnreadCount(res.data?.unreadCount || 0);
      } catch (err) {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user, pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-sm transition-transform group-hover:scale-105">
            <Heart className="h-5 w-5 fill-current text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-primary-700 transition-colors">
              Sharing Food
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-secondary-600">
              Spreading Love
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {!user && (
            <>
              <NavLink href="/" active={pathname === "/"}>Home</NavLink>
              <NavLink href="/organizations" active={pathname.startsWith("/organizations")}>Organizations</NavLink>
              <NavLink href="/community" active={pathname.startsWith("/community")}>Community</NavLink>
              <NavLink href="/impact" active={pathname === "/impact"}>Impact</NavLink>
              <NavLink href="/about" active={pathname === "/about"}>About</NavLink>
            </>
          )}

          {user && !isApproved && !isRole("ROLE_ADMIN") && (
            <NavLink href="/account-status" active={pathname === "/account-status"}>
              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                Status: {user.status.replace("_", " ")}
              </span>
            </NavLink>
          )}

          {user && isRole("ROLE_SUPPLIER") && isApproved && (
            <>
              <NavLink href="/supplier/dashboard" active={pathname === "/supplier/dashboard"}>Dashboard</NavLink>
              <Link
                href="/donations/create"
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-700 transition-colors mr-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Donate Food</span>
              </Link>
              <NavLink href="/supplier/donations" active={pathname.startsWith("/supplier/donations")}>My Donations</NavLink>
              <NavLink href="/organizations" active={pathname.startsWith("/organizations")}>Directory</NavLink>
              <NavLink href="/community" active={pathname.startsWith("/community")}>Community</NavLink>
            </>
          )}

          {user && isRole("ROLE_BENEFICIARY") && isApproved && (
            <>
              <NavLink href="/beneficiary/dashboard" active={pathname === "/beneficiary/dashboard"}>Dashboard</NavLink>
              <NavLink href="/beneficiary/find-food" active={pathname.startsWith("/beneficiary/find-food")}>
                <span className="inline-flex items-center gap-1">
                  <Search className="h-3.5 w-3.5" />
                  Find Food
                </span>
              </NavLink>
              <NavLink href="/beneficiary/pickups" active={pathname.startsWith("/beneficiary/pickups")}>My Pickups</NavLink>
              <NavLink href="/organizations" active={pathname.startsWith("/organizations")}>Directory</NavLink>
              <NavLink href="/community" active={pathname.startsWith("/community")}>Community</NavLink>
            </>
          )}

          {user && isRole("ROLE_ADMIN") && (
            <>
              <NavLink href="/admin/dashboard" active={pathname === "/admin/dashboard"}>Overview</NavLink>
              <NavLink href="/admin/users" active={pathname.startsWith("/admin/users")}>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-primary-600" />
                  User Approvals
                </span>
              </NavLink>
              <NavLink href="/admin/donations" active={pathname.startsWith("/admin/donations")}>Donations</NavLink>
              <NavLink href="/admin/reports" active={pathname.startsWith("/admin/reports")}>Reports</NavLink>
              <NavLink href="/admin/analytics" active={pathname.startsWith("/admin/analytics")}>Analytics</NavLink>
            </>
          )}
        </nav>

        {/* User Actions & Auth status */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-600"></span>
                  </span>
                )}
              </Link>

              <div className="h-5 w-px bg-slate-200" />

              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.fullName || user.email.split("@")[0]}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <Link
              href="/notifications"
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-600"></span>
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-6 md:hidden space-y-2">
          {!user ? (
            <div className="space-y-1">
              <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink href="/organizations" onClick={() => setMobileMenuOpen(false)}>Organizations</MobileNavLink>
              <MobileNavLink href="/community" onClick={() => setMobileMenuOpen(false)}>Community</MobileNavLink>
              <MobileNavLink href="/impact" onClick={() => setMobileMenuOpen(false)}>Our Impact</MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</MobileNavLink>
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-primary-700 text-white font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {!isApproved && !isRole("ROLE_ADMIN") && (
                <MobileNavLink href="/account-status" onClick={() => setMobileMenuOpen(false)}>
                  Account Status ({user.status})
                </MobileNavLink>
              )}
              {isRole("ROLE_SUPPLIER") && isApproved && (
                <>
                  <MobileNavLink href="/supplier/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                  <MobileNavLink href="/donations/create" onClick={() => setMobileMenuOpen(false)}>+ Donate Food</MobileNavLink>
                  <MobileNavLink href="/supplier/donations" onClick={() => setMobileMenuOpen(false)}>My Donations</MobileNavLink>
                </>
              )}
              {isRole("ROLE_BENEFICIARY") && isApproved && (
                <>
                  <MobileNavLink href="/beneficiary/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                  <MobileNavLink href="/beneficiary/find-food" onClick={() => setMobileMenuOpen(false)}>Find Food Near You</MobileNavLink>
                  <MobileNavLink href="/beneficiary/pickups" onClick={() => setMobileMenuOpen(false)}>My Pickups</MobileNavLink>
                </>
              )}
              {isRole("ROLE_ADMIN") && (
                <>
                  <MobileNavLink href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Admin Overview</MobileNavLink>
                  <MobileNavLink href="/admin/users" onClick={() => setMobileMenuOpen(false)}>User Approvals & Management</MobileNavLink>
                  <MobileNavLink href="/admin/donations" onClick={() => setMobileMenuOpen(false)}>Donations</MobileNavLink>
                  <MobileNavLink href="/admin/reports" onClick={() => setMobileMenuOpen(false)}>Reports & Misuse</MobileNavLink>
                  <MobileNavLink href="/admin/analytics" onClick={() => setMobileMenuOpen(false)}>Analytics</MobileNavLink>
                </>
              )}
              <MobileNavLink href="/organizations" onClick={() => setMobileMenuOpen(false)}>Directory</MobileNavLink>
              <MobileNavLink href="/community" onClick={() => setMobileMenuOpen(false)}>Community Feed</MobileNavLink>
              <MobileNavLink href="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</MobileNavLink>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left py-2 px-3 text-red-600 font-medium rounded-lg hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary-50 text-primary-800 font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
    >
      {children}
    </Link>
  );
}

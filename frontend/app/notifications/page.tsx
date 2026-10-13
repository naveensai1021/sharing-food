"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import apiClient from "@/services/apiClient";
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Package, 
  Truck, 
  ShieldCheck, 
  MessageSquare, 
  Info,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  targetUrl?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

const isNotificationRead = (n: NotificationItem): boolean => {
  return n.isRead === true || n.read === true;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Default to "unread" tab so unread notifications are displayed first
  const [filter, setFilter] = useState<"unread" | "all">("unread");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<NotificationItem[]>("/notifications");
      const normalized = (res.data || []).map((item) => ({
        ...item,
        isRead: isNotificationRead(item),
        read: isNotificationRead(item),
      }));
      setNotifications(normalized);
    } catch (err: any) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (notif: NotificationItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!isNotificationRead(notif)) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true, read: true } : n))
      );

      try {
        await apiClient.patch(`/notifications/${notif.id}/read`);
      } catch (err) {
        // Revert on failure
        fetchNotifications();
      }
    }

    if (notif.targetUrl && !e) {
      router.push(notif.targetUrl);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    // Optimistically mark all as read
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, read: true }))
    );

    try {
      await apiClient.patch("/notifications/read-all");
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !isNotificationRead(n)).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !isNotificationRead(n);
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "DONATION":
        return <Package className="h-5 w-5 text-emerald-600" />;
      case "PICKUP":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "VERIFICATION":
        return <ShieldCheck className="h-5 w-5 text-purple-600" />;
      case "COMMUNITY":
        return <MessageSquare className="h-5 w-5 text-amber-600" />;
      default:
        return <Info className="h-5 w-5 text-slate-600" />;
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Bell className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-slate-500 mt-1 mb-6">You need to be logged in to view your notifications.</p>
        <Link
          href="/login"
          className="rounded-lg bg-primary-700 px-6 py-2.5 font-semibold text-white hover:bg-primary-800"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-bold text-secondary-800 animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Stay updated on your food donations, pickups, community activities, and status changes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Refresh notifications"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs — Unread tab is displayed first */}
        <div className="flex items-center gap-2 my-6">
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-primary-700 text-white shadow-sm font-semibold"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary-700 text-white shadow-sm font-semibold"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All ({notifications.length})
          </button>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-3 text-sm text-slate-500">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">You're all caught up!</h3>
            <p className="text-sm text-slate-500 mt-1">
              {filter === "unread" ? "No unread notifications." : "No notifications to show right now."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const isRead = isNotificationRead(item);
              return (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item)}
                  className={`group flex items-start gap-4 rounded-xl border p-4 transition-all cursor-pointer ${
                    isRead
                      ? "border-slate-200 bg-white hover:border-slate-300"
                      : "border-primary-200 bg-primary-50/40 hover:bg-primary-50/70"
                  }`}
                >
                  <div className={`mt-0.5 rounded-lg p-2.5 ${isRead ? "bg-slate-100" : "bg-white shadow-sm"}`}>
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm ${isRead ? "font-semibold text-slate-800" : "font-bold text-slate-900"}`}>
                        {item.title}
                      </h4>
                      <span className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {item.message}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      {item.targetUrl ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-primary-700 group-hover:underline">
                          <span>View details</span>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      ) : <div />}

                      {!isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item, e)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          <span>Mark as read</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Orange indicator only appears when notification is unread */}
                  {!isRead && (
                    <div className="mt-2 h-2.5 w-2.5 rounded-full bg-secondary-600 flex-shrink-0" title="Unread notification" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

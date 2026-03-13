"use client";

import { useState, useEffect, useMemo } from "react";
import { GlassPanel, PremiumButton, Badge } from "@/components/ui/design-system";

// =============================================================================
// TYPES
// =============================================================================

interface Notification {
  id: string;
  type: "alert" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// =============================================================================
// STORAGE
// =============================================================================

const NOTIFICATIONS_KEY = "lumina-notifications";

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!data) return generateDefaultNotifications();
    return JSON.parse(data).map((n: Notification) => ({
      ...n,
      timestamp: new Date(n.timestamp),
    }));
  } catch {
    return generateDefaultNotifications();
  }
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

function generateDefaultNotifications(): Notification[] {
  const now = new Date();
  return [
    {
      id: "1",
      type: "success",
      title: "Analysis Complete",
      message: "DCF valuation and 50+ ratios calculated successfully.",
      timestamp: new Date(now.getTime() - 5 * 60000),
      read: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Margin Alert",
      message: "EBITDA margin dropped below 15% threshold in Year 3.",
      timestamp: new Date(now.getTime() - 30 * 60000),
      read: false,
      actionUrl: "/analysis",
      actionLabel: "View Details",
    },
    {
      id: "3",
      type: "info",
      title: "New Feature Available",
      message: "Scenario Builder now supports custom presets. Try it out!",
      timestamp: new Date(now.getTime() - 2 * 3600000),
      read: true,
      actionUrl: "/analysis?view=scenarios",
      actionLabel: "Try Now",
    },
    {
      id: "4",
      type: "alert",
      title: "Model Version Saved",
      message: "Your model was auto-saved. You can restore previous versions.",
      timestamp: new Date(now.getTime() - 24 * 3600000),
      read: true,
    },
  ];
}

// =============================================================================
// COMPONENTS
// =============================================================================

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const typeConfig = {
  alert: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "🔴", text: "text-red-400" },
  warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "🟡", text: "text-amber-400" },
  info: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "🔵", text: "text-blue-400" },
  success: { bg: "bg-green-500/10", border: "border-green-500/30", icon: "🟢", text: "text-green-400" },
};

export function NotificationCenter({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md animate-[slideIn_0.2s_ease-out]">
        <GlassPanel padding="none" variant="elevated">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                🔔 Notifications
                {unreadCount > 0 && (
                  <Badge variant="brand">{unreadCount}</Badge>
                )}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filter === f
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f === "all" ? "All" : `Unread (${unreadCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl">📭</span>
                <p className="text-zinc-400 mt-2">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {filteredNotifications.map((notification) => {
                  const config = typeConfig[notification.type];
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-zinc-800/30 transition-colors ${
                        !notification.read ? "bg-zinc-800/20" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-sm">{config.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-medium ${notification.read ? "text-zinc-400" : "text-white"}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-amber-400" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{notification.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-zinc-600">{formatTimeAgo(notification.timestamp)}</span>
                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                className="text-xs text-amber-400 hover:text-amber-300"
                              >
                                {notification.actionLabel || "View"}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-zinc-800 flex justify-between">
            <button
              onClick={markAllAsRead}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>
        </GlassPanel>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

// Hook for notification count
export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const notifications = loadNotifications();
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, []);

  return { unreadCount };
}

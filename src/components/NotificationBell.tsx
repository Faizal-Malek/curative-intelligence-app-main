"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, DollarSign, AlertCircle, Info, CheckCircle } from "lucide-react";

interface Notification {
  id: string;
  type: "SYSTEM" | "ADMIN_MESSAGE" | "ANNOUNCEMENT" | "WARNING" | "SUCCESS";
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      if (res.ok) {
        setNotifications(notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });

      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ADMIN_MESSAGE":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "ANNOUNCEMENT":
        return <Bell className="w-5 h-5 text-purple-500" />;
      case "WARNING":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "SUCCESS":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-[#D2B193]" />;
    }
  };

  const getBgColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-white/50";
    
    switch (type) {
      case "ADMIN_MESSAGE":
        return "bg-blue-50/80";
      case "ANNOUNCEMENT":
        return "bg-purple-50/80";
      case "WARNING":
        return "bg-yellow-50/80";
      case "SUCCESS":
        return "bg-green-50/80";
      default:
        return "bg-[#F5EFE6]/50";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-[#F5EFE6] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-[#3A2F2F]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white/95 backdrop-blur-lg rounded-2xl border border-[#E9DCC9] shadow-2xl overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-[#E9DCC9] flex items-center justify-between bg-gradient-to-r from-[#F5EFE6] to-[#E9DCC9]">
            <div>
              <h3 className="font-semibold text-[#3A2F2F]">Notifications</h3>
              <p className="text-xs text-[#3A2F2F]/60">
                {unreadCount} unread
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-sm text-[#3A2F2F] hover:text-[#D2B193] font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[500px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#3A2F2F]/40">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No notifications</p>
                <p className="text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E9DCC9]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${getBgColor(notification.type, notification.isRead)} hover:bg-[#FBFAF8]`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold text-[#3A2F2F] ${!notification.isRead ? "" : "font-normal"}`}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="flex-shrink-0 text-[#3A2F2F]/40 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-[#3A2F2F]/70 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#3A2F2F]/50">
                            {new Date(notification.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-[#D2B193] hover:text-[#3A2F2F] font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            onClick={() => {
                              markAsRead(notification.id);
                              setIsOpen(false);
                            }}
                            className="inline-block mt-2 text-sm text-[#D2B193] hover:text-[#3A2F2F] font-medium"
                          >
                            View details →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

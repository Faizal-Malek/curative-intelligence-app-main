"use client";

import { useState, useEffect } from "react";
import { Bell, X, Info, AlertCircle, CheckCircle, CheckCheck, Grid, Rows } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/card";

interface Notification {
  id: string;
  type: "SYSTEM" | "ADMIN_MESSAGE" | "ANNOUNCEMENT" | "WARNING" | "SUCCESS";
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export default function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });

      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
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
        return <Info className="w-6 h-6 text-blue-500" />;
      case "ANNOUNCEMENT":
        return <Bell className="w-6 h-6 text-purple-500" />;
      case "WARNING":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "SUCCESS":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Info className="w-6 h-6 text-[#D2B193]" />;
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#B89B7B]">Command Center</p>
          <h1 className="text-3xl font-bold text-[#2F2626]">Notifications</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">
            {loading ? "Loading notifications..." : `${notifications.length} total • ${unreadCount} unread`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-[#EADCCE]">
            <button
              aria-label="Grid view"
              onClick={() => setLayout('grid')}
              className={`p-2.5 rounded-lg transition-all ${layout === 'grid' ? 'bg-[#D2B193] text-white shadow-sm' : 'text-[#3A2F2F]/60 hover:text-[#3A2F2F] hover:bg-[#F5EFE6]/50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              aria-label="List view"
              onClick={() => setLayout('list')}
              className={`p-2.5 rounded-lg transition-all ${layout === 'list' ? 'bg-[#D2B193] text-white shadow-sm' : 'text-[#3A2F2F]/60 hover:text-[#3A2F2F] hover:bg-[#F5EFE6]/50'}`}
            >
              <Rows className="w-4 h-4" />
            </button>
          </div>
          {!loading && unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#D2B193] text-white rounded-xl hover:bg-[#C2A183] transition-all shadow-sm hover:shadow-md"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Bell className="w-16 h-16 mx-auto mb-4 text-[#D2B193] opacity-30" />
          <h2 className="text-xl font-semibold text-[#2F2626] mb-2">No notifications yet</h2>
          <p className="text-sm text-[#6B5E5E]">
            Notifications from users and system alerts will appear here.
          </p>
        </Card>
      ) : layout === 'list' ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-lg ${!notification.isRead ? 'bg-gradient-to-br from-[#FBFAF8] to-[#F5EFE6]' : ''}`}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-lg text-[#2F2626] ${!notification.isRead ? "font-semibold" : "font-medium"}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#D2B193]/20 text-[#D2B193] text-xs font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#3A2F2F]/70 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="flex-shrink-0 p-2 text-[#3A2F2F]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    aria-label="Delete notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#E9DCC9]/50">
                  <span className="text-xs text-[#3A2F2F]/50" suppressHydrationWarning>
                    {new Date(notification.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="text-sm text-[#D2B193] hover:text-[#3A2F2F] font-medium transition-colors flex items-center gap-1"
                    >
                      View details →
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-lg hover:-translate-y-1 group ${!notification.isRead ? 'bg-gradient-to-br from-[#FBFAF8] to-[#F5EFE6]' : ''}`}
            >
              <div className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getIcon(notification.type)}
                    {!notification.isRead && (
                      <span className="px-2 py-1 rounded-full bg-[#D2B193]/20 text-[#D2B193] text-xs font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-[#3A2F2F]/40 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    aria-label="Delete notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className={`text-base text-[#2F2626] mb-2 line-clamp-2 ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                  {notification.title}
                </h3>
                <p className="text-sm text-[#3A2F2F]/70 mb-4 line-clamp-3 flex-grow leading-relaxed">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-[#E9DCC9]/50">
                  <span className="text-xs text-[#3A2F2F]/50" suppressHydrationWarning>
                    {new Date(notification.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="text-xs text-[#D2B193] hover:text-[#3A2F2F] font-medium transition-colors"
                    >
                      View →
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

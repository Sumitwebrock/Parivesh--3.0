import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { ProponentSidebar } from "../components/ProponentSidebar";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Trash2,
  Eye,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  clearNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type PpNotification,
} from "../services/ppPortal";

export default function ProponentNotifications() {
  const [notifications, setNotifications] = useState<PpNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "alert" | "success" | "info">("all");

  const loadNotifications = async () => {
    setError("");
    try {
      setNotifications(await fetchNotifications());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load notifications.");
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadNotifications();
      setLoading(false);
    };
    run();

    const timer = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => n.type === filter);
  }, [filter, notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-orange-50 border-orange-500 text-orange-700";
      case "success":
        return "bg-green-50 border-green-500 text-green-700";
      case "info":
        return "bg-blue-50 border-blue-500 text-blue-700";
      case "error":
        return "bg-red-50 border-red-500 text-red-700";
      default:
        return "bg-gray-50 border-gray-500 text-gray-700";
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const onMarkRead = async (id: number, read = true) => {
    try {
      await markNotificationRead(id, read);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: read ? 1 : 0 } : n)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update notification.");
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete notification.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <div className="flex">
        <ProponentSidebar />

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Notifications
                  </h1>
                  <p className="text-gray-600">
                    Real-time workflow updates from backend events.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="px-4 py-2 text-sm text-[#1A5C1A] bg-white border border-[#1A5C1A] rounded-lg hover:bg-green-50 transition-colors"
                    onClick={async () => {
                      await markAllNotificationsRead();
                      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
                    }}
                  >
                    Mark all as read
                  </button>
                  <button
                    className="px-4 py-2 text-sm text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                    onClick={async () => {
                      await clearNotifications();
                      setNotifications([]);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Unread
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {unreadCount}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Alerts
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {notifications.filter((n) => n.type === "alert").length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Updates
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter((n) => n.type === "info").length}
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: "Unread" },
                { key: "alert", label: "Alerts" },
                { key: "success", label: "Success" },
                { key: "info", label: "Info" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as typeof filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === tab.key
                      ? "bg-[#1A5C1A] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-lg border p-6 text-sm text-gray-500">Loading notifications...</div>
              ) : filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-l-4 rounded-lg p-5 ${getNotificationColor(
                    notification.type
                  )} ${notification.is_read ? "opacity-70" : "shadow-md"}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 ${
                        notification.type === "alert"
                          ? "text-orange-600"
                          : notification.type === "success"
                          ? "text-green-600"
                          : notification.type === "info"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                          {!notification.is_read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-[#FF6B00] rounded-full" />
                          )}
                        </h3>
                        <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          Application: {notification.application_ref || "-"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Details
                          </button>
                          {!notification.is_read && (
                            <button className="text-xs text-[#1A5C1A] hover:underline" onClick={() => onMarkRead(notification.id, true)}>
                              Mark as read
                            </button>
                          )}
                          <button className="text-xs text-red-600 hover:underline flex items-center gap-1" onClick={() => onDelete(notification.id)}>
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {!loading && filteredNotifications.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600">
                  You are all caught up.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

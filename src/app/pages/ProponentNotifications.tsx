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
import { useLanguage } from "../context/LanguageContext";

export default function ProponentNotifications() {
  const { t } = useLanguage();

  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "EDS Response Required",
      message:
        "Environmental Data Sheet response needed for EC/2026/00198. Please submit within 15 days.",
      time: "2 hours ago",
      read: false,
      application: "EC/2026/00198",
    },
    {
      id: 2,
      type: "success",
      title: "Payment Confirmed",
      message:
        "Payment of ₹75,000 received successfully for application EC/2026/00234",
      time: "1 day ago",
      read: false,
      application: "EC/2026/00234",
    },
    {
      id: 3,
      type: "info",
      title: "Document Verified",
      message:
        "Environmental Impact Assessment report has been verified and approved.",
      time: "2 days ago",
      read: true,
      application: "EC/2026/00234",
    },
    {
      id: 4,
      type: "alert",
      title: "Meeting Scheduled",
      message:
        "Expert Appraisal Committee meeting scheduled for 2026-03-25 to review your application EC/2025/01876",
      time: "3 days ago",
      read: true,
      application: "EC/2025/01876",
    },
    {
      id: 5,
      type: "success",
      title: "Application Submitted",
      message:
        "Your application EC/2026/00234 has been successfully submitted and is under review.",
      time: "5 days ago",
      read: true,
      application: "EC/2026/00234",
    },
    {
      id: 6,
      type: "info",
      title: "Scrutiny Started",
      message:
        "Document scrutiny has begun for application EC/2026/00198. Assigned to Ms. Verma.",
      time: "1 week ago",
      read: true,
      application: "EC/2026/00198",
    },
    {
      id: 7,
      type: "error",
      title: "Document Rejected",
      message:
        "Land ownership certificate requires re-submission with proper attestation.",
      time: "1 week ago",
      read: true,
      application: "EC/2026/00198",
    },
    {
      id: 8,
      type: "success",
      title: "MoM Generated",
      message:
        "Minutes of Meeting generated for EC/2025/01876. Download from your dashboard.",
      time: "2 weeks ago",
      read: true,
      application: "EC/2025/01876",
    },
  ];

  const preferenceKeys = [
    "notifications.preferences.statusUpdates",
    "notifications.preferences.paymentConfirmations",
    "notifications.preferences.documentAlerts",
    "notifications.preferences.meetingSchedules",
    "notifications.preferences.edsRequests",
    "notifications.preferences.systemAnnouncements",
  ] as const;

  const filterTabs = [
    { key: "notifications.filter.all", label: t("notifications.filter.all") },
    { key: "notifications.filter.unread", label: t("notifications.filter.unread") },
    { key: "notifications.filter.alerts", label: t("notifications.filter.alerts") },
    { key: "notifications.filter.success", label: t("notifications.filter.success") },
    { key: "notifications.filter.info", label: t("notifications.filter.info") },
  ];

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

  const unreadCount = notifications.filter((n) => !n.read).length;

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
                    {t("notifications.title")}
                  </h1>
                  <p className="text-gray-600">
                    {t("notifications.subtitle")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 text-sm text-[#1A5C1A] bg-white border border-[#1A5C1A] rounded-lg hover:bg-green-50 transition-colors">
                    {t("notifications.markAllRead")}
                  </button>
                  <button className="px-4 py-2 text-sm text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    {t("notifications.clearAll")}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("notifications.stats.total")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("notifications.stats.unread")}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {unreadCount}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("notifications.stats.alerts")}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {notifications.filter((n) => n.type === "alert").length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("notifications.stats.updates")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter((n) => n.type === "info").length}
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {filterTabs.map((tab, index) => (
                <button
                  key={tab.key}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    index === 0
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
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-l-4 rounded-lg p-5 ${getNotificationColor(
                    notification.type
                  )} ${notification.read ? "opacity-70" : "shadow-md"}`}
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
                          {!notification.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-[#FF6B00] rounded-full" />
                          )}
                        </h3>
                        <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {t("notifications.application")}: {notification.application}
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {t("notifications.viewDetails")}
                          </button>
                          {!notification.read && (
                            <button className="text-xs text-[#1A5C1A] hover:underline">
                              {t("notifications.markAsRead")}
                            </button>
                          )}
                          <button className="text-xs text-red-600 hover:underline flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            {t("notifications.delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {notifications.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {t("notifications.empty.title")}
                </h3>
                <p className="text-gray-600">
                  {t("notifications.empty.description")}
                </p>
              </div>
            )}

            {/* Notification Preferences */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-4">
                {t("notifications.preferences.title")}
              </h3>
              <div className="space-y-3">
                {preferenceKeys.map((key, index) => (
                  <label key={index} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-[#1A5C1A] border-gray-300 rounded focus:ring-[#1A5C1A]"
                    />
                    <span className="text-sm text-gray-700">{t(key)}</span>
                  </label>
                ))}
              </div>
              <button className="mt-4 bg-[#1A5C1A] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#145014] transition-colors">
                {t("notifications.preferences.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

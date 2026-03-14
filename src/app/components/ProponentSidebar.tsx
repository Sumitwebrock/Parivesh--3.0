import {
  FileText,
  Plus,
  Upload,
  CreditCard,
  TrendingUp,
  Bell,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { getCurrentUser } from "../services/ppPortal";

export function ProponentSidebar() {
  const { t } = useLanguage();
  const location = useLocation();
  const user = getCurrentUser();
  const displayName = user?.fullName ?? "Project Proponent";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() ?? "")
    .join("") || "PP";

  const menuItems = [
    {
      icon: FileText,
      label: t("proponent.sidebar.myApplications"),
      path: "/proponent",
    },
    {
      icon: Plus,
      label: t("proponent.sidebar.newApplication"),
      path: "/proponent/new",
    },
    {
      icon: Upload,
      label: t("proponent.sidebar.documents"),
      path: "/proponent/documents",
    },
    {
      icon: CreditCard,
      label: t("proponent.sidebar.payment"),
      path: "/proponent/payment",
    },
    {
      icon: TrendingUp,
      label: t("proponent.sidebar.trackStatus"),
      path: "/proponent/track",
    },
    {
      icon: Bell,
      label: t("proponent.sidebar.notifications"),
      path: "/proponent/notifications",
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
          <div className="w-12 h-12 bg-[#1A5C1A] rounded-full flex items-center justify-center text-white font-semibold">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-sm">{displayName}</p>
            <p className="text-xs text-gray-500">{t("proponent.role")}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#E8F5E9] text-[#1A5C1A] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/login"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-6"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">{t("proponent.sidebar.logout")}</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

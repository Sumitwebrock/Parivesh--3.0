import { ChevronDown, Search } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { AuthButtons } from "./AuthPanel";

export function Navigation() {
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkCls = (path?: string) =>
    `text-[12px] font-semibold transition-all duration-150 whitespace-nowrap px-2 py-1 rounded-md
     ${path && isActive(path)
       ? "text-white bg-white/20 shadow-inner"
       : "text-white/90 hover:text-white hover:bg-white/15"}`;

  const dropdownItemCls =
    "flex items-center gap-2 px-4 py-2.5 hover:bg-green-50 text-[12px] font-medium text-gray-700 hover:text-green-800 border-b border-gray-50 last:border-0 transition-colors";

  return (
    <nav
      className="text-white shadow-md sticky top-0 z-40"
      style={{
        background: "linear-gradient(90deg, #17106d 0%, #043549 60%, #003087 100%)",
        borderBottom: "3px solid #FF6B00",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between gap-2" style={{ minHeight: 46 }}>

          {/* ── Left nav links ── */}
          <div className="flex items-center gap-0.5 min-w-0 flex-shrink overflow-hidden">
            <Link to="/" className={linkCls("/")}>{t("nav.home")}</Link>
            <Link to="/about" className={linkCls("/about")}>{t("nav.about")}</Link>

            {/* Clearances dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-0.5 ${linkCls()}`}>
                {t("nav.clearances")}
                <ChevronDown className="w-3 h-3 ml-0.5 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 mt-0.5 bg-white text-gray-800 rounded-lg shadow-xl
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-all duration-200 min-w-[230px] z-50
                              border border-gray-100 overflow-hidden">
                <div className="bg-green-700 px-4 py-2">
                  <p className="text-[9px] font-black text-white/80 uppercase tracking-wider">Clearance Types</p>
                </div>
                <Link to="/clearance/environmental" className={dropdownItemCls}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  {t("nav.clearances.environmental")}
                </Link>
                <Link to="/clearance/forest" className={dropdownItemCls}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                  {t("nav.clearances.forest")}
                </Link>
                <Link to="/clearance/wildlife" className={dropdownItemCls}>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  {t("nav.clearances.wildlife")}
                </Link>
                <Link to="/clearance/crz" className={dropdownItemCls}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  {t("nav.clearances.crz")}
                </Link>
              </div>
            </div>

            {/* Downloads dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-0.5 ${linkCls()}`}>
                {t("nav.downloads")}
                <ChevronDown className="w-3 h-3 ml-0.5 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 mt-0.5 bg-white rounded-lg shadow-xl
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-all duration-200 min-w-[200px] z-50 border border-gray-100 overflow-hidden">
                <div className="bg-green-700 px-4 py-2">
                  <p className="text-[9px] font-black text-white/80 uppercase tracking-wider">Downloads</p>
                </div>
                <Link to="/downloads" className={dropdownItemCls}>Application Forms</Link>
                <Link to="/downloads" className={dropdownItemCls}>EIA Guidelines</Link>
                <Link to="/downloads" className={dropdownItemCls}>Standard ToR</Link>
                <Link to="/downloads" className={dropdownItemCls}>Notifications & Circulars</Link>
              </div>
            </div>

            {/* Guide dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-0.5 ${linkCls()}`}>
                {t("nav.guide")}
                <ChevronDown className="w-3 h-3 ml-0.5 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 mt-0.5 bg-white rounded-lg shadow-xl
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-all duration-200 min-w-[200px] z-50 border border-gray-100 overflow-hidden">
                <div className="bg-green-700 px-4 py-2">
                  <p className="text-[9px] font-black text-white/80 uppercase tracking-wider">Guides</p>
                </div>
                <Link to="/guide" className={dropdownItemCls}>User Manual</Link>
                <Link to="/guide" className={dropdownItemCls}>Video Tutorials</Link>
                <Link to="/guide" className={dropdownItemCls}>FAQs</Link>
              </div>
            </div>

            <Link to="/contact" className={linkCls("/contact")}>{t("nav.contact")}</Link>
            <Link to="/login" className={linkCls("/login")}>Dashboard</Link>
            <Link to="/complaints" className={linkCls("/complaints")}>Complaint</Link>
            <Link to="/vacancies" className={linkCls("/vacancies")}>{t("nav.vacancies")}</Link>
          </div>

          {/* ── Right: Search + Auth ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11.5px] font-bold transition-all duration-150"
              style={{ background: "#FF6B00", color: "white", boxShadow: "0 2px 8px rgba(255,107,0,0.4)" }}
            >
              <Search className="w-3 h-3" />
              Search
            </button>
            <AuthButtons />
          </div>

        </div>
      </div>
    </nav>
  );
}
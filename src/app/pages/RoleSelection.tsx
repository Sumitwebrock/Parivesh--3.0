import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { AuthPanel } from "../components/AuthPanel";
import { Shield, User, Search, FileText } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useState } from "react";

type Mode = "login" | "register";

export default function RoleSelection() {
  const [authMode, setAuthMode] = useState<Mode | null>(null);
  const roles = [
    {
      title: "Admin",
      icon: Shield,
      color: "bg-[#003087]",
      hoverColor: "hover:bg-[#002060]",
      description: "System administration and management",
      path: "/admin/login",
    },
    {
      title: "Project Proponent / RQP",
      icon: User,
      color: "bg-[#1A5C1A]",
      hoverColor: "hover:bg-[#145014]",
      description: "Submit and track applications",
      path: "/proponent",
    },
    {
      title: "Scrutiny Team",
      icon: Search,
      color: "bg-[#FF6B00]",
      hoverColor: "hover:bg-[#E65100]",
      description: "Review and verify applications",
      path: "/scrutiny/login",
    },
    {
      title: "MoM Team",
      icon: FileText,
      color: "bg-[#7B1FA2]",
      hoverColor: "hover:bg-[#6A1B9A]",
      description: "Generate meeting minutes",
      path: "/mom",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Decorative Pattern */}
        <div className="absolute top-32 left-0 w-48 h-48 opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#1A5C1A" strokeWidth="2" />
            <path d="M100 20 L180 100 L100 180 L20 100 Z" fill="none" stroke="#1A5C1A" strokeWidth="2" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Select Your Role to Login
          </h1>
          <p className="text-gray-600">
            Choose your role to access the PARIVESH 3.0 portal
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Link
                to={role.path}
                className={`block ${role.color} ${role.hoverColor} text-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <role.icon className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{role.title}</h2>
                  <p className="text-sm opacity-90 mb-6">{role.description}</p>
                  <div className="bg-white/20 px-6 py-2 rounded-full font-semibold text-sm group-hover:bg-white/30 transition-colors">
                    Login
                  </div>
                </div>
                {/* Accent Line */}
                <div className="mt-6 h-1 bg-white/30 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* New User Registration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-3">New User?</p>
          <button
            onClick={() => setAuthMode("register")}
            className="bg-[#1A5C1A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#145014] transition-colors shadow-md hover:shadow-lg"
          >
            Register Here
          </button>
        </motion.div>
      </div>

      {authMode && (
        <AuthPanel
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={(m) => setAuthMode(m)}
        />
      )}
    </div>
  );
}

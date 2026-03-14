import { Link } from "react-router";
import { ShieldX } from "lucide-react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to view this page. Please log in with an account that has the required role.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 bg-[#1A5C1A] text-white rounded-lg font-medium hover:bg-[#145014] transition-colors"
          >
            Go to Login
          </Link>
          <Link
            to="/"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

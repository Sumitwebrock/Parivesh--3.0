import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { loginUser, persistAuthSession } from "../services/auth";

export default function MomLogin() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginUser({ loginId: loginId.trim(), password });
      if (result.redirectTo !== "/mom") {
        setError("This account is not assigned to MoM Team.");
        return;
      }
      persistAuthSession(result);
      navigate("/mom");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Navigation />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 text-purple-700 mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MoM Team Login</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to access Minutes of Meeting Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login ID or Email</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                autoComplete="username"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter login ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Login to MoM"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-5">
            Need another role? <Link to="/login" className="text-purple-700 hover:underline">Go to role selection</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { ProponentSidebar } from "../components/ProponentSidebar";
import { Loader2, Plus } from "lucide-react";
import {
  changePpPassword,
  fetchApplications,
  fetchPpProfile,
  getCurrentUser,
  type ApplicationRow,
  updatePpProfile,
} from "../services/ppPortal";
import { StatusBadge } from "../components/StatusBadge";

export default function ProponentDashboard() {
  const user = getCurrentUser();
  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    mobile: user?.mobile ?? "",
    organization: user?.organization ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        setApps(await fetchApplications());
        const p = await fetchPpProfile();
        setProfile({
          fullName: p.fullName ?? "",
          email: p.email ?? "",
          mobile: p.mobile ?? "",
          organization: p.organization ?? "",
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const stats = useMemo(() => ({
    total: apps.length,
    draft: apps.filter((a) => a.status === "Draft").length,
    scrutiny: apps.filter((a) => a.status === "Under Scrutiny").length,
    eds: apps.filter((a) => a.status === "EDS").length,
  }), [apps]);

  const reviewQueue = useMemo(
    () => apps.filter((a) => a.status === "EDS").sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at))),
    [apps],
  );

  const saveProfile = async () => {
    setProfileMsg("");
    try {
      await updatePpProfile(profile);
      setProfileMsg("Profile updated.");
    } catch (e: unknown) {
      setProfileMsg(e instanceof Error ? e.message : "Failed to update profile.");
    }
  };

  const changePassword = async () => {
    setProfileMsg("");
    try {
      await changePpPassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setProfileMsg("Password changed successfully.");
    } catch (e: unknown) {
      setProfileMsg(e instanceof Error ? e.message : "Failed to change password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <div className="flex">
        <ProponentSidebar />

        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.fullName ?? "Project Proponent"}</h1>
              <p className="text-gray-600 mt-1">Submit applications, upload documents, and track scrutiny progress.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Card label="Total Applications" value={String(stats.total)} />
              <Card label="Draft" value={String(stats.draft)} />
              <Card label="Under Scrutiny" value={String(stats.scrutiny)} />
              <Card label="EDS" value={String(stats.eds)} />
            </div>

            {reviewQueue.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-orange-900">Needs Your Review (Sent Back by Scrutiny)</h2>
                <p className="text-sm text-orange-800 mt-1">These applications were sent back to Proponent for correction and re-submission.</p>
                <div className="mt-4 space-y-2">
                  {reviewQueue.map((app) => (
                    <div key={app.id} className="bg-white border border-orange-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{app.application_id} - {app.project_name}</p>
                        <p className="text-xs text-gray-600 mt-1">Updated: {new Date(app.updated_at).toLocaleString()}</p>
                      </div>
                      <Link to={`/proponent/new?edit=${app.id}`} className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-[#1A5C1A] text-white text-sm">
                        Edit &amp; Resend
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">My Applications</h2>
                <Link to="/proponent/new" className="inline-flex items-center gap-2 bg-[#1A5C1A] text-white px-4 py-2 rounded-lg text-sm">
                  <Plus className="w-4 h-4" /> New Application
                </Link>
              </div>

              {loading ? (
                <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1A5C1A]" /></div>
              ) : error ? (
                <div className="p-5 text-sm text-red-700 bg-red-50">{error}</div>
              ) : apps.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No applications yet. File your first application.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Ref ID</th>
                        <th className="px-4 py-3 text-left">Project</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Sector</th>
                        <th className="px-4 py-3 text-left">Payment</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Updated</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {apps.map((a) => (
                        <tr key={a.id} className={`hover:bg-gray-50 ${a.status === "EDS" ? "bg-orange-50/40" : ""}`}>
                          <td className="px-4 py-3 font-medium">{a.application_id}</td>
                          <td className="px-4 py-3">{a.project_name}</td>
                          <td className="px-4 py-3">{a.category}</td>
                          <td className="px-4 py-3">{a.sector_name}</td>
                          <td className="px-4 py-3">{a.payment_status}</td>
                          <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                          <td className="px-4 py-3 text-gray-500">{new Date(a.updated_at).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            {a.status === "EDS" ? (
                              <Link to={`/proponent/new?edit=${a.id}`} className="text-[#1A5C1A] hover:underline font-medium">
                                Edit &amp; Resend
                              </Link>
                            ) : (
                              <Link to={`/proponent/track?app=${a.id}`} className="text-[#1A5C1A] hover:underline">
                                View
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="text-lg font-semibold mb-4">Profile & Organization</h2>
              {profileMsg && <p className="text-sm mb-3 text-gray-700">{profileMsg}</p>}
              <div className="grid md:grid-cols-2 gap-3">
                <input className="border rounded-lg px-3 py-2" placeholder="Full Name" value={profile.fullName} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} />
                <input className="border rounded-lg px-3 py-2" placeholder="Email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                <input className="border rounded-lg px-3 py-2" placeholder="Mobile" value={profile.mobile} onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))} />
                <input className="border rounded-lg px-3 py-2" placeholder="Organization" value={profile.organization} onChange={(e) => setProfile((p) => ({ ...p, organization: e.target.value }))} />
              </div>
              <button className="mt-3 px-4 py-2 rounded-lg bg-[#1A5C1A] text-white text-sm" onClick={saveProfile}>Update Profile</button>

              <h3 className="font-semibold mt-6 mb-2">Change Password</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input type="password" className="border rounded-lg px-3 py-2" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
                <input type="password" className="border rounded-lg px-3 py-2" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
              </div>
              <button className="mt-3 px-4 py-2 rounded-lg bg-[#003087] text-white text-sm" onClick={changePassword}>Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

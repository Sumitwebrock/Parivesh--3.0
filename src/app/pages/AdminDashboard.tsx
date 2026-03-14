import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { ComplaintManagement } from "../components/ComplaintManagement";
import { useState, useEffect, useRef } from "react";
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Upload,
  Trash2,
  LogOut,
  TrendingUp,
  CheckCircle,
  MessageSquare,
  Plus,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  type AdminUser,
  type AdminTemplate,
  type AdminSector,
  fetchUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  fetchTemplates,
  uploadTemplate,
  deleteTemplate,
  downloadTemplateUrl,
  fetchSectors,
  createSector,
  deleteSector,
  addSectorParam,
  deleteSectorParam,
  fetchBlockchainAudit,
  type BlockchainAuditResponse,
  type BlockchainAuditRow,
  clearAdminSession,
  getAdminUsername,
  getAdminToken,
} from "../services/adminAuth";
import { useNavigate } from "react-router";

// ── Toast helper ──────────────────────────────────────────────────────────────
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 max-w-xs rounded-xl px-4 py-3 text-sm text-white shadow-xl
        ${ok ? "bg-gray-900" : "bg-red-600"}`}
    >
      {msg}
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = (msg: string, ok = true) => {
    clearTimeout(t.current);
    setToast({ msg, ok });
    t.current = setTimeout(() => setToast(null), 3500);
  };
  return { toast, show };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast, show } = useToast();

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  const chartData = [
    { sector: "Mining", ec: 245, fc: 189, wc: 124, crz: 45 },
    { sector: "Infrastructure", ec: 312, fc: 145, wc: 67, crz: 98 },
    { sector: "Industrial", ec: 178, fc: 98, wc: 34, crz: 23 },
    { sector: "Power", ec: 289, fc: 234, wc: 156, crz: 12 },
    { sector: "Building", ec: 156, fc: 45, wc: 23, crz: 67 },
  ];

  const stats = [
    { label: "EC Granted", value: "1,180", icon: CheckCircle, color: "text-[#1A5C1A]", bgColor: "bg-green-100" },
    { label: "ToR Issued", value: "856", icon: FileText, color: "text-[#003087]", bgColor: "bg-blue-100" },
    { label: "Forest Clearance", value: "711", icon: TrendingUp, color: "text-[#FF6B00]", bgColor: "bg-orange-100" },
    { label: "Wildlife Clearance", value: "404", icon: BarChart3, color: "text-[#7B1FA2]", bgColor: "bg-purple-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 bg-[#003087] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {getAdminUsername().slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm capitalize">{getAdminUsername()}</p>
                <p className="text-xs text-gray-500">System Administrator</p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: "overview", icon: BarChart3, label: "Overview" },
                { id: "complaints", icon: MessageSquare, label: "Complaints" },
                { id: "users", icon: Users, label: "User Management" },
                { id: "templates", icon: FileText, label: "Gist Templates" },
                { id: "sectors", icon: Settings, label: "Sector Parameters" },
                { id: "audit", icon: ShieldCheck, label: "Blockchain Audit" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-[#E3F2FD] text-[#003087] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-6"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">System administration and analytics</p>
            </div>

            {activeTab === "overview" && <OverviewTab stats={stats} chartData={chartData} />}
            {activeTab === "complaints" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ComplaintManagement />
              </motion.div>
            )}
            {activeTab === "users" && <UsersTab show={show} />}
            {activeTab === "templates" && <TemplatesTab show={show} />}
            {activeTab === "sectors" && <SectorsTab show={show} />}
            {activeTab === "audit" && <AuditTrailTab show={show} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
type Stat = { label: string; value: string; icon: React.ElementType; color: string; bgColor: string };
type ChartRow = { sector: string; ec: number; fc: number; wc: number; crz: number };

function OverviewTab({ stats, chartData }: { stats: Stat[]; chartData: ChartRow[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Sector-wise Clearances Granted</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sector" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ec" fill="#1A5C1A" name="Environmental Clearance" />
            <Bar dataKey="fc" fill="#003087" name="Forest Clearance" />
            <Bar dataKey="wc" fill="#FF6B00" name="Wildlife Clearance" />
            <Bar dataKey="crz" fill="#7B1FA2" name="CRZ Clearance" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent System Activity</h2>
        <div className="space-y-3">
          {[
            { action: "New user registration", user: "System", time: "2 hours ago" },
            { action: "Application submitted", user: "Green Mining Corp", time: "5 hours ago" },
            { action: "MoM finalized", user: "MoM Team", time: "1 day ago" },
            { action: "Template updated", user: "Admin", time: "2 days ago" },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">{a.action}</p>
                <p className="text-xs text-gray-500">{a.user}</p>
              </div>
              <p className="text-xs text-gray-500">{a.time}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AuditTrailTab({ show }: { show: (msg: string, ok?: boolean) => void }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<BlockchainAuditRow[]>([]);
  const [meta, setMeta] = useState<BlockchainAuditResponse | null>(null);
  const [applicationId, setApplicationId] = useState("");

  const load = async (ref = "") => {
    setLoading(true);
    try {
      const data = await fetchBlockchainAudit({ applicationId: ref, limit: 300 });
      setRows(data.rows);
      setMeta(data);
    } catch (e: unknown) {
      show(e instanceof Error ? e.message : "Failed to load blockchain audit events.", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Blockchain Audit Trail Viewer</h2>
              <p className="text-xs text-gray-500 mt-0.5">Immutable audit events and hash anchoring for workflow actions.</p>
            </div>
            <div className="text-xs text-gray-600 rounded-lg bg-gray-100 px-3 py-2">
              Provider: {meta?.provider || "-"} | Network: {meta?.network || "-"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="Filter by Application ID (e.g. EC/2026/10021)"
              className="border rounded-lg px-3 py-2 text-sm min-w-[320px]"
            />
            <button
              onClick={() => load(applicationId)}
              className="px-4 py-2 rounded-lg bg-[#003087] text-white text-sm font-medium hover:bg-[#002060]"
            >
              Search
            </button>
            <button
              onClick={() => { setApplicationId(""); load(""); }}
              className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium hover:bg-gray-200"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">Confirmed: {meta?.totals.confirmed ?? 0}</div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">Queued: {meta?.totals.queued ?? 0}</div>
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">Total: {meta?.totals.total ?? 0}</div>
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-blue-800 truncate">Chain Hash: {meta?.chainDocumentHash || "-"}</div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-700" /></div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No audit entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Application ID</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">User Role</th>
                  <th className="px-4 py-3 text-left">Timestamp</th>
                  <th className="px-4 py-3 text-left">Tx Hash</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.application_ref}</td>
                    <td className="px-4 py-3 text-gray-700">{row.action}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{row.user_role || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(row.event_time).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[280px] truncate" title={row.tx_hash || ""}>{row.tx_hash || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab({ show }: { show: (msg: string, ok?: boolean) => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    fullName: "", loginId: "", email: "", mobile: "",
    organization: "", password: "", assignedRole: "proponent",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    try { setUsers(await fetchUsers()); }
    catch (e: unknown) { show(e instanceof Error ? e.message : "Failed to load users", false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFormLoading(true);
    try {
      await createUser(form);
      show("User created successfully.");
      setShowCreate(false);
      setForm({ fullName: "", loginId: "", email: "", mobile: "", organization: "", password: "", assignedRole: "proponent" });
      load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create user");
    } finally { setFormLoading(false); }
  };

  const handleRoleChange = async (id: number, assignedRole: string) => {
    try {
      await updateUserRole(id, assignedRole);
      show("Role updated.");
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, assignedRole: assignedRole as AdminUser["assignedRole"] } : u));
    } catch (e: unknown) { show(e instanceof Error ? e.message : "Failed", false); }
  };

  const handleStatusToggle = async (u: AdminUser) => {
    const next = u.accountStatus === "active" ? "suspended" : "active";
    try {
      await updateUserStatus(u.id, next);
      show(`User ${next}.`);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, accountStatus: next } : x));
    } catch (e: unknown) { show(e instanceof Error ? e.message : "Failed", false); }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.fullName}"? This cannot be undone.`)) return;
    try {
      await deleteUser(u.id);
      show("User deleted.");
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e: unknown) { show(e instanceof Error ? e.message : "Failed", false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Full Name *</label>
                  <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Login ID *</label>
                  <input required value={form.loginId} onChange={(e) => setForm({ ...form, loginId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Mobile</label>
                  <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Password *</label>
                  <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Organization</label>
                  <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Assigned Role</label>
                  <select value={form.assignedRole} onChange={(e) => setForm({ ...form, assignedRole: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-700 focus:outline-none">
                    <option value="proponent">Proponent</option>
                    <option value="scrutiny">Scrutiny</option>
                    <option value="mom">MoM</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              {formError && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#003087] text-white hover:bg-[#002060] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">User Management (RBAC)</h2>
          <button onClick={() => setShowCreate(true)}
            className="bg-[#003087] text-white px-4 py-2 rounded-lg hover:bg-[#002060] transition-colors flex items-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> Create User
          </button>
        </div>
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-700" /></div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No registered users yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Login ID</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role Assignment</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{u.fullName}</td>
                    <td className="px-6 py-4 text-gray-500">{u.loginId}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <select value={u.assignedRole} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-700">
                        <option value="proponent">Proponent</option>
                        <option value="scrutiny">Scrutiny</option>
                        <option value="mom">MoM</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleStatusToggle(u)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.accountStatus === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                        {u.accountStatus === "active" ? "Active" : "Suspended"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(u)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Templates Tab ─────────────────────────────────────────────────────────────
function TemplatesTab({ show }: { show: (msg: string, ok?: boolean) => void }) {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uForm, setUForm] = useState({ name: "", category: "A", description: "" });
  const [uFile, setUFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uError, setUError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try { setTemplates(await fetchTemplates()); }
    catch (e: unknown) { show(e instanceof Error ? e.message : "Failed to load templates", false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uFile) { setUError("Please select a file."); return; }
    setUError(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("name", uForm.name);
      fd.append("category", uForm.category);
      fd.append("description", uForm.description);
      fd.append("file", uFile);
      await uploadTemplate(fd);
      show("Template uploaded successfully.");
      setShowUpload(false);
      setUForm({ name: "", category: "A", description: "" });
      setUFile(null);
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (e: unknown) {
      setUError(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploading(false); }
  };

  const handleDelete = async (t: AdminTemplate) => {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    try {
      await deleteTemplate(t.id);
      show("Template deleted.");
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
    } catch (e: unknown) { show(e instanceof Error ? e.message : "Failed", false); }
  };

  const handleDownload = async (t: AdminTemplate) => {
    const token = getAdminToken();
    const res = await fetch(downloadTemplateUrl(t.id), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) { show("Download failed.", false); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = t.original_name; a.click();
    URL.revokeObjectURL(url);
  };

  const catBadge: Record<string, string> = {
    A: "bg-green-100 text-green-700",
    B1: "bg-blue-100 text-blue-700",
    B2: "bg-yellow-100 text-yellow-700",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Gist Template</h3>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Template Name *</label>
                <input required value={uForm.name} onChange={(e) => setUForm({ ...uForm, name: e.target.value })}
                  placeholder="e.g. Standard EIA Template"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Category *</label>
                <select value={uForm.category} onChange={(e) => setUForm({ ...uForm, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none">
                  <option value="A">Category A</option>
                  <option value="B1">Category B1</option>
                  <option value="B2">Category B2</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea rows={2} value={uForm.description} onChange={(e) => setUForm({ ...uForm, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  File * — .doc, .docx, .pdf (max 10 MB)
                  <br />
                  <span className="text-gray-400 font-normal">
                    Use placeholders: <code className="bg-gray-100 px-1 rounded">{"{{project_name}}"}</code>{" "}
                    <code className="bg-gray-100 px-1 rounded">{"{{sector}}"}</code>{" "}
                    <code className="bg-gray-100 px-1 rounded">{"{{location}}"}</code>
                  </span>
                </label>
                <input ref={fileRef} type="file" accept=".doc,.docx,.pdf" required
                  onChange={(e) => setUFile(e.target.files?.[0] ?? null)}
                  className="w-full border rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700" />
              </div>
              {uError && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{uError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowUpload(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={uploading}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#1A5C1A] text-white hover:bg-[#145014] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Gist Template Management</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Supports placeholders:{" "}
              <code className="bg-gray-100 px-1 rounded">{"{{project_name}}"}</code>{" "}
              <code className="bg-gray-100 px-1 rounded">{"{{sector}}"}</code>{" "}
              <code className="bg-gray-100 px-1 rounded">{"{{location}}"}</code>
            </p>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="bg-[#1A5C1A] text-white px-4 py-2 rounded-lg hover:bg-[#145014] transition-colors flex items-center gap-2 text-sm font-medium">
            <Upload className="w-4 h-4" /> Upload Template
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-green-700" /></div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No templates uploaded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">File</th>
                  <th className="px-6 py-3 text-left">Uploaded</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templates.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      <div>{t.name}</div>
                      {t.description && <div className="text-xs text-gray-400 mt-0.5">{t.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${catBadge[t.category] ?? ""}`}>
                        Cat {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{t.original_name}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(t.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <button onClick={() => handleDownload(t)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-medium">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                        <button onClick={() => handleDelete(t)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Sectors Tab ───────────────────────────────────────────────────────────────
function SectorsTab({ show }: { show: (msg: string, ok?: boolean) => void }) {
  const [sectors, setSectors] = useState<AdminSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showAddSector, setShowAddSector] = useState(false);
  const [sForm, setSForm] = useState({ name: "", description: "" });
  const [paramModal, setParamModal] = useState<{ sectorId: number; sectorName: string } | null>(null);
  const [pForm, setPForm] = useState({ paramLabel: "", paramType: "text", required: false });

  const load = async () => {
    setLoading(true);
    try { setSectors(await fetchSectors()); }
    catch (e: unknown) { show(e instanceof Error ? e.message : "Failed to load sectors", false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = (id: number) =>
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSector(sForm);
      show("Sector added.");
      setShowAddSector(false); setSForm({ name: "", description: "" }); load();
    } catch (e: unknown) { show(e instanceof Error ? e.message : "Failed", false); }
  };

  const handleDeleteSector = async (s: AdminSector) => {
    if (!confirm(`Delete sector "${s.name}" and all its parameters?`)) return;
    try {
      await deleteSector(s.id);
      show("Sector deleted.");
      setSectors((prev) => prev.filter((x) => x.id !== s.id));
    } catch (e: unknown) { show(e instanceof Error ? e.message : "Failed", false); }
  };

  const handleAddParam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paramModal) return;
    try {
      await addSectorParam(paramModal.sectorId, pForm);
      show("Parameter added.");
      setParamModal(null); setPForm({ paramLabel: "", paramType: "text", required: false }); load();
    } catch (e: unknown) { show(e instanceof Error ? e.message : "Failed", false); }
  };

  const handleDeleteParam = async (sectorId: number, paramId: number) => {
    if (!confirm("Remove this parameter?")) return;
    try {
      await deleteSectorParam(sectorId, paramId);
      show("Parameter removed."); load();
    } catch (e: unknown) { show(e instanceof Error ? e.message : "Failed", false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {showAddSector && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Sector</h3>
            <form onSubmit={handleAddSector} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Sector Name *</label>
                <input required value={sForm.name} onChange={(e) => setSForm({ ...sForm, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea rows={2} value={sForm.description} onChange={(e) => setSForm({ ...sForm, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddSector(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#1A5C1A] text-white hover:bg-[#145014]">Add Sector</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paramModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-1">Add Parameter</h3>
            <p className="text-sm text-gray-500 mb-4">Sector: {paramModal.sectorName}</p>
            <form onSubmit={handleAddParam} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Parameter Label *</label>
                <input required value={pForm.paramLabel} onChange={(e) => setPForm({ ...pForm, paramLabel: e.target.value })}
                  placeholder="e.g. Forest Area (ha)"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Input Type</label>
                  <select value={pForm.paramType} onChange={(e) => setPForm({ ...pForm, paramType: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file">File Upload</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input type="checkbox" id="req-chk" checked={pForm.required}
                    onChange={(e) => setPForm({ ...pForm, required: e.target.checked })}
                    className="rounded border-gray-300" />
                  <label htmlFor="req-chk" className="text-sm">Required</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setParamModal(null)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#1A5C1A] text-white hover:bg-[#145014]">Add Parameter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold">Sector Parameters Configuration</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure sector-specific form fields and document checklists
          </p>
        </div>
        <button onClick={() => setShowAddSector(true)}
          className="bg-[#1A5C1A] text-white px-4 py-2 rounded-lg hover:bg-[#145014] transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Sector
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-700" />
        </div>
      ) : sectors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-400">No sectors defined yet.</div>
      ) : (
        <div className="space-y-3">
          {sectors.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(s.id)}>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{s.name}</h3>
                  {s.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{s.description}</p>}
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <span className="text-xs text-gray-400">{s.params.length} param{s.params.length !== 1 ? "s" : ""}</span>
                  <button onClick={(e) => { e.stopPropagation(); setParamModal({ sectorId: s.id, sectorName: s.name }); }}
                    className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Param
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSector(s); }}
                    className="text-xs text-red-600 font-medium hover:underline">Delete</button>
                  {expanded.has(s.id) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expanded.has(s.id) && (
                <div className="border-t border-gray-100 px-5 pb-4 pt-3">
                  {s.params.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No parameters yet. Click "+ Param" to add one.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 uppercase tracking-wider border-b border-gray-100">
                          <th className="py-2 text-left font-medium">Label</th>
                          <th className="py-2 text-left font-medium">Type</th>
                          <th className="py-2 text-left font-medium">Required</th>
                          <th className="py-2 text-left font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {s.params.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="py-2 pr-4">{p.param_label}</td>
                            <td className="py-2 pr-4 capitalize text-gray-500">{p.param_type}</td>
                            <td className="py-2 pr-4">
                              <span className={p.required ? "text-red-600 font-semibold" : "text-gray-400"}>
                                {p.required ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="py-2">
                              <button onClick={() => handleDeleteParam(s.id, p.id)} className="text-red-500 hover:underline">
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

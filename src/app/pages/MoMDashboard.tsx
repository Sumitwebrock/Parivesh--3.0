import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2, FileText, CheckCircle2, XCircle, Clock, Lock, Download,
  AlertCircle, ChevronDown, RefreshCw, LogOut, Eye, Edit3, Save,
  Calendar, Users, ClipboardList, Shield, FileCheck, SendHorizonal,
  CheckSquare, Info,
} from "lucide-react";
import {
  fetchMoMQueue, fetchMoMApplication, fetchGistContent, saveGistDraft,
  convertToMoM, finalizeMoM, downloadMomDocument,
  type MoMQueueItem, type MoMApplicationDetail, type MoMRecord,
} from "../services/mom";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function statusColor(s: string) {
  if (s === "Referred") return "bg-blue-100 text-blue-700";
  if (s === "Finalized") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-600";
}

function docStatusPill(s: string) {
  if (s === "Verified") return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Verified</span>;
  if (s === "Flagged") return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Flagged</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{s || "Pending"}</span>;
}

// ─── Sidebar user info ───────────────────────────────────────────────────────

function getStoredUser(): { fullName?: string; loginId?: string } {
  try {
    const t = localStorage.getItem("parivesh_auth_token");
    if (!t) return {};
    const payload = JSON.parse(atob(t.split(".")[1]));
    return { fullName: payload.fullName || payload.loginId, loginId: payload.loginId };
  } catch { return {}; }
}

// ─── View types ──────────────────────────────────────────────────────────────

type Tab = "overview" | "scrutiny" | "editor" | "finalize";

// ─── Convert to MoM modal ────────────────────────────────────────────────────

function ConvertModal({
  appId,
  initialGist,
  onClose,
  onDone,
}: {
  appId: number;
  initialGist: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [committeeName, setCommitteeName] = useState("Expert Appraisal Committee (EAC)");
  const [membersRaw, setMembersRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!meetingDate.trim() || !meetingId.trim() || !committeeName.trim()) {
      setError("Meeting date, Meeting ID, and Committee name are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const members = membersRaw.split("\n").map((m) => m.trim()).filter(Boolean);
      const r = await convertToMoM(appId, {
        meetingDate, meetingId, committeeName, membersPresent: members, gistContent: initialGist,
      });
      void r; // response used for side-effect only
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-semibold text-lg">Convert Gist to Minutes of Meeting</h3>
            <p className="text-xs text-gray-500 mt-0.5">Fill in official meeting metadata to generate MoM document</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Date *</label>
              <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meeting ID *</label>
              <input type="text" placeholder="e.g. EAC/2026/03" value={meetingId} onChange={(e) => setMeetingId(e.target.value)} className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Committee Name *</label>
            <input type="text" value={committeeName} onChange={(e) => setCommitteeName(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Members Present (one per line)</label>
            <textarea
              rows={4}
              value={membersRaw}
              onChange={(e) => setMembersRaw(e.target.value)}
              placeholder={"Dr. A. K. Sharma — Chairperson, EAC\nShri. B. Kumar — Member Secretary"}
              className={inp + " resize-none"}
            />
          </div>
          <p className="text-xs text-gray-400">The current gist draft will be embedded as meeting discussions.</p>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-[#7B1FA2] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#6A1B9A] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            Generate MoM Document
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Gist Editor ─────────────────────────────────────────────────────────────

function GistEditor({
  appId,
  finalized,
}: {
  appId: number;
  finalized: boolean;
}) {
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");
  const [showConvert, setShowConvert] = useState(false);
  const [convertedUrls, setConvertedUrls] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetchGistContent(appId);
      setContent(r.content);
      setSource(r.source);
      if (editorRef.current) editorRef.current.innerText = r.content;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load gist.");
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => { load(); }, [load]);

  const execCmd = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) setContent(editorRef.current.innerText);
  };

  const handleSave = async () => {
    const text = editorRef.current?.innerText || content;
    setSaving(true);
    setSaveMsg("");
    setError("");
    try {
      await saveGistDraft(appId, text);
      setContent(text);
      setSaveMsg("Draft saved.");
      setTimeout(() => setSaveMsg(""), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[#7B1FA2]" />
    </div>
  );

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {source === "scrutiny_gist" && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg px-3 py-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Loaded from Scrutiny-generated gist. Edit as needed and save your draft before converting to MoM.</span>
        </div>
      )}
      {source === "mom_draft" && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Showing your saved MoM team draft.</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-3 py-2 flex items-center gap-1 flex-wrap">
        {[
          { label: "B", cmd: "bold", title: "Bold" },
          { label: "I", cmd: "italic", title: "Italic" },
          { label: "U", cmd: "underline", title: "Underline" },
        ].map(({ label, cmd, title }) => (
          <button
            key={cmd}
            title={title}
            disabled={finalized}
            onMouseDown={(e) => { e.preventDefault(); execCmd(cmd); }}
            className="w-8 h-8 rounded font-semibold text-sm hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            {label}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          title="Heading"
          disabled={finalized}
          onMouseDown={(e) => { e.preventDefault(); execCmd("formatBlock", "<h3>"); }}
          className="px-2 h-8 rounded text-xs font-bold hover:bg-gray-200 disabled:opacity-40"
        >H3</button>
        <button
          title="Bullet List"
          disabled={finalized}
          onMouseDown={(e) => { e.preventDefault(); execCmd("insertUnorderedList"); }}
          className="w-8 h-8 rounded text-sm hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center"
        >•</button>
        <button
          title="Numbered List"
          disabled={finalized}
          onMouseDown={(e) => { e.preventDefault(); execCmd("insertOrderedList"); }}
          className="w-8 h-8 rounded text-xs hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center"
        >1.</button>
        <div className="flex-1" />
        {saveMsg && <span className="text-xs text-green-600 font-medium">{saveMsg}</span>}
        <button
          disabled={finalized || saving}
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A5C1A] text-white rounded text-xs font-medium hover:bg-[#145014] disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Draft
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!finalized}
        suppressContentEditableWarning
        onInput={() => { if (editorRef.current) setContent(editorRef.current.innerText); }}
        className={`min-h-80 border border-t-0 border-gray-200 rounded-b-lg p-5 text-sm leading-relaxed focus:outline-none whitespace-pre-wrap ${
          finalized ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white focus:ring-1 focus:ring-[#7B1FA2]"
        }`}
        style={{ fontFamily: "Georgia, serif" }}
      />

      {finalized && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border">
          <Lock className="w-4 h-4" />
          MoM is finalized. Editing is permanently locked.
        </div>
      )}

      {/* Convert button */}
      {!finalized && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            Save Draft First
          </button>
          <button
            onClick={() => setShowConvert(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#7B1FA2] text-white rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-colors"
          >
            <FileText className="w-4 h-4" />
            Convert to MoM
          </button>
        </div>
      )}

      {/* Converted download links */}
      {convertedUrls && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            MoM document generated successfully
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => downloadMomDocument(appId, "docx", `MoM_${appId}.docx`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg text-sm font-medium hover:bg-green-50"
            >
              <Download className="w-4 h-4" />
              Download DOCX
            </button>
            <button
              onClick={() => downloadMomDocument(appId, "pdf", `MoM_${appId}.pdf`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg text-sm font-medium hover:bg-green-50"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      )}

      {showConvert && (
        <ConvertModal
          appId={appId}
          initialGist={editorRef.current?.innerText || content}
          onClose={() => setShowConvert(false)}
          onDone={() => {
            setShowConvert(false);
            setConvertedUrls(true);
          }}
        />
      )}
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ id, onFinalized }: { id: number; onFinalized: () => void }) {
  const [data, setData] = useState<MoMApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [finalizing, setFinalizing] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setTab("overview");
    fetchMoMApplication(id)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFinalize = async () => {
    setFinalizing(true);
    setFinalizeError("");
    try {
      await finalizeMoM(id);
      setConfirmFinalize(false);
      onFinalized();
      // Reload detail
      const fresh = await fetchMoMApplication(id);
      setData(fresh);
    } catch (e: unknown) {
      setFinalizeError(e instanceof Error ? e.message : "Finalization failed.");
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-[#7B1FA2]" />
    </div>
  );
  if (error) return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center text-red-600">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );
  if (!data) return null;

  const { application: app, documents, payment, history, review, momRecord } = data;
  const isFinalized = app.status === "Finalized";
  const hasMoM = !!(momRecord?.mom_docx_path);

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "overview", icon: Info, label: "Overview" },
    { id: "scrutiny", icon: Shield, label: "Scrutiny Data" },
    { id: "editor", icon: Edit3, label: "Gist Editor" },
    { id: "finalize", icon: CheckSquare, label: "MoM & Finalize" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* App header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 font-mono mb-1">{app.application_id}</p>
            <h2 className="text-lg font-bold text-gray-900">{app.project_name}</h2>
            <p className="text-sm text-gray-500">{app.organization} • {app.sector_name} • Cat. {app.category}</p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColor(app.status)}`}>
            {app.status}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.id ? "bg-[#7B1FA2] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Proponent", value: app.owner_name },
                { label: "Email", value: app.owner_email },
                { label: "Location", value: [app.district, app.state].filter(Boolean).join(", ") || "—" },
                { label: "Land Area", value: app.land_area ? `${app.land_area} ha` : "—" },
                { label: "Estimated Cost", value: app.estimated_cost ? `₹ ${Number(app.estimated_cost).toLocaleString("en-IN")}` : "—" },
                { label: "Project Type", value: app.project_type || "—" },
                { label: "Submitted", value: fmtDate(app.created_at) },
                { label: "Last Updated", value: fmtDate(app.updated_at) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            {app.project_description && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">Project Description</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{app.project_description}</p>
              </div>
            )}

            {/* Status timeline */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Status Timeline</h4>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-[#7B1FA2] mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold">{h.status}</span>
                      <span className="text-xs text-gray-500"> · {fmtDate(h.created_at)} by {h.created_by}</span>
                      {h.comment && <p className="text-xs text-gray-600 mt-0.5">{h.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCRUTINY DATA (read-only) */}
        {tab === "scrutiny" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
              <Shield className="w-4 h-4 text-amber-600" />
              <p className="text-xs text-amber-800 font-medium">Scrutiny data is read-only. MoM team cannot modify this information.</p>
            </div>

            {/* Payment verification */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#7B1FA2]" />
                Payment Verification
              </h4>
              {payment ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">Amount</span><p className="font-medium">₹ {Number(payment.amount).toLocaleString("en-IN")}</p></div>
                  <div><span className="text-gray-500 text-xs">Status</span><p className="font-medium">{payment.status}</p></div>
                  {payment.upi_ref && <div><span className="text-gray-500 text-xs">UPI Ref</span><p className="font-mono text-xs">{payment.upi_ref}</p></div>}
                  {review?.payment_verification && (
                    <div><span className="text-gray-500 text-xs">Scrutiny Verification</span>
                      <p className={`font-medium ${review.payment_verification === "Verified" ? "text-green-700" : review.payment_verification === "Invalid" ? "text-red-700" : "text-amber-700"}`}>
                        {review.payment_verification}
                      </p>
                    </div>
                  )}
                </div>
              ) : <p className="text-sm text-gray-500">No payment record.</p>}
            </div>

            {/* Document checklist */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#7B1FA2]" />
                Document Verification Checklist
              </h4>
              {documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2 pr-3">Document</th>
                        <th className="pb-2 pr-3">Status</th>
                        <th className="pb-2">Scrutiny Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {documents.map((d) => (
                        <tr key={d.id}>
                          <td className="py-2 pr-3">
                            <p className="font-medium">{d.doc_name}</p>
                            <p className="text-gray-400">{d.original_name}</p>
                          </td>
                          <td className="py-2 pr-3">{docStatusPill(d.verification_status)}</td>
                          <td className="py-2 text-gray-600">{d.deficiency_comment || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Scrutiny review notes */}
            {review && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">Scrutiny Review Notes</h4>
                <p className="text-sm text-gray-700">{review.review_notes || "No notes recorded."}</p>
                {review.reviewed_by && (
                  <p className="text-xs text-gray-400 mt-2">By {review.reviewed_by} on {fmtDate(review.reviewed_at)}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* GIST EDITOR */}
        {tab === "editor" && (
          <GistEditor appId={id} finalized={isFinalized} />
        )}

        {/* MoM & FINALIZE */}
        {tab === "finalize" && (
          <div className="space-y-5">
            {/* MoM record status */}
            {momRecord ? (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#7B1FA2]" />
                  MoM Document Status
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Meeting ID", value: momRecord.meeting_id || "—" },
                    { label: "Meeting Date", value: fmtDate(momRecord.meeting_date) },
                    { label: "Committee", value: momRecord.committee_name || "—" },
                    { label: "Converted By", value: momRecord.converted_by || "—" },
                    { label: "Converted At", value: fmtDate(momRecord.converted_at) },
                    {
                      label: "Finalized",
                      value: momRecord.finalized ? `Yes — ${fmtDate(momRecord.finalized_at)}` : "Not yet",
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                {hasMoM && (
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => downloadMomDocument(id, "docx", `MoM_${id}.docx`)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      Download DOCX
                    </button>
                    <button
                      onClick={() => downloadMomDocument(id, "pdf", `MoM_${id}.pdf`)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  No MoM document generated yet. Go to the <strong>Gist Editor</strong> tab and click <strong>"Convert to MoM"</strong>.
                </p>
              </div>
            )}

            {/* Finalize section */}
            {isFinalized ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">MoM Finalized</h4>
                    <p className="text-xs text-green-700">
                      Finalized by {momRecord?.finalized_by || "—"} on {fmtDate(momRecord?.finalized_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-green-700">
                  This application is permanently locked. The MoM document is available to the Project Proponent for download.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#7B1FA2]" />
                  Finalize Minutes of Meeting
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Finalizing will permanently lock this record. The application status will change to <strong>Finalized</strong>.
                  The MoM document will be made available to the Project Proponent. <strong>This action cannot be undone.</strong>
                </p>

                {finalizeError && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{finalizeError}</div>
                )}

                {confirmFinalize ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-800 mb-3">Confirm Final Lock</p>
                    <p className="text-xs text-red-700 mb-4">Are you absolutely sure? This is irreversible.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmFinalize(false)}
                        className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
                      >Cancel</button>
                      <button
                        onClick={handleFinalize}
                        disabled={finalizing}
                        className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {finalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Yes, Finalize
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmFinalize(true)}
                    disabled={!hasMoM}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#7B1FA2] text-white rounded-lg text-sm font-medium hover:bg-[#6A1B9A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Lock & Finalize MoM
                  </button>
                )}
                {!hasMoM && (
                  <p className="text-xs text-gray-400 mt-2">Generate the MoM document first before finalizing.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function MoMDashboard() {
  const user = getStoredUser();
  const [queue, setQueue] = useState<MoMQueueItem[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sort, setSort] = useState("latest");

  const loadQueue = useCallback(async () => {
    setLoadingQueue(true);
    setQueueError("");
    try {
      const rows = await fetchMoMQueue({ category: filterCategory, sector: filterSector, status: filterStatus, sort });
      setQueue(rows);
      if (rows.length && !selected) setSelected(rows[0].id);
    } catch (e: unknown) {
      setQueueError(e instanceof Error ? e.message : "Failed to load queue.");
    } finally {
      setLoadingQueue(false);
    }
  }, [filterCategory, filterSector, filterStatus, sort, selected]);

  useEffect(() => { loadQueue(); }, [filterCategory, filterSector, filterStatus, sort]);

  const sectors = [...new Set(queue.map((q) => q.sector_name))].sort();

  const selCls = "border border-gray-300 rounded-lg text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] bg-white";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Navigation />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7B1FA2] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {(user.fullName || "M").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user.fullName || "MoM Team"}</p>
                <p className="text-xs text-[#7B1FA2] font-medium">Secretariat</p>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1">
            <nav className="space-y-1">
              {[
                { icon: Calendar, label: "Referred Queue", active: true },
                { icon: FileText, label: "MoM Documents" },
                { icon: Download, label: "Downloads" },
                { icon: Lock, label: "Finalized" },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active ? "bg-purple-50 text-[#7B1FA2] font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <button
              onClick={() => { localStorage.removeItem("parivesh_auth_token"); window.location.href = "/login"; }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Queue list */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm">MoM Queue</h2>
              <button onClick={loadQueue} disabled={loadingQueue} className="text-gray-400 hover:text-gray-600">
                <RefreshCw className={`w-4 h-4 ${loadingQueue ? "animate-spin" : ""}`} />
              </button>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selCls + " w-full"}>
              <option value="all">All Statuses</option>
              <option value="Referred">Referred</option>
              <option value="Finalized">Finalized</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={selCls}>
                <option value="all">All Categories</option>
                <option value="A">Category A</option>
                <option value="B1">Category B1</option>
                <option value="B2">Category B2</option>
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={selCls}>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            {sectors.length > 0 && (
              <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className={selCls + " w-full"}>
                <option value="all">All Sectors</option>
                {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {/* Application list */}
          <div className="flex-1 overflow-y-auto">
            {loadingQueue ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 animate-spin text-[#7B1FA2]" />
              </div>
            ) : queueError ? (
              <div className="p-4 text-sm text-red-600">{queueError}</div>
            ) : queue.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No referred applications in queue.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {queue.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selected === item.id ? "bg-purple-50 border-r-2 border-[#7B1FA2]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 font-mono">{item.application_id}</p>
                        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{item.project_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.owner_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.sector_name} · Cat. {item.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(item.status)}`}>{item.status}</span>
                        {item.finalized ? (
                          <Lock className="w-3.5 h-3.5 text-green-600" />
                        ) : item.mom_docx_path ? (
                          <FileCheck className="w-3.5 h-3.5 text-[#7B1FA2]" />
                        ) : null}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{fmtDate(item.updated_at)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <DetailPanel id={selected} onFinalized={loadQueue} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center text-gray-400"
            >
              <div className="text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <p className="text-lg font-medium text-gray-500">Select an application</p>
                <p className="text-sm">Choose a referred application from the queue</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


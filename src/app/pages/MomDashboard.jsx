import { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { StatusBadge } from "../components/StatusBadge";
import {
  convertMom,
  downloadUrl,
  fetchMomApplications,
  fetchMomGist,
  finalizeMom,
  saveMomGist,
} from "../services/mom";

function tabMatches(status, tab) {
  if (tab === "To Review") return status === "Referred";
  if (tab === "MoM Generated") return status === "MoMGenerated";
  return status === "Finalized";
}

function fmtDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GistModal({ application, initialValue, saving, onClose, onSave }) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Gist</h2>
            <p className="text-sm text-gray-500">{application.application_id} · {application.project_name}</p>
          </div>
          <button className="text-sm text-gray-500 hover:text-gray-700" onClick={onClose}>Close</button>
        </div>
        <div className="p-6">
          <ReactQuill theme="snow" value={value} onChange={setValue} className="bg-white" />
        </div>
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={saving}
            onClick={() => onSave(value)}
          >
            {saving ? "Saving..." : "Save Gist"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MomDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("To Review");
  const [editorApp, setEditorApp] = useState(null);
  const [editorValue, setEditorValue] = useState("");
  const [savingGist, setSavingGist] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [downloadsById, setDownloadsById] = useState({});

  const loadApplications = async () => {
    setLoading(true);
    try {
      const rows = await fetchMomApplications();
      setApplications(rows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load MoM applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filtered = useMemo(
    () => applications.filter((application) => tabMatches(application.status, activeTab)),
    [applications, activeTab],
  );

  const openEditor = async (application) => {
    try {
      const response = await fetchMomGist(application.id);
      setEditorApp(application);
      setEditorValue(response.gist_content);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load gist.");
    }
  };

  const handleSaveGist = async (content) => {
    if (!editorApp) return;
    setSavingGist(true);
    try {
      await saveMomGist(editorApp.id, content);
      setApplications((current) => current.map((app) => (
        app.id === editorApp.id ? { ...app, gist_content: content } : app
      )));
      setEditorApp(null);
      toast.success("Gist updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save gist.");
    } finally {
      setSavingGist(false);
    }
  };

  const handleConvert = async (application) => {
    setBusyId(application.id);
    try {
      const result = await convertMom(application.id);
      setDownloadsById((current) => ({
        ...current,
        [application.id]: result,
      }));
      toast.success("MoM generated successfully.");
      await loadApplications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to convert to MoM.");
    } finally {
      setBusyId(null);
    }
  };

  const handleFinalize = async (application) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    setBusyId(application.id);
    try {
      const result = await finalizeMom(application.id);
      toast.success("MoM finalized and locked.");
      setApplications((current) => current.map((item) => (
        item.id === application.id
          ? { ...item, status: "Finalized", finalized: 1, finalized_at: result.finalizedAt }
          : item
      )));
      await loadApplications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to finalize MoM.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MoM Team Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Review referred applications, edit GIST, generate MoM documents, and finalize records.</p>
          </div>
          <button className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={loadApplications}>
            Refresh
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {["To Review", "MoM Generated", "Finalized"].map((tab) => (
            <button
              key={tab}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab ? "bg-purple-700 text-white" : "bg-white text-gray-700 border hover:bg-gray-50"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">App ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Project Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-gray-500" colSpan={5}>Loading MoM applications...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-gray-500" colSpan={5}>No applications in this tab.</td>
                </tr>
              ) : (
                filtered.map((application) => {
                  const finalized = Number(application.finalized || 0) === 1 || application.status === "Finalized";
                  const downloads = downloadsById[application.id];
                  const isBusy = busyId === application.id;

                  return (
                    <tr key={application.id}>
                      <td className="px-4 py-4 text-sm font-mono text-gray-700">{application.application_id}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{application.project_name}</div>
                        <div className="text-xs text-gray-500">{application.proponent_name} · {application.sector_name}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{application.category}</td>
                      <td className="px-4 py-4"><StatusBadge status={application.status} /></td>
                      <td className="px-4 py-4">
                        {finalized ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Lock Finalized on {fmtDate(application.finalized_at)}
                          </span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="rounded-lg border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                disabled={finalized}
                                onClick={() => openEditor(application)}
                              >
                                Edit Gist
                              </button>
                              <button
                                className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                                disabled={finalized || isBusy}
                                onClick={() => handleConvert(application)}
                              >
                                {isBusy ? "Working..." : "Convert to MoM"}
                              </button>
                              <button
                                className="rounded-lg bg-green-700 px-3 py-2 text-xs font-medium text-white hover:bg-green-800 disabled:opacity-60"
                                disabled={finalized || isBusy}
                                onClick={() => handleFinalize(application)}
                              >
                                Finalize & Lock
                              </button>
                            </div>
                            {downloads && (
                              <div className="flex flex-wrap gap-3 text-xs">
                                <button className="text-blue-700 hover:underline" onClick={() => downloadUrl(downloads.docxUrl, `${application.application_id}_mom.docx`)}>
                                  Download .docx
                                </button>
                                <button className="text-blue-700 hover:underline" onClick={() => downloadUrl(downloads.pdfUrl, `${application.application_id}_mom.pdf`)}>
                                  Download .pdf
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editorApp && (
        <GistModal
          application={editorApp}
          initialValue={editorValue}
          saving={savingGist}
          onClose={() => setEditorApp(null)}
          onSave={handleSaveGist}
        />
      )}
    </div>
  );
}

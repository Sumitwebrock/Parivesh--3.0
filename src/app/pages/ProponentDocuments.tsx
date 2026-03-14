import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { ProponentSidebar } from "../components/ProponentSidebar";
import {
  documentDownloadUrl,
  fetchApplicationDocuments,
  fetchApplications,
  uploadApplicationDocument,
  type ApplicationDocument,
  type ApplicationRow,
} from "../services/ppPortal";
import { Download, Loader2, Upload } from "lucide-react";

export default function ProponentDocuments() {
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [docs, setDocs] = useState<ApplicationDocument[]>([]);
  const [docName, setDocName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const list = await fetchApplications();
        setApps(list);
        if (list.length) setSelectedApp(list[0].id);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selectedApp) return;
      try {
        setDocs(await fetchApplicationDocuments(selectedApp));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load documents.");
      }
    };
    run();
  }, [selectedApp]);

  const upload = async (file: File | null) => {
    if (!selectedApp || !file) return;
    const name = docName.trim() || file.name;
    try {
      await uploadApplicationDocument(selectedApp, name, file);
      setDocName("");
      setDocs(await fetchApplicationDocuments(selectedApp));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
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
              <h1 className="text-3xl font-bold text-gray-800">Documents</h1>
              <p className="text-gray-600">Upload and manage application documents securely.</p>
            </div>

            {error && <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

            <div className="bg-white rounded-xl shadow-md p-5 grid md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="text-sm font-medium block mb-1">Application</label>
                <select className="w-full border rounded-lg px-3 py-2" value={selectedApp ?? ""} onChange={(e) => setSelectedApp(Number(e.target.value) || null)}>
                  <option value="">Select Application</option>
                  {apps.map((a) => <option key={a.id} value={a.id}>{a.application_id} - {a.project_name}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="text-sm font-medium block mb-1">Document Name</label>
                <input className="w-full border rounded-lg px-3 py-2" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. Revised EIA" />
              </div>
              <div className="md:col-span-1">
                <label className="inline-flex items-center justify-center gap-2 w-full text-sm bg-[#1A5C1A] text-white px-4 py-2 rounded-lg cursor-pointer">
                  <Upload className="w-4 h-4" /> Upload File
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => upload(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {loading ? (
                <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1A5C1A]" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Document</th>
                        <th className="px-4 py-3 text-left">File Name</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Deficiency Comment</th>
                        <th className="px-4 py-3 text-left">Uploaded</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {docs.length === 0 ? (
                        <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={6}>No documents uploaded yet.</td></tr>
                      ) : docs.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{d.doc_name}</td>
                          <td className="px-4 py-3">{d.original_name}</td>
                          <td className="px-4 py-3">{d.verification_status}</td>
                          <td className="px-4 py-3 text-xs text-orange-700">{d.deficiency_comment || "-"}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(d.uploaded_at).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <a href={documentDownloadUrl(d.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#1A5C1A] hover:underline">
                              <Download className="w-4 h-4" /> Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

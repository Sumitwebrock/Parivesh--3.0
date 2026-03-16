import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { ProponentSidebar } from "../components/ProponentSidebar";
import { fetchApplications, fetchTracking, type ApplicationRow } from "../services/ppPortal";
import { Loader2, Download, Lock, ChevronDown, ChevronUp } from "lucide-react";

const API_ORIGIN = "http://localhost:8787";
async function downloadMoM(appId: number, format: "docx" | "pdf") {
  const token = localStorage.getItem("parivesh_auth_token") || "";
  const res = await fetch(`${API_ORIGIN}/api/pp/applications/${appId}/mom/${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) { alert("MoM document not available."); return; }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MoM_${appId}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

type Tracking = Awaited<ReturnType<typeof fetchTracking>>;

function parseSummaryBullets(summary: string): string[] {
  return String(summary || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

export default function ProponentTrack() {
  const [searchParams] = useSearchParams();
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdsSummary, setShowEdsSummary] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const list = await fetchApplications();
        setApps(list);
        if (list.length) {
          const requested = searchParams.get("app") || "";
          const requestedId = Number(requested || 0);
          const byId = requestedId ? list.find((item) => item.id === requestedId) : null;
          const byRef = requested ? list.find((item) => String(item.application_id).toLowerCase() === requested.toLowerCase()) : null;
          setSelected((byId ?? byRef ?? list[0]).id);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [searchParams]);

  const stageSequence = ["Draft", "Submitted", "Under Scrutiny", "EDS", "Referred", "Finalized"];
  const currentStageIndex = tracking ? Math.max(stageSequence.indexOf(tracking.status), 0) : 0;

  useEffect(() => {
    const run = async () => {
      if (!selected) return;
      try {
        setTracking(await fetchTracking(selected));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load tracking.");
      }
    };
    run();
  }, [selected]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <div className="flex">
        <ProponentSidebar />

        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-4 lg:col-span-1">
              <h2 className="font-semibold mb-3">My Applications</h2>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <div className="space-y-2">
                  {apps.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelected(a.id)}
                      className={`w-full text-left border rounded-lg p-3 ${selected === a.id ? "border-[#1A5C1A] bg-[#E8F5E9]" : "border-gray-200"}`}
                    >
                      <p className="text-xs text-gray-500">{a.application_id}</p>
                      <p className="font-medium text-sm mt-1">{a.project_name}</p>
                      <p className="text-xs mt-1 text-gray-600">{a.status}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 lg:col-span-2">
              <h2 className="font-semibold mb-4">Application Status Tracking</h2>
              {error && <div className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</div>}
              {!tracking ? (
                <p className="text-sm text-gray-500">Select an application to view timeline.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    <Info label="Current Status" value={tracking.status} />
                    <Info label="Payment Status" value={tracking.paymentStatus} />
                    <Info label="Reference" value={tracking.applicationId} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {stageSequence.map((stage, index) => {
                      const isCurrent = index === currentStageIndex;
                      const isCompleted = index < currentStageIndex;
                      return (
                        <div
                          key={stage}
                          className="rounded-lg border px-2 py-3 text-center"
                          style={{
                            background: isCurrent ? "#fff7ed" : isCompleted ? "#f0fdf4" : "#f9fafb",
                            borderColor: isCurrent ? "#fdba74" : isCompleted ? "#86efac" : "#e5e7eb",
                          }}
                        >
                          <p className="text-[10px] uppercase text-gray-500 font-semibold">Stage {index + 1}</p>
                          <p className="text-xs font-semibold mt-1">{stage}</p>
                        </div>
                      );
                    })}
                  </div>
                  {tracking.status === "EDS" && (
                    <div className="space-y-3">
                      <div className="text-sm bg-orange-50 text-orange-800 border border-orange-200 rounded-lg p-3">
                        <strong>EDS Comments:</strong> {tracking.edsComments || "Please review scrutiny deficiency comments and re-upload corrected documents."}
                      </div>
                      <div className="border border-orange-200 bg-orange-50 rounded-lg">
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 text-left"
                          onClick={() => setShowEdsSummary((prev) => !prev)}
                        >
                          <div>
                            <p className="text-sm font-semibold text-orange-900">View EDS Details</p>
                            <p className="text-xs text-orange-700">Automated summary of corrections required before resubmission.</p>
                          </div>
                          {showEdsSummary ? <ChevronUp className="w-4 h-4 text-orange-700" /> : <ChevronDown className="w-4 h-4 text-orange-700" />}
                        </button>
                        {showEdsSummary && (
                          <div className="px-4 pb-4">
                            {tracking.edsSummary?.trim() ? (
                              <ul className="space-y-1 text-sm text-orange-900 list-disc pl-5">
                                {parseSummaryBullets(tracking.edsSummary).map((item, idx) => (
                                  <li key={`${idx}-${item}`}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-orange-800">Summary is not available yet. Please follow the EDS comments and flagged documents.</p>
                            )}
                            <p className="text-xs text-orange-700 mt-3">This summary is read-only. Update your application and upload revised documents, then resubmit.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {tracking.status === "Finalized" && selected && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Minutes of Meeting — Available for Download
                      </p>
                      <p className="text-xs text-green-700 mb-3">Your application has been finalized. The official MoM document is now available.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => downloadMoM(selected, "docx")}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg text-sm font-medium hover:bg-green-50"
                        >
                          <Download className="w-4 h-4" />
                          Download DOCX
                        </button>
                        <button
                          onClick={() => downloadMoM(selected, "pdf")}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg text-sm font-medium hover:bg-green-50"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="border rounded-lg">
                    {tracking.history.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3">No timeline yet.</p>
                    ) : (
                      <ul className="divide-y">
                        {tracking.history.map((h) => (
                          <li key={h.id} className="p-3">
                            <p className="font-medium text-sm">{h.status}</p>
                            <p className="text-xs text-gray-600 mt-1">{h.comment || "No comment"}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(h.created_at).toLocaleString()}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium mt-1">{value}</p>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import {
  fetchScrutinyApplication,
  fetchScrutinyQueue,
  generateGist,
  issueEds,
  referToMeeting,
  scrutinyDocumentDownloadUrl,
  scrutinyGistDownloadUrl,
  verifyDocument,
  verifyPayment,
  type ScrutinyApplicationDetail,
  type ScrutinyQueueItem,
} from "../services/scrutiny";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type PaymentVerification = "Verified" | "Pending" | "Invalid";

const statusBadge: Record<string, string> = {
  Submitted: "bg-blue-100 text-blue-700",
  "Under Scrutiny": "bg-yellow-100 text-yellow-800",
  EDS: "bg-orange-100 text-orange-800",
  Referred: "bg-green-100 text-green-700",
  Finalized: "bg-emerald-100 text-emerald-800",
};

function parseJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export default function ScrutinyDashboard() {
  const [queue, setQueue] = useState<ScrutinyQueueItem[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ScrutinyApplicationDetail | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "priority">("latest");

  const [paymentVerification, setPaymentVerification] = useState<PaymentVerification>("Pending");
  const [edsComments, setEdsComments] = useState("");
  const [edsRemarks, setEdsRemarks] = useState("");
  const [edsDocIds, setEdsDocIds] = useState<number[]>([]);
  const [savingAction, setSavingAction] = useState(false);

  const [gistLinks, setGistLinks] = useState<{ docx: string; pdf: string } | null>(null);

  const sectorOptions = useMemo(() => {
    const values = new Set(queue.map((q) => q.sector));
    return ["all", ...Array.from(values)];
  }, [queue]);

  const loadQueue = async () => {
    setLoadingQueue(true);
    setError("");
    try {
      const rows = await fetchScrutinyQueue({
        status: statusFilter,
        category: categoryFilter,
        sector: sectorFilter,
        sort: sortBy,
      });
      setQueue(rows);
      if (rows.length && !selectedId) setSelectedId(rows[0].id);
      if (!rows.length) {
        setSelectedId(null);
        setDetail(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load scrutiny queue.");
    } finally {
      setLoadingQueue(false);
    }
  };

  const loadDetail = async (id: number) => {
    setLoadingDetail(true);
    setError("");
    setOk("");
    try {
      const d = await fetchScrutinyApplication(id);
      setDetail(d);
      setPaymentVerification((d.review?.payment_verification as PaymentVerification) ?? "Pending");
      setEdsComments(d.application.eds_comments ?? "");
      setEdsRemarks("");
      const preFlagged = d.documents
        .filter((doc) => doc.verification_status === "Flagged")
        .map((doc) => doc.id);
      setEdsDocIds(preFlagged);
      setGistLinks({
        docx: scrutinyGistDownloadUrl(id, "docx"),
        pdf: scrutinyGistDownloadUrl(id, "pdf"),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load application details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [statusFilter, categoryFilter, sectorFilter, sortBy]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId]);

  const setDocVerification = async (docId: number, verificationStatus: "Verified" | "Flagged") => {
    if (!detail) return;
    setSavingAction(true);
    setError("");
    setOk("");
    try {
      await verifyDocument(detail.application.id, docId, {
        verificationStatus,
        deficiencyComment: verificationStatus === "Flagged" ? edsComments || "Flagged during scrutiny review." : "",
      });
      setOk(`Document marked as ${verificationStatus}.`);
      await loadDetail(detail.application.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update document verification.");
    } finally {
      setSavingAction(false);
    }
  };

  const onVerifyPayment = async (nextStatus = paymentVerification) => {
    if (!detail) return;
    setSavingAction(true);
    setError("");
    setOk("");
    try {
      setPaymentVerification(nextStatus);
      await verifyPayment(detail.application.id, nextStatus);
      setOk("Payment verification updated.");
      await loadDetail(detail.application.id);
      await loadQueue();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to verify payment.");
    } finally {
      setSavingAction(false);
    }
  };

  const onIssueEds = async () => {
    if (!detail) return;
    if (!edsComments.trim()) {
      setError("Deficiency comments are required for EDS.");
      return;
    }
    setSavingAction(true);
    setError("");
    setOk("");
    try {
      await issueEds(detail.application.id, {
        deficiencyComments: edsComments.trim(),
        flaggedDocumentIds: edsDocIds,
        remarks: edsRemarks.trim(),
      });
      setOk("EDS issued and application sent back to PP.");
      await loadDetail(detail.application.id);
      await loadQueue();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to issue EDS.");
    } finally {
      setSavingAction(false);
    }
  };

  const onGenerateGist = async () => {
    if (!detail) return;
    setSavingAction(true);
    setError("");
    setOk("");
    try {
      const result = await generateGist(detail.application.id);
      setGistLinks({
        docx: result.gist.docxDownloadUrl,
        pdf: result.gist.pdfDownloadUrl,
      });
      setOk("Draft meeting gist generated in DOCX and PDF.");
      await loadDetail(detail.application.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate gist.");
    } finally {
      setSavingAction(false);
    }
  };

  const onRefer = async () => {
    if (!detail) return;
    setSavingAction(true);
    setError("");
    setOk("");
    try {
      await referToMeeting(detail.application.id);
      setOk("Application referred to MoM successfully. Scrutiny stage locked.");
      await loadDetail(detail.application.id);
      await loadQueue();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to refer application.");
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-gray-800">Scrutiny Team Review Dashboard</h1>
          <p className="text-gray-600 mt-1">Verify applications, documents, payments, raise EDS, generate gist, and refer to meeting.</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
        {ok && <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-3 text-sm">{ok}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg">Application Queue</h2>
              <p className="text-xs text-gray-500">Only Submitted and Under Scrutiny applications appear here.</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <select className="border rounded px-2 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Scrutiny">Under Scrutiny</option>
                </select>
                <select className="border rounded px-2 py-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All Category</option>
                  <option value="A">A</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </select>
                <select className="border rounded px-2 py-2 text-sm" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                  {sectorOptions.map((s) => (
                    <option key={s} value={s}>{s === "all" ? "All Sector" : s}</option>
                  ))}
                </select>
                <select className="border rounded px-2 py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as "latest" | "priority") }>
                  <option value="latest">Latest First</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-auto divide-y divide-gray-100">
              {loadingQueue ? (
                <div className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
              ) : queue.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No applications in scrutiny queue.</div>
              ) : (
                queue.map((q) => (
                  <button
                    key={q.id}
                    className={`w-full text-left p-4 hover:bg-gray-50 ${selectedId === q.id ? "bg-blue-50" : ""}`}
                    onClick={() => setSelectedId(q.id)}
                  >
                    <div className="flex justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-800 truncate">{q.applicationId}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusBadge[q.currentStatus] ?? "bg-gray-100 text-gray-700"}`}>{q.currentStatus}</span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">{q.projectName}</p>
                    <p className="text-xs text-gray-500">{q.projectProponentName}</p>
                    <p className="text-xs text-gray-400 mt-1">{q.category} · {q.sector}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            {loadingDetail ? (
              <div className="p-12 text-center"><Loader2 className="w-7 h-7 animate-spin mx-auto text-gray-500" /></div>
            ) : !detail ? (
              <div className="p-12 text-center text-gray-500">Select an application from the queue.</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-800">{detail.application.application_id}</h2>
                    <span className={`text-xs px-2 py-1 rounded ${statusBadge[detail.application.status] ?? "bg-gray-100 text-gray-700"}`}>{detail.application.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{detail.application.project_name} · {detail.application.owner_name} · {detail.application.category} · {detail.application.sector_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Info label="Organization" value={detail.application.organization} />
                  <Info label="Project Type" value={detail.application.project_type || "-"} />
                  <Info label="Estimated Cost" value={`INR ${Number(detail.application.estimated_cost || 0).toLocaleString("en-IN")}`} />
                  <Info label="Location" value={[detail.application.district, detail.application.state].filter(Boolean).join(", ") || "-"} />
                </div>

                <Section title="Environmental Data">
                  <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto">{JSON.stringify(parseJson(detail.application.environmental_data), null, 2)}</pre>
                </Section>

                <Section title="Sector-Specific Parameters">
                  <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto">{JSON.stringify(parseJson(detail.application.sector_params_data), null, 2)}</pre>
                </Section>

                <Section title="Document Verification">
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">Doc</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Deficiency</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.documents.map((doc) => (
                          <tr key={doc.id} className="border-t">
                            <td className="px-3 py-2">
                              <div className="font-medium text-gray-800">{doc.doc_name}</div>
                              <div className="text-xs text-gray-500">{doc.original_name}</div>
                            </td>
                            <td className="px-3 py-2">{doc.verification_status}</td>
                            <td className="px-3 py-2 text-xs text-gray-600 max-w-xs">{doc.deficiency_comment || "-"}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <a
                                  className="px-2 py-1 text-xs rounded border"
                                  href={scrutinyDocumentDownloadUrl(doc.id)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Download
                                </a>
                                <button className="px-2 py-1 text-xs rounded bg-green-100 text-green-700" disabled={savingAction} onClick={() => setDocVerification(doc.id, "Verified")}>Verify</button>
                                <button className="px-2 py-1 text-xs rounded bg-red-100 text-red-700" disabled={savingAction} onClick={() => setDocVerification(doc.id, "Flagged")}>Flag</button>
                                <label className="text-xs inline-flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={edsDocIds.includes(doc.id)}
                                    onChange={(e) => {
                                      setEdsDocIds((prev) => e.target.checked ? [...prev, doc.id] : prev.filter((x) => x !== doc.id));
                                    }}
                                  />
                                  EDS
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                <Section title="Payment Verification">
                  <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <Info label="Current Payment Status" value={detail.payment?.status || detail.application.payment_status || "Not Initiated"} />
                      <Info label="Amount" value={`INR ${Number(detail.payment?.amount || 0).toLocaleString("en-IN")}`} />
                      <Info label="Payee UPI ID" value={detail.payment?.payee_upi_id || "sumitkumarsahoo772@okicici"} />
                      <Info label="UPI Reference Note" value={detail.payment?.upi_reference_note || `Application-${detail.application.application_id}`} />
                      <Info label="PP Transaction Reference" value={detail.payment?.upi_ref || "Awaiting declaration"} />
                      <Info label="Verified By" value={detail.payment?.verified_by || "Pending scrutiny review"} />
                      <Info label="Verified At" value={detail.payment?.verified_at ? new Date(detail.payment.verified_at).toLocaleString() : "Not verified yet"} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button className="px-3 py-2 rounded bg-slate-700 text-white text-sm disabled:opacity-60" disabled={savingAction} onClick={() => onVerifyPayment("Pending")}>Keep Pending</button>
                      <button className="inline-flex items-center gap-2 px-3 py-2 rounded bg-emerald-700 text-white text-sm disabled:opacity-60" disabled={savingAction} onClick={() => onVerifyPayment("Verified")}>
                        <CheckCircle2 className="w-4 h-4" /> Verify Payment
                      </button>
                      <button className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-700 text-white text-sm disabled:opacity-60" disabled={savingAction} onClick={() => onVerifyPayment("Invalid")}>
                        <XCircle className="w-4 h-4" /> Mark Invalid
                      </button>
                    </div>
                  </div>
                </Section>

                <Section title="EDS Workflow">
                  <div className="space-y-2">
                    <textarea
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Deficiency comments for project proponent"
                      value={edsComments}
                      onChange={(e) => setEdsComments(e.target.value)}
                    />
                    <textarea
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Additional remarks (optional)"
                      value={edsRemarks}
                      onChange={(e) => setEdsRemarks(e.target.value)}
                    />
                    <button className="px-3 py-2 rounded bg-orange-600 text-white text-sm disabled:opacity-60" disabled={savingAction} onClick={onIssueEds}>Issue EDS</button>
                  </div>
                </Section>

                <Section title="Meeting Gist Generation">
                  <div className="flex flex-wrap gap-3 items-center">
                    <button className="px-3 py-2 rounded bg-indigo-700 text-white text-sm disabled:opacity-60" disabled={savingAction} onClick={onGenerateGist}>Generate Gist</button>
                    {gistLinks && (
                      <>
                        <a className="px-3 py-2 rounded border text-sm" href={gistLinks.docx} target="_blank" rel="noreferrer">Download DOCX</a>
                        <a className="px-3 py-2 rounded border text-sm" href={gistLinks.pdf} target="_blank" rel="noreferrer">Download PDF</a>
                      </>
                    )}
                  </div>
                </Section>

                <Section title="Meeting Referral">
                  <button className="px-3 py-2 rounded bg-emerald-700 text-white text-sm disabled:opacity-60" disabled={savingAction || detail.application.status === "Referred" || detail.application.status === "Finalized"} onClick={onRefer}>Refer to Meeting</button>
                </Section>

                <Section title="Status Timeline">
                  <ul className="text-sm space-y-2">
                    {detail.history.map((h, idx) => (
                      <li key={`${h.created_at}-${idx}`} className="border-l-2 border-gray-200 pl-3">
                        <div className="font-medium">{h.status}</div>
                        <div className="text-xs text-gray-500">{h.comment || "-"}</div>
                        <div className="text-xs text-gray-400">{h.created_at} · {h.created_by}</div>
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "-"}</p>
    </div>
  );
}

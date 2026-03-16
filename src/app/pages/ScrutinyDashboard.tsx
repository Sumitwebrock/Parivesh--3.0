import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import {
  fetchScrutinyApplication,
  fetchScrutinyQueue,
  fetchStatusHistory,
  generateGist,
  issueEds,
  reopenToScrutiny,
  referToMeeting,
  runScrutinyVerification,
  scrutinyDocumentDownloadUrl,
  scrutinyGistDownloadUrl,
  verifyDocument,
  verifyPayment,
  type ScrutinyApplicationDetail,
  type ScrutinyVerificationResult,
  type ScrutinyQueueItem,
} from "../services/scrutiny";
import { GisEnvironmentalVerificationPanel } from "../components/GisEnvironmentalVerificationPanel";
import { StatusHistoryModal } from "../components/StatusHistoryModal";
import { CheckCircle2, ChevronDown, ChevronUp, History, Loader2, XCircle } from "lucide-react";

type PaymentVerification = "Verified" | "Pending" | "Invalid";

const statusBadge: Record<string, string> = {
  Submitted: "bg-blue-100 text-blue-700",
  "Under Scrutiny": "bg-yellow-100 text-yellow-800",
  EDS: "bg-orange-100 text-orange-800",
  Referred: "bg-green-100 text-green-700",
  Finalized: "bg-emerald-100 text-emerald-800",
};

const integrityBadge: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-800",
  mismatch: "bg-red-100 text-red-800",
  unavailable: "bg-amber-100 text-amber-800",
};

function parseJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function parseSummaryBullets(summary: string): string[] {
  return String(summary || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

function downloadFile(url: string, fileName?: string) {
  const link = document.createElement("a");
  link.href = url;
  if (fileName) link.download = fileName;
  link.target = "_blank";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  const [verificationOutcome, setVerificationOutcome] = useState<ScrutinyVerificationResult | null>(null);
  const [historyModal, setHistoryModal] = useState<{ id: number; ref: string } | null>(null);
  const [showEdsSummary, setShowEdsSummary] = useState(true);

  const sectorOptions = useMemo(() => {
    const values = new Set(queue.map((q) => q.sector));
    return ["all", ...Array.from(values)];
  }, [queue]);

  const localVerificationChecks = useMemo(() => {
    if (!detail) {
      return {
        checks: [] as Array<{ label: string; ok: boolean }> ,
        total: 0,
        passed: 0,
        failed: 0,
      };
    }

    const app = detail.application;
    const env = parseJson(app.environmental_data);

    const checks = [
      { label: "Project name available", ok: Boolean(app.project_name?.trim()) },
      { label: "Organization available", ok: Boolean(app.organization?.trim()) },
      { label: "Project type available", ok: Boolean(app.project_type?.trim()) },
      { label: "Location available (state + district)", ok: Boolean(app.state?.trim() && app.district?.trim()) },
      { label: "Estimated cost is valid", ok: Number(app.estimated_cost || 0) > 0 },
      { label: "Land area is valid", ok: Number(app.land_area || 0) > 0 },
      { label: "Environmental impact provided", ok: Boolean(String(env.impact ?? "").trim()) },
      { label: "Resource usage provided", ok: Boolean(String(env.resources ?? "").trim()) },
      { label: "Waste plan provided", ok: Boolean(String(env.wastePlan ?? "").trim()) },
      { label: "At least one document uploaded", ok: detail.documents.length > 0 },
      {
        label: "No flagged/missing documents",
        ok: detail.documents.every((d) => !["Flagged", "Missing"].includes(d.verification_status)),
      },
      {
        label: "Payment ready for scrutiny",
        ok: ["Pending Verification", "Verified"].includes(detail.payment?.status || detail.application.payment_status || ""),
      },
    ];

    const total = checks.length;
    const passed = checks.filter((c) => c.ok).length;
    const failed = total - passed;
    return { checks, total, passed, failed };
  }, [detail]);

  const isScrutinyLocked = useMemo(
    () => Boolean(detail && ["Referred", "Finalized"].includes(detail.application.status)),
    [detail],
  );

  const hasFlaggedDocuments = useMemo(
    () => Boolean(detail?.documents?.some((d) => d.verification_status === "Flagged")),
    [detail],
  );

  const isPaymentReadyForReferral = useMemo(
    () => Boolean(detail && ["Verified", "Pending Verification"].includes(detail.payment?.status || detail.application.payment_status || "")),
    [detail],
  );

  const canReferToMom = useMemo(
    () => Boolean(detail && !isScrutinyLocked && !hasFlaggedDocuments && isPaymentReadyForReferral),
    [detail, isScrutinyLocked, hasFlaggedDocuments, isPaymentReadyForReferral],
  );

  const integrity = useMemo(() => {
    if (!detail) return null;
    const payload = (detail as ScrutinyApplicationDetail & {
      integrity?: {
        status?: string;
        message?: string;
        txHash?: string | null;
        documentCount?: number;
      };
    }).integrity;
    if (!payload || typeof payload !== "object" || typeof payload.status !== "string") return null;
    return payload;
  }, [detail]);

  const referDisabledReason = useMemo(() => {
    if (!detail) return "Select an application first.";
    if (isScrutinyLocked) return "Application is already referred/finalized.";
    if (hasFlaggedDocuments) return "Clear flagged documents before referral.";
    if (!isPaymentReadyForReferral) return "Payment must be Verified or Pending Verification before referral.";
    return "";
  }, [detail, isScrutinyLocked, hasFlaggedDocuments, isPaymentReadyForReferral]);

  const automatedPotentialGapSummary = useMemo(() => {
    if (!detail) return [] as string[];

    const toBriefLine = (label: string): string => {
      switch (label) {
        case "Estimated cost is valid":
          return "Estimated project cost appears invalid or missing. Please provide a valid positive value.";
        case "Land area is valid":
          return "Land area appears invalid or missing. Please provide a valid positive value.";
        case "No flagged/missing documents":
          return "One or more uploaded documents are flagged or missing and require correction/re-upload.";
        case "At least one document uploaded":
          return "No supporting document has been uploaded yet.";
        case "Payment ready for scrutiny":
          return "Payment status is not ready for scrutiny; keep it Pending Verification or Verified.";
        default:
          return `${label} requires correction.`;
      }
    };

    const fromFailedChecks = localVerificationChecks.checks
      .filter((check) => !check.ok)
      .map((check) => toBriefLine(check.label));

    const selectedDocNames = detail.documents
      .filter((doc) => edsDocIds.includes(doc.id))
      .map((doc) => doc.doc_name.trim())
      .filter(Boolean);

    const selectedDocLine = selectedDocNames.length
      ? [`Documents selected for EDS correction: ${selectedDocNames.join(", ")}.`]
      : [];

    const reviewerLine = edsComments.trim()
      ? [`Reviewer note: ${edsComments.trim().split(/\r?\n/)[0]}`]
      : [];

    return Array.from(new Set([...fromFailedChecks, ...selectedDocLine, ...reviewerLine])).slice(0, 6);
  }, [detail, localVerificationChecks.checks, edsDocIds, edsComments]);

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

  const loadDetail = async (id: number, { silent = false } = {}) => {
    setLoadingDetail(true);
    if (!silent) {
      setError("");
      setOk("");
    }
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
      setGistLinks(
        d.gistRow
          ? {
              docx: scrutinyGistDownloadUrl(id, "docx"),
              pdf: scrutinyGistDownloadUrl(id, "pdf"),
            }
          : null,
      );
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
    setVerificationOutcome(null);
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

  const onSendBackToProponent = async () => {
    if (!detail) return;

    const fromManual = edsComments.trim();
    const fromVerification = verificationOutcome?.result === "EDS" ? verificationOutcome.edsMessage.trim() : "";
    const fromSummaryBullets = detail.application.eds_summary?.trim()
      ? parseSummaryBullets(detail.application.eds_summary).map((line, idx) => `${idx + 1}. ${line}`).join("\n")
      : "";
    const fromAutomated = automatedPotentialGapSummary.length
      ? automatedPotentialGapSummary.map((line, idx) => `${idx + 1}. ${line}`).join("\n")
      : "";

    const deficiencyComments =
      fromManual ||
      fromVerification ||
      (fromSummaryBullets ? `EDS generated from summary:\n${fromSummaryBullets}` : "") ||
      (fromAutomated ? `EDS generated from automated checks:\n${fromAutomated}` : "");

    if (!deficiencyComments.trim()) {
      setError("No EDS summary/details available to send back. Run verification or add comments first.");
      return;
    }

    setSavingAction(true);
    setError("");
    setOk("");
    try {
      await issueEds(detail.application.id, {
        deficiencyComments: deficiencyComments.trim(),
        flaggedDocumentIds: edsDocIds,
        remarks: edsRemarks.trim() || "Sent back to Proponent using EDS summary.",
      });
      setOk("Application sent back to Proponent with EDS summary successfully.");
      await loadDetail(detail.application.id);
      await loadQueue();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send application back to Proponent.");
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
      const links = {
        docx: result.gist.docxDownloadUrl,
        pdf: result.gist.pdfDownloadUrl,
      };
      setGistLinks(links);
      downloadFile(links.pdf, `${detail.application.application_id}_meeting_gist.pdf`);
      setOk("Draft meeting gist generated. PDF download started.");
      await loadDetail(detail.application.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate gist.");
    } finally {
      setSavingAction(false);
    }
  };

  const onRunVerification = async () => {
    if (!detail) return;
    setSavingAction(true);
    setError("");
    setOk("");
    try {
      const result = await runScrutinyVerification(detail.application.id);
      setVerificationOutcome(result);
      if (result.result === "VERIFIED") {
        setGistLinks({
          docx: result.gist.docxDownloadUrl,
          pdf: result.gist.pdfDownloadUrl,
        });
        setEdsComments("");
      } else {
        setEdsComments(result.edsMessage);
      }
      // reload silently so the reloads don't clear the feedback message
      await loadDetail(detail.application.id, { silent: true });
      await loadQueue();
      // set message AFTER reloads so it is never cleared by loadDetail
      if (result.result === "VERIFIED") {
        setOk("Scrutiny verification passed. Auto GIST generated and attached to the application.");
      } else {
        setOk(`EDS issued � ${result.deficiencyCount} deficiency item(s) found. Application returned to Proponent.`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to run scrutiny verification.");
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

  const onReopenToScrutiny = async () => {
    if (!detail) return;
    setSavingAction(true);
    setError("");
    setOk("");
    try {
      await reopenToScrutiny(detail.application.id);
      setOk("Application reopened to scrutiny. Document verification and scrutiny actions are enabled now.");
      await loadDetail(detail.application.id);
      await loadQueue();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reopen application to scrutiny.");
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
                  <option value="EDS">EDS Returned</option>
                  <option value="Referred">Referred</option>
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
                    <p className="text-xs text-gray-400 mt-1">{q.category} � {q.sector}</p>
                    <button
                      className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                      onClick={(e) => { e.stopPropagation(); setHistoryModal({ id: q.id, ref: q.applicationId }); }}
                    >
                      <History className="w-3 h-3" /> View History
                    </button>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              {detail ? (
                <div className="space-y-4">
                  <GisEnvironmentalVerificationPanel application={detail.application} />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                  Select an application to load GIS environmental verification.
                </div>
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
                  <p className="text-sm text-gray-600 mt-1">{detail.application.project_name} � {detail.application.owner_name} � {detail.application.category} � {detail.application.sector_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Info label="Organization" value={detail.application.organization} />
                  <Info label="Project Type" value={detail.application.project_type || "-"} />
                  <Info label="Estimated Cost" value={`INR ${Number(detail.application.estimated_cost || 0).toLocaleString("en-IN")}`} />
                  <Info label="Location" value={[detail.application.district, detail.application.state].filter(Boolean).join(", ") || "-"} />
                </div>

                {integrity && (
                  <Section title="Document Integrity Status">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-gray-800">Blockchain verification</p>
                        <span className={`text-xs px-2 py-1 rounded ${integrityBadge[integrity.status] ?? integrityBadge.unavailable}`}>
                          {integrity.status === "verified"
                            ? "Verified"
                            : integrity.status === "mismatch"
                              ? "Integrity Mismatch"
                              : "Pending"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{integrity.message || "No blockchain integrity payload available."}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                        <p>Anchored Tx: {integrity.txHash || "-"}</p>
                        <p>Documents in hash: {integrity.documentCount ?? 0}</p>
                      </div>
                    </div>
                  </Section>
                )}

                <Section title="Document Verification">
                  {isScrutinyLocked && (
                    <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Scrutiny stage is locked for this application. Document verification actions are disabled.
                    </div>
                  )}
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
                                <button className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 disabled:opacity-60" disabled={savingAction || isScrutinyLocked} onClick={() => setDocVerification(doc.id, "Verified")}>Verify</button>
                                <button className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 disabled:opacity-60" disabled={savingAction || isScrutinyLocked} onClick={() => setDocVerification(doc.id, "Flagged")}>Flag</button>
                                <label className="text-xs inline-flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={edsDocIds.includes(doc.id)}
                                    disabled={savingAction || isScrutinyLocked}
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

                <Section title="Requirement Validation & Verification">
                  <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <p className="text-sm text-sky-900">
                      Checks required documents, mandatory fields, data completeness, and data correctness.
                      Failed validation auto-issues EDS and sends the case back to Proponent. Successful validation auto-generates GIST.
                    </p>
                    <div className="rounded-lg border border-sky-200 bg-white p-3 text-sm">
                      <p className="font-medium text-sky-900">
                        Readiness: {localVerificationChecks.passed}/{localVerificationChecks.total} checks passed
                      </p>
                      <p className={`text-xs mt-1 ${localVerificationChecks.failed ? "text-orange-700" : "text-emerald-700"}`}>
                        {localVerificationChecks.failed
                          ? `${localVerificationChecks.failed} potential gap(s) detected. You can still run verification to auto-generate formal EDS.`
                          : "All local checks look good. Run verification to auto-generate GIST."}
                      </p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
                        {localVerificationChecks.checks.map((c) => (
                          <div key={c.label} className={`text-xs px-2 py-1 rounded ${c.ok ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                            {c.ok ? "PASS" : "CHECK"} - {c.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      className="px-3 py-2 rounded bg-sky-700 text-white text-sm disabled:opacity-60"
                      disabled={savingAction || isScrutinyLocked}
                      onClick={onRunVerification}
                    >
                      {isScrutinyLocked
                        ? "Verification Locked"
                        : savingAction
                          ? "Running Verification..."
                          : "Run Scrutiny Verification"}
                    </button>
                    {isScrutinyLocked && (
                      <p className="text-xs text-gray-600">This application is already beyond scrutiny stage.</p>
                    )}
                    {verificationOutcome?.result === "EDS" && (
                      <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                        <XCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-orange-800">
                            EDS Generated \u2014 {verificationOutcome.deficiencyCount} deficiency item(s) found
                          </p>
                          <p className="text-xs text-orange-700 mt-0.5">
                            Application returned to Proponent for correction. See details below.
                          </p>
                        </div>
                      </div>
                    )}
                    {verificationOutcome?.result === "VERIFIED" && (
                      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            All requirements satisfied \u2014 GIST auto-generated
                          </p>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            See GIST download links in the Auto GIST section below.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>

                <Section title="EDS Summary (Read-only)">
                  <div className="rounded-xl border border-orange-200 bg-orange-50">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                      onClick={() => setShowEdsSummary((prev) => !prev)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-orange-900">Automated Summary of Required Changes</p>
                        <p className="text-xs text-orange-700">Available for scrutiny re-review and proponent resubmission guidance.</p>
                      </div>
                      {showEdsSummary ? <ChevronUp className="w-4 h-4 text-orange-700" /> : <ChevronDown className="w-4 h-4 text-orange-700" />}
                    </button>
                    {showEdsSummary && (
                      <div className="px-4 pb-4">
                        {detail.application.eds_summary?.trim() ? (
                          <ul className="space-y-1 text-sm text-orange-900 list-disc pl-5">
                            {parseSummaryBullets(detail.application.eds_summary).map((item, idx) => (
                              <li key={`${idx}-${item}`}>{item}</li>
                            ))}
                          </ul>
                        ) : automatedPotentialGapSummary.length ? (
                          <ul className="space-y-1 text-sm text-orange-900 list-disc pl-5">
                            {automatedPotentialGapSummary.map((item, idx) => (
                              <li key={`${idx}-${item}`}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-orange-800">No potential gaps detected currently. Run scrutiny verification or issue EDS to generate a formal summary.</p>
                        )}
                      </div>
                    )}
                  </div>
                </Section>

                <Section title="Payment Verification">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="border rounded px-2 py-2 text-sm"
                      value={paymentVerification}
                      onChange={(e) => setPaymentVerification(e.target.value as PaymentVerification)}
                      disabled={savingAction || isScrutinyLocked}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Invalid">Invalid</option>
                    </select>
                    <button
                      className="px-3 py-2 rounded bg-blue-700 text-white text-sm disabled:opacity-60"
                      disabled={savingAction || isScrutinyLocked}
                      onClick={() => onVerifyPayment(paymentVerification)}
                    >
                      Save Payment Review
                    </button>
                  </div>
                </Section>

                <Section title="Manual Actions">
                  <div className="space-y-3">
                    <textarea
                      className="w-full border rounded-lg p-3 text-sm"
                      rows={3}
                      value={edsComments}
                      onChange={(e) => setEdsComments(e.target.value)}
                      placeholder="Deficiency comments for EDS"
                      disabled={savingAction || isScrutinyLocked}
                    />
                    <input
                      className="w-full border rounded-lg p-3 text-sm"
                      value={edsRemarks}
                      onChange={(e) => setEdsRemarks(e.target.value)}
                      placeholder="Optional EDS remarks"
                      disabled={savingAction || isScrutinyLocked}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-2 rounded bg-orange-700 text-white text-sm disabled:opacity-60"
                        disabled={savingAction || isScrutinyLocked || !edsComments.trim()}
                        onClick={onIssueEds}
                      >
                        Issue EDS
                      </button>
                      <button
                        className="px-3 py-2 rounded bg-rose-700 text-white text-sm disabled:opacity-60"
                        disabled={savingAction || isScrutinyLocked}
                        onClick={onSendBackToProponent}
                      >
                        Send Back to Proponent
                      </button>
                      <button
                        className="px-3 py-2 rounded bg-emerald-700 text-white text-sm disabled:opacity-60"
                        disabled={savingAction || isScrutinyLocked}
                        onClick={onGenerateGist}
                      >
                        Generate Draft GIST
                      </button>
                      <button
                        className="px-3 py-2 rounded bg-purple-700 text-white text-sm disabled:opacity-60"
                        disabled={savingAction || !canReferToMom}
                        onClick={onRefer}
                      >
                        Refer to MoM
                      </button>
                    </div>
                    {!edsComments.trim() && !isScrutinyLocked && (
                      <p className="text-xs text-orange-700">Enter deficiency comments to enable Issue EDS.</p>
                    )}
                    {!canReferToMom && (
                      <p className="text-xs text-amber-700">{referDisabledReason}</p>
                    )}
                    {isScrutinyLocked && (
                      <p className="text-xs text-gray-600">Actions are locked because this application is already referred/finalized.</p>
                    )}
                    {detail.application.status === "Referred" && (
                      <button
                        className="px-3 py-2 rounded border border-sky-700 text-sky-700 text-sm disabled:opacity-60"
                        disabled={savingAction}
                        onClick={onReopenToScrutiny}
                      >
                        Reopen to Scrutiny
                      </button>
                    )}

                    {gistLinks && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-sm font-medium text-emerald-800">Generated GIST files</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                          <a className="text-emerald-700 hover:underline" href={gistLinks.pdf} target="_blank" rel="noreferrer">
                            Download PDF
                          </a>
                          <a className="text-emerald-700 hover:underline" href={gistLinks.docx} target="_blank" rel="noreferrer">
                            Download DOCX
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>

      {historyModal && (
        <StatusHistoryModal
          applicationId={historyModal.id}
          applicationRef={historyModal.ref}
          onClose={() => setHistoryModal(null)}
          fetchHistory={fetchStatusHistory}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value || "-"}</p>
    </div>
  );
}


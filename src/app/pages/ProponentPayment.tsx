import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { ProponentSidebar } from "../components/ProponentSidebar";
import { fetchApplicationById, fetchApplications, fetchRecentPayments, initiatePayment, markPaymentPaid, type ApplicationRow, type RecentPaymentRow } from "../services/ppPortal";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { ApplicationFeePaymentCard } from "../components/ApplicationFeePaymentCard";

const DEFAULT_UPI_ID = "sumitkumarsahoo772@okicici";
const DEFAULT_UPI_NAME = "GraamSetu Portal";

function buildUpiIntent(upiId: string, amount: number | null, note: string) {
  if (!upiId || !amount) return "";
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(DEFAULT_UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}

function normalizeQrPayload(payload: string, amount: number | null, note: string) {
  const expectedPayee = `pa=${encodeURIComponent(DEFAULT_UPI_ID)}`;
  if (payload?.includes(expectedPayee)) return payload;
  return buildUpiIntent(DEFAULT_UPI_ID, amount, note);
}

export default function ProponentPayment() {
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [qrPayload, setQrPayload] = useState("");
  const [upiId, setUpiId] = useState(DEFAULT_UPI_ID);
  const [upiNote, setUpiNote] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Not Initiated");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [recentPayments, setRecentPayments] = useState<RecentPaymentRow[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [showPaidAnimation, setShowPaidAnimation] = useState(false);

  const selectedMeta = useMemo(() => apps.find((a) => a.id === selectedApp) ?? null, [apps, selectedApp]);

  const loadRecentPayments = async () => {
    try {
      setRecentPayments(await fetchRecentPayments(12));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "";
      if (message.includes("404")) {
        setRecentPayments([]);
        return;
      }
    }
  };

  const estimatedAmount = useMemo(() => {
    if (!selectedMeta) return null;
    if (selectedMeta.category === "A") return 15000;
    if (selectedMeta.category === "B1") return 2000;
    if (selectedMeta.category === "B2") return 7000;
    return 5000;
  }, [selectedMeta]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const list = await fetchApplications();
        setApps(list);
        if (list.length) setSelectedApp(list[0].id);
        await loadRecentPayments();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!selectedApp) return;
      try {
        const data = await fetchApplicationById(selectedApp);
        if (cancelled) return;

        const fallbackNote = `Application-${data.application_id}`;
        const existingPayment = data.payment;
        const nextUpiId = DEFAULT_UPI_ID;
        const nextUpiNote = existingPayment?.upi_reference_note || fallbackNote;
        const nextAmount = existingPayment?.amount ?? estimatedAmount;
        const nextStatus = existingPayment?.status || data.payment_status || "Not Initiated";
        const existingQrPayload = existingPayment?.qr_payload?.trim() || "";
        const canRegenerateQr = !existingPayment || ["Not Initiated", "Initiated", "Pending"].includes(nextStatus);

        if (!existingQrPayload && canRegenerateQr) {
          const payment = await initiatePayment(selectedApp);
          if (cancelled) return;
          setAmount(payment.amount);
          setQrPayload(payment.qrPayload);
          setPaymentStatus(payment.status);
          setUpiId(payment.upiId || DEFAULT_UPI_ID);
          setUpiNote(payment.upiReferenceNote || fallbackNote);
          setUpiRef("");
          setVerifiedBy("");
          setVerifiedAt(null);
          return;
        }

        setAmount(existingPayment?.amount ?? null);
        setQrPayload(normalizeQrPayload(existingQrPayload, nextAmount, nextUpiNote));
        setUpiId(nextUpiId);
        setUpiNote(nextUpiNote);
        setVerifiedBy(existingPayment?.verified_by || "");
        setVerifiedAt(existingPayment?.verified_at ?? null);
        setUpiRef(existingPayment?.upi_ref || "");
        setPaymentStatus(nextStatus);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load payment details.");
        }
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [estimatedAmount, selectedApp]);

  const onGenerate = async () => {
    if (!selectedApp) return;
    setError("");
    setOk("");
    setActionLoading(true);
    try {
      const p = await initiatePayment(selectedApp);
      setAmount(p.amount);
      setQrPayload(normalizeQrPayload(p.qrPayload, p.amount, p.upiReferenceNote));
      setPaymentStatus(p.status);
      setUpiId(DEFAULT_UPI_ID);
      setUpiNote(p.upiReferenceNote);
      setVerifiedBy("");
      setVerifiedAt(null);
      setOk("QR refreshed. Scan with any UPI app and complete payment.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to initiate payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const onMarkPaid = async () => {
    if (!selectedApp) return;
    setError("");
    setOk("");
    setActionLoading(true);
    try {
      const res = await markPaymentPaid(selectedApp, upiRef);
      setPaymentStatus(res.paymentStatus);
      setOk("Payment submitted successfully. Status updated to Pending Verification.");
      setShowPaidAnimation(true);
      window.setTimeout(() => setShowPaidAnimation(false), 1800);
      await loadRecentPayments();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to mark payment.");
    } finally {
      setActionLoading(false);
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
              <h1 className="text-3xl font-bold text-gray-800">Application Fee Payment</h1>
              <p className="text-gray-600">Scan UPI QR and submit payment for scrutiny verification.</p>
            </div>

            {error && <div className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
            {ok && <div className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{ok}</div>}

            {loading ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1A5C1A]" /></div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-md p-5">
                  <label className="block text-sm font-medium mb-2">Application</label>
                  <select className="w-full border rounded-lg px-3 py-2" value={selectedApp ?? ""} onChange={(e) => setSelectedApp(Number(e.target.value) || null)}>
                    <option value="">Select Application</option>
                    {apps.map((a) => (
                      <option key={a.id} value={a.id}>{a.application_id} - {a.project_name}</option>
                    ))}
                  </select>
                  {selectedMeta && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-500">Workflow: {selectedMeta.status}</p>
                      <p className="text-xs text-gray-500">Payment: {paymentStatus}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg bg-[#155b34] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4929] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => setPaymentModalOpen(true)}
                      disabled={!selectedApp}
                    >
                      Open Payment Popup
                    </button>
                  </div>
                </div>

                {paymentModalOpen && (
                  <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <button
                      type="button"
                      className="absolute inset-0 bg-black/55"
                      aria-label="Close payment popup"
                      onClick={() => setPaymentModalOpen(false)}
                    />
                    <div className="relative z-[1101] w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
                        <h2 className="text-sm font-semibold text-gray-800">Payment Popup</h2>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                          onClick={() => setPaymentModalOpen(false)}
                          aria-label="Close"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="p-4">
                        <ApplicationFeePaymentCard
                          applicationReference={selectedMeta?.application_id || applicationIdPlaceholder(selectedApp)}
                          applicationTitle={selectedMeta?.project_name}
                          workflowStatus={selectedMeta?.status}
                          amount={amount ?? estimatedAmount}
                          qrPayload={qrPayload}
                          upiId={upiId}
                          upiNote={upiNote}
                          paymentStatus={paymentStatus}
                          upiRef={upiRef}
                          onUpiRefChange={setUpiRef}
                          onMarkPaid={onMarkPaid}
                          onRefresh={onGenerate}
                          loading={actionLoading}
                          compactView
                          disableActions={!selectedApp}
                          verifiedBy={verifiedBy}
                          verifiedAt={verifiedAt}
                          helperText={qrPayload ? "After payment submission, the scrutiny team will verify the fee before document scrutiny proceeds." : "A payment QR will be generated automatically for the selected application."}
                        />
                      </div>

                      {showPaidAnimation && (
                        <div className="absolute inset-0 z-[1202] flex items-center justify-center bg-black/45">
                          <div className="rounded-2xl bg-white px-8 py-6 shadow-2xl flex flex-col items-center gap-2 animate-[fadeIn_220ms_ease-out]">
                            <CheckCircle2 className="h-16 w-16 text-emerald-600 animate-[popIn_300ms_ease-out]" />
                            <p className="text-xl font-bold text-emerald-700">Paid</p>
                          </div>
                        </div>
                      )}

                      <style>{`
                        @keyframes popIn {
                          0% { transform: scale(0.7); opacity: 0; }
                          100% { transform: scale(1); opacity: 1; }
                        }
                        @keyframes fadeIn {
                          0% { opacity: 0; }
                          100% { opacity: 1; }
                        }
                      `}</style>
                    </div>
                  </div>
                )}

                <details className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <summary className="cursor-pointer text-sm font-medium">Technical UPI payload</summary>
                  <textarea className="w-full border rounded-lg px-3 py-2 text-xs mt-3" rows={4} value={qrPayload} readOnly />
                </details>

                <details className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <summary className="cursor-pointer p-4 border-b border-gray-100 font-semibold text-gray-800">Recent Paid Payments</summary>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-4 py-3 text-left">Application</th>
                          <th className="px-4 py-3 text-left">Project</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="px-4 py-3 text-left">UPI Ref</th>
                          <th className="px-4 py-3 text-left">Payment Status</th>
                          <th className="px-4 py-3 text-left">Workflow</th>
                          <th className="px-4 py-3 text-left">Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {recentPayments.length === 0 ? (
                          <tr>
                            <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>No paid payments yet.</td>
                          </tr>
                        ) : (
                          recentPayments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{payment.application_ref}</td>
                              <td className="px-4 py-3">{payment.project_name}</td>
                              <td className="px-4 py-3">INR {Number(payment.amount || 0).toLocaleString("en-IN")}</td>
                              <td className="px-4 py-3 text-xs">{payment.upi_ref || "-"}</td>
                              <td className="px-4 py-3">{payment.status}</td>
                              <td className="px-4 py-3">{payment.application_status}</td>
                              <td className="px-4 py-3 text-gray-500">{new Date(payment.updated_at).toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </details>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function applicationIdPlaceholder(selectedApp: number | null) {
  return selectedApp ? `Application #${selectedApp}` : "Draft application";
}

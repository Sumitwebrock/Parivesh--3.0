import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { ProponentSidebar } from "../components/ProponentSidebar";
import { fetchApplicationById, fetchApplications, initiatePayment, markPaymentPaid, type ApplicationRow } from "../services/ppPortal";
import { Loader2 } from "lucide-react";
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

  const selectedMeta = useMemo(() => apps.find((a) => a.id === selectedApp) ?? null, [apps, selectedApp]);

  const estimatedAmount = useMemo(() => {
    if (!selectedMeta) return null;
    if (selectedMeta.category === "A") return 15000;
    if (selectedMeta.category === "B1") return 10000;
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
                </div>

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
                  disableActions={!selectedApp}
                  verifiedBy={verifiedBy}
                  verifiedAt={verifiedAt}
                  helperText={qrPayload ? "After payment submission, the scrutiny team will verify the fee before document scrutiny proceeds." : "A payment QR will be generated automatically for the selected application."}
                />

                <details className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <summary className="cursor-pointer text-sm font-medium">Technical UPI payload</summary>
                  <textarea className="w-full border rounded-lg px-3 py-2 text-xs mt-3" rows={4} value={qrPayload} readOnly />
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

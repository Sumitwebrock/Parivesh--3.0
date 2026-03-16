import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  IndianRupee,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export type PaymentStep = "Not Initiated" | "Pending" | "Payment Submitted" | "Pending Verification" | "Verified" | "Invalid";

export function normalizePaymentStatus(status: string): PaymentStep {
  const value = String(status || "").trim();
  if (!value) return "Not Initiated";
  if (value === "Initiated") return "Pending";
  if (value === "Pending") return "Pending";
  if (value === "Payment Submitted") return "Payment Submitted";
  if (value === "Pending Verification") return "Pending Verification";
  if (value === "Verified") return "Verified";
  if (value === "Invalid") return "Invalid";
  return "Not Initiated";
}

type ApplicationFeePaymentCardProps = {
  title?: string;
  subtitle?: string;
  applicationReference: string;
  applicationTitle?: string;
  workflowStatus?: string;
  amount: number | null;
  qrPayload: string;
  upiId: string;
  upiNote: string;
  paymentStatus: string;
  upiRef: string;
  onUpiRefChange: (value: string) => void;
  onMarkPaid: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  disableActions?: boolean;
  verifiedBy?: string;
  verifiedAt?: string | null;
  helperText?: string;
  compactView?: boolean;
};

export function ApplicationFeePaymentCard({
  title = "Scan QR to Pay Application Fee",
  subtitle = "Use any UPI app to complete the application fee payment.",
  applicationReference,
  applicationTitle,
  workflowStatus,
  amount,
  qrPayload,
  upiId,
  upiNote,
  paymentStatus,
  upiRef,
  onUpiRefChange,
  onMarkPaid,
  onRefresh,
  loading = false,
  disableActions = false,
  verifiedBy,
  verifiedAt,
  helperText = "After payment submission, the scrutiny team will verify the fee before document scrutiny proceeds.",
  compactView = false,
}: ApplicationFeePaymentCardProps) {
  const normalizedStatus = useMemo(() => normalizePaymentStatus(paymentStatus), [paymentStatus]);
  const [copiedValue, setCopiedValue] = useState<"upi" | "note" | "link" | "">("");

  useEffect(() => {
    if (!copiedValue) return;
    const timer = window.setTimeout(() => setCopiedValue(""), 1600);
    return () => window.clearTimeout(timer);
  }, [copiedValue]);

  const statusPill = useMemo(() => {
    if (normalizedStatus === "Verified") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (normalizedStatus === "Pending Verification") return "bg-amber-100 text-amber-700 border-amber-200";
    if (normalizedStatus === "Pending" || normalizedStatus === "Payment Submitted") return "bg-sky-100 text-sky-700 border-sky-200";
    if (normalizedStatus === "Invalid") return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  }, [normalizedStatus]);

  const stepDone = useMemo(() => ({
    pending: ["Pending", "Payment Submitted", "Pending Verification", "Verified", "Invalid"].includes(normalizedStatus),
    submitted: ["Payment Submitted", "Pending Verification", "Verified", "Invalid"].includes(normalizedStatus),
    verification: ["Pending Verification", "Verified", "Invalid"].includes(normalizedStatus),
    verified: normalizedStatus === "Verified",
  }), [normalizedStatus]);

  const copyText = async (value: string, field: "upi" | "note" | "link") => {
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(field);
    } catch {
      setCopiedValue("");
    }
  };

  const canSubmitPayment = Boolean(qrPayload) && !disableActions && normalizedStatus !== "Pending Verification" && normalizedStatus !== "Verified";
  const canPayWithUpi = Boolean(qrPayload) && !disableActions;
  const canRefreshQr = Boolean(onRefresh) && !disableActions;

  return (
    <div className={`grid gap-6 ${compactView ? "" : "xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]"}`}>
      <div className="overflow-hidden rounded-[28px] border border-[#dbe6d6] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className={`border-b border-[#e6efe3] bg-[linear-gradient(135deg,#0f4f2c_0%,#1f6f43_58%,#eef7ef_58%,#fbf5e8_100%)] text-white ${compactView ? "px-4 py-3 md:px-5" : "px-6 py-6 md:px-8"}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className={`max-w-2xl ${compactView ? "space-y-1" : "space-y-2"}`}>
              <div className={`inline-flex items-center gap-2 rounded-full bg-white/12 uppercase text-white/90 ${compactView ? "px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em]" : "px-3 py-1 text-xs font-medium tracking-[0.18em]"}`}>
                <ShieldCheck className="h-4 w-4" /> Secure UPI Collection
              </div>
              <h2 className={`${compactView ? "text-lg" : "text-2xl"} font-semibold tracking-tight`}>{title}</h2>
              {!compactView && <p className="max-w-xl text-sm text-white/85">{subtitle}</p>}
            </div>
            <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusPill}`}>
              {normalizedStatus}
            </div>
          </div>
        </div>

        <div className={`grid gap-5 ${compactView ? "p-4 md:grid-cols-[190px_minmax(0,1fr)] md:p-5" : "p-6 md:grid-cols-[280px_minmax(0,1fr)] md:p-8"}`}>
          <div className={`flex flex-col items-center justify-center rounded-[24px] border border-[#e8edf2] bg-[radial-gradient(circle_at_top,#f5fbff_0%,#f7fbf2_62%,#ffffff_100%)] text-center ${compactView ? "px-3 py-4" : "px-5 py-6"}`}>
            <div className={`rounded-[24px] border border-[#dfe7dd] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] ${compactView ? "p-3" : "p-5"}`}>
              {qrPayload ? (
                <QRCodeSVG value={qrPayload} size={compactView ? 140 : 216} includeMargin />
              ) : (
                <div className={`flex items-center justify-center text-gray-300 ${compactView ? "h-[140px] w-[140px]" : "h-[216px] w-[216px]"}`}>
                  <QrCode className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className={`w-full rounded-2xl border border-[#e5efe1] bg-white/70 text-left ${compactView ? "mt-3 p-3" : "mt-5 p-4"}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5c6f60]">Payee UPI ID</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className={`min-w-0 flex-1 rounded-xl border border-[#d9e4d7] bg-white font-semibold text-gray-800 ${compactView ? "px-2.5 py-2 text-xs" : "px-3 py-2 text-sm"}`}>{upiId || "sumitkumarsahoo772@okicici"}</p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-[#d5dfd0] px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-white"
                  onClick={() => copyText(upiId, "upi")}
                >
                  <Copy className="h-3.5 w-3.5" /> {copiedValue === "upi" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <div className={`space-y-${compactView ? "4" : "5"}`}>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailTile label="Application Reference" value={applicationReference || "Draft application"} emphasized />
              <DetailTile
                label="Amount to Pay"
                value={amount ? amount.toLocaleString("en-IN") : "0"}
                icon={<IndianRupee className="h-5 w-5 text-[#0f5d36]" />}
                emphasized
              />
              {!compactView && <DetailTile label="Current Workflow" value={workflowStatus || "Draft"} />}
              <DetailTile label="Payment Status" value={normalizedStatus} />
            </div>

            <div className={`rounded-[24px] border border-[#e6ece6] bg-[#fbfcfa] ${compactView ? "p-4" : "p-5"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6f61]">Project</p>
                  <p className={`${compactView ? "mt-1 text-sm" : "mt-1 text-base"} font-semibold text-gray-900`}>{applicationTitle || "Application fee collection"}</p>
                </div>
                {qrPayload && (
                  <a
                    className={`inline-flex items-center gap-2 rounded-full border border-[#cedcc9] bg-white font-semibold text-[#1c5d38] hover:bg-[#f3f8f4] ${compactView ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"}`}
                    href={qrPayload}
                  >
                    <ExternalLink className="h-4 w-4" /> Open UPI Intent
                  </a>
                )}
              </div>

              <div className={`mt-4 grid gap-3 ${compactView ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                <DetailRow
                  label="Transaction Note"
                  value={upiNote || "-"}
                  actionLabel={copiedValue === "note" ? "Copied" : "Copy"}
                  onAction={() => copyText(upiNote, "note")}
                />
                <DetailRow label="Submitted Reference" value={upiRef || "Waiting for PP to confirm payment"} />
                {!compactView && <DetailRow label="Verification Officer" value={verifiedBy || "Not verified yet"} />}
                {!compactView && <DetailRow label="Verified On" value={verifiedAt ? new Date(verifiedAt).toLocaleString() : "Awaiting scrutiny review"} />}
              </div>
            </div>

            <div className={`rounded-[24px] border border-[#e7e1cf] bg-[linear-gradient(180deg,#fffaf0_0%,#fffef8_100%)] ${compactView ? "p-4" : "p-5"}`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#805b10]">
                <CircleAlert className="h-4 w-4" /> Payment Declaration
              </div>
              {!compactView && <p className="mt-2 text-sm text-[#6c5b2b]">This QR is generated for the configured portal UPI ID. Scan it with any UPI-enabled banking app and submit the transaction reference below.</p>}
              <div className={`${compactView ? "mt-3" : "mt-4"} space-y-2`}>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6a3f]">UPI Transaction Reference</label>
                <input
                  className={`w-full rounded-2xl border border-[#e4d8b5] bg-white outline-none transition focus:border-[#b6913f] ${compactView ? "px-3 py-2.5 text-sm" : "px-4 py-3 text-sm"}`}
                  placeholder="e.g. UPI-23948290421"
                  value={upiRef}
                  onChange={(event) => onUpiRefChange(event.target.value)}
                />
                {!compactView && <p className="text-xs text-[#8b7c52]">{helperText}</p>}
              </div>
            </div>

            <div className={`grid gap-3 ${compactView ? "grid-cols-2 lg:grid-cols-4" : "flex flex-wrap"}`}>
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff6b00] text-sm font-semibold text-white transition hover:bg-[#e65f00] disabled:cursor-not-allowed disabled:opacity-55 ${compactView ? "min-h-11 px-3 py-2.5" : "min-h-12 px-5 py-3"}`}
                onClick={() => {
                  if (!qrPayload) return;
                  window.open(qrPayload, "_blank", "noopener,noreferrer");
                }}
                disabled={!canPayWithUpi || loading}
              >
                <ExternalLink className="h-4 w-4" />
                Pay with UPI
              </button>
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#155b34] text-sm font-semibold text-white transition hover:bg-[#0f4929] disabled:cursor-not-allowed disabled:opacity-55 ${compactView ? "min-h-11 px-3 py-2.5" : "min-h-12 flex-1 px-5 py-3"}`}
                onClick={onMarkPaid}
                disabled={!canSubmitPayment || loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                I Have Paid
              </button>
              {onRefresh && (
                <button
                  type="button"
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4ddd1] bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-55 ${compactView ? "min-h-11 px-3 py-2.5" : "min-h-12 px-5 py-3"}`}
                  onClick={onRefresh}
                  disabled={!canRefreshQr || loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh QR
                </button>
              )}
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4ddd1] bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-55 ${compactView ? "min-h-11 px-3 py-2.5" : "min-h-12 px-5 py-3"}`}
                onClick={() => copyText(qrPayload, "link")}
                disabled={!qrPayload}
              >
                <Copy className="h-4 w-4" />
                {copiedValue === "link" ? "UPI Link Copied" : "Copy UPI Link"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!compactView && <div className="space-y-5">
        <div className="rounded-[28px] border border-[#dde4dc] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <h3 className="text-base font-semibold text-gray-900">Payment Status</h3>
          <div className="mt-5 space-y-4">
            <StepRow done={stepDone.pending} title="Pending" description="QR issued and waiting for payment confirmation." />
            <StepRow done={stepDone.submitted} title="Payment Submitted" description="Project proponent has declared payment completion." />
            <StepRow done={stepDone.verification} title="Pending Verification" description="Scrutiny team will cross-check the fee before document review." />
            <StepRow done={stepDone.verified} title="Verified by Scrutiny" description="Application fee has been accepted for further processing." />
          </div>
        </div>

        <div className="rounded-[28px] border border-[#dde4dc] bg-[#f8faf7] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <h3 className="text-base font-semibold text-gray-900">UPI Payment Instructions</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <p>1. Scan the QR code using any UPI-enabled banking application.</p>
            <p>2. Confirm the beneficiary, amount, and application reference before paying.</p>
            <p>3. Click I Have Paid to move the application into scrutiny verification.</p>
          </div>
        </div>
      </div>}
    </div>
  );
}

function DetailTile({ label, value, icon, emphasized = false }: { label: string; value: string; icon?: React.ReactNode; emphasized?: boolean }) {
  return (
    <div className={`rounded-2xl border px-4 py-4 ${emphasized ? "border-[#d5e4d2] bg-[#f7fbf4]" : "border-[#e6ece6] bg-white"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#617264]">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-base font-semibold text-gray-900">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value, actionLabel, onAction }: { label: string; value: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="rounded-2xl border border-[#e4e9e3] bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#657467]">{label}</p>
        {onAction && actionLabel && (
          <button type="button" className="text-[11px] font-semibold text-[#1b5b38] hover:underline" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-800 break-all">{value}</p>
    </div>
  );
}

function StepRow({ done, title, description }: { done: boolean; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${done ? "bg-[#dff2e5] text-[#16623b]" : "bg-gray-100 text-gray-400"}`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
      </div>
      <div>
        <p className={`text-sm font-semibold ${done ? "text-gray-900" : "text-gray-500"}`}>{title}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Check, Loader2, Save, Upload } from "lucide-react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { ApplicationFeePaymentCard } from "../components/ApplicationFeePaymentCard";

const DEFAULT_UPI_ID = "sumitkumarsahoo772@okicici";
import {
  createApplication,
  fetchPpConfig,
  initiatePayment,
  markPaymentPaid,
  type PpConfig,
  type SectorConfig,
  uploadApplicationDocument,
  updateApplication,
} from "../services/ppPortal";

const steps = [
  "Category & Sector",
  "Project Details",
  "Location + Environment",
  "Sector Parameters",
  "Documents",
  "Payment",
  "Submit",
];

export default function NewApplication() {
  const [config, setConfig] = useState<PpConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentActionLoading, setPaymentActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [applicationRef, setApplicationRef] = useState("");

  const [category, setCategory] = useState<"A" | "B1" | "B2" | "">("");
  const [sectorId, setSectorId] = useState<number | null>(null);

  const [project, setProject] = useState({
    projectName: "",
    organization: "",
    projectDescription: "",
    estimatedCost: "",
    projectType: "",
  });

  const [location, setLocation] = useState({
    state: "",
    district: "",
    coordinates: "",
    landArea: "",
  });

  const [environmentalData, setEnvironmentalData] = useState({
    impact: "",
    resources: "",
    wastePlan: "",
  });

  const [sectorParams, setSectorParams] = useState<Record<string, string>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { id: number; name: string }>>({});

  const [paymentInfo, setPaymentInfo] = useState<{ amount: number; qrPayload: string; status: string; upiId: string; upiReferenceNote: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("Not Initiated");
  const [upiId, setUpiId] = useState(DEFAULT_UPI_ID);
  const [upiRef, setUpiRef] = useState("");
  const [paymentMarked, setPaymentMarked] = useState(false);

  const estimatedPaymentAmount = useMemo(() => {
    if (category === "A") return 15000;
    if (category === "B1") return 10000;
    if (category === "B2") return 7000;
    return 5000;
  }, [category]);

  useEffect(() => {
    const run = async () => {
      setLoadingConfig(true);
      try {
        setConfig(await fetchPpConfig());
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load configuration.");
      } finally {
        setLoadingConfig(false);
      }
    };
    run();
  }, []);

  const selectedSector: SectorConfig | null = useMemo(() => {
    if (!config || !sectorId) return null;
    return config.sectors.find((s) => s.id === sectorId) ?? null;
  }, [config, sectorId]);

  const filteredChecklist = useMemo(() => {
    if (!selectedSector || !category) return [];
    return selectedSector.checklist.filter((c) => c.category === category);
  }, [selectedSector, category]);

  const canMoveNext = useMemo(() => {
    if (currentStep === 1) return Boolean(category && sectorId);
    if (currentStep === 2) return Boolean(project.projectName.trim() && project.organization.trim());
    if (currentStep === 3) return Boolean(location.state.trim() && location.district.trim());
    if (currentStep === 4) return true;
    if (currentStep === 5) {
      const requiredDocs = filteredChecklist.filter((d) => d.required === 1);
      return requiredDocs.every((d) => uploadedDocs[d.doc_name]);
    }
    if (currentStep === 6) return paymentMarked;
    return true;
  }, [category, currentStep, filteredChecklist, location.district, location.state, paymentMarked, project.organization, project.projectName, sectorId, uploadedDocs]);

  const persistApplication = async (saveAsDraft: boolean) => {
    if (!category || !sectorId) throw new Error("Please select category and sector.");

    const payload = {
      category,
      sectorId,
      saveAsDraft,
      projectName: project.projectName,
      organization: project.organization,
      projectDescription: project.projectDescription,
      estimatedCost: Number(project.estimatedCost || 0),
      projectType: project.projectType,
      state: location.state,
      district: location.district,
      coordinates: location.coordinates,
      landArea: Number(location.landArea || 0),
      environmentalData,
      sectorParamsData: sectorParams,
    };

    if (applicationId) {
      const nextStatus = saveAsDraft ? "Draft" : "Submitted";
      const updated = await updateApplication(applicationId, { ...payload, status: nextStatus });
      setApplicationRef(updated.application_id);
      return updated.id;
    }

    const created = await createApplication(payload);
    setApplicationId(created.id);
    setApplicationRef(created.application_id);
    return created.id;
  };

  const onSaveDraft = async () => {
    setError("");
    setOk("");
    setSaving(true);
    try {
      await persistApplication(true);
      setOk("Draft saved successfully.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const onUploadDoc = async (docName: string, file: File | null) => {
    if (!file) return;
    setError("");
    try {
      const id = applicationId ?? (await persistApplication(true));
      const doc = await uploadApplicationDocument(id, docName, file);
      setUploadedDocs((prev) => ({ ...prev, [docName]: { id: doc.id, name: doc.original_name } }));
      setOk(`Uploaded: ${docName}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to upload document.");
    }
  };

  const onGeneratePayment = async () => {
    setError("");
    setPaymentActionLoading(true);
    try {
      const id = applicationId ?? (await persistApplication(true));
      const p = await initiatePayment(id);
      setPaymentInfo({ ...p, upiId: DEFAULT_UPI_ID });
      setPaymentStatus(p.status);
      setUpiId(DEFAULT_UPI_ID);
      setPaymentMarked(false);
      setOk("Payment QR generated.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to initiate payment.");
    } finally {
      setPaymentActionLoading(false);
    }
  };

  const onMarkPaid = async () => {
    if (!applicationId) return;
    setError("");
    setPaymentActionLoading(true);
    try {
      await markPaymentPaid(applicationId, upiRef);
      setPaymentStatus("Pending Verification");
      setPaymentMarked(true);
      setOk("Payment submitted. Application moved to Submitted and is now awaiting scrutiny payment verification.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to mark paid.");
    } finally {
      setPaymentActionLoading(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A5C1A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/proponent" className="inline-flex items-center gap-2 text-[#1A5C1A] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 overflow-x-auto">
            {steps.map((label, i) => {
              const n = i + 1;
              return (
                <div key={label} className="flex items-center gap-3 min-w-max">
                  <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${n < currentStep ? "bg-[#1A5C1A] text-white" : n === currentStep ? "bg-[#FF6B00] text-white" : "bg-gray-200 text-gray-600"}`}>
                    {n < currentStep ? <Check className="w-4 h-4" /> : n}
                  </div>
                  <span className="text-xs text-gray-600">{label}</span>
                  {n < steps.length && <div className="w-8 h-0.5 bg-gray-200" />}
                </div>
              );
            })}
          </div>
          {applicationRef && <p className="text-xs text-gray-500 mt-4">Application Ref: {applicationRef}</p>}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {error && <div className="mb-4 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
          {ok && <div className="mb-4 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{ok}</div>}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Application Categorization</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full border rounded-lg px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value as "A" | "B1" | "B2" | "")}> 
                  <option value="">Select Category</option>
                  {config?.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Industry Sector (Admin Configured)</label>
                <select className="w-full border rounded-lg px-3 py-2" value={sectorId ?? ""} onChange={(e) => setSectorId(Number(e.target.value) || null)}>
                  <option value="">Select Sector</option>
                  {config?.sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 1: Project Details</h2>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Project Name" value={project.projectName} onChange={(e) => setProject((p) => ({ ...p, projectName: e.target.value }))} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Organization" value={project.organization} onChange={(e) => setProject((p) => ({ ...p, organization: e.target.value }))} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="Project Description" value={project.projectDescription} onChange={(e) => setProject((p) => ({ ...p, projectDescription: e.target.value }))} />
              <div className="grid md:grid-cols-2 gap-4">
                <input className="w-full border rounded-lg px-3 py-2" placeholder="Estimated Cost" value={project.estimatedCost} onChange={(e) => setProject((p) => ({ ...p, estimatedCost: e.target.value }))} />
                <input className="w-full border rounded-lg px-3 py-2" placeholder="Project Type" value={project.projectType} onChange={(e) => setProject((p) => ({ ...p, projectType: e.target.value }))} />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 2 + 3: Location & Environmental Data</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input className="w-full border rounded-lg px-3 py-2" placeholder="State" value={location.state} onChange={(e) => setLocation((v) => ({ ...v, state: e.target.value }))} />
                <input className="w-full border rounded-lg px-3 py-2" placeholder="District" value={location.district} onChange={(e) => setLocation((v) => ({ ...v, district: e.target.value }))} />
                <input className="w-full border rounded-lg px-3 py-2" placeholder="Coordinates" value={location.coordinates} onChange={(e) => setLocation((v) => ({ ...v, coordinates: e.target.value }))} />
                <input className="w-full border rounded-lg px-3 py-2" placeholder="Land Area" value={location.landArea} onChange={(e) => setLocation((v) => ({ ...v, landArea: e.target.value }))} />
              </div>
              <textarea className="w-full border rounded-lg px-3 py-2" rows={2} placeholder="Environmental impact details" value={environmentalData.impact} onChange={(e) => setEnvironmentalData((v) => ({ ...v, impact: e.target.value }))} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows={2} placeholder="Resource usage" value={environmentalData.resources} onChange={(e) => setEnvironmentalData((v) => ({ ...v, resources: e.target.value }))} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows={2} placeholder="Waste management plan" value={environmentalData.wastePlan} onChange={(e) => setEnvironmentalData((v) => ({ ...v, wastePlan: e.target.value }))} />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 4: Sector-Specific Parameters</h2>
              {!selectedSector?.params.length && <p className="text-sm text-gray-500">No admin-defined parameters for this sector.</p>}
              {selectedSector?.params.map((p) => (
                <div key={p.id}>
                  <label className="block text-sm font-medium mb-1">{p.param_label} {p.required === 1 && <span className="text-red-500">*</span>}</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    type={p.param_type === "number" ? "number" : p.param_type === "date" ? "date" : "text"}
                    value={sectorParams[p.param_label] ?? ""}
                    onChange={(e) => setSectorParams((prev) => ({ ...prev, [p.param_label]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 5: Document Upload Engine</h2>
              {!filteredChecklist.length && <p className="text-sm text-gray-500">No admin checklist found for this category + sector.</p>}
              {filteredChecklist.map((doc) => {
                const uploaded = uploadedDocs[doc.doc_name];
                return (
                  <div key={doc.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{doc.doc_name}</p>
                      <p className="text-xs text-gray-500">{doc.required ? "Required" : "Optional"} · {uploaded ? `Uploaded: ${uploaded.name}` : "Missing"}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm bg-[#1A5C1A] text-white px-3 py-2 rounded-lg cursor-pointer">
                      <Upload className="w-4 h-4" /> Upload
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => onUploadDoc(doc.doc_name, e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 6: UPI Application Fee Payment</h2>
              <ApplicationFeePaymentCard
                applicationReference={applicationRef || (applicationId ? `Application #${applicationId}` : "Draft application")}
                applicationTitle={project.projectName || "New application fee"}
                workflowStatus={paymentMarked ? "Submitted" : "Draft"}
                amount={paymentInfo?.amount ?? estimatedPaymentAmount}
                qrPayload={paymentInfo?.qrPayload || ""}
                upiId={upiId}
                upiNote={paymentInfo?.upiReferenceNote || (applicationRef ? `Application-${applicationRef}` : "Application-Draft")}
                paymentStatus={paymentStatus}
                upiRef={upiRef}
                onUpiRefChange={setUpiRef}
                onMarkPaid={onMarkPaid}
                onRefresh={onGeneratePayment}
                loading={paymentActionLoading}
                disableActions={false}
                helperText={paymentInfo ? "Payment submission will automatically move this application from Draft to Submitted. Scrutiny verification happens next." : "Click Refresh QR to generate a QR for the configured portal UPI ID."}
              />
            </div>
          )}

          {currentStep === 7 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-700" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Submitted</h2>
              <p className="text-gray-600">Your application is now in the scrutiny pipeline with payment pending verification.</p>
              {applicationRef && <p className="text-sm mt-3 text-gray-500">Reference: {applicationRef}</p>}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 border-t pt-6">
            <button
              className="px-4 py-2 rounded-lg border text-sm"
              disabled={currentStep === 1 || saving}
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            >
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-2" onClick={onSaveDraft} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
              </button>

              {currentStep < 7 ? (
                <button
                  className="px-4 py-2 rounded-lg text-sm bg-[#1A5C1A] text-white disabled:opacity-50 inline-flex items-center gap-2"
                  disabled={!canMoveNext || saving}
                  onClick={() => {
                    if (currentStep === 6) return setCurrentStep(7);
                    setCurrentStep((s) => Math.min(7, s + 1));
                  }}
                >
                  {currentStep === 6 ? "Continue" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link to="/proponent" className="px-4 py-2 rounded-lg text-sm bg-[#1A5C1A] text-white">Go to Dashboard</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, MapPin, Save, Upload, X } from "lucide-react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { ApplicationFeePaymentCard } from "../components/ApplicationFeePaymentCard";
import { INDIA_STATE_DISTRICTS, INDIAN_STATES } from "../utils/indiaLocations";

const DEFAULT_UPI_ID = "sumitkumarsahoo772@okicici";
import {
  createApplication,
  fetchApplicationById,
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

function parseCoordinateParts(raw: string): { latitude: string; longitude: string } {
  const text = String(raw || "").trim();
  if (!text) return { latitude: "", longitude: "" };

  const values = text.match(/-?\d+(?:\.\d+)?/g) ?? [];
  return {
    latitude: values[0] ?? "",
    longitude: values[1] ?? "",
  };
}

export default function NewApplication() {
  const [searchParams] = useSearchParams();
  const editApplicationId = Number(searchParams.get("edit") || 0);
  const isEditMode = Number.isFinite(editApplicationId) && editApplicationId > 0;

  const [config, setConfig] = useState<PpConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingApplication, setLoadingApplication] = useState(false);
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
    landmark: "",
    coordinates: "",
    landArea: "",
  });
  const [coordinateParts, setCoordinateParts] = useState({ latitude: "", longitude: "" });
  const [autoLocatingCoordinates, setAutoLocatingCoordinates] = useState(false);

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
  const [isEdsReview, setIsEdsReview] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [showPaidAnimation, setShowPaidAnimation] = useState(false);

  const estimatedPaymentAmount = useMemo(() => {
    if (category === "A") return 15000;
    if (category === "B1") return 2000;
    if (category === "B2") return 7000;
    return 5000;
  }, [category]);

  useEffect(() => {
    if (currentStep === 6) {
      setPaymentModalOpen(true);
      return;
    }
    setPaymentModalOpen(false);
  }, [currentStep]);

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

  useEffect(() => {
    const parsed = parseCoordinateParts(location.coordinates);
    if (parsed.latitude === coordinateParts.latitude && parsed.longitude === coordinateParts.longitude) return;
    setCoordinateParts(parsed);
  }, [location.coordinates]);

  useEffect(() => {
    if (!isEditMode) return;

    const run = async () => {
      setLoadingApplication(true);
      setError("");
      try {
        const app = await fetchApplicationById(editApplicationId);
        let envData: Record<string, string> = {};
        let paramsData: Record<string, string> = {};

        try {
          envData = app.environmental_data ? JSON.parse(app.environmental_data) as Record<string, string> : {};
        } catch {
          envData = {};
        }

        try {
          paramsData = app.sector_params_data ? JSON.parse(app.sector_params_data) as Record<string, string> : {};
        } catch {
          paramsData = {};
        }

        const latestDocs = app.documents.reduce<Record<string, { id: number; name: string; uploadedAt: string }>>((acc, doc) => {
          const existing = acc[doc.doc_name];
          if (!existing || String(doc.uploaded_at) > String(existing.uploadedAt)) {
            acc[doc.doc_name] = { id: doc.id, name: doc.original_name, uploadedAt: String(doc.uploaded_at) };
          }
          return acc;
        }, {});

        const normalizedDocs: Record<string, { id: number; name: string }> = {};
        Object.entries(latestDocs).forEach(([name, value]) => {
          normalizedDocs[name] = { id: value.id, name: value.name };
        });

        setApplicationId(app.id);
        setApplicationRef(app.application_id);
        setCategory(app.category);
        setSectorId(app.sector_id);
        setProject({
          projectName: app.project_name || "",
          organization: app.organization || "",
          projectDescription: app.project_description || "",
          estimatedCost: String(app.estimated_cost || ""),
          projectType: app.project_type || "",
        });
        setLocation({
          state: app.state || "",
          district: app.district || "",
          landmark: String(envData.landmark || ""),
          coordinates: app.coordinates || "",
          landArea: String(app.land_area || ""),
        });
        setEnvironmentalData({
          impact: String(envData.impact || ""),
          resources: String(envData.resources || ""),
          wastePlan: String(envData.wastePlan || ""),
        });
        setSectorParams(paramsData);
        setUploadedDocs(normalizedDocs);
        setPaymentStatus(app.payment_status || app.payment?.status || "Not Initiated");
        setPaymentInfo(app.payment
          ? {
              amount: Number(app.payment.amount || estimatedPaymentAmount),
              qrPayload: String(app.payment.qr_payload || ""),
              status: String(app.payment.status || app.payment_status || "Not Initiated"),
              upiId: String(app.payment.payee_upi_id || DEFAULT_UPI_ID),
              upiReferenceNote: String(app.payment.upi_reference_note || ""),
            }
          : null);

        const hasPaymentProgress = ["Pending Verification", "Verified", "Paid"].includes(String(app.payment_status || ""));
        setPaymentMarked(hasPaymentProgress);
        setIsEdsReview(app.status === "EDS");
        setCurrentStep(1);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load application for editing.");
      } finally {
        setLoadingApplication(false);
      }
    };

    run();
  }, [editApplicationId, estimatedPaymentAmount, isEditMode]);

  useEffect(() => {
    if (!location.state || !location.district || !location.landmark.trim()) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      setAutoLocatingCoordinates(true);
      try {
        const query = [location.landmark, location.district, location.state, "India"].filter(Boolean).join(", ");
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        if (!res.ok) return;
        const rows = (await res.json()) as Array<{ lat: string; lon: string }>;
        if (!active || !rows.length) return;

        const latitude = rows[0].lat;
        const longitude = rows[0].lon;
        setCoordinateParts({ latitude, longitude });
        setLocation((prev) => ({
          ...prev,
          coordinates: `${latitude}, ${longitude}`,
        }));
      } catch {
        // Keep manual coordinate entry available if geocoding fails.
      } finally {
        if (active) setAutoLocatingCoordinates(false);
      }
    }, 700);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [location.state, location.district, location.landmark]);

  const selectedSector: SectorConfig | null = useMemo(() => {
    if (!config || !sectorId) return null;
    return config.sectors.find((s) => s.id === sectorId) ?? null;
  }, [config, sectorId]);

  const filteredChecklist = useMemo(() => {
    if (!selectedSector || !category) return [];
    return selectedSector.checklist.filter((c) => c.category === category);
  }, [selectedSector, category]);

  const districtOptions = useMemo(() => {
    if (!location.state) return [] as string[];
    return INDIA_STATE_DISTRICTS[location.state] ?? [];
  }, [location.state]);

  useEffect(() => {
    if (!location.state) return;
    if (!districtOptions.includes(location.district)) {
      setLocation((previous) => ({ ...previous, district: "" }));
    }
  }, [districtOptions, location.district, location.state]);

  const canMoveNext = useMemo(() => {
    if (currentStep === 1) return Boolean(category && sectorId);
    if (currentStep === 2) return Boolean(project.projectName.trim() && project.organization.trim());
    if (currentStep === 3) return Boolean(location.state.trim() && location.district.trim());
    if (currentStep === 4) return true;
    if (currentStep === 5) {
      const requiredDocs = filteredChecklist.filter((d) => d.required === 1);
      return requiredDocs.every((d) => uploadedDocs[d.doc_name]);
    }
    if (currentStep === 6) return isEdsReview || paymentMarked;
    return true;
  }, [category, currentStep, filteredChecklist, isEdsReview, location.district, location.state, paymentMarked, project.organization, project.projectName, sectorId, uploadedDocs]);

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
      environmentalData: {
        ...environmentalData,
        landmark: location.landmark,
      },
      sectorParamsData: sectorParams,
    };

    if (applicationId) {
      const updatePayload: Record<string, unknown> = { ...payload };
      if (isEdsReview) {
        if (!saveAsDraft) updatePayload.status = "Under Scrutiny";
      } else {
        updatePayload.status = saveAsDraft ? "Draft" : "Submitted";
      }
      const updated = await updateApplication(applicationId, updatePayload);
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
      setOk(isEdsReview ? "Changes saved. You can now resend to scrutiny." : "Draft saved successfully.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const onResendToScrutiny = async () => {
    if (!applicationId) return;
    setError("");
    setOk("");
    setSaving(true);
    try {
      await persistApplication(false);
      setIsEdsReview(false);
      setCurrentStep(7);
      setOk("Application resubmitted successfully and moved back to Under Scrutiny.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to resend application.");
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
      setShowPaidAnimation(true);
      window.setTimeout(() => setShowPaidAnimation(false), 1800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to mark paid.");
    } finally {
      setPaymentActionLoading(false);
    }
  };

  if (loadingConfig || loadingApplication) {
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

        {isEdsReview && (
          <div className="mb-6 text-sm text-orange-800 bg-orange-50 border border-orange-200 px-4 py-3 rounded-lg">
            This application is in EDS review. Update details/documents and click <strong>Resend to Scrutiny</strong>.
          </div>
        )}

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
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={location.state}
                  onChange={(e) => setLocation((v) => ({ ...v, state: e.target.value, district: "" }))}
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                  value={location.district}
                  onChange={(e) => setLocation((v) => ({ ...v, district: e.target.value }))}
                  disabled={!location.state}
                >
                  <option value="">{location.state ? "Select District" : "Select state first"}</option>
                  {districtOptions.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <div className="md:col-span-2 relative">
                  <input
                    className="w-full border rounded-lg px-3 py-2 pr-11"
                    placeholder="Landmark / nearby known place"
                    value={location.landmark}
                    onChange={(e) => setLocation((v) => ({ ...v, landmark: e.target.value }))}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                    {autoLocatingCoordinates ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    type="number"
                    step="0.000001"
                    placeholder="Latitude"
                    value={coordinateParts.latitude}
                    onChange={(e) => {
                      const latitude = e.target.value;
                      setCoordinateParts((prev) => ({ ...prev, latitude }));
                      setLocation((prev) => ({
                        ...prev,
                        coordinates: [latitude, coordinateParts.longitude].filter(Boolean).join(", "),
                      }));
                    }}
                  />
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    type="number"
                    step="0.000001"
                    placeholder="Longitude"
                    value={coordinateParts.longitude}
                    onChange={(e) => {
                      const longitude = e.target.value;
                      setCoordinateParts((prev) => ({ ...prev, longitude }));
                      setLocation((prev) => ({
                        ...prev,
                        coordinates: [coordinateParts.latitude, longitude].filter(Boolean).join(", "),
                      }));
                    }}
                  />
                </div>
                <div className="relative">
                  <input
                    className="w-full border rounded-lg px-3 py-2 pr-16"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Land Area"
                    value={location.landArea}
                    onChange={(e) => setLocation((v) => ({ ...v, landArea: e.target.value }))}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-500">ha</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 -mt-1 space-y-1">
                <p>Landmark helps auto-generate coordinates using district and state.</p>
                <p>Enter project coordinates as decimal latitude and longitude.</p>
                <p>Land area should be entered in hectares (ha).</p>
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
              <p className="text-sm text-gray-600">Payment form opens in a popup. Use the close button (X) after completing payment actions.</p>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-[#155b34] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4929]"
                onClick={() => setPaymentModalOpen(true)}
              >
                Open Payment Popup
              </button>

              {paymentModalOpen && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/55"
                    aria-label="Close payment popup"
                    onClick={() => setPaymentModalOpen(false)}
                  />

                  <div className="relative z-[1201] w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
                      <h2 className="text-sm font-semibold text-gray-800">UPI Application Fee Payment</h2>
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
                        applicationReference={applicationRef || (applicationId ? `Application #${applicationId}` : "Draft application")}
                        applicationTitle={project.projectName || "New application fee"}
                        workflowStatus={isEdsReview ? "EDS" : paymentMarked ? "Submitted" : "Draft"}
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
                        compactView
                        disableActions={false}
                        helperText={
                          isEdsReview
                            ? "Payment is already recorded for this application. Complete corrections and resend to scrutiny."
                            : paymentInfo
                              ? "Payment submission will automatically move this application from Draft to Submitted. Scrutiny verification happens next."
                              : "Click Refresh QR to generate a QR for the configured portal UPI ID."
                        }
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
            </div>
          )}

          {currentStep === 7 && (
            <div className="text-center py-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-700" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Application Submitted</h2>
                <p className="text-gray-600">
                  {isEditMode ? "Your corrected application has been resent for scrutiny review." : "Your application is now in the scrutiny pipeline with payment pending verification."}
                </p>
                {applicationRef && <p className="text-sm mt-3 text-gray-500">Reference: {applicationRef}</p>}
              </div>
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
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isEdsReview ? "Save Changes" : "Save Draft"}
              </button>

              {isEdsReview && applicationId && currentStep < 7 && (
                <button
                  className="px-4 py-2 rounded-lg text-sm bg-[#FF6B00] text-white disabled:opacity-50 inline-flex items-center gap-2"
                  onClick={onResendToScrutiny}
                  disabled={saving}
                >
                  Resend to Scrutiny
                </button>
              )}

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

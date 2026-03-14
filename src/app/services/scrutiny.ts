const AUTH_TOKEN_KEY = "parivesh_auth_token";
const DEFAULT_API_ORIGIN = "http://localhost:8787";

function apiBase(): string {
  if (typeof window === "undefined") return `${DEFAULT_API_ORIGIN}/api`;
  const { protocol, hostname, port, origin } = window.location;
  if (protocol === "file:") return `${DEFAULT_API_ORIGIN}/api`;
  if (port === "8787") return `${origin}/api`;
  if (hostname === "localhost" || hostname === "127.0.0.1") return `${DEFAULT_API_ORIGIN}/api`;
  return "/api";
}

function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function withToken(url: string): string {
  const token = getToken();
  if (!token) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

function toApiUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return withToken(url);
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return withToken(`${apiBase()}${normalizedPath.replace(/^\/api/, "")}`);
}

function safeParse(raw: string): unknown | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function scrutinyFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, { method, headers, body: payload });
  } catch {
    throw new Error("Scrutiny API is not reachable. Start backend with npm run dev:api.");
  }

  const raw = await res.text();
  const data = raw ? safeParse(raw) : null;

  if (res.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export type ScrutinyQueueItem = {
  id: number;
  applicationId: string;
  projectName: string;
  projectProponentName: string;
  category: "A" | "B1" | "B2" | string;
  sector: string;
  submittedAt: string;
  currentStatus: "Submitted" | "Under Scrutiny" | string;
  paymentStatus: string;
};

export type ScrutinyDocument = {
  id: number;
  doc_name: string;
  original_name: string;
  verification_status: string;
  deficiency_comment: string;
  uploaded_at: string;
};

export type ScrutinyPayment = {
  id: number;
  amount: number;
  qr_payload: string;
  upi_ref: string;
  payee_upi_id?: string;
  upi_reference_note?: string;
  status: string;
  verified_by?: string;
  verified_at?: string | null;
  updated_at: string;
} | null;

export type ScrutinyHistory = {
  status: string;
  comment: string;
  created_by: string;
  created_at: string;
};

export type ScrutinyApplicationDetail = {
  application: {
    id: number;
    application_id: string;
    category: string;
    status: string;
    project_name: string;
    organization: string;
    project_description: string;
    estimated_cost: number;
    project_type: string;
    state: string;
    district: string;
    coordinates: string;
    land_area: number;
    environmental_data: string;
    sector_params_data: string;
    eds_comments: string;
    eds_summary: string;
    ai_compliance_report: string;
    payment_status: string;
    sector_name: string;
    owner_name: string;
    owner_login_id: string;
    owner_email: string;
    created_at: string;
    updated_at: string;
  };
  documents: ScrutinyDocument[];
  payment: ScrutinyPayment;
  history: ScrutinyHistory[];
  gistRow: {
    id: number;
    generated_by: string;
    generated_at: string;
    gist_content: string;
  } | null;
  review: {
    id: number;
    review_data: Record<string, unknown>;
    payment_verification: string;
    review_notes: string;
    reviewed_by: string;
    reviewed_at: string;
    locked: number;
  } | null;
  integrity: {
    status: "verified" | "mismatch" | "unavailable";
    message: string;
    expectedHash: string | null;
    calculatedHash: string | null;
    blockchainHash?: string | null;
    txHash: string | null;
    recordedAt?: string;
    documentCount?: number;
  };
};

export type ScrutinyVerificationDeficiency = {
  type: "required_document" | "mandatory_field" | "data_completeness" | "data_correctness";
  field: string;
  message: string;
};

export type ScrutinyVerificationResult =
  | {
      ok: true;
      result: "EDS";
      status: "EDS";
      deficiencyCount: number;
      deficiencies: ScrutinyVerificationDeficiency[];
      edsMessage: string;
    }
  | {
      ok: true;
      result: "VERIFIED";
      status: "Under Scrutiny";
      verified: true;
      gist: {
        generatedAt: string;
        docxDownloadUrl: string;
        pdfDownloadUrl: string;
      };
    };

export async function fetchScrutinyQueue(filters: {
  status?: string;
  category?: string;
  sector?: string;
  sort?: "latest" | "priority";
}): Promise<ScrutinyQueueItem[]> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.sector && filters.sector !== "all") params.set("sector", filters.sector);
  if (filters.sort) params.set("sort", filters.sort);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return scrutinyFetch<ScrutinyQueueItem[]>("GET", `/scrutiny/queue${suffix}`);
}

export async function fetchScrutinyApplication(id: number): Promise<ScrutinyApplicationDetail> {
  return scrutinyFetch<ScrutinyApplicationDetail>("GET", `/scrutiny/applications/${id}`);
}

export async function verifyDocument(id: number, docId: number, payload: {
  verificationStatus: "Verified" | "Flagged" | "Uploaded" | "Missing";
  deficiencyComment?: string;
}): Promise<ScrutinyDocument> {
  return scrutinyFetch<ScrutinyDocument>("PATCH", `/scrutiny/applications/${id}/documents/${docId}`, payload);
}

export async function verifyPayment(id: number, paymentVerification: "Verified" | "Pending" | "Invalid"): Promise<{ ok: true; paymentStatus: string }> {
  return scrutinyFetch<{ ok: true; paymentStatus: string }>("PATCH", `/scrutiny/applications/${id}/payment`, { paymentVerification });
}

export async function issueEds(id: number, payload: {
  deficiencyComments: string;
  flaggedDocumentIds: number[];
  remarks?: string;
}): Promise<{ ok: true; status: "EDS" }> {
  return scrutinyFetch<{ ok: true; status: "EDS" }>("POST", `/scrutiny/applications/${id}/eds`, payload);
}

export async function generateGist(id: number): Promise<{ ok: true; gist: { generatedAt: string; docxDownloadUrl: string; pdfDownloadUrl: string } }> {
  const result = await scrutinyFetch<{ ok: true; gist: { generatedAt: string; docxDownloadUrl: string; pdfDownloadUrl: string } }>("POST", `/scrutiny/applications/${id}/gist/generate`);
  return {
    ...result,
    gist: {
      ...result.gist,
      docxDownloadUrl: toApiUrl(result.gist.docxDownloadUrl),
      pdfDownloadUrl: toApiUrl(result.gist.pdfDownloadUrl),
    },
  };
}

export async function runScrutinyVerification(id: number): Promise<ScrutinyVerificationResult> {
  const result = await scrutinyFetch<ScrutinyVerificationResult>("POST", `/scrutiny/applications/${id}/verify`);
  if (result.result === "VERIFIED") {
    return {
      ...result,
      gist: {
        ...result.gist,
        docxDownloadUrl: toApiUrl(result.gist.docxDownloadUrl),
        pdfDownloadUrl: toApiUrl(result.gist.pdfDownloadUrl),
      },
    };
  }
  return result;
}

export async function referToMeeting(id: number): Promise<{ ok: true; status: "Referred" }> {
  return scrutinyFetch<{ ok: true; status: "Referred" }>("POST", `/scrutiny/applications/${id}/refer`);
}

export async function reopenToScrutiny(id: number): Promise<{ ok: true; status: "Under Scrutiny" }> {
  return scrutinyFetch<{ ok: true; status: "Under Scrutiny" }>("POST", `/scrutiny/applications/${id}/reopen`);
}

export type StatusHistoryEntry = {
  status: string;
  comment: string;
  created_by: string;
  created_at: string;
};

export async function fetchStatusHistory(id: number): Promise<StatusHistoryEntry[]> {
  return scrutinyFetch<StatusHistoryEntry[]>("GET", `/applications/${id}/history`);
}

export function scrutinyDocumentDownloadUrl(docId: number): string {
  return withToken(`${apiBase()}/scrutiny/documents/${docId}/download`);
}

export function scrutinyGistDownloadUrl(id: number, format: "docx" | "pdf"): string {
  return withToken(`${apiBase()}/scrutiny/applications/${id}/gist/${format}`);
}

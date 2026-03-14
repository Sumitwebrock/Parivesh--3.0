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

function safeParse(raw: string): unknown | null {
  try { return JSON.parse(raw); } catch { return null; }
}

async function momFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
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
    throw new Error("MoM API is not reachable. Start backend with npm run dev:api.");
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

// ─── Types ───────────────────────────────────────────────────────────────────

export type MoMQueueItem = {
  id: number;
  application_id: string;
  project_name: string;
  category: string;
  status: "Referred" | "Finalized" | string;
  created_at: string;
  updated_at: string;
  payment_status: string;
  sector_name: string;
  owner_name: string;
  finalized: number | null;
  converted_at: string | null;
  mom_docx_path: string | null;
  mom_pdf_path: string | null;
};

export type MoMDocument = {
  id: number;
  doc_name: string;
  original_name: string;
  file_path: string;
  verification_status: string;
  deficiency_comment: string;
  uploaded_at: string;
};

export type MoMRecord = {
  id: number;
  application_id: number;
  gist_draft: string;
  meeting_date: string | null;
  meeting_id: string | null;
  committee_name: string | null;
  members_present: string | null;
  mom_docx_path: string | null;
  mom_pdf_path: string | null;
  converted_by: string | null;
  converted_at: string | null;
  finalized: number;
  finalized_by: string | null;
  finalized_at: string | null;
  updated_at: string;
};

export type MoMApplicationDetail = {
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
    payment_status: string;
    sector_name: string;
    owner_name: string;
    owner_login_id: string;
    owner_email: string;
    created_at: string;
    updated_at: string;
  };
  documents: MoMDocument[];
  payment: {
    id: number;
    amount: number;
    qr_payload: string;
    upi_ref: string;
    status: string;
    updated_at: string;
  } | null;
  history: { status: string; comment: string; created_by: string; created_at: string }[];
  review: {
    id: number;
    review_data: Record<string, unknown>;
    payment_verification: string;
    review_notes: string;
    reviewed_by: string;
    reviewed_at: string;
    locked: number;
  } | null;
  gistRow: {
    id: number;
    docx_path: string;
    pdf_path: string;
    generated_by: string;
    generated_at: string;
  } | null;
  momRecord: MoMRecord | null;
};

// ─── API calls ───────────────────────────────────────────────────────────────

export async function fetchMoMQueue(filters: {
  category?: string;
  sector?: string;
  status?: string;
  sort?: string;
}): Promise<MoMQueueItem[]> {
  const p = new URLSearchParams();
  if (filters.category && filters.category !== "all") p.set("category", filters.category);
  if (filters.sector && filters.sector !== "all") p.set("sector", filters.sector);
  if (filters.status && filters.status !== "all") p.set("status", filters.status);
  if (filters.sort) p.set("sort", filters.sort);
  const suffix = p.toString() ? `?${p.toString()}` : "";
  return momFetch<MoMQueueItem[]>("GET", `/mom/referred${suffix}`);
}

export async function fetchMoMApplication(id: number): Promise<MoMApplicationDetail> {
  return momFetch<MoMApplicationDetail>("GET", `/mom/applications/${id}`);
}

export async function fetchGistContent(id: number): Promise<{ content: string; source: string }> {
  return momFetch<{ content: string; source: string }>("GET", `/mom/applications/${id}/gist`);
}

export async function saveGistDraft(id: number, content: string): Promise<{ ok: true }> {
  return momFetch<{ ok: true }>("PUT", `/mom/applications/${id}/gist`, { content });
}

export async function convertToMoM(id: number, payload: {
  meetingDate: string;
  meetingId: string;
  committeeName: string;
  membersPresent: string[];
  gistContent: string;
}): Promise<{ ok: true; docxUrl: string; pdfUrl: string }> {
  return momFetch<{ ok: true; docxUrl: string; pdfUrl: string }>("POST", `/mom/applications/${id}/convert`, payload);
}

export async function finalizeMoM(id: number): Promise<{ ok: true; status: "Finalized" }> {
  return momFetch<{ ok: true; status: "Finalized" }>("POST", `/mom/applications/${id}/finalize`);
}

export function momDocumentDownloadUrl(id: number, format: "docx" | "pdf"): string {
  return `${apiBase()}/mom/applications/${id}/mom/${format}`;
}

export async function downloadMomDocument(id: number, format: "docx" | "pdf", filename: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${apiBase()}/mom/applications/${id}/mom/${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

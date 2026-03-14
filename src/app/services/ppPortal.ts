import { getAdminToken } from "./adminAuth";

type JsonRecord = Record<string, unknown>;

const AUTH_TOKEN_KEY = "parivesh_auth_token";
const AUTH_USER_KEY = "parivesh_auth_user";

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

export function getCurrentUser(): AuthUserLite | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUserLite;
  } catch {
    return null;
  }
}

function safeParse(raw: string): unknown | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function ppFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, { method, headers, body: payload });
  } catch {
    throw new Error("Portal API is not reachable. Start backend with npm run dev:api.");
  }

  const raw = await res.text();
  const data = raw ? safeParse(raw) : null;

  if (res.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
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

export type AuthUserLite = {
  id: number;
  fullName: string;
  loginId: string;
  email: string;
  mobile?: string;
  organization?: string;
};

export type SectorParam = {
  id: number;
  sector_id: number;
  param_label: string;
  param_type: string;
  required: number;
  options: string;
  sort_order: number;
};

export type SectorChecklist = {
  id: number;
  sector_id: number;
  category: "A" | "B1" | "B2";
  doc_name: string;
  required: number;
  sort_order: number;
};

export type SectorConfig = {
  id: number;
  name: string;
  description: string;
  params: SectorParam[];
  checklist: SectorChecklist[];
};

export type TemplateLite = {
  id: number;
  name: string;
  category: "A" | "B1" | "B2";
  description: string;
  original_name: string;
  uploaded_at: string;
};

export type PpConfig = {
  categories: Array<"A" | "B1" | "B2">;
  sectors: SectorConfig[];
  templates: TemplateLite[];
};

export type ApplicationRow = {
  id: number;
  application_id: string;
  owner_user_id: number;
  category: "A" | "B1" | "B2";
  sector_id: number;
  sector_name: string;
  status: "Draft" | "Submitted" | "Under Scrutiny" | "EDS" | "Referred" | "Finalized" | string;
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
  created_at: string;
  updated_at: string;
};

export type ApplicationDocument = {
  id: number;
  application_id: number;
  doc_name: string;
  file_path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  verification_status: string;
  deficiency_comment: string;
  uploaded_at: string;
};

export type ApplicationPayment = {
  id: number;
  application_id: number;
  amount: number;
  qr_payload: string;
  upi_ref: string;
  payee_upi_id?: string;
  upi_reference_note?: string;
  status: string;
  verified_by?: string;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationHistory = {
  id: number;
  application_id: number;
  status: string;
  comment: string;
  created_by: string;
  created_at: string;
};

export async function fetchPpConfig(): Promise<PpConfig> {
  return ppFetch<PpConfig>("GET", "/pp/config");
}

export async function fetchPpProfile(): Promise<AuthUserLite> {
  return ppFetch<AuthUserLite>("GET", "/pp/profile");
}

export async function updatePpProfile(payload: {
  fullName: string;
  email: string;
  mobile?: string;
  organization?: string;
}): Promise<AuthUserLite> {
  const user = await ppFetch<AuthUserLite>("PATCH", "/pp/profile", payload);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  return user;
}

export async function changePpPassword(payload: { currentPassword: string; newPassword: string }): Promise<{ ok: true }> {
  return ppFetch<{ ok: true }>("PATCH", "/pp/profile/password", payload);
}

export async function fetchApplications(): Promise<ApplicationRow[]> {
  return ppFetch<ApplicationRow[]>("GET", "/pp/applications");
}

export async function fetchApplicationById(id: number): Promise<ApplicationRow & {
  documents: ApplicationDocument[];
  payment: ApplicationPayment | null;
  history: ApplicationHistory[];
}> {
  return ppFetch("GET", `/pp/applications/${id}`);
}

export async function createApplication(payload: JsonRecord): Promise<ApplicationRow> {
  return ppFetch<ApplicationRow>("POST", "/pp/applications", payload);
}

export async function updateApplication(id: number, payload: JsonRecord): Promise<ApplicationRow> {
  return ppFetch<ApplicationRow>("PATCH", `/pp/applications/${id}`, payload);
}

export async function uploadApplicationDocument(id: number, docName: string, file: File): Promise<ApplicationDocument> {
  const form = new FormData();
  form.append("docName", docName);
  form.append("file", file);
  return ppFetch<ApplicationDocument>("POST", `/pp/applications/${id}/documents`, form);
}

export async function fetchApplicationDocuments(id: number): Promise<ApplicationDocument[]> {
  return ppFetch<ApplicationDocument[]>("GET", `/pp/applications/${id}/documents`);
}

export function documentDownloadUrl(docId: number): string {
  return `${apiBase()}/pp/documents/${docId}/download`;
}

export function templateDownloadUrl(id: number): string {
  const token = getToken();
  const adminToken = getAdminToken();
  const q = new URLSearchParams();
  if (token) q.set("token", token);
  if (adminToken) q.set("adminToken", adminToken);
  return `${apiBase()}/pp/templates/${id}/download${q.toString() ? `?${q.toString()}` : ""}`;
}

export async function initiatePayment(id: number): Promise<{ amount: number; qrPayload: string; status: string; upiId: string; upiReferenceNote: string }> {
  return ppFetch("POST", `/pp/applications/${id}/payment/initiate`);
}

export async function markPaymentPaid(id: number, upiRef: string): Promise<{ ok: true; paymentStatus: string }> {
  return ppFetch("PATCH", `/pp/applications/${id}/payment/mark-paid`, { upiRef });
}

export async function fetchTracking(id: number): Promise<{
  id: number;
  applicationId: string;
  status: string;
  edsComments: string;
  paymentStatus: string;
  history: ApplicationHistory[];
}> {
  return ppFetch("GET", `/pp/applications/${id}/tracking`);
}

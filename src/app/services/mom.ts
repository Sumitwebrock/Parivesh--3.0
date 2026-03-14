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
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function withAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${DEFAULT_API_ORIGIN}${url}`;
  return `${DEFAULT_API_ORIGIN}/${url}`;
}

async function momFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = withAuthHeaders();
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
      data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export type MomApplication = {
  id: number;
  application_id: string;
  project_name: string;
  category: string;
  status: "Referred" | "MoMGenerated" | "Finalized" | string;
  sector: string;
  sector_name: string;
  proponent_name: string;
  owner_name: string;
  gist_content?: string | null;
  mom_path?: string | null;
  finalized: number;
  finalized_at?: string | null;
  updated_at: string;
  created_at: string;
};

export async function fetchMomApplications(): Promise<MomApplication[]> {
  return momFetch<MomApplication[]>("GET", "/mom/applications");
}

export async function fetchMomGist(id: number): Promise<{ gist_content: string }> {
  return momFetch<{ gist_content: string }>("GET", `/mom/applications/${id}/gist`);
}

export async function saveMomGist(id: number, content: string): Promise<{ success: true }> {
  return momFetch<{ success: true }>("PUT", `/mom/applications/${id}/gist`, { content });
}

export async function convertMom(id: number): Promise<{ docxUrl: string; pdfUrl: string }> {
  return momFetch<{ docxUrl: string; pdfUrl: string }>("POST", `/mom/applications/${id}/convert`);
}

export async function finalizeMom(id: number): Promise<{ success: true; finalizedAt: string }> {
  return momFetch<{ success: true; finalizedAt: string }>("PUT", `/mom/applications/${id}/finalize`);
}

export async function downloadUrl(url: string, filename: string): Promise<void> {
  const res = await fetch(toAbsoluteUrl(url), { headers: withAuthHeaders() });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

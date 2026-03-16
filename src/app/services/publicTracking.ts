const DEFAULT_API_ORIGIN = "http://localhost:8787";

function apiBase(): string {
  if (typeof window === "undefined") return `${DEFAULT_API_ORIGIN}/api`;
  const { protocol, hostname, port, origin } = window.location;
  if (protocol === "file:") return `${DEFAULT_API_ORIGIN}/api`;
  if (port === "8787") return `${origin}/api`;
  if (hostname === "localhost" || hostname === "127.0.0.1") return `${DEFAULT_API_ORIGIN}/api`;
  return "/api";
}

type PublicTrackingHistory = {
  status: string;
  comment: string;
  created_at: string;
};

export type PublicTrackingResult = {
  applicationId: string;
  projectName: string;
  category: string;
  sectorName: string;
  status: string;
  paymentStatus: string;
  location: string;
  updatedAt: string;
  edsComments: string;
  edsSummary: string;
  currentStageIndex: number;
  stageSequence: string[];
  history: PublicTrackingHistory[];
};

export async function fetchPublicTracking(reference: string): Promise<PublicTrackingResult> {
  const query = new URLSearchParams({ ref: reference.trim() });

  let res: Response;
  try {
    res = await fetch(`${apiBase()}/public/track?${query.toString()}`);
  } catch {
    throw new Error("Tracking service is not reachable. Start backend with npm run dev:api.");
  }

  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!res.ok) {
    const message = data && typeof data.message === "string" ? data.message : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as PublicTrackingResult;
}
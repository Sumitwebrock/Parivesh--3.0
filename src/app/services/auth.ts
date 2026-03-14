export type AuthUser = {
  id: number;
  fullName: string;
  loginId: string;
  email: string;
  mobile?: string;
  organization?: string;
  role?: string;
  state?: string;
  provider: "local" | "google" | string;
  createdAt: string;
};

export type AuthResult = {
  message: string;
  user: AuthUser;
  token: string;
  redirectTo: string;
};

type RegisterInput = {
  fullName: string;
  loginId: string;
  email: string;
  mobile: string;
  organization: string;
  role: string;
  state: string;
  password: string;
};

async function request<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Auth server is not reachable. Start backend using: npm run dev:api");
  }

  const raw = await res.text();
  const data = raw ? safeJsonParse(raw) : null;

  if (!res.ok) {
    const rawMessage = typeof data === "string" ? data : raw;
    if (rawMessage && /ECONNREFUSED|proxy error|connect/i.test(rawMessage)) {
      throw new Error("Auth server is not running. Use npm run dev to start both frontend and backend.");
    }

    const message =
      (data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : null) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (!data) {
    throw new Error("Empty response from auth server");
  }

  return data as T;
}

function safeJsonParse(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  return request<AuthResult>("/api/auth/register", input);
}

export async function loginUser(input: { loginId: string; password: string }): Promise<AuthResult> {
  return request<AuthResult>("/api/auth/login", input);
}

export async function signInWithGoogle(idToken: string): Promise<AuthResult> {
  return request<AuthResult>("/api/auth/google", { idToken });
}

export function persistAuthSession(result: AuthResult) {
  localStorage.setItem("parivesh_auth_token", result.token);
  localStorage.setItem("parivesh_auth_user", JSON.stringify(result.user));
}

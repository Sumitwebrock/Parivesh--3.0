const ADMIN_TOKEN_KEY = 'parivesh_admin_token'
const ADMIN_USERNAME_KEY = 'parivesh_admin_username'
const DEFAULT_ADMIN_API_ORIGIN = 'http://localhost:8787'

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY)
}

export function isAdminLoggedIn(): boolean {
  return Boolean(getAdminToken())
}

export function setAdminSession(token: string, username: string) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
  sessionStorage.setItem(ADMIN_USERNAME_KEY, username)
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  sessionStorage.removeItem(ADMIN_USERNAME_KEY)
}

export function getAdminUsername(): string {
  return sessionStorage.getItem(ADMIN_USERNAME_KEY) ?? 'admin'
}

function getAdminApiBase(): string {
  if (typeof window === 'undefined') return `${DEFAULT_ADMIN_API_ORIGIN}/api`

  const { protocol, hostname, port, origin } = window.location

  if (protocol === 'file:') return `${DEFAULT_ADMIN_API_ORIGIN}/api`
  if (port === '8787') return `${origin}/api`
  if (hostname === 'localhost' || hostname === '127.0.0.1') return `${DEFAULT_ADMIN_API_ORIGIN}/api`

  return '/api'
}

function safeJsonParse(input: string): unknown | null {
  try {
    return JSON.parse(input)
  } catch {
    return null
  }
}

async function adminFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getAdminToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  let fetchBody: BodyInit | undefined
  if (body instanceof FormData) {
    fetchBody = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    fetchBody = JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(`${getAdminApiBase()}${path}`, { method, headers, body: fetchBody })
  } catch {
    throw new Error('Admin API is not reachable. Make sure the backend server is running.')
  }

  if (res.status === 401 && path !== '/admin/login') {
    clearAdminSession()
    window.location.href = '/admin/login'
    throw new Error('Session expired. Please log in again.')
  }

  const raw = await res.text()
  const data = raw ? safeJsonParse(raw) : null

  if (!res.ok) {
    const looksLikeHtml = raw.trim().startsWith('<!DOCTYPE') || raw.trim().startsWith('<html')
    if (looksLikeHtml) {
      throw new Error('Admin API returned HTML instead of JSON. Make sure the backend server is running and /api is proxied to port 8787.')
    }

    const message =
      data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `Request failed (${res.status})`
    throw new Error(message)
  }

  if (raw && data === null) {
    throw new Error('Admin API returned a non-JSON response. Make sure the frontend is calling the backend /api server, not the app HTML page.')
  }

  return data as T
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function adminLogin(username: string, password: string): Promise<{ token: string; username: string }> {
  return adminFetch('POST', '/admin/login', { username, password })
}

// ── Users ─────────────────────────────────────────────────────────────────────
export type AdminUser = {
  id: number
  fullName: string
  loginId: string
  email: string
  mobile?: string
  organization?: string
  assignedRole: 'proponent' | 'scrutiny' | 'mom' | 'admin'
  accountStatus: 'active' | 'suspended'
  created_at: string
}

export async function fetchUsers(): Promise<AdminUser[]> {
  return adminFetch('GET', '/admin/users')
}

export async function createUser(data: {
  fullName: string; loginId: string; email: string; mobile?: string
  organization?: string; password: string; assignedRole: string
}): Promise<AdminUser> {
  return adminFetch('POST', '/admin/users', data)
}

export async function updateUserRole(id: number, assignedRole: string): Promise<void> {
  await adminFetch('PATCH', `/admin/users/${id}/role`, { assignedRole })
}

export async function updateUserStatus(id: number, status: 'active' | 'suspended'): Promise<void> {
  await adminFetch('PATCH', `/admin/users/${id}/status`, { status })
}

export async function deleteUser(id: number): Promise<void> {
  await adminFetch('DELETE', `/admin/users/${id}`)
}

// ── Templates ─────────────────────────────────────────────────────────────────
export type AdminTemplate = {
  id: number
  name: string
  category: 'A' | 'B1' | 'B2'
  description: string
  filename: string
  original_name: string
  uploaded_at: string
}

export async function fetchTemplates(): Promise<AdminTemplate[]> {
  return adminFetch('GET', '/admin/templates')
}

export async function uploadTemplate(formData: FormData): Promise<AdminTemplate> {
  return adminFetch('POST', '/admin/templates', formData)
}

export async function deleteTemplate(id: number): Promise<void> {
  await adminFetch('DELETE', `/admin/templates/${id}`)
}

export function downloadTemplateUrl(id: number): string {
  return `${getAdminApiBase()}/admin/templates/${id}/download`
}

// ── Sectors ───────────────────────────────────────────────────────────────────
export type SectorParam = {
  id: number
  sector_id: number
  param_label: string
  param_type: string
  required: number
  options: string
  sort_order: number
}

export type AdminSector = {
  id: number
  name: string
  description: string
  created_at: string
  params: SectorParam[]
}

export async function fetchSectors(): Promise<AdminSector[]> {
  return adminFetch('GET', '/admin/sectors')
}

export async function createSector(data: { name: string; description?: string }): Promise<AdminSector> {
  return adminFetch('POST', '/admin/sectors', data)
}

export async function deleteSector(id: number): Promise<void> {
  await adminFetch('DELETE', `/admin/sectors/${id}`)
}

export async function addSectorParam(
  sectorId: number,
  data: { paramLabel: string; paramType: string; required: boolean }
): Promise<SectorParam> {
  return adminFetch('POST', `/admin/sectors/${sectorId}/params`, data)
}

export async function deleteSectorParam(sectorId: number, paramId: number): Promise<void> {
  await adminFetch('DELETE', `/admin/sectors/${sectorId}/params/${paramId}`)
}
